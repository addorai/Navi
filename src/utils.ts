import fs from "fs";
import {promises as asyncFs} from "fs";
import path from "path";
import readlineSync from "readline-sync";
import OpenAI from "openai";
import chalk from "chalk";
import {IGNORED_PATHS, RECENT_FILES_TO_READ, SUPPORTED_FILES} from "./constants";

const llm = "gpt-3.5-turbo";
const BUFFER_LEN = 50;

interface NaviUtils {
  openai: OpenAI | null;
  llmName: string;
}

interface FileData {
  filePath: string;
  modifiedTime: number;
  content: string;
}

class NaviUtils {
  constructor() {
    this.openai = null;
    this.llmName = llm;
  }

  // API KEY
  public getApiKey() {
    const apiKeyPath = path.join(__dirname, "navi.txt");
    if (fs.existsSync(apiKeyPath)) {
      return fs.readFileSync(apiKeyPath, "utf8").trim();
    }
    return this.promptApiKey();
  }

  private promptApiKey() {
    const apiKeyPath = path.join(__dirname, "navi.txt");

    const userInputApiKey = readlineSync.question("Enter your API key: ", {
      hideEchoBack: true,
    });

    fs.writeFileSync(apiKeyPath, userInputApiKey.trim(), "utf8");
    console.log("API key saved successfully to navi.txt");

    return userInputApiKey.trim();
  }

  // GPT RESULTS
  public async fetchGptResults(error: string, cwd: string) {
    const errorFile = await this.extractErrorFile(error); // Can we find error file in stack trace?

    let gptMessageContent = `I'm getting this error when running a node app: ${error}`;

    if (errorFile) {
      const fileContents = await this.readFileContents(errorFile);
      gptMessageContent += `\n\n ${fileContents && `This is the file \n\n${fileContents}`}`;
    } else {
      // If we can't find error in stack trace, load the most recently modified project files
      // Ignore files or paths inside .gitignore
      // Only read .js and .ts files for now
      const mostRecentFiles: FileData[] = this.getRecentlyModifiedFiles(cwd);
      gptMessageContent += `\n\n These are possible files where the error is thrown`;
      mostRecentFiles.forEach((file) => {
        gptMessageContent += `\n\n${file.content}`;
      });
    }

    const apiKey = this.getApiKey();

    this.openai = new OpenAI({apiKey});

    if (this.openai && apiKey) {
      const spinner = this.startSpinner("Fetching answers from our AI overlords");
      const completion = await this.openai.chat.completions.create({
        messages: [{role: "system", content: gptMessageContent}],
        model: this.llmName,
      });
      this.stopSpinner(spinner);
      this.renderChatGPTOutput(completion.choices[0].message.content);
    } else {
      console.log("No API key found. Please run the program again and enter your API key.");
    }
  }

  renderChatGPTOutput(output: string | null) {
    if (!output) {
      console.log(`No output from ChatGPT for the given input.`);
    } else {
      console.log(chalk.bgGreen(" ".repeat(BUFFER_LEN)));
      console.log(" ".repeat(BUFFER_LEN));

      // Process output lines and apply formatting
      const formattedOutput = this.formatOutput(output);

      console.log(chalk.bold.yellow(`ChatGPT Output:\n`));
      console.log(formattedOutput);

      console.log(" ".repeat(BUFFER_LEN));
      console.log(chalk.bgGreen(" ".repeat(BUFFER_LEN)));
    }
  }

  formatOutput(output: string) {
    // Process and format the output here
    // You can use regular expressions or custom logic for advanced formatting

    // For demonstration, let's assume it's a simple list formatting
    const lines = output.split("\n");
    const formattedLines = lines.map((line) => {
      const match = /^(\d+)\.\s+(.+)/.exec(line);
      if (match !== null) {
        // Numbered list item
        const [, number, content] = match;
        return chalk.yellow(`${number}.`) + ` ${content}`;
      } else if (/^- /.test(line)) {
        // Unnumbered list item
        return chalk.blue("-") + ` ${line.slice(2)}`;
      } else {
        // Normal text
        return line;
      }
    });

    return formattedLines.join("\n");
  }

  // SPINNER
  private startSpinner(message: string) {
    const spinnerChars = ["-", "\\", "|", "/"];
    let index = 0;
    return setInterval(() => {
      process.stdout.write(`\r${spinnerChars[index]} ${message}`);
      index = (index + 1) % spinnerChars.length;
    }, 100);
  }

  private stopSpinner(spinner: NodeJS.Timeout) {
    clearInterval(spinner);
    process.stdout.write("\r"); // Move cursor to the beginning of the line
  }

  private extractErrorFile(stackTrace: string): string | null {
    const stackLines = stackTrace.split("\n");
    // If the error is being thrown from a src code file return that
    if (!stackLines[0].includes("node_modules") && this.isFilePath(stackLines[0])) {
      return this.removeLineNumberFromPath(stackLines[0]);
      // Else we need to find the src code file in the stack
    } else {
      for (const line of stackLines) {
        const filePathMatch = line.match(/\s+at\s+(?:Object\.)?<anonymous>\s+\(([^:]+):\d+:\d+\)/);

        if (filePathMatch && filePathMatch[1]) {
          const filePath = filePathMatch[1];
          if (!filePath.includes("node_modules") && this.isFilePath(filePath)) {
            return this.removeLineNumberFromPath(filePath);
          }
        }
      }
    }
    return null;
  }

  private removeLineNumberFromPath(path: string): string {
    // Define a regular expression pattern to match ":<digits>" at the end of the string
    const regex = /:\d+$/;

    // Replace the matched pattern with an empty string
    const pathWithoutLineNumber = path.replace(regex, "");

    console.log(pathWithoutLineNumber);

    return pathWithoutLineNumber;
  }

  private isFilePath(path: string): boolean {
    // Check for common path separators
    if (path.includes("/") || path.includes("\\")) {
      // Check if it starts with a path separator (indicating absolute path)
      if (path.startsWith("/") || path.startsWith("\\")) {
        return true;
      }
      // Check if it contains a colon (indicating Windows absolute path like C:\)
      else if (path.includes(":")) {
        return true;
      }
      // Otherwise, it might be a relative path
      else {
        return true;
      }
    } else {
      return false;
    }
  }

  private async readFileContents(filePath: string): Promise<string> {
    try {
      // Read the contents of the file asynchronously
      const fileContent: string = await asyncFs.readFile(filePath, "utf8");
      return fileContent; // Return the file contents
    } catch (err) {
      console.error("Error reading file:", err);
      return "";
    }
  }

  private getRecentlyModifiedFiles(directory: string): FileData[] {
    let filesModified: FileData[] = [];

    // Read .gitignore file and parse ignore patterns
    const ignorePatterns: string[] = IGNORED_PATHS;
    const gitignorePath = path.join(directory, ".gitignore");
    if (fs.existsSync(gitignorePath)) {
      const gitignoreContent = fs.readFileSync(gitignorePath, "utf-8");
      gitignoreContent.split("\n").forEach((line) => {
        line = line.trim();
        if (line && !line.startsWith("#")) {
          ignorePatterns.push(line);
        }
      });
    }

    // Function to check if a file path matches any gitignore pattern
    function matchesIgnorePattern(filePath: string): boolean {
      return ignorePatterns.some((pattern) => {
        const regex = new RegExp(pattern.replace(/\*/g, ".*"));
        return regex.test(filePath);
      });
    }

    // Function to recursively traverse directory and its subdirectories
    function traverseDirectory(dir: string) {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        if (!matchesIgnorePattern(filePath)) {
          const stats = fs.statSync(filePath);
          if (stats.isDirectory()) {
            traverseDirectory(filePath); // Recursive call for subdirectories
          } else {
            const fileExtension = path.extname(filePath);
            if (SUPPORTED_FILES.includes(fileExtension)) {
              const content = fs.readFileSync(filePath, "utf-8");
              filesModified.push({filePath, modifiedTime: stats.mtimeMs, content: content});
            }
          }
        }
      }
    }

    traverseDirectory(directory);

    // Sort files based on modification time in descending order
    filesModified.sort((a, b) => b.modifiedTime - a.modifiedTime);

    // Return specified number of recently modified files
    return filesModified.slice(0, RECENT_FILES_TO_READ);
  }
}

export default NaviUtils;

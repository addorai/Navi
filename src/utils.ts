import fs from "fs";
import {promises as asyncFs} from "fs";
import path from "path";
import readlineSync from "readline-sync";
import OpenAI from "openai";
import chalk from "chalk";

const llm = "gpt-3.5-turbo";
const BUFFER_LEN = 50;

const numRecentFiles: number = 1;

interface NaviUtils {
  openai: OpenAI | null;
  llmName: string;
}

interface FileInfo {
  name: string;
  path: string;
  modifiedTime: Date;
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
    const errorFile = await this.extractErrorFile(error);

    let gptMessageContent = `I'm getting this error when running a node app: ${error}`;

    if (errorFile) {
      const fileContents = await this.readFileContents(errorFile);
      gptMessageContent += `\n\n ${fileContents && `This is the file \n\n${fileContents}`}`;
    } else {
      const mostRecentFiles: FileInfo[] = this.getMostRecentFiles(cwd);
      gptMessageContent += `\n\n These are possible files where the error is thrown`;
      mostRecentFiles.slice(0, numRecentFiles).forEach((file) => {
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
      return stackLines[0];
      // Else we need to find the src code file in the stack
    } else {
      for (const line of stackLines) {
        const filePathMatch = line.match(/\s+at\s+(?:Object\.)?<anonymous>\s+\(([^:]+):\d+:\d+\)/);

        if (filePathMatch && filePathMatch[1]) {
          const filePath = filePathMatch[1];
          if (!filePath.includes("node_modules") && this.isFilePath(filePath)) {
            return filePath;
          }
        }
      }
    }
    return null;
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

  private getMostRecentFiles(directory: string): FileInfo[] {
    const recentFiles: FileInfo[] = [];
    const seenFiles: Set<string> = new Set();

    // Function to recursively find the most recently modified files within a directory
    function findRecentFiles(dir: string) {
      const items = fs.readdirSync(dir, {withFileTypes: true});
      for (const item of items) {
        const itemPath = path.resolve(dir, item.name);
        if (item.isDirectory() && item.name !== "node_modules" && item.name !== ".next") {
          if (item.name === "src" || item.name === "app") {
            const srcFiles = findSrcFiles(itemPath);
            for (const file of srcFiles) {
              if (!seenFiles.has(file.path)) {
                recentFiles.push(file);
                seenFiles.add(file.path);
              }
            }
          } else {
            findRecentFiles(itemPath);
          }
        }
      }
    }

    // Function to find most recently modified .ts or .js files within a "src" or "app" directory
    function findSrcFiles(srcDir: string): FileInfo[] {
      const srcFiles: FileInfo[] = [];
      const files = fs.readdirSync(srcDir, {withFileTypes: true});
      for (const file of files) {
        const filePath = path.resolve(srcDir, file.name);
        if (file.isFile() && (file.name.endsWith(".ts") || file.name.endsWith(".js"))) {
          const stats = fs.statSync(filePath);
          const content = fs.readFileSync(filePath, "utf-8");
          srcFiles.push({
            name: file.name,
            path: filePath,
            modifiedTime: stats.mtime,
            content: content,
          });
        }
      }
      return srcFiles.sort((a, b) => b.modifiedTime.getTime() - a.modifiedTime.getTime());
    }

    findRecentFiles(directory);
    return recentFiles;
  }
}

export default NaviUtils;

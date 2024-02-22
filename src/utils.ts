import fs from "fs";
import path from "path";
import readlineSync from "readline-sync";
import OpenAI from "openai";
import chalk from "chalk";

const llm = 'gpt-3.5-turbo'
const BUFFER_LEN = 50;

interface NaviUtils {
  openai: OpenAI | null;
  llmName: string;
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
  public async fetchGptResults(error: string) {
    const apiKey = this.getApiKey();

    this.openai = new OpenAI({apiKey});

    if (this.openai && apiKey) {
      const spinner = this.startSpinner("Fetching answers from our AI overlords");
      const completion = await this.openai.chat.completions.create({
        messages: [{role: "system", content: "I'm getting this error when running a node app: " + error}],
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
    const lines = output.split('\n');
    const formattedLines = lines.map((line) => {
      const match = /^(\d+)\.\s+(.+)/.exec(line);
      if (match !== null) {
        // Numbered list item
        const [, number, content] = match;
        return chalk.yellow(`${number}.`) + ` ${content}`;
      } else if (/^- /.test(line)) {
        // Unnumbered list item
        return chalk.blue('-') + ` ${line.slice(2)}`;
      } else {
        // Normal text
        return line;
      }
    });

    return formattedLines.join('\n');
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
}

export default NaviUtils;

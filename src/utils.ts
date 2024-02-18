import fs from "fs";
import path from "path";
import readlineSync from "readline-sync";
import OpenAI from "openai";

interface NaviUtils {
  openai: OpenAI;
}

class NaviUtils {
  constructor() {
    this.openai = new OpenAI();
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

    if (apiKey) {
      const spinner = this.startSpinner("Fetching answers from our AI overlords");
      const completion = await this.openai.chat.completions.create({
        messages: [{role: "system", content: "I'm getting this error when running a node app: " + error}],
        model: "gpt-3.5-turbo",
      });
      this.stopSpinner(spinner);
      this.renderChatGPTOutput(completion.choices[0].message.content);
    } else {
      console.log("No API key found. Please run the program again and enter your API key.");
    }
  }

  public renderChatGPTOutput(output: string | null) {
    if (!output) {
      return console.log("No output from GPT-3.5-turbo");
    }
    console.log(output);
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

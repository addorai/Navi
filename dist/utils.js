"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const fs_2 = require("fs");
const path_1 = __importDefault(require("path"));
const readline_sync_1 = __importDefault(require("readline-sync"));
const openai_1 = __importDefault(require("openai"));
const chalk_1 = __importDefault(require("chalk"));
const constants_1 = require("./constants");
const analytics_1 = __importDefault(require("./analytics"));
const naviAnalytics = new analytics_1.default();
const llm = "gpt-3.5-turbo";
const BUFFER_LEN = 50;
class NaviUtils {
    constructor() {
        this.openai = null;
        this.llmName = llm;
    }
    // API KEY
    getApiKey() {
        const apiKeyPath = path_1.default.join(__dirname, "navi.txt");
        if (fs_1.default.existsSync(apiKeyPath)) {
            return fs_1.default.readFileSync(apiKeyPath, "utf8").trim();
        }
        naviAnalytics.sendAnalytics("Prompt API Key");
        return this.promptApiKey();
    }
    promptApiKey() {
        const apiKeyPath = path_1.default.join(__dirname, "navi.txt");
        const userInputApiKey = readline_sync_1.default.question("Enter your API key: ", {
            hideEchoBack: true,
        });
        fs_1.default.writeFileSync(apiKeyPath, userInputApiKey.trim(), "utf8");
        console.log("API key saved successfully");
        naviAnalytics.sendAnalytics("API Key Saved");
        return userInputApiKey.trim();
    }
    // GPT RESULTS
    fetchGptResults(error, cwd) {
        return __awaiter(this, void 0, void 0, function* () {
            const errorFile = yield this.extractErrorFile(error); // Can we find error file in stack trace?
            let gptMessageContent = `I'm getting this error when running a node app: ${error}`;
            if (errorFile) {
                const fileContents = yield this.readFileContents(errorFile);
                gptMessageContent += `\n\n ${fileContents && `This is the file \n\n${fileContents}`}`;
            }
            else {
                // If we can't find error in stack trace, load the most recently modified project files
                // Ignore files or paths inside .gitignore
                // Only read .js and .ts files for now
                const mostRecentFiles = this.getRecentlyModifiedFiles(cwd);
                gptMessageContent += `\n\n These are possible files where the error is thrown`;
                mostRecentFiles.forEach((file) => {
                    gptMessageContent += `\n\n${file.content}`;
                });
            }
            const apiKey = this.getApiKey();
            this.openai = new openai_1.default({ apiKey });
            if (this.openai && apiKey) {
                naviAnalytics.sendAnalytics("Debug Error", {
                    errorMessage: gptMessageContent,
                });
                const spinner = this.startSpinner("Fetching answers from our AI overlords");
                const completion = yield this.openai.chat.completions.create({
                    messages: [{ role: "system", content: gptMessageContent }],
                    model: this.llmName,
                });
                this.stopSpinner(spinner);
                this.renderChatGPTOutput(completion.choices[0].message.content);
            }
            else {
                console.log("No API key found. Please run the program again and enter your API key.");
            }
        });
    }
    renderChatGPTOutput(output) {
        if (!output) {
            console.log(`No output from ChatGPT for the given input.`);
        }
        else {
            console.log(chalk_1.default.bgGreen(" ".repeat(BUFFER_LEN)));
            console.log(" ".repeat(BUFFER_LEN));
            // Process output lines and apply formatting
            const formattedOutput = this.formatOutput(output);
            console.log(chalk_1.default.bold.yellow(`ChatGPT Output:\n`));
            console.log(formattedOutput);
            console.log(" ".repeat(BUFFER_LEN));
            console.log(chalk_1.default.bgGreen(" ".repeat(BUFFER_LEN)));
        }
    }
    formatOutput(output) {
        // Process and format the output here
        // You can use regular expressions or custom logic for advanced formatting
        // For demonstration, let's assume it's a simple list formatting
        const lines = output.split("\n");
        const formattedLines = lines.map((line) => {
            const match = /^(\d+)\.\s+(.+)/.exec(line);
            if (match !== null) {
                // Numbered list item
                const [, number, content] = match;
                return chalk_1.default.yellow(`${number}.`) + ` ${content}`;
            }
            else if (/^- /.test(line)) {
                // Unnumbered list item
                return chalk_1.default.blue("-") + ` ${line.slice(2)}`;
            }
            else {
                // Normal text
                return line;
            }
        });
        return formattedLines.join("\n");
    }
    // SPINNER
    startSpinner(message) {
        const spinnerChars = ["-", "\\", "|", "/"];
        let index = 0;
        return setInterval(() => {
            process.stdout.write(`\r${spinnerChars[index]} ${message}`);
            index = (index + 1) % spinnerChars.length;
        }, 100);
    }
    stopSpinner(spinner) {
        clearInterval(spinner);
        process.stdout.write("\r"); // Move cursor to the beginning of the line
    }
    extractErrorFile(stackTrace) {
        const stackLines = stackTrace.split("\n");
        // If the error is being thrown from a src code file return that
        if (!stackLines[0].includes("node_modules") && this.isFilePath(stackLines[0])) {
            return this.removeLineNumberFromPath(stackLines[0]);
            // Else we need to find the src code file in the stack
        }
        else {
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
    removeLineNumberFromPath(path) {
        // Define a regular expression pattern to match ":<digits>" at the end of the string
        const regex = /:\d+$/;
        // Replace the matched pattern with an empty string
        const pathWithoutLineNumber = path.replace(regex, "");
        return pathWithoutLineNumber;
    }
    isFilePath(path) {
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
        }
        else {
            return false;
        }
    }
    readFileContents(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Read the contents of the file asynchronously
                const fileContent = yield fs_2.promises.readFile(filePath, "utf8");
                return fileContent; // Return the file contents
            }
            catch (err) {
                console.error("Error reading file:", err);
                return "";
            }
        });
    }
    getRecentlyModifiedFiles(directory) {
        let filesModified = [];
        // Read .gitignore file and parse ignore patterns
        const ignorePatterns = constants_1.IGNORED_PATHS;
        const gitignorePath = path_1.default.join(directory, ".gitignore");
        if (fs_1.default.existsSync(gitignorePath)) {
            const gitignoreContent = fs_1.default.readFileSync(gitignorePath, "utf-8");
            gitignoreContent.split("\n").forEach((line) => {
                line = line.trim();
                if (line && !line.startsWith("#")) {
                    ignorePatterns.push(line);
                }
            });
        }
        // Function to check if a file path matches any gitignore pattern
        function matchesIgnorePattern(filePath) {
            return ignorePatterns.some((pattern) => {
                const regex = new RegExp(pattern.replace(/\*/g, ".*"));
                return regex.test(filePath);
            });
        }
        // Function to recursively traverse directory and its subdirectories
        function traverseDirectory(dir) {
            const files = fs_1.default.readdirSync(dir);
            for (const file of files) {
                const filePath = path_1.default.join(dir, file);
                if (!matchesIgnorePattern(filePath)) {
                    const stats = fs_1.default.statSync(filePath);
                    if (stats.isDirectory()) {
                        traverseDirectory(filePath); // Recursive call for subdirectories
                    }
                    else {
                        const fileExtension = path_1.default.extname(filePath);
                        if (constants_1.SUPPORTED_FILES.includes(fileExtension)) {
                            const content = fs_1.default.readFileSync(filePath, "utf-8");
                            filesModified.push({ filePath, modifiedTime: stats.mtimeMs, content: content });
                        }
                    }
                }
            }
        }
        traverseDirectory(directory);
        // Sort files based on modification time in descending order
        filesModified.sort((a, b) => b.modifiedTime - a.modifiedTime);
        // Return specified number of recently modified files
        return filesModified.slice(0, constants_1.RECENT_FILES_TO_READ);
    }
}
exports.default = NaviUtils;
//# sourceMappingURL=utils.js.map
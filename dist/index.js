#! /usr/bin/env node
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
const child_process_1 = require("child_process");
const utils_1 = __importDefault(require("./utils"));
const chalk_1 = __importDefault(require("chalk"));
const commander_1 = require("commander");
const figlet_1 = __importDefault(require("figlet"));
const constants_1 = require("./constants");
const naviUtils = new utils_1.default();
const program = new commander_1.Command();
console.log(figlet_1.default.textSync("Navi"));
program.version("1.0.0").description("A CLI tool that uses AI to debug terminal errors").option("-d, --debug  <value...>", "Debug terminal error").parse(process.argv);
const options = program.opts();
let debounceTimer = null;
function manualDebug(command) {
    // Split the command and its arguments into an array
    const cmd = command.shift();
    const args = command;
    // Get the current working directory
    const cwd = process.cwd();
    // Spawn the command as a child process
    if (cmd) {
        const childProcess = (0, child_process_1.spawn)(cmd, args, { shell: true });
        let errorData = "";
        let lastGptErrMessage = "";
        // Listen for stdout data event
        childProcess.stdout.on("data", (data) => {
            if (constants_1.ERROR_STRINGS.some((errorString) => data.includes(errorString))) {
                console.error(`${chalk_1.default.red(data)}`);
                errorData += data;
            }
            else {
                console.log(`${data}`);
            }
            deboucedGptResults(errorData, lastGptErrMessage, cwd);
        });
        // Listen for stderr data event
        childProcess.stderr.on("data", (data) => __awaiter(this, void 0, void 0, function* () {
            // warnings are not processed by chatGPT
            if (constants_1.WARN_STRINGS.some((warnString) => data.includes(warnString))) {
                console.warn(`${chalk_1.default.yellow(data)}`);
            }
            else {
                console.error(`${chalk_1.default.red(data)}`);
                errorData += data;
            }
            deboucedGptResults(errorData, lastGptErrMessage, cwd);
        }));
        // Listen for close event
        childProcess.on("close", (code) => __awaiter(this, void 0, void 0, function* () {
            deboucedGptResults(errorData, lastGptErrMessage, cwd);
        }));
    }
}
function deboucedGptResults(errorData, lastGptErrMessage, cwd) {
    // If there's already a timer running, clear it
    if (debounceTimer) {
        clearTimeout(debounceTimer);
    }
    // Set a new timer to call fetchGptResults after a certain delay
    debounceTimer = setTimeout(() => __awaiter(this, void 0, void 0, function* () {
        // Only send request to chatGPT if we haven't already sent a request for the error
        // Sending requests here enables us to debug runtime errors
        if (errorData.length > lastGptErrMessage.length) {
            lastGptErrMessage = errorData;
            yield naviUtils.fetchGptResults(errorData, cwd); // to debug runtime errors
        }
    }), 1000); // Adjust the delay as needed (e.g., 1000 milliseconds = 1 second)
}
if (options.debug) {
    manualDebug(options.debug);
}
if (!process.argv.slice(2).length) {
    program.outputHelp();
}
//# sourceMappingURL=index.js.map
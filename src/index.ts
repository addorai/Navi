#! /usr/bin/env node
import {ChildProcessWithoutNullStreams, spawn} from "child_process";
import NaviUtils from "./utils";
import chalk from "chalk";
import {Command} from "commander";
import figlet from "figlet";
import {ERROR_STRINGS, WARN_STRINGS} from "./constants";
import NaviAnalytics from "./analytics";

const naviAnalytics = new NaviAnalytics();
const naviUtils = new NaviUtils();
const program = new Command();
console.log(figlet.textSync("Navi"));

program.version("1.0.0").description("A CLI tool that uses AI to debug terminal errors").option("-d, --debug  <value...>", "Debug terminal error").parse(process.argv);

const options = program.opts();

let debounceTimer: NodeJS.Timeout | null = null;

naviAnalytics.sendPageView("CLI Intro");

function manualDebug(command: string[]) {
  // Split the command and its arguments into an array
  const cmd = command.shift();
  const args = command;

  // Get the current working directory
  const cwd = process.cwd();

  // Spawn the command as a child process
  if (cmd) {
    const childProcess: ChildProcessWithoutNullStreams = spawn(cmd, args, {shell: true});
    let errorData = "";
    let lastGptErrMessage = "";

    // Listen for stdout data event
    childProcess.stdout.on("data", (data) => {
      if (ERROR_STRINGS.some((errorString) => data.includes(errorString))) {
        console.error(`${chalk.red(data)}`);
        errorData += data;
      } else {
        console.log(`${data}`);
      }
      deboucedGptResults(errorData, lastGptErrMessage, cwd);
    });

    // Listen for stderr data event
    childProcess.stderr.on("data", async (data) => {
      // warnings are not processed by chatGPT
      if (WARN_STRINGS.some((warnString) => data.includes(warnString))) {
        console.warn(`${chalk.yellow(data)}`);
      } else {
        console.error(`${chalk.red(data)}`);
        errorData += data;
      }
      deboucedGptResults(errorData, lastGptErrMessage, cwd);
    });

    // Listen for close event
    childProcess.on("close", async (code) => {
      deboucedGptResults(errorData, lastGptErrMessage, cwd);
    });
  }
}

function deboucedGptResults(errorData: string, lastGptErrMessage: string, cwd: string) {
  // If there's already a timer running, clear it
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  // Set a new timer to call fetchGptResults after a certain delay
  debounceTimer = setTimeout(async () => {
    // Only send request to chatGPT if we haven't already sent a request for the error
    // Sending requests here enables us to debug runtime errors
    if (errorData.length > lastGptErrMessage.length) {
      lastGptErrMessage = errorData;
      await naviUtils.fetchGptResults(errorData, cwd); // to debug runtime errors
    }
  }, 1000); // Adjust the delay as needed (e.g., 1000 milliseconds = 1 second)
}

if (options.debug) {
  manualDebug(options.debug);
}

if (!process.argv.slice(2).length) {
  program.outputHelp();
}

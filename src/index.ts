#! /usr/bin/env node
import {spawn, ChildProcessWithoutNullStreams} from "child_process";
import NaviUtils from "./utils";

const naviUtls = new NaviUtils();
const {Command} = require("commander");
const figlet = require("figlet");
const program = new Command();

console.log(figlet.textSync("Navi"));

program.version("1.0.0").description("A CLI tool that uses AI to debug terminal errors").option("-d, --debug  <value...>", "Debug terminal error").parse(process.argv);

const options = program.opts();

function liveDebug() {
  process.stdin.setEncoding("utf8");

  let inputData = "";
  let errorData = "";

  process.stdin.on("data", (chunk) => {
    // Accumulate the input data
    inputData += chunk;
    if (chunk.toString().startsWith("ERROR:")) {
      errorData += chunk;
    }
  });

  process.stdin.on("end", () => {
    // Process the complete input data
    console.log("Piped data:", inputData);
    if (errorData.length > 0) {
      console.log("Error data:", errorData);
    }
  });
}

function manualDebug(command: string[]) {
  // Split the command and its arguments into an array
  const cmd = command.shift();
  const args = command;

  // Spawn the command as a child process
  if (cmd) {
    const childProcess: ChildProcessWithoutNullStreams = spawn(cmd, args, {shell: true});
    let errorData = "";

    // Listen for stdout data event
    childProcess.stdout.on("data", (data) => {
      console.log(`stdout: ${data}`);
    });

    // Listen for stderr data event
    childProcess.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`);
      errorData += data;
    });

    // Listen for close event
    childProcess.on("close", (code) => {
      naviUtls.fetchGptResults(errorData);
      // console.log(`child process exited with code ${code}`);
      // process.exit(code || 0);
    });
  }
}

if (options.debug) {
  manualDebug(options.debug);
}

if (!process.argv.slice(2).length) {
  program.outputHelp();
}

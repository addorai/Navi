#! /usr/bin/env node

const {Command} = require("commander");
const fs = require("fs");
const path = require("path");
const figlet = require("figlet");

const program = new Command();

console.log(figlet.textSync("Navi"));

program.version("1.0.0").description("A CLI tool that uses AI to debug terminal errors").option("-d, --debug  [value]", "Debug terminal error").parse(process.argv);

const options = program.opts();

function debugError() {
  process.stdin.setEncoding("utf8");

  let inputData = "";

  process.stdin.on("data", (chunk) => {
    // Accumulate the input data
    inputData += chunk;
  });

  process.stdin.on("end", () => {
    // Process the complete input data
    console.log("Piped data:", inputData);
  });
}

if (options.debug) {
  debugError();
}

if (!process.argv.slice(2).length) {
  program.outputHelp();
}

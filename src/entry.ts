#! /usr/bin/env node

import semver from "semver";

console.log("Node.js version: ", process.versions.node);

const currentNodeVersion = process.versions.node;
const requiredNodeVersion = '18.18.0';

if (!semver.satisfies(currentNodeVersion, `>=${requiredNodeVersion}`)) {
  console.error(`Required Node.js version is ${requiredNodeVersion}, but current version is ${currentNodeVersion}.`);
  process.exit(1);
}

// Load the main script after the version check
import('./index.js');
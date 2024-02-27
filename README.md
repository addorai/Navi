# Navi - AI Debugger in Terminal

Navi is an AI copilot that automatically debugs errors when running Node apps. The power of Navi is that it lives in your workflow, offering debugging suggestions directly in the Terminal.

Navi uses OpenAI and requires you to have an API key.

## Installation

- Compile with `npm run build`
- Install globally with `npm install -g .`
- Then run it with `navi`

## Getting Started

You have two options on how to get started with Navi.

- **(Recommended)** Add Navi to your scripts in package.json: `"debug": "navi -d [YOUR_BUILD_COMMAND]"`, then run `npm run debug`
- After you get a failed command, run `navi -d [YOUR_BUILD_COMMAND]`

Note that you must be running a node version greater than 18.18. Older version have trouble with the `node:fs` libraries

### Permission Denied Error

This error indicates that the Navi package doesn't have permission to execute.
`bash: /Users/adorai/.nvm/versions/node/v16.16.0/bin/navi: Permission denied`

You can resolve by running chmod +x on that package, i.e. `chmod +x /Users/aravindhdorai/.nvm/versions/node/v16.16.0/bin/navi`

## Supported Projects

Currently Navi support NodeJS projects and helps debug both Javascript and Typescript files. We'll be adding support for more projects soon.

## Use Cases

1. Get suggestions on how to resolve build errors
2. Fix config issues
3. Get suggestions on how to upgrade deprecated packages

## Demo Video

[<img src="https://gcdnb.pbrd.co/images/p9Nv5PraOw2y.png?o=1" width="50%">](https://www.dropbox.com/s/qpt2kaeijqfv4po/Navi%20-%20AI%20debugger%20in%20terminal.mp4?dl=0 "Navi - build & runtime AI debugging")

## Upcoming Features

- **Slack integration** -> when you run into an error, Navi will automatically suggest fixes that teammates have shared on Slack
- **Notion & Google Docs integration** -> when you run into an error, Navi will pull from knowledge base content to help you debug

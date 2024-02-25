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

## Use Cases

1. Get suggestions on how to resolve build errors
2. Fix config issues
3. Get suggestions on how to upgrade deprecated packages

## Demo Video
[<img src="https://gcdnb.pbrd.co/images/p9Nv5PraOw2y.png?o=1" width="100%">](https://capture.dropbox.com/YwKPBg0g7w4z7imf "Navi - build & runtime AI debugging")

![asdf](https://gcdnb.pbrd.co/images/p9Nv5PraOw2y.png?o=1)

## Upcoming Features

- **Slack integration** -> when you run into an error, Navi will automatically suggest fixes that teammates have shared on Slack
- **Notion & Google Docs integration** -> when you run into an error, Navi will pull from knowledge base content to help you debug

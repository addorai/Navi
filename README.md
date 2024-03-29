# Navi - AI Debugger in Terminal

Navi is your intelligent debugging companion that effortlessly tackles errors encountered while running Node.js applications. Seamlessly integrated into your workflow, Navi provides debugging suggestions directly in the Terminal, harnessing the power of OpenAI.

![Navi screenshot](https://uc8228fa66390744d5389a1b7b93.previews.dropboxusercontent.com/p/thumb/ACN0sBxEmCo3I9HuhTlM08roQV3c_aaHMPDd5JasYhFkavAvwxVRsIMoC0b-bJvsgzacaSqtzKXUAfcVFuVsj3Ni8EmQZ2CIWnPZSSVJjYuw7_Bn_WwEDfZN1-37FOLz8vFQrXN5MJ-MhBbnUpBYFQNWYtltmwYmYN5RgD3kbdH36TG4fjBmPzQfaOE9O4TlGD1GzDUUHbjqGzKuthZfQk9jhMty5_unFx2fuFY9xc-dfharD_865swQRNEmBQdfsr2tHynqqg6WmGg4rgczM7eHg26jACtHnIjsu5vf_Kzzv1A4SCuZ6T6rttlL0QHFfGWse-Knm-nBmieP8JaGaiJZit6kK1PR6TcPn7ZA90RCWw/p.png)

## Installation

To use Navi, an OpenAI API key is required.

1. Install Navi globally:

```bash
npm install -g navi-cli
```

2. Ensure Navi is running:

```bash
navi
```

## Getting Started

Choose your preferred method to start using Navi:

### Option 1: Script Integration (Recommended)

Add Navi to your scripts in package.json:

```json
"scripts": {
  "debug": "navi -d [YOUR_BUILD_COMMAND]"
}
```

Run:

```bash
npm run debug
```

### Option 2: Manual Command

After a failed command, run:

```bash
navi -d [YOUR_BUILD_COMMAND]
```

Ensure your Node version is greater than 18.18, as older versions may encounter issues with node:fs libraries.

## Supported Projects

Navi currently supports Node.js projects, providing assistance in debugging both JavaScript and TypeScript files. Stay tuned as we expand support for more projects in the future.

## Use Cases

- Receive suggestions to resolve build errors
- Fix configuration issues
- Get guidance on upgrading deprecated packages

## Upcoming Features

- Slack Integration: Navi will automatically suggest fixes shared by teammates on Slack.
- Notion & Google Docs Integration: Leverage content from knowledge bases to aid in debugging.

## Demo Video

[<img src="https://gcdnb.pbrd.co/images/p9Nv5PraOw2y.png?o=1" width="50%">](https://www.dropbox.com/s/qpt2kaeijqfv4po/Navi%20-%20AI%20debugger%20in%20terminal.mp4?dl=0 "Navi - build & runtime AI debugging")

Feel free to open issues on our [Github repo](https://github.com/addorai/Navi) if you have any questions
or encounter problems.

Happy debugging with Navi!

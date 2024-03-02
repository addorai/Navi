# Navi - AI Debugger in Terminal

Navi is your intelligent debugging companion that effortlessly tackles errors encountered while running Node.js applications. Seamlessly integrated into your workflow, Navi provides debugging suggestions directly in the Terminal, harnessing the power of OpenAI.

![Navi screenshot](https://uc8228fa66390744d5389a1b7b93.previews.dropboxusercontent.com/p/thumb/ACNSGI_OMMyfLnIua3WlpxMKoZ5xBzzLx1Upj3CR9IfeDZdSFjowyUpH_XMHZG89kcFQqjF1BswcENDYp4sbQ39lznKR97cMNhclSVCsqrOzaDx1sSmM93KihCY_ohAXP5GZSxUeuKUEps4aR1kWnIqZ05OE_B01MesTTMA5CqEzegPtCQGOOdUBxi69Ma1jOxubGsx2Au01UnnvGz_f_S074SMmN3KI5M7URBjSM9yy2Lu5k6JP-fwqn9JGvnvCbQLLn08zKWouup69DOayYTiiecleSNhigyeweqEk3b5Jei5x82FkFNVrBbERPtFP6Skl7DNnYrkiB8LmdUsIVQH95eqaGiIHcafq6Tw_PEgX4Q/p.png)

## Installation

To use Navi, an OpenAI API key is required.

1. Install Navi globally:

```bash
npm install -g @navi-dev/navi
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

Feel free to reach out if you have any questions or encounter issues. Happy debugging with Navi!

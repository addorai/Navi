# Navi - AI Debugger in Terminal

Navi is your intelligent debugging companion that effortlessly tackles errors encountered while running Node.js applications. Seamlessly integrated into your workflow, Navi provides debugging suggestions directly in the Terminal, harnessing the power of OpenAI.

![Navi screenshot](https://camo.githubusercontent.com/63a221d3b3bc53f34485136425a8348e830e8f6158af896f75e4db8e85e202b0/68747470733a2f2f756338323238666136363339303734346435333839613162376239332e70726576696577732e64726f70626f7875736572636f6e74656e742e636f6d2f702f7468756d622f41434e5347495f4f4d4d79664c6e49756133576c70784d4b6f5a3578427a7a4c783155706a33435239496665445a6453466a6f77795570485f584d485a4738396b634651716a463142737763454e4459703473625133396c7a6e4b523937634d4e68636c5356437371724f7a6144783173536d4d39334b696843595f6f6841585035475a53785565754b55457073346152316b576e49715a30354f455f4230314d657354544d41354371457a656750744351474f4f645542786936394d61316a4f7875624773783241753031556e6e76477a5f665f53303734534d6d4e334b49354d375552426a534d397979324c75356b364a502d6677716e394a47766e764362514c4c6e30387a4b576f7575703639444f61795954696965636c65534e6869677965776571456b3362354a656935783832466b464e5672426245525074465036536b6c37444e6e59726b6942384c6d64557349565148393565716147694948636166713654775f5045675834512f702e706e67)

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

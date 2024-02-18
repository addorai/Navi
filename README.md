Navi is an AI copilot that automatically debugs errors in the terminal

- Compile with `npm run build`
- Install globally with `npm install -g .`
- Then run it with `navi`

You have two options on how to get suggestions from Navi

1. (Recommended) Add navi to your scripts in package.json: `"debug": "navi -d [YOUR_BUILD_COMMAND]"`, then run `npm run debug`
2. After you get a failed command, run `navi -d [YOUR_BUILD_COMMAND]`

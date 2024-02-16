Navi is an AI copilot that automatically debugs errors in the terminal

- Compile with `npm run build`
- Install globally with `npm install -g .`
- Then run it with `navi`

You have two options on how to get suggestions from Navi

1. (Recommended) Add navi to your build script: `[YOUR_BUILD_COMMAND] 2> >(awk '{print "ERROR:", $0; fflush();}') > >(awk '{print}') | navi -d`
2. After you get a failed command, run `navi -d [YOUR_BUILD_COMMAND]`

(AD) TO-DOs

- If error is detected, hit OpenAI endpoint and get results back

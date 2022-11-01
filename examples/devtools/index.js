const { App } = require('../../cjs/index.js');
const fs = require('fs');
const path = require('path');

async function main() {
  const app = App();

  await app.launch({
    browserOptions: {
      title: 'app',
      icon: fs.readFileSync(path.join(__dirname, 'app_icon.png')).toString('base64'),
    },
    // serverFolder: path.join(__dirname, 'www'),
    serverOrigin: 'http://localhost:5173/',
  });

  app.registerRpcMethod('openWindow', async (url) => {
    const newWindow = await app.createWindow(url, {
      width: 390,
      height: 884,
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 11_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15F79 ChannelId(118) NebulaSDK/1.8.100112 Nebula PSDType(1) AlipayDefined(nt:WIFI,ws:375|603|2.0) AliApp(AP/10.1.25.00000056) AlipayClient/10.1.25.00000056 Language/en',
    });
    return newWindow.getDevtoolsUrl();
  });

  app.registerRpcMethod('openDevtools', async (url) => {
    await app.createWindow(url, {
      width: 1000,
      height: 800,
    });
  });

  await app.load('index.html');

  app.on('exit', () => {
    process.exit();
  });
}

main().catch((e) => console.log(e));

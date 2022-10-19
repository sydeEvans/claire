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

  await app.load('index.html');

  await app.expoFunction('openWindow', async (url) => {
    const newWindow = await app.createWindow(url, {
      width: 390,
      height: 884,
      userAgent: 'Mozilla/5.0 (Linux; Android 10; Pixel 3 XL)',
    });
    return newWindow.getDevtoolsUrl();
  });

  app.on('exit', () => {
    process.exit();
  });
}

main().catch((e) => console.log(e));

const { App } = require('../../cjs');
const fs = require('fs');
const path = require('path');

async function main() {
  const app = App();

  await app.launch({
    browserOptions: {
      title: 'app',
      icon: fs.readFileSync(path.join(__dirname, 'app_icon.png')).toString('base64'),
    },
    serverFolder: path.join(__dirname, 'www'),
  });

  await app.load('index.html');
}

main().catch((e) => console.log(e));

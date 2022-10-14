const { App } = require('../../cjs');
const fs = require('fs');
const path = require('path');

async function main() {
  const app = App();

  await app.launch({
    title: 'app',
    icon: fs.readFileSync(path.join(__dirname, 'app_icon.png')).toString('base64'),
  });
}

main().catch((e) => console.log(e));

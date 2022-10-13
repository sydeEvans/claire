const { launch } = require('../../src');

async function main() {
  const browser = await launch({
    title: 'app',
  });

  console.log(browser);
}

main().catch((e) => console.log(e));

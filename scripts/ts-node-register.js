const TSModuleAlias = require('@momothepug/tsmodule-alias');
const path = require('path');

TSModuleAlias.use({
  '@': path.join(__dirname, '../src'),
});

require('ts-node').register({
  transpileOnly: true,
});

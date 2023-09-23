// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('ts-node').register();
require(path.resolve(__dirname, './worker.ts'));

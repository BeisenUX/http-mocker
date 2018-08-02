'use strict';

var _ = require('./');

var _2 = _interopRequireDefault(_);

var _minimist = require('minimist');

var _minimist2 = _interopRequireDefault(_minimist);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const argv = (0, _minimist2.default)(process.argv.slice(2));

const server = new _2.default({
  'workspace': argv.workspace,
  'port': argv.port
});

server.start();
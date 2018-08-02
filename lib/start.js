#!/usr/bin/env node
'use strict';

var _index = require('./index.js');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var server = new _index2.default({ 'workspace': process.cwd() });
server.start();
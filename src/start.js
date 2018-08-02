#!/usr/bin/env node

import Server from './index.js'
var server = new Server ({ 'workspace': process.cwd() })
server.start()

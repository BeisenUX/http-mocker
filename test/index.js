
const assert = require('assert')
const Server = require('../lib/')

describe('工具类测试', () => {
  let server = new Server({ 'workspace': `${__dirname}/recordings/` })

  it('输出拼装后的HAR', () => {
    assert(server.translateHAR().log)
  })

  server.start()
})

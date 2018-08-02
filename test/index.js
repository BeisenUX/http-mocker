
const assert = require('assert')
const Server = require('../lib/')
const HARReader = require('../lib/har-reader')

describe('工具类测试', () => {
  const server = new Server({ 'workspace': `${__dirname}/recordings/` })
  const harreader = new HARReader({ 'workspace': `${__dirname}/recordings/` })

  it('输出拼装后的HAR', () => {
    assert(harreader.get('AssessMRest/100000/AskLibiary/GetAllTopic').response.status, 200)
  })

  it('获取HAR文件HTTP列表', () => {
    assert(harreader.total().length, 2)
  })

  server.start()
})

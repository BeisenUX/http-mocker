import fs from 'fs'
import path from 'path'
import HARReader from './har-reader'
import Koa from 'koa'
import koaOnerror from 'koa-onerror'

export default class Server {

  constructor(o) {
    Object.assign(this, {
      'port': 9003,
      'workspace': '/',
      'httpHARFile': 'recording.har'
    }, o)
  }

  start() {
    this.server = new Koa()
    koaOnerror(this.server)

    this.server.use(async (ctx, next) => {
      const { path } = ctx

      const harHttps = this.translateHAR()
      const har = new HARReader({ 'har': harHttps })
      const httphar = har.get(path)

      const {
        'request': {
          url
        },
        'response': {
          status,
          headers = [],
          cookies = [],
          'content': {
            mimeType,
            text
          },
          bodySize,
          redirectURL
        }
      } = httphar

      headers.forEach(head => ctx.set(head.name, head.value))
      cookies.forEach(cookie => ctx.cookies.set(cookie.name, cookie.value))

      ctx.set('Access-Control-Allow-Origin', '*')
      ctx.set('Content-Type', mimeType)
      ctx.set('Content-Length', bodySize)
      ctx.set('Location', redirectURL)

      ctx.status = status
      ctx.body = text
    })

    this.server.listen(this.port)
  }

  close() {
    this.server.restore()
    this.xhr.restore()
  }

  onServerError(err) {
    console.log('server error', err)
  }

  translateHAR() {
    let entries = []

    // 从接口元数据目录中，把所有接口配置读取出来生成 entries
    fs.readdirSync(this.workspace)
      .filter(filename => !filename.match(/^\./))
      .forEach(filename => {
        const harHttpJson = require(path.join(this.workspace, filename))
        entries.push(harHttpJson)
      })

    return {
      "log": {
        "version": "0.0.1",
        "creator": {
          "name": "@beisen/http-mocker",
          "version": "0.0.1"
        },
        "pages": {},
        "entries": entries
      }
    }
  }
}


import Koa from 'koa'
import koaOnerror from 'koa-onerror'
import HARReader from './har-reader'

export default class Server {

  constructor(o) {
    Object.assign(this, {
      'port': 9003,
      'workspace': '/'
    }, o)
  }

  start() {
    // 服务器相关配置
    this.server = new Koa()
    koaOnerror(this.server)
    this.bindHttp()
    this.server.listen(this.port)
    // 读取HAR文件
    this.har = new HARReader({ 'workspace': this.workspace })
  }

  bindHttp () {
    this.server.use(async (ctx) => {
      const { path } = ctx
      const httphar = this.har.get(path)

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
  }
}

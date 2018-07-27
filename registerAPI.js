
var express = require('express')
var fs = require('fs')

class HARReader {

  constructor (opts) {
    this.har = JSON.parse(opts.har)
    this.indexCache = {}
    this.filter()
  }

  filter () {
    var { 'log': { entries = [] } } = this.har
    this.har.log.entries = entries.filter(http =>
      !http.response.content.mimeType.match(/font|audio|image|text\/|video|application\/(java-archive|vnd|rtf|x-sh|x-tar|zip|xml|xhtml)/ig))
  }

  read (key) {
    var { 'log': { entries = [] } } = this.har

    if (this.indexCache[key]) {
      return this.indexCache[key] && entries[ this.indexCache[key] - 1]
    }

    for (var i = 0; i < entries.length; i++) {
      var { request, response } = entries[i]
      var { url = '' } = request

      if (url.match(new RegExp(key,'ig'))) {
        this.indexCache[key] = i + 1
        return entries[i]
      }
    }
  }
}

function prependSlash(slash = '') {
  if (slash.startsWith('/')) {
    return slash
  }
  return `/${slash}`
}

function sendMockData(req, res) {
  const recording = req.query.recording

  const harContent = fs.readFileSync(`${__dirname}/recording.har`, 'utf-8')
  const har = new HARReader({ 'har': harContent })

  const http = har.read(recording)

  if (!http) {
    return res.json({ code: 400, message: `can not find '${recording}'` })
  }

  let {
    'response': {
      status,
      headers = [],
      cookies = [],
      'content': {
        mimeType, 
        'text': body
      }
    }
  } = http

  res.status(status)

  headers.forEach(head => res.set(head.name, head.value))

  cookies.forEach(cookie => {
    let { name, value, ...restOpts } = cookie
    res.cookie(name, value, restOpts)
  })

  if (status === 200) {
    try {
      if (mimeType === 'application/json') {
        body = JSON.parse(body)
      }
    } catch (e) {}
    res.json(body)
  } else {
    res.end()
  }
}

module.exports = function (app, config) {
  config = Object.assign({}, config)
  config.apiNamespace = prependSlash(config.apiNamespace)
  const router = express.Router()
  router.get('/mock', function (req, res) {
    sendMockData(req, res)
  })
  router.post('/mock', function (req, res) {
    sendMockData(req, res)
  });
  app.use(config.apiNamespace, router)
}

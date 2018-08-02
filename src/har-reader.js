
import fs from 'fs'
import path from 'path'

export default class HARReader {

  constructor (o) {
    this.workspace = o.workspace
    this.filters = o.filters
    this.indexCache = {}
    this.har = this.generatorHAR()
    // this.removeUselessHttp()
  }

  removeUselessHttp () {
    const { 'log': { entries = [] } } = this.har
    this.har.log.entries = entries.filter(http =>
      !http
        .response
        .content
        .mimeType
        .match(/font|audio|image|text\/|video|application\/(java-archive|vnd|rtf|x-sh|x-tar|zip|xml|xhtml)/ig))
  }

  total () {
    return this.har.log.entries
  }

  get (key) {
    const { 'log': { entries = [] } } = this.har

    if (this.indexCache[key]) {
      return this.indexCache[key] && entries[ this.indexCache[key] - 1]
    }

    for (let i = 0; i < entries.length; i++) {
      const { request, response } = entries[i]
      const { url = '' } = request

      if (url.match(new RegExp(key,'ig'))) {
        this.indexCache[key] = i + 1
        return entries[i]
      }
    }
  }

  generatorHAR() {
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

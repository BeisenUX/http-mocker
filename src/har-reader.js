
export default class HARReader {

  constructor (o) {
    this.har = o.har
    this.indexCache = {}
    this.filter()
  }

  filter () {
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
}


var express = require('express');
var fs = require('fs');

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
    return slash;
  }
  return `/${slash}`;
}

module.exports = function (app, config) {
  config = Object.assign({}, config);
  config.apiNamespace = prependSlash(config.apiNamespace);

  const router = express.Router();

  router.get('/mock', function (req, res) {
    const recording = req.query.recording;

    const harContent = fs.readFileSync(`${__dirname}/recording.har`, 'utf-8')
    const har = new HARReader({ 'har': harContent })

    let { 'response': { status, 'content': { mimeType, 'text': body } } } = har.read(recording)

    res.status(status);

    if (status === 200) {

      try {
        if (mimeType === 'application/json') {
          body = JSON.parse(body)
        }
      } catch (e) {}
      
      res.json(body);
    } else {
      res.end();
    }
  });

  // router.post('/mock', bodyParser.json({ limit: config.recordingSizeLimit }), function (req, res) {
  //   const recording = req.params.recording;

  //   const status = _api$saveRecording.status,
  //         body = _api$saveRecording.body;


  //   res.status(status).send(body);
  // });

  app.use(config.apiNamespace, router);
}

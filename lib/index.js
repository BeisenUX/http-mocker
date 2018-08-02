'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _harReader = require('./har-reader');

var _harReader2 = _interopRequireDefault(_harReader);

var _koa = require('koa');

var _koa2 = _interopRequireDefault(_koa);

var _koaOnerror = require('koa-onerror');

var _koaOnerror2 = _interopRequireDefault(_koaOnerror);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

class Server {

  constructor(o) {
    Object.assign(this, {
      'port': 9003,
      'workspace': '/'
    }, o);
  }

  start() {
    // 服务器相关配置
    this.server = new _koa2.default();
    (0, _koaOnerror2.default)(this.server);
    this.bindHttp();
    this.server.listen(this.port);
    // 读取HAR文件
    this.har = new _harReader2.default({ 'workspace': this.workspace });
  }

  bindHttp() {
    var _this = this;

    this.server.use((() => {
      var _ref = _asyncToGenerator(function* (ctx) {
        const { path } = ctx;
        const httphar = _this.har.get(path);

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
        } = httphar;

        headers.forEach(function (head) {
          return ctx.set(head.name, head.value);
        });
        cookies.forEach(function (cookie) {
          return ctx.cookies.set(cookie.name, cookie.value);
        });

        ctx.set('Access-Control-Allow-Origin', '*');
        ctx.set('Content-Type', mimeType);
        ctx.set('Content-Length', bodySize);
        ctx.set('Location', redirectURL);

        ctx.status = status;
        ctx.body = text;
      });

      return function (_x) {
        return _ref.apply(this, arguments);
      };
    })());
  }

  close() {
    this.server.restore();
    this.xhr.restore();
  }

  onServerError(err) {
    console.log('server error', err);
  }
}
exports.default = Server;
module.exports = exports['default'];
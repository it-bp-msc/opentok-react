'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _createSession3 = require('./createSession');

var _createSession4 = _interopRequireDefault(_createSession3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var OTSession = function (_Component) {
  _inherits(OTSession, _Component);

  function OTSession(props) {
    _classCallCheck(this, OTSession);

    var _this = _possibleConstructorReturn(this, (OTSession.__proto__ || Object.getPrototypeOf(OTSession)).call(this, props));

    _this.state = {
      streams: _this.createSession()
    };
    return _this;
  }

  _createClass(OTSession, [{
    key: 'getChildContext',
    value: function getChildContext() {
      return { session: this.sessionHelper.session, streams: this.state.streams };
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps) {
      if (prevProps.apiKey !== this.props.apiKey || prevProps.sessionId !== this.props.sessionId || prevProps.token !== this.props.token) {
        this.setState({ streams: this.createSession() });
      }
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this.destroySession();
    }
  }, {
    key: 'createSession',
    value: function createSession() {
      var _this2 = this;

      this.destroySession();

      this.sessionHelper = (0, _createSession4.default)(_defineProperty({
        apiKey: this.props.apiKey,
        sessionId: this.props.sessionId,
        token: this.props.token,
        options: this.props.options,
        onStreamsUpdated: function onStreamsUpdated(streams) {
          _this2.setState({ streams: streams });
        },
        onConnect: this.props.onConnect,
        onError: this.props.onError
      }, 'options', this.props.options));

      if (this.props.eventHandlers && _typeof(this.props.eventHandlers) === 'object') {
        this.sessionHelper.session.on(this.props.eventHandlers);
      }

      var streams = this.sessionHelper.streams;


      return streams;
    }
  }, {
    key: 'destroySession',
    value: function destroySession() {
      if (this.sessionHelper) {
        this.sessionHelper.disconnect();
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var _this3 = this;

      var _props = this.props,
          className = _props.className,
          style = _props.style;

      return _react2.default.createElement(
        'div',
        { className: className, style: style, ref: function ref(node) {
            _this3.node = node;
          } },
        this.props.children
      );
    }
  }]);

  return OTSession;
}(_react.Component);

exports.default = OTSession;


OTSession.propTypes = _defineProperty({
  className: _propTypes2.default.string,
  style: _propTypes2.default.oneOfType([_propTypes2.default.object, _propTypes2.default.array]), // eslint-disable-line react/forbid-prop-types
  apiKey: _propTypes2.default.string.isRequired,
  sessionId: _propTypes2.default.string.isRequired,
  token: _propTypes2.default.string.isRequired,
  options: _propTypes2.default.object,
  eventHandlers: _propTypes2.default.objectOf(_propTypes2.default.func),
  onConnect: _propTypes2.default.func,
  onError: _propTypes2.default.func
}, 'options', _propTypes2.default.object);

OTSession.defaultProps = {
  eventHandlers: null,
  onConnect: null,
  onError: null,
  options: {}
};

OTSession.childContextTypes = {
  streams: _propTypes2.default.arrayOf(_propTypes2.default.object),
  session: _propTypes2.default.shape({
    subscribe: _propTypes2.default.func,
    unsubscribe: _propTypes2.default.func
  })
};
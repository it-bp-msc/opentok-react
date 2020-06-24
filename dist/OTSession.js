"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _createSession2 = _interopRequireDefault(require("./createSession"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2.default)(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2.default)(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2.default)(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var OTSession = /*#__PURE__*/function (_Component) {
  (0, _inherits2.default)(OTSession, _Component);

  var _super = _createSuper(OTSession);

  function OTSession(props) {
    var _this;

    (0, _classCallCheck2.default)(this, OTSession);
    _this = _super.call(this, props);
    _this.state = {
      streams: _this.createSession()
    };
    return _this;
  }

  (0, _createClass2.default)(OTSession, [{
    key: "getChildContext",
    value: function getChildContext() {
      return {
        session: this.sessionHelper.session,
        streams: this.state.streams
      };
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate(prevProps) {
      if (prevProps.apiKey !== this.props.apiKey || prevProps.sessionId !== this.props.sessionId || prevProps.token !== this.props.token) {
        this.setState({
          streams: this.createSession()
        });
      }
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      this.destroySession();
    }
  }, {
    key: "createSession",
    value: function createSession() {
      var _this2 = this;

      this.destroySession();
      this.sessionHelper = (0, _createSession2.default)({
        apiKey: this.props.apiKey,
        sessionId: this.props.sessionId,
        token: this.props.token,
        options: this.props.options,
        onStreamsUpdated: function onStreamsUpdated(streams) {
          _this2.setState({
            streams
          });
        },
        onConnect: this.props.onConnect,
        onError: this.props.onError,
        options: this.props.options
      });

      if (this.props.eventHandlers && typeof this.props.eventHandlers === 'object') {
        this.sessionHelper.session.on(this.props.eventHandlers);
      }

      var streams = this.sessionHelper.streams;
      return streams;
    }
  }, {
    key: "destroySession",
    value: function destroySession() {
      if (this.sessionHelper) {
        this.sessionHelper.disconnect();
      }
    }
  }, {
    key: "render",
    value: function render() {
      var _this3 = this;

      var _this$props = this.props,
          className = _this$props.className,
          style = _this$props.style;
      return /*#__PURE__*/_react.default.createElement("div", {
        className: className,
        style: style,
        ref: function ref(node) {
          _this3.node = node;
        }
      }, this.props.children);
    }
  }]);
  return OTSession;
}(_react.Component);

exports.default = OTSession;
OTSession.propTypes = {
  className: _propTypes.default.string,
  style: _propTypes.default.oneOfType([_propTypes.default.object, _propTypes.default.array]),
  // eslint-disable-line react/forbid-prop-types
  apiKey: _propTypes.default.string.isRequired,
  sessionId: _propTypes.default.string.isRequired,
  token: _propTypes.default.string.isRequired,
  options: _propTypes.default.object,
  eventHandlers: _propTypes.default.objectOf(_propTypes.default.func),
  onConnect: _propTypes.default.func,
  onError: _propTypes.default.func,
  options: _propTypes.default.object
};
OTSession.defaultProps = {
  eventHandlers: null,
  onConnect: null,
  onError: null,
  options: {}
};
OTSession.childContextTypes = {
  streams: _propTypes.default.arrayOf(_propTypes.default.object),
  session: _propTypes.default.shape({
    subscribe: _propTypes.default.func,
    unsubscribe: _propTypes.default.func
  })
};
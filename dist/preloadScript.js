"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = preloadScript;

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _reactDisplayName = _interopRequireDefault(require("react-display-name"));

var _scriptjs = _interopRequireDefault(require("scriptjs"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2.default)(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2.default)(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2.default)(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var DEFAULT_SCRIPT_URL = 'https://static.opentok.com/v2/js/opentok.min.js';
/*
This higher-order component will load the OpenTok client thru a script tag.
It will render its inner component only when the OpenTok client has loaded.
In the meantime, it will render a loading element chosen by the developer.
*/

function preloadScript(InnerComponent) {
  var PreloadScript = /*#__PURE__*/function (_Component) {
    (0, _inherits2.default)(PreloadScript, _Component);

    var _super = _createSuper(PreloadScript);

    function PreloadScript(props) {
      var _this;

      (0, _classCallCheck2.default)(this, PreloadScript);
      _this = _super.call(this, props);
      (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "onScriptLoad", function () {
        if (_this.isPresent) {
          _this.setState({
            scriptLoaded: true
          });
        }
      });
      _this.state = {
        scriptLoaded: typeof OT !== 'undefined'
      };
      _this.isPresent = false;
      return _this;
    }

    (0, _createClass2.default)(PreloadScript, [{
      key: "componentDidMount",
      value: function componentDidMount() {
        this.isPresent = true;

        if (this.scriptLoading || this.state.scriptLoaded) {
          return;
        }

        this.scriptLoading = true;
        var scriptUrl = this.props.opentokClientUrl;
        (0, _scriptjs.default)(scriptUrl, this.onScriptLoad);
      }
    }, {
      key: "componentWillUnmount",
      value: function componentWillUnmount() {
        this.isPresent = false;
      }
    }, {
      key: "render",
      value: function render() {
        var _this$props = this.props,
            opentokClientUrl = _this$props.opentokClientUrl,
            loadingDelegate = _this$props.loadingDelegate,
            restProps = (0, _objectWithoutProperties2.default)(_this$props, ["opentokClientUrl", "loadingDelegate"]);

        if (this.state.scriptLoaded) {
          return /*#__PURE__*/_react.default.createElement(InnerComponent, restProps);
        }

        return loadingDelegate;
      }
    }]);
    return PreloadScript;
  }(_react.Component);

  PreloadScript.displayName = "preloadScript(".concat((0, _reactDisplayName.default)(InnerComponent), ")");
  PreloadScript.propTypes = {
    opentokClientUrl: _propTypes.default.string,
    loadingDelegate: _propTypes.default.node
  };
  PreloadScript.defaultProps = {
    opentokClientUrl: DEFAULT_SCRIPT_URL,
    loadingDelegate: /*#__PURE__*/_react.default.createElement("div", null)
  };
  return PreloadScript;
}
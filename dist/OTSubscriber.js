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

var _uuid = _interopRequireDefault(require("uuid"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2.default)(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2.default)(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2.default)(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var OTSubscriber = /*#__PURE__*/function (_Component) {
  (0, _inherits2.default)(OTSubscriber, _Component);

  var _super = _createSuper(OTSubscriber);

  function OTSubscriber(props, context) {
    var _this;

    (0, _classCallCheck2.default)(this, OTSubscriber);
    _this = _super.call(this, props);
    _this.state = {
      subscriber: null,
      currentRetryAttempt: 0
    };
    _this.maxRetryAttempts = props.maxRetryAttempts || 5;
    _this.retryAttemptTimeout = props.retryAttemptTimeout || 1000;
    return _this;
  }

  (0, _createClass2.default)(OTSubscriber, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.createSubscriber();
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate(prevProps) {
      var _this2 = this;

      var cast = function cast(value, Type, defaultValue) {
        return value == null ? defaultValue : Type(value).valueOf();
      };

      var updateSubscriberProperty = function updateSubscriberProperty(key, type, defaultValue, _methodName) {
        var methodName = _methodName ? _methodName : key,
            previous = cast(prevProps.properties[key], type, defaultValue),
            current = cast(_this2.props.properties[key], type, defaultValue);

        if (previous !== current) {
          _this2.state.subscriber[methodName].call(_this2.state.subscriber, current);

          if (methodName === 'subscribeToAudio' && current) {
            var audioVolume = _this2.props.properties.audioVolume;

            _this2.state.subscriber.setAudioVolume(audioVolume != null ? audioVolume : 100);
          }
        }
      };

      updateSubscriberProperty('subscribeToAudio', Boolean, true);
      updateSubscriberProperty('subscribeToVideo', Boolean, true);
      updateSubscriberProperty('audioVolume', Number, 100, 'setAudioVolume');

      if (this.getSession() !== this.session || this.getStream() !== this.stream) {
        this.destroySubscriber(this.session);
        this.createSubscriber();
      }
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      this.destroySubscriber(this.session);
    }
  }, {
    key: "getSession",
    value: function getSession() {
      return this.props.session || this.context.session || null;
    }
  }, {
    key: "getStream",
    value: function getStream() {
      return this.props.stream || this.context.stream || null;
    }
  }, {
    key: "getSubscriber",
    value: function getSubscriber() {
      return this.state.subscriber;
    }
  }, {
    key: "createSubscriber",
    value: function createSubscriber() {
      var _this3 = this;

      var session = this.session = this.getSession(),
          stream = this.stream = this.getStream();

      if (!session || !stream) {
        this.setState({
          subscriber: null
        });
        return;
      }

      var container = document.createElement('div');
      container.setAttribute('class', 'OTSubscriberContainer');
      this.node.appendChild(container);
      this.subscriberId = (0, _uuid.default)();
      var subscriberId = this.subscriberId;

      try {
        var subscriber = session.subscribe(stream, container, this.props.properties, function (err) {
          if (subscriberId !== _this3.subscriberId) {
            // Either this subscriber has been recreated or the
            // component unmounted so don't invoke any callbacks
            return;
          }

          if (err && _this3.props.retry && _this3.state.currentRetryAttempt < _this3.maxRetryAttempts - 1) {
            // Error during subscribe function
            _this3.handleRetrySubscriber();
          }

          if (err && typeof _this3.props.onError === 'function') {
            _this3.props.onError(err);
          } else if (!err && typeof _this3.props.onSubscribe === 'function') {
            _this3.setState({
              currentRetryAttempt: 0
            });

            _this3.props.onSubscribe();
          }
        });
        if (this.props.eventHandlers && typeof this.props.eventHandlers === 'object') subscriber.on(this.props.eventHandlers);
        this.setState({
          subscriber
        });
      } catch (e) {
        if (this.props.retry && this.state.currentRetryAttempt < this.maxRetryAttempts - 1) {
          // Error during subscribe function
          this.handleRetrySubscriber();
        }

        if (typeof this.props.onError === 'function') this.props.onError(e);
      }
    }
  }, {
    key: "handleRetrySubscriber",
    value: function handleRetrySubscriber() {
      var _this4 = this;

      setTimeout(function () {
        _this4.setState(function (state) {
          return {
            currentRetryAttempt: state.currentRetryAttempt + 1,
            subscriber: null
          };
        });

        _this4.createSubscriber();
      }, this.retryAttemptTimeout);
    }
  }, {
    key: "destroySubscriber",
    value: function destroySubscriber(session) {
      var _this5 = this;

      delete this.subscriberId;

      if (this.state.subscriber) {
        if (this.props.eventHandlers && typeof this.props.eventHandlers === 'object') {
          this.state.subscriber.once('destroyed', function () {
            _this5.state.subscriber.off(_this5.props.eventHandlers);
          });
        }

        if (session) {
          session.unsubscribe(this.state.subscriber);
        }
      }
    }
  }, {
    key: "render",
    value: function render() {
      var _this6 = this;

      var _this$props = this.props,
          className = _this$props.className,
          style = _this$props.style;
      return /*#__PURE__*/_react.default.createElement("div", {
        className: className,
        style: style,
        ref: function ref(node) {
          _this6.node = node;
        }
      });
    }
  }]);
  return OTSubscriber;
}(_react.Component);

exports.default = OTSubscriber;
OTSubscriber.propTypes = {
  stream: _propTypes.default.shape({
    streamId: _propTypes.default.string
  }),
  session: _propTypes.default.shape({
    subscribe: _propTypes.default.func,
    unsubscribe: _propTypes.default.func
  }),
  className: _propTypes.default.string,
  style: _propTypes.default.oneOfType([_propTypes.default.object, _propTypes.default.array]),
  // eslint-disable-line react/forbid-prop-types
  properties: _propTypes.default.object,
  // eslint-disable-line react/forbid-prop-types
  retry: _propTypes.default.bool,
  maxRetryAttempts: _propTypes.default.number,
  retryAttemptTimeout: _propTypes.default.number,
  eventHandlers: _propTypes.default.objectOf(_propTypes.default.func),
  onSubscribe: _propTypes.default.func,
  onError: _propTypes.default.func
};
OTSubscriber.defaultProps = {
  stream: null,
  session: null,
  className: '',
  style: {},
  properties: {},
  retry: true,
  maxRetryAttempts: 5,
  retryAttemptTimeout: 1000,
  eventHandlers: null,
  onSubscribe: null,
  onError: null
};
OTSubscriber.contextTypes = {
  stream: _propTypes.default.shape({
    streamId: _propTypes.default.string
  }),
  session: _propTypes.default.shape({
    subscribe: _propTypes.default.func,
    unsubscribe: _propTypes.default.func
  })
};
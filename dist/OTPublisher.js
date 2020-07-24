"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _once = _interopRequireDefault(require("lodash/once"));

var _fp = require("lodash/fp");

var _uuid = _interopRequireDefault(require("uuid"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2.default)(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2.default)(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2.default)(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var getScreenShareMediaSources = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee() {
    var videoSource, audioSource, screenStream, microphoneStream, RD, isInsideElectron, desktopCapturer, sources, source;
    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            RD = window.ROOMDesktop;
            isInsideElectron = Boolean(RD);
            _context.next = 4;
            return OT.getUserMedia({
              videoSource: null
            });

          case 4:
            microphoneStream = _context.sent;
            audioSource = microphoneStream.getAudioTracks()[0];

            if (!isInsideElectron) {
              _context.next = 18;
              break;
            }

            desktopCapturer = RD.desktopCapturer;
            _context.next = 10;
            return desktopCapturer.getSources({
              types: ['screen']
            });

          case 10:
            sources = _context.sent;
            source = sources[0];

            if (!source) {
              _context.next = 16;
              break;
            }

            _context.next = 15;
            return navigator.mediaDevices.getUserMedia({
              audio: false,
              video: {
                mandatory: {
                  chromeMediaSource: 'desktop'
                }
              }
            });

          case 15:
            screenStream = _context.sent;

          case 16:
            _context.next = 21;
            break;

          case 18:
            _context.next = 20;
            return OT.getUserMedia({
              videoSource: 'screen'
            });

          case 20:
            screenStream = _context.sent;

          case 21:
            videoSource = screenStream.getVideoTracks()[0];
            return _context.abrupt("return", {
              videoSource,
              audioSource
            });

          case 23:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function getScreenShareMediaSources() {
    return _ref.apply(this, arguments);
  };
}();

var getCameraShareMediaSources = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee2() {
    var stream, videoSource, audioSource;
    return _regenerator.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return OT.getUserMedia();

          case 2:
            stream = _context2.sent;
            videoSource = stream.getVideoTracks()[0];
            audioSource = stream.getAudioTracks()[0];
            return _context2.abrupt("return", {
              videoSource,
              audioSource
            });

          case 6:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function getCameraShareMediaSources() {
    return _ref2.apply(this, arguments);
  };
}();

var OTPublisher = /*#__PURE__*/function (_Component) {
  (0, _inherits2.default)(OTPublisher, _Component);

  var _super = _createSuper(OTPublisher);

  function OTPublisher(props) {
    var _this;

    (0, _classCallCheck2.default)(this, OTPublisher);
    _this = _super.call(this, props);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "sessionConnectedHandler", function () {
      _this.publishToSession(_this.state.publisher);
    });
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "streamCreatedHandler", function (event) {
      _this.setState({
        lastStreamId: event.stream.id
      });
    });
    _this.state = {
      publisher: null,
      lastStreamId: '',
      currentRetryAttempt: 0,
      published: false
    };
    _this.maxRetryAttempts = props.maxRetryAttempts || 5;
    _this.retryAttemptTimeout = props.retryAttemptTimeout || 1000;
    return _this;
  }

  (0, _createClass2.default)(OTPublisher, [{
    key: "componentDidMount",
    value: function () {
      var _componentDidMount = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee3() {
        return _regenerator.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return this.createPublisher();

              case 2:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function componentDidMount() {
        return _componentDidMount.apply(this, arguments);
      }

      return componentDidMount;
    }()
  }, {
    key: "componentDidUpdate",
    value: function () {
      var _componentDidUpdate = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee4(prevProps) {
        var _this2 = this;

        var useDefault, shouldUpdate, updatePublisherProperty;
        return _regenerator.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                if (this.state.published) {
                  _context4.next = 2;
                  break;
                }

                return _context4.abrupt("return");

              case 2:
                useDefault = function useDefault(value, defaultValue) {
                  if (value === undefined) return defaultValue;
                  return value;
                };

                shouldUpdate = function shouldUpdate(key, defaultValue) {
                  var previous = useDefault(prevProps.properties[key], defaultValue);
                  var current = useDefault(_this2.props.properties[key], defaultValue);
                  return previous !== current;
                };

                updatePublisherProperty = function updatePublisherProperty(key, defaultValue) {
                  if (shouldUpdate(key, defaultValue)) {
                    var value = useDefault(_this2.props.properties[key], defaultValue);

                    _this2.state.publisher[key].call(_this2.state.publisher, value);
                  }
                };

                updatePublisherProperty('publishAudio', true);
                updatePublisherProperty('publishVideo', true);

                if (!(this.getSession() !== this.session || shouldUpdate('videoSource', undefined))) {
                  _context4.next = 11;
                  break;
                }

                this.destroyPublisher(this.session);
                _context4.next = 11;
                return this.createPublisher();

              case 11:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function componentDidUpdate(_x) {
        return _componentDidUpdate.apply(this, arguments);
      }

      return componentDidUpdate;
    }()
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      if (this.session) {
        this.session.off('sessionConnected', this.sessionConnectedHandler);
      }

      this.destroyPublisher(this.session);
    }
  }, {
    key: "getSession",
    value: function getSession() {
      return this.props.session || this.context.session;
    }
  }, {
    key: "getPublisher",
    value: function getPublisher() {
      return this.state.publisher;
    }
  }, {
    key: "destroyPublisher",
    value: function destroyPublisher(session) {
      var _this3 = this;

      delete this.publisherId;

      if (this.state.publisher) {
        this.state.publisher.off('streamCreated', this.streamCreatedHandler);

        if (this.props.eventHandlers && typeof this.props.eventHandlers === 'object') {
          this.state.publisher.once('destroyed', function () {
            _this3.state.publisher.off(_this3.props.eventHandlers);
          });
        }

        if (session && this.state.published) {
          session.unpublish(this.state.publisher);
        }

        this.state.publisher.destroy();
        this.setState({
          publisher: null,
          published: false
        });
      }
    }
  }, {
    key: "publishToSession",
    value: function publishToSession(publisher) {
      var _this4 = this;

      var session = this.getSession();
      if (!session || !publisher) return;
      var publisherId = this.publisherId;

      try {
        session.publish(publisher, function (err) {
          if (publisherId !== _this4.publisherId) {
            // Either this publisher has been recreated or the
            // component unmounted so don't invoke any callbacks
            return;
          }

          if (err && _this4.props.retry && _this4.state.currentRetryAttempt < _this4.maxRetryAttempts - 1) {
            // Error during publish function
            _this4.handleRetryPublisher();
          }

          if (err) {
            _this4.errorHandler(err);
          } else {
            if (_this4.props.eventHandlers && typeof _this4.props.eventHandlers === 'object') {
              var handles = (0, _fp.omitBy)(_fp.isNil)({
                audioLevel: _this4.props.eventHandlers.audioLevel,
                audioLevelUpdated: _this4.props.eventHandlers.audioLevelUpdated
              });
              publisher.on(handles);
            }

            _this4.setState({
              currentRetryAttempt: 0,
              published: true
            });

            publisher.publishAudio(!!_this4.props.properties.publishAudio);
            publisher.publishVideo(!!_this4.props.properties.publishVideo);
            if (typeof _this4.props.onPublish === 'function') _this4.props.onPublish();
          }
        });
      } catch (e) {
        if (this.props.retry && this.state.currentRetryAttempt < this.maxRetryAttempts - 1) {
          // Error during publish function
          this.handleRetryPublisher();
        }

        this.errorHandler(e);
      }
    }
  }, {
    key: "createPublisher",
    value: function () {
      var _createPublisher = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee5() {
        var _this5 = this;

        var container, publisherId, session, properties, getMediaSources, mediaSources, publisher, handles;
        return _regenerator.default.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                publisherId = (0, _uuid.default)();
                session = this.getSession();
                properties = this.props.properties || {};

                if (session) {
                  _context5.next = 6;
                  break;
                }

                this.setState({
                  publisher: null,
                  lastStreamId: ''
                });
                return _context5.abrupt("return");

              case 6:
                if (properties.insertDefaultUI !== false) {
                  container = document.createElement('div');
                  container.setAttribute('class', 'OTPublisherContainer');
                  this.node.appendChild(container);
                }

                this.session = session;
                this.publisherId = publisherId;
                this.errorHandler = (0, _once.default)(function (err) {
                  if (publisherId !== _this5.publisherId) {
                    // Either this publisher has been recreated or the
                    // component unmounted so don't invoke any callbacks
                    return;
                  }

                  if (typeof _this5.props.onError === 'function') {
                    _this5.props.onError(err);
                  }
                });
                getMediaSources = properties.videoSource === 'screen' ? getScreenShareMediaSources : getCameraShareMediaSources;
                _context5.next = 13;
                return getMediaSources();

              case 13:
                mediaSources = _context5.sent;
                publisher = OT.initPublisher(container, _objectSpread(_objectSpread({}, properties), mediaSources), function (err) {
                  if (publisherId !== _this5.publisherId) {
                    // Either this publisher has been recreated or the
                    // component unmounted so don't invoke any callbacks
                    return;
                  }

                  if (err) {
                    _this5.errorHandler(err);
                  } else if (typeof _this5.props.onInit === 'function') {
                    _this5.props.onInit();
                  }
                });
                publisher.on('streamCreated', this.streamCreatedHandler);

                if (this.props.eventHandlers && typeof this.props.eventHandlers === 'object') {
                  handles = (0, _fp.omitBy)(_fp.isNil)(Object.assign({}, this.props.eventHandlers, {
                    audioLevel: null,
                    audioLevelUpdated: null
                  }));
                  publisher.on(handles);
                }

                this.setState({
                  publisher,
                  lastStreamId: ''
                });

                if (session) {
                  if (session.connection) {
                    this.publishToSession(publisher);
                  } else {
                    session.once('sessionConnected', this.sessionConnectedHandler);
                  }
                }

              case 19:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function createPublisher() {
        return _createPublisher.apply(this, arguments);
      }

      return createPublisher;
    }()
  }, {
    key: "handleRetryPublisher",
    value: function handleRetryPublisher() {
      var _this6 = this;

      setTimeout(function () {
        _this6.setState(function (state) {
          return {
            currentRetryAttempt: state.currentRetryAttempt + 1
          };
        });

        _this6.publishToSession(_this6.state.publisher);
      }, this.retryAttemptTimeout);
    }
  }, {
    key: "render",
    value: function render() {
      var _this7 = this;

      var _this$props = this.props,
          className = _this$props.className,
          style = _this$props.style;
      return /*#__PURE__*/_react.default.createElement("div", {
        className: className,
        style: style,
        ref: function ref(node) {
          _this7.node = node;
        }
      });
    }
  }]);
  return OTPublisher;
}(_react.Component);

exports.default = OTPublisher;
OTPublisher.propTypes = {
  session: _propTypes.default.shape({
    connection: _propTypes.default.shape({
      connectionId: _propTypes.default.string
    }),
    once: _propTypes.default.func,
    off: _propTypes.default.func,
    publish: _propTypes.default.func,
    unpublish: _propTypes.default.func
  }),
  className: _propTypes.default.string,
  style: _propTypes.default.oneOfType([_propTypes.default.object, _propTypes.default.array]),
  // eslint-disable-line react/forbid-prop-types
  properties: _propTypes.default.object,
  // eslint-disable-line react/forbid-prop-types
  eventHandlers: _propTypes.default.objectOf(_propTypes.default.func),
  retry: _propTypes.default.bool,
  maxRetryAttempts: _propTypes.default.number,
  retryAttemptTimeout: _propTypes.default.number,
  onInit: _propTypes.default.func,
  onPublish: _propTypes.default.func,
  onError: _propTypes.default.func
};
OTPublisher.defaultProps = {
  session: null,
  className: '',
  style: {},
  properties: {},
  eventHandlers: null,
  retry: true,
  maxRetryAttempts: 5,
  retryAttemptTimeout: 1000,
  onInit: null,
  onPublish: null,
  onError: null
};
OTPublisher.contextTypes = {
  session: _propTypes.default.shape({
    connection: _propTypes.default.shape({
      connectionId: _propTypes.default.string
    }),
    once: _propTypes.default.func,
    off: _propTypes.default.func,
    publish: _propTypes.default.func,
    unpublish: _propTypes.default.func
  })
};
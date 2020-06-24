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

var _once = require('lodash/once');

var _once2 = _interopRequireDefault(_once);

var _fp = require('lodash/fp');

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var OTPublisher = function (_Component) {
  _inherits(OTPublisher, _Component);

  function OTPublisher(props) {
    _classCallCheck(this, OTPublisher);

    var _this = _possibleConstructorReturn(this, (OTPublisher.__proto__ || Object.getPrototypeOf(OTPublisher)).call(this, props));

    _this.sessionConnectedHandler = function () {
      _this.publishToSession(_this.state.publisher);
    };

    _this.streamCreatedHandler = function (event) {
      _this.setState({ lastStreamId: event.stream.id });
    };

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

  _createClass(OTPublisher, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.createPublisher();
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps) {
      var _this2 = this;

      if (!this.state.published) return;

      var useDefault = function useDefault(value, defaultValue) {
        return value === undefined ? defaultValue : value;
      };

      var shouldUpdate = function shouldUpdate(key, defaultValue) {
        var previous = useDefault(prevProps.properties[key], defaultValue);
        var current = useDefault(_this2.props.properties[key], defaultValue);
        return previous !== current;
      };

      var updatePublisherProperty = function updatePublisherProperty(key, defaultValue) {
        if (shouldUpdate(key, defaultValue)) {
          var value = useDefault(_this2.props.properties[key], defaultValue);
          _this2.state.publisher[key].call(_this2.state.publisher, value);
        }
      };

      updatePublisherProperty('publishAudio', true);
      updatePublisherProperty('publishVideo', true);

      if (this.getSession() !== this.session || shouldUpdate('videoSource', undefined)) {
        this.destroyPublisher(this.session);
        this.createPublisher();
      }
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      if (this.session) {
        this.session.off('sessionConnected', this.sessionConnectedHandler);
      }

      this.destroyPublisher(this.session);
    }
  }, {
    key: 'getSession',
    value: function getSession() {
      return this.props.session || this.context.session;
    }
  }, {
    key: 'getPublisher',
    value: function getPublisher() {
      return this.state.publisher;
    }
  }, {
    key: 'destroyPublisher',
    value: function destroyPublisher(session) {
      var _this3 = this;

      delete this.publisherId;

      if (this.state.publisher) {
        this.state.publisher.off('streamCreated', this.streamCreatedHandler);

        if (this.props.eventHandlers && _typeof(this.props.eventHandlers) === 'object') {
          this.state.publisher.once('destroyed', function () {
            _this3.state.publisher.off(_this3.props.eventHandlers);
          });
        }

        if (session && this.state.published) {
          session.unpublish(this.state.publisher);
        }

        this.state.publisher.destroy();
        this.setState({ publisher: null, published: false });
      }
    }
  }, {
    key: 'publishToSession',
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
            if (_this4.props.eventHandlers && _typeof(_this4.props.eventHandlers) === 'object') {
              var handles = (0, _fp.omitBy)(_fp.isNil)({ audioLevel: _this4.props.eventHandlers.audioLevel, audioLevelUpdated: _this4.props.eventHandlers.audioLevelUpdated });
              publisher.on(handles);
            }

            _this4.setState({ currentRetryAttempt: 0, published: true });

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
    key: 'createPublisher',
    value: function createPublisher() {
      var _this5 = this;

      var session = this.session = this.getSession();

      if (!session) {
        this.setState({ publisher: null, lastStreamId: '' });
        return;
      }

      var properties = this.props.properties || {};
      var container = void 0;

      if (properties.insertDefaultUI !== false) {
        container = document.createElement('div');
        container.setAttribute('class', 'OTPublisherContainer');
        this.node.appendChild(container);
      }

      this.publisherId = (0, _uuid2.default)();
      var publisherId = this.publisherId;


      this.errorHandler = (0, _once2.default)(function (err) {
        if (publisherId !== _this5.publisherId) {
          // Either this publisher has been recreated or the
          // component unmounted so don't invoke any callbacks
          return;
        }

        if (typeof _this5.props.onError === 'function') {
          _this5.props.onError(err);
        }
      });

      var publisher = OT.initPublisher(container, properties, function (err) {
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

      if (this.props.eventHandlers && _typeof(this.props.eventHandlers) === 'object') {
        var handles = (0, _fp.omitBy)(_fp.isNil)(Object.assign({}, this.props.eventHandlers, { audioLevel: null, audioLevelUpdated: null }));
        publisher.on(handles);
      }

      this.setState({ publisher: publisher, lastStreamId: '' });

      if (session) {
        if (session.connection) {
          this.publishToSession(publisher);
        } else {
          session.once('sessionConnected', this.sessionConnectedHandler);
        }
      }
    }
  }, {
    key: 'handleRetryPublisher',
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
    key: 'render',
    value: function render() {
      var _this7 = this;

      var _props = this.props,
          className = _props.className,
          style = _props.style;

      return _react2.default.createElement('div', { className: className, style: style, ref: function ref(node) {
          _this7.node = node;
        } });
    }
  }]);

  return OTPublisher;
}(_react.Component);

exports.default = OTPublisher;


OTPublisher.propTypes = {
  session: _propTypes2.default.shape({
    connection: _propTypes2.default.shape({
      connectionId: _propTypes2.default.string
    }),
    once: _propTypes2.default.func,
    off: _propTypes2.default.func,
    publish: _propTypes2.default.func,
    unpublish: _propTypes2.default.func
  }),
  className: _propTypes2.default.string,
  style: _propTypes2.default.oneOfType([_propTypes2.default.object, _propTypes2.default.array]), // eslint-disable-line react/forbid-prop-types
  properties: _propTypes2.default.object, // eslint-disable-line react/forbid-prop-types
  eventHandlers: _propTypes2.default.objectOf(_propTypes2.default.func),
  retry: _propTypes2.default.bool,
  maxRetryAttempts: _propTypes2.default.number,
  retryAttemptTimeout: _propTypes2.default.number,
  onInit: _propTypes2.default.func,
  onPublish: _propTypes2.default.func,
  onError: _propTypes2.default.func
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
  session: _propTypes2.default.shape({
    connection: _propTypes2.default.shape({
      connectionId: _propTypes2.default.string
    }),
    once: _propTypes2.default.func,
    off: _propTypes2.default.func,
    publish: _propTypes2.default.func,
    unpublish: _propTypes2.default.func
  })
};
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = OTStreams;

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _OTSubscriberContext = _interopRequireDefault(require("./OTSubscriberContext"));

function OTStreams(props, context) {
  var session = props.session || context.session || null;
  var streams = props.streams || context.streams || null;

  if (!session) {
    return /*#__PURE__*/_react.default.createElement("div", null);
  }

  var child = _react.Children.only(props.children);

  var childrenWithContextWrapper = Array.isArray(streams) ? streams.map(function (stream) {
    return child ? /*#__PURE__*/_react.default.createElement(_OTSubscriberContext.default, {
      stream: stream,
      key: stream.id
    }, /*#__PURE__*/(0, _react.cloneElement)(child)) : child;
  }) : null;
  return /*#__PURE__*/_react.default.createElement("div", null, childrenWithContextWrapper);
}

OTStreams.propTypes = {
  children: _propTypes.default.element.isRequired,
  session: _propTypes.default.shape({
    publish: _propTypes.default.func,
    subscribe: _propTypes.default.func
  }),
  streams: _propTypes.default.arrayOf(_propTypes.default.object)
};
OTStreams.defaultProps = {
  session: null,
  streams: null
};
OTStreams.contextTypes = {
  session: _propTypes.default.shape({
    publish: _propTypes.default.func,
    subscribe: _propTypes.default.func
  }),
  streams: _propTypes.default.arrayOf(_propTypes.default.object)
};
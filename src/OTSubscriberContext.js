import React, { Component } from 'react';
import PropTypes from 'prop-types';

// This is a wrapper class that establishes context for an OTSubscriber
// instance.  This allows stream to be passed to the
// OTSubscriber without requiring each child element to pas through props.
// There should be a 1:1 ratio between OTSubscriberContext's and OTSubscriber's.
// In general, OTSubscriberContext's are generated by the OTStreams component

export default class OTSubscriberContext extends Component {
  getChildContext() {
    return { stream: this.props.stream };
  }

  render() {
    return <div>{ this.props.children }</div>;
  }

}

OTSubscriberContext.propTypes = {
  children: PropTypes.element.isRequired,
  stream: PropTypes.shape({
    streamId: PropTypes.string,
  }).isRequired,
};

OTSubscriberContext.childContextTypes = {
  stream: PropTypes.shape({
    streamId: PropTypes.string,
  }),
};
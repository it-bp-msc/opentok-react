import React, { Component } from 'react';
import PropTypes from 'prop-types';

import createSession from './createSession';

export default class OTSession extends Component {
  constructor(props) {
    super(props);

    this.state = {
      streams: [],
    };

    this.createSession();
  }

  getChildContext() {
    return { session: this.sessionHelper.session, streams: this.state.streams };
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.apiKey !== this.props.apiKey ||
      prevProps.sessionId !== this.props.sessionId ||
      prevProps.token !== this.props.token
    ) {
      this.createSession();
    }
  }

  componentWillUnmount() {
    this.destroySession();
  }

  createSession() {
    this.destroySession();

    this.sessionHelper = createSession({
      apiKey: this.props.apiKey,
      sessionId: this.props.sessionId,
      token: this.props.token,
      options: this.props.options,
      onStreamsUpdated: (streams) => { this.setState({ streams }); },
      onConnect: this.props.onConnect,
      onError: this.props.onError,
    });

    if (
      this.props.eventHandlers &&
      typeof this.props.eventHandlers === 'object'
    ) {
      this.sessionHelper.session.on(this.props.eventHandlers);
    }

    const { streams } = this.sessionHelper;
    this.setState({ streams });
  }

  destroySession() {
    if (this.sessionHelper) {
      this.sessionHelper.disconnect();

      if (
        this.props.eventHandlers &&
        typeof this.props.eventHandlers === 'object'
      ) {
        this.sessionHelper.session.off(this.props.eventHandlers);
      }
    }
  }

  render() {
    const { className, style } = this.props;
    return <div className={className} style={style} ref={(node) => { this.node = node; }}>{this.props.children}</div>;
  }
}

OTSession.propTypes = {
  className: PropTypes.string,
  style: PropTypes.oneOfType([ PropTypes.object, PropTypes.array ]), // eslint-disable-line react/forbid-prop-types
  apiKey: PropTypes.string.isRequired,
  sessionId: PropTypes.string.isRequired,
  token: PropTypes.string.isRequired,
  options: PropTypes.object,
  eventHandlers: PropTypes.objectOf(PropTypes.func),
  onConnect: PropTypes.func,
  onError: PropTypes.func,
};

OTSession.defaultProps = {
  eventHandlers: null,
  onConnect: null,
  onError: null,
};

OTSession.childContextTypes = {
  streams: PropTypes.arrayOf(PropTypes.object),
  session: PropTypes.shape({
    subscribe: PropTypes.func,
    unsubscribe: PropTypes.func,
  }),
};

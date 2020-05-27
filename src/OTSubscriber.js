import React, { Component } from 'react';
import PropTypes from 'prop-types';
import uuid from 'uuid';

export default class OTSubscriber extends Component {
  constructor(props, context) {
    super(props);

    this.state = {
      subscriber: null,
      currentRetryAttempt: 0,
    };
    this.maxRetryAttempts = props.maxRetryAttempts || 5;
    this.retryAttemptTimeout = props.retryAttemptTimeout || 1000;
  }

  componentDidMount() {
    this.createSubscriber();
  }

  componentDidUpdate(prevProps) {
    const cast = (value, Type, defaultValue) => (value === undefined ? defaultValue : Type(value));

    const updateSubscriberProperty = (key) => {
      const previous = cast(prevProps.properties[key], Boolean, true);
      const current = cast(this.props.properties[key], Boolean, true);
      if (previous !== current) {
        this.state.subscriber[key](current);
      }
    };

    updateSubscriberProperty('subscribeToAudio');
    updateSubscriberProperty('subscribeToVideo');

    if (this.getSession() !== this.session || this.getStream() !== this.stream) {
      this.destroySubscriber(this.session);
      this.createSubscriber();
    }
  }

  componentWillUnmount() {
    this.destroySubscriber(this.session);
  }

  getSession() {
    return this.props.session || this.context.session || null;
  }

  getStream() {
    return this.props.stream || this.context.stream || null;
  }

  getSubscriber() {
    return this.state.subscriber;
  }

  createSubscriber() {
    var session = this.session = this.getSession(),
        stream  = this.stream = this.getStream();

    if (!session || !stream) {
      this.setState({ subscriber: null });
      return;
    }

    const container = document.createElement('div');
    container.setAttribute('class', 'OTSubscriberContainer');
    this.node.appendChild(container);

    this.subscriberId = uuid();
    const { subscriberId } = this;

    const subscriber = session.subscribe(
            stream,
            container,
            this.props.properties,
            (err) => {
              if (subscriberId !== this.subscriberId) {
                    // Either this subscriber has been recreated or the
                    // component unmounted so don't invoke any callbacks
                return;
              }
              if (err &&
                this.props.retry &&
                this.state.currentRetryAttempt < (this.maxRetryAttempts - 1)) {
                // Error during subscribe function
                this.handleRetrySubscriber();
                // If there is a retry action, do we want to execute the onError props function?
                // return;
              }
              if (err && typeof this.props.onError === 'function') {
                this.props.onError(err);
              } else if (!err && typeof this.props.onSubscribe === 'function') {
                this.props.onSubscribe();
              }
            },
        );

    if (
            this.props.eventHandlers &&
            typeof this.props.eventHandlers === 'object'
        ) {
      subscriber.on(this.props.eventHandlers);
    }

    this.setState({ subscriber });
  }

  handleRetrySubscriber() {
    setTimeout(() => {
      this.setState(state => ({
        currentRetryAttempt: state.currentRetryAttempt + 1,
        subscriber: null,
      }));
      this.createSubscriber();
    }, this.retryAttemptTimeout);
  }

  destroySubscriber(session) {
    delete this.subscriberId;

    if (this.state.subscriber) {
      if (
                this.props.eventHandlers &&
                typeof this.props.eventHandlers === 'object'
            ) {
        this.state.subscriber.once('destroyed', () => {
          this.state.subscriber.off(this.props.eventHandlers);
        });
      }

      if (session) {
        session.unsubscribe(this.state.subscriber);
      }
    }
  }

  render() {
    const { className, style } = this.props;
    return <div className={className} style={style} ref={(node) => { this.node = node; }} />;
  }
}

OTSubscriber.propTypes = {
  stream: PropTypes.shape({
    streamId: PropTypes.string,
  }),
  session: PropTypes.shape({
    subscribe: PropTypes.func,
    unsubscribe: PropTypes.func,
  }),
  className: PropTypes.string,
  style: PropTypes.oneOfType([ PropTypes.object, PropTypes.array ]), // eslint-disable-line react/forbid-prop-types
  properties: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  retry: PropTypes.bool,
  maxRetryAttempts: PropTypes.number,
  retryAttemptTimeout: PropTypes.number,
  eventHandlers: PropTypes.objectOf(PropTypes.func),
  onSubscribe: PropTypes.func,
  onError: PropTypes.func,
};

OTSubscriber.defaultProps = {
  stream: null,
  session: null,
  className: '',
  style: {},
  properties: {},
  retry: false,
  maxRetryAttempts: 5,
  retryAttemptTimeout: 1000,
  eventHandlers: null,
  onSubscribe: null,
  onError: null,
};

OTSubscriber.contextTypes = {
  stream: PropTypes.shape({
    streamId: PropTypes.string,
  }),
  session: PropTypes.shape({
    subscribe: PropTypes.func,
    unsubscribe: PropTypes.func,
  }),
};

import React, { Component } from "react";
import PropTypes from "prop-types";
import once from "lodash/once";
import { omitBy, isNil } from "lodash/fp";
import uuid from "uuid";

export default class OTPublisher extends Component {
  constructor(props) {
    super(props);

    this.state = {
      publisher: null,
      lastStreamId: "",
      currentRetryAttempt: 0,
      published: false,
    };

    this.maxRetryAttempts = props.maxRetryAttempts || 5;
    this.retryAttemptTimeout = props.retryAttemptTimeout || 1000;
  }

  getScreenShareMediaSources = async () => {
    let videoSource, audioSource, screenStream, microphoneStream;

    const RD = window.ROOMDesktop;
    const isInsideElectron = Boolean(RD);

    microphoneStream = await OT.getUserMedia({ videoSource: null });
    audioSource = microphoneStream.getAudioTracks()[0] || null;

    if (isInsideElectron) {
      const { desktopCapturer } = RD;
      const sources = await desktopCapturer.getSources({ types: ["screen"] });
      const source = sources[0];
      if (source) {
        screenStream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            mandatory: {
              chromeMediaSource: "desktop",
            },
          },
        });
      }
    } else {
      screenStream = await OT.getUserMedia({ videoSource: "screen" }).catch(
        async (err) => {
          this.props.onHandleScreenShareRejection();
          this.destroyPublisher(this.session);
          await this.createPublisher();
          return;
        }
      );
    }

    if (!screenStream) return;

    videoSource = screenStream.getVideoTracks()[0] || null;
    return { videoSource, audioSource };
  };

  getCameraShareMediaSources = async () => {
    const stream = await OT.getUserMedia();
    const videoSource = stream.getVideoTracks()[0] || null;
    const audioSource = stream.getAudioTracks()[0] || null;
    return { videoSource, audioSource };
  };

  async componentDidMount() {
    await this.createPublisher();
  }

  async componentDidUpdate(prevProps) {
    if (!this.state.published) return;

    const useDefault = (value, defaultValue) => {
      if (value === undefined) return defaultValue;
      return value;
    };

    const shouldUpdate = (key, defaultValue) => {
      const previous = useDefault(prevProps.properties[key], defaultValue);
      const current = useDefault(this.props.properties[key], defaultValue);
      return previous !== current;
    };

    const updatePublisherProperty = (key, defaultValue) => {
      if (shouldUpdate(key, defaultValue)) {
        const value = useDefault(this.props.properties[key], defaultValue);
        this.state.publisher[key].call(this.state.publisher, value);
      }
    };

    updatePublisherProperty("publishAudio", true);
    updatePublisherProperty("publishVideo", true);

    if (
      this.getSession() !== this.session ||
      shouldUpdate("videoSource", undefined)
    ) {
      this.destroyPublisher(this.session);
      await this.createPublisher();
    }
  }

  componentWillUnmount() {
    if (this.session) {
      this.session.off("sessionConnected", this.sessionConnectedHandler);
    }

    this.destroyPublisher(this.session);
  }

  getSession() {
    return this.props.session || this.context.session;
  }

  getPublisher() {
    return this.state.publisher;
  }

  destroyPublisher(session) {
    delete this.publisherId;

    if (this.state.publisher) {
      this.state.publisher.off("streamCreated", this.streamCreatedHandler);

      if (
        this.props.eventHandlers &&
        typeof this.props.eventHandlers === "object"
      ) {
        this.state.publisher.once("destroyed", () => {
          this.state.publisher.off(this.props.eventHandlers);
        });
      }

      if (session && this.state.published) {
        session.unpublish(this.state.publisher);
      }

      this.state.publisher.destroy();
      this.setState({ publisher: null, published: false });
    }
  }

  publishToSession(publisher) {
    const session = this.getSession();
    if (!session || !publisher) return;

    const { publisherId } = this;

    try {
      session.publish(publisher, (err) => {
        if (publisherId !== this.publisherId) {
          // Either this publisher has been recreated or the
          // component unmounted so don't invoke any callbacks
          return;
        }

        if (
          err &&
          this.props.retry &&
          this.state.currentRetryAttempt < this.maxRetryAttempts - 1
        ) {
          // Error during publish function
          this.handleRetryPublisher();
        }

        if (err) {
          this.errorHandler(err);
        } else {
          if (
            this.props.eventHandlers &&
            typeof this.props.eventHandlers === "object"
          ) {
            const handles = omitBy(isNil)({
              audioLevel: this.props.eventHandlers.audioLevel,
              audioLevelUpdated: this.props.eventHandlers.audioLevelUpdated,
            });
            publisher.on(handles);
          }

          this.setState({ currentRetryAttempt: 0, published: true });

          publisher.publishAudio(!!this.props.properties.publishAudio);
          publisher.publishVideo(!!this.props.properties.publishVideo);

          if (typeof this.props.onPublish === "function")
            this.props.onPublish();
        }
      });
    } catch (e) {
      if (
        this.props.retry &&
        this.state.currentRetryAttempt < this.maxRetryAttempts - 1
      ) {
        // Error during publish function
        this.handleRetryPublisher();
      }

      this.errorHandler(e);
    }
  }

  async createPublisher() {
    let container;

    const publisherId = uuid();

    const session = this.getSession();

    const properties = this.props.properties || {};

    if (!session) {
      this.setState({ publisher: null, lastStreamId: "" });
      return;
    }

    if (properties.insertDefaultUI !== false) {
      container = document.createElement("div");
      container.setAttribute("class", "OTPublisherContainer");
      this.node.appendChild(container);
    }

    this.session = session;

    this.publisherId = publisherId;

    this.errorHandler = once((err) => {
      if (publisherId !== this.publisherId) {
        // Either this publisher has been recreated or the
        // component unmounted so don't invoke any callbacks
        return;
      }

      if (typeof this.props.onError === "function") {
        this.props.onError(err);
      }
    });

    const getMediaSources =
      properties.videoSource === "screen"
        ? this.getScreenShareMediaSources
        : this.getCameraShareMediaSources;

    const mediaSources = await getMediaSources();

    if (!mediaSources) return;

    const publisher = OT.initPublisher(
      container,
      {
        ...properties,
        ...mediaSources,
      },
      (err) => {
        if (publisherId !== this.publisherId) {
          // Either this publisher has been recreated or the
          // component unmounted so don't invoke any callbacks
          return;
        }

        if (err) {
          this.errorHandler(err);
        } else if (typeof this.props.onInit === "function") {
          this.props.onInit();
        }
      }
    );

    publisher.on("streamCreated", this.streamCreatedHandler);

    if (
      this.props.eventHandlers &&
      typeof this.props.eventHandlers === "object"
    ) {
      const handles = omitBy(isNil)(
        Object.assign({}, this.props.eventHandlers, {
          audioLevel: null,
          audioLevelUpdated: null,
        })
      );
      publisher.on(handles);
    }

    this.setState({ publisher, lastStreamId: "" });

    if (session) {
      if (session.connection) {
        this.publishToSession(publisher);
      } else {
        session.once("sessionConnected", this.sessionConnectedHandler);
      }
    }
  }

  handleRetryPublisher() {
    setTimeout(() => {
      this.setState((state) => ({
        currentRetryAttempt: state.currentRetryAttempt + 1,
      }));

      this.publishToSession(this.state.publisher);
    }, this.retryAttemptTimeout);
  }

  sessionConnectedHandler = () => {
    this.publishToSession(this.state.publisher);
  };

  streamCreatedHandler = (event) => {
    this.setState({ lastStreamId: event.stream.id });
  };

  render() {
    const { className, style } = this.props;
    return (
      <div
        className={className}
        style={style}
        ref={(node) => {
          this.node = node;
        }}
      />
    );
  }
}

OTPublisher.propTypes = {
  session: PropTypes.shape({
    connection: PropTypes.shape({
      connectionId: PropTypes.string,
    }),
    once: PropTypes.func,
    off: PropTypes.func,
    publish: PropTypes.func,
    unpublish: PropTypes.func,
  }),
  className: PropTypes.string,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]), // eslint-disable-line react/forbid-prop-types
  properties: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  eventHandlers: PropTypes.objectOf(PropTypes.func),
  retry: PropTypes.bool,
  maxRetryAttempts: PropTypes.number,
  retryAttemptTimeout: PropTypes.number,
  onInit: PropTypes.func,
  onPublish: PropTypes.func,
  onError: PropTypes.func,
};

OTPublisher.defaultProps = {
  session: null,
  className: "",
  style: {},
  properties: {},
  eventHandlers: null,
  retry: true,
  maxRetryAttempts: 5,
  retryAttemptTimeout: 1000,
  onInit: null,
  onPublish: null,
  onError: null,
};

OTPublisher.contextTypes = {
  session: PropTypes.shape({
    connection: PropTypes.shape({
      connectionId: PropTypes.string,
    }),
    once: PropTypes.func,
    off: PropTypes.func,
    publish: PropTypes.func,
    unpublish: PropTypes.func,
  }),
};

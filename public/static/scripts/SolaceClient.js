/* eslint-disable no-plusplus */
/* eslint-disable no-useless-escape */
/* eslint-disable arrow-body-style */
/* eslint-disable no-undef */
class SolaceClient {
  constructor(name, code, type, onConnectionSuccess, onConnectionError, onConnectionLost) {
    console.debug('Create SolaceClient for name: ', name + ' game: ', code, ' type: ', type);
    this.topics = [];
    this.callbacks = {};
    this.name = name;
    this.code = code;
    this.type = type;
    this.connected = false;
    this.reconnect = false;
    this.onConnectionSuccess = onConnectionSuccess;
    this.onConnectionError = onConnectionError;
    this.onConnectionLost = onConnectionLost;
    this.client = new Paho.MQTT.Client(
      MQTT_HOST,
      // eslint-disable-next-line radix
      parseInt(MQTT_PORT),
      '/',
      'trivia/' + code + '/' + name + '-' + shortHash(code + '-' + name + (new Date()).getTime()));
    // this.connect();
  }

  getTime = () => {
    const now = new Date();
    const time = [('0' + now.getHours()).slice(-2), ('0' + now.getMinutes()).slice(-2),
      ('0' + now.getSeconds()).slice(-2)];
    return '[' + time.join(':') + '] ';
  }

  isConnected = () => {
    return this.connected;
  }

  connect() {
    // if (this.isConnected()) { return; }

    // define connection options
    const connectOptions = {};
    connectOptions.useSSL = MQTT_HOST.indexOf('localhost') === -1;
    connectOptions.mqttVersion = 3;
    connectOptions.reconnect = true;
    connectOptions.userName = MQTT_USER_NAME;
    connectOptions.password = MQTT_PASSWORD;
    connectOptions.invocationContext = { code: this.code };
    connectOptions.onSuccess = ((invocationContext) => {
      console.debug(this.getTime(), `Client connected to: ${MQTT_HOST}:${MQTT_PORT}`);
      this.connected = true;
      this.onConnectionSuccess(this, this.code);
      return true;
    });
    connectOptions.onFailure = ((message) => {
      console.debug(this.getTime(), `Failed to connect: ${message.errorCode}\n${message.errorMessage}`);
      this.connected = false;
      this.onConnectionError(this, this.code);
      return false;
    });

    // try to connect!
    this.client.connect(connectOptions);
    this.client.onConnectionLost = ((err) => {
      console.debug(this.getTime(), `Client connection lost:${err.errorCode}\n${err.errorMessage}`);
      this.connected = false;
      this.reconnect = true;
      this.onConnectionLost(this, this.code);
      return false;
    });
    this.client.onMessageArrived = ((message) => {
      this.onMessageArrived(message);
    });

    this.client.onMessageDelivered = ((message) => {
      const topic = message.destinationName;
      const text = message.payloadString;
      // console.debug(this.getTime(), `Message published: topic=${topic} text=${text}`);
      console.debug(this.getTime(), `Message published: topic=${topic}`);
    });
  }

  // Gracefully disconnects from Solace message router
  disconnect() {
    console.debug(this.getTime(), 'Disconnecting from Solace message router...');
    if (this.isConnected()) {
      try {
        this.client.disconnect();
        this.connected = false;
      } catch (error) {
        console.debug(this.getTime(), error.toString());
      }
    } else {
      console.debug(this.getTime(), 'Not connected to Solace message router.');
    }
  }

  publish(topic, messageText = '') {
    if (this.isConnected()) {
      const payload = new Paho.MQTT.Message(JSON.stringify(messageText));
      payload.destinationName = topic;
      try {
        this.client.send(payload);
        console.debug(this.getTime(), 'Message published.');
      } catch (error) {
        console.debug(this.getTime(), error.toString());
      }
    } else {
      console.debug(this.getTime(), 'Cannot publish because not connected to Solace message router.');
    }
  }

  subscribe(topicName, callback) {
    if (this.isConnected()) {
      const star = /\*/g;
      let fixTopicName = topicName.replace(star, '([A-Za-z0-9]+)*');
      const plus = /\+/g;
      fixTopicName = fixTopicName.replace(plus, '([A-Za-z0-9]+)*');
      const gt = />/g;
      fixTopicName = fixTopicName.replace(gt, '.*');
      const hash = /#/g;
      fixTopicName = fixTopicName.replace(hash, '.*');
      fixTopicName += '$';

      const subscribedTopic = Object.keys(this.callbacks).find(topic => fixTopicName === topic.regExStr);
      if (subscribedTopic && this.callbacks[fixTopicName].isSubscribed) {
        console.debug(this.getTime(), 'Already subscribed to "' + topicName + '" and ready to receive messages.');
      } else {
        console.debug(this.getTime(), 'Subscribing to topic: ' + topicName);
        const subscribeOptions = {};
        subscribeOptions.onSuccess = ((invocationContext) => {
          console.debug(this.getTime(), `Successfully subscribed to topic: ${topicName}`);
          return true;
        });
        subscribeOptions.onFailure = ((message) => {
          console.debug(this.getTime(), `Could not subscribe to topic: ${topicName}`);
          return false;
        });
        try {
          this.client.subscribe(topicName, subscribeOptions);
          this.callbacks[fixTopicName] = {
            name: topicName, regExStr: fixTopicName, callback, isSubscribed: true
          };
        } catch (error) {
          console.debug(this.getTime(), error.toString());
        }
      }
    } else {
      console.debug(this.getTime(), 'Cannot issue subscribe request because not connected to Solace message router.');
    }
  }

  unsubscribe(topicName) {
    if (this.isConnected()) {
      let fixTopicName = topicName.replaceAll('/', '\/');
      fixTopicName = fixTopicName.replaceAll('*', '.*');

      const subscribedTopic = Object.keys(this.callbacks).find(topic => fixTopicName === topic.regExStr);
      if (subscribedTopic) {
        console.debug(this.getTime(), 'Unsubscribing topic: ' + topicName);
        const unsubscribeOptions = {};
        unsubscribeOptions.onSuccess = ((invocationContext) => {
          console.debug(this.getTime(), `Successfully unsubscribed topic: ${topicName}`);
          return true;
        });
        unsubscribeOptions.onFailure = ((message) => {
          console.debug(this.getTime(), `Could not unsubscribe topic: ${topicName}`);
          return false;
        });
        try {
          this.client.unsubscribe(topicName, unsubscribeOptions);
          delete this.callbacks[fixTopicName];
        } catch (error) {
          console.debug(this.getTime(), error.toString());
        }
      }
    } else {
      console.debug(this.getTime(), 'Cannot issue unsubscribe request, because not connected to Solace message router.');
    }
  }

  onMessageArrived(message) {
    const topic = message.destinationName;
    console.log(this.getTime(), `${this.name}: Received message: on topic ` + topic);
    // console.log(this.getTime(), 'Received message: "' + message.getBinaryAttachment() + '", details:\n' + message.dump());

    const topics = Object.values(this.callbacks);
    let delivered = 0;
    for (let i = 0; i < topics.length; i++) {
      const subscription = topics[i];
      const regex = new RegExp(subscription.regExStr);
      if (regex.test(topic)) {
        subscription.callback(message);
        delivered++;
      }
    }

    if (!delivered) {
      console.debug(this.getTime(), 'No callback registered for topic ' + topic);
    }
  }
}

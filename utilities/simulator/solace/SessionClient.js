/* eslint-disable no-useless-escape */
/* eslint-disable no-plusplus */
const solaceModule = require('solclientjs'); // logging supported
const cconsole = require('./cconsole');
const shortHash = require('shorthash2');
require('dotenv').config();
const {
  SOLACE_URL, MSG_VPN, USER_NAME, PASSWORD
} = process.env;

class SessionClient {
  constructor(name, code, onConnectionSuccess, onConnectionError, onConnectionLost) {
    this.name = name;
    this.code = code;
    cconsole.log(this.name, 'Create SessionClient');
    // Initialize factory with the most recent API defaults
    const factoryProps = new solaceModule.SolclientFactoryProperties();
    factoryProps.profile = solaceModule.SolclientFactoryProfiles.version10;
    solaceModule.SolclientFactory.init(factoryProps);

    // enable logging to JavaScript console at WARN level
    // NOTICE: works only with ('solclientjs').debug
    solaceModule.SolclientFactory.setLogLevel(solaceModule.LogLevel.DEBUG);

    this.code = code;
    this.topics = [];
    this.callbacks = {};
    this.solace = solaceModule;
    this.onConnectionSuccess = onConnectionSuccess;
    this.onConnectionError = onConnectionError;
    this.onConnectionLost = onConnectionLost;
    this.session = null;
  }

  connect = async () => {
    this.init();
  }

  setOnConnectionSuccess = (onConnectionSuccess) => {
    this.onConnectionSuccess = onConnectionSuccess;
  }

  setOnConnectionError = (onConnectionError) => {
    this.onConnectionError = onConnectionError;
  }

  setOnConnectionLost = (onConnectionLost) => {
    this.onConnectionLost = onConnectionLost;
  }

  // Establishes connection to Solace message router
  init = () => {
    if (this.session !== null) {
      cconsole.log(this.name, 'Already connected.');
      return;
    }
    const hostUrl = SOLACE_URL;
    cconsole.log(this.name, 'Connecting to Solace message router using url: ' + hostUrl);
    const msgVpn = MSG_VPN;
    cconsole.log(this.name, 'Message VPN: ' + msgVpn);
    const username = USER_NAME;
    cconsole.log(this.name, 'Client username: ' + username);
    const password = PASSWORD;
    cconsole.log(this.name, 'Client password: ' + password);
    try {
      this.session = this.solace.SolclientFactory.createSession({
        url: hostUrl,
        vpnName: msgVpn,
        userName: username,
        password,
        clientName: 'trivia/' + this.code + '/' + this.name + '-' + shortHash(this.code + '-' + this.name + (new Date()).getTime())
      });
    } catch (error) {
      cconsole.log(this.name, `Error occurred: ${error.toString()}`);
    }

    this.session.on(this.solace.SessionEventCode.UP_NOTICE, (sessionEvent) => {
      cconsole.log(this.name, '=== Successfully connected and ready. ===');
      this.isReady = true;

      const topics = Object.values(this.callbacks);
      for (let i = 0; i < topics.length; i++) {
        const topic = topics[i];
        if (!topic.isSubscribed) {
          this.subscribe(topic.this.name, topic.callback);
          topic.isSubscribed = true;
        }
      }

      if (this.onConnectionSuccess) { this.onConnectionSuccess(); }
      return true;
    });
    this.session.on(this.solace.SessionEventCode.CONNECT_FAILED_ERROR, (sessionEvent) => {
      cconsole.log(this.name, 'Connection failed to the message router: ' + sessionEvent.infoStr
          + ' - check correct parameter values and connectivity!');
      if (this.onConnectionError) { this.onConnectionError(); }
      return false;
    });
    this.session.on(this.solace.SessionEventCode.DISCONNECTED, (sessionEvent) => {
      if (this.session !== null) {
        this.session.dispose();
        this.session = null;
      }
      cconsole.log(this.name, 'Disconnected.');
      if (this.onConnectionLost) { this.onConnectionLost(); }
    });
    this.session.on(this.solace.SessionEventCode.MESSAGE, (message) => {
      // cconsole.log(this.name, 'Message received');
      this.onMessageArrived(message);
    });
    this.session.on(this.solace.SessionEventCode.SUBSCRIPTION_ERROR, (sessionEvent) => {
      cconsole.log(this.name, 'Cannot subscribe to topic: ' + sessionEvent.correlationKey);
    });
    this.session.on(this.solace.SessionEventCode.SUBSCRIPTION_OK, (sessionEvent) => {
      cconsole.log(this.name, 'Successfully subscribed to topic: ' + sessionEvent.correlationKey);
      cconsole.log(this.name, '=== Ready to receive events. ===');
    });

    try {
      this.session.connect();
    } catch (error) {
      cconsole.log(this.name, `Error occurred: ${error.toString()}`);
    }
  };

  // Gracefully disconnects from Solace message router
  disconnect = () => {
    cconsole.log(this.name, 'Disconnecting from Solace message router...');
    if (this.session !== null) {
      try {
        this.session.disconnect();
      } catch (error) {
        cconsole.log(this.name, error.toString());
      }
    } else {
      cconsole.log(this.name, 'Not connected to Solace message router.');
    }
  };

  onMessageArrived = (message) => {
    const topic = message.getDestination();
    cconsole.log(this.name, 'Received message: on topic ' + topic.getName());
    // cconsole.log(this.name, 'Received message: "' + message.getBinaryAttachment() + '", details:\n' + message.dump());

    const topics = Object.values(this.callbacks);
    let delivered = 0;
    for (let i = 0; i < topics.length; i++) {
      const subscription = topics[i];
      const regex = new RegExp(subscription.regExStr);
      if (regex.test(topic.getName())) {
        subscription.callback(message);
        delivered++;
      }
    }

    if (!delivered) {
      cconsole.log(this.name, 'No callback registered for topic ' + topic.getName());
    }
  }

  subscribe = (topicName, callback) => {
    const star = /\*/g;
    let fixTopicName = topicName.replace(star, '([A-Za-z0-9]+)*');
    const plus = /\+/g;
    fixTopicName = fixTopicName.replace(plus, '([A-Za-z0-9]+)*');
    const gt = />/g;
    fixTopicName = fixTopicName.replace(gt, '.*');
    const hash = /#/g;
    fixTopicName = fixTopicName.replace(hash, '.*');
    fixTopicName += '$';

    if (this.session !== null && this.isReady) {
      const subscribedTopic = Object.keys(this.callbacks).find(topic => fixTopicName === topic.regExStr);
      if (subscribedTopic && this.callbacks[fixTopicName].isSubscribed) {
        cconsole.log(this.name, 'Already subscribed to "' + topicName + '" and ready to receive messages.');
      } else {
        cconsole.log(this.name, 'Subscribing to topic: ' + topicName);
        try {
          this.session.subscribe(
            this.solace.SolclientFactory.createTopicDestination(topicName),
            true, // generate confirmation when subscription is added successfully
            topicName, // use topic name as correlation key
            10000 // 10 seconds timeout for this operation
          );
          this.callbacks[fixTopicName] = {
            name: topicName, regExStr: fixTopicName, callback, isSubscribed: true
          };
        } catch (error) {
          cconsole.log(this.name, error.toString());
        }
      }
    } else {
      this.callbacks[fixTopicName] = {
        name: topicName, regExStr: fixTopicName, callback, isSubscribed: false
      };
      cconsole.log(this.name, 'Cannot subscribe because not connected to Solace message router, will try later when connection is established.');
    }
  };

  unsubscribe = (topicName) => {
    if (this.session !== null) {
      if (Object.keys(this.callbacks).indexOf(topicName) >= 0) {
        cconsole.log(this.name, 'Unsubscribing from topic: ' + topicName);
        try {
          this.session.unsubscribe(
            this.solace.SolclientFactory.createTopicDestination(topicName),
            true, // generate confirmation when subscription is removed successfully
            topicName, // use topic name as correlation key
            10000 // 10 seconds timeout for this operation
          );
          delete this.callbacks[topicName];
        } catch (error) {
          cconsole.log(this.name, error.toString());
        }
      } else {
        cconsole.log(this.name, 'Cannot unsubscribe because not subscribed to the topic "' + topicName + '"');
      }
    } else {
      cconsole.log(this.name, 'Cannot unsubscribe because not connected to Solace message router.');
    }
  };

  publish = (topic, messageText = '') => {
    if (this.session !== null) {
      const message = this.solace.SolclientFactory.createMessage();
      message.setDestination(this.solace.SolclientFactory.createTopicDestination(topic));
      message.setBinaryAttachment(JSON.stringify(messageText));
      message.setDeliveryMode(this.solace.MessageDeliveryModeType.DIRECT);
      cconsole.log(this.name, 'Publishing message "' + JSON.stringify(messageText) + '" to topic "' + topic + '"...');
      try {
        this.session.send(message);
        // cconsole.log(this.name, 'Message published.');
      } catch (error) {
        cconsole.log(this.name, error.toString());
      }
    } else {
      cconsole.log(this.name, 'Cannot publish because not connected to Solace message router.');
    }
  };
}

module.exports = SessionClient;

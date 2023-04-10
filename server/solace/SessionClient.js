/* eslint-disable no-useless-escape */
/* eslint-disable no-plusplus */
const shortHash = require('shorthash2');
const solaceModule = require('solclientjs'); // logging supported
require('dotenv').config();
const {
  SOLACE_URL, MSG_VPN, USER_NAME, PASSWORD
} = process.env;

class SessionClient {
  constructor(code) {
    console.log(this.getTime(), 'Create SessionClient');
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
    this.onConnectionSuccess = null;
    this.onConnectionError = null;
    this.onConnectionLost = null;
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

  getTime = () => {
    const now = new Date();
    const time = [('0' + now.getHours()).slice(-2), ('0' + now.getMinutes()).slice(-2),
      ('0' + now.getSeconds()).slice(-2)];
    return 'SESSION [' + time.join(':') + '] ';
  }

  // Establishes connection to Solace message router
  init = () => {
    if (this.session !== null) {
      console.log(this.getTime(), 'Already connected.');
      return;
    }
    const hostUrl = SOLACE_URL;
    console.log(this.getTime(), 'Connecting to Solace message router using url: ' + hostUrl);
    const msgVpn = MSG_VPN;
    console.log(this.getTime(), 'Message VPN: ' + msgVpn);
    const username = USER_NAME;
    console.log(this.getTime(), 'Client username: ' + username);
    const password = PASSWORD;
    console.log(this.getTime(), 'Client password: ' + password);
    try {
      this.session = this.solace.SolclientFactory.createSession({
        url: hostUrl,
        vpnName: msgVpn,
        userName: username,
        password,
        clientName: 'trivia/session-' + this.code + '/' + shortHash('-' + this.code + '-' + (new Date()).getMilliseconds() + '+')
      });
    } catch (error) {
      console.log(this.getTime(), `Error occurred: ${error.toString()}`);
    }

    this.session.on(this.solace.SessionEventCode.UP_NOTICE, (sessionEvent) => {
      console.log(this.getTime(), '=== Successfully connected and ready. ===');
      this.isReady = true;

      const topics = Object.values(this.callbacks);
      for (let i = 0; i < topics.length; i++) {
        const topic = topics[i];
        if (!topic.isSubscribed) {
          this.subscribe(topic.name, topic.callback);
          topic.isSubscribed = true;
        }
      }

      if (this.onConnectionSuccess) { this.onConnectionSuccess(); }
      return true;
    });
    this.session.on(this.solace.SessionEventCode.CONNECT_FAILED_ERROR, (sessionEvent) => {
      console.log(this.getTime(), 'Connection failed to the message router: ' + sessionEvent.infoStr
          + ' - check correct parameter values and connectivity!');
      if (this.onConnectionError) { this.onConnectionError(); }
      return false;
    });
    this.session.on(this.solace.SessionEventCode.DISCONNECTED, (sessionEvent) => {
      if (this.session !== null) {
        this.session.dispose();
        this.session = null;
      }
      console.log(this.getTime(), 'Disconnected.');
      if (this.onConnectionLost) { this.onConnectionLost(); }
    });
    this.session.on(this.solace.SessionEventCode.MESSAGE, (message) => {
      console.log(this.getTime(), 'Message received');
      this.onMessageArrived(message);
    });
    this.session.on(this.solace.SessionEventCode.SUBSCRIPTION_ERROR, (sessionEvent) => {
      console.log(this.getTime(), 'Cannot subscribe to topic: ' + sessionEvent.correlationKey);
    });
    this.session.on(this.solace.SessionEventCode.SUBSCRIPTION_OK, (sessionEvent) => {
      console.log(this.getTime(), 'Successfully subscribed to topic: ' + sessionEvent.correlationKey);
      console.log(this.getTime(), '=== Ready to receive events. ===');
    });

    try {
      this.session.connect();
    } catch (error) {
      console.log(this.getTime(), `Error occurred: ${error.toString()}`);
    }
  };

  // Gracefully disconnects from Solace message router
  disconnect = () => {
    console.log(this.getTime(), 'Disconnecting from Solace message router...');
    if (this.session !== null) {
      try {
        this.session.disconnect();
      } catch (error) {
        console.log(this.getTime(), error.toString());
      }
    } else {
      console.log(this.getTime(), 'Not connected to Solace message router.');
    }
  };

  onMessageArrived = (message) => {
    const topic = message.getDestination();
    console.log(this.getTime(), 'Received message: on topic ' + topic.getName());
    // console.log(this.getTime(), 'Received message: "' + message.getBinaryAttachment() + '", details:\n' + message.dump());

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
      console.log(this.getTime(), 'No callback registered for topic ' + topic.getName());
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
        console.log(this.getTime(), 'Already subscribed to "' + topicName + '" and ready to receive messages.');
      } else {
        console.log(this.getTime(), 'Subscribing to topic: ' + topicName);
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
          console.log(this.getTime(), error.toString());
        }
      }
    } else {
      this.callbacks[fixTopicName] = {
        name: topicName, regExStr: fixTopicName, callback, isSubscribed: false
      };
      console.log(this.getTime(), 'Cannot subscribe because not connected to Solace message router, will try later when connection is established.');
    }
  };

  unsubscribe = (topicName) => {
    if (this.session !== null) {
      if (Object.keys(this.callbacks).indexOf(topicName) >= 0) {
        console.log(this.getTime(), 'Unsubscribing from topic: ' + topicName);
        try {
          this.session.unsubscribe(
            this.solace.SolclientFactory.createTopicDestination(topicName),
            true, // generate confirmation when subscription is removed successfully
            topicName, // use topic name as correlation key
            10000 // 10 seconds timeout for this operation
          );
          delete this.callbacks[topicName];
        } catch (error) {
          console.log(this.getTime(), error.toString());
        }
      } else {
        console.log(this.getTime(), 'Cannot unsubscribe because not subscribed to the topic "' + topicName + '"');
      }
    } else {
      console.log(this.getTime(), 'Cannot unsubscribe because not connected to Solace message router.');
    }
  };

  publish = (topic, messageText = '') => {
    if (this.session !== null) {
      const message = this.solace.SolclientFactory.createMessage();
      message.setDestination(this.solace.SolclientFactory.createTopicDestination(topic));
      message.setBinaryAttachment(JSON.stringify(messageText));
      message.setDeliveryMode(this.solace.MessageDeliveryModeType.DIRECT);
      console.log(this.getTime(), 'Publishing message "' + JSON.stringify(messageText) + '" to topic "' + topic + '"...');
      try {
        this.session.send(message);
        console.log(this.getTime(), 'Message published.');
      } catch (error) {
        console.log(this.getTime(), error.toString());
      }
    } else {
      console.log(this.getTime(), 'Cannot publish because not connected to Solace message router.');
    }
  };
}

module.exports = SessionClient;

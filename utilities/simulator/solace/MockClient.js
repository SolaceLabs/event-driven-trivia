// MockClient.js
'use strict';
const cconsole = require('./cconsole');
const SessionClient = require('./SessionClient');
const randomSentence = require('random-sentence');
module.exports = class MockClient {
  constructor(name, mocks) {
    this.name = name;
    this.mocks = mocks;
    this.chatTimer = null;
    this.leaderBoardTimer = null;
    this.scoreCardTimer = null;
    this.timeLimit = 5000;
    this.client = new SessionClient(
      this.name,
      this.mocks.gameCode
    );

    this.client.setOnConnectionSuccess(this.solaceClientConnected);
    this.client.setOnConnectionError(this.solaceClientConnectionError);
    this.client.setOnConnectionLost(this.solaceClientDisconnected);
  
    this.client.connect();  
    this.gameEnded = false;
    this.stopped = false;
    cconsole.log(this.name,'Successfully connected to Broker');
  }

  solaceClientConnected = () => {
    cconsole.log(this.name,'In solaceClientConnected');
    cconsole.log(this.name,'Successfully connected to Broker');
    this.client.subscribe(`trivia/activity/user/${this.mocks.gameCode}/>`, this.gameActivityUpdate);
    this.client.subscribe(`trivia/activity/broadcast/${this.mocks.gameCode}`, this.gameActivityUpdate);
    this.client.subscribe(`trivia/broadcast/usercount/${this.mocks.gameCode}/*`, this.gameUserCountUpdate);
    this.client.subscribe(`trivia/broadcast/chat/${this.mocks.gameCode}`, this.gameChat);
    this.client.subscribe(`trivia/response/info/${this.mocks.gameCode}/${this.name}`, this.gameInfo);
    this.client.subscribe(`trivia/response/scorecard/${this.mocks.gameCode}/*`, this.gameScorecard);
    this.client.subscribe(`trivia/response/leaderboard/${this.mocks.gameCode}/*`, this.gameLeaderboard);
    this.client.subscribe(`trivia/response/validation/${this.mocks.gameCode}/${this.name}`, this.gameValidation);
    this.client.subscribe(`trivia/update/error/${this.mocks.gameCode}/*`, this.gameError);
    this.client.subscribe(`trivia/update/gameaborted/${this.mocks.gameCode}`, this.gameAbort);
    this.client.subscribe(`trivia/update/gameended/${this.mocks.gameCode}`, this.gameEnd);
    this.client.subscribe(`trivia/update/gamestarted/${this.mocks.gameCode}`, this.gameStart);
    this.client.subscribe(`trivia/update/question/${this.mocks.gameCode}/*`, this.gameQuestion);
    this.client.publish(`trivia/update/user/${this.mocks.gameCode}/${this.name}/CONNECTED`);
    this.client.publish(`trivia/query/info/${this.mocks.gameCode}/${this.name}`);
  }

  solaceClientDisconnected = () => {
    cconsole.log(this.name, `In solaceClientDisconnected`);
  }
  
  solaceClientConnectionError = () => {
    cconsole.log(this.name, `In solaceClientConnectionError`);
  }
  
  solaceClientConnectionError = () => {
    cconsole.log(this.name,'In solaceClientConnectionError');
  }

  gameError = (message) => {
    const payload = JSON.parse(message.payloadString);    
    cconsole.error(this.name, `Error: ${payload.message}`);
  }

  gameActivityUpdate = (message) => {
    cconsole.log(this.name, `In gameActivityUpdate`);
  }

  gameUserCountUpdate= (message) => {
    cconsole.log(this.name, `In gameUserCountUpdate`);
  }

  gameChat = (message) => {
    cconsole.log(this.name, `In gameChat`);
  }

  gameInfo = (message) => {
    cconsole.log(this.name, `In gameInfo`);
    const trivia = JSON.parse(message.getBinaryAttachment());
    let timeLimit = trivia.time_limit * 1000;
    this.timeLimit = timeLimit;
    if (this.mocks.chatCount) {
      this.chatTimer = setInterval(() => {
        this.client.publish(`trivia/update/chat/${this.mocks.gameCode}/${this.name}`, {
          name: this.name,
          message: randomSentence({words: 5}),
          emoji: false,
          timestamp: new Date().toISOString()
        });
      }, timeLimit);    
    }
    if (this.mocks.lbRefreshCount) {
      this.lbTimer = setInterval(() => {
        this.client.publish(`trivia/query/leaderboard/${this.mocks.gameCode}/${this.name}`);
      }, timeLimit);    
    }
    if (this.mocks.scRefreshCount) {
      this.scTimer = setInterval(() => {
        this.client.publish(`trivia/query/scorecard/${this.mocks.gameCode}/${this.name}`);
      }, timeLimit);    
    }

  }

  gameScorecard = (message) => {
    cconsole.log(this.name, `In gameScorecard`);
  }

  gameLeaderboard = (message) => {
    cconsole.log(this.name, `In gameLeaderboard`);
  }

  gameValidation = (message) => {
    cconsole.log(this.name, `In gameValidation`);
  }

  gameAbort = (message) => {
    cconsole.log(this.name, `In gameAbort`);
    if (this.chatTimer) clearInterval(this.chatTimer);
    if (this.lbTimer) clearInterval(this.lbTimer);
    if (this.scTimer) clearInterval(this.scTimer);
    this.gameEnded = true;
    if (!this.answerInProgress)
      this.stop();
  }

  gameEnd = (message) => {
    cconsole.log(this.name, `In gameEnd`);
    if (this.chatTimer) clearInterval(this.chatTimer);
    if (this.lbTimer) clearInterval(this.lbTimer);
    if (this.scTimer) clearInterval(this.scTimer);
    this.gameEnded = true;

    if (!this.answerInProgress)
      this.stop();
  }

  gameStart = (message) => {
    cconsole.log(this.name, `In gameStart`);
  }

  getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  gameQuestion = (message) => {
    cconsole.log(this.name, `In gameQuestion`);
    (async(message) => {
      cconsole.log(this.name, `In answerQuestion`);
      const question = JSON.parse(message.getBinaryAttachment());
      const waitTime = this.getRandomInt(1000, this.timeLimit);
      this.answerInProgress = true;
      setTimeout(async () => {
        let choice = this.getRandomInt(1, 4);
        const answer = {
          qno: question.qno,
          answered: true,
          answer: question['choice_' + choice],
          timing: waitTime
        };
        this.client.publish(`trivia/update/answer/${this.mocks.gameCode}/${this.name}/${question.qid}`, answer);
        this.answerInProgress = false;
        cconsole.log(this.name, `In answerQuestion done!`);
        if (this.gameEnded)
          await this.stop();
      }, this.getRandomInt(1000, waitTime))})(message);
  }
  
  stop = async () => {
    cconsole.log(this.name, `In stop, publishing disconnect`);
    this.client.publish(`trivia/update/user/${this.mocks.gameCode}/${this.name}/DISCONNECTED`);
    // await this.snooze(5000);

    this.client.disconnect();
    this.stopped = true;
  }

  snooze = (ms) => {
    // eslint-disable-next-line no-promise-executor-return
    return new Promise(resolve => setTimeout(resolve, ms));
  };
  
}
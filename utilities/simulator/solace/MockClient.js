/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable no-param-reassign */
/* eslint-disable no-shadow */
// MockClient.js

const randomSentence = require('random-sentence');
const cconsole = require('./cconsole');
const SessionClient = require('./SessionClient');
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
    cconsole.log(this.name, 'Successfully connected to Broker');
  }

  solaceClientConnected = () => {
    cconsole.log(this.name, 'In solaceClientConnected');
    cconsole.log(this.name, 'Successfully connected to Broker');

    this.client.subscribe(`trivia/${this.mocks.gameCode}/update/activity/${this.name}`, this.gameActivityUpdate);
    this.client.subscribe(`trivia/${this.mocks.gameCode}/broadcast/usercount/>`, this.gameUserCountUpdate);
    this.client.subscribe(`trivia/${this.mocks.gameCode}/broadcast/chat`, this.gameChat);
    this.client.subscribe(`trivia/${this.mocks.gameCode}/response/info/${this.name}`, this.gameInfo);
    this.client.subscribe(`trivia/${this.mocks.gameCode}/response/scorecard/${this.name}`, this.gameScorecard);
    this.client.subscribe(`trivia/${this.mocks.gameCode}/response/leaderboard/${this.name}`, this.gameLeaderboard);
    this.client.subscribe(`trivia/${this.mocks.gameCode}/response/getrank/${this.name}`, this.gameYourRank);
    this.client.subscribe(`trivia/${this.mocks.gameCode}/response/winner/${this.name}`, this.gameWinner);
    this.client.subscribe(`trivia/${this.mocks.gameCode}/update/error/*/${this.name}`, this.gameError);
    this.client.subscribe(`trivia/${this.mocks.gameCode}/broadcast/gamestarted`, this.gameStart);
    this.client.subscribe(`trivia/${this.mocks.gameCode}/broadcast/gameaborted`, this.gameAbort);
    this.client.subscribe(`trivia/${this.mocks.gameCode}/broadcast/gameended`, this.gameEnd);
    this.client.subscribe(`trivia/${this.mocks.gameCode}/broadcast/question/>`, this.gameQuestion);

    this.client.publish(`trivia/${this.mocks.gameCode}/update/user/${this.name}/CONNECTED`);
    this.client.publish(`trivia/${this.mocks.gameCode}/query/info/${this.name}`);
  }

  solaceClientDisconnected = () => {
    cconsole.log(this.name, 'In solaceClientDisconnected');
  }

  solaceClientConnectionError = () => {
    cconsole.log(this.name, 'In solaceClientConnectionError');
  }

  solaceClientConnectionError = () => {
    cconsole.log(this.name, 'In solaceClientConnectionError');
  }

  gameError = (message) => {
    const payload = JSON.parse(message.payloadString);
    cconsole.error(this.name, `Error: ${payload.message}`);
  }

  gameActivityUpdate = (message) => {
    cconsole.log(this.name, 'In gameActivityUpdate');
  }

  gameUserCountUpdate= (message) => {
    cconsole.log(this.name, 'In gameUserCountUpdate');
  }

  gameWinner= (message) => {
    cconsole.log(this.name, 'In gameWinner');
  }

  gameChat = (message) => {
    cconsole.log(this.name, 'In gameChat');
  }

  gameInfo = (message) => {
    cconsole.log(this.name, 'In gameInfo');
    const trivia = JSON.parse(message.getBinaryAttachment());
    const timeLimit = trivia.time_limit * 1000;
    this.timeLimit = timeLimit;
    if (this.mocks.chatCount) {
      this.chatTimer = setInterval(() => {
        this.client.publish(`trivia/${this.mocks.gameCode}/update/chat/${this.name}`, {
          name: this.name,
          message: randomSentence({ words: 5 }),
          emoji: false,
          timestamp: new Date().toISOString()
        });
      }, timeLimit);
    }
    if (this.mocks.lbRefreshCount) {
      this.lbTimer = setInterval(() => {
        this.client.publish(`trivia/${this.mocks.gameCode}/query/leaderboard/${this.name}`);
      }, timeLimit);
    }
    if (this.mocks.scRefreshCount) {
      this.scTimer = setInterval(() => {
        this.client.publish(`trivia/${this.mocks.gameCode}/query/scorecard/${this.name}`);
      }, timeLimit);
    }
  }

  gameScorecard = (message) => {
    cconsole.log(this.name, 'In gameScorecard');
  }

  gameLeaderboard = (message) => {
    cconsole.log(this.name, 'In gameLeaderboard');
  }

  gameYourRank = (message) => {
    cconsole.log(this.name, 'In gameYourRank');
  }

  gameValidation = (message) => {
    cconsole.log(this.name, 'In gameValidation');
  }

  gameAbort = (message) => {
    cconsole.log(this.name, 'In gameAbort');
    if (this.chatTimer) clearInterval(this.chatTimer);
    if (this.lbTimer) clearInterval(this.lbTimer);
    if (this.scTimer) clearInterval(this.scTimer);
    this.gameEnded = true;
    if (!this.answerInProgress) { this.stop(); }
  }

  gameEnd = (message) => {
    cconsole.log(this.name, 'In gameEnd');
    if (this.chatTimer) clearInterval(this.chatTimer);
    if (this.lbTimer) clearInterval(this.lbTimer);
    if (this.scTimer) clearInterval(this.scTimer);
    this.gameEnded = true;

    if (!this.answerInProgress) { this.stop(); }
  }

  gameStart = (message) => {
    cconsole.log(this.name, 'In gameStart');
  }

  getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  gameQuestion = (message) => {
    cconsole.log(this.name, 'In gameQuestion');
    (async (message) => {
      cconsole.log(this.name, 'In answerQuestion');
      const question = JSON.parse(message.getBinaryAttachment());
      const waitTime = this.getRandomInt(1000, this.timeLimit);
      this.answerInProgress = true;
      setTimeout(async () => {
        const choice = this.getRandomInt(1, 4);
        const answer = {
          qno: question.qno,
          answered: !!question.answer,
          answer: question['choice_' + choice],
          timing: waitTime
        };
        this.client.publish(`trivia/${this.mocks.gameCode}/update/answer/${this.name}/${question.qid}`, answer);
        this.answerInProgress = false;
        cconsole.log(this.name, 'In answerQuestion done!');
        if (this.gameEnded) { await this.stop(); }
      }, this.getRandomInt(1000, waitTime));
    })(message);
  }

  stop = async () => {
    cconsole.log(this.name, 'In stop, publishing disconnect');
    this.client.publish(`trivia/${this.mocks.gameCode}/update/user/${this.name}/DISCONNECTED`);

    // await this.snooze(5000);

    this.client.disconnect();
    this.stopped = true;
  }

  snooze = (ms) =>
    // eslint-disable-next-line no-promise-executor-return
    new Promise(resolve => setTimeout(resolve, ms))
  ;
};

/* eslint-disable no-plusplus */
require('dotenv').config();
const shortHash = require('shorthash2');
const chalk = require('chalk');
const MockClient = require('./solace/MockClient');
const { pickRandomName } = require('./solace/names');
const cconsole = require('./solace/cconsole');
const {
  getMockConfig, setMockConfig, resetMockConfig, printMockConfig
} = require('./config');

const clients = [];
const init = (data) => {
  console.log(data);
  const mocks = getMockConfig();
  mocks.gameCode = data.Code;
  console.log(chalk.green.bold(`Mock game code set to ${data.Code}`));
  setMockConfig(mocks);
  printMockConfig();
};

const setGameCode = (code) => {
  const mocks = getMockConfig();
  mocks.gameCode = code;
  console.log(chalk.green.bold(`Mock game code set to ${code}`));
  setMockConfig(mocks);
  printMockConfig();
};

const setChatCount = (count) => {
  const mocks = getMockConfig();
  mocks.chatCount = Number(count);
  console.log(chalk.green.bold(`Mock chat count set to ${count}`));
  setMockConfig(mocks);
  printMockConfig();
};

const setClientCount = (count) => {
  const mocks = getMockConfig();
  mocks.clientCount = Number(count);
  console.log(chalk.green.bold(`Mock client count set to ${count}`));
  setMockConfig(mocks);
  printMockConfig();
};

const setLeaderBoardRefresh = (count) => {
  const mocks = getMockConfig();
  mocks.lbRefreshCount = Number(count);
  console.log(chalk.green.bold(`Mock leader board refresh count set to ${count}`));
  setMockConfig(mocks);
  printMockConfig();
};

const setScoreCardRefresh = (count) => {
  const mocks = getMockConfig();
  mocks.scRefreshCount = Number(count);
  console.log(chalk.green.bold(`Mock score card refresh count set to ${count}`));
  setMockConfig(mocks);
  printMockConfig();
};

const resetMock = () => {
  console.log(chalk.green.bold('Mock  reset'));
  resetMockConfig();
  printMockConfig();
};

const reviewMock = () => {
  printMockConfig();
};

const startMock = () => {
  const mocks = getMockConfig();
  printMockConfig();
  if (!mocks.gameCode) {
    console.log(chalk.red.bold('Missing/Invalid game code'));
    return;
  }

  console.log(chalk.green.bold('Mock start...'));
  const names = [];
  for (let i = 0; i < mocks.clientCount; i++) {
    let name = shortHash(mocks.gameCode + '-' + pickRandomName() + (new Date()).getTime());
    while (names.includes(name)) {
      name = shortHash(mocks.gameCode + '-' + pickRandomName() + (new Date()).getTime());
    }
    names.push(name);
    const client = new MockClient(name, mocks);
    clients.push(client);
    cconsole.log(name, 'MockClient created');
  }

  setInterval(() => {
    let count = 0;
    for (let i = 0; i < clients.length; i++) {
      if (clients[i].stopped) {
        // cconsole.log(clients[i].name, 'MockClient stopped')
        count++;
      }
    }

    cconsole.log('END CHECK', count, clients.length);
    if (count === clients.length) {
      cconsole.log('END', 'Stopping Mock');
      process.exit(0);
    }
  }, 2000);
};

const stopMock = () => {
  console.log(chalk.green.bold('Mock stop...'));

  for (let i = 0; i < clients.length; i++) {
    clients[i].gameEnd();
  }
};

module.exports = {
  init,
  setChatCount,
  setClientCount,
  setLeaderBoardRefresh,
  setScoreCardRefresh,
  setGameCode,
  reviewMock,
  resetMock,
  startMock,
  stopMock
};

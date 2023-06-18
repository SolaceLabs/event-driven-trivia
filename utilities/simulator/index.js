#! /usr/bin/env node
const { program } = require('commander');
const { init, setChatCount, setClientCount, setLeaderBoardRefresh, setScoreCardRefresh, 
  reviewMock, resetMock, startMock, stopMock } = require('./commands');

require('dotenv').config();
console.log("PROCESS: " + process.pid);

process.on('SIGINT', function() {
  console.log("Caught interrupt signal");
  stopMock();
  process.exit();
});

program
  .command('init')
  .option('-code <code>', 'Game code')
  .description('Init mock with game code')
  .action(init);

program
  .command('clients <count>')
  .description('Set number of trivia clients')
  .action(setClientCount);

program
  .command('chat <count>')
  .description('Set number of chat messages to be published per client')
  .action(setChatCount);

program
  .command('lbrefresh <count>')
  .description('Set number of leader board refresh to be published per client')
  .action(setLeaderBoardRefresh);

program
  .command('screfresh <count>')
  .description('Set number of score card refresh to be published per client')
  .action(setScoreCardRefresh);

program
  .command('list')
  .description('Review mock')
  .action(reviewMock);

program
  .command('reset')
  .option('-name <name>', 'Reset Mock')
  .description('Reset Mock')
  .action(resetMock);

program
  .command('start')
  .description('Start Mock')
  .action(startMock);

program.parse();

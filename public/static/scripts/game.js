/* eslint-disable no-return-assign */
/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-mixed-operators */
/* eslint-disable no-shadow */
/* eslint-disable prefer-const */
/* eslint-disable no-plusplus */

// const { flip } = require("lodash");

/* eslint-disable no-undef */
const emojiRegex = /\p{Emoji}/u;
const INFO = 'info';
const WARN = 'warning';
const ERROR = 'error';
const SUCCESS = 'success';
const DEBUG = 'debug';

const isMobile = () => (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));

let flipdown;
let eventCount = 0;
let ctxLive;
let gameActivityChart;

function getTime() {
  const now = new Date();
  const time = [
    ('0' + now.getHours()).slice(-2),
    ('0' + now.getMinutes()).slice(-2),
    ('0' + now.getSeconds()).slice(-2)
  ];
  return time.join(':');
}

function getQueryParams(params, url) {
  const href = url;
  // this is an expression to get query strings
  const regexp = new RegExp('[?&]' + params + '=([^&#]*)', 'i');
  const qString = regexp.exec(href);
  return qString
    ? qString[1]
    : null;
}

function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}

function closeNicknameDialog() {
  document
    .getElementById('player-name-form')
    .style
    .display = 'none';
}

function updateHappening(message, type) {
  const logContent = document.getElementById('info-log-modal-content');
  const _class = 'sol-' + type;
  const _time = getTime();
  const temp = `<div class="w3-medium" style="margin-bottom: 3px">
                <span class="sol-log-timestamp">${_time}</span>
                <span class="${_class}">${type.toUpperCase()} </span> &nbsp;
                <span>${message}</span>
              </div>`;
  logContent.insertAdjacentHTML('afterbegin', temp);
  const objDiv = document.getElementById('info-log-modal-content');
  objDiv.scrollTop = objDiv.scrollHeight;
  console.log(_time + ': ' + message);
}

function updateCountDown(startAt, down = true) {
  const countDown = down
    ? (new Date(startAt).getTime() / 1000)
    : (new Date().getTime() / 1000);
    // Set up FlipDown
  if (!flipdown || !flipdown.initialised) {
    flipdown = new FlipDown(countDown)
      .start(down)
      .ifEnded(() => {
        updateHappening('The countdown has ended!', INFO);
      });
  }
}

function updateGameChat(message, controller = false) {
  const date = new Date(message.timestamp);
  const timestamp = date.toLocaleString('en-US', {
    weekday: 'short', // long, short, narrow
    day: 'numeric', // numeric, 2-digit
    year: 'numeric', // numeric, 2-digit
    month: 'short', // numeric, 2-digit, long, short, narrow
    hour: 'numeric', // numeric, 2-digit
    minute: 'numeric', // numeric, 2-digit
    second: 'numeric', // numeric, 2-digit
  });

  const temp = `<li class="w3-padding-2">
                  <div class="tooltip">` + (
    controller
      ? (message.name ? `<span class="w3-medium w3-padding-small" style="background-color: #fff">${message.name}</span>` : '')
      : `<span class="w3-medium w3-padding-small w3-black">${message.name}</span>`
  ) + `<span class="w3-medium">&nbsp;${message.message}</span>
                    <span class="tooltiptext">${timestamp}</span>
                  </div>
                </li>`;

  const gameChatList = document.querySelectorAll('.trivia-chat-list');
  gameChatList.forEach(el => el.insertAdjacentHTML('beforeend', temp));
  const gameChatArea = document.querySelectorAll('.trivia-chat-container');
  gameChatArea.forEach(el => el.scrollTop = el.scrollHeight);
}

function sendChatMessage(message) {
  const emoji = emojiRegex.test(message);

  updateHappening('Message: ' + message, INFO);
  updateHappening('Contains emoji: ' + emojiRegex.test(message), DEBUG);
  client.publish(`trivia/${window.gameCode}/update/chat/${window.nickName}`, {
    name: window.nickName,
    message,
    emoji,
    timestamp: new Date().toISOString()
  });
}

function gameError(message) {
  // `trivia/${window.gameCode}/update/error/+/${window.nickName}`
  updateHappening('Message received on gameError: ' + message.payloadString, ERROR);
  const trivia = JSON.parse(message.payloadString);
  const snackbar = document.getElementById('snackbar');
  snackbar.innerText = trivia.message;
  snackbar.className = 'show';
  setTimeout(() => { snackbar.className = snackbar.className.replace('show', ''); }, 3000);
  if (trivia.message === 'No Trivia found') {
    document.getElementById('trivia-not-available').style.display = 'block';
    document.getElementById('trivia-not-available').innerHTML = '<b><i class="fa fa-clock-o"></i>No Trivia Found!</b>';
    document.getElementById('trivia-controller').style.display = 'none';
    document.getElementById('trivia-controller').style.height = 0;
    document.getElementById('trivia-controller').style.marginTop = 0;
    client.disconnect();
  }
}

function gameActivityUpdate(message) {
  const payload = JSON.parse(message.payloadString);
  gameActivityChart.data.topics.push(payload.topic);
  gameActivityChart.data.categories.push(payload.category);

  gameActivityChart.data.labels.push('');
  gameActivityChart.data.datasets[0].data.push(payload.axis);
  gameActivityChart.data.datasets[0].pointBackgroundColor.push(payload.background);
  gameActivityChart.data.datasets[0].pointBorderColor.push('#00cc91');

  // re-render the chart
  if (++eventCount > 100) {
    gameActivityChart.data.labels.shift();
    gameActivityChart.data.topics.shift();
    gameActivityChart.data.categories.shift();
    gameActivityChart.data.datasets[0].pointBackgroundColor.shift();
    gameActivityChart.data.datasets[0].pointBorderColor.shift();
    gameActivityChart.data.datasets[0].data.shift();
  }
  gameActivityChart.update();
  updateHappening('Activity: [ ' + payload.topic + ', ' + payload.category + ' ]', INFO);
}

function gameRestart(message) {
  // `trivia/${window.gameCode}/broadcast/restart
  updateHappening('Message received on gameRestart: ' + message.destinationName, INFO);
  location.reload();
}

function gameInfo(message) {
  // `trivia/${window.gameCode}/response/info/${window.nickName}`
  updateHappening('Message received on gameInfo: ' + message.payloadString, INFO);
  const trivia = JSON.parse(message.payloadString);
  if (trivia.failed) {
    document.getElementById('spinner').classList.remove('show');
    document.getElementById('invalid_game').classList.add('show');
    document.getElementById('game_content').style.display = 'none';
    alert('Unknown Game: gameInfo', message.payloadString);

    client.disconnect();
    return;
  }

  window.no_of_questions = trivia.no_of_questions;
  document.getElementById('trivia-no-of-questions').innerHTML = trivia.no_of_questions;
  window.timeLimit = trivia.time_limit;
  document.getElementById('trivia-time-limit').innerHTML = trivia.time_limit + ' secs';

  // const scoreGrid = document.getElementById('your-score-grid');
  // for (let i = trivia.no_of_questions; i > 0; i--) {
  //   const temp = `<div class="validation-grid-item w3-black">${i}</div>`;
  //   scoreGrid.insertAdjacentHTML('afterbegin', temp);
  // }

  const titles = document.querySelectorAll('.trivia-title');
  for (let i = 0; i < titles.length; i++) {
    titles[i].innerHTML = trivia.name;
  }

  // load chat
  if (trivia.chat && trivia.chat.length) {
    trivia.chat.forEach(c => {
      updateGameChat(c);
    });
  }

  if (trivia.score) {
    document.getElementById('trivia-your-score').innerHTML = (
      !score.rank ? '-' : score.score);
    document.getElementById('trivia-your-rank').innerHTML = (
      !score.rank ? 'N/R' : score.rank);
  }

  if (trivia.status === 'NEW') {
    document.getElementById('trivia-not-available').style.display = 'block';
    document.getElementById('trivia-not-available').innerHTML = '<b><i class="fa fa-clock-o"></i> Sorry, Trivia is not yet ready!</b>';
    document.getElementById('trivia-controller').style.display = 'none';
    document.getElementById('trivia-controller').style.height = 0;
    document.getElementById('trivia-controller').style.marginTop = 0;
    // client.disconnect();
    return;
  }

  if (trivia.status === 'COMPLETED') {
    document.getElementById('trivia-not-available').style.display = 'block';
    document.getElementById('trivia-not-available').innerHTML = '<b><i class="fa fa-clock-o"></i> Trivia Completed</b>';
    document.getElementById('trivia-controller').style.display = 'none';
    document.getElementById('trivia-controller').style.height = 0;
    document.getElementById('trivia-controller').style.marginTop = 0;
    // client.disconnect();
    return;
  }

  if (trivia.status === 'ABORTED' || trivia.status === 'EXPIRED') {
    document.getElementById('trivia-not-available').style.display = 'block';
    document.getElementById('trivia-not-available').innerHTML = '<b><i class="fa fa-clock-o"></i> Sorry, Trivia either expired or was aborted</b>';
    document.getElementById('trivia-controller').style.display = 'none';
    document.getElementById('trivia-controller').style.height = 0;
    document.getElementById('trivia-controller').style.marginTop = 0;
    // client.disconnect();
    return;
  }

  document.getElementById('trivia-not-available').style.display = 'none';
  document.getElementById('trivia-not-available').height = 0;
  if (trivia.players) document.getElementById('trivia-participants').innerHTML = trivia.players.current;

  if (new Date(trivia.start_at).getTime() - new Date().getTime() < 0) {
    document.getElementById('count-down-tracker').style.display = 'none';
    document.getElementById('count-down-tracker').parentNode.classList.remove('w3-padding-large');
  } else {
    updateCountDown(trivia.start_at);
  }
}

function gameChat(message) {
  // `trivia/${window.gameCode}/broadcast/chat`
  updateHappening('Message received on gameChat: ' + message.payloadString, INFO);
  const msg = JSON.parse(message.payloadString);
  updateGameChat(msg);
}

function gameControllerChat(message) {
  updateHappening('Message received from controller: ' + message, INFO);
  const msg = JSON.parse(message);
  updateGameChat(msg, true);
}

async function endGame() {
  if (window.gameAborted) {
    console.log('Oops, Game Aborted');
  } else if (window.gameEnded) {
    console.log('Oops, Game Ended');
  }

  document.getElementById('trivia-modal').style.display = 'block';
  document.getElementById('trivia-modal-content').style.display = 'none';
  document.getElementById('trivia-modal-countdown').style.display = 'none';
  document.getElementById('tsparticles').style.display = 'block';

  await loadSnowPreset(tsParticles);
  await tsParticles.load('tsparticles', { preset: 'snow' });

  let temp;
  if (window.gameAborted) {
    temp = `<div id="fashion">
                <div>Sorry, the game was aborted.</div>
              </div>`;
  } else if (window.gameEnded) {
    temp = `<div id="fashion">
                <div>Sorry, the game has ended.</div>
                <div>You missed all the questions.</div>
                <div>Better luck next time!</div>
              </div>`;
  }
  window.gameEnded = false;
  window.gameAborted = false;
  window.missed = 0;
  window.currentQuestion = 0;
  window.questions = [];

  if (temp) {
    const placeholder = document.getElementById('tsparticles');
    placeholder.insertAdjacentHTML('beforeend', temp);
  }
}

function showNextQuestion() {
  if (window.gameEnded || window.gameAborted) {
    window.missed = window.questions.length - 1;
    window.currentQuestion = window.questions.length;
    endGame();
    return;
  }

  if (window.currentQuestion === 0 && window.questions.length > 1) {
    window.missed = window.questions.length - 1;
    window.currentQuestion = window.questions.length - 1;
  }

  let question = window.questions[window.currentQuestion++];
  console.log('Show question', question);

  if (!question.choice_3) {
    document.getElementById('trivia-question-choice-container-3').style.display = 'none';
  } else {
    document.getElementById('trivia-question-choice-container-3').style.display = 'block';
  }
  if (!question.choice_4) {
    document.getElementById('trivia-question-choice-container-4').style.display = 'none';
  } else {
    document.getElementById('trivia-question-choice-container-4').style.display = 'block';
  }

  const triviaAnswer = document.querySelectorAll('.trivia-answer');
  for (let i = 0; i < triviaAnswer.length; i++) {
    updateHappening('Choice' + i + ': ' + triviaAnswer[i].classList.toString(), INFO);
    triviaAnswer[i].classList.remove('active');
    triviaAnswer[i].classList.add('inactive');
  }

  document.getElementById('trivia-question-text').innerHTML = question.question;
  document.getElementById('trivia-question-number').innerHTML = question.qno;
  document.getElementById('trivia-question-choice-1').innerHTML = question.choice_1;
  document.getElementById('trivia-question-choice-2').innerHTML = question.choice_2;
  document.getElementById('trivia-question-choice-3').innerHTML = question.choice_3;
  document.getElementById('trivia-question-choice-4').innerHTML = question.choice_4;
  question.start = (new Date()).getTime();
  setTimer('.timer', question.time_limit, () => {
    console.log('Done current question');
    const question = window.questions[window.currentQuestion - 1];
    const answer = {
      qno: window.currentQuestion,
      answered: !!question.answer,
      answer: question.answer,
      timing: question.timing
    };
    client.publish(`trivia/${window.gameCode}/update/answer/${window.nickName}/${question.qid}`, answer);

    if (window.currentQuestion >= window.questions.length) {
      sleep(3000);
      client.publish(`trivia/${window.gameCode}/query/getrank/${window.nickName}`);

      console.log('All questions done');
      document.getElementById('trivia-modal').style.display = 'block';
      document.getElementById('trivia-modal-content').style.display = 'none';
      document.getElementById('trivia-modal-countdown').style.display = 'none';
      document.getElementById('tsparticles').style.display = 'block';

      const answered = window
        .questions
      // eslint-disable-next-line no-shadow
        .reduce((n, { answer }) => n + (
          answer
            ? 1
            : 0
        ), 0);
      const percent = Math.floor(100 * answered / window.questions.length);
      (async () => {
        if (percent >= 50) {
          await loadFireworksPreset(tsParticles);
          await tsParticles.load('tsparticles', { preset: 'fireworks' });
        } else {
          await loadSnowPreset(tsParticles);
          await tsParticles.load('tsparticles', { preset: 'snow' });
        }

        const temp = `
                    <div id="fashion">
                      <div>${window.missed && window.missed > 0
          ? 'You missed ' + window.missed + '!'
          : ''}</div>
                      <div>${percent === 0
          ? 'Better luck next time!'
          : 'Congrats! '} You answered ${answered} out of ${window.questions.length}!</div>
                    </div>
                    `;
        const placeholder = document.getElementById('tsparticles');
        placeholder.insertAdjacentHTML('beforeend', temp);
        // placeholder.style.height = '100vh';
      })();
    } else {
      showNextQuestion();
    }
  });
}

async function presentQuestions() {
  if (window.gameEnded || window.gameAborted) {
    endGame();
    return;
  }

  document.getElementById('trivia-modal-content').style.display = 'block';
  document.getElementById('trivia-modal-countdown').style.display = 'none';

  showNextQuestion();
}

function gameStart(message = undefined) {
  // `trivia/${window.gameCode}/broadcast/gamestarted`
  if (window.gameStarted) {
    console.log('Hmm... duplicate game start, ignored!');
    return;
  }
  if (message) {
    const payload = JSON.parse(message.payloadString);
    window.sessionId = payload.sessionId;
    updateHappening('Message received on gameStart' + message.payloadString, INFO);
    updatePregameCountDown(presentQuestions, 10000);
    window.gameStarted = true;
  } else {
    window.currentQuestion = 0;
    updateHappening('Mock game start', INFO);
    showNextQuestion();
  }
}

function submitForm() {
  const name = document.getElementById('winner-name').value;
  if (name.length === 0) {
    document.getElementById('form-error').innerHTML = 'Enter a valid name';
    document.getElementById('winner-name').focus();
    return;
  }
  const email = document.getElementById('winner-email').value;
  const filter = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (!filter.test(email)) {
    document.getElementById('form-error').innerHTML = 'Enter a valid email';
    document.getElementById('winner-email').focus();
    return;
  }

  document.getElementById('ranktile').classList.remove('blink');
  document.getElementById('ranktilespan').classList.remove('blinkspan');
  document.getElementById('winnerForm').style.display = 'none';
  window.collected = true;
  client.publish(`trivia/${window.gameCode}/update/winner/${window.nickName}`, { name, email, ...window.score });
}

function closeForm() {
  document.getElementById('winnerForm').style.display = 'none';
}

function collectInfo() {
  if (!window.collect || window.collected) {
    return;
  }

  document.getElementById('winnerForm').style.display = 'block';
}

updatePregameCountDown = (callback, ts, midway = false) => {
  if (window.gameEnded || window.gameAborted) {
    endGame();
    return;
  }

  document.getElementById('game_content').style.display = 'none';
  document.getElementById('trivia-modal-content').style.display = 'none';
  document.getElementById('trivia-modal').style.display = 'block';
  document.getElementById('trivia-modal-countdown').style.display = 'block';

  if (midway) {
    document.querySelector('#refresh-warning-footer').style.display = 'block';
    document.querySelector('#refresh-warning-footer').innerHTML = 'Game is in progress, joining you...';
  }

  const timer = new Timer(
    ts,
    document.getElementById('trivia-modal-countdown')
  );
  timer.start(callback);
};

function gameEnd(message) {
  // `trivia/${window.gameCode}/broadcast/gameended`
  const question = JSON.parse(message.payloadString);

  if (window.gameStarted && question.sessionId === window.sessionId) {
    updateHappening('Message received on gameEnd' + message.payloadString, INFO);
    window.gameEnded = true;
  }
}

function gameAbort(message) {
  // `trivia/${window.gameCode}/broadcast/gameaborted`
  const question = JSON.parse(message.payloadString);

  if (window.gameStarted && question.sessionId === window.sessionId) {
    updateHappening('Message received on gameAbort' + message.payloadString, ERROR);
    window.gameEnded = true;
    window.gameAborted = true;
  }
}

function gameScorecard(message) {
  // `trivia/${window.gameCode}/response/scorecard/${window.nickName}`
  updateHappening('Message received on gameScorecard' + message.payloadString, INFO);
  const payload = JSON.parse(message.payloadString);
  const table = document.getElementById('trivia-score-card-table');
  let first = table.firstElementChild;
  while (first) {
    first.remove();
    first = table.firstElementChild;
  }
  payload.answers.forEach(entry => {
    const cAnswered = entry.answered ? '#47AA36' : '#FF404C';
    const cCorrect = entry.answered ? (entry.correct ? '#3d714c' : '#84738') : '#A9A9A9';
    const answered = entry.answered ? (entry.correct
      ? '<td><span style="color: green">Correct</span></td>'
      : '<td><span style="color: red">Wrong</span></td>')
      : '<td><span style="color: gray">-</span></td>';

    const item = `<tr>
                  <td><span class="ranking">${entry.qno}</span></td>
                  <td><span class="w3-padding-small w3-border " style="background-color: ${cAnswered}; color: #fff">
                    ${entry.answered ? 'Yes' : 'No'}
                  </span></td>
                  ${answered}
                  <td>${entry.score ? entry.score : '-'}</td>
                </tr>`;
    table.insertAdjacentHTML('beforeend', item);
    return entry;
  });
}

function gameQuestion(message) {
  // `trivia/${window.gameCode}/broadcast/question/#`

  const question = JSON.parse(message.payloadString);

  if (window.gameStarted && question.sessionId === window.sessionId) {
    updateHappening('Message received on gameQuestion' + message.payloadString, INFO);
    question.timestamp = Date.now();
    window.questions.push(question);
  }
}

function exitTrivia() {
  if (window.exited) return;

  document.getElementById('count-down-tracker').style.display = 'none';
  document.getElementById('count-down-tracker').parentNode.classList.remove('w3-padding-large');

  const flipDown = document.querySelector('#flipdown');
  if (flipDown) {
    const clonedFlipDown = flipDown.cloneNode(false);
    const flipDownParent = flipDown.parentNode;
    flipDownParent.removeChild(flipDown);
  }
  document.getElementById('trivia-modal').style.display = 'none';
  document.getElementById('game_content').style.display = 'block';
  client.publish(`trivia/${window.gameCode}/query/leaderboard/${window.nickName}`);
  client.publish(`trivia/${window.gameCode}/query/scorecard/${window.nickName}`);
  if (window.gameEnded) {
    client.publish(`trivia/${window.gameCode}/query/winner/${window.nickName}`);
  }

  window.gameEnded = false;
  window.gameAborted = false;
  window.missed = 0;
  window.currentQuestion = 0;
  window.questions = [];
  window.sessionId = false;
  window.exited = true;

  if (window.gameAborted) {
    location.reload();
  }
}

function gameUserCountUpdate(message) {
  // `trivia/${window.gameCode}/broadcast/usercount/#`
  const topic = message.destinationName;
  const parts = topic.split('/');
  const count = parts[4];

  updateHappening('Message received on userUpdate - Count: ' + count, INFO);
  document.getElementById('trivia-participants').innerHTML = count;
}

function gameYourRank(message) {
  // `trivia/${window.gameCode}/response/getrank/${window.nickName}`
  updateHappening('Message received on gameRank' + message.payloadString, INFO);
  const score = JSON.parse(message.payloadString);

  document.getElementById('trivia-your-score')
    .innerHTML = (
      !score.rank
        ? '-'
        : score.score
    );
  document.getElementById('trivia-your-rank')
    .innerHTML = (
      !score.rank
        ? 'N/R'
        : score.rank
    );

  setTimeout(exitTrivia, 15000);
}

function gameWinner(message) {
  // `trivia/${window.gameCode}/response/winner/${window.nickName}`
  if (window.collected) return;

  updateHappening('Message received on winner' + message.payloadString, INFO);
  const score = JSON.parse(message.payloadString);

  document.getElementById('ranktile').classList.add('blink');
  document.getElementById('ranktilespan').classList.add('blinkspan');
  document.querySelector('#refresh-warning-footer').style.display = 'block';
  document.querySelector('#refresh-warning-footer').innerHTML = 'Congratulations, you made it to Top ' + score.rank + ' - Click on 🏆 to claim your prize!';
  window.collect = true;
  window.score = score;
  setTimeout(() => {
    document.querySelector('#refresh-warning-footer').style.display = 'none';
  }, 5000);
}

function gameLeaderboard(message) {
  // `trivia/${window.gameCode}/response/leaderboard/#`
  updateHappening('Message received on gameLeaderboard' + message.payloadString, INFO);
  const ranks = JSON.parse(message.payloadString);
  const table = document.getElementById('trivia-leader-board-table');
  let first = table.firstElementChild;
  while (first) {
    first.remove();
    first = table.firstElementChild;
  }

  ranks.map(entry => {
    if (entry.player === window.nickName) {
      document.getElementById('trivia-your-rank')
        .innerHTML = (
          !entry.rank
            ? 'N/R'
            : entry.rank
        );
      document.getElementById('trivia-your-score')
        .innerHTML = (
          !entry.rank
            ? '-'
            : entry.score
        );
    }

    const name = (entry.player !== window.nickName)
      ? `<td>${entry.player}</td>`
      : `<td>${entry.player} <span class="player-name">you</span></td>`;

    const item = `<tr>
                  <td><span class="ranking">${entry.rank}</span></td>
                  ${name}
                  <td>
                    <div class="w3-light-grey w3-border">
                      <div class="w3-border-right" style="background-color:#47AA36; height:24px;width:${100 * entry.corrects / window.no_of_questions}%">
                        <span class="w3-transparent w3-text-white small" >${entry.corrects}/${window.no_of_questions}</span>
                      </div>
                    </div>
                  </td>
                  <td><span class="w3-padding-small w3-purple w3-border w3-purple w3-border ">${entry.score}</span></td>
                </tr>`;
    table.insertAdjacentHTML('beforeend', item);
    return entry;
  });
}

function solaceClientConnected() {
  updateHappening('In solaceClientConnected', INFO);
  updateHappening('Successfully connected to Broker', SUCCESS);
  updateHappening('Query Params: ' + getQueryParams('game', location.href), DEBUG);
  if (client.connected) {
    document.getElementById('spinner').classList.remove('show');
    document.getElementById('game_content').classList.remove('hide');
    document.getElementById('game_content').classList.add('show');

    client.subscribe(`trivia/${window.gameCode}/update/activity/${window.nickName}`, gameActivityUpdate);
    // client.subscribe(`trivia/${window.gameCode}/broadcast/activity`, gameActivityUpdate);
    client.subscribe(`trivia/${window.gameCode}/broadcast/usercount/#`, gameUserCountUpdate);
    client.subscribe(`trivia/${window.gameCode}/broadcast/chat`, gameChat);
    client.subscribe(`trivia/${window.gameCode}/broadcast/restart`, gameRestart);
    client.subscribe(`trivia/${window.gameCode}/response/info/${window.nickName}`, gameInfo);
    client.subscribe(`trivia/${window.gameCode}/response/scorecard/${window.nickName}`, gameScorecard);
    client.subscribe(`trivia/${window.gameCode}/response/leaderboard/${window.nickName}`, gameLeaderboard);
    client.subscribe(`trivia/${window.gameCode}/response/getrank/${window.nickName}`, gameYourRank);
    client.subscribe(`trivia/${window.gameCode}/response/winner/${window.nickName}`, gameWinner);
    client.subscribe(`trivia/${window.gameCode}/update/error/+/${window.nickName}`, gameError);
    client.subscribe(`trivia/${window.gameCode}/broadcast/gamestarted`, gameStart);
    client.subscribe(`trivia/${window.gameCode}/broadcast/gameaborted`, gameAbort);
    client.subscribe(`trivia/${window.gameCode}/broadcast/gameended`, gameEnd);
    client.subscribe(`trivia/${window.gameCode}/broadcast/question/#`, gameQuestion);

    client.publish(`trivia/${window.gameCode}/update/user/${window.nickName}/CONNECTED`);

    if (client.reconnect) {
      return;
    }

    client.publish(`trivia/${window.gameCode}/query/info/${window.nickName}`);
  }
}

function solaceClientDisconnected() {
  updateHappening('In solaceClientDisconnected', INFO);
}

function solaceClientConnectionError() {
  updateHappening('In solaceClientConnectionError', ERROR);
  document.getElementById('spinner').classList.remove('show');
  document.getElementById('could_not_connect_to_broker').classList.add('show');
}

function setup() {
  try {
    document.getElementById('player-id').innerHTML = 'Hi, ' + window.nickName;
    document.getElementById('player-id').style.padding = '3px';
    document.getElementById('game_content').classList.add('hide');
    document.getElementById('spinner').classList.add('show');

    const gameCode = getQueryParams('code', location.href);
    updateHappening('Query Params: ' + location.href + ', ' + gameCode, DEBUG);
    if (!gameCode) {
      document.getElementById('spinner').classList.remove('show');
      document.getElementById('spinner').classList.add('hide');
      document.getElementById('invalid_game').classList.add('show');

      updateHappening('Error: Unknown or missing game code', ERROR);
      alert('Unknown Game: setup');

      return;
    }

    window.gameCode = gameCode;
    window.type = 'player';
    window.questions = [];
    window.currentQuestion = 0;
    window.timeLimit = 0;

    client = new SolaceClient(
      window.nickName,
      window.gameCode,
      window.type,
      solaceClientConnected,
      solaceClientConnectionError,
      solaceClientDisconnected
    );
    client.connect();

    updateHappening('Successfully connected to Broker', INFO);

    document.querySelector('#refresh-warning-footer').style.display = 'block';
    document.querySelector('#refresh-warning-footer').innerHTML = 'Do not refresh, a refresh would interrupt/abandon the Trivia!';
    setTimeout(() => {
      document.querySelector('#refresh-warning-footer').style.display = 'none';
    }, 5000);
  } catch (error) {
    updateHappening('Error: ' + error.message, ERROR);
  }
}

function updatePlayerName() {
  const nickName = document.getElementById('nickname').value;
  if (nickName && nickName.length) {
    window.nickName = nickName;
    document.getElementById('player-id').innerHTML = 'Hi, ' + window.nickName;
    document.getElementById('player-id').style.padding = '3px';
    document.getElementById('player-name-form').style.display = 'none';
    // setup();
    closeNicknameDialog();
  }
}

function randomPlayerName() {
  document.getElementById('player-id').innerHTML = 'Hi, ' + window.nickName;
  document.getElementById('player-id').style.padding = '3px';
  document.getElementById('player-name-form').style.display = 'none';
  setup();
  closeNicknameDialog();
}

function openNicknameDialog() {
  document.getElementById('player-name-form').style.display = 'block';
}

window.addEventListener('beforeunload', (e) => {
  let confirmationMessage = '\o/';
  (e || window.event).returnValue = confirmationMessage; // Gecko + IE, Webkit, Safari, Chrome
  console.log('before unload', confirmationMessage);
  client.publish(`trivia/${window.gameCode}/update/user/${window.nickName}/DISCONNECTED`);
  return confirmationMessage;
});

window.addEventListener('load', () => {
  console.log('IsMobile', isMobile());
  if (isMobile()) {
    const hideButtons = document.querySelectorAll('.not-for-mobile');
    hideButtons.forEach(el => el.style.display = 'none');
  }

  const triviaAnswer = document.querySelectorAll('.trivia-answer');
  triviaAnswer.forEach(item => {
    item.addEventListener('click', (e) => {
      for (let i = 0; i < triviaAnswer.length; i++) {
        triviaAnswer[i].classList.remove('inactive');
        triviaAnswer[i].classList.remove('active');
      }
      item.classList.add('active');
      const qno = document.querySelector('#trivia-question-number').innerHTML;
      window.questions[qno - 1].answer = e.target.innerHTML;
      window.questions[qno - 1].end = (new Date()).getTime();
      window.questions[qno - 1].timing = window.questions[qno - 1].end - window.questions[qno - 1].start;

      console.log('You responded to question #' + qno + ' in ' + window.questions[qno - 1].timing + ' ticks!');
      const speed = Math.floor(
        100 * window.questions[qno - 1].timing / (window.timeLimit * 1000)
      );
      let message = 'Awesome, you got fast fingers 😎';
      if (speed >= 75) {
        message = 'Fast fingers get you high scores 😀';
      } else if (speed >= 50) {
        message = 'Not bad, keep it up 👍';
      } else if (speed >= 25) {
        message = 'Nice work with the clicks 👏';
      }
      gameControllerChat(JSON.stringify({
        name: '',
        message: 'Q' + qno + ': ' + message + ' - ' + window
          .questions[qno - 1]
          .timing + ' ticks!',
        emoji: true,
        timestamp: new Date().toISOString()
      }));
    });
  });

  document.querySelector('#trivia-leaderboard-load').addEventListener('click', () => {
    client.publish(`trivia/${window.gameCode}/query/leaderboard/${window.nickName}`);
  });

  document.querySelector('#trivia-scorecard-load').addEventListener('click', () => {
    client.publish(`trivia/${window.gameCode}/query/scorecard/${window.nickName}`);
  });

  triviaGameChatEmojiBtn.addEventListener('click', () => {
    gamePicker.togglePicker(triviaGameChatEmojiBtn);
  });

  ctxLive = document.getElementById('trivia-activity-canvas');
  gameActivityChart = new Chart(ctxLive, {
    type: 'line',
    data: {
      topics: [],
      categories: [],
      labels: [],
      datasets: [{
        data: [],
        borderWidth: 2,
        borderColor: '#00c0ef',
        label: 'Event Class',
        fill: false,
        pointRadius: 7,
        pointHoverRadius: 7,
        pointBackgroundColor: [],
        pointBorderColor: [],
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      title: {
        display: true,
        text: 'Events',
      },
      legend: {
        display: false
      },
      scales: {
        xAxes: [{
          beginAtZero: true
        }],
        yAxes: [{
          ticks: {
            beginAtZero: true,
            display: false
          }
        }]
      },
      tooltips: {
        callbacks: {
          title(t, d) { return 'Event: ' + d.topics[t[0].index]; },
          label(t, d) { return 'Category: ' + d.categories[t.index]; }
        }
      }
    }
  });
});

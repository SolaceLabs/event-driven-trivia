/* eslint-disable no-restricted-globals */
/* eslint-disable no-mixed-operators */
/* eslint-disable no-plusplus */
/* eslint-disable no-return-assign */
/* eslint-disable no-undef */
/* eslint-disable no-param-reassign */

const MQTT_HOST = 'mr-connection-jbh9h93b8id.messaging.solace.cloud';
const MQTT_PORT = 8443;
const MQTT_USER_NAME = 'solace-cloud-client';
const MQTT_PASSWORD = 'ucjt83ft2a49r3uqq5oolepqg0';

// const MQTT_HOST = 'localhost';
// const MQTT_PORT = 8000;
// const MQTT_USER_NAME = 'admin';
// const MQTT_PASSWORD = 'admin';

const emojiRegex = /\p{Emoji}/u;
const INFO = 'info';
const WARN = 'warning';
const ERROR = 'error';
const SUCCESS = 'success';
const DEBUG = 'debug';

const isMobile = () => (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));

const stats = {
  receive: {},
  send: {}
};

let client;
let controllerStartTimer;
let eventCount = 0;
let ctxActivityLive;
let gameActivityChart;
let ctxPerformanceLive;
let gamePerformanceChart;

function getQuestionCount() {
  return window.no_of_questions ? window.no_of_questions : 0;
}

function getQuestionLabels() {
  const count = window.no_of_questions ? window.no_of_questions : 0;
  const labels = [];
  for (i = 0; i < count; i++) labels.push('Q' + (i + 1));
  return labels;
}

function getQuestionDefaults() {
  const count = window.no_of_questions ? window.no_of_questions : 0;
  const defaults = [];
  for (i = 0; i < count; i++) defaults.push(0);
  return defaults;
}

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
  new FlipDown(countDown)
    .start(down)
    .ifEnded(() => {
      updateHappening('The countdown has ended!', INFO);
    });
}

function updateGameChat(message, controller = false) {
  // `trivia/update/chat/${window.gameCode}`
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
      ? `<span class="w3-medium w3-padding-small" style="background-color: #fff">${message.name}</span>`
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

function submitAdminCode() {
  const adminCode = document
    .getElementById('admincode')
    .value;
  if (adminCode && adminCode.length) {
    client.publish(`trivia/query/validation/${window.gameCode}/${window.nickName}`, { hash: adminCode });
    window.adminCode = adminCode;
    document.getElementById('admin-confirmation-form').style.display = 'none';
    document.getElementById('spinner').classList.add('show');
  } else {
    document.querySelector('#admin-confirmation-status').innerHTML = 'Enter a valid Trivia Admin code';
  }

  controllerStartTimer = setTimeout(() => {
    const visible = document.getElementById('spinner').classList.contains('show');
    if (visible) {
      // document.getElementById("spinner").classList.remove("show");
      document.getElementById('invalid_game').classList.add('show');
    }
  }, 10000);
}

function sendChatMessage(message) {
  const emoji = emojiRegex.test(message);

  updateHappening('Message: ' + message, INFO);
  updateHappening('Contains emoji: ' + emojiRegex.test(message), DEBUG);
  client.publish(`trivia/update/chat/${window.gameCode}/${window.nickName}`, {
    name: window.nickName,
    message,
    emoji,
    timestamp: new Date().toISOString()
  });
}

function showSnack(message) {
  const snackbar = document.getElementById('snackbar');
  snackbar.innerText = message;
  snackbar.className = 'show';
  setTimeout(() => { snackbar.className = snackbar.className.replace('show', ''); }, 3000);
}

function gameError(message) {
  // `trivia/update/error/${window.gameCode}/+`
  updateHappening('Message received on gameError: ' + message.destinationName, ERROR);
  const trivia = JSON.parse(message.payloadString);
  showSnack(trivia.message);
  if (trivia.message === 'No Trivia found') {
    document.getElementById('trivia-not-available').style.display = 'block';
    document.getElementById('trivia-not-available').innerHTML = '<b><i class="fa fa-clock-o"></i> No Trivia found!</b>';
    document.getElementById('trivia-controller').style.display = 'none';
    document.getElementById('trivia-controller').style.height = 0;
    document.getElementById('trivia-controller').style.marginTop = 0;
    document.getElementById('trivia-progress-controller').style.display = 'none';
    document.getElementById('trivia-progress-controller').style.height = 0;
    client.disconnect();
  }
}

function gameUserCountUpdate(message) {
  // `trivia/broadcast/usercount/${window.gameCode}/+`
  const topic = message.destinationName;
  const parts = topic.split('/');
  const count = parts[4];

  updateHappening('Message received on userUpdate - Count: ' + count, INFO);
  document.getElementById('trivia-participants').innerHTML = count;
}

function statsUpdate(action) {
  const table = action === 'send' ? document.getElementById('trivia-stats-sent-table') : document.getElementById('trivia-stats-received-table');
  let first = table.firstElementChild;
  while (first) {
    first.remove();
    first = table.firstElementChild;
  }

  Object.keys(stats[action]).forEach(key => {
    const item = `<tr>
                  <td>${key}</td>
                  <td>${stats[action][key]}</td>
                </tr>`;
    table.insertAdjacentHTML('beforeend', item);
  });
}

function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}

function gameActivityUpdate(message) {
  const payload = JSON.parse(message.payloadString);
  const selected = (!window.eventGroups || !window.eventGroups.length) ? [payload.category] : window.eventGroups.filter(g => g.selected).map(gp => gp.category);
  if (selected.indexOf(payload.category) < 0) return;

  gameActivityChart.data.topics.push(payload.topic);
  gameActivityChart.data.categories.push(payload.category);

  gameActivityChart.data.labels.push('');
  gameActivityChart.data.datasets[0].data.push(payload.axis);
  gameActivityChart.data.datasets[0].pointBackgroundColor.push(payload.background);
  gameActivityChart.data.datasets[0].pointBorderColor.push('#00cc91');

  // re-render the chart
  if (++eventCount > 50) {
    gameActivityChart.data.labels.shift();
    gameActivityChart.data.topics.shift();
    gameActivityChart.data.categories.shift();
    gameActivityChart.data.datasets[0].pointBackgroundColor.shift();
    gameActivityChart.data.datasets[0].pointBorderColor.shift();
    gameActivityChart.data.datasets[0].data.shift();
  }
  // sleep(200);
  gameActivityChart.update();
  updateHappening('Activity: [ ' + payload.topic + ', ' + payload.topic + ', ' + payload.category + ' ]', INFO);

  Object.keys(stats[payload.action]).includes(payload.category)
    ? stats[payload.action][payload.category] += 1
    : stats[payload.action][payload.category] = 1;
  statsUpdate(payload.action);
}

function gamePerformanceUpdate(message) {
  // `trivia/response/performance/${window.gameCode}/+`
  const payload = JSON.parse(message.payloadString);
  // gamePerformanceChart.data.labels = Object.keys(payload);
  const questions = Object.keys(payload);
  gamePerformanceChart.data.labels = questions.map(q => 'Q' + q);
  gamePerformanceChart.data.datasets[0].data = [];
  gamePerformanceChart.data.datasets[1].data = [];
  questions.forEach(q => {
    answer = payload[q];
    gamePerformanceChart.data.datasets[0].data.push(answer.corrects);
    gamePerformanceChart.data.datasets[1].data.push(answer.incorrects);
  });
  gamePerformanceChart.update();
  updateHappening('Performance: [ ' + payload.topic + ', ' + payload.category + ' ]', INFO);
}

function gameRestart(message) {
  // `trivia/broadcast/restart/${window.gameCode}
  updateHappening('Message received on gameRestart: ' + message.destinationName, INFO);
  location.reload();
}

function gameInfo(message) {
  // `trivia/response/info/${window.gameCode}/${window.nickName}
  updateHappening('Message received on gameInfo: ' + message.destinationName, INFO);
  const trivia = JSON.parse(message.payloadString);

  if (trivia.failed) {
    document.getElementById('spinner').classList.remove('show');
    document.getElementById('invalid_game').classList.add('show');
    document.getElementById('game_content').style.display = 'none';

    client.disconnect();
    return;
  }

  window.no_of_questions = trivia.no_of_questions;
  document.getElementById('trivia-no-of-questions').innerHTML = trivia.no_of_questions;
  window.timeLimit = trivia.time_limit;
  document.getElementById('trivia-time-limit').innerHTML = trivia.time_limit + ' secs';
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

  if (trivia.status === 'NEW') {
    document.getElementById('trivia-not-available').style.display = 'block';
    document.getElementById('trivia-not-available').innerHTML = '<b><i class="fa fa-clock-o"></i> Sorry, Trivia is not yet ready!</b>';
    document.getElementById('trivia-controller').style.display = 'none';
    document.getElementById('trivia-controller').style.height = 0;
    document.getElementById('trivia-controller').style.marginTop = 0;
    document.getElementById('trivia-progress-controller').style.display = 'none';
    document.getElementById('trivia-progress-controller').style.height = 0;
    // client.disconnect();
    return;
  }

  if (trivia.status === 'COMPLETED') {
    document.getElementById('trivia-not-available').style.display = 'block';
    document.getElementById('trivia-not-available').innerHTML = '<b><i class="fa fa-clock-o"></i> Trivia Completed</b>';
    document.getElementById('trivia-controller').style.display = 'none';
    document.getElementById('trivia-controller').style.height = 0;
    document.getElementById('trivia-controller').style.marginTop = 0;
    document.getElementById('trivia-progress-controller').style.display = 'none';
    document.getElementById('trivia-progress-controller').style.height = 0;
    // client.disconnect();
    return;
  }

  if (trivia.status === 'ABORTED' || trivia.status === 'EXPIRED') {
    document.getElementById('trivia-not-available').style.display = 'block';
    document.getElementById('trivia-not-available').innerHTML = '<b><i class="fa fa-clock-o"></i> Sorry, Trivia either expired or was aborted</b>';
    document.getElementById('trivia-controller').style.display = 'none';
    document.getElementById('trivia-controller').style.height = 0;
    document.getElementById('trivia-controller').style.marginTop = 0;
    document.getElementById('trivia-progress-controller').style.display = 'none';
    document.getElementById('trivia-progress-controller').style.height = 0;
    // client.disconnect();
    return;
  }

  document.getElementById('trivia-controller').style.display = 'none';
  document.getElementById('trivia-controller').style.height = 0;
  document.getElementById('trivia-progress-controller').style.marginTop = '24px';
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
  updateHappening('Message received on gameChat: ' + message.destinationName, INFO);
  const msg = JSON.parse(message.payloadString);
  updateGameChat(msg);
}

function gameStart(message) {
  // `trivia/update/gamestarted/${window.gameCode}`
  updateHappening('Message received on gameStart confirmation: ' + message.destinationName, INFO);
  document.getElementById('count-down-tracker').style.display = 'none';
  document.getElementById('count-down-tracker').parentNode.classList.remove('w3-padding-large');
  document.querySelector('#trivia-progress-title').innerHTML = 'Trivia Started';

  document.querySelector('#trivia-progress').style.width = '0%';

  // const flipDown = document.querySelector('#flipdown');
  // const clonedFlipDown = flipDown.cloneNode(false);
  // const flipDownParent = flipDown.parentNode;
  // flipDownParent.removeChild(flipDown);
  // flipDownParent.append(clonedFlipDown);
  // updateCountDown(new Date().getUTCDate());
}

function gameEnd(message) {
  // `trivia/update/gameended/${window.gameCode}`
  updateHappening('Message received on gameEnd' + message.destinationName, INFO);
  const flipDown = document.querySelector('#flipdown');
  if (flipDown) {
    const flipDownParent = flipDown.parentNode;
    flipDownParent.removeChild(flipDown);
  }

  document.querySelector('#trivia-controller').classList.remove('w3-padding-large');
  document.querySelector('.power-button').classList.remove('power-button-disabled');

  // document.querySelector('#trivia-progress-title').innerHTML = 'Trivia Completed';
  // document.querySelector('#trivia-progress').style.width = '100%';

  document.getElementById('trivia-not-available').style.display = 'block';
  document.getElementById('trivia-not-available').innerHTML = '<b><i class="fa fa-clock-o"></i> Trivia Completed!</b>';
  document.getElementById('trivia-controller').style.display = 'none';
  document.getElementById('trivia-controller').style.height = 0;
  document.getElementById('trivia-controller').style.marginTop = 0;
  document.getElementById('trivia-progress-controller').style.display = 'none';
  document.getElementById('trivia-progress-controller').style.height = 0;

  document.querySelector('.abort-button').style.display = 'none';
  document.querySelector('.power-button').style.display = 'none';
  client.publish(`trivia/query/leaderboard/${window.gameCode}/${window.nickName}`);
  client.publish(`trivia/query/performance/${window.gameCode}/${window.nickName}`);
}

function gameAbort(message) {
  // `trivia/update/gameaborted/${window.gameCode}`
  updateHappening('Message received on gameAbort' + message.destinationName, INFO);
  const flipDown = document.querySelector('#flipdown');
  if (flipDown) {
    const flipDownParent = flipDown.parentNode;
    flipDownParent.removeChild(flipDown);
  }

  document.querySelector('#trivia-controller').classList.remove('w3-padding-large');
  document.querySelector('.power-button').classList.remove('power-button-disabled');

  // document.querySelector('#trivia-progress-title').innerHTML = 'Trivia Aborted';
  // document.querySelector('#trivia-progress').style.width = '0%';
  document.getElementById('trivia-not-available').style.display = 'block';
  document.getElementById('trivia-not-available').innerHTML = '<b><i class="fa fa-clock-o"></i> Trivia Aborted!</b>';
  document.getElementById('trivia-controller').style.display = 'none';
  document.getElementById('trivia-controller').style.height = 0;
  document.getElementById('trivia-controller').style.marginTop = 0;
  document.getElementById('trivia-progress-controller').style.display = 'none';
  document.getElementById('trivia-progress-controller').style.height = 0;

  document.querySelector('.abort-button').style.display = 'none';
  document.querySelector('.power-button').style.display = 'none';
  client.publish(`trivia/query/leaderboard/${window.gameCode}/${window.nickName}`);
  client.publish(`trivia/query/performance/${window.gameCode}/${window.nickName}`);
}

function gameLeaderboard(message) {
  // `trivia/response/leaderboard/${window.gameCode}/+`
  updateHappening('Message received on gameLeaderboard' + message.destinationName, INFO);
  const ranks = JSON.parse(message.payloadString);
  const table = document.getElementById('trivia-leader-board-table');
  let first = table.firstElementChild;
  while (first) {
    first.remove();
    first = table.firstElementChild;
  }

  ranks.map(entry => {
    const item = `<tr>
                  <td><span class="ranking">${entry.rank}</span></td>
                  <td>${entry.player}</td>
                  <td>
                    <div class="w3-white w3-border">
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

  if (ranks && ranks.length) {
    document.getElementById('trivia-highest-score').innerHTML = ranks[0].score;
  }
}

function gameEventGroups(message) {
  // `trivia/response/eventgroups/${window.gameCode}/+`
  const groups = JSON.parse(message.payloadString);
  window.eventGroups = groups.map(g => { g.selected = true; return g; });
}

function gameQuestion(message) {
  // `trivia/update/question/${window.gameCode}/+`
  const question = JSON.parse(message.payloadString);
  document.querySelector('#trivia-progress-title').innerHTML = 'Trivia Progress';
  updateHappening('Message received on gameQuestion' + message.destinationName, INFO);
  document.querySelector('#trivia-progress').style.width = Math.ceil(100 * question.qno / question.total) + '%';
  document.querySelector('#trivia-progress').innerHTML = Math.ceil(100 * question.qno / question.total) + '%';
}

function openAdminDialog() {
  document.getElementById('admin-confirmation-form').style.display = 'block';
}

function closeAdminDialog() {
  document.getElementById('admin-confirmation-form').style.display = 'none';
}

function gameValidation(message) {
  // `trivia/response/validation/${window.gameCode}/${window.nickName}`
  updateHappening('Message received on gameValidation' + message.destinationName, INFO);
  document.getElementById('spinner').classList.remove('show');
  const result = JSON.parse(message.payloadString);
  if (result.success) {
    setTimeout(() => {
      document.querySelector('#refresh-warning-footer').style.display = 'none';
    }, 5000);

    closeAdminDialog();
  } else {
    document.querySelector('#admin-confirmation-status').innerHTML = result.message;
  }
}

function solaceClientConnected() {
  updateHappening('In solaceClientConnected', INFO);
  updateHappening('Successfully connected to Broker', SUCCESS);
  updateHappening('Query Params: ' + getQueryParams('game', location.href), DEBUG);
  if (client.connected) {
    document.getElementById('spinner').classList.remove('show');
    document.getElementById('game_content').classList.remove('hide');
    document.getElementById('game_content').classList.add('show');

    client.subscribe(`trivia/activity/user/${window.gameCode}/#`, gameActivityUpdate);
    client.subscribe(`trivia/activity/broadcast/${window.gameCode}`, gameActivityUpdate);
    client.subscribe(`trivia/broadcast/usercount/${window.gameCode}/+`, gameUserCountUpdate);
    client.subscribe(`trivia/broadcast/chat/${window.gameCode}`, gameChat);
    client.subscribe(`trivia/broadcast/restart/${window.gameCode}`, gameRestart);
    client.subscribe(`trivia/response/info/${window.gameCode}/${window.nickName}`, gameInfo);
    client.subscribe(`trivia/response/performance/${window.gameCode}`, gamePerformanceUpdate);
    client.subscribe(`trivia/response/performance/${window.gameCode}/+`, gamePerformanceUpdate);
    client.subscribe(`trivia/response/leaderboard/${window.gameCode}`, gameLeaderboard);
    client.subscribe(`trivia/response/leaderboard/${window.gameCode}/+`, gameLeaderboard);
    client.subscribe(`trivia/response/eventgroups/${window.gameCode}`, gameEventGroups);
    client.subscribe(`trivia/response/eventgroups/${window.gameCode}/+`, gameEventGroups);
    client.subscribe(`trivia/response/validation/${window.gameCode}/${window.nickName}`, gameValidation);
    client.subscribe(`trivia/update/error/${window.gameCode}/+`, gameError);
    client.subscribe(`trivia/update/gameaborted/${window.gameCode}`, gameAbort);
    client.subscribe(`trivia/update/gameended/${window.gameCode}`, gameEnd);
    client.subscribe(`trivia/update/gamestarted/${window.gameCode}`, gameStart);
    client.subscribe(`trivia/update/question/${window.gameCode}/+`, gameQuestion);

    if (client.reconnect) {
      return;
    }

    client.publish(`trivia/query/info/${window.gameCode}/${window.nickName}`);
    client.publish(`trivia/query/eventgroups/${window.gameCode}/${window.nickName}`);
  } else {
    document.getElementById('spinner').classList.remove('show');
    document.getElementById('invalid_game').classList.add('show');
  }
}

function solaceClientDisconnected() {
  updateHappening('In solaceClientDisconnected', INFO);
  // document
  //   .getElementById('spinner')
  //   .classList
  //   .remove('show');
  // document
  //   .getElementById('invalid_game')
  //   .classList
  //   .add('show');
}

function solaceClientConnectionError() {
  updateHappening('In solaceClientConnectionError', ERROR);
  document.getElementById('spinner').classList.remove('show');
  document.getElementById('could_not_connect_to_broker').classList.add('show');
}

function setup() {
  try {
    document.getElementById('game_content').classList.add('hide');
    document.getElementById('spinner').classList.add('show');
    const gameCode = getQueryParams('code', location.href);
    updateHappening('Query Params: ' + location.href + ', ' + gameCode, DEBUG);
    if (!gameCode) {
      document.getElementById('spinner').classList.remove('show');
      document.getElementById('spinner').classList.add('hide');
      document.getElementById('invalid_game').classList.add('show');

      updateHappening('Error: Unknown or missing game code', ERROR);
      return;
    }

    window.gameCode = gameCode;

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

    setTimeout(() => {
      document.querySelector('#refresh-warning-footer').style.display = 'none';
    }, 5000);
  } catch (error) {
    updateHappening('Error: ' + error.message, ERROR);
  }
}

function updateEventGroup(index) {
  window.eventGroups[index].selected !== undefined
    ? ''
    : window.eventGroups[index].selected = false;
  window.eventGroups[index].selected = !window.eventGroups[index].selected;
}

window.addEventListener('load', () => {
  console.log('IsMobile', isMobile());
  if (isMobile()) {
    const hideButtons = document.querySelectorAll('.not-for-mobile');
    hideButtons.forEach(el => el.style.display = 'none');
  }

  document.querySelector('#trivia-performance-load').addEventListener('click', () => {
    client.publish(`trivia/query/performance/${window.gameCode}/${window.nickName}`);
  });

  if (!window.status) {
    document.querySelector('#trivia-progress-title').innerHTML = 'Start Trivia';
  }

  document.querySelector('#trivia-activity-filter').addEventListener('click', () => {
    if (!window.eventGroups || !window.eventGroups.length) {
      showSnack('Event Groups not available');
      return;
    }

    const eventGroupsList = document.querySelector('#trivia-event-groups');
    let first = eventGroupsList.firstElementChild;
    while (first) {
      first.remove();
      first = eventGroupsList.firstElementChild;
    }

    for (i = 0; i < window.eventGroups.length; i++) {
      const entry = window.eventGroups[i];
      entry.selected !== undefined ? entry.selected : true;
      eventGroupsList.insertAdjacentHTML('beforeend',
        `<label class="cmcontainer">
          <span class="dot" style="background-color: ${entry.background}"></span>
          <span class="w3-medium"><i class=${entry.action === 'send' ? "'fa fa-arrow-up'" : "'fa fa-arrow-down'"}"></i></span>
          ${entry.category}
          <input type="checkbox" ${entry.selected ? 'checked' : ''} onclick={updateEventGroup(${i})}>
          <span class="checkmark"></span>
        </label>`);
    }

    document.getElementById('trivia-select-events').style.display = 'block';
  });

  document.querySelector('.power-button').addEventListener('click', () => {
    // document.querySelector('.power-button')
    //   .classList
    //   .add('power-button-disabled');
    document.querySelector('.power-button').style.display = 'none';
    document.querySelector('.abort-button').style.display = 'block';
    client.publish(`trivia/update/start/${window.gameCode}/${window.nickName}`);
  });

  document.querySelector('.abort-button').addEventListener('click', () => {
    document.querySelector('.power-button').classList.add('power-button-disabled');
    document.querySelector('.power-button').style.display = 'block';
    document.querySelector('.abort-button').style.display = 'none';
    client.publish(`trivia/update/abort/${window.gameCode}/${window.nickName}`);
  });

  document.querySelector('#trivia-leaderboard-load').addEventListener('click', () => {
    client.publish(`trivia/query/leaderboard/${window.gameCode}/${window.nickName}`);
  });

  ctxActivityLive = document.getElementById('trivia-activity-canvas');
  gameActivityChart = new Chart(ctxActivityLive, {
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

  ctxPerformanceLive = document.getElementById('trivia-performance-canvas');
  gamePerformanceChart = new Chart(ctxPerformanceLive, {
    type: 'bar',
    data: {
      labels: getQuestionLabels(),
      datasets: [
        {
          label: 'Corrects',
          data: [0, 4],
          backgroundColor: 'rgb(75, 192, 192)',
          borderColor: 'rgb(75, 192, 192)',
        },
        {
          label: 'Incorrects',
          data: [0, 4],
          backgroundColor: 'rgb(255, 99, 132)',
          borderColor: 'rgb(255, 99, 132)',
        }
      ]
    },
    options: {
      responsive: true,
      scaleShowValues: true,
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true
          }
        }]
      },
      layout: {
        padding: 5
      },
      legend: {
        display: true
      },
      tooltips: {
        enabled: true
      },
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Trivia Performance'
        }
      }
    }
  });
});

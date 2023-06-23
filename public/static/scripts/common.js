/* eslint-disable no-plusplus */
/* eslint-disable no-param-reassign */
/* eslint-disable no-shadow */
/* eslint-disable no-undef */
const infoLogModal = document.getElementById('info-log-modal');
const infoLogModalContent = document.getElementById('info-log-modal-content');
const infoLogModalClose = document.getElementById('info-log-close');
const infoLogModalClear = document.getElementById('info-log-clear');

const triviaGameChatSubmitBtn = document.querySelector('.trivia-chat-submit');
const triviaGameChatInputElm = document.querySelector('#trivia-chat-input');
const triviaGameChatEmojiBtn = document.querySelector('.trivia-chat-emoji-button');
const triviaGameChatArea = document.querySelector('.trivia-chat-area');

const triviaResizeScoreCard = document.getElementById('trivia-scorecard-resize');
const triviaResizePerformanceCard = document.getElementById('trivia-performance-resize');
const triviaResizeLeaderBoard = document.getElementById('trivia-leaderboard-resize');
const triviaResizeActivity = document.getElementById('trivia-activity-resize');
const triviaResizeChat = document.getElementById('trivia-chat-resize');
const triviaSwitchViewActivity = document.getElementById('trivia-activity-view-toggle');

const fullscreen = {
  config: {
    element: null,
    container: null,
    canvas: null
  }
};

const gamePicker = new EmojiButton({
  autoHide: false,
  showVariants: false,
  theme: 'auto',
  zIndex: 1,
  position: 'top-start',
  emojiSize: '24px'
});

window.onclick = (event) => {
  if (event.target === infoLogModal) {
    infoLogModal.style.display = 'none';
  }

  if (window.topnavOpen) {
    const x = document.getElementById('contextLinks');
    if (x.style.display === 'block') {
      x.style.display = 'none';
      window.topnavOpen = false;
    }
  }
};

// Emoji selection
window.addEventListener('DOMContentLoaded', () => {
  gamePicker.on('emoji', emoji => {
    const input = document.querySelector('#trivia-chat-input');
    input.value += emoji;
  });

  triviaGameChatEmojiBtn.addEventListener('click', () => {
    gamePicker.togglePicker(triviaGameChatEmojiBtn);
  });
});

infoLogModalClose.onclick = () => {
  infoLogModal.style.display = 'none';
};

infoLogModalClear.onclick = () => {
  while (infoLogModalContent.firstChild) {
    infoLogModalContent.removeChild(infoLogModalContent.firstChild);
  }
  infoLogModal.style.display = 'none';
};

fullScreenChangeHandler = (elem = undefined, container = undefined, canvas = undefined) => {
  const fullScreen = elem.classList.contains('fullscreen');
  if (!fullScreen) {
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) { /* Safari */
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE11 */
      elem.msRequestFullscreen();
    }

    if (!elem.classList.contains('fullscreen')) elem.classList.add('fullscreen');
    if (container) {
      container.style.height = 'calc(100vh - 58px)';
    }
    if (canvas) {
      canvas.style.height = 'calc(100vh - 58px)';
    }

    elem.classList.add('fullscreen');
    elem.classList.add('w3-white');

    fullscreen.config = { element: elem, container, canvas };
    return;
  }
  if (document.fullscreenEnabled) {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) { /* Safari */
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { /* IE11 */
      document.msExitFullscreen();
    }

    if (container) {
      container.style.height = '320px';
    }
    if (canvas) {
      canvas.style.height = '320px';
    }
    elem.classList.remove('fullscreen');
    elem.classList.remove('w3-white');
  }
};

triviaResizePerformanceCard.addEventListener('fullscreenchange', fullScreenChangeHandler);
triviaResizePerformanceCard.addEventListener('webkitfullscreenchange', fullScreenChangeHandler);
triviaResizePerformanceCard.addEventListener('mozfullscreenchange', fullScreenChangeHandler);
triviaResizePerformanceCard.addEventListener('MSFullscreenChange', fullScreenChangeHandler);

triviaResizePerformanceCard.addEventListener('click', () => {
  fullScreenChangeHandler(
    document.getElementById('trivia-performance'),
    document.getElementById('trivia-performance-container'),
    document.getElementById('trivia-performance-canvas')
  );
});

triviaResizeScoreCard.addEventListener('fullscreenchange', fullScreenChangeHandler);
triviaResizeScoreCard.addEventListener('webkitfullscreenchange', fullScreenChangeHandler);
triviaResizeScoreCard.addEventListener('mozfullscreenchange', fullScreenChangeHandler);
triviaResizeScoreCard.addEventListener('MSFullscreenChange', fullScreenChangeHandler);

triviaResizeScoreCard.addEventListener('click', () => {
  fullScreenChangeHandler(
    document.getElementById('trivia-score-card'),
    document.getElementById('trivia-score-card-table-container')
  );
});

triviaResizeLeaderBoard.addEventListener('fullscreenchange', fullScreenChangeHandler);
triviaResizeLeaderBoard.addEventListener('webkitfullscreenchange', fullScreenChangeHandler);
triviaResizeLeaderBoard.addEventListener('mozfullscreenchange', fullScreenChangeHandler);
triviaResizeLeaderBoard.addEventListener('MSFullscreenChange', fullScreenChangeHandler);

triviaResizeLeaderBoard.addEventListener('click', () => {
  fullScreenChangeHandler(
    document.getElementById('trivia-leader-board'),
    document.getElementById('trivia-leader-board-table-container')
  );
});

triviaResizeActivity.addEventListener('fullscreenchange', fullScreenChangeHandler);
triviaResizeActivity.addEventListener('webkitfullscreenchange', fullScreenChangeHandler);
triviaResizeActivity.addEventListener('mozfullscreenchange', fullScreenChangeHandler);
triviaResizeActivity.addEventListener('MSFullscreenChange', fullScreenChangeHandler);

triviaResizeActivity.addEventListener('click', () => {
  fullScreenChangeHandler(
    document.getElementById('trivia-activity'),
    document.getElementById('trivia-activity-canvas'),
    document.getElementById('trivia-activity-table-container')
  );
});

triviaResizeChat.addEventListener('fullscreenchange', fullScreenChangeHandler);
triviaResizeChat.addEventListener('webkitfullscreenchange', fullScreenChangeHandler);
triviaResizeChat.addEventListener('mozfullscreenchange', fullScreenChangeHandler);
triviaResizeChat.addEventListener('MSFullscreenChange', fullScreenChangeHandler);

triviaResizeChat.addEventListener('click', () => {
  fullScreenChangeHandler(
    document.getElementById('trivia-chat'),
    document.getElementById('trivia-chat-container')
  );
});

triviaSwitchViewActivity.addEventListener('click', () => {
  const graph = document.getElementById('trivia-activity-graph');
  const table = document.getElementById('trivia-activity-table');
  if (graph.style.display === 'none') {
    graph.style.display = 'inline-block';
    table.style.display = 'none';
  } else {
    graph.style.display = 'none';
    table.style.display = 'inline-block';
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    if (window.getComputedStyle(infoLogModal).display !== 'none') {
      infoLogModal.style.display = 'none';
    }
  } else if (event.key === 'Enter') {
    if (event.target === triviaGameChatInputElm) {
      const userInput = triviaGameChatInputElm.value;
      triviaGameChatInputElm.value = '';

      sendChatMessage(userInput);
    }
  }
});

document.addEventListener('fullscreenchange', (event) => {
  if (document.fullscreenElement) {
    triviaGameChatEmojiBtn.style.display = 'none';
    if (document.getElementById('player-name-holder')) {
      document.getElementById('player-name-holder').style.display = 'none';
    }
    return;
  }

  if (event.target.id === 'trivia-leader-board') {
    document.getElementById('trivia-leader-board-table-container').style.height = '320px';
  } else if (event.target.id === 'trivia-stats-sent') {
    document.getElementById('trivia-stats-sent-table-container').style.height = '320px';
  } else if (event.target.id === 'trivia-stats-received') {
    document.getElementById('trivia-stats-received-table-container').style.height = '320px';
  } else if (event.target.id === 'trivia-score-card') {
    document.getElementById('trivia-score-card-table-container').style.height = '320px';
  } else if (event.target.id === 'trivia-performance') {
    document.getElementById('trivia-performance-container').style.height = '320px';
    document.getElementById('trivia-performance-canvas').style.height = '320px';
  } else if (event.target.id === 'trivia-chat') {
    document.getElementById('trivia-chat-container').style.height = '320px';
    triviaGameChatEmojiBtn.style.display = 'block';
  }

  if (fullscreen.config.container) {
    fullscreen.config.container.style.height = '320px';
  }
  if (fullscreen.config.canvas) {
    fullscreen.config.canvas.style.height = '320px';
  }
  if (fullscreen.config.element) {
    fullscreen.config.element.classList.remove('fullscreen');
    fullscreen.config.element.classList.remove('w3-white');
  }
});

// send msg
triviaGameChatSubmitBtn.addEventListener('click', () => {
  const userInput = triviaGameChatInputElm.value;
  if (userInput.length === 0) {
    return;
  }

  triviaGameChatInputElm.value = '';
  sendChatMessage(userInput);
});

switchContext = (event) => {
  const x = document.getElementById('contextLinks');
  if (x.style.display === 'block') {
    x.style.display = 'none';
    window.topnavOpen = false;
  } else {
    x.style.display = 'block';
    window.topnavOpen = true;
  }
  event.stopPropagation();
  return false;
};

openLogs = () => {
  document.getElementById('contextLinks').style.display = 'none';
  const infoLogModal = document.getElementById('info-log-modal');
  infoLogModal.style.display = 'block';
};

generateRandomInteger = (min, max) => Math.floor(
  min + Math.random() * (max - min + 1)
);

Logger.useDefaults();
Logger.setLevel(Logger.DEBUG);

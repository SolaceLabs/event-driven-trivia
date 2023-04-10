function setTimer(selector, secs, callback) {
  const timer = document.querySelector(selector);
  const seconds = timer.querySelector('.seconds');

  function getZero(num) {
    if (num >= 0 && num < 10) {
      return '0' + num;
    }
    return num;
  }

  function updateTimer() {
    const t = seconds.innerHTML - 1;
    seconds.innerHTML = getZero(t);

    if (t <= 0) {
      // eslint-disable-next-line no-use-before-define
      clearInterval(timerTic);
      callback();
    }
  }

  const timerTic = setInterval(updateTimer, 1000);
  seconds.innerHTML = getZero(secs);
}

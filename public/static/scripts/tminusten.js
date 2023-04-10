/* eslint-disable no-mixed-operators */
/* eslint-disable no-multi-assign */
/* eslint-disable no-undef */
class Timer {
  constructor(duration, element) {
    this.duration = duration;
    this.element = element;
    this.running = false;

    this.els = {
      ticker: document.getElementById('ticker'),
      seconds: document.getElementById('seconds'),
    };

    const hammerHandler = new Hammer(this.element);
    hammerHandler.get('pan').set({ direction: Hammer.DIRECTION_VERTICAL });
    hammerHandler.on('panup pandown', (ev) => {
      if (!this.running) {
        if (ev.direction === Hammer.DIRECTION_UP && this.duration < 999000) {
          this.setDuration(this.duration + 1000);
        } else if (ev.direction === Hammer.DIRECTION_DOWN && this.duration > 0) {
          this.setDuration(this.duration - 1000);
        }
      }
    });

    hammerHandler.on('tap', () => {
      if (this.running) {
        this.reset();
      } else {
        this.start();
      }
    });
  }

  start = (callback) => {
    const self = this;
    let start = null;
    this.running = true;
    this.callback = callback;
    let remainingSeconds = this.els.seconds.textContent = this.duration / 1000;

    function draw(now) {
      if (!start) start = now;
      const diff = now - start;
      const newSeconds = Math.ceil((self.duration - diff) / 1000);

      if (diff <= self.duration) {
        self.els.ticker.style.height = 100 - (diff / self.duration * 100) + '%';

        if (newSeconds !== remainingSeconds) {
          self.els.seconds.textContent = newSeconds;
          remainingSeconds = newSeconds;
        }

        if (window.gameEnded) {
          self.running = false;
          self.els.seconds.textContent = 0;
          self.els.ticker.style.height = '0%';
          self.element.classList.add('countdown--ended');
          self.callback();
        } else {
          self.frameReq = window.requestAnimationFrame(draw);
        }
      } else {
        self.running = false;
        self.els.seconds.textContent = 0;
        self.els.ticker.style.height = '0%';
        self.element.classList.add('countdown--ended');
        self.callback();
      }
    }

    this.frameReq = window.requestAnimationFrame(draw);
  };

  reset = () => {
    this.running = false;
    window.cancelAnimationFrame(this.frameReq);
    this.els.seconds.textContent = this.duration / 1000;
    this.els.ticker.style.height = null;
    this.element.classList.remove('countdown--ended');
  };

  setDuration = (duration) => {
    this.duration = duration;
    this.els.seconds.textContent = this.duration / 1000;
  }
}

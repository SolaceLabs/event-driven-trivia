// eslint-disable-next-line max-classes-per-file
const schedule = require('node-schedule');
const MomentUtils = require('@date-io/moment');
const Trivia = require('./models/trivia');

const utils = new MomentUtils();

class Scheduler {
  constructor(logger, client) {
    this.logger = logger;
    this.client = client;
    this.jobs = [];
  }

  loadJobs = (reload = false) => {
    if (reload) this.jobs.slice(0, this.jobs.length);

    Trivia.find({
      scheduled: true,
      deleted: false
    })
      .then(trivias => {
        trivias.map((trivia) => {
          if (trivia.status === 'SCHEDULED'
              && utils.moment().diff(utils.moment(trivia.start_at)) > 0) {
            // eslint-disable-next-line no-param-reassign
            trivia.status = 'EXPIRED';
            Trivia.findByIdAndUpdate(trivia.id, trivia, { new: true })
              .then(console.log('Update trivia successful'))
              .catch(err => console.log('Update trivia failed', err));
            return trivia;
          }

          if (trivia.status === 'SCHEDULED') {
            const job = schedule.scheduleJob(new Date(trivia.start_at), ((t, l, c) => {
              l.info(`Starting scheduled Trivia - '${t.name}'`);
            }).bind(null, trivia, this.logger, this.client));

            this.jobs.push({
              id: trivia.id,
              job
            });
          }
          return trivia;
        });
      })
      .catch(err => {
        this.logger.error('Could not load trivias - ', err.message);
      });
  }

  addJob = (trivia) => {
    const pos = this.jobs.find(j => j.id === trivia._id);
    if (pos >= 0) this.jobs.splice(pos, 1);

    const job = schedule.scheduleJob(new Date(trivia.start_at), ((t, l, c) => {
      l.info(`Starting scheduled Trivia - '${t.name}'`);
    }).bind(null, trivia, this.logger, this.client));

    this.jobs.push({
      id: trivia._id,
      job
    });
  }

  endJob = (trivia) => {
    const pos = this.jobs.find(j => j.id === trivia._id);
    if (pos >= 0) this.jobs.splice(pos, 1);
  }
}

class singletonScheduler {
  constructor(logger, client) {
    if (!singletonScheduler.instance) {
      singletonScheduler.instance = new Scheduler(logger, client);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  getInstance() {
    return singletonScheduler.instance;
  }
}

module.exports = singletonScheduler;

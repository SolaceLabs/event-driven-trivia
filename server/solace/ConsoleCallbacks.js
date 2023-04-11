/* eslint-disable camelcase */
const Conf = require('observable-conf');
const MomentUtils = require('@date-io/moment');
const { fork } = require('child_process');
const { Worker } = require('worker_threads');
const TriviaStats = require('../models/triviastats');
const Trivia = require('../models/trivia');
const utils = new MomentUtils();
const TriviaConstants = require('./TriviaConstants');
const activities = {
  'activity/': { category: 'Activity Trails', background: 'white', action: 'send' },
  'update/error': { category: 'Trivia Error', background: 'red', action: 'send' },
  'update/start': { category: 'Trivia Start', background: '#00FA9A', action: 'send' },
  'update/gamestarted': { category: 'Trivia Started', background: '#48D1CC', action: 'send' },
  'update/abort': { category: 'Trivia Abort Initiated', background: '#0000FF', action: 'send' },
  'update/gameaborted': { category: 'Trivia Aborted', background: '#FF4500', action: 'send' },
  'update/gameended': { category: 'Trivia Ended', background: '#FF0000', action: 'send' },
  'update/user': { category: 'User Activity', background: '#FF8C00', action: 'receive' },
  'broadcast/usercount': { category: 'Broadcast User Activity', background: '#000080', action: 'send' },
  'update/question': { category: 'Trivia Question', background: '#008080', action: 'send' },
  'update/answer': { category: 'Trivia Answer', background: '#EE82EE', action: 'receive' },
  'update/chat': { category: 'Trivia Chat', background: '#C0C0C0', action: 'receive' },
  'broadcast/chat': { category: 'Broadcast Chat', background: '#708090', action: 'send' },
  'query/getrank': { category: 'Query Rank', background: '#00BFFF', action: 'receive' },
  'response/getrank': { category: 'Your Rank', background: '#FF1493', action: 'send' },
  'query/info': { category: 'Query Trivia Info', background: 'crimson', action: 'receive' },
  'response/info': { category: 'Trivia Info', background: '#556B2F', action: 'send' },
  'broadcast/restart': { category: 'Broadcast Trivia Restart', background: '#b3d4fc', action: 'send' },
  'query/leaderboard': { category: 'Query Trivia Leaderboard', background: '#FFE4E1', action: 'receive' },
  'response/leaderboard': { category: 'Trivia Leaderboard', background: '#C71585', action: 'send' },
  'query/scorecard': { category: 'Query Trivia Scorecard', background: '#FFA07A', action: 'receive' },
  'response/scorecard': { category: 'Trivia Scorecard', background: '#20B2AA', action: 'send' },
  'query/eventgroups': { category: 'Query Event Groups', background: '#f8de7e', action: 'receive' },
  'response/eventgroups': { category: 'Event Groups', background: '#cd9fce', action: 'send' },
  'query/performance': { category: 'Query Trivia Performance', background: '#FCA829', action: 'receive' },
  'response/performance': { category: 'Trivia Performance', background: '#F66651', action: 'send' },
  'query/validation': { category: 'Validate Trivia', background: '#DAA520', action: 'receive' },
  'response/validation': { category: 'Trivia Validated', background: '#FFD700', action: 'send' }
};
const activityTopics = Object.keys(activities);
const activitySetting = Object.values(activities);

const triviaPlayersConfig = new Conf();
class ConsoleCallbacks {
  setupPlayerSynch = () => {
    setInterval(() => {
      const players = triviaPlayersConfig.get('players') ? triviaPlayersConfig.get('players') : {};
      let changed = 0;
      Object.keys(players).forEach((code) => {
        const game = players[code];
        if (utils.moment().diff(utils.moment(game.timeStamp)) > 3600000) {
          delete players[code];
          triviaPlayersConfig.set('players', players);
          changed += 1;
        }
      });

      Object.keys(players).forEach((code) => {
        const game = players[code];
        console.log(`Updating player stats to DB ${code}`);
        Trivia.findOneAndUpdate(
          { hash: code },
          { $set: { players: game } },
          (err, result) => {
            if (err) {
              console.log(`Update player stats failed for ${code}: `, err);
              throw new Error('No Trivia found');
            }
          });
      });
    }, 30000);
  }

  getTime = () => {
    const now = new Date();
    const time = [('0' + now.getHours()).slice(-2), ('0' + now.getMinutes()).slice(-2),
      ('0' + now.getSeconds()).slice(-2)];
    return 'CONSOLE [' + time.join(':') + '] ';
  }

  setConsoleClient = (consoleClient) => {
    this.consoleClient = consoleClient;
  }

  getConsoleClient = () => this.consoleClient

  onConnectionSuccess = (async () => {
    console.log(this.getTime(), '=== Trivia Console ready. ===');
  });

  onConnectionError = (async () => {
    console.log(this.getTime(), '=== Trivia Console connection lost. ===');
    if (this.updatePlayersTimer) clearTimeout(this.updatePlayersTimer);
  });

  onConnectionLost = (async () => {
    console.log(this.getTime(), '=== Trivia Console connection failed. ===');
    if (this.updatePlayersTimer) clearTimeout(this.updatePlayersTimer);
  });

  onTriviaActivityCallback = (message) => {
    // `trivia/${game_code}/+/+`

    const topic = message.getDestination();
    const topicName = topic.getName();
    const parts = topicName.split('/');
    const game_code = parts[1];
    const reply_to = (['question', 'usercount'].includes(parts[3])) ? undefined : parts[4];

    const activity = activityTopics.findIndex(axis => topicName.indexOf(axis) > 0);
    if (!activity) {
      console.log(this.getTime(), 'Ignore activity messages');
      return;
    }

    if (activity < 0) {
      console.log(this.getTime(), 'Unknown topic activity');
      throw new Error('Unknown topic activity');
    }

    const payload = {
      topic: topicName,
      category: activitySetting[activity].category,
      background: activitySetting[activity].background,
      action: activitySetting[activity].action,
      axis: activity,
      ts: new Date().toISOString()
    };

    reply_to
      ? this.consoleClient.publish(`trivia/${game_code}/activity/user/${reply_to}`, payload)
      : this.consoleClient.publish(`trivia/${game_code}/activity/broadcast`, payload);
  }

  onGameRestartCallback = (message) => {
    // 'trivia/${game_code}/broadcast/restart
    const topic = message.getDestination();
    const parts = topic.getName().split('/');
    const game_code = parts[1];

    const players = triviaPlayersConfig.get('players') ? triviaPlayersConfig.get('players') : {};
    delete players[game_code];
    triviaPlayersConfig.set('players', players);
  }

  onGameInfoCallback = (message) => {
    // 'trivia/${game_code}/query/info/${window.nickName}'
    const topic = message.getDestination();
    const parts = topic.getName().split('/');
    const game_code = parts[1];
    const reply_to = parts[4];
    console.log(this.getTime(), '=== Trivia Console query on game code: ' + game_code + ' from ' + reply_to + '===');

    Trivia.find({ hash: game_code }, { chat: 0, questions: 0, adminHash: 0 })
      .then(trivias => {
        const trivia = trivias[0];
        if (!trivia) { throw new Error('No Trivia found'); }

        if (trivia.status === 'SCHEDULED'
              && utils.moment().diff(utils.moment(trivia.start_at)) > 0) {
          trivia.status = 'EXPIRED';
          Trivia.findByIdAndUpdate(trivia.id, trivia)
            // .then(console.log(this.getTime(), 'Update trivia successful'))
            .catch(err => console.log(this.getTime(), 'Update trivia failed', err));
        }
        if (trivia.status === 'NEW' && trivia.questions.length) {
          trivia.status = 'READY';
          Trivia.findByIdAndUpdate(trivia.id, trivia)
            // .then(console.log('Update trivia successful'))
            .catch(err => console.log('Update trivia failed', err));
        }
        TriviaStats.find({ hash: game_code })
          .lean()
          .then(triviaStats => {
            const stats = triviaStats[0];
            if (stats) {
              trivia.score = stats.score.find(s => s.player === reply_to);
              const players = triviaPlayersConfig.get('players') ? triviaPlayersConfig.get('players') : {};
              if (players[game_code]) trivia.players = players[game_code];

              this.consoleClient.publish(`trivia/${game_code}/response/info/${reply_to}`, trivia);
            }
          })
          .catch(err => {
            const players = triviaPlayersConfig.get('players') ? triviaPlayersConfig.get('players') : {};
            if (players[game_code]) trivia.players = players[game_code];
            this.consoleClient.publish(`trivia/${game_code}/response/info/${reply_to}`, trivia);
          });
      })
      .catch(err => {
        const error = 'No Trivia found';
        console.log(this.getTime(), err);
        console.log(this.getTime(), error);
        this.consoleClient.publish(`trivia/${game_code}/update/error/gameinfo/${reply_to}`, { message: error });
      });
  }

  publishPerformance = (stats, game_code, reply_to = false) => {
    const result = {};
    const unique = [...new Set(stats.answers.map((item) => item.qno))];
    unique.forEach(qno => {
      const corrects = stats.answers.filter(answer => answer.qno === qno && answer.correct).length;
      const incorrects = stats.answers.filter(answer => answer.qno === qno && !answer.correct).length;
      result[qno] = { corrects, incorrects };
    });

    this.consoleClient.publish(`trivia/${game_code}/response/performance/${reply_to}`, result);
  }

  onPerformanceCallback = (message) => {
    // 'trivia/${game_code}/query/performance/${window.nickName}'
    const topic = message.getDestination();
    const parts = topic.getName().split('/');
    const game_code = parts[1];
    const reply_to = parts[4];

    TriviaStats.aggregate([
      {
        $match: {
          hash: game_code
        }
      },
      {
        $project: { answers: 1 }
      }
    ])
      .then(list => {
        this.publishPerformance(list[0], game_code, reply_to);
      })
      .catch(err => {
        const error = 'No answers found';
        console.log(this.getTime(), err);
        this.consoleClient.publish(`trivia/${game_code}/update/error/performance/${reply_to}`, { message: error });
      });

    console.log(this.getTime(), '=== Trivia Console performance response on game code: ' + game_code + ' from session: ' + reply_to + ' ===');
  }

  onScorecardCallback = (message) => {
    // 'trivia/${game_code}/query/scorecard/${window.nickName}'
    const topic = message.getDestination();
    const parts = topic.getName().split('/');
    const game_code = parts[1];
    const reply_to = parts[4];

    TriviaStats.aggregate([
      {
        $match: {
          hash: game_code
        }
      },
      {
        $project: {
          answers: {
            $filter: {
              input: '$answers',
              as: 'answers',
              cond: { $eq: ['$$answers.player', reply_to] }
            }
          }
        }
      }
    ])
      .then(list => {
        this.consoleClient.publish(`trivia/${game_code}/response/scorecard/${reply_to}`, { answers: list[0].answers });
      })
      .catch(err => {
        const error = 'No answers found';
        console.log(this.getTime(), err);
        this.consoleClient.publish(`trivia/${game_code}/update/error/scorecard/${reply_to}`, { message: error });
      });

    console.log(this.getTime(), '=== Trivia Console scorecard response on game code: ' + game_code + ' from session: ' + reply_to + ' ===');
  }

  onChatCallback = (message) => {
    // 'trivia/${game_code}/update/chat/${window.nickName}'
    const topic = message.getDestination();
    const parts = topic.getName().split('/');
    const game_code = parts[1];
    const reply_to = parts[4];
    const chat = JSON.parse(message.getBinaryAttachment());

    this.consoleClient.publish(`trivia/${game_code}/broadcast/chat`, chat);
    Trivia.findOne({ hash: game_code })
      .then(t => {
        if (!t) { throw new Error('No Trivia found'); }

        const trivia = t.toObject();
        trivia.chat = trivia.chat ? trivia.chat : [];
        trivia.chat.push(chat);
        Trivia.findOneAndUpdate(
          { hash: game_code },
          { $set: { chat: trivia.chat } },
          (err, result) => {
            if (err) {
              console.log('Update player chat failed: ', err);
              throw new Error('No Trivia found');
            }
          });
      });

    console.log(this.getTime(), '=== Trivia Console chat response on game code: ' + game_code + ' from session: ' + reply_to + ' ===');
  }

  onGetRankCallback = (message) => {
    // 'trivia/${game_code}/query/getrank/${window.nickName}'
    const topic = message.getDestination();
    const parts = topic.getName().split('/');
    const game_code = parts[1];
    const reply_to = parts[4];

    TriviaStats.find({ hash: game_code })
      .lean()
      .then(triviaStats => {
        const stats = triviaStats[0];
        if (!stats) { throw new Error('No Trivia found'); }

        const score = stats.score.find(s => s.player === reply_to);
        this.consoleClient.publish(`trivia/${game_code}/response/getrank/${reply_to}`, score);
      })
      .catch(err => {
        const error = 'No Trivia found';
        console.log(this.getTime(), err);
        console.log(this.getTime(), error);
        this.consoleClient.publish(`trivia/${game_code}/update/error/getrank/${reply_to}`, { message: error });
      });
  }

  publishLeaderBoard = (stats, reply_to = false) => {
    const answers = stats.answers ? stats.answers : [];
    const players = Array.from(new Set(answers.map(item => item.player)));
    const scores = [];
    players.map(player => {
      const playerItems = answers.filter(item => item.player === player);
      const corrects = playerItems.reduce((n, { correct }) => n + (correct ? 1 : 0), 0);
      // eslint-disable-next-line no-shadow
      const answered = playerItems.reduce((n, { answered }) => n + (answered ? 1 : 0), 0);
      // eslint-disable-next-line no-shadow
      const timing = playerItems.reduce((n, { timing }) => n + (timing || 0), 0);
      // eslint-disable-next-line no-shadow
      const score = playerItems.reduce((n, { score }) => n + (score || 0), 0);
      scores.push({
        player,
        corrects,
        answered,
        timing,
        score,
      });
      return player;
    });

    scores.sort((a, b) => (a.score < b.score ? 1 : -1));
    let rank = 0;
    // eslint-disable-next-line no-return-assign, no-param-reassign, no-plusplus
    scores.map((s) => s.rank = s.score ? ++rank : 0);
    // console.log('Player score: ', scores);

    TriviaStats.findOneAndUpdate(
      { hash: stats.hash },
      { $set: { score: scores } },
      (err, result) => {
        if (err) {
          console.log('Update stats failed: ', err);
          throw new Error('No Trivia found');
        }
      });

    if (reply_to) {
      this.consoleClient.publish(`trivia/${stats.hash}/response/leaderboard/${reply_to}`, scores.filter(s => s.rank > 0));
    } else {
      this.consoleClient.publish(`trivia/${stats.hash}/response/leaderboard`, scores.filter(s => s.rank > 0));
    }
  }

  onEventGroupsCallback = (message) => {
    // 'trivia/${game_code}/query/eventgroups/${window.nickName}'
    const topic = message.getDestination();
    const parts = topic.getName().split('/');
    const game_code = parts[1];
    const reply_to = parts[4];
    const groups = Object.values(activities).sort((a, b) => (a.category < b.category ? -1 : 1));
    this.consoleClient.publish(`trivia/${game_code}/response/eventgroups/${reply_to}`, groups);
  }

  onLeaderboardCallback = (message) => {
    // 'trivia/${game_code}/query/leaderboard/${window.nickName}'
    const topic = message.getDestination();
    const parts = topic.getName().split('/');
    const game_code = parts[1];
    const reply_to = parts[4];

    TriviaStats.find({ hash: game_code })
      .populate('trivia')
      .populate('questions')
      .lean()
      .then(triviaStats => {
        const stats = triviaStats[0];
        if (!stats) {
          throw new Error('No Trivia found');
        }

        stats.score.sort((a, b) => (a.score < b.score ? 1 : -1));
        this.publishLeaderBoard(stats, reply_to);
      })
      .catch(err => {
        const error = 'No Trivia found';
        console.log(this.getTime(), err);
        console.log(this.getTime(), error);
        this.consoleClient.publish(`trivia/${game_code}/update/error/leaderboard/${reply_to}`, { message: error });
      });
  }

  onValidateCallback = (message) => {
    // 'trivia/${game_code}/query/validation/${window.nickName}'
    const topic = message.getDestination();
    const parts = topic.getName().split('/');
    const game_code = parts[1];
    const reply_to = parts[4];
    const admin = JSON.parse(message.getBinaryAttachment());

    Trivia.find({ hash: game_code })
      .then(trivias => {
        if (trivias.length > 0) {
          const trivia = trivias[0];
          if (!trivia) { throw new Error('No Trivia found'); }

          this.consoleClient.publish(`trivia/${game_code}/response/validation/${reply_to}`,
            { message: 'Admin code validation', success: trivia.adminHash === admin.hash });
        } else {
          this.consoleClient.publish(`trivia/${game_code}/response/validation/${reply_to}`,
            { message: 'No Trivia found', success: false });
        }
      })
      .catch(err => {
        const error = 'No Trivia found';
        console.log(this.getTime(), err);
        console.log(this.getTime(), error);
        this.consoleClient.publish(`trivia/${game_code}/update/error/validate/${reply_to}`, { message: error });
      });
  }

  onGameEndedCallback = async (message) => {
    // 'trivia/${game_code}/update/user/${window.nickName}/${action}'
    const topic = message.getDestination();
    const parts = topic.getName().split('/');
    const game_code = parts[1];

    const players = triviaPlayersConfig.get('players') ? triviaPlayersConfig.get('players') : {};
    triviaPlayersConfig.set('players', players);
  };

  getTriviaPlayers = async (game_code) => {
    Trivia.findOne({ hash: game_code })
      .then(t => {
        if (!t) { return null; }

        const trivia = t.toObject();
        return trivia.players;
      })
      .catch(err => {
        const _message = 'No Trivia found';
        return null;
      });
  }

  updateTriviaUsersConfig = async (game_code, reply_to, action) => {
    const players = triviaPlayersConfig.get('players') ? triviaPlayersConfig.get('players') : {};
    let game = players[game_code];
    if (!game) {
      game = await this.getTriviaPlayers(game_code);
      if (!game) {
        game = {
          names: [], connected: [], current: 0, high: 1
        };
      }
    }

    if (!game.current && action === 'DISCONNECTED') {
      // ignore
    } else {
      if (game.connected.includes(reply_to) && action === 'CONNECTED') {
        this.consoleClient.publish(`trivia/${game_code}/broadcast/usercount/${game.current}`);
        return;
      }

      if (!game.connected.includes(reply_to) && action === 'DISCONNECTED') {
        this.consoleClient.publish(`trivia/${game_code}/broadcast/usercount/${game.current}`);
        return;
      }

      if (!game.names.includes(reply_to)) game.names.push(reply_to);
      if (!game.connected.includes(reply_to) && action === 'CONNECTED') game.connected.push(reply_to);
      if (game.connected.includes(reply_to) && action === 'DISCONNECTED') game.connected = game.connected.filter(a => a !== reply_to);
      game.current += ((action === 'CONNECTED') ? 1 : -1);
      game.current = (game.current < 0) ? 0 : game.current;
      game.high = (game.current > game.high) ? game.current : game.high;
      game.timeStamp = new Date();
      players[game_code] = game;

      this.consoleClient.publish(`trivia/${game_code}/broadcast/usercount/${game.current}`);
    }
    triviaPlayersConfig.set('players', players);
  }

  onUserUpdateCallback = async (message) => {
    // 'trivia/${game_code}/update/user/${window.nickName}/${action}'
    const topic = message.getDestination();
    const parts = topic.getName().split('/');
    const game_code = parts[1];
    const reply_to = parts[4];
    const action = parts[5];

    this.updateTriviaUsersConfig(game_code, reply_to, action);
  }

  onAnswerCallback = async (message) => {
    // 'trivia/${game_code}/update/answer/${window.nickName}/${qid}'
    const topic = message.getDestination();
    const parts = topic.getName().split('/');
    const game_code = parts[1];
    const reply_to = parts[4];
    const qid = parts[5];

    console.log('PARTS', parts);

    TriviaStats.find({ hash: game_code })
      .populate('trivia')
      .populate('questions')
      .lean()
      .then(async triviaStats => {
        const answer = JSON.parse(message.getBinaryAttachment());
        answer.answer = answer.answer ? answer.answer : '';
        answer.timing = answer.timing ? answer.timing : 0;

        const stats = triviaStats[0];
        if (!stats) { throw new Error('No Trivia found'); }

        const question = stats.questions.find(q => q._id.toString() === qid);
        const correct = (answer.answer !== '' && answer.answer === question.answer);
        let score = 0;
        score = (answer.answered && correct) ? 100 : score;
        score = (answer.answered && correct) ? score + Math.floor((stats.trivia.time_limit * 1000 - answer.timing) / 100) : score;
        const ans = {
          player: reply_to,
          qno: answer.qno,
          qid,
          answered: answer.answered,
          answer: answer.answer,
          correct,
          timing: answer.timing,
          score,
        };

        TriviaStats.findOneAndUpdate(
          { _id: stats._id },
          { $push: { answers: ans } },
          (_err, result) => {
            if (_err) {
              console.log('Update stats failed: ', _err);
              throw new Error('No Trivia found');
            } else {
              // console.log('Update stats success', result);
              this.publishLeaderBoard(result);

              TriviaStats.aggregate([
                {
                  $match: {
                    hash: game_code
                  }
                },
                {
                  $project: { answers: 1 }
                }
              ])
                .then(list => {
                  this.publishPerformance(list[0], game_code, reply_to);
                })
                .catch(err => {
                  const error = 'No answers found';
                  console.log(this.getTime(), err);
                  this.consoleClient.publish(`trivia/${game_code}/update/error/answer/${reply_to}`, { message: error });
                });
            }
          }
        );
      })
      .catch(err => {
        const error = 'Answer update failed';
        console.log(this.getTime(), err);
        console.log(this.getTime(), error);
        this.consoleClient.publish(`trivia/${game_code}/update/error/answer/${reply_to}`, { message: error });
      });
  }

  getGameStatus = async (game_code) => {
    Trivia.findOne({ hash: game_code })
      .then(t => {
        if (!t) { throw new Error('No Trivia found'); }

        const trivia = t.toObject();
        return trivia.status;
      })
      .catch(err => {
        const _message = 'No Trivia found';
        console.log(this.getTime(), err);
        console.log(this.getTime(), _message);
        return 'TRIVIA_NOT_FOUND';
      });
  }

  processWorkerUpdate = (worker, msg, game_code, reply_to) => {
    if (msg.type === TriviaConstants.CONNECTION_SUCCESS) {
      // start the session client
      Trivia.find({ hash: game_code }, { players: 0, chat: 0 })
        .populate('questions')
        .then(trivias => {
          const triviaItem = trivias[0];
          if (!triviaItem) { throw new Error('No Trivia found'); }

          const trivia = triviaItem.toObject();
          const { questions } = trivia;

          const stats = {
            hash: trivia.hash,
            trivia: trivia._id,
            questions,
            players: {
              names: [], low: 0, current: 0, high: 0
            },
            chat: [],
            score: [],
            winners: []
          };
          TriviaStats.findOneAndUpdate(
            { hash: game_code }, stats, { upsert: true, new: true })
            .then(triviaStats => {
              console.log(this.getTime(), 'TriviaStats initialized');
              worker.send({ type: TriviaConstants.GAME_START_REQUEST, trivia, questions });
              // worker.postMessage({ type: TriviaConstants.GAME_START_REQUEST, trivia, questions });
            })
            .catch(err => {
              const _message = 'Trivia game add failed';
              console.log(err);
              console.log(_message);
              throw new Error(_message);
            });
        })
        .catch(err => {
          const _message = 'No Trivia found';
          console.log(this.getTime(), err);
          console.log(this.getTime(), _message);
          this.consoleClient.publish(`trivia/${game_code}/update/error/worker/${reply_to}`, { message: _message });
        });
    } else if (msg.type === TriviaConstants.GAME_END_REQUEST) {
      console.log(this.getTime(), 'Game Ended - Terminating Worker thread', msg.message);
      Trivia.findOneAndUpdate(
        { hash: game_code },
        { $set: { status: 'COMPLETED' } },
        (err, result) => {
          if (err) {
            console.log('Update trivia failed: ', err);
            throw new Error('No Trivia found');
          }
        });

      worker.kill('SIGHUP');
    } else if (msg.type === TriviaConstants.GAME_ABORT_REQUEST) {
      console.log(this.getTime(), 'Abort - Terminating Worker thread', msg.message);
      Trivia.findOneAndUpdate(
        { hash: game_code },
        { $set: { status: 'ABORTED' } },
        (err, result) => {
          if (err) {
            console.log('Update trivia failed: ', err);
            throw new Error('No Trivia found');
          }
        });

      console.log(this.getTime(), `Publish trivia/${game_code}/update/gameaborted`);
      this.consoleClient.publish(`trivia/${game_code}/update/gameaborted`, msg.message);
      worker.kill('SIGHUP');
    } else if (msg.type === TriviaConstants.CONNECTION_ERROR) {
      console.log(this.getTime(), 'Connection Error - Terminating Worker thread', msg.message);
      worker.kill('SIGHUP');
    } else if (msg.type === TriviaConstants.CONNECTION_LOST) {
      console.log(this.getTime(), 'Connection Lost - Terminating Worker thread', msg.message);
      worker.kill('SIGHUP');
    }
  }

  onStartCallback = async (message) => {
    // 'trivia/${game_code}/update/start'
    const topic = message.getDestination();
    const parts = topic.getName().split('/');
    const game_code = parts[1];
    const reply_to = parts[4];

    const status = await this.getGameStatus(game_code);
    if (status === 'TRIVIA_NOT_FOUND') {
      this.consoleClient.publish(`trivia/${game_code}/update/error/start/${reply_to}`, { message: 'Trivia not found' });
      return;
    }
    if (status === 'STARTED') {
      this.consoleClient.publish(`trivia/${game_code}/update/error/start/${reply_to}`, { message: 'Trivia already in progress' });
      return;
    }

    Trivia.findOneAndUpdate(
      { hash: game_code },
      { $set: { status: 'STARTED' } },
      (err, result) => {
        if (err) {
          console.log('Update trivia failed: ', err);
          throw new Error('No Trivia found');
        }
      });

    const worker = fork('./server/solace/TriviaWorker.js', { detached: true });
    // const worker = new Worker('./server/solace/TriviaWorker.js');

    worker.send({ type: TriviaConstants.CONNECTION_REQUEST, hash: game_code });
    // worker.postMessage({ type: TriviaConstants.CONNECTION_REQUEST, hash: game_code });
    worker.unref();

    worker.on('message', msg => {
      console.log('Worker message received: ', msg);
      this.processWorkerUpdate(worker, msg, game_code, reply_to);
    });
    worker.on('error', err => {
      console.error('Worker error received: ', err);
    });
    worker.on('exit', code => {
      console.log(`Worker exited with code ${code}.`);
      // worker.terminate();
    });
  }
}

module.exports = ConsoleCallbacks;

/* eslint-disable no-plusplus */
/* eslint-disable camelcase */
const shortHash = require('shorthash2');
const { isMainThread, parentPort } = require('worker_threads');
const SessionClient = require('./SessionClient');
const TriviaConstants = require('./TriviaConstants');
let client = null;

const setClient = (_client) => {
  client = _client;
};

// eslint-disable-next-line arrow-body-style
const snooze = (ms) => {
  // eslint-disable-next-line no-promise-executor-return
  return new Promise(resolve => setTimeout(resolve, ms));
};

const getTime = () => {
  const now = new Date();
  const time = [('0' + now.getHours()).slice(-2), ('0' + now.getMinutes()).slice(-2),
    ('0' + now.getSeconds()).slice(-2)];
  return 'SESSION [' + time.join(':') + '] ';
};

const until = (predFn) => {
  const poll = (done) => (predFn() ? done() : setTimeout(() => poll(done), 500));
  return new Promise(poll);
};

const startTriviaRun = async (trivia, questions) => {
  const { no_of_questions } = trivia;
  const game_code = trivia.hash;
  const interval = trivia.time_limit / 2;
  let qCounter = 0;

  console.log(getTime(), 'Starting Trivia');

  try {
    const sessionHash = shortHash(trivia.name + '@' + (new Date()).getMilliseconds());
    console.log(getTime(), `Publish trivia/gamestarted/${game_code} with game session id ${sessionHash}`);
    client.publish(`trivia/update/gamestarted/${game_code}`, { sessionId: sessionHash, startAt: new Date().getTime() });

    await snooze(8000);

    const question = questions[qCounter++];
    console.log(getTime(), `Publish trivia/update/question/${game_code}/${qCounter}`);

    client.publish(`trivia/update/question/${game_code}/${qCounter}`, {
      question: question.question,
      choice_1: question.choice_1,
      choice_2: question.choice_2,
      choice_3: question.choice_3,
      choice_4: question.choice_4,
      qno: qCounter,
      qid: question.id,
      total: no_of_questions,
      time_limit: trivia.time_limit,
      last_question: (qCounter === no_of_questions),
      sessionId: sessionHash
    });

    while (qCounter < no_of_questions) {
      // eslint-disable-next-line no-await-in-loop
      await snooze(interval * 1000);
      const _question = questions[qCounter++];
      client.publish(`trivia/update/question/${game_code}/${qCounter}`, {
        question: _question.question,
        choice_1: _question.choice_1,
        choice_2: _question.choice_2,
        choice_3: _question.choice_3,
        choice_4: _question.choice_4,
        qno: qCounter,
        qid: _question.id,
        total: no_of_questions,
        time_limit: trivia.time_limit,
        last_question: (qCounter === no_of_questions),
        sessionId: sessionHash
      });
      // eslint-disable-next-line no-await-in-loop
      await snooze(interval * 1000);
      console.log(getTime(), `Publish trivia/update/question/${game_code}/${qCounter}`);
    }

    // await snooze(interval * 1000);
    await snooze(trivia.time_limit * 1000);

    console.log(getTime(), `Publish trivia/update/gameended/${game_code}`, { sessionId: sessionHash });
    client.publish(`trivia/update/gameended/${game_code}`, { sessionId: sessionHash });

    await snooze(8000);

    process.send({ type: TriviaConstants.GAME_END_REQUEST, message: 'Game Ended' });
    return true;
  } catch (error) {
    console.log(getTime(), '=== Something went wrong when running Trivia === ' + error);
    console.log(error);
    return false;
  }
};

const onAbortCallback = async (message) => {
  process.send({ type: TriviaConstants.GAME_ABORT_REQUEST, message: JSON.parse(message.getBinaryAttachment()) });
};

const initSession = async (hash) => {
  const sessionClient = new SessionClient(hash);

  const onConnectionSuccess = (async () => {
    setClient(sessionClient);
    console.log(getTime(), '=== Trivia Session ready ===');
    process.send({ type: TriviaConstants.CONNECTION_SUCCESS, message: 'Successfully completed' });
  });

  const onConnectionError = (async () => {
    console.log(getTime(), '=== Trivia Console connection error  ===');
    process.send({ type: TriviaConstants.CONNECTION_ERROR, message: 'Connection error' });
  });

  const onConnectionLost = (async () => {
    console.log(getTime(), '=== Trivia Console connection lost ===');
    process.send({ type: TriviaConstants.CONNECTION_LOST, message: 'Connection lost' });
  });

  sessionClient.setOnConnectionSuccess(onConnectionSuccess);
  sessionClient.setOnConnectionError(onConnectionError);
  sessionClient.setOnConnectionLost(onConnectionLost);

  sessionClient.connect();
  sessionClient.subscribe(`trivia/update/abort/${hash}/>`, onAbortCallback);

  // await until(() => { sessionClient.readyForUse; });
  // return true;
};

process.on('message', async (data) => {
  if (data.type === TriviaConstants.CONNECTION_REQUEST) {
    console.log('Processing game connection request');
    initSession(data.hash);
  } else if (data.type === TriviaConstants.GAME_START_REQUEST) {
    console.log('Processing game start', data.hash);
    startTriviaRun(data.trivia, data.questions);
  } else if (data.type === TriviaConstants.GAME_END_REQUEST) {
    console.log('Processing game end', data.hash);
  } else if (data.type === TriviaConstants.GAME_ABORT_REQUEST) {
    console.log('Processing game abort', data.hash);
  }
});

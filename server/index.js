/* eslint consistent-return:0 import/order:0 */

const express = require('express');
const session = require('express-session');
const flash = require('express-flash');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const logger = require('./logger');
const favicon = require('serve-favicon');
const path = require('path');
const rawicons = require('./rawicons');
const rawdocs = require('./rawdocs');
const cookieParser = require('cookie-parser');
const argv = require('./argv');
const port = require('./port');
const setup = require('./middlewares/frontendMiddleware');
const isDev = process.env.NODE_ENV !== 'production';
const db = require('./config/db.config');
const ngrok = (isDev && process.env.ENABLE_TUNNEL) || argv.tunnel
  ? require('ngrok')
  : false;
const { resolve } = require('path');
const { verifyToken, verifyAdmin } = require('./middlewares/verifyTokenMiddleware');

require('./config/passport.config');

const app = express();

const ConsoleClient = require('./solace/ConsoleClient');
const ConsoleCallbacks = require('./solace/ConsoleCallbacks');

require('dotenv').config();

// If you need a backend, e.g. an API, add your custom backend-specific middleware here
// app.use('/api', myApi);
// Load material icons
app.use('/api/icons', (req, res) => {
  res.json({
    records: [
      { source: rawicons(req.query) }
    ]
  });
});

app.use(cookieParser());
app.use(session({
  secret: process.env.TRIVIA_SECRET,
  resave: false,
  saveUninitialized: true,
}));

app.use(bodyParser.json()); // <--- Here
app.use(bodyParser.urlencoded({ extended: true }));

app.use(flash());

const consoleClient = new ConsoleClient('console');

const consoleCallbacks = new ConsoleCallbacks();
consoleClient.setOnConnectionSuccess(consoleCallbacks.onConnectionSuccess);
consoleClient.setOnConnectionError(consoleCallbacks.onConnectionError);
consoleClient.setOnConnectionLost(consoleCallbacks.onConnectionLost);
consoleCallbacks.setConsoleClient(consoleClient);

consoleClient.connect();
consoleClient.subscribe('trivia/*/query/info/>', consoleCallbacks.onGameInfoCallback);
// consoleClient.subscribe('trivia/*/query/stats/>', consoleCallbacks.onGameStatsCallback);
consoleClient.subscribe('trivia/*/query/scorecard/>', consoleCallbacks.onScorecardCallback);
consoleClient.subscribe('trivia/*/query/performance/>', consoleCallbacks.onPerformanceCallback);
consoleClient.subscribe('trivia/*/query/leaderboard/>', consoleCallbacks.onLeaderboardCallback);
consoleClient.subscribe('trivia/*/query/eventgroups/>', consoleCallbacks.onEventGroupsCallback);
consoleClient.subscribe('trivia/*/query/getrank/>', consoleCallbacks.onGetRankCallback);
consoleClient.subscribe('trivia/*/query/validation/>', consoleCallbacks.onValidateCallback);
consoleClient.subscribe('trivia/*/query/winner/>', consoleCallbacks.onWinnerCheckCallback);
consoleClient.subscribe('trivia/*/update/start/>', consoleCallbacks.onStartCallback);
consoleClient.subscribe('trivia/*/update/chat/>', consoleCallbacks.onChatCallback);
consoleClient.subscribe('trivia/*/update/answer/>', consoleCallbacks.onAnswerCallback);
consoleClient.subscribe('trivia/*/update/user/>', consoleCallbacks.onUserUpdateCallback);
consoleClient.subscribe('trivia/*/update/winner/>', consoleCallbacks.onWinnerUpdateCallback);
consoleClient.subscribe('trivia/*/broadcast/gameended/>', consoleCallbacks.onGameEndedCallback);
consoleClient.subscribe('trivia/*/broadcast/restart', consoleCallbacks.onGameRestartCallback);
consoleCallbacks.setupPlayerSynch();

const monitorClient = new ConsoleClient('monitor');

const monitorCallbacks = new ConsoleCallbacks();
monitorClient.setOnConnectionSuccess(monitorCallbacks.onConnectionSuccess);
monitorClient.setOnConnectionError(monitorCallbacks.onConnectionError);
monitorClient.setOnConnectionLost(monitorCallbacks.onConnectionLost);
monitorCallbacks.setConsoleClient(monitorClient);

monitorClient.connect();
monitorClient.subscribe('trivia/*/>', monitorCallbacks.onTriviaActivityCallback);

// api routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/trivia/auth', (req, res, next) => {
  next();
}, authRoutes);

const memberRoutes = require('./routes/memberRoutes');
app.use('/api/trivia/members', verifyAdmin, (req, res, next) => {
  next();
}, memberRoutes);

const categoryRoutes = require('./routes/categoryRoutes');
app.use('/api/trivia/categories', verifyToken, (req, res, next) => {
  next();
}, categoryRoutes);

const questionRoutes = require('./routes/questionRoutes');
app.use('/api/trivia/questions', verifyToken, (req, res, next) => {
  next();
}, questionRoutes);

const dashboardRoutes = require('./routes/dashboardRoutes');
app.use('/api/trivia/dashboard', verifyToken, (req, res, next) => {
  next();
}, dashboardRoutes);

const triviaRoutes = require('./routes/triviaRoutes');
app.use('/api/trivia/trivias', verifyToken, (req, res, next) => {
  req.client = consoleClient;
  next();
}, triviaRoutes);

const fakerRoutes = require('./routes/fakerRoutes');
app.use('/api/trivia/faker', (req, res, next) => {
  next();
}, fakerRoutes);

// app.use('/gameassets', express.static('public/gameassets', { etag: false }));
app.get('/gamepage', (req, res) => {
  console.log(req.params);
  res.sendFile(path.join(__dirname, '../public/static/index.html'));
});
app.use('/', express.static('public/static', { etag: false }));

app.use(favicon(path.join('public', 'favicons', 'favicon.ico')));

// In production we need to pass these values in instead of relying on webpack
setup(app, {
  outputPath: resolve(process.cwd(), 'build'),
  publicPath: '/',
});

// get the intended host and port number, use localhost and port 3000 if not provided
const customHost = argv.host || process.env.HOST;
const host = customHost || null; // Let http.Server use its default IPv6/4 host
const prettyHost = customHost || 'localhost';

// use the gzipped bundle
app.get('*.js', (req, res, next) => {
  req.url = req.url + '.gz'; // eslint-disable-line
  res.set('Content-Encoding', 'gzip');
  next();
});

mongoose
  .connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('Successfully connect to MongoDB.'))
  .catch(err => {
    logger.error('Connection error', err);
    process.exit(1);
  });
mongoose.set('toJSON', {
  virtuals: true,
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  console.error('Requested endpoint is not found on server : ' + req.path);
  res.status(404);
  res.send('The requested endpoint is not found on server');
});

app.use((err, req, res, next) => {
  console.error('Encountered Error', err.message);
  // eslint-disable-next-line no-param-reassign
  if (!err.statusCode) err.statusCode = 500;
  res.status(err.statusCode).send(err.message);
});

// Start your app.
app.listen(port, host, async err => {
  if (err) {
    return logger.error(err.message);
  }

  // Connect to ngrok in dev mode
  if (ngrok) {
    let url;
    try {
      url = await ngrok.connect(port);
    } catch (e) {
      return logger.error(e);
    }
    logger.appStarted(port, prettyHost, url);
  } else {
    logger.appStarted(port, prettyHost);
  }
});

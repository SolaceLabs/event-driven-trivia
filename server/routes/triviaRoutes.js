/* eslint-disable arrow-body-style */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-path-concat */
/* eslint-disable no-param-reassign */
/* eslint-disable camelcase */
/* eslint-disable no-plusplus */
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');
const MomentUtils = require('@date-io/moment');
const shortHash = require('shorthash2');
const qr = require('qrcode');
const Trivia = require('../models/trivia');

const utils = new MomentUtils();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/uploads');
  },
  filename: (req, file, cb) => {
    const fileName = file.originalname.toLowerCase().split(' ').join('-');
    cb(null, fileName);
  }
});

const upload = multer({
  storage,
  // eslint-disable-next-line consistent-return
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/plain' || file.mimetype === 'text/tab-separated-values') {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error('Only .txt or .tsv file with tab-separated content allowed!'));
    }
  }
});

const validateTriviaTemplate = (filename) => {
  let lineNumber = 1;
  let errorLine;
  const allFileContents = fs.readFileSync(filename, 'utf-8');
  const allLines = allFileContents.split(/\r?\n/);
  for (let i = 1; i < allLines.length; i++) {
    console.log(allLines[i]);
    if (allLines[i].length && allLines[i].split('\t').length < 7) {
      errorLine = lineNumber;
      break;
    }
    lineNumber++;
  }

  if (errorLine) { return { valid: false, message: 'Invalid trivia information on line number: ' + errorLine }; }
  console.log('Number of trivias: ' + lineNumber);
  return { valid: true };
};

const handleValidationError = (err) => {
  let message;
  const key = Object.keys(err.errors);
  if (err.errors[key[0]] && err.errors[key[0]].properties) {
    message = err.errors[key[0]].properties.message;
  }
  return message;
};

router.get('/test', async (req, res) => res.send('trivia route testing!'));

router.get('/', async (req, res) => {
  const as_array = req?.query?.as_array && req?.query?.as_array === 'true';
  const show_deleted = req?.query?.show_deleted && req?.query?.show_deleted === 'true';
  Trivia.find(show_deleted ? {} : { deleted: false })
    .populate('questions')
    .sort({ deleted: 1 })
    .then(trivias => {
      if (trivias.length > 0) {
        trivias.map(trivia => {
          if (trivia.status === 'SCHEDULED'
              && utils.moment().diff(utils.moment(trivia.start_at)) > 0) {
            trivia.status = 'EXPIRED';
            Trivia.findByIdAndUpdate(trivia.id, trivia, { new: true })
              .then(console.log('Update trivia successful'))
              .catch(err => console.log('Update trivia failed', err));
          }
          if (trivia.status === 'NEW' && trivia.questions.length) {
            trivia.status = 'READY';
            Trivia.findByIdAndUpdate(trivia.id, trivia, { new: true })
              .then(console.log('Update trivia successful'))
              .catch(err => console.log('Update trivia failed', err));
          }

          return trivia;
        });
      }
      res.json({
        success: true,
        message: 'Get trivias successful',
        data: as_array
          ? trivias.map(c => [c._id, c.name, c.description, c.audience, c.category, // 0-4
            c.questions, c.scheduled, c.start_at, c.close_at, c.status, // 5-9
            c.mode, c.no_of_questions, c.time_limit, c.hash, c.deleted, // 10-14
            c.collect_winners, c.no_of_winners, c.winners // 15-17
          ])
          : trivias
      });
    })
    .catch(err => {
      const message = 'Trivias get failed';
      console.log(err);
      console.log(message);
      return res.json({ success: false, message, });
    });
});

router.get('/template', async (req, res) => {
  const fileName = 'trivias_tpl.tsv';
  const path = __dirname + '/../../public/downloads/';

  res.download(path + fileName, (err) => {
    if (err) {
      res.json({ success: false, message: 'File can not be downloaded: ' + err, status: 500 });
    }
  });
});

router.get('/hash/:hash', async (req, res) => {
  const as_array = req?.query?.as_array && req?.query?.as_array === 'true';
  Trivia.find({ hash: req.params.hash })
    .populate('questions')
    .then(trivias => {
      if (trivias.length > 0) {
        trivias.map(trivia => {
          if (trivia.status === 'SCHEDULED'
              && utils.moment().diff(utils.moment(trivia.start_at)) > 0) {
            trivia.status = 'EXPIRED';
            Trivia.findByIdAndUpdate(trivia.id, trivia, { new: true })
              .then(console.log('Update trivia successful'))
              .catch(err => console.log('Update trivia failed', err));
          }
          if (trivia.status === 'NEW' && trivia.questions.length) {
            trivia.status = 'READY';
            Trivia.findByIdAndUpdate(trivia.id, trivia, { new: true })
              .then(console.log('Update trivia successful'))
              .catch(err => console.log('Update trivia failed', err));
          }

          return trivia;
        });
        res.json({
          success: true,
          message: 'Get trivias successful',
          data: as_array
            ? trivias.map(c => [c._id, c.name, c.description, c.audience, c.category,
              c.questions, c.scheduled, c.start_at, c.close_at, c.status,
              c.mode, c.no_of_questions, c.time_limit, c.hash, c.deleted])
            : trivias
        });
      } else {
        res.json({ success: false, message: 'No trivia found for the given hashcode' });
      }
    })
    .catch(err => {
      const message = 'No Trivia found';
      console.log(err);
      console.log(message);
      return res.json({ success: false, message, });
    });
});

router.get('/:id', async (req, res) => {
  Trivia.findById(req.params.id)
    .then(trivia => {
      if (trivia.status === 'SCHEDULED'
          && utils.moment().diff(utils.moment(trivia.start_at)) > 0) {
        trivia.status = 'EXPIRED';
        Trivia.findByIdAndUpdate(trivia.id, trivia, { new: true })
          .then(console.log('Update trivia successful'))
          .catch(err => console.log('Update trivia failed', err));
        res.json({ success: true, data: trivia, message: 'Get trivia successful' });
      }
      if (trivia.status === 'NEW' && trivia.questions.length) {
        trivia.status = 'READY';
        Trivia.findByIdAndUpdate(trivia.id, trivia, { new: true })
          .then(console.log('Update trivia successful'))
          .catch(err => console.log('Update trivia failed', err));
      }
    })
    .catch(err => {
      const message = 'No Trivia found';
      console.log(err);
      console.log(message);
      return res.json({ success: false, message, });
    });
});

router.post('/', async (req, res) => {
  const trivia = req.body;
  trivia.hash = trivia.hash ? trivia.hash : shortHash(trivia.name + '@' + (new Date()).getMilliseconds());
  trivia.adminHash = trivia.adminHash ? trivia.adminHash : shortHash(trivia.hash + ' => ' + trivia.name + '@' + (new Date()).getMilliseconds());
  trivia.players = {
    names: [], connected: [], current: 0, high: 0
  };
  trivia.owner = req.user._id;

  Trivia.create(trivia)
    .then(_trivia => {
      res.json({ success: true, data: _trivia, message: 'Create trivia successful' });
    })
    .catch(err => {
      let message = 'Trivia add failed';
      if (err.name === 'ValidationError') message = handleValidationError(err);
      console.log(err);
      console.log(message);
      return res.json({ success: false, message, });
    });
});

router.post('/clone/:id', async (req, res) => {
  Trivia.findById(req.params.id)
    .then(trivia => {
      trivia._id = mongoose.Types.ObjectId();
      trivia.isNew = true;
      trivia.name += ' (Clone)';
      trivia.status = trivia.questions.length ? 'READY' : 'NEW';
      trivia.hash = shortHash(trivia.name + '@' + (new Date()).getMilliseconds());
      trivia.adminHash = shortHash(trivia.hash + ' => ' + trivia.name + '@' + (new Date()).getMilliseconds());
      trivia.owner = req.user._id;
      trivia.deleted = false;

      Trivia.create(trivia)
        .then(__trivia => {
          res.json({ success: true, data: trivia, message: 'Clone trivia successful' });
        })
        .catch(err => {
          let message = 'Trivia clone failed';
          if (err.name === 'ValidationError') message = handleValidationError(err);
          console.log(err);
          console.log(message);
          return res.json({ success: false, message, });
        });
    })
    .catch(err => {
      const message = 'No Trivia found';
      console.log(err);
      console.log(message);
      return res.json({ success: false, message, });
    });
});

router.post('/reopen/:id', async (req, res) => {
  Trivia.findByIdAndUpdate(req.params.id, {
    players: {
      names: [], connected: [], current: 0, high: 0
    },
    chat: [],
    winners: [],
    answers: [],
    score: []
  }, { new: true })
    .then(trivia => {
      trivia.status = trivia.questions.length ? 'READY' : 'NEW';
      trivia.save();
      if (req.client) {
        req.client.publish(`trivia/${trivia.hash}/broadcast/restart`, trivia);
      }
      res.json({ success: true, data: trivia, message: 'Reopen trivia successful' });
    });
});

router.post('/scan', async (req, res) => {
  const trivia = req.body;
  const opts = {
    width: 512,
    color: {
      dark: '#010599FF',
      light: '#FFBF60FF'
    }
  };

  qr.toDataURL(trivia.url, opts, (err, src) => {
    if (err) res.json({ success: false, message: 'Error occurred', });
    return res.json({ success: true, data: src, });
  });
});

router.post('/adminscan', async (req, res) => {
  const trivia = req.body;
  const opts = {
    width: 512,
    color: {
      dark: '#010599FF',
      light: '#FFBF60FF'
    }
  };

  const _trivia = await Trivia.findById(req.body.id);
  qr.toDataURL(trivia.url, opts, (err, src) => {
    if (err) res.json({ success: false, message: 'Error occurred', });
    return res.json({ success: true, data: src, adminCode: _trivia.adminHash });
  });
});

router.post('/upload', upload.single('csvFile'), async (req, res, next) => {
  const filename = __dirname + '/../../public/uploads/' + req.file.filename;
  const status = validateTriviaTemplate(filename);
  if (!status.valid) { return res.json({ success: false, message: status.message, }); }

  const allFileContents = fs.readFileSync(filename, 'utf-8');
  const allLines = allFileContents.split(/\r?\n/);
  for (let i = 1; i < allLines.length; i++) {
    try {
      if (allLines[i].length) {
        console.log('before save');
        const fields = allLines[i].split('\t');
        const trivia = await Trivia.create({
          category: fields[0],
          trivia: fields[1],
          choice_1: fields[2],
          choice_2: fields[3],
          choice_3: fields[4],
          choice_4: fields[5],
          answer: fields[6]
        });
        console.log('after save');
        console.log('Trivia created: ', trivia);
      }
    } catch (error) {
      return res.json({ success: false, message: error.message, });
    }
  }

  return res.send({ code: 200, status: true, message: 'ok' });
});

router.put('/:id', async (req, res) => {
  const trivia = req.body;
  const _trivia = await Trivia.findById(req.params.id);
  if (_trivia.status === 'STARTED') {
    res.json({ success: false, data: _trivia, message: 'Could not save changes, Trivia is in progress - Try again later!' });
    return;
  }
  if (_trivia.status === 'COMPLETED' || _trivia.status === 'ABORTED') {
    res.json({ success: false, data: _trivia, message: 'Could not save changes, Trivia is either completed or aborted - Clone to make changes!' });
    return;
  }

  let questionsUpdated = !_trivia.questions.length;
  if (!questionsUpdated) {
    _trivia.questions.forEach((q, index) => {
      const found = (q._id.toString() !== _trivia.questions[index]._id.toString());
      questionsUpdated = !questionsUpdated && !found;
    });
  }
  if (questionsUpdated) {
    trivia.score = [];
    trivia.answers = [];
  }

  trivia.hash = _trivia.hash ? _trivia.hash : shortHash(trivia.name + '@' + (new Date()).getMilliseconds());
  trivia.adminHash = _trivia.adminHash ? _trivia.adminHash : shortHash(trivia.hash + ' => ' + trivia.name + '@' + (new Date()).getMilliseconds());
  Trivia.findByIdAndUpdate(req.body.id, trivia, { new: true })
    .then(() => {
      res.json({ success: true, data: trivia, message: 'Update trivia successful' });
    })
    .catch(err => {
      let message = 'Trivia update failed';
      if (err.name === 'ValidationError') message = handleValidationError(err);
      console.log(err);
      console.log(message);
      return res.json({ success: false, message, });
    });
});

router.delete('/:id', async (req, res) => {
  const trivia = await Trivia.findById(req.params.id);
  trivia.deleted = !trivia.deleted;
  await Trivia.findByIdAndUpdate(req.params.id, trivia, { new: true });

  res.json({ success: true, message: 'Delete trivia successful' });
});

router.post('/delete', async (req, res) => {
  for (let i = 0; i < req.body.ids.length; i++) {
    const trivia = await Trivia.findById(req.body.ids[i]);
    trivia.deleted = !trivia.deleted;
    await Trivia.findByIdAndUpdate(req.body.ids[i], trivia, { new: true });
  }
  res.json({ success: true, message: 'Delete trivia(s) successful' });
});

module.exports = router;

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
const TriviaStats = require('../models/triviastats');

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
  Trivia.find()
    .populate('questions')
    .then(trivias => {
      if (trivias.length > 0) {
        trivias.map(trivia => {
          if (trivia.status === 'SCHEDULED'
              && utils.moment().diff(utils.moment(trivia.start_at)) > 0) {
            trivia.status = 'EXPIRED';
            Trivia.findByIdAndUpdate(trivia.id, trivia)
              .then(console.log('Update trivia successful'))
              .catch(err => console.log('Update trivia failed', err));
          }
          if (trivia.status === 'NEW' && trivia.questions.length) {
            trivia.status = 'READY';
            Trivia.findByIdAndUpdate(trivia.id, trivia)
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
          ? trivias.map(c => [c._id, c.name, c.description, c.audience, c.category,
            c.questions, c.scheduled, c.start_at, c.close_at, c.status,
            c.mode, c.no_of_questions, c.time_limit, c.hash])
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
            Trivia.findByIdAndUpdate(trivia.id, trivia)
              .then(console.log('Update trivia successful'))
              .catch(err => console.log('Update trivia failed', err));
          }
          if (trivia.status === 'NEW' && trivia.questions.length) {
            trivia.status = 'READY';
            Trivia.findByIdAndUpdate(trivia.id, trivia)
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
              c.mode, c.no_of_questions, c.time_limit, c.hash])
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
        Trivia.findByIdAndUpdate(trivia.id, trivia)
          .then(console.log('Update trivia successful'))
          .catch(err => console.log('Update trivia failed', err));
        res.json({ success: true, data: trivia, message: 'Get trivia successful' });
      }
      if (trivia.status === 'NEW' && trivia.questions.length) {
        trivia.status = 'READY';
        Trivia.findByIdAndUpdate(trivia.id, trivia)
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

  Trivia.create(trivia)
    .then(_trivia => {
      TriviaStats.findOneAndUpdate(
        { hash: trivia.hash },
        { $push: { questions: _trivia.questions, score: [], answers: [] } },
        { upsert: true, new: true })
        .then(ts => {
          res.json({ success: true, data: _trivia, message: 'Create trivia successful' });
        });
    })
    .catch(err => {
      let message = 'Trivia add failed';
      if (err.name === 'ValidationError') message = handleValidationError(err);
      console.log(err);
      console.log(message);
      return res.json({ success: false, message, });
    });
});

router.post('/clone', async (req, res) => {
  Trivia.findById(req.body.id)
    .then(trivia => {
      trivia._id = mongoose.Types.ObjectId();
      trivia.isNew = true;
      trivia.name += ' (Clone)';
      trivia.status = trivia.questions.length ? 'READY' : 'NEW';
      trivia.hash = shortHash(trivia.name + '@' + (new Date()).getMilliseconds());
      trivia.adminHash = shortHash(trivia.hash + ' => ' + trivia.name + '@' + (new Date()).getMilliseconds());

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

router.post('/reopen', async (req, res) => {
  const trivia = await Trivia.findById(req.body.id);
  trivia.status = trivia.questions.length ? 'READY' : 'NEW';
  trivia.players = {
    names: [], connected: [], current: 0, high: 0
  };
  trivia.chat = [];
  Trivia.findByIdAndUpdate(req.body.id, trivia)
    .then(t => {
      TriviaStats.findOneAndUpdate(
        { hash: trivia.hash },
        { $set: { answers: [], score: [] } },
        { upsert: true, new: true })
        .then(ts => {
          if (req.client) {
            req.client.publish(`trivia/broadcast/restart/${trivia.hash}`, trivia);
          }
          res.json({ success: true, data: trivia, message: 'Reopen trivia successful' });
        });
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
      // const found = trivia.questions.find(a => {
      //   return a._id.toString() === q._id.toString();
      // });
      questionsUpdated = !questionsUpdated && !found;
    });
  }
  trivia.hash = _trivia.hash ? _trivia.hash : shortHash(trivia.name + '@' + (new Date()).getMilliseconds());
  trivia.adminHash = _trivia.adminHash ? _trivia.adminHash : shortHash(trivia.hash + ' => ' + trivia.name + '@' + (new Date()).getMilliseconds());
  Trivia.findByIdAndUpdate(req.params.id, trivia)
    .then(__trivia => {
      if (questionsUpdated) {
        TriviaStats.findOneAndUpdate(
          { hash: trivia.hash },
          {
            $set: { questions: trivia.questions },
            $push: { score: [], answers: [] }
          },
          { upsert: true, new: true })
          .then(ts => {
            res.json({ success: true, data: trivia, message: 'Update trivia successful' });
          });
      } else {
        res.json({ success: true, data: trivia, message: 'Update trivia successful' });
      }
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
  const _trivia = await Trivia.findById(req.params.id);
  if (_trivia.status === 'STARTED') {
    res.json({ success: false, data: _trivia, message: 'Could not delete, Trivia is in progress - Try again later!' });
    return;
  }

  Trivia.findByIdAndRemove(req.params.id, req.body)
    .then(trivia => {
      TriviaStats.remove({ hash: _trivia.hash })
        .then(ts => {
          res.json({ success: true, message: 'Delete trivia successful' });
        });
    })
    .catch(err => {
      let message = 'Trivia delete failed';
      if (err.name === 'ValidationError') message = handleValidationError(err);
      console.log(err);
      console.log(message);
      return res.json({ success: false, message, });
    });
});

router.post('/delete', async (req, res) => {
  let deleted = 0;
  let notDeleted = 0;
  for (let i = 0; i < req.body.ids.length; i++) {
    const _trivia = await Trivia.findById(req.body.ids[i]);
    if (_trivia.status !== 'STARTED') {
      await Trivia.findByIdAndRemove(req.body.ids[i])
        // eslint-disable-next-line no-loop-func
        .then(() => {
          TriviaStats.deleteOne({ hash: _trivia.hash })
            .then(() => {
              deleted++;
            });
        });
    } else {
      notDeleted++;
    }
  }
  if (deleted === 0) {
    res.json({ success: false, message: 'Could not delete, Trivia(s) are in progress, try again later!' });
  } else {
    res.json({ success: true, message: 'Could not delete ' + notDeleted + ' in progress Trivias, ' + deleted + ' Trivia(s) successfully deleted' });
  }
});

module.exports = router;

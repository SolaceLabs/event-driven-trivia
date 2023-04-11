/* eslint-disable no-await-in-loop */
/* eslint-disable no-path-concat */
/* eslint-disable no-param-reassign */
/* eslint-disable camelcase */
/* eslint-disable no-plusplus */
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const Question = require('../models/question');

const isLoggedIn = (req, res, next) => {
  req.user ? next() : res.sendStatus(401);
};

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

const validateQuestionTemplate = (filename) => {
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

  if (errorLine) { return { valid: false, message: 'Invalid question information on line number: ' + errorLine }; }
  console.log('Number of questions: ' + lineNumber);
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

router.get('/test', isLoggedIn, async (req, res) => res.send('question route testing!'));

router.get('/', isLoggedIn, async (req, res) => {
  let filter = [];
  if (req.query.category) {
    filter = JSON.parse(req.query.category);
  }

  if (!filter.length) {
    res.json({ success: false, message: 'No questions found', });
    return;
  }

  Question
    .find({
      category: {
        $in: filter
      }
    })
    .then(questions => res.json({
      success: true,
      message: 'Get questions successful',
      data: questions.map(q => [q._id, q.category, q.question,
        q.choice_1, q.choice_2, q.choice_3,
        q.choice_4, q.answer])
    }))
    .catch(err => {
      const message = 'Questions get failed';
      console.log(err);
      console.log(message);
      return res.json({ success: false, message, });
    });
});

router.get('/template', isLoggedIn, async (req, res) => {
  const fileName = 'questions_tpl.tsv';
  const path = __dirname + '/../../public/downloads/';

  res.download(path + fileName, (err) => {
    if (err) {
      res.json({ success: false, message: 'File can not be downloaded: ' + err, status: 500 });
    }
  });
});

// eslint-disable-next-line consistent-return
router.get('/random', isLoggedIn, async (req, res) => {
  const category = req?.query?.category;
  const count = req?.query?.count ? parseInt(req?.query?.count, 10) : 10;

  if (!category) {
    const message = 'Missing category in query parameter';
    console.log(message);
    return res.json({ success: false, message, });
  }

  Question.aggregate([
    { $match: { category: { $eq: category } } },
    { $sample: { size: count } }
  ])
    .then(questions => res.json({ success: true, data: questions, message: 'Get questions successful' }))
    .catch(err => {
      const message = 'Questions get random sample failed';
      console.log(err);
      console.log(message);
      res.json({ success: false, message, });
    });
});

router.get('/:id', isLoggedIn, async (req, res) => {
  Question.findById(req.params.id)
    .then(question => res.json({ success: true, data: question, message: 'Add question successful' }))
    .catch(err => {
      const message = 'No Question found';
      console.log(err);
      console.log(message);
      return res.json({ success: false, message, });
    });
});

router.post('/', isLoggedIn, async (req, res) => {
  req.body.owner = req.user._id;
  Question.create(req.body)
    .then(question => res.json({ success: true, data: question, message: 'Create question successful' }))
    .catch(err => {
      let message = 'Question add failed';
      if (err.name === 'ValidationError') message = handleValidationError(err);
      console.log(err);
      console.log(message);
      return res.json({ success: false, message, });
    });
});

router.post('/clone', isLoggedIn, async (req, res) => {
  Question.findById(req.body.id)
    .then(question => {
      question._id = mongoose.Types.ObjectId();
      question.isNew = true;
      question.owner = req.user.id;
      Question.create(question)
        .then(__question => {
          res.json({ success: true, data: question, message: 'Clone question successful' });
        })
        .catch(err => {
          let message = 'Question clone failed';
          if (err.name === 'ValidationError') message = handleValidationError(err);
          console.log(err);
          console.log(message);
          return res.json({ success: false, message, });
        });
    })
    .catch(err => {
      const message = 'No Question found';
      console.log(err);
      console.log(message);
      return res.json({ success: false, message, });
    });
});

router.put('/:id', isLoggedIn, async (req, res) => {
  Question.findByIdAndUpdate(req.params.id, req.body)
    .then(question => res.json({ success: true, data: question, message: 'Update question successful' }))
    .catch(err => {
      let message = 'Question update failed';
      if (err.name === 'ValidationError') message = handleValidationError(err);
      console.log(err);
      console.log(message);
      return res.json({ success: false, message, });
    });
});

router.delete('/:id', isLoggedIn, async (req, res) => {
  Question.findByIdAndRemove(req.params.id, req.body)
    .then(question => res.json({ success: true, message: 'Delete question successful' }))
    .catch(err => {
      let message = 'Question delete failed';
      if (err.name === 'ValidationError') message = handleValidationError(err);
      console.log(err);
      console.log(message);
      return res.json({ success: false, message, });
    });
});

router.post('/delete', isLoggedIn, async (req, res) => {
  for (let i = 0; i < req.body.ids.length; i++) {
    await Question.findByIdAndRemove(req.body.ids[i]);
  }
  res.json({ success: true, message: 'Delete question(s) successful' });
});

// eslint-disable-next-line consistent-return
router.post('/upload', isLoggedIn, upload.single('csvFile'), async (req, res, next) => {
  const filename = __dirname + '/../../public/uploads/' + req.file.filename;
  const status = validateQuestionTemplate(filename);
  if (!status.valid) { return res.json({ success: false, message: status.message, }); }

  const allFileContents = fs.readFileSync(filename, 'utf-8');
  const allLines = allFileContents.split(/\r?\n/);
  for (let i = 1; i < allLines.length; i++) {
    try {
      if (allLines[i].length) {
        console.log('before save');
        const fields = allLines[i].split('\t');
        const question = await Question.create({
          category: fields[0],
          question: fields[1],
          choice_1: fields[2],
          choice_2: fields[3],
          choice_3: fields[4],
          choice_4: fields[5],
          answer: fields[6]
        });
        console.log('after save');
        console.log('Question created: ', question);
      }
    } catch (error) {
      return res.json({ success: false, message: error.message, });
    }
  }

  res.send({ code: 200, status: true, message: 'ok' });
});

module.exports = router;

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
const Category = require('../models/category');

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

router.get('/test', async (req, res) => res.send('question route testing!'));

router.get('/', async (req, res) => {
  const show_deleted = req?.query?.show_deleted && req?.query?.show_deleted === 'true';
  const categories = req?.query?.category;
  const filter = categories ? JSON.parse(categories) : [];
  if (!filter.length) {
    res.json({ success: false, message: 'No questions found, expand the category and refresh', });
    return;
  }

  await Question.find(show_deleted ? { deleted: true, category: { $in: filter } } : { deleted: false, category: { $in: filter } })
    .populate('owner')
    .sort({ deleted: 1 })
    .then(questions => {
      res.json({
        success: true,
        message: 'Get questions successful',
        data: questions.map(q => [q._id, q.category, q.question,
          q.choice_1, q.choice_2, q.choice_3,
          q.choice_4, q.answer, q.deleted, q.owner._id])
      });
    })
    .catch(err => {
      const message = 'Questions get failed';
      console.log(err);
      console.log(message);
      return res.json({ success: false, message, });
    });
});

router.get('/template', async (req, res) => {
  const fileName = 'questions_tpl.tsv';
  const path = __dirname + '/../../public/downloads/';

  res.download(path + fileName, (err) => {
    if (err) {
      res.json({ success: false, message: 'File can not be downloaded: ' + err, status: 500 });
    }
  });
});

// eslint-disable-next-line consistent-return
router.get('/random', async (req, res) => {
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

router.get('/:id', async (req, res) => {
  Question.findById(req.params.id)
    .then(question => res.json({ success: true, data: question, message: 'Add question successful' }))
    .catch(err => {
      const message = 'No Question found';
      console.log(err);
      console.log(message);
      return res.json({ success: false, message, });
    });
});

router.post('/', async (req, res) => {
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

router.post('/clone/:id', async (req, res) => {
  Question.findById(req.params.id)
    .then(question => {
      question._id = mongoose.Types.ObjectId();
      question.isNew = true;
      question.owner = req.user.id;
      question.deleted = false;

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

router.post('/search', async (req, res) => {
  const categories = req.body.category;
  if (!categories.length) {
    res.json({ success: false, message: 'No questions found, expand the category and refresh', });
    return;
  }
  Question.find({ category: { $in: categories }, $text: { $search: req.body.phrase } })
    .then(questions => res.json({ success: true, questions }))
    .catch(err => {
      const message = 'No Question found';
      console.log(err);
      console.log(message);
      return res.json({ success: false, message, });
    });
});

router.put('/:id', async (req, res) => {
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

router.delete('/:id', async (req, res) => {
  const question = await Question.findById(req.params.id);
  question.deleted = !question.deleted;
  await Question.findByIdAndUpdate(req.params.id, question);

  res.json({ success: true, message: 'Delete question successful' });
});

router.post('/delete', async (req, res) => {
  for (let i = 0; i < req.body.ids.length; i++) {
    const question = await Question.findById(req.body.ids[i]);
    question.deleted = !question.deleted;
    await Question.findByIdAndUpdate(req.body.ids[i], question);
  }
  res.json({ success: true, message: 'Delete question(s) successful' });
});

// eslint-disable-next-line consistent-return
router.post('/upload', upload.single('csvFile'), async (req, res, next) => {
  const filename = __dirname + '/../../public/uploads/' + req.file.filename;
  const status = validateQuestionTemplate(filename);
  if (!status.valid) { return res.json({ success: false, message: status.message, }); }

  const allFileContents = fs.readFileSync(filename, 'utf-8');
  const allLines = allFileContents.split(/\r?\n/);
  const questions = [];
  for (let i = 1; i < allLines.length; i++) {
    const fields = allLines[i].split('\t');
    questions.push({
      category: fields[0],
      question: fields[1],
      choice_1: fields[2],
      choice_2: fields[3],
      choice_3: fields[4],
      choice_4: fields[5],
      answer: fields[6],
      owner: req.user._id,
    });
  }

  const categories = questions.map((item) => item.category).filter((value, index, self) => self.indexOf(value) === index);
  for (let i = 0; i < categories.length; i++) {
    const category = await Category.find({ name: categories[i] });
    if (!category.length) await Category.insertMany([{ name: categories[i], owner: req.user._id }]);
  }

  try {
    await Question.insertMany(questions);
  } catch (error) {
    return res.json({ success: false, message: error.message, });
  }

  res.send({ code: 200, status: true, message: 'ok' });
});

module.exports = router;

/* eslint-disable no-await-in-loop */
/* eslint-disable no-path-concat */
/* eslint-disable no-param-reassign */
/* eslint-disable camelcase */
/* eslint-disable no-plusplus */
/* eslint-disable consistent-return */
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const Category = require('../models/category');
const Question = require('../models/question');
const Trivia = require('../models/trivia');

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
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/plain' || file.mimetype === 'text/tab-separated-values') {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error('Only .txt or .tsv file with tab-separated content allowed!'));
    }
  }
});

const validateCategoryTemplate = (filename) => {
  let lineNumber = 1;
  let errorLine;
  const allFileContents = fs.readFileSync(filename, 'utf-8');
  const allLines = allFileContents.split(/\r?\n/);
  for (let i = 1; i < allLines.length; i++) {
    console.log(allLines[i]);
    if (allLines[i] && allLines[i].split('\t').length < 2) {
      errorLine = lineNumber;
      break;
    }
    lineNumber++;
  }

  if (errorLine) { return { valid: false, message: 'Invalid category information on line number: ' + errorLine }; }
  console.log('Number of categories: ' + lineNumber);
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

router.get('/test', async (req, res) => res.send('category route testing!'));

router.get('/', async (req, res) => {
  const as_array = req?.query?.as_array && req?.query?.as_array === 'true';
  const show_deleted = req?.query?.show_deleted && req?.query?.show_deleted === 'true';
  Category.find(show_deleted ? {} : { deleted: false })
    .populate('no_of_questions')
    .populate('owner')
    .sort({ deleted: 1 })
    .then(categories => res.json({
      success: true,
      message: 'Get categories successful',
      data: as_array
        ? categories.map(c => [c._id, c.name, c.description, c.no_of_questions, c.deleted, c.shared, c.owner.name])
        : categories
    }))
    .catch(err => {
      const message = 'Categories get failed';
      console.log(err);
      console.log(message);
      return res.json({ success: false, message, });
    });
});

router.get('/shared', async (req, res) => {
  const as_array = req?.query?.as_array && req?.query?.as_array === 'true';
  const show_deleted = req?.query?.show_deleted && req?.query?.show_deleted === 'true';
  Category.find(show_deleted ? { shared: true } : { shared: true, deleted: false })
    .populate('owner')
    .populate('no_of_questions')
    .then(categories => res.json({
      success: true,
      message: 'Get shared categories successful',
      data: as_array
        ? categories.map(c => [c._id, c.name, c.description, c.no_of_questions, c.deleted, c.shared, c.owner.name])
        : categories
    }))
    .catch(err => {
      const message = 'Shared Categories get failed';
      console.log(err);
      console.log(message);
      return res.json({ success: false, message, });
    });
});

router.get('/template', async (req, res) => {
  const fileName = 'categories_tpl.tsv';
  const path = __dirname + '/../../public/downloads/';
  console.log('FILE: ' + path + fileName);

  res.download(path + fileName, (err) => {
    if (err) {
      res.json({ success: false, message: 'File can not be downloaded: ' + err, status: 500 });
    }
  });
});

router.get('/:id', async (req, res) => {
  Category.findById(req.params.id)
    .then(category => res.json({ success: true, data: category, message: 'Get category successful' }))
    .catch(err => {
      const message = 'No Category found';
      console.log(err);
      console.log(message);
      return res.json({ success: false, message, });
    });
});

router.post('/', async (req, res) => {
  req.body.owner = req.user._id;
  Category.create(req.body)
    .then(category => res.json({ success: true, data: category, message: 'Create category successful' }))
    .catch(err => {
      let message = 'Category add failed';
      if (err.name === 'ValidationError') message = handleValidationError(err);
      console.log(err);
      console.log(message);
      return res.json({ success: false, message, });
    });
});

router.post('/clone/:id', async (req, res) => {
  Category.findById(req.params.id)
    .then(category => {
      category.owner = req.user._id;
      category._id = mongoose.Types.ObjectId();
      category.isNew = true;
      category.name += ' (Clone)';
      category.deleted = false;

      Category.create(category)
        .then(__category => {
          res.json({ success: true, data: category, message: 'Clone category successful' });
        })
        .catch(err => {
          let message = 'Category clone failed';
          if (err.name === 'ValidationError') message = handleValidationError(err);
          console.log(err);
          console.log(message);
          return res.json({ success: false, message, });
        });
    })
    .catch(err => {
      const message = 'No Category found';
      console.log(err);
      console.log(message);
      return res.json({ success: false, message, });
    });
});

router.post('/toggleshare/:id', async (req, res) => {
  Category.findById({ _id: req.params.id })
    .then(category => {
      category.shared = !category.shared;
      category.save();
      res.json({ success: true, data: category, message: 'Toggle share category successful' });
    });
});

router.put('/:id', async (req, res) => {
  const newCategory = req.body;
  const currCategory = await Category.findById(req.params.id);
  const nameChanged = newCategory.name !== currCategory.name;
  Category.findByIdAndUpdate(req.params.id, req.body)
    .then(async category => {
      if (nameChanged) {
        await Question.updateMany({ category: currCategory.name }, { category: newCategory.name });
        await Trivia.updateMany({ category: currCategory.name }, { category: newCategory.name });
      }
      res.json({ success: true, data: category, message: 'Update category successful' });
    })
    .catch(err => {
      let message = 'Category update failed';
      if (err.name === 'ValidationError') message = handleValidationError(err);
      console.log(err);
      console.log(message);
      return res.json({ success: false, message, });
    });
});

router.delete('/:id', async (req, res) => {
  const category = await Category.findById(req.params.id);
  category.deleted = !category.deleted;
  await category.save();

  res.json({ success: true, message: 'Delete category successful' });
});

router.post('/delete', async (req, res) => {
  for (let i = 0; i < req.body.ids.length; i++) {
    const category = await Category.findById(req.body.ids[i]);
    category.deleted = !category.deleted;
    category.shared = (category.deleted ? false : category.shared);
    await category.save();
  }
  res.json({ success: true, message: 'Delete category(s) successful' });
});

router.post('/upload', upload.single('csvFile'), async (req, res, next) => {
  const filename = __dirname + '/../../public/uploads/' + req.file.filename;
  const status = validateCategoryTemplate(filename);
  if (!status.valid) {
    return res.json({ success: false, message: status.message, });
  }

  const allFileContents = fs.readFileSync(filename, 'utf-8');
  const allLines = allFileContents.split(/\r?\n/);
  for (let i = 1; i < allLines.length; i++) {
    try {
      if (allLines[i].length) {
        console.log('before save');
        const fields = allLines[i].split('\t');
        const category = await Category.create({ name: fields[0], description: fields[1], owner: req.user._id });
        console.log('after save');
        console.log('Category created: ', category);
      }
    } catch (error) {
      return res.json({ success: false, message: error.message, });
    }
  }

  res.send({ code: 200, status: true, message: 'ok' });
});

module.exports = router;

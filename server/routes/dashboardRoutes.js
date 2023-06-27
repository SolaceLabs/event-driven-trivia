/* eslint-disable no-return-assign */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-path-concat */
/* eslint-disable no-param-reassign */
/* eslint-disable camelcase */
/* eslint-disable no-plusplus */
/* eslint-disable consistent-return */
// eslint-disable-next-line no-return-assign
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const Trivia = require('../models/trivia');
const Question = require('../models/question');
const Category = require('../models/category');

router.get('/test', async (req, res) => res.send('user route testing!'));

router.get('/metics', async (req, res) => {
  const data = {};
  await Trivia.count({})
    .then(count => data.trivias = count);
  await Trivia.count({ owner: { $eq: req.user._id } })
    .then(count => data.yourTrivias = count);

  await Question.count({})
    .then(count => data.questions = count);
  await Question.count({ owner: { $eq: req.user._id } })
    .then(count => data.yourQuestions = count);

  await Category.count({})
    .then(count => data.categories = count);
  await Category.count({ owner: { $eq: req.user._id } })
    .then(count => data.yourCategories = count);

  await Trivia.aggregate([{ $group: { _id: null, count: { $sum: '$players.high' } } }])
    .then(result => {
      data.engagements = result[0] ? result[0].count : 0;
    });
  await Trivia.aggregate([
    { $match: { owner: req.user._id } },
    { $group: { _id: null, count: { $sum: '$players.high' } } }])
    .then(result => {
      data.yourEngagements = result[0] ? result[0].count : 0;
    });

  return res.json({ success: true, data });
});

module.exports = router;

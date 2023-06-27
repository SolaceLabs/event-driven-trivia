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
const User = require('../models/user');

const handleValidationError = (err) => {
  let message;
  const key = Object.keys(err.errors);
  if (err.errors[key[0]] && err.errors[key[0]].properties) {
    message = err.errors[key[0]].properties.message;
  }
  return message;
};

router.get('/test', async (req, res) => res.send('user route testing!'));

router.get('/', async (req, res) => {
  const as_array = req?.query?.as_array && req?.query?.as_array === 'true';
  const show_deleted = req?.query?.show_deleted && req?.query?.show_deleted === 'true';
  User.find(show_deleted ? {} : { deleted: false })
    .sort({ deleted: 1 })
    .then(users => res.json({
      success: true,
      message: 'Get members successful',
      data: as_array
        ? users.map(c => [c._id, c.name, c.email, c.role, c.status, c.deleted, c.email_is_verified])
        : users
    }))
    .catch(err => {
      const message = 'Members get failed';
      console.log(err);
      console.log(message);
      return res.json({ success: false, message, });
    });
});

router.get('/:id', async (req, res) => {
  User.findById(req.params.id)
    .then(user => res.json({ success: true, data: user, message: 'Get user successful' }))
    .catch(err => {
      const message = 'No Member found';
      console.log(err);
      console.log(message);
      return res.json({ success: false, message, });
    });
});

router.post('/', async (req, res) => {
  req.body.owner = req.user._id;
  
  User.create(req.body)
    .then(user => res.json({ success: true, data: user, message: 'Create user successful' }))
    .catch(err => {
      let message = 'Member add failed';
      if (err.name === 'ValidationError') message = handleValidationError(err);
      console.log(err);
      console.log(message);
      return res.json({ success: false, message, });
    });
});

router.put('/:id', async (req, res) => {
  const newUser = req.body;
  const currUser = await User.findById(req.params.id);
  User.findByIdAndUpdate(req.params.id, req.body)
    .then(async user => {
      res.json({ success: true, data: user, message: 'Update member successful' });
    })
    .catch(err => {
      let message = 'Member update failed';
      if (err.name === 'ValidationError') message = handleValidationError(err);
      console.log(err);
      console.log(message);
      return res.json({ success: false, message, });
    });
});

router.delete('/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  user.deleted = !user.deleted;
  await User.findByIdAndUpdate(req.params.id, user);

  res.json({ success: true, message: 'Delete member successful' });
});

router.post('/delete', async (req, res) => {
  for (let i = 0; i < req.body.ids.length; i++) {
    const user = await User.findById(req.body.ids[i]);
    user.deleted = !user.deleted;
    await User.findByIdAndUpdate(req.body.ids[i], user);
  }
  res.json({ success: true, message: 'Delete member(s) successful' });
});

module.exports = router;

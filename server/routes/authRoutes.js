/* eslint-disable no-await-in-loop */
/* eslint-disable no-path-concat */
/* eslint-disable no-param-reassign */
/* eslint-disable camelcase */
/* eslint-disable no-plusplus */
/* eslint-disable consistent-return */
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const passport = require('passport');
const User = require('../models/user');

require('dotenv').config();

router.get('/test', async (req, res) => res.send('auth route testing!'));

router.post('/logout', (req, res) => {
  console.log('Received /logout');
  req.session.destroy(() => {
    res.json({ success: true, message: 'Successfully logged out' });
  });
});

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (password.length < 8) {
    res.json({ success: false, message: 'Account not created. Password must be 7+ characters long' });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = new User({
      name, email, password: hashedPassword
    });
    user.save();
  } catch (e) {
    res.json({ success: false, message: 'Error creating a new account.' });
  }

  res.json({ success: true, message: 'Account created.' });
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err || !user) return res.json({ success: false, message: err || info?.message, status: 400 });

    // eslint-disable-next-line no-shadow
    req.login(user, { session: false }, (err) => {
      if (err) {
        return res.json({ success: false, message: err });
      }
      // generate a signed son web token with the contents of user object and return it in the response
      const token = jwt.sign({ id: user._id }, process.env.TRIVIA_SECRET);
      return res.json({
        success: true, message: 'Login successful', token
      });
    });
  })(req, res);
});

module.exports = router;

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
const { sendMail } = require('../utils/sendMail');

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

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.json({ success: false, message: 'An Account with the specified email already exists, try signing in' });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await User.create({
      name, email, password: hashedPassword
    });
    const newUser = await User.findOne({ email });
    const verification_token = jwt.sign({ id: newUser._id, email }, process.env.TRIVIA_SECRET);
    const verification_link = `https://trivia.demo.solace.dev/verify?token=${verification_token}`;
    const textMessage = `
    Hello ${name},\n\n
    Are you ready to gain access to Fireball Trivia - Event-driven Trivia built wit Solace PubSub+ platform?\n\n
    First, you must complete your registration by clicking on the button below:\n\n
    ${verification_link}\n\n    
    This link will verify your email address, and then you’ll be a part of the Fireball Trivia community.\n\n    
    See you there!\n\n    
    Best regards,\n
    Fireball Trivia team`;
    const htmlMessage = `
    Hello ${name},<br/><br/>
    Are you ready to gain access to <strong>Fireball Trivia - Event-driven Trivia built with Solace PubSub+ platform</strong>?<br/><br/>
    First, you must complete your registration by clicking on the button below:<br/><br/>
    ${verification_link}<br/><br/>
    This link will verify your email address, and then you’ll be a part of the Fireball Trivia community.<br/><br/>
    See you there!<br/><br/>
    Best regards,<br/>
    Fireball Trivia team`;

    const mail = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject: 'Verify your Fireball Trivia account',
      text: textMessage,
      html: htmlMessage
    };

    sendMail(mail);
  } catch (e) {
    res.json({ success: false, message: 'Error creating a new account.' });
  }

  res.json({ success: true, message: 'Account created.' });
});

router.post('/verify', async (req, res) => {
  const { token } = req.body;

  jwt.verify(token, process.env.TRIVIA_SECRET, async (err, payload) => {
    if (err) {
      res.json({ success: false, message: 'Unauthorized access: Invalid token' });
    } else {
      const user = await User.findById(payload.id);
      if (user.email !== payload.email) {
        res.json({ success: false, message: 'Unauthorized access:: Unknown user' });
        return;
      }

      user.email_is_verified = true;
      await User.findByIdAndUpdate(payload.id, user);
      res.json({ success: true, message: 'Email successfully verified' });
    }
  });
});

router.post('/resend', async (req, res) => {
  const { email } = req.body;

  const existingUser = await User.findOne({ email });
  if (!existingUser) {
    res.json({ success: false, message: 'An Account with the specified email does not exist' });
    return;
  }

  if (existingUser.email_is_verified) {
    res.json({ success: false, message: 'Email is already verified, account is ready for use' });
    return;
  }

  try {
    const verification_token = jwt.sign({ id: existingUser._id, email }, process.env.TRIVIA_SECRET);
    const verification_link = `https://trivia.demo.solace.dev/verify?token=${verification_token}`;
    const textMessage = `
    Hello ${existingUser.name},\n\n
    Are you ready to gain access to Fireball Trivia - Event-driven Trivia built wit Solace PubSub+ platform?\n\n
    First, you must complete your registration by clicking on the button below:\n\n
    ${verification_link}\n\n    
    This link will verify your email address, and then you’ll be a part of the Fireball Trivia community.\n\n    
    See you there!\n\n    
    Best regards,\n
    Fireball Trivia team`;
    const htmlMessage = `
    Hello ${existingUser.name},<br/><br/>
    Are you ready to gain access to <strong>Fireball Trivia - Event-driven Trivia built with Solace PubSub+ platform</strong>?<br/><br/>
    First, you must complete your registration by clicking on the button below:<br/><br/>
    ${verification_link}<br/><br/>
    This link will verify your email address, and then you’ll be a part of the Fireball Trivia community.<br/><br/>
    See you there!<br/><br/>
    Best regards,<br/>
    Fireball Trivia team`;

    const mail = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject: 'Verify your Fireball Trivia account',
      text: textMessage,
      html: htmlMessage
    };

    sendMail(mail);
  } catch (e) {
    res.json({ success: false, message: 'Error resending verification link.' });
  }

  res.json({ success: true, message: 'Email verification link resent.' });
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err || !user) return res.json({ success: false, message: err || info?.message, status: 400 });

    // eslint-disable-next-line no-shadow
    req.login(user, { session: false }, (err) => {
      if (err) {
        return res.json({ success: false, message: err });
      }

      if (!user.email_is_verified) {
        res.json({
          success: false, type: 'Email not verified', message: 'Email not verified, check your spam folders in case if you did not receive verification email'
        });
      } else {
        // generate a signed son web token with the contents of user object and return it in the response
        const token = jwt.sign({ id: user._id }, process.env.TRIVIA_SECRET);
        return res.json({
          success: true, message: 'Login successful', token, name: user.name
        });
      }
    });
  })(req, res);
});

module.exports = router;

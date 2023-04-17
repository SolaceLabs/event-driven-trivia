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
const shortHash = require('shorthash2');
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
    const verification_link = `https://trivia.demo.solace.dev/account-activation?token=${verification_token}`;
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
    res.json({ success: true, message: 'Account created, you will receive an email with verification link for account activation.' });
  } catch (e) {
    res.json({ success: false, message: 'Error creating a new account.' });
  }
});

router.post('/account-activation', async (req, res) => {
  const { token } = req.body;

  jwt.verify(token, process.env.TRIVIA_SECRET, async (err, payload) => {
    if (err) {
      res.json({ success: false, message: 'Unauthorized access: Invalid token' });
    } else {
      const user = await User.findById(payload.id);
      if (user.email !== payload.email) {
        res.json({ success: false, message: 'Unauthorized access: Unknown user' });
        return;
      }

      if (user.email_is_verified) {
        res.json({ success: true, message: 'Email already verified' });
        return;
      }

      user.status = 'ACTIVE';
      user.email_is_verified = true;
      await User.findByIdAndUpdate(payload.id, user);
      res.json({ success: true, message: 'Email successfully verified' });
    }
  });
});

router.post('/resend-account-activation', async (req, res) => {
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
    const verification_link = `https://trivia.demo.solace.dev/account-activation?token=${verification_token}`;
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
    res.json({ success: true, message: 'Email verification link resent.' });
  } catch (e) {
    res.json({ success: false, message: 'Error resending verification link.' });
  }
});

router.post('/send-reset-password', async (req, res) => {
  const { email } = req.body;

  const existingUser = await User.findOne({ email });
  if (!existingUser) {
    res.json({ success: false, message: 'An Account with the specified email does not exist' });
    return;
  }

  try {
    const p_hash = shortHash('' + (new Date()).getMilliseconds());
    const verification_token = jwt.sign({ id: existingUser._id, email, p_hash }, process.env.TRIVIA_SECRET);
    const verification_link = `https://trivia.demo.solace.dev/reset-password?token=${verification_token}&email=${email}`;
    const textMessage = `
    Hello ${existingUser.name},\n\n
    There was a request to change your password!\n\n
    If you did not make this request then please ignore this email.\n\n
    Otherwise, please click this link to change your password:\n\n
    ${verification_link}\n\n    
    See you there!\n\n    
    Best regards,\n
    Fireball Trivia team`;
    const htmlMessage = `
    Hello ${existingUser.name},<br/><br/>
    There was a request to change your password!<br/><br/>
    If you did not make this request then please ignore this email.<br/><br/>
    Otherwise, please click this link to change your password:<br/><br/>
    ${verification_link}<br/><br/>
    See you there!<br/><br/>
    Best regards,<br/>
    Fireball Trivia team`;

    const mail = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject: 'Reset your Fireball Trivia account password',
      text: textMessage,
      html: htmlMessage
    };

    sendMail(mail);
    existingUser.p_hash = p_hash;
    await User.findByIdAndUpdate(existingUser._id, existingUser);
    res.json({ success: true, message: 'Email reset password link resent.' });
  } catch (e) {
    res.json({ success: false, message: 'Error resending reset password link.' });
  }
});

router.post('/reset-password', async (req, res) => {
  const { email, token, password } = req.body;

  jwt.verify(token, process.env.TRIVIA_SECRET, async (err, payload) => {
    if (err) {
      res.json({ success: false, message: 'Unauthorized access: Invalid token' });
    } else {
      const user = await User.findById(payload.id);
      if (user.email !== payload.email) {
        res.json({ success: false, message: 'Unauthorized access: Unknown user' });
        return;
      }

      if (user.email !== email) {
        res.json({ success: false, message: 'Unauthorized access: Invalid email' });
        return;
      }

      if (!user.email_is_verified) {
        res.json({ success: false, message: 'Unauthorized access: Email not verified' });
        return;
      }

      if (user.p_hash !== payload.p_hash) {
        res.json({ success: false, message: 'Unauthorized access: Invalid token' });
        return;
      }

      if (password) {
        user.p_hash = '';
        user.password = await bcrypt.hash(password, 10);
        await User.findByIdAndUpdate(payload.id, user);
        res.json({ success: true, message: 'Password reset successfully' });
      } else {
        res.json({ success: true, message: 'Password reset token is valid' });
      }
    }
  });
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

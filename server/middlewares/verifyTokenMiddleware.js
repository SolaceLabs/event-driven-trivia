const jwt = require('jsonwebtoken');
const User = require('../models/user');
require('dotenv').config();

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    res.json({ success: false, message: 'Unauthorized access: Missing token' });
    return;
  }

  jwt.verify(token, process.env.TRIVIA_SECRET, async (err, payload) => {
    if (err) {
      res.json({ success: false, message: 'Unauthorized access: Invalid token' });
    } else {
      req.user = await User.findById(payload.id);
      if (!req.user) {
        res.json({ success: false, message: 'Unauthorized access: Unknown user' });
        return;
      }

      next();
    }
  });
};

const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    res.json({ success: false, message: 'Unauthorized access: Missing token' });
    return;
  }

  jwt.verify(token, process.env.TRIVIA_SECRET, async (err, payload) => {
    if (err) {
      res.json({ success: false, message: 'Unauthorized access: Invalid token' });
    } else {
      req.user = await User.findById(payload.id);
      if (!req.user) {
        res.json({ success: false, message: 'Unauthorized access: Unknown user' });
        return;
      }

      if (req.user.role !== 'ADMIN') {
        res.json({ success: false, message: 'Unauthorized access: Insufficient privilege' });
        return;
      }
      next();
    }
  });
};

module.exports = {
  verifyToken,
  verifyAdmin
};

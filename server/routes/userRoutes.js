/* eslint-disable no-await-in-loop */
/* eslint-disable no-path-concat */
/* eslint-disable no-param-reassign */
/* eslint-disable camelcase */
/* eslint-disable no-plusplus */
/* eslint-disable consistent-return */
const express = require('express');
const router = express.Router();

const isLoggedIn = (req, res, next) => {
  req.user ? next() : res.sendStatus(401);
};

router.get('/test', isLoggedIn, async (req, res) => res.send('category route testing!'));

module.exports = router;

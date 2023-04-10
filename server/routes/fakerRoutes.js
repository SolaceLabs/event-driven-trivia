const express = require('express');
const router = express.Router();
const { faker } = require('@faker-js/faker');

router.get('/test', async (req, res) => res.send('category route testing!'));

router.post('/nickname', async (req, res) => res.json({ success: false, message: faker.name.firstName().toLowerCase() }));

module.exports = router;

const express = require('express');
const router = express.Router();
const bigData = require('../scraper').bigData;

router.get('/', function(req, res, next) {
	res.render('main/index', { title: 'Justo', savedDat: bigData });
});

module.exports = router;

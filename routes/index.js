const express = require('express');
const router = express.Router();
const bigData = require('../scraper').bigData;

router.get('/', function(req, res, next) {
	res.render('main/index', { title: 'Justo', savedDat: bigData });
});
router.get('/mandData', (req, res, next) => {
	res.writeHead(200, {'Content-Type': 'application/json'});
	res.end(JSON.stringify(bigData));
});

module.exports = router;

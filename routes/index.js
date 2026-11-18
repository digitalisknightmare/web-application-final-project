var express = require('express');
var path = require('path');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/checkers', function(req, res, next) {
  res.sendFile(path.join(__dirname, '..', 'public', 'checkers.html'));
});

module.exports = router;

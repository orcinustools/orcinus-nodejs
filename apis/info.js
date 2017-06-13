var express = require('express');
var router = express.Router();
var utils = require('../lib/utils.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  req.app.locals.orcinus.info(function (err, data) {
    if(err){
        res.status(err.statusCode).send({error : err.reason});
    }
    else{
        res.send(data);
    }
  });
});

module.exports = router;
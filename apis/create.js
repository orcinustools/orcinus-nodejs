var express = require('express');
var router = express.Router();

router.get("/",function(req, res, next){
    req.app.locals.orcinus.createNetwork(opt,function (err, data) {
        if(err){
            res.status(err.statusCode).send({error : err.reason});
        }
        else{
            res.send(data);
        }
    });
});

module.exports = router;
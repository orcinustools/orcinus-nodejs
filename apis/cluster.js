var express = require('express');
var router = express.Router();

router.get("/",function(req, res, next){
    req.app.locals.orcinus.cluster(function (err, data) {
        if(err){
            res.status(err.statusCode).send({error : err.reason});
        }
        else{
            res.send(data);
        }
    });
});

router.post("/init",function(req, res, next){
    var opt  = req.body;
    req.app.locals.orcinus.clusterInit(opt,function (err, data) {
        if(err){
            res.status(err.statusCode).send({error : err.reason});
        }
        else{
            res.send(data);
        }
    });
});

module.exports = router;
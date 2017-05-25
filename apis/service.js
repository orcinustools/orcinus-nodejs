var express = require('express');
var router = express.Router();
var parser = require('../lib/parser.js');

router.get("/",function(req, res, next){
    req.app.locals.orcinus.listServices(function (err, data) {
        if(err){
            res.status(err.statusCode).send({error : err.reason});
        }
        else{
            res.send(data);
        }
    });
});

router.post("/create",function(req, res, next){
    var parse  = new parser(req.body.opt);
    var opt = parse.services();
    console.log(JSON.stringify(opt));

    if(req.body.auth){
        var auth = {"authconfig" : req.body.auth};
    }

    opt.forEach(function(ops){
        req.app.locals.orcinus.createService(auth,ops,function (err, data) {
            if(err){
                res.status(err.statusCode).send({error : err.reason});
            }
            else{
                res.send(data);
            }
        });
    });
});

router.post("/inspect",function(req, res, next){
    var svc = req.app.locals.orcinus.getService(req.body.id);
    svc.inspect(function (err, data) {
        if(err){
            res.status(err.statusCode).send({error : err.reason});
        }
        else{
            res.send(data);
        }
    });
});

router.post("/delete",function(req, res, next){
    var svc = req.app.locals.orcinus.getService(req.body.id);
    svc.remove(function (err, data) {
        if(err){
            res.status(err.statusCode).send({error : err.reason});
        }
        else{
            res.send(data);
        }
    });
});

router.post("/update",function(req, res, next){
    var opt  = req.body.opt;
    var auth = req.body.auth;
    var svc = req.app.locals.orcinus.getService(req.body.id);
    svc.update(auth,opt,function (err, data) {
        if(err){
            res.status(err.statusCode).send({error : err.reason});
        }
        else{
            res.send(data);
        }
    });
});

module.exports = router;
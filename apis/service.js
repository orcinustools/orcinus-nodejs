var express = require('express');
var router = express.Router();
var parser = require('../lib/parser.js');
var utils = require('../lib/utils.js');

router.post("/",function(req, res, next){
    var user = utils.decode(req,res);
    var filters = {filters:{name:{}}};
    var idSVC;
    if(req.body.stackname){
        idSVC = user.id+"-"+req.body.stackname;
    }
    else{
        idSVC = user.id;
    }

    filters.filters.name[idSVC] = true;
    utils.debug(filters)
    req.app.locals.orcinus.listServices(filters,function (err, data) {
        if(err){
            res.status(err.statusCode).send({error : err.reason});
        }
        else{
            res.send(data);
        }
    });
});

router.post("/create",function(req, res, next){
    var user = utils.decode(req,res);
    utils.serviceManifest(user.id,req,res,function(req,res,manifest){
        var parse  = new parser(manifest.opt);
        var opt = parse.services();
        utils.debug(JSON.stringify(opt));

        if(manifest.auth){
            var auth = {"authconfig" : manifest.auth};
        }
        var responseData = [];
        opt.forEach(function(ops,index){
            req.app.locals.orcinus.createService(auth,ops,function (err, data) {
                if(err){
                    var error = {};
                    error.error = true;
                    error.app = ops.Name;
                    error.status = err.statusCode;
                    error.reason = err.reason;
                    responseData.push(error);
                }
                else{
                    data.error = false;
                    data.app = ops.Name;
                    responseData.push(data);
                }

                if((opt.length - 1) == index){
                    res.send(responseData);
                }
            });
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
    var spec = new parser(req.body).update();
    var svc = req.app.locals.orcinus.getService(spec.Name);
    if(req.body.auth){
        var auth = {"authconfig" : req.body.auth};
    }

    console.log(JSON.stringify(spec));
    svc.update(auth,spec,function (err, data) {
        if(err){
            var error = {};
            error.error = true;
            error.app = spec.Name;
            error.status = err.statusCode;
            error.reason = err.reason;
            console.log(err);
            res.send(error);
        }
        else{
            data.error = false;
            data.app = spec.Name;
            res.send(data);
        }
    })
});

router.post("/task",function(req, res, next){
    var filters = {filters:{service:{}}};
    var idSVC = req.body.service;
    filters.filters.service[idSVC] = true;
    req.app.locals.orcinus.listTasks(filters,function (err, data) {
        if(err){
            res.status(err.statusCode).send({error : err.reason});
        }
        else{
            res.send(data);
        }
    });
});

module.exports = router;
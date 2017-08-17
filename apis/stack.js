var express = require('express');
var router = express.Router();
var utils = require('../lib/utils.js');

router.route("/")
.post(function(req, res, next){
    var user = utils.decode(req,res);
    var name = user.id+"-*";
    req.app.locals.orcinus.listStacks(name,function (err, data) {
        if(err){
            utils.debug(err);
            res.status(err.statusCode).send({error : err.json});
        }
        else{
            res.send(data);
        }
    });
});

router.post("/inspect", function(req, res, next) {
    console.log("Stack ID", req.body.id);
    var stk = req.app.locals.orcinus.getNetwork(req.body.id);
    stk.inspect(function(err, data) {
        if(err) {
            utils.debug(err);
            res.status(err.statusCode).send({error: err.json});
        }
        else {
            res.send(data);
        }
    });
});

router.post("/delete", function(req, res, next) {
    console.log("Stack ID", req.body.id);
    var stk = req.app.locals.orcinus.getNetwork(req.body.id);
    stk.remove(function(err, data) {
        if(err) {
            utils.debug(err);
            res.status(err.statusCode).send({error: err.json});
        }
        else {
            res.send(data);
        }
    });
});

router.post("/create",function(req, res, next){
    var user = utils.decode(req,res);
    var name = user.id+"-"+req.body.name;
    console.log("Create Stack : "+name);
    req.app.locals.orcinus.createStack(name,function (err, data) {
        if(err){
            utils.debug(err);
            //res.status(err.statusCode).send({error : err.reason});
            res.status(200).send({error : err.json});
        }
        else{
            res.send(data);
        }
    });
});

router.post("/list-services",function(req, res, next){
    var stackID = req.body.id;

    req.app.locals.orcinus.listServices(function (err, data) {
        if(err){
            res.status(err.statusCode).send({error : err.json});
        }
        else{
            if(data.length > 0){
                var obj = data.filter(function ( obj ) {
                    var chk = obj.Spec.Networks.filter(function(objFil){
                    return objFil.Target === stackID;
                    });
                    if(chk.length == 0){
                        chk = false;
                    }
                    else{
                        chk = true;
                    }
                    return chk;
                });
                res.send(obj);
            }
            else{
                res.send(data);
            }
        }
    });
});

module.exports = router;
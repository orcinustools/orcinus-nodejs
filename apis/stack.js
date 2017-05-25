var express = require('express');
var router = express.Router();

router.post("/",function(req, res, next){
	var name = req.body.name;
    req.app.locals.orcinus.listStacks(name,function (err, data) {
        if(err){
            res.status(err.statusCode).send({error : err.reason});
        }
        else{
            if(name){
                data = data.find(function(lst){return lst.Name == name});
            }
            if(data){
                data.created = true;
                res.send(data);
            }
            else{
                res.send({created : false});
            }
        }
    });
});

router.post("/create",function(req, res, next){
    console.log("Create Stack : "+req.body.name);
    req.app.locals.orcinus.createStack(req.body.name,function (err, data) {
        if(err){
            console.log(err);
            res.status(err.statusCode).send({error : err.reason});
        }
        else{
            res.send(data);
        }
    });
});

module.exports = router;
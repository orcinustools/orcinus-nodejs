var express = require('express');
var router = express.Router();
var utils = require('../lib/utils.js');

router.post("/",function(req, res, next){
		var user = utils.decode(req,res);
		var filters = {filters:{name:{}}};
		var idTask = user.id+'-';

		filters.filters.name[idTask] = true;
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
var path 	= require('path');
var express = require('express');
var app 	= express();
module.exports = function(){
  var PORT 	= process.env.ORCINUS_PORT || 4000;

  app.use(express.static(path.join(__dirname, './www')));
  app.get('*', function(request, response) {
    response.sendFile(path.resolve(__dirname, './www', 'index.html'))
  });

  app.listen(PORT, function(error) {
    if (error) {
      console.error(error);
    } else {
      console.info("==> 🌎  Listening on port %s. Visit http://localhost:%s/ in your browser.", PORT, PORT);
    }
  });
  return app;
}
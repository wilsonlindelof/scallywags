const path = require('path');
const express = require('express');
const app = express();

app.use('/gameclient',express.static(path.join(__dirname, 'gameclient')));
app.use('/commandclient',express.static(path.join(__dirname, 'commandclient')));

app.get('/', function (req, res) {
  res.sendFile(__dirname);
});

var port = process.env.PORT || 3000;

app.listen(port, function () {
  console.log('Example app listening on port ' + port);
});
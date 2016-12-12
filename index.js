/**
 * Created by David on 12. 12. 2016.
 */
var express = require('express');
var path = require('path');

var app = express();
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
})

app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
})
/**
 * Created by David on 12. 12. 2016.
 */
var express = require('express');
var path = require('path');
var device = require('device');

var app = express();

app.get('/', function (req, res) {
    console.log("User agent: " + req.headers['user-agent']);
    var mydevice = device(req.headers['user-agent']);
    console.log("Device:");
    if(mydevice.type == 'desktop') {
        res.sendFile(path.join(__dirname, 'views', 'index.html'));
    }
    else
    {
        res.sendFile(path.join(__dirname, 'views', 'mobile_view.html'));
    }
})

app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
})
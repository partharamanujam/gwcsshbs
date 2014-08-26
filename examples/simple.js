'use strict';

var express = require('express'),
    gwcsshbs = require('../lib'),
    handlebars = gwcsshbs.handlebars,
    gwcssResources = gwcsshbs.resources(express);

var app = express();

app.use('/', gwcssResources);

app.listen(8080);
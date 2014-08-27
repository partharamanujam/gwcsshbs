'use strict';

var path = require('path'),
    express = require('express'),
    gwcsshbs = require('../lib'),
    gwcssResources = gwcsshbs.resources(express);

var app = express();
var viewList = {
    home: {}
};

gwcsshbs.init(
    function (err) {
        if(err) {
            console.error('error: ' + err);
            return;
        }
        app.use('/', gwcssResources);
        app.set('view engine', 'hbs');
        app.engine('hbs', gwcsshbs.renderFile);
        app.set('views', path.normalize(__dirname + '/../templates/views'));
        Object.keys(viewList).forEach(
            function (view) {
                app.get('/' + view, function (req, res) {
                    res.render(view, viewList[view]);
                });
            }
        );
        app.listen(8080);
    }
);

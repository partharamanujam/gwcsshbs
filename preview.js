'use strict';

var path = require('path'),
    http = require('http'),
    express = require('express'),
    gwcsshbs = require('./lib'),
    menuData = require('./menuData'),
    gwcssResources = gwcsshbs.resources(express);

var app = express(),
    server = http.Server(app),
    io = require('socket.io')(server),
    iosockets = [];

var viewList = {
    home: {
        gwcsshbs: {
            autoPageRefresh: true
        },
        menu: menuData,
        title: 'Home Page'
    }
};

gwcsshbs.enableLogging();
gwcsshbs.init(
    function (err, emitter) {
        if (err) {
            console.error('error: ' + err);
            return;
        }
        app.use('/', gwcssResources);
        app.set('view engine', 'hbs');
        app.engine('hbs', gwcsshbs.renderFile);
        app.set('views', path.normalize(__dirname + '/templates/views'));
        Object.keys(viewList).forEach(
            function (view) {
                app.get('/' + view, function (req, res) {
                    res.render(view, viewList[view]);
                });
            }
        );
        io.on('connection',
            function (socket) {
                iosockets.push(socket);
                socket.on('disconnect',
                    function () {
                        iosockets.splice(iosockets.indexOf(socket), 1);
                    }
                );
            }
        );
        emitter.on('refresh',
            function () {
                iosockets.forEach(
                    function (socket) {
                        socket.emit('refresh', 'junk');
                    }
                );
            }
        );
        server.listen(8080);
    }
);
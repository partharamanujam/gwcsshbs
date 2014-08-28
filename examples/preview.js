'use strict';

var path = require('path'),
    http = require('http'),
    watch = require('watch'),
    express = require('express'),
    gwcsshbs = require('../lib'),
    gwcssResources = gwcsshbs.resources(express);

var app = express(),
    server = http.Server(app),
    io = require('socket.io')(server),
    iosockets = [],
    templatesPath = path.normalize(__dirname + '/../templates');

var viewList = {
    home: {
        gwcsshbs: {
            autoPageRefresh: true
        },
        title: 'Home Page'
    }
};

function watchTemplates() {
    watch.watchTree(templatesPath,
        function (f, curr, prev) {
            if (typeof f === "object" && prev === null && curr === null) {
                console.log('scanned: templates');
            } else {
                setTimeout(
                    function () {
                        console.log('sending refresh');
                        iosockets.forEach(
                            function (socket) {
                                socket.emit('refresh', 'junk');
                            }
                        );
                    },
                    1000
                );
            }
        }
    );
}

watchTemplates();
gwcsshbs.enableLogging();
gwcsshbs.init(
    function (err) {
        if (err) {
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
        server.listen(8080);
    }
);
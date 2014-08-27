'use strict';

var path = require('path'),
    fs = require('fs'),
    asyncWaterfall = require('async-waterfall'),
    asyncForEach = require('async-foreach').forEach;

var templatesPath = path.normalize(__dirname + '/../templates');

function registerHelpers(hbs, resultCallback) {
    resultCallback(null);
}

function registerPartialFromFile(hbs, filepath, resultCallback) {
    var name = path.basename(filepath, path.extname(filepath));
    asyncWaterfall(
        [
            function (waterfallCallback) {
                fs.readFile(filepath, 'utf8', waterfallCallback);
            },
            function (string, waterfallCallback) {
                hbs.registerPartial(name, string);
                waterfallCallback(null);
            }
        ],
        resultCallback
    );
}

function registerPartials(hbs, resultCallback) {
    var partialsPath = path.normalize(templatesPath + '/partials');
    asyncWaterfall(
        [
            function (waterfallCallback) {
                fs.readdir(partialsPath, waterfallCallback);
            },
            function (fileList, waterfallCallback) {
                asyncForEach(fileList,
                    function (item, idx, arr) {
                        var forEachCallback = this.async();
                        registerPartialFromFile(hbs, path.normalize(partialsPath + '/' + item),
                            function (err) {
                                forEachCallback(err);
                                if (idx === arr.length - 1) {
                                    waterfallCallback(err);
                                }
                            }
                        );
                    }
                );
            }
        ],
        resultCallback
    );
}

function init(handlebars, resultCallback) {
    asyncWaterfall(
        [
            function (waterfallCallback) {
                registerHelpers(handlebars, waterfallCallback);
            },
            function (waterfallCallback) {
                registerPartials(handlebars, waterfallCallback);
            }
        ],
        resultCallback
    );
}

function render(handlebars, filepath, options, resultCallback) {
    asyncWaterfall(
        [
            function (waterfallCallback) {
                fs.readFile(filepath, 'utf8', waterfallCallback);
            },
            function (string, waterfallCallback) {
                waterfallCallback(null, handlebars.compile(string, options));
            },
            function (templFunc, waterfallCallback) {
                waterfallCallback(null, templFunc(options));
            }
        ],
        resultCallback
    );
}

exports.init = init;
exports.render = render;

'use strict';

var handlebars = require('handlebars'),
    handlebars = require('handlebars-layouts')(handlebars),
    resources = require('./resources'),
    hbs = require('./hbs');

function enableLogging() {
    handlebars.logger.level = 0;
}

function init(resultCallback) {
    hbs.init(handlebars, resultCallback);
}

function renderFile(filepath, options, resultCallback) {
    hbs.render(handlebars, filepath, options, resultCallback);
}

// exports
exports.handlebars = handlebars;
exports.resources = resources;
exports.init = init;
exports.renderFile = renderFile;
exports.enableLogging = enableLogging;

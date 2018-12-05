'use strict';
var path = require('path');

module.exports = {

    getName: function getName (filePath, root) {
        var relative = module.exports.getRelative(filePath, root);
        return relative.replace(path.extname(relative), '');
    },

    getRelative: function getRelative (filePath, root) {
        return path.relative(root, filePath);
    }
};

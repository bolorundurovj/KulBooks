"use strict";

var fs = require('fs');
var path = require('path');
var BB = require('bluebird');

var readdir = BB.promisify(fs.readdir);
/**
 *
 * @param root: The content bundle root, for eg: path/to/locales/
 * @param cb: The callback to invoke when the locale list is ready
 * The callback is node style: takes two args (err, result) where:
 *      err: Any error while generating the locale list in which case the result is undefined.
        result: An array of locale paths eg: [ 'US', 'US/en', 'US/es', 'US/fr' ]
 */
module.exports = function getLocaleList(root, cb) {
    readdir(root).then(function (countries) {
        return BB.all(countries.map(function(country) {
            return readdir(path.resolve(root, country)).then(function (val) {
                var filtered = val.filter(twoChar);
                //setting countryOnly when you also want the locale paths to have just the country also as an option
                //eg: US, US/en, US/fr
                return { country: country, langs: filtered, countryOnly: ((filtered && filtered.length) !== val.length) };
            }).catch(function (err) {
                    //if a specific entry is not a directory and
                    //a filetype, never mind. ignore it and
                    //continue with the rest of the entries.
                if (err.code == 'ENOTDIR') {
                    return null;
                } else {
                    cb(err);
                }
            });
        }));
    }).then(function (locales) {
        var result = [];
        locales.forEach(function(entry) {
            if(!entry) return;
            if (entry.countryOnly) {
                result.push(entry.country);
            }
            result = result.concat(entry.langs.map(function(lang) {
                return path.join(entry.country, lang);
            }));
        });
        cb(null, result);
    }).catch(function(err) {
        cb(err);
    });
};

function twoChar(e) { return /^..$/.test(e); }

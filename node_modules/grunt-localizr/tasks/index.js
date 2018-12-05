/*───────────────────────────────────────────────────────────────────────────*\
 │  Copyright (C) 2014 eBay Software Foundation                                │
 │                                                                             │
 │hh ,'""`.                                                                    │
 │  / _  _ \  Licensed under the Apache License, Version 2.0 (the "License");  │
 │  |(@)(@)|  you may not use this file except in compliance with the License. │
 │  )  __  (  You may obtain a copy of the License at                          │
 │ /,'))((`.\                                                                  │
 │(( ((  )) ))    http://www.apache.org/licenses/LICENSE-2.0                   │
 │ `\ `)(' /'                                                                  │
 │                                                                             │
 │   Unless required by applicable law or agreed to in writing, software       │
 │   distributed under the License is distributed on an "AS IS" BASIS,         │
 │   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  │
 │   See the License for the specific language governing permissions and       │
 │   limitations under the License.                                            │
 \*───────────────────────────────────────────────────────────────────────────*/

'use strict';
var path = require('path'),
    BB = require('bluebird'),
    utils = require('../lib/utils'),
    mkdirp = require('mkdirp'),
    concat = require('concat-stream'),
    localizr = require('localizr'),
    qlimit = require('qlimit')(10),
    fs = require('graceful-fs'),
    localeList = require('../lib/localeList'),
    logger;

function endsWith(str, frag) {
    return str.lastIndexOf(frag) === (str.length - frag.length);
}

function correctPathSeparator(filePath) {
    return filePath.split('/').join(path.sep);

}

module.exports = function (grunt) {
    logger = grunt.log;
    grunt.registerMultiTask('localizr', 'A preprocessor for Dust.js templates.', function () {
        var done, options, contentPath, bundleRoot, filesSrc,
            pathName = path.sep + '**' + path.sep + '*.properties',
            fileRoot = this.options().templateRoot || path.join('public', 'templates');

        done = this.async();

        options = this.options({
            fallback: 'en_US',
            contentPath: ['locales'],
            fileRoot: fileRoot,
            tmpDir: 'tmp'
        });

        contentPath = options.contentPath;

        contentPath = contentPath.map(correctPathSeparator);

        filesSrc = this.filesSrc.map(correctPathSeparator);
        contentPath = contentPath.map(function (cp) {
            var regexp = new RegExp('([\\' + path.sep + ']?)$');
            if (!endsWith(cp, pathName)) {
                return cp.replace(regexp, pathName);
            }
            return cp;
        });

        bundleRoot = contentPath.map(function (cp) {
            return cp.replace(pathName, '');
        });

        // TODO: Currently only honors one locale directory.
        bundleRoot = Array.isArray(bundleRoot) ? bundleRoot[0] : bundleRoot;
        localeList(path.join(process.cwd(), bundleRoot), function (err, locales) {
            if (err) {
                logger.error('Terminating due to err', err);
                done(err);
                return;
            }
            BB.all(filesSrc.map(function (srcFile) {
                return processSrcDust(srcFile, locales, bundleRoot, options);
            }))
            .then(done)
            .catch(function (err) {
                logger.error('Terminating due to err', err);
                done(err);
            });
        });
    });
};

function processSrcDust(srcFile, locales, bundleRoot, options) {
    var deferred = BB.pending(),
        fileBundles,
        name = utils.getName(srcFile, options.fileRoot),
        propName = name + '.properties',
        dustPromises = [];

    //get the bundles that correspond to this file

    fileBundles = locales.map(function (entry) {
            return path.join(bundleRoot, entry, propName);
        }).filter(function (entry) {
            return fs.existsSync(path.join(process.cwd(), entry));
        });

    if (fileBundles.length === 0) {
        dustPromises = dustPromises.concat(processWhenNoBundles(locales, srcFile, name, options));

    } else {
        dustPromises = dustPromises.concat(processWithBundles(srcFile, fileBundles, bundleRoot, options));
    }
    BB.all(dustPromises).then(function () {
        deferred.resolve();
    });

    return deferred.promise;
}

function processWhenNoBundles(locales, srcFile, name, options) {
    return locales.map(function (entry) {
        var destFile = path.join(process.cwd(), options.tmpDir, entry, name + '.dust');
        return copy(srcFile, destFile);
    });
}

function processWithBundles(srcFile, fileBundles, bundleRoot, options) {
    //localize with each file/bundle combo
    return fileBundles.map(function (propFile) {
        var destFile = utils.getName(propFile, bundleRoot) + '.dust';
        destFile = path.join(options.tmpDir, destFile);
        return localize(srcFile, propFile, destFile);
    });
}

var localize = qlimit(function(srcFile, propFile, destFile) {
    var opt = {
            src: srcFile,
            props: propFile
        },
        deferred = BB.pending();

    srcFile = path.join(process.cwd(), srcFile);
    destFile = path.join(process.cwd(), destFile);


    mkdirp(path.dirname(destFile), function (err) {
        if (err) {
            deferred.resolve(); //we want to continue with compiling other templates
            logger.error('Failed to generate', destFile, ' from ', srcFile, 'error', err, '\n');
            return;

        }
        var out = concat({ encoding: 'string' }, function (data) {
            fs.writeFile(destFile, data, function (err) {
                if (err) {
                    deferred.resolve(); //we want to continue with compiling other templates
                    logger.error('Failed to generate', destFile, ' from ', srcFile, 'error', err, '\n');
                    return;
                }
                deferred.resolve(destFile);
                logger.write('Generated ', destFile, '\n');
            });
        });

        localizr.createReadStream(opt)
            .on('error', function (err) {
                logger.error('Error while localizing with ', srcFile, ' and ', propFile);
                deferred.resolve(); //we want to continue with the compiling other templates
            })
            .pipe(out)
            .on('error', function (err) {
                logger.error('Error while localizing with ', srcFile, ' and ', propFile);
                deferred.resolve(); //we want to continue with compiling other templates
            });
    });

    return deferred.promise;
});

var copy = qlimit(function copy(srcFile, destFile) {
    var deferred = BB.pending();
    mkdirp(path.dirname(destFile), function (err) {
        if (err) {
            deferred.reject(err);
            logger.error('Failed to generate', srcFile, ' from ', destFile, 'error', err, '\n');
            return;
        }
        fs.createReadStream(srcFile).pipe(fs.createWriteStream(destFile)
            .on('finish', function () {
                logger.write('Generated ', destFile, '\n');
                deferred.resolve();
            }).on('error', function (err) {
                logger.error('Failed to generate', destFile, '\n');
                deferred.reject(err);
            }));
    });
    return deferred.promise;
});

//the following is for the watch task to build just the dust files relevant
//when a property file is changed

/*function processPropFileChanged(propFile, fileRoot, bundleRoot, options) {
 var deferred = Q.defer();
 utils.genNameWithProp(propFile, fileRoot, bundleRoot, function(err, fileInfo) {
 var srcFile,
 destFile;

 if (err) {
 logger.err([err]);
 done();
 return;
 }

 destFile = utils.genFilePath(options.tmpDir, fileInfo, 'dust');
 fileInfo.locale = undefined;
 srcFile = utils.genFilePath(fileRoot, fileInfo, 'dust');

 var promise = localize(srcFile, propFile, destFile);
 promise.then(function() {
 deferred.resolve();
 });
 });
 return deferred.promise;
 }*/

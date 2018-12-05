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
  localizr = require('localizr'),
  concat = require('concat-stream');


module.exports.localize = function localize(srcFile, propFile, cb) {
    var opt = {
        src: srcFile,
        props: propFile
    };

    var out = concat({ encoding: 'string'}, function (data) {
        cb(null, data);
    });

    var readStream = localizr.createReadStream(opt);
    var writeStream = readStream.pipe(out);
    readStream.on('error', cb);
    writeStream.on('error', cb);
};


module.exports.preHook = function pre(context, callback) {
    var locale = context.name.match(/(?:([A-Za-z0-9]{2})\/([A-Za-z]{2})\/)?(.*)/),
      dir,
      srcFile;

    if (locale && locale[1] && locale[2]) {
        context.locality = {
            country: locale[1],
            language: locale[2]
        };
    }

    if (locale[3]) {
        dir = context.filePath.replace(path.extname(context.filePath), '');
        dir = dir.replace(context.name, '').replace(path.sep, '', 'g');
        srcFile = path.join( dir, locale[3]);
        context.origName = locale[3];
    }
    context.srcPath = path.join(context.srcRoot, srcFile + '.dust');
    context.skipRead = true;
    callback(null, context);

};



'use strict';
var test = require('tape'),
  path = require('path'),
  localeList = require(path.resolve(__dirname , '../lib/localeList'));

test('localeList', function (t) {
  t.test('should generate proper list of locale directories', function(t) {
    localeList(path.resolve(__dirname , 'fixtures/cornercase/locales'), function(err, result) {
      t.deepEqual(result.sort(), ([ 'US', 'US/en', 'US/es', 'US/fr' ]).sort());
      t.end();
    });
  });
  t.test('should bubble up exception for non-existent locale directory', function(t) {
    localeList(path.resolve(__dirname , '/fixtures/cornercase/locales/doesntexist'), function(err, result) {
      t.equals(err.code, 'ENOENT');
      t.end();
    });
  });
});


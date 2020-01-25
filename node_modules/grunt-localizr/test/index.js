'use strict';
var grunt = require('grunt'),
    test = require('tape'),
    path = require('path'),
    fs = require('fs'),
    rimraf = require('rimraf');

grunt.loadNpmTasks('grunt-force-task');
test('Grunt-localizr', function (t) {
    var original = process.cwd();
    process.chdir(path.join(__dirname, 'fixtures'));
    grunt.task.init = function() {};
    require('../tasks/index')(grunt);

    t.test('test a localizr build', function(t) {
        grunt.initConfig({
            localizr: {
                files: ['public/templates/**/*.dust'],
                options: {
                    contentPath: ['locales/**/*.properties']
                }
            }
        });

        grunt.tasks(['localizr'], {}, function(){
            //verify the files exist
            t.equal(true, fs.existsSync('./tmp/ES/es/nested/test.dust'));
            t.equal(true, fs.existsSync('./tmp/US/en/nested/test.dust'));
            t.equal(true, fs.existsSync('./tmp/ES/es/nested/test1.dust'));
            t.equal(true, fs.existsSync('./tmp/US/en/nested/test1.dust'));

            //verify they have expected content
            t.equal('<div>Hola</div>', fs.readFileSync('./tmp/ES/es/nested/test.dust', 'utf8'));
            t.equal('<div>Hello</div>', fs.readFileSync('./tmp/US/en/nested/test.dust', 'utf8'));
            t.equal('<div>Test with no Locale </div>', fs.readFileSync('./tmp/US/en/nested/test1.dust', 'utf8'));
            t.equal('<div>Test with no Locale </div>', fs.readFileSync('./tmp/US/en/nested/test1.dust', 'utf8'));

            rimraf('tmp', function() {
                t.end();
            });

        });
    });

    t.test('test a localizr build with alternate dir structure', function(t) {
        grunt.initConfig({
            localizr: {
                files: ['client/templates/**/*.dust'],
                options: {
                    contentPath: ['locales/**/*.properties'],
                    templateRoot: 'client/templates'
                }
            }
        });

        grunt.tasks(['localizr'], {}, function(){
            //verify the files exist
            t.equal(true, fs.existsSync('./tmp/ES/es/nested/test.dust'));
            t.equal(true, fs.existsSync('./tmp/US/en/nested/test.dust'));

            //verify they have expected content
            t.equal('<div>Hola</div>', fs.readFileSync('./tmp/ES/es/nested/test.dust', 'utf8'));
            t.equal('<div>Hello</div>', fs.readFileSync('./tmp/US/en/nested/test.dust', 'utf8'));

            rimraf('tmp', function() {
                t.end();
            });

        });
    });

    t.test('test a localizr build with three templates same name/ different dir , 2 with .properties file, 1 with no .properties, ' +
        'also makes sure absence of a properties file for a locale does not break the build', function(t) {
        grunt.initConfig({
            localizr: {
                files: ['cornercase/templates/**/*.dust'],
                options: {
                    contentPath: ['cornercase/locales/**/*.properties'],
                    templateRoot: 'cornercase/templates'
                }
            }
        });

        grunt.tasks(['localizr'], {}, function(){
            //verify the files exist
            t.equal(true, fs.existsSync('./tmp/US/en/test.dust'));
            t.equal(true, fs.existsSync('./tmp/US/en/nested1/test.dust'));
            t.equal(true, fs.existsSync('./tmp/US/en/nested2/test.dust'));
            t.equal(false, fs.existsSync('./tmp/US/fr/test.dust'));

            //verify they have expected content
            t.equal('<div>Hola</div>', fs.readFileSync('./tmp/US/es/test.dust', 'utf8'));
            t.equal('<div>I am translated to algo</div>', fs.readFileSync('./tmp/US/es/nested1/test.dust', 'utf8'));
            t.equal('<div>I am cool and don\'t need any pre tags</div>', fs.readFileSync('./tmp/US/en/nested2/test.dust', 'utf8'));

            rimraf('tmp', function() {
                t.end();
            });

        });
    });

    t.test('test wrong root path', function(t) {

        grunt.initConfig({
            localizr: {
                files: ['errorcase/templates/**/*.dust'],
                options: {
                    contentPath: ['errorcase/locales/**/*.properties'],
                    templateRoot: 'errorcase/templates'
                }
            }
        });
        grunt.tasks(['force:localizr'], {}, function() {
            t.end();
        });
    });
    t.on('end', function() {
        process.chdir(original);
    });
});


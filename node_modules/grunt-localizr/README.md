grunt-localizr
==============

Lead Maintainer: [Aria Stewart](https://github.com/aredridel)  

[![Build Status](https://travis-ci.org/krakenjs/grunt-localizr.svg?branch=master)](https://travis-ci.org/krakenjs/grunt-localizr)

A grunt task to support i18n using localizr module for dust templates. i18n is solved the way kraken supports today using `.properties` files.

The [localizr](https://github.com/krakenjs/localizr) module is a tool to apply localization to dust templates before rendering.
This plugin uses that localizr module, and scans your project under the root app directory for

* `.dust` files in `public/templates`
* `.properties` content files for corresponding `.dust` files in `locales/` folder

and puts the localized files in `tmp/` dir.
For example:
Localizing `public/templates/foo/bar.dust` with `locales/US/en/foo/bar.properties` will generate `tmp/US/en/foo/bar.dust`


##Usage

In your Gruntfile.js

```
module.exports = function localizr(grunt) {
	// Load task
	grunt.loadNpmTasks('grunt-localizr');

	// Options
	return {
	    files: ['public/templates/**/*.dust'],
        options: {
            contentPath: ['locales/**/*.properties']
        }
	};
};

```

## Using with kraken 1.0 apps
If you use [generator-kraken](git@github.com:krakenjs/generator-kraken.git) for scaffolding your kraken apps, you will see
that the generated `Gruntfile.js` will be automatically setting up the i18n task for you.



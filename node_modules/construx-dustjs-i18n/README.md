# construx-dustjs-i18n

Lead Maintainer: [Matt Edelman](https://github.com/grawk)

[![Build Status](https://travis-ci.org/krakenjs/construx-dustjs-i18n.svg?branch=master)](https://travis-ci.org/krakenjs/construx-dustjs-i18n)
[![NPM version](https://badge.fury.io/js/construx-dustjs-i18n.png)](http://badge.fury.io/js/construx-dustjs-i18n)

[construx](https://github.com/krakenjs/construx) plugin for JIT-compiling star resources during development of [express](http://expressjs.com/) applications.

## Requirements

This plugin requires your project to have `dustjs-linkedin@~2.6.2` installed. This plugin compiles localized and compiled DustJS 
templates per the adaro/engine-munger/localizr mode of localization. I.e. if you are using that suite of modules and 
pre-compiling all dust templates into locale-based JS files during a build step using grunt-localizr. If you are not using 
localization features, or if you are using the newer and preferred approach to dust localization (please see 
[New I18n Support for DustJS](http://krakenjs.com/2015/07/06/new-i18n-for-dust.html)), then you should instead use the 
simpler [construx-dustjs](https://github.com/krakenjs/construx-dustjs) plugin for `construx`.

## Usage

### Install

```shell
$ npm install --save-dev construx-dustjs-i18n
```

### Configure

Where you configure your construx plugins:

```json
{
    "template": {
        "module": "construx-dustjs-i18n",
        "enabled": true,
        "files": "/templates/**/*.js",
        "base": "templates",
        "i18n": "config:i18n"
    },
}
```

_Note: See [construx README](https://github.com/krakenjs/construx/blob/master/README.md) for general usage of construx_


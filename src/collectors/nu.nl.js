"use strict";
const Collector = require('./collector');

class NuNL extends Collector {
    collect() {
        console.info('Run Nu.NL');
        return Promise.resolve();
    }
}

module.exports = NuNL;
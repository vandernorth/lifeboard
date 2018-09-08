"use strict";
const _ = require('lodash');

class CollectorAgent {

    constructor() {
        const config = require('yargs')
            .demand(['config-file'])
            .string('config-file')
            .argv;
        console.info('[configFile]', config.configFile);
        this.config     = require(config.configFile);
        this.collectors = [];
        this.load(_.result(this.config, 'collectors'));
        this.interval = setInterval(() => this.collect(), 20 * 1000);
    }

    load( collectors ) {
        collectors.forEach(collector => {
            console.info("[load]    ", collector.type);
            const type = CollectorAgent.Map[collector.type];
            if ( type ) {
                const Type          = require(type),
                      thisCollector = new Type(collector, this.config.service);
                this.collectors.push(thisCollector);
            } else {
                console.warn(`[loadError] Cannot load collector type ${collector.type}.`);
            }
        });
    }

    collect() {
        this.collectors
            .filter(c => c.shouldRun)
            .forEach(c => c.collect()
                .then(() => console.info('done'))
                .catch(error => console.error('collect error:', error)));
    }

    static get Map() {
        return {
            'nu.nl': './collectors/nu.nl.js'
        }
    }
}

module.exports = CollectorAgent;

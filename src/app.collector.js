"use strict";
const _         = require('lodash'),
      Connector = require('./app.connect');

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
        this.collect();
    }

    load( collectors ) {
        collectors
            .filter(c => c.enabled !== false)
            .forEach(collector => {
                console.info("[load]    ", collector.type);
                const type = CollectorAgent.Map[collector.type];
                if ( type ) {
                    const Type          = require(type),
                          thisCollector = new Type(collector, this.config.service);

                    if ( collector.connector ) {
                        const thisConnector = _.find(this.config.connectors, { name: collector.connector });
                        thisCollector.setConnector(Connector.configToConnector(thisConnector));
                    }

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
                .then(result => console.info('[collect-ready]', result))
                .catch(error => console.error('[collect-error]', String(error), error)));
    }

    static get Map() {
        return {
            'nu.nl':           './collectors/nu.nl.js',
            'google.location': './collectors/google.location.js',
            'google.info':     './collectors/google.services.js',
            'openpli.status':  './collectors/openpli.status.js',
            'ziggo.status':    './collectors/ziggo.status.js',
            'tweakers.net':    './collectors/tweakers.net.js',
            'bunq.accounts':   './collectors/bunq.accounts.js'
        }
    }
}

module.exports = CollectorAgent;

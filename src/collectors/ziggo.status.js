"use strict";
const Collector = require('./collector'),
      request   = require('request-promise');

class ZiggoState extends Collector {
    async collect() {
        this.setStarted();

        const status = await request({
            url:    `https://restapi.ziggo.nl/1.0/incidents/${this.config.address}`,
            method: 'GET',
            json:   true
        });

        if ( status.callback ) {
            delete status.callback.timestamp;
        }

        return this.push({
            category: 'home',
            from:     'Ziggo',
            type:     'status',
            about:    this.config.address,
            value:    status
        });
    }

}

module.exports = ZiggoState;

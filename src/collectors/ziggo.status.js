"use strict";
const Collector = require('./collector');

class ZiggoState extends Collector {
    async collect() {
        this.setStarted();

        const status = await this.request(`https://restapi.ziggo.nl/1.0/incidents/${this.config.address}`, null, { method: 'GET' });

        delete status.callback.timestamp;

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

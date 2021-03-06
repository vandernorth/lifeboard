"use strict";
const Collector = require('./collector'),
      request   = require('request-promise');

class OpenPli extends Collector {
    async collect() {
        this.setStarted();

        const status = await request({
            url:    `${this.config.server}/api/statusinfo`,
            method: 'GET',
            json:   true
        });

        return this.push({
            //== ID
            category:   'home',
            from:       'open-pli',
            type:       'status',
            about:      this.config.name,
            //== Value
            value:      status,
            //== Do not keep history
            updateLast: true
        });
    }

}

module.exports = OpenPli;

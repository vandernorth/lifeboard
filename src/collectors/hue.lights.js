"use strict";
const Collector = require('./collector'),
      request   = require('request-promise');

//== See https://www.developers.meethue.com/documentation/getting-started
class Hue extends Collector {
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
            from:       'hue',
            type:       'status',
            about:      this.config.name,
            //== Value
            value:      status,
            //== Do not keep history
            updateLast: true
        });
    }

}

module.exports = Hue;

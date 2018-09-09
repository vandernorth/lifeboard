"use strict";
const Collector = require('./collector');

class OpenPli extends Collector {
    async collect() {
        this.setStarted();

        const status = await this.request(`${this.config.server}/api/statusinfo`, null, { method: 'GET' });

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

"use strict";
const Collector = require('./collector'),
      moment    = require('moment'),
      request   = require('request-promise');

class Traffic extends Collector {
    async collect() {
        this.setStarted();
        return Promise.all(this.config.roads.map(road => {
            return this.oneRoad(road);
        }));
    }

    async oneRoad( road ) {
        const from   = moment().format('YYYY-MM-DD'),
              to     = moment().add(7, 'days').format('YYYY-MM-DD');
        const status = await request({
            url:     `https://rws01.sharewire.net/obstructions/?road_number=${road}&from=${from}&to=${to}`,
            headers: { 'RWS-API-KEY': 'v5jaGACh!2S4JQ4Uehcq-hU6v3J2qpvc' },
            method:  'GET',
            json:    true
        });

        return this.push({
            category:   'traffic',
            from:       'Rijkswaterstaat',
            type:       'roadworks',
            about:      road,
            value:      status.data,
            updateLast: true
        });
    }

}

module.exports = Traffic;

"use strict";
const Collector = require('./collector'),
      request   = require('request-promise');

class Traffic extends Collector {
    async collect() {
        this.setStarted();
        return this.jams();
    }

    async jams() {
        const jams = await request({
            url:    'https://www.anwb.nl/feeds/gethf',
            method: 'GET',
            json:   true
        });

        return this.push({
            category:   'traffic',
            from:       'ANWB',
            type:       'trafficJams',
            about:      'NL',
            value:      jams.roadEntries,
            updateLast: true
        });
    }

}

module.exports = Traffic;

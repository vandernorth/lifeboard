"use strict";
const _              = require('lodash'),
      Collector      = require('./collector');

//== GOOGLE:
//==  - Location
//==  - Calendar
//==  - Mail
//==  - Personal info

class NuNL extends Collector {
    async collect() {
        this.setStarted();




        return Promise.resolve();
        return this.push({
            //== ID
            category:   'news',
            from:       'nu.nl',
            type:       'highlights',
            about:      'all',
            //== Value
            value:      items,
            //== Do not keep history
            updateLast: true
        });
    }

}

module.exports = NuNL;

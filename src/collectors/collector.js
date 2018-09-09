"use strict";

class Collector {

    /**
     *
     * @param {object} config
     * @param {string} config.interval interval in minutes
     * @param {object} service
     * @param {string} service.url
     * @param {string} service.apiKey
     * @param {string} service.apiSecret
     */
    constructor( config, service ) {
        this.service     = service;
        this.interval    = config.interval || 60;
        this.lastStarted = new Date('2000-01-01');
    }

    setStarted() {
        this.lastStarted = new Date();
    }

    get shouldRun() {
        const diff = Date.now() - this.lastStarted;
        return (diff / 1000 / 60) > this.interval;
    }

    push( stat ) {
        return this.request(`${this.service.url}/api/stat/add`, stat);
    }

    event( event ) {
        return this.request(`${this.service.url}/api/event/add`, event);
    }

    /**
     * @param {string}  requestUrl
     * @param {object}  [postData]
     * @param {object}  [requestOptions]
     * @private
     * @return {Promise}
     */
    request( requestUrl, postData, requestOptions = {} ) {
        const request = require('request-promise');

        const options = {
            method:  requestOptions.method ? requestOptions.method : 'POST',
            uri:     requestUrl,
            body:    postData,
            headers: {
                'x-api-key':    this.service.apiKey,
                'x-api-secret': this.service.apiSecret
            },
            json:    true
        };

        return request(options);
    }

    /**
     * @override
     * @interface
     * @returns {Promise}
     */
    collect() {
        return Promise.resolve({});
    }
}

module.exports = Collector;

"use strict";
const _         = require('lodash'),
      request   = require('request-promise'),
      Collector = require('./collector');

class Google extends Collector {
    async collect() {

        this.setStarted();

        const locations = await this.getLocations();
        return Promise.all(locations.map(l => {
            return this.push({
                category: 'location',
                from:     'google.nl',
                type:     'location',
                about:    l.name,
                value:    l
            });
        }));

    }

    async getLocationCookie() {

        return Promise.resolve(this.config.cookie);

        return new Promise(( resolve, reject ) => {
            const cookieAuth = require('./utils/google_auth');
            cookieAuth.connect('username@gmail.com', '<password>', 'username@gmail.com', ( error, cookie ) => {
                console.info('[fake-auth] error', error);
                console.info('[fake-auth] cookie', cookie);
                if ( error ) {
                    reject(error)
                } else {
                    resolve(cookie);
                }
            })
        });
    }

    async getLocations() {
        const cookie = await this.getLocationCookie();
        const body   = await request({
            url:     'https://www.google.nl/maps/preview/locationsharing/read',
            headers: {
                "Cookie": cookie
            },
            method:  'GET',
            qs:      {
                "authuser": "1",
                "pb":       ""
            }
        });

        let locationData = JSON.parse(body.split('\n').slice(1, -1).join(''));
        const data       = this.parseLocationData(locationData);
        const self       = this.getMyLocation(locationData[9][1]);
        data.push(self);
        return Promise.resolve(data);
    }

    getMyLocation( i ) {
        return {
            "id":        '1',
            "photoURL":  '',
            "name":      'me',
            "lat":       _.result(i, '[1][1]'),
            "long":      _.result(i, '[1][2]'),
            "timestamp": _.result(i, '[2]'),
            "address":   _.result(i, '[4]')
        }
    }

    parseLocationData( locationData ) {
        // shared location data is contained in the first element
        let perlocarr      = locationData[0];
        let userdataobjarr = [];

        if ( perlocarr && perlocarr.length > 0 ) {
            for ( let i = 0; i < perlocarr.length; i++ ) {
                userdataobjarr[i] = this.extractUserLocationData(perlocarr[i]);
            }
        }

        return userdataobjarr;
    }

    extractUserLocationData( userdata ) {
        let userdataobj = {};
        // location data present?
        if ( !userdata[1] ) {
            // no userdata present
            userdataobj = {
                "id":        userdata[0][0],
                "photoURL":  userdata[0][1],
                "name":      userdata[0][3],
                "timestamp": undefined,
                "lat":       undefined,
                "long":      undefined,
                "address":   undefined,
                "battery":   undefined
            }
        } else {
            // userdata present
            userdataobj = {
                "id":        userdata[0][0],
                "photoURL":  userdata[0][1],
                "name":      userdata[0][3],
                "timestamp": userdata[1][2],
                "lat":       userdata[1][1][2],
                "long":      userdata[1][1][1],
                "address":   userdata[1][4],
                "battery":   userdata[13][1]
            }
        }

        return userdataobj;
    }
}

module.exports = Google;

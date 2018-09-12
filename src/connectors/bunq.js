"use strict";

class Bunq {
    constructor( service ) {
        this.service = service;
    }

    store( tokens ) {
        const fs = require('fs');
        fs.writeFileSync(this.service.tokenStore || './config/secrets/google.json', JSON.stringify(tokens));
    }

    setRouter( router ) {
        this.router = router;
        this.setRoutes();
    }

    setRoutes() {
        this.router.get(this.link, ( req, res ) => {
            const url = `https://oauth.bunq.com/auth?response_type=code&client_id=${this.service.key}&redirect_uri=${this.service.redirectServer}${this.service.redirectPath}&state=594f5548-6dfb-4b02-8620-08e03a9469e6`
            res.redirect(url);
        });

        this.router.get(this.service.redirectPath, async ( req, res ) => {
            const code = req.query.code;
            if ( code ) {
                console.info('code:', code);
                this.store({ code });
                res.type('text/html').end('Connected to Bunq! <br><a href="/">Back to home</a>');
            } else {
                res.end('Bunq did not return a valid code.');
            }
        })
    }

    store( tokens ) {
        const fs = require('fs');
        fs.writeFileSync(this.service.tokenStore, JSON.stringify(tokens));
    }

    get name() {
        return 'Bunq';
    }

    get link() {
        return '/connect/bunq';
    }

}

module.exports = Bunq;

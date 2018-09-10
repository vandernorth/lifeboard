"use strict";
const { google } = require('googleapis');

class Google {
    constructor( service, router ) {
        this.service = service;
        this.initialize();
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
            //res.end(`<a href="${this.generateUrl()}">Go to Google</a>`);
            res.redirect(this.generateUrl());
        });

        this.router.get(service.redirectPath, async ( req, res ) => {
            const code = req.query.code;
            if ( code ) {
                console.info('code:', code);
                const { tokens } = await this.oauth2Client.getToken(code);
                this.store(tokens);
                res.type('text/html').end('Connected to Google! <br><a href="/">Back to home</a>');
            } else {
                res.end('Google did not return a valid code.');
            }
        })
    }

    get name() {
        return 'Google';
    }

    get link() {
        return '/connect/google';
    }

    initialize() {
        this.oauth2Client = new google.auth.OAuth2(
            this.service.config.installed.client_id,
            this.service.config.installed.client_secret,
            `${this.service.redirectServer}${this.service.redirectPath}`
        );

        this.oauth2Client.on('tokens', ( tokens ) => {
            console.log('[google] got fresh tokens');
            this.lastTokens = tokens;
            if ( tokens.refresh_token ) {
                this.store(tokens);
            }
        });

        return this.oauth2Client;
    }

    generateUrl() {

        // generate a url that asks permissions for Google+ and Google Calendar scopes
        const scopes = [
            'https://www.googleapis.com/auth/plus.me',
            //'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/calendar.readonly',
            'https://www.googleapis.com/auth/fitness.activity.read',
            'https://www.googleapis.com/auth/gmail.readonly',
            'https://www.googleapis.com/auth/drive.readonly',
            'https://www.googleapis.com/auth/tasks.readonly',
            'profile',
            'email'
        ];

        return this.oauth2Client.generateAuthUrl({
            // 'online' (default) or 'offline' (gets refresh_token)
            access_type: 'offline',

            // If you only need one scope you can pass it as a string
            scope: scopes
        });
    }
}

module.exports = Google;

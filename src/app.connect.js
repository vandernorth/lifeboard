//== Connect to connectors and store keys
"use strict";
const Express = require('express');

class ConnectorApp {

    constructor() {

        const config = require('yargs')
            .demand(['config-file', 'port'])
            .number('port')
            .string('config-file')
            .argv;
        console.info('[configFile]', config.configFile);
        this._connectors = [];
        this.config      = require(config.configFile).connectors;
        this.port        = config.port;

        this.app = Express();
        this.load(this.config);
        this.startHttpServer(this.port);
    }

    startHttpServer( port ) {

        this.routes();
        this.app.use(( error, req, res, next ) => {
            console.error('[web-eror] ', error);
            res.status(500).json({
                error:   'api-error',
                message: String(error)
            });
        });
        this.app.use(( req, res, next ) => {
            res.status(400).json({ error: 'unknown endpoint' });
        });
        this.app.listen(port);
    }

    load( connectors = [] ) {
        connectors.forEach(c => {
            console.info('[load]    ', c.type);
            try {
                const thisConnector = ConnectorApp.configToConnector(c);
                thisConnector.setRouter(this.app);
                this._connectors.push(thisConnector);
            }
            catch ( ex ) {
                console.warn(ex);
            }
            const type = ConnectorApp.Map[c.type];
            if ( type ) {
                const Type          = require(type),
                      thisConnector = new Type(c, this.app);
                this._connectors.push(thisConnector);
            } else {
                console.warn(`[loadError] Cannot load collector type ${c.type}.`);
            }
        });
    }

    static configToConnector( config ) {
        const type = ConnectorApp.Map[config.type];
        if ( type ) {
            const Type          = require(type),
                  thisConnector = new Type(config);

            return thisConnector;
        } else {
            throw `[loadError] Cannot load collector type ${config.type}.`;
        }
    }

    routes() {
        this.app.get('/', ( req, res ) => {
            let html = `<h3>Connect</h3>`;
            this._connectors.forEach(c => {
                html += `<a href="${c.link}">Connect to ${c.name}</a><br>`;
            });
            res.type('text/html').end(html);
        })
    }

    static get Map() {
        return {
            'google': './connectors/google.js',
            'bunq':   './connectors/bunq.js'
        }
    }
}

module.exports = ConnectorApp;

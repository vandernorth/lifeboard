"use strict";
const _          = require('lodash'),
      Express    = require('express'),
      BodyParser = require('body-parser'),
      Stat       = require('./general/schema/stat').Stat,
      Event      = require('./general/schema/event').Event,
      Crypto     = require('crypto'),
      Mongoose   = require('mongoose');

Mongoose.Promise = Promise;

class DataAPI {

    constructor() {
        this.config = require('yargs')
            .demand(['port', 'db-server', 'api-key', 'api-secret'])
            .number('port')
            .string('db-server')
            .argv;

        console.info('[port]    ', this.config.port);
        console.info('[dbServer]', this.config.dbServer);
        console.info('[apiKey]  ', this.config.apiKey);
        console.info('[apiSecrt]', this.config.apiSecret);

        this.isConnected = false;
        this.dbConnect(this.config.dbServer);
        this.startHttpServer(this.config.port);
    }

    dbConnect( connectionString ) {
        console.info('[database] Connecting to', connectionString);
        Mongoose.connect(connectionString, { useNewUrlParser: true }, connectError => {
            if ( connectError ) {
                this.isConnected = false;
                console.error(connectError, '[database] ERROR connecting to mongodb. ' + connectError + ' Trying again in 10 seconds...');
                setTimeout(() => this.dbConnect(connectionString), 10 * 1000);
            }
            else {
                console.info('[database] Connected to mongodb');
                this.isConnected = true;
            }
        });
    }

    startHttpServer( port ) {
        this.app = Express();
        this.app.use(( req, res, next ) => {

            console.info('[request] ', req.url);

            if ( !this.isConnected ) {
                res.json({ error: 'not connected' });
            } else if ( req.header('x-api-key') !== this.config.apiKey || req.header('x-api-secret') !== this.config.apiSecret ) {
                res.json({ error: 'authentication error' });
            } else {
                next()
            }
        });
        this.apiRoutes();
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

    apiRoutes() {
        // express endpoint
        //== /api/stat/add
        //== /api/stat/read
        //== /api/event/add

        this.app.post('/api/stat/add', BodyParser.json({
            limit:  '5mb',
            strict: true
        }), ( req, res ) => {

            //== Find last...
            //== if.same => update
            //== if.diff => add

            if ( !req.body || Object.keys(req.body).length <= 2 ) {
                throw "invalid body";
            }

            Stat.findOne({}, null, { sort: '-_id' })
                .then(last => {
                    console.info('I found', last);

                    if ( !req.body.keyHash ) {
                        req.body.keyHash = Crypto.createHash('sha256')
                            .update(`${req.body.category}.${req.body.from}.${req.body.type}.${req.body.about}`)
                            .digest('hex');
                    }

                    if ( !req.body.valueHash ) {
                        req.body.valueHash = Crypto.createHash('sha256')
                            .update(`${JSON.stringify(req.body.value)}`)
                            .digest('hex');
                    }

                    if ( last && DataAPI.isSame(last, req.body) ) {
                        last.toDate = Date.now();
                        last.markModified('toDate');
                        last.save();
                        res.json({
                            status:  'ok',
                            message: 'updated last entry'
                        });
                    } else if ( last && req.body.updateLast ) {
                        last.toDate = Date.now();
                        last.markModified('toDate');

                        const update = _.omit(req.body, ['fromDate', 'toDate', '_id']);
                        Object.assign(last, update);

                        last.save();
                        res.json({
                            status:  'ok',
                            message: 'updated last entry'
                        });
                    } else {
                        const thisStat = new Stat(req.body);

                        thisStat.save().then(() => {
                            res.json({
                                status:  'ok',
                                message: 'created new entry'
                            });
                        }).catch(DataAPI.handleError(res));
                    }
                })
                .catch(DataAPI.handleError(res));
        });

        this.app.get('/api/stat/read', ( req, res ) => {
            console.info('[stat-get] ', req.query);
            Stat.find(_.pick(req.query, ['category', 'from', 'type', 'about']), null, {
                limit: req.query.limit ? Number(req.query.limit) : 50,
                sort:  req.query.sort
            }).then(result => {
                res.json(result);
            }).catch(DataAPI.handleError(res))
        });

        this.app.post('/api/event/add', BodyParser.json({
            limit:  '5mb',
            strict: true
        }), ( req, res ) => {
            res.json({ status: 'not-implemented' });
        });
    }

    static isSame( last, newObject ) {
        return last && newObject && last.keyHash === newObject.keyHash && last.valueHash === newObject.valueHash
    }

    static handleError( res ) {
        return error => {
            console.error('[endpoint-error]', error);
            res.status(500).json({
                error:   'endpoint-error',
                message: String(error)
            })
        }
    }

}

module.exports = DataAPI;

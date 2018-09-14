"use strict";
const _          = require('lodash'),
      { google } = require('googleapis'),
      moment     = require('moment'),
      Collector  = require('./collector');

//== GOOGLE:
//==  - Calendar
//==  - Keep
//==  - Tasks

class Google extends Collector {
    async collect() {

        console.info('[collect] google');

        this.setStarted();

        if ( !this._installed ) {
            this._installed = await this.install();
        }

        await this.getCalendar();
        await this.getTasks();

        return true;
    }

    pushGoogle( object ) {
        return this.push(Object.assign({
            //== ID
            from:       'google',
            category:   'personal',
            type:       'unknown',
            about:      this.config.name,
            //== Do not keep history
            updateLast: true
        }, object));
    }

    async getCalendar() {
        const res = await this.calendar.events.list({
            userId:       'me',
            calendarId:   'primary',
            timeMin:      moment().startOf('day').toDate().toISOString(),
            maxResults:   20,
            singleEvents: true,
            orderBy:      'startTime',
        });
        this.pushGoogle({
            value: res.data.items,
            type:  'calendar'
        });
    }

    async getTasks() {
        const lists = (await this.tasks.tasklists.list({ maxResults: 10 })).data.items;
        //console.info('lists', lists.map(l => `${l.title}`));
        const tasks = (await this.tasks.tasks.list({ tasklist: _.find(lists, { title: 'Global' }).id })).data.items;
        //console.log('tasks', tasks.map(t => `${t.title} (${t.status})`));
        this.pushGoogle({
            value: tasks,
            type:  'tasks'
        });
    }

    installServices() {
        const auth = this.connector.oauth2Client;

        this.calendar = google.calendar({
            version: 'v3',
            auth
        });

        this.tasks = google.tasks({
            version: 'v1',
            auth
        });

    }

    async install() {
        console.info('[install]');
        if ( !this.connector || !this.connector.service.tokenStore ) {
            console.error('Unable to load Google Connector');
            return;
        }

        const fs     = require('fs').promises;
        const tokens = (await fs.readFile(this.connector.service.tokenStore)).toString();
        this.connector.oauth2Client.setCredentials(JSON.parse(tokens));
        console.info('[google.install] tokens.ready');
        this.installServices();
        return tokens;
    }

}

module.exports = Google;

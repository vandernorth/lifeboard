"use strict";
const { google } = require('googleapis');

class Google {
    constructor() {

    }

    initialize() {
        const oauth2Client = new google.auth.OAuth2(
            YOUR_CLIENT_ID,
            YOUR_CLIENT_SECRET,
            YOUR_REDIRECT_URL
        );

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

        const url = oauth2Client.generateAuthUrl({
            // 'online' (default) or 'offline' (gets refresh_token)
            access_type: 'offline',

            // If you only need one scope you can pass it as a string
            scope: scopes
        });
    }

    connect() {

    }
}

module.exports = Google;

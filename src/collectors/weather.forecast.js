"use strict";
const Collector = require('./collector'),
      request   = require('request-promise');

class WeatherForecast extends Collector {
    async collect() {
        this.setStarted();
        return Promise.all([this.getRainfall(), this.getCurrentWeather(), this.getForecast()]);
    }

    async getRainfall() {
        const txtForecast = await request({
            url:    `https://gpsgadget.buienradar.nl/data/raintext/?lat=${this.config.lat}&lon=${this.config.lon}`,
            method: 'GET'
        });

        const map = txtForecast.split('\r\n').map(l => {
            const parts = l.split('|');
            return {
                time:  parts[1],
                value: Number(parts[0])
            }
        });

        return this.push({
            category:   'weather',
            from:       'buienradar',
            type:       'rainfall',
            about:      this.config.city,
            value:      map,
            updateLast: true
        });
    }

    async getCurrentWeather() {
        const current = await request({
            url:    `http://api.openweathermap.org/data/2.5/weather?q=${this.config.city},${this.config.country}&APPID=${this.config.apiKey}&units=metric`,
            method: 'GET',
            json:   true
        });

        return this.push({
            category:   'weather',
            from:       'openweathermap.org',
            type:       'current',
            about:      this.config.city,
            value:      current,
            updateLast: true
        });
    }

    async getForecast() {
        const forecast = await request({
            url:    `http://api.openweathermap.org/data/2.5/forecast?q=${this.config.city},${this.config.country}&APPID=${this.config.apiKey}&units=metric`,
            method: 'GET',
            json:   true
        });

        return this.push({
            category:   'weather',
            from:       'openweathermap.org',
            type:       'forecast',
            about:      this.config.city,
            value:      forecast.list,
            updateLast: true
        });
    }

}

module.exports = WeatherForecast;

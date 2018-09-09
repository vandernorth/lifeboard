"use strict";
const _         = require('lodash'),
      Collector = require('./collector'),
      RssParser = require('rss-parser'),
      parser    = new RssParser();

class TweakersNet extends Collector {
    async collect() {
        this.setStarted();
        this.url   = "http://feeds.feedburner.com/tweakers/mixed";
        const feed = await parser.parseURL(this.url);

        const items = feed.items
            .filter(i => i.categories.join('').includes('Nieuws'))
            .map(i => {
                return {
                    title:   i.title,
                    content: i.contentSnippet,
                    link:    i.guid
                }
            });

        return this.push({
            //== ID
            category:   'news',
            from:       'tweakers.net',
            type:       'highlights',
            about:      'tech',
            //== Value
            value:      items,
            //== Do not keep history
            updateLast: true
        });
    }

}

module.exports = TweakersNet;

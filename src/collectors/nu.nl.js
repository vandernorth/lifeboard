"use strict";
const _         = require('lodash'),
      Collector = require('./collector'),
      RssParser = require('rss-parser'),
      parser    = new RssParser();

class NuNL extends Collector {
    async collect() {
        this.setStarted();
        this.url   = "https://www.nu.nl/rss";
        const feed = await parser.parseURL(this.url);

        const items = feed.items.map(i => {
            return {
                title:   i.title,
                content: i.contentSnippet,
                link:    i.guid,
                img:     _.result(i, 'enclosure.url')
            }
        });

        return this.push({
            //== ID
            category:   'news',
            from:       'nu.nl',
            type:       'highlights',
            about:      'all',
            //== Value
            value:      items,
            //== Do not keep history
            updateLast: true
        });
    }

}

module.exports = NuNL;

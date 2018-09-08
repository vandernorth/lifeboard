"use strict";
const Mongoose   = require('mongoose'),
      Schema     = Mongoose.Schema,
      StatSchema = new Schema({
          category:   String, //== finance, media, location, home, network, news
          from:       String, //== Bunq, Google, Spotify, Nest, Hue
          type:       String, //== account.info, transactions.last, home.temperature
          about:      String, //== 'jeffrey', 'id981232', 'room1', 'none'
          //== Identification
          keyHash:    String,
          valueHash:  String,
          fromDate:   {
              type:    Date,
              default: Date.now
          },
          toDate:     Date,
          //== Value-fields
          value:      Object,
          attachment: {
              data:        Buffer,
              contentType: String
          }
      }, { strict: false });

const Stat                = Mongoose.model('stat', StatSchema);
module.exports.Stat       = Stat;
module.exports.StatSchema = StatSchema;

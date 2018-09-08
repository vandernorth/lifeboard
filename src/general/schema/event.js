/*! Copyright (C) Grexx - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and Confidential
 */

/**
 * @fileOverview
 * @author Jeffrey van Norden | Grexx <jeffrey@grexx.net>
 */

"use strict";
const _          = require('lodash'),
      Mongoose   = require('mongoose'),
      Schema     = Mongoose.Schema,
      EventSchema = new Schema({
        type:        String,
        subType:     String,
        cluster:     String,
        category:    String,
        hostname:    String,
        attachment:  {
          data:        Buffer,
          contentType: String
        },
        captureDate: {
          type:    Date,
          default: Date.now
        }
      }, { strict: false });

const Event                = Mongoose.model('event', EventSchema);
module.exports.Event       = Event;
module.exports.EventSchema = EventSchema;

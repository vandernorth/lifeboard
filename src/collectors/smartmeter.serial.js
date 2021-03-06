"use strict";
const Collector  = require('./collector'),
      com        = require('serialport'),
      SerialPort = com.SerialPort;

class SmartMeter extends Collector {
    async collect() {

        if ( !this._installed ) {
            return this.install();
        }

        this.setStarted();

        return this.push({
            category: 'home',
            from:     'SmartMeter',
            type:     'usage',
            about:    this.config.address,
            value:    this._lastValue
        });
    }

    install() {
        this._installed = true;
        this._lastValue = {};
        this.serialPort = new SerialPort("/dev/ttyUSB0",
            {
                "baudrate": 9600,
                "databits": 7,
                "parity":   'even',
                "parser":   com.parsers.readline('\r\n', 'ascii')
            });

        this.startReading();
    }

    startReading() {

        console.info('[SmartMeter] Starting Poster.read()');

        this.messageBuilder = [];
        this.firstPassOk    = false;

        this.serialPort.on('open', () => {
            console.info('[SmartMeter] Serial port opened');
            this.serialPort.on('data', data => {

                //== Add to message
                if ( this.firstPassOk === true ) {
                    this.messageBuilder.push(data);
                }

                //== End of message
                if ( data === '!' && this.firstPassOk === true ) {
                    this._lastValue     = SmartMeter.parseMessage(this.messageBuilder);
                    this.messageBuilder = [];
                    this.push({
                        category:   'home',
                        from:       'SmartMeter',
                        type:       'current',
                        about:      this.config.address,
                        value:      this._lastValue,
                        updateLast: true
                    });
                } else if ( data === '!' ) {
                    console.info('[SmartMeter] First message ending received. Capture can start.');
                    this.firstPassOk = true;
                }
            });
        });
    }

    static parseMessage( message ) {

        /** [Message to parse]
         0-0:96.1.1(4B414C37303035313738373238363133);
         1-0:1.8.1(01466.548*kWh);
         1-0:1.8.2(01725.716*kWh);
         1-0:2.8.1(00000.000*kWh);
         1-0:2.8.2(00000.001*kWh);
         0-0:96.14.0(0002);
         1-0:1.7.0(0000.55*kW);
         1-0:2.7.0(0000.00*kW);
         0-0:17.0.0(0999.00*kW);
         0-0:96.3.10(1);
         0-0:96.13.1();
         0-0:96.13.0();
         0-1:24.1.0(3);
         0-1:96.1.0(4730303135353631313037333538353133);
         0-1:24.3.0(150128150000)(00)(60)(1)(0-1:24.2.1)(m3);
         (00710.705);
         0-1:24.4.0(1);
         !;
         */

        return {
            "device":        message[0],
            "totalLow":      parseValue(message[3]).value,
            "totalHigh":     parseValue(message[4]).value,
            "returnLow":     parseValue(message[5]),
            "returnHigh":    parseValue(message[6]),
            "lowOrHigh":     parseValueInt(message[7]),
            "currentUse":    parseValue(message[8]).value,
            "currentReturn": parseValue(message[9]),
            "maxPower":      parseValue(message[10]),
            "gasId":         parseValueInt(message[15]),
            "gasTime":       parseValueInt(message[16]),
            "gasUse":        parseValueInt(message[17]),
            "gasValve":      parseValueInt(message[18]),
            "original":      message
        };
    }
}

function parseValue( value ) {
    return {
        value: parseFloat(value.replace(/(.+)\(([0-9.]*)\*?(.+)\)/, '$2')),
        unit:  value.replace(/(.+)\(([0-9.]*)\*?(.+)\)/, '$3')
    }
}

function parseValueInt( value ) {
    let returnValue = value.match(/\(([0-9.]+)\)/)[1];
    return parseFloat(returnValue);
}

module.exports = SmartMeter;

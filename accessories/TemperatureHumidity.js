'use strict';

const {util} = require('../util/Util')
const {Accessory} = require('../util/Accessory');
const {
    configCurrentTemperatureCharacteristic,
} = require('./characteristic/Climate');

const TEMPERATURE = 'TemperatureSensor';
const HUMIDITY = 'HumiditySensor';

class TemperatureHumidityAccessory extends Accessory {

     constructor(platform, device) {
        super(platform, device);

        this._services[HUMIDITY] = this._getHumidityService();
        this._services[TEMPERATURE] = this._getTemperatureService();
    }

    _getTemperatureService() {
        this._log.debug(`Creating temperature service for ${this.name}`);
        let temperatureService = new this.Service.TemperatureSensor(this.name);

        let characteristic = temperatureService.getCharacteristic(this.Characteristic.CurrentTemperature);
        characteristic.on('get', function(callback) {
            callback(null, this.getCurrentValueFromSensor(TEMPERATURE));
        }.bind(this));

        return temperatureService;
    }

    _getHumidityService() {
        this._log.debug(`Creating humidity service for ${this.name}`);
        let humidityService = new this.Service.HumiditySensor(this.name);

        let characteristic = humidityService.getCharacteristic(this.Characteristic.CurrentRelativeHumidity);
        characteristic.on('get', function(callback) {
            callback(null, this.getCurrentValueFromSensor(HUMIDITY));
        }.bind(this));

        return humidityService;
    }

    getCurrentValueFromSensor(sensor) {

        let capability = this._device.getCapabilityOfType(sensor);
        if (!capability) {
            return;
        }

        let stateDescr = sensor.slice(0,sensor.indexOf('Sensor')).toLowerCase();
        let state = capability.getStateForKey(stateDescr);
        if (!state) {
            return;
        }

        this._log(`Getting ${sensor} for ${this.name} (${state.value})`);
        return state.value;
    }

    updateValueFromSensor(sensor) {
        let service = this._services[sensor];

        var characteristic = null;
        if (sensor === TEMPERATURE) {
            characteristic = service.getCharacteristic(this.Characteristic.CurrentTemperature);
        } else if (sensor === HUMIDITY) {
            characteristic = service.getCharacteristic(this.Characteristic.CurrentRelativeHumidity);
        }

        if (characteristic) {
            let newValue = this.getCurrentValueFromSensor(sensor);
            characteristic.updateValue(newValue);
            this._log(`Updating ${sensor} for ${this.name} (${newValue})`);
        }
    }

}

const type = "TemperatureHumidity";

function createAccessory(platform, device) {
    return new TemperatureHumidityAccessory(platform, device);
}

module.exports = {createAccessory, type};
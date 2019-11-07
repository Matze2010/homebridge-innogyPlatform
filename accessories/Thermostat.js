'use strict';

const {util} = require('../util/Util')
const {Accessory} = require('../util/Accessory');
const {
    configTargetTemperatureCharacteristic,
    configTemperatureDisplayUnitsCharacteristic,
    configCurrentHeatingCoolingStateCharacteristic,
    configTargetHeatingCoolingStateCharacteristic
} = require('./characteristic/Climate');


class ThermostatAccessory extends Accessory {

    constructor(platform, device) {
        super(platform, device);
        this._services['Primary'] = this._getPrimaryService();
        this.lastSetpoint = null;
    }

    _getPrimaryService() {
        this._log.debug(`Creating thermostat service for ${this.name}`);
        let primaryService = new this.Service.Thermostat(this.name);

        configTargetTemperatureCharacteristic.bind(this)(primaryService);
        configTargetHeatingCoolingStateCharacteristic.bind(this)(primaryService);
        configCurrentHeatingCoolingStateCharacteristic.bind(this)(primaryService);
        configTemperatureDisplayUnitsCharacteristic.bind(this)(primaryService);

        let curTempCharacteristic = primaryService.getCharacteristic(this.Characteristic.CurrentTemperature);
        curTempCharacteristic.on('get', function(callback) {
            callback(null, this.getCurrentTemperature());
        }.bind(this));

        let targetTempCharacteristic = primaryService.getCharacteristic(this.Characteristic.TargetTemperature);
        targetTempCharacteristic.on('get', function(callback) {
            callback(null, this.getTargetTemperature());
        }.bind(this));
        targetTempCharacteristic.on('set', function(value, callback) {
            this.setTargetTemperature(value);
            callback();
        }.bind(this));


        let curHumCharacteristic = primaryService.getCharacteristic(this.Characteristic.CurrentRelativeHumidity);
        curHumCharacteristic.on('get', function(callback) {
            callback(null, this.getCurrentHumidity());
        }.bind(this));

        return primaryService;
    }

    getTargetTemperature() {
        let capability = this._device.getCapabilityOfType("RoomSetpoint");
        if (!capability) {
            return;
        }
        let state = capability.State[0];
        if (!state) {
            return;
        }

        return state.value;
    }

    setTargetTemperature(value) {
        let capability = this._device.getCapabilityOfType("RoomSetpoint");
        if (!capability) {
            return;
        }

        return capability.setState(value, "pointTemperature");
    }

    getCurrentTemperature() {
        let capability = this._device.getCapabilityOfType("RoomTemperature");
        if (!capability) {
            return;
        }

        let state = capability.State[0];
        if (!state) {
            return;
        }

        return state.value;
    }

    getCurrentHumidity() {
        let capability = this._device.getCapabilityOfType("RoomHumidity");
        if (!capability) {
            return;
        }

        let state = capability.State[0];
        if (!state) {
            return;
        }

        return state.value;
    }

    updateValueFromSensor(sensor) {
        let service = this._services['Primary'];

        var characteristic = null;
        var newValue = null;
        if (sensor === 'RoomTermperature') {
            characteristic = service.getCharacteristic(this.Characteristic.CurrentTemperature);
            newValue = this.getCurrentTemperature();
        } else if (sensor === 'RoomHumidity') {
            characteristic = service.getCharacteristic(this.Characteristic.CurrentRelativeHumidity);
            newValue = this.getCurrentHumidity();
        } else if (sensor === 'RoomSetpoint') {
            characteristic = service.getCharacteristic(this.Characteristic.TargetTemperature);
            newValue = this.getTargetTemperature();
        }

        if (characteristic) {
            characteristic.updateValue(newValue);
            this._log(`Updating ${sensor} for ${this.name} (${newValue})`);
        }

    }

}

const type = "Thermostat";

function createAccessory(platform, device) {
    return new ThermostatAccessory(platform, device);
}

module.exports = {createAccessory, type};
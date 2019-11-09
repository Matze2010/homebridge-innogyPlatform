'use strict';

const {util} = require('../util/Util')
const {Accessory} = require('../util/Accessory');

class SwitchAccessory extends Accessory {

     constructor(platform, device) {
        super(platform, device);

        this._services['Primary'] = this._getPrimaryService();
    }

    _getPrimaryService() {
        this._log.debug(`Creating switch service for ${this.name}`);
        let primaryService = new this.Service.Switch(this.name);

        let characteristic = primaryService.getCharacteristic(this.Characteristic.On);
        characteristic.on('get', function(callback) {
            let currentState = this.getCurrentState();
            if (currentState === undefined) {
                callback("Could not get state of Switch", null);
            } else {
                callback(null, currentState);
            }
        }.bind(this));

        characteristic.on('set', function(value, callback) {
            let result = this.setCurrentState(value);
            callback();
        }.bind(this));

        return primaryService;
    }

    getCurrentState() {

        let capability = this._device.getCapabilityOfType("BooleanStateActuator") || this._device.getCapabilityOfType("SwitchActuator");
        if (!capability) {
            return;
        }

        let state = capability.State[0];
        if (!state) {
            return;
        }

        this._log(`Getting State for ${this.name} (${state.value})`);
        return state.value;
    }

    setCurrentState(value) {

        let booleanCapability = this._device.getCapabilityOfType("BooleanStateActuator");
        if (booleanCapability) {
            return booleanCapability.setState(value, "value");
        }

        let switchCapability = this._device.getCapabilityOfType("SwitchActuator");
        if (switchCapability) {
            return switchCapability.setState(value, "onState");
        }
        
        return;
    }

    updateValueFromSensor(sensor) {
        let service = this._services['Primary'];
        let characteristic = service.getCharacteristic(this.Characteristic.On);
        let newValue = this.getCurrentState();

        if (characteristic && (newValue !== undefined)) {
            characteristic.updateValue(newValue);
            this._log(`Updating ${sensor} for ${this.name} (${newValue})`);
        }
    }

}

const type = "Switch";

function createAccessory(platform, device) {
    return new SwitchAccessory(platform, device);
}

module.exports = {createAccessory, type};
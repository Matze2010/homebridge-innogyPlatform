'use strict';

class Accessory {
    constructor(platform, device) {

        if (!platform) throw new Error("Accessories must be created with a link to the platform");

        this._log = platform.log;
        this._device = device;

        this.name = device.config.name;
        this.id = device.id;
        this.uuid_base = platform.api.hap.uuid.generate(this.id);

        this.Service = platform.api.hap.Service;
        this.Characteristic = platform.api.hap.Characteristic;

        this._services = {};
        this._services['AccessoryInformation'] = this._getAccessoryInformationService();

        this._log(`Created Accessory '${this.name}' - ${this.id} (UUID: ${this.uuid_base})`);
    }

    getServices() {
        let list = Object.values(this._services);
	    this._log.debug(`Getting services for ${this.name} (${list.length} service(s) registered for this accessory`);
        return list;
    }

    _getAccessoryInformationService() {
        return new this.Service.AccessoryInformation()
            .setCharacteristic(this.Characteristic.Name, this.name)
            .setCharacteristic(this.Characteristic.Manufacturer, this._device.manufacturer)
            .setCharacteristic(this.Characteristic.Model, `${this._device.type} ${this._device.version}`)
            .setCharacteristic(this.Characteristic.SerialNumber, this.id);
    }

    updateValueFromSensor(sensor) {
        
    }
}

module.exports = {Accessory};

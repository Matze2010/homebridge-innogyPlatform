
function configTargetTemperatureCharacteristic(service) {
    let capability = this._device.getCapabilityOfType("RoomSetpoint");
    if (!capability) {
        return;
    }

    let maxTemp = capability.config.maxTemperature;
    let minTemp = capability.config.minTemperature;
    service.getCharacteristic(this.Characteristic.TargetTemperature)
        .setProps({
            maxValue: maxTemp,
            minValue: minTemp,
            minStep: 0.1
        });

}

function configTemperatureDisplayUnitsCharacteristic(service) {
    service.getCharacteristic(this.Characteristic.TemperatureDisplayUnits)
        .setValue(this.Characteristic.TemperatureDisplayUnits.CELSIUS);
}

function configCurrentHeatingCoolingStateCharacteristic(service) {
    service.getCharacteristic(this.Characteristic.CurrentHeatingCoolingState)
        .setValue(1)
        .on('get', function(callback) {
            callback(null, 1);
        });
}

function configTargetHeatingCoolingStateCharacteristic(service) {
    service.getCharacteristic(this.Characteristic.TargetHeatingCoolingState)
        .setValue(3)
        .setProps({
            validValues: [3],
            perms: ['pr', 'ev']
        })
        .on('get', function(callback) {
            callback(null, 3);
        });
}

module.exports = {
    configTargetTemperatureCharacteristic,
    configTemperatureDisplayUnitsCharacteristic,
    configCurrentHeatingCoolingStateCharacteristic,
    configTargetHeatingCoolingStateCharacteristic
};
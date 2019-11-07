'use strict';

const Device = require("innogy-smarthome-lib/lib/smarthome/objects/device");
const Capability = require("innogy-smarthome-lib/lib/smarthome/objects/capability");

Device.prototype.getCapabilityOfType = function (type) {
    var res = null;

    this.Capabilities.forEach(function(capability) {
        var cap = capability.type === type ? capability : null;
        if (cap) {
            res = cap;
        }
    });

    return res;
};

Capability.prototype.getStateForKey = function(key) {
    var res = null;
    this.State.forEach(function (currentState) {
        var state = currentState.name === key ? currentState : null;
        if (state) {
            res = state;
        }
    });

    return res;
};
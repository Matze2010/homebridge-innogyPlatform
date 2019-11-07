const fs = require('fs');

const version = require('./package').version;
const platformName = 'Innogy Smarthome Bridge';
const platformPrettyName = 'Innogy-Smarthome';
const SmartHome = require("innogy-smarthome-lib");

const {Accessory} = require('./util/Accessory');

module.exports = function(homebridge) {
  homebridge.registerPlatform(platformPrettyName, platformPrettyName, InnogyBridge);
};


const InnogyBridge = class {

  constructor(log, config, api) {

    log.debug("Instantiating InnogyBridge");

    this._callback = null;

    this._log = log;
    this._config = config;
    
    this._accessories  = [];
    this._factories = {};

    this._log(`Loading accessory types...`);
    let accessoryDirectory = `${__dirname}/accessories`;
    let accessoryFiles = fs.readdirSync(accessoryDirectory, {"withFileTypes": true});
    accessoryFiles.forEach(function (accessoryFile) {
      if(accessoryFile.isFile()) {
        let accessoryFilePath = `${accessoryDirectory}/${accessoryFile.name}`;
        let accessoryFileName = accessoryFilePath.split(/[\\/]/).pop();

        let accessoryType = require(accessoryFilePath).type;
        if(accessoryType === undefined || !(typeof accessoryType === "string")) {
          this._log.warn(`Ignoring ${accessoryFileName} due to missing 'type' definition`);
        } else {
          this._log.debug(`Found accessory of type ${accessoryType}`);
          let accessoryFactory = require(accessoryFilePath).createAccessory;
          if(accessoryFactory === undefined || !(typeof accessoryFactory === "function")) {
            this._log.warn(`Ignoring ${accessoryFileName}, due to missing 'createAccessory' definition`);
          } else if (this._factories[accessoryType]) {
            this._log.warn(`There is already an accessory of type ${accessoryType} loaded, skipping this`);
          } else {
            this._log(`Loading and activating accessory type ${accessoryType}`);
            this._factories[accessoryType] = require(accessoryFilePath).createAccessory;
          }
        }
      }
    }.bind(this));

    if(!api) {
      const msg = `API element not set, please update your homebridge installation`;
      this._log.error(msg);
      throw new Error(msg);
    }

    this._platform = {
      innogyBackend: new SmartHome(this._config.innogy),
      api:  api,
      log: log
    };

    this._platform.api.on('didFinishLaunching', function() {
      this._platform.innogyBackend.init();
    }.bind(this));

    this._platform.innogyBackend.on("needsAuthorization", function (auth) {
      this._log.error(auth);
      throw new Error(auth);
    }.bind(this));
      
    this._platform.innogyBackend.on("needsMobileAccess", function () {
      let msg = "YOU NEED TO BUY MOBILE ACCESS!";
      this._log.error(msg);
      throw new Error(msg);
    }.bind(this));

    this._platform.innogyBackend.on("stateChanged", function (aCapability) {
      let sensorType = aCapability.type;
      let deviceId = this._platform.innogyBackend.getDeviceByCapability(aCapability).id;
      let accessory = this.getAccessory(deviceId);
      if (accessory) {
        accessory.updateValueFromSensor(sensorType);
      }
    }.bind(this));

    this._platform.innogyBackend.on("initializationComplete", function() {
      this.listDevicesDetected();
    }.bind(this));
  }

  addAccessory(type, device) {
      
    const factory = this._factories[type];
    if (factory === undefined) {
      this._log.error(`Accessory type is unknown: ${type}`);
      return;
    }

    let newAccessory = factory(this._platform, device);
    this._accessories.push(newAccessory);
  }

  getAccessory(filter) {

    if (!(typeof filter === "string")) {
      return null;
    }

    let items = [];
    this._accessories.forEach(function(accessory) {
      if ((accessory.name === filter) || (accessory.id === filter) || (accessory.uuid_base === filter)) {
        items.push(accessory);
      }
    });

    return items.length ? items[0] : null;
  }

  accessories(callback) {
    this._callback = callback;
  }

  listDevicesDetected() {
    if (this._platform.innogyBackend.device && this._platform.innogyBackend.device.length) {
      this._platform.innogyBackend.device.forEach(function (aDevice) {
        
        let innogyType = aDevice.type;

        if ((innogyType === 'RST') || (innogyType === 'WRT')) {
          if (aDevice.Location !== undefined) {
            this.addAccessory("TemperatureHumidity", aDevice);
          } else {
            this.addAccessory("Thermostat", aDevice);
          }

        } else if (innogyType === 'VRCC') {
          this.addAccessory("Thermostat", aDevice);

        } else {
          console.log(`Unknown InnogyType: ${innogyType}`)
        }

      }.bind(this));
            
      this._callback(this._accessories);
    }
  }
  
};
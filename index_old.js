const SmartHome = require("innogy-smarthome-lib");

const smartHome = new SmartHome(config);

smartHome.on("needsAuthorization", function (auth) {
    console.log(auth);
});

smartHome.on("needsMobileAccess", function () {
    console.log("YOU NEED TO BUY MOBILE ACCESS!");
});

smartHome.on("stateChanged", function (aCapability) {
    console.log("stateChanged");

    console.log("    ID:", aCapability.id);
    console.log("    Type:", aCapability.type);

    if (aCapability.Config) {
        console.log("    - CONFIG:");
	
        aCapability.Config.forEach(function (aState) {
            console.log("        Name:", aState.name);
            console.log("        Type:", aState.type);
            console.log("        Access:", aState.access);
            console.log("        Value:", aState.value);
            console.log("        LastChanged:", aState.lastchanged);
            console.log("");
        });
    }

    if (aCapability.State.length) {
        console.log("    - STATES:");

        aCapability.State.forEach(function (aState) {
            console.log("        Name:", aState.name);
            console.log("        Type:", aState.type);
            console.log("        Access:", aState.access);
            console.log("        Value:", aState.value);
            console.log("        LastChanged:", aState.lastchanged);
            console.log("");
        });
    }
});

smartHome.on("initializationComplete", function () {
    console.log("INITIALIZATION SEQUENCE COMPLETED");

    if (smartHome.device && smartHome.device.length) {
        console.log("LIST OF ALL REGISTERED DEVICES:");

        smartHome.device.forEach(function (aDevice) {
            console.log("----------------------------------------");

            console.log("ID:", aDevice.id);
            console.log("Type:", aDevice.type);
            console.log("Name:", aDevice.getName()); // Helper needed, as name is stored within configuration!

            if (aDevice.Location)
                console.log("Location:", aDevice.Location.getName()); // Helper needed, as name is stored within configuration!

            console.log("- CAPABILITIES:");

            aDevice.Capabilities.forEach(function (aCapability) {
                console.log("    ID:", aCapability.id);
                console.log("    Type:", aCapability.type);

                if (aCapability.config) {
                    console.log("    - CONFIG:");

		    	let aState = aCapability.config;
                        console.log(aState);
                }

                if (aCapability.State.length) {
                    console.log("    - STATES:");
		    console.log(aCapability.State);
                }

                console.log("");
            });
        });
    }

    // Get capapbility by ID
    var cap = smartHome.getCapabilityById("6779b774056c458582fc2a9a077a58e2");

    // setState accepts as first parameter the value you want to set
    // will be parsed automatically, so "true", true, 1 for a boolean value is allowed
    // the second parameter is the state you want to set (optional, if missing the first state is used)
    cap.setState(true, "OnState");

    // Close connection once everything is done
   // smartHome.finalize();
});

smartHome.init();

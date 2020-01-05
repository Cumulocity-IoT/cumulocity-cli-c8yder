/**
 * C8y Client module
 */
const { FetchClient } = require("@c8y/client");
const { BasicAuth } = require("@c8y/client");
const { InventoryService } = require("@c8y/client");
const { IdentityService } = require("@c8y/client");
const { MeasurementService } = require("@c8y/client");
const { SystemOptionsService } = require("@c8y/client");
const { EventService } = require("@c8y/client");
const { AlarmService } = require("@c8y/client");
var chalk = require('chalk');

let _c8yClient;
let _inventoryService;
let _identityService;
let _measurementService;
let _systemOptionsService;
let _eventService;
let _alarmService;

async function initClient(input) {
    const baseUrl = input.baseUrl;
    let auth = new BasicAuth({
        user: input.user,
        password: input.password,
        tenant: input.tenant
    });

    _c8yClient = new FetchClient(auth, baseUrl);
    if (_c8yClient) {
        _systemOptionsService = new SystemOptionsService(_c8yClient);
        try {
            let systemVersion = {
                category: 'system',
                key: 'version'
            };

            var systemVersionResult = await _systemOptionsService.detail(systemVersion);
            console.log(chalk.green('Connected to C8y, Version: ' + systemVersionResult.data.value + ' successfully!'));
        } catch (e) {
            if (e.data && e.data.message) {
                console.log(chalk.red(e.data.message));
            } else {
                console.log(chalk.red(e));
            }
            return false;
        }
        _inventoryService = new InventoryService(_c8yClient);
        _identityService = new IdentityService(_c8yClient);
        _measurementService = new MeasurementService(_c8yClient);
        _eventService = new EventService(_c8yClient);
        _alarmService = new AlarmService(_c8yClient);
        return true;
    }
};

async function getManagedObjectById(id) {
    var returnValue = await _inventoryService.detail(id);
    return returnValue;
}

async function getManagedObjectByExternalId(type, externalId) {
    let identity = {
        type: type,
        externalId: externalId
    };

    var result = await _identityService.detail(identity);
    var managedObject = await _inventoryService.detail(result.data.managedObject.id)
    return managedObject;
}

async function createExternalId(deviceExternalId, deviceId) {
    let externalId = {
        type: 'c8y_Serial',
        externalId: deviceExternalId,
        managedObject: { id: deviceId }
    };

    try {
        var identity = await _identityService.create(externalId);
    } catch (error) {
        console.log(chalk.red(error.data.message));
    }

    return identity;

}

async function createDeviceAndExternalId(deviceName, deviceExternalId, typeValue) {
    let device = {
        name: deviceName,
        c8y_IsDevice: {},
        type: typeValue
    };

    var managedObject = await _inventoryService.create(device);

    let externalId = {
        type: 'c8y_Serial',
        externalId: deviceExternalId,
        managedObject: { id: managedObject.data.id }
    };

    try {
        var identity = await _identityService.create(externalId);
    } catch (error) {
        console.log(chalk.red(error.data.message));
    }

    return managedObject;
}

async function createDeviceGroup(deviceGroupName) {
    let device = {
        name: deviceName,
        c8y_IsDeviceGroup: {},
        type: 'c8y_DeviceGroup'
    };

    var managedObject = await _inventoryService.create(device);
    return managedObject;
}

async function updateManagedObjectPostion(lat, lng, deviceId) {
    let partialUpdateManagedObject = {
        id: deviceId,
        c8y_Position: {
            "lng": lng,
            "lat": lat
        }
    };

    var managedObject = await _inventoryService.update(partialUpdateManagedObject);
    return managedObject;
}

async function updateManagedObjectMarkerFragment(fragmentName, deviceId) {
    let partialUpdateManagedObjectJSON = '{"id": "' + deviceId + '" , "' + fragmentName + '": {}}';
    var managedObject = await _inventoryService.update(JSON.parse(partialUpdateManagedObjectJSON));
    return managedObject;
}

function createTemperatureMeasurement(value, unit, deviceId) {
    const currentTime = (new Date()).toJSON();

    let measurement = { c8y_TemperatureMeasurement: { T: { value: value, unit: unit } }, time: currentTime, source: { id: '' + deviceId }, type: 'c8y_TemperatureMeasurement' };
    console.log(JSON.stringify(measurement));

    _measurementService.create(measurement).catch(function (errorMessage) {
        console.log(errorMessage);
    }).then(function (data) {
        console.log(data);
    });
}

async function createMeasurement(type, series, value, unit, deviceId) {
    const currentTime = (new Date()).toJSON();

    let measurementJSON = '{"' + type + '":{"' + series + '":{"value":' + value + ', "unit":"' + unit + '"}}, "time": "' + currentTime + '", "source": { "id": "' + deviceId + '"}, "type": "' + type + '"}';
    var result = await _measurementService.create(JSON.parse(measurementJSON));
    return result;
}

async function createEvent(type, text, deviceId) {
    const currentTime = (new Date()).toJSON();
    try {
        let event = { source: { id: deviceId }, text: text, time: currentTime, type: type };
        console.log(JSON.stringify(event));
        var result = await _eventService.create(event);
    } catch (error) {
        console.log(chalk.red(error.data.message));
    }
    return result;
}


async function createAlarm(severity, type, text, deviceId) {
    const currentTime = (new Date()).toJSON();
    try {
        let alarm = { severity: severity, source: { id: deviceId }, text: text, time: currentTime, type: type };
        console.log(JSON.stringify(alarm));
        var result = await _alarmService.create(alarm);
    } catch (error) {
        console.log(chalk.red(error.data.message));
    }
    return result;
}


async function deleteDevice(deviceId) {
    var result = await _inventoryService.delete(deviceId);
    return result;
}

function getClient() {
    return _c8yClient;
}

function getInventoryService() {
    return _inventoryService;
}

function getIdentityService() {
    return _identityService;
}

function getMeasurementService() {
    return _measurementService;
}

module.exports = {
    initClient,
    getClient,
    getInventoryService,
    getIdentityService,
    getMeasurementService,
    getManagedObjectById,
    getManagedObjectByExternalId,
    createDeviceAndExternalId,
    createDeviceGroup,
    createTemperatureMeasurement,
    createMeasurement,
    updateManagedObjectPostion,
    updateManagedObjectMarkerFragment,
    deleteDevice,
    createEvent,
    createAlarm,
    createExternalId
};
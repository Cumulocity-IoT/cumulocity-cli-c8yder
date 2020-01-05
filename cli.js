#!/usr/bin/env node

'use strict';
var inquirer = require("inquirer");
var chalk = require('chalk');
var figlet = require('figlet');
var pjson = require('./package.json');
var c8y = require('./c8y');
var _managedObject;

console.log(
  chalk.blue(
    figlet.textSync(pjson.name, { horizontalLayout: 'full' }) + pjson.version
  )
);
console.log(
  chalk.blue(pjson.description)
);

/**
 * Load environment variables
 */
const result = require('dotenv').config();
if (result.error) {
  throw result.error
}
console.log(chalk.green('--- Environment loaded! ---'));

login();

function login() {
  inquirer
    .prompt([
      {
        type: 'input',
        name: 'baseUrl',
        default: process.env.C8Y_BASEURL,
        message: 'Enter Cumulocity URL you what to connect?'
      },
      {
        type: 'input',
        name: 'tenant',
        default: process.env.C8Y_TENANT,
        message: 'Enter tenant id?'
      },
      {
        type: 'input',
        name: 'user',
        default: process.env.C8Y_USER,
        message: 'Enter user name?'
      },
      {
        type: 'password',
        message: 'Enter user password?',
        name: 'password',
        mask: '*'
      }
    ])
    .then(function (answers) {
      c8y.initClient(answers).then(function (result) {
        if (result === true) {
          undefinedScope();
        } else {
          retryAction(login);
        }
      });
    });
}

function retryAction(actionFunction) {
  inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'An error occured, please try again.',
      choices: ['ok', 'cancel']
    }
  ]).then(function (answer) {
    if (answer.action == 'ok') {
      actionFunction.call();
    } else if (answer.action == 'cancel') {
      console.log("Bye Bye!");
    }
  })
}

function undefinedScope() {
  inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'Select or create managed object you want to work with:',
      choices: ['select', 'create', 'exit']
    }
  ]).then(function (answer) {
    if (answer.action == 'select') {
      console.log('Select managed object');
      selectManagedObjectBy();
    } else if (answer.action == 'create') {
      console.log('Create managed object');
      createDevice();
    } else if (answer.action == 'exit') {
      console.log("Bye Bye!");
    }
  })
};

function managedObjectScope() {
  inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'Choose action you want to do on managed object (name: ' + _managedObject.name + ', id: ' + _managedObject.id + '): ',
      choices: ['create measurement', 'create alarm', 'create event', 'create externalid', 'set location', 'set marker fragment', 'delete', 'cancel']
    }
  ]).then(function (answer) {
    if (answer.action == 'create measurement') {
      createMeasurement();
    } else if (answer.action == 'create alarm') {
      console.log('Create alaram!');
      createAlarm();
    } else if (answer.action == 'create event') {
      console.log('Create event!');
      createEvent();
    } else if (answer.action == 'create externalid') {
      console.log('Create externalid!');
      createExternalId();
    } else if (answer.action == 'set location') {
      setLocation();
    } else if (answer.action == 'set marker fragment') {
      setMarkerFragment();
    } else if (answer.action == 'delete') {
      deleteDevice();
    } else if (answer.action == 'cancel') {
      console.log('Cancel scope!');
      undefinedScope();
    }
  })
}

function selectManagedObjectBy() {
  inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'Select managed object by:',
      choices: ['id', 'externalid', 'cancel']
    }
  ]).then(function (answer) {
    if (answer.action == 'id') {
      console.log('Select managed object by id');
      selectManagedObjectById();
    } else if (answer.action == 'externalid') {
      console.log('Select managed object by external id');
      selectManagedObjectByExternalId();
    } else if (answer.action == 'cancel') {
      managedObjectScope();
    }
  })
};

function selectManagedObjectById() {
  inquirer.prompt([
    {
      type: 'input',
      name: 'id',
      message: 'Enter ID of managed object:',
    }
  ]).then(function (answer) {
    c8y.getManagedObjectById(answer.id).then(function (result) {
      _managedObject = result.data;
      managedObjectScope();
    }).catch(function (result) {
      if (result.data.message) {
        console.log(chalk.red(result.data.message));
      } else if (result.data.error) {
        console.log(chalk.red(result.data.error));
      }
      selectManagedObjectById();
    });
  })
};

function selectManagedObjectByExternalId() {
  inquirer.prompt([
    {
      type: 'input',
      name: 'type',
      message: 'Enter type of identity:',
      default: 'c8y_Serial'
    },
    {
      type: 'input',
      name: 'externalid',
      message: 'Enter external id of identity:'
    }
  ]).then(function (answer) {
    c8y.getManagedObjectByExternalId(answer.type, answer.externalid).then(function (result) {
      _managedObject = result.data;
      managedObjectScope();
    }).catch(function (result) {
      if (result.data.message) {
        console.log(chalk.red(result.data.message));
      } else if (result.data.error) {
        console.log(chalk.red(result.data.error));
      }
      selectManagedObjectByExternalId();
    });
  })
};

function createExternalId() {
  inquirer.prompt([
    {
      type: 'input',
      name: 'externalid',
      message: 'Enter external id of identity:'
    }
  ]).then(function (answer) {
    c8y.createExternalId(answer.externalid, _managedObject.id).then(function (result) {
      _managedObject = result.data;
      managedObjectScope();
    }).catch(function (result) {
      if (result.data.message) {
        console.log(chalk.red(result.data.message));
      } else if (result.data.error) {
        console.log(chalk.red(result.data.error));
      }
      managedObjectScope();
    });
  })
};

function createMeasurement() {
  inquirer.prompt([
    {
      type: 'input',
      name: 'type',
      message: 'Enter measurement type:',
      default: 'c8y_TemperatureMeasurement'
    },
    {
      type: 'input',
      name: 'series',
      message: 'Enter measurement series:',
      default: 'T'
    },
    {
      type: 'input',
      name: 'unit',
      message: 'Enter measurement unit:',
      default: 'C'
    },
    {
      type: 'input',
      name: 'value',
      message: 'Enter measurement value:',
    }
  ]).then(function (answer) {
    c8y.createMeasurement(answer.type, answer.series, answer.value, answer.unit, _managedObject.id).then(function (result) {
      console.log(chalk.green('Measurement successfuly created with id ' + result.data.id + '!'));
      managedObjectScope();
    });
  })
};

function createEvent() {
  inquirer.prompt([
    {
      type: 'input',
      name: 'type',
      message: 'Enter event type:',
      default: 'c8y_Event'
    },
    {
      type: 'input',
      name: 'text',
      message: 'Enter event text:'
    }
  ]).then(function (answer) {
    c8y.createEvent(answer.type, answer.text, _managedObject.id).then(function (result) {
      console.log(chalk.green('Event successfuly created with id ' + result.data.id + '!'));
      managedObjectScope();
    });
  })
};

function createAlarm() {
  inquirer.prompt([
    {
      type: 'input',
      name: 'type',
      message: 'Enter alarm type:',
      default: 'c8y_Event'
    },
    {
      type: 'input',
      name: 'text',
      message: 'Enter alarm text:'
    },
    {
      type: 'list',
      name: 'severity',
      message: 'Select alarm severity:',
      choices: ['CRITICAL', 'MAJOR', 'MINOR', 'WARNING']
    }
  ]).then(function (answer) {
    c8y.createAlarm(answer.severity, answer.type, answer.text, _managedObject.id).then(function (result) {
      console.log(chalk.green('Alarm successfuly created with id ' + result.data.id + '!'));
      managedObjectScope();
    });
  })
};

function setLocation() {
  inquirer.prompt([
    {
      type: 'number',
      name: 'lat',
      message: 'Enter latitude:',
      default: 51.325648
    },
    {
      type: 'number',
      name: 'lng',
      message: 'Enter longtitude:',
      default: 12.338309
    }
  ]).then(function (answer) {
    c8y.updateManagedObjectPostion(answer.lat, answer.lng, _managedObject.id).then(function (result) {
      console.log(chalk.green('Devie position updated with id ' + result.data.id + '!'));
      managedObjectScope();
    });
  })
};

function setMarkerFragment() {
  inquirer.prompt([
    {
      type: 'input',
      name: 'fragmentName',
      message: 'Enter fragment name:',
      default: 'c8y_IsDevice'
    }
  ]).then(function (answer) {
    c8y.updateManagedObjectMarkerFragment(answer.fragmentName, _managedObject.id).then(function (result) {
      console.log(chalk.green('Marker fragment added to devie with id ' + result.data.id + '!'));
      managedObjectScope();
    }).catch(function (result) {
      if (result.date == undefined) {
        console.log(result);
      } else if (result.data.message) {
        console.log(chalk.red(result.data.message));
      } else if (result.data.error) {
        console.log(chalk.red(result.data.error));
      }
      selectManagedObjectById();
    });
  })
};

function createDevice() {
  inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Enter device name:',
      default: 'C8yder Device'
    },
    {
      type: 'input',
      name: 'externalid',
      message: 'Enter device external ID:',
      default: 'C8yderDevice123'
    },
    {
      type: 'input',
      name: 'type',
      message: 'Enter device type:',
      default: 'c8yder_Device'
    }
  ]).then(function (answer) {
    c8y.createDeviceAndExternalId(answer.name, answer.externalid, answer.type).then(function (result) {
      console.log(chalk.green('Device successfuly created with id ' + result.data.id + '!'));
      _managedObject = result.data;
      managedObjectScope();
    });
  })
};

function deleteDevice() {
  inquirer.prompt([
    {
      type: 'confirm',
      name: 'delete',
      message: 'Do you want to delete device?'
    }
  ]).then(function (answer) {
    if (answer.delete == true) {
      c8y.deleteDevice(_managedObject.id);
      undefinedScope();
    }
    managedObjectScope();
  });
}
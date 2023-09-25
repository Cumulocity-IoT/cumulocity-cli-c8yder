# !!! Archived -- this repository is currently not actively maintained!

## C8yder a cli for Cumulocity

C8yder (pronounced "cider") is a interactive command line interface for Cumulocity. It is written in Node.js using inquirer and c8y/client library. It provides functions for Inventory, Measurement, Events etc.. It is usefull for setting up an asset structure, sending some measurements, events to the platform an much more. The promps use standard and best practice models and the user has only to define relevant information. In most cases default values can be select in order to work faster.

So let us dring a C8yder... ;)

## Setup

```console
npm install
```

if you want to run the cli with command "c8yder" you have to:

```console
npm install -g
```

On global install (-g) npm will create OS scripts (c8yder and c8yder.cmd) on Windows and symlinks in /usr/bin on Linux. 

## Getting started

### Start c8yder

```console
c8yder> node cli.js
```

or

```console
c8yder> c8yder
```

### Login

The first step is to login to your Cumulocity. For connecting to Cumulocity you have to prompt URL, tenant ID, user and password. You also can set default values into .env which means you don't have to prompt ULR, tenant ID and user again and again. Password can't be set as default due to security reasons.

```console
          ___                _               
   ___   ( _ )   _   _    __| |   ___   _ __ 
  / __|  / _ \  | | | |  / _` |  / _ \ | '__|
 | (__  | (_) | | |_| | | (_| | |  __/ | |   
  \___|  \___/   \__, |  \__,_|  \___| |_|   
                 |___/                       0.2.0
Command line interface for Cumulocity 
--- Environment loaded! ---
? Enter Cumulocity URL you what to connect? https://<your_tenant>.com
? Enter tenant id? <your_tenant>
? Enter user name? <your_user>
? Enter user password? <your_password>
```

### Select or create device

Next you can create or select a device. Follow the console instructions.

```console
Connected to C8y, Version: 1005.1.0 successfully!
? Select or create managed object you want to work with: (Use arrow keys)
> select
  create
  exit
```

### Work with device

After creating or selecting a device you are in a device scope. All actions you execute will be done on this device.

```console
? Choose action you want to do on managed object (name: Device XY, id: 6390830):  (Use arrow keys)
> create measurement
  create alarm
  create event
  create externalid
  set location
  set marker fragment
  delete
(Move up and down to reveal more choices)
```
For Example "create measurement":

```console
? Choose action you want to do on managed object (name: 2.01 Comfort 1, id: 6390830):  create measurement
? Enter measurement type: c8y_TemperatureMeasurement
? Enter measurement series: T
? Enter measurement unit: C
? Enter measurement value: 23.5
```

## Authors 

[Alexander Pester](mailto:alexander.pester@softwareag.com)

## Disclaimer

These tools are provided as-is and without warranty or support. They do not constitute part of the Software AG product suite. Users are free to use, fork and modify them, subject to the license agreement. While Software AG welcomes contributions, we cannot guarantee to include every contribution in the master project.

## Contact

For more information you can Ask a Question in the [TECHcommunity Forums](https://tech.forums.softwareag.com/tags/c/forum/1/Cumulocity-IoT).

You can find additional information in the [Software AG TECHcommunity](https://tech.forums.softwareag.com/tag/Cumulocity-IoT).

_________________
Contact us at [TECHcommunity](mailto:technologycommunity@softwareag.com?subject=Github/SoftwareAG) if you have any questions.

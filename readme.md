## About The Project
creator-api is a reworked lightweight version of https://github.com/fbslo/creator for providing an API for HIVE account creation.

It works as an out-of-the-box solution for HIVE stakeholders, who like to provide a 3rd party access to their HIVE account creation tickets without the need to exposing any key.

## Installation
- Fork the repository
````
git clone https://github.com/christianfuerst/creator-api
````

- Install frontend dependencies
````
cd hiveonboard
npm install
````

## Configuration
- Create a new file ``config.json`` from the template file in the same folder

````
{
  "account": "INSERT-HIVE-ACCOUNT",
  "key": "INSERT-HIVE-ACTIVE-KEY",
  "httpPort": 8880,
  "rpc": [
    "https://api.hive.blog",
    "https://api.hivekings.com",
    "https://anyx.io",
    "https://api.openhive.network"
  ],
  "rcThreshold": 20,
  "autoClaimDelaySeconds": 60,
  "auth": [{ "key": "API-KEY", "label": "LABEL-FOR-AUTHORIZED-ENTITY" }]
}
````

For production it's highly recommended to use a reverse proxy like Nginx and proxy the selected http port to a secure https connection.

## Run
````
node server.js
````

## Dependencies

- [@hivechain/dhive](https://ghub.io/@hivechain/dhive): Hive blockchain RPC client library
- [body-parser](https://ghub.io/body-parser): Node.js body parsing middleware
- [cors](https://ghub.io/cors): Node.js CORS middleware
- [express](https://ghub.io/express): Fast, unopinionated, minimalist web framework
- [lodash](https://ghub.io/lodash): Lodash modular utilities.
- [signale](https://ghub.io/signale): 👋 Hackable console logger
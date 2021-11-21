[![codecov](https://codecov.io/gh/casperholders/casperholdersapi/branch/main/graph/badge.svg?token=RUYCG6X9RR)](https://codecov.io/gh/casperholders/casperholdersapi)

# CasperHolders API

Simple api to generate prometheus metrics from casper holders operations

## Commands of the package.json

### Start the api with the .env file
```bash
yarn start
```
### Start the api with the .env.testnet file
```bash
yarn testnet
```
### Start the api with the .env.mainnet file
```bash
yarn mainnet
```
### Update the swagger.json file
```bash
yarn generateSwagger
```
### Run the tests
```bash
yarn test
```

## Technical information

The different .env file are here only for example. When you run the project locally it will use the .env file and send /
receive metrics from/to the testnet live website. [Link](https://testnet.casperholders.io)

This allow to do some local testing and replicate the full behavior in production.

## Api endpoints

Find the full swagger by launching the api.  
Available at http://localhost:3000/api-docs  
**If your env variables contains NODE_ENV=production the swagger won't be exposed !**

| Endpoint    | /metrics                                        |
|-------------|-------------------------------------------------|
| Description | Default endpoint that expose prometheus metrics. <br> This is a technical endpoint for prometheus. <br> The only use of this endpoint is to be scrapped by prometheus. <br> **Don't use this as a source of truth !**|

| Endpoint    | /deploy/result/{deployHash}                                        |
|-------------|-------------------------------------------------|
| Description | Send a deploy hash to be parsed and added to the casper holders metrics |

| Endpoint    | /operations/metrics                                       |
|-------------|-------------------------------------------------|
| Description | Retrieve prometheus metrics to be used in the casper holders website |

| Endpoint    | /api-docs                                       |
|-------------|-------------------------------------------------|
| Description | Swagger ui to test easily the api |

## Env File explanation

```
CASPER_RPC_URL=[Full url to node RPC endpoint. Should include :7777/rpc]
ORIGIN=[List of url separated by comma to allow in the CORS Header]
OVERRIDE_API_ENDPOINTS=[Override the behavior of the api to use the url bellow instead]
OVERRIDE_API_URL=[Url of an instance of the current api]
PROMETHEUS_API=[Full url to a prometheus v1 api endpoint]
DATA_API=[Url of an instance of postgrest in front of your database constructed by the CasperData software. This is optionnal, the software will fallback to a manual discovery instead]
NODE_ENV=production // Optionnal, will disable the swagger in production
NETWORK=[Chain network name. Testnet ex : casper-test]
ACCOUNT_INFO_HASH=[Account info smart contract hash. Testnet ex : 2f36a35edcbaabe17aba805e3fae42699a2bb80c2e0c15189756fdc4895356f8]
```

## Run locally

```bash
yarn install
yarn start
```

## Docker build

```bash
docker build . 
```

## Kubernetes deployment

### Warning: The current kubernetes files are specific to my kubenertes architecture. It's basically an example how to use CasperHolders API on Kubernetes.

```bash
kubectl apply -f kubernetes/(testnet|mainnet)/
```

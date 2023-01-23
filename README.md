[![codecov](https://codecov.io/gh/casperholders/casperholdersapi/branch/main/graph/badge.svg?token=RUYCG6X9RR)](https://codecov.io/gh/casperholders/casperholdersapi)
[![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=casperholders_casperholdersapi&metric=ncloc)](https://sonarcloud.io/summary/new_code?id=casperholders_casperholdersapi)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=casperholders_casperholdersapi&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=casperholders_casperholdersapi)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=casperholders_casperholdersapi&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=casperholders_casperholdersapi)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=casperholders_casperholdersapi&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=casperholders_casperholdersapi)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=casperholders_casperholdersapi&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=casperholders_casperholdersapi)

# CasperHolders API

Simple api to get the current APY / Validators info & metadata (from the account info standard) / manage multi-sig deploys.

## Api endpoints

Find the full swagger by launching the api.  
The api is available on port :3000 by default.
The api doc is available at http://localhost:3001/api-docs by default.

| Endpoint    | /apy/current                           |
|-------------|----------------------------------------|
| Method      | GET                                    |
| Description | Return the current APY on the network. |

| Endpoint    | /validators/accountinfos                                                              |
|-------------|---------------------------------------------------------------------------------------|
| Method      | GET                                                                                   |
| Description | Return an array of validator enhanced with data from the account infos smart contract |

| Endpoint    | /deploys/:hash                      |
|-------------|-------------------------------------|
| Method      | GET                                 |
| Description | Return a previously inserted deploy |

| Endpoint    | /deploys/                                                                                                       |
|-------------|-----------------------------------------------------------------------------------------------------------------|
| Method      | POST                                                                                                            |
| Description | Insert a deploy in the database                                                                                 |
| Body        | Can be obtained by using the DeployUtil.deployToJson method from the casper js sdk. <br/>```{ deploy: {...}}``` |

| Endpoint    | /validators/accountinfos                                                              |
|-------------|---------------------------------------------------------------------------------------|
| Method      | GET                                                                                   |
| Description | Return an array of validator enhanced with data from the account infos smart contract |

## Admin endpoints

The api docs and the bull dashboard are exposed on a different port than the api, by default 3001.  
Allowing you to choose to expose it or not with network rules.

| Endpoint    | /api-docs                         |
|-------------|-----------------------------------|
| Method      | GET                               |
| Description | Swagger ui to test easily the api |


| Endpoint    | /admin/queues                                                       |
|-------------|---------------------------------------------------------------------|
| Method      | GET                                                                 |
| Description | Bull dashboard. Used to manage the queues & job of the application. |

## Env File explanation

```
CASPER_RPC_URL=[Full url to node RPC endpoint. Should include :7777/rpc]
ORIGIN=[List of url separated by comma to allow in the CORS Header]
DATA_API=[Url of an instance of postgrest in front of your database constructed by the CasperData software. This is optionnal, the software will fallback to a manual discovery instead]
NODE_ENV=production // Optionnal, will disable the swagger in production
NETWORK=[Chain network name. Testnet ex : casper-test]
ACCOUNT_INFO_HASH=[Account info smart contract hash. Testnet ex : 2f36a35edcbaabe17aba805e3fae42699a2bb80c2e0c15189756fdc4895356f8]
REDIS_HOST=[Redis hostname. Used for bull queues]
REDIS_PORT=[Redis port]
DASHBOARD_PORT=[Bull dashboard & api docs port]
PORT=[API port]
DISABLE_REDIS=[Optionnal, if set to true will disable bull / bull dashboard and the queue + job that clean the database periodically]
```

## Technical information & Database/Redis config

The software works with a postgresql database and Redis. The tests are run with a sqllite in memory database.

We recommend you to use a postgresql database with this software. We won't officially support other types of databases.

Exemple to run a local postgres db :

```bash
sudo docker run --name some-postgres -p 127.0.0.1:5432:5432 -e POSTGRES_PASSWORD=mysecretpassword -e POSTGRES_DB=api -d postgres
```

The different .env file are here only for example. When you run the project locally it will use the .env file and the
database config file located at `config/config.json`.

View the documentation for sequelize config
file [here](https://sequelize.org/master/manual/migrations.html#configuration).

If the file is not present the software will try to use the environnement variables to connect to the database with the
default env key : `DATABASE_URL`.

When you launch the software it will run all migrations automatically.

Exemple to run a local redis instance :

```bash
sudo docker run --name redis -p 127.0.0.1:6379:6379 -d redis
```

Redis is used to clean the database every hour with a Bull queue & job.
This is optional, you can disable this behavior by setting this env variable : `DISABLE_REDIS=true`

## Run locally

### Prerequisites

- Docker or local postgres instance and an optional redis instance too.
- Node LTS
- yarn

```bash
yarn install
sudo docker run --name some-postgres -p 127.0.0.1:5432:5432 -e POSTGRES_PASSWORD=mysecretpassword -e POSTGRES_DB=api -d postgres
sudo docker run --name redis -p 127.0.0.1:6379:6379 -d redis
```

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

## Docker build

```bash
docker build . 
```

## Kubernetes deployment

### Warning: The current kubernetes files are specific to my kubenertes architecture. It's basically an example how to use CasperHolders API on Kubernetes.

```bash
kubectl apply -f kubernetes/(testnet|mainnet)/
```

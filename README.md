# CasperHolders API

Simple api to generate prometheus metrics from casper holders operations

## Technical information

The different .env file are here only for example. When you run the project locally it will use the .env file and send / receive metrics from/to the testnet live website. [Link](https://testnet.casperholders.io)

This allow to do some local testing and replicate the full behavior in production.

## Run locally

```
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
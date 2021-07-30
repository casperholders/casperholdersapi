# CasperHolders API

Simple api to generate prometheus metrics from casper holders operations

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
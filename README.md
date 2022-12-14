# Taco Shop

| Scaffold Details   |                               |
|--------------------|-------------------------------|
| Complexity         | Beginner                      |
| Automated Tests    | Yes                           |
| Installed Plugins  | LIGO, Taquito, Flextesa, Jest |
| Frontend Dapp      | Yes                           |
| Wallet Integration | Yes                           |

## Quickstart

In a rush? You can follow the steps below to get up and running immediatley:

1. `taq scaffold https://github.com/ecadlabs/taqueria-scaffold-taco-shop taco-shop`
1. `cd taco-shop`
1. `npm run setup`
1. `npm run start:app`

## Overview

This scaffold implements a simple full stack Tezos project. It has a React dApp that interacts with a smart contract which stores the number of available_tacos and provides a function to buy tacos

The React dApp uses Beacon Wallet to interact with Tezos wallets in the browser and once connected, will display the number of `available_tacos` stored on-chain in the smart contract. There is also a basic interface which allows the user to buy tacos by sending a transaction to the smart contract with the `number_of_tacos_to_buy` as a parameter

The smart contract has been deployed to ghostnet at the address for demonstration purposes: `KT1KBBk3PXkKmGZn3K6FkktqyPRpEbzJoEPE`

The project comes pre-configured with the following:

- Plugins: LIGO, Flextesa, Taquito, Jest
- A LIGO multi-file smart contract: `hello-tacos.mligo`, `_buy.mligo`, `_make.mligo`, `_schema.mligo`
- A network configuration for the Ithaca testnet
- An environment named `ghostnet` with faucet to fund operations on the testnet
- Native Taqueria testing (Taqueria Jest plugin)

***Coming soon***

- Passing the deployed contract address to the React dApp via the State API
- Deploying the contract using Taqueria operations
- Targeting a specific network for contract deployment and testing (sandboxes and testnets)
- Deploying the contract to mainnet

## Requirements

- Taqueria v0.16.0 or later
- Docker v0.9 or later
- Node.js v16 or later
- Beacon or Kukai Wallet
- A funded testnet account
- A [faucet file](https://teztnets.xyz)

## Using the Project

The intended workflow for this project is as follows:

1. Compile the LIGO mulit-file source code
2. Originate the smart contract to the testnet
3. Insert the returned contract address into the React dApp
4. Build and start the React dApp
5. Connect to Temple wallet
6. Buy tacos!

## Project Overview

### Scaffold the Project

This project is available as a Taqueria scaffold. To create a new project from this scaffold, run the following command:

```shell
taq scaffold https://github.com/ecadlabs/taqueria-scaffold-taco-shop taco-shop
```

This will clone the Taco Shop scaffold project into a directory called `taco-shop`

### Project Setup

To work on the project you need to get into the project directory:

```shell
cd hello-tacos
```

### Project Structure

- `/.taq` - This hidden folder stores the Taqueria configuration and state
- `/app` - This is the React dApp 
- `/contracts` - This folder contains the LIGO smart contracts
- `/tests` - This folder contains the automated tests
- `/artifacts` - This folder contains the compiled Michelson `.tz` contracts

### Smart Contract

The smart contract `hello-tacos.mligo` is simple and straightforward. It stores the number of `available_tacos` in the contract storage, and provides an entrypoint that accepts a `tacos_to_buy` parameter which will decrease the number of available_tacos by the number of tacos_to_buy

It consists of next files:
1. `hello-tacos.mligo` itself:
```js
#include "_buy.mligo"
#include "_make.mligo"

let main ((action, store) : (parameter * storage)) =
    match action with
    | Buy qty -> buy(qty, store)
    | Make qty -> make(qty, store)
```

2. `_buy.mligo`
```js
#include "_schema.mligo"

let buy ((tacos_to_buy, store) : (taco_quantity * storage)) =
    if tacos_to_buy > store.available_tacos
    then (failwith "NOT_ENOUGH_TACOS": operation list * storage)
    else (([], {store with available_tacos = abs(store.available_tacos - tacos_to_buy)}) :
        operation list * storage)
```

3. `_make.mligo`
```js
#include "_schema.mligo"

let make ((tacos_to_make, store) : (taco_quantity * storage)) =
    if not (Tezos.get_sender () = store.admin)
    then (failwith "NOT_ALLOWED": operation list * storage)
    else (([], {store with available_tacos = store.available_tacos + tacos_to_make}) : 
        (operation list * storage))
```

4. `_schema.mligo`
```js
type taco_quantity = nat
type admin = address

type storage = {
    available_tacos: taco_quantity;
    admin: admin
}

type parameter =
| Buy of taco_quantity
| Make of taco_quantity
```

5. `hello-tacos.storages.mligo`
```js
#include "hello-tacos.mligo"
// All storage values must be in this file

// Define a storage variable
let storage: storage = {
    available_tacos = 42n;
    admin = ("tz1ge3zb6kC5iUZcXsjxiwwtU5MwP37T6m1z" : address)
}
```

### Testing

Tests are located in `tests` folder.

> Before running test please run local sandbox by running `taq start sandbox local` or update tests to run against testnet/mainnet 

To run tests just type `taq test`

### React Dapp

The React dApp retrieves the number of available tacos from the smart contract and displays the value. It provides an interface for the user to buy tacos and looks like this:

![Hello Tacos Screenshot](hello-tacos-screenshot.png)

> In order for the React dApp to connect to the smart contract, the contract must be deployed to the testnet and the returned address of the contract must be added to the `/app/index.tsx` file. The scaffold comes pre-configured with the address of the deployed contract for demonstration purposes but it is recommended that you add your own faucet file, then re-deploy the contract and update the references to it in the project for your own use

> This will be fixed in the future when contract addresses will be passed via the State API dynamically


### Compile the Contract

```shell
taq compile hello-tacos.mligo
```

This will compile multi-file contract `hello-tacos.mligo` to a file, `/artifacts/hello-tacos.tz`

### Originate to the Testnet

Run the following command to originate the contract to the ghostnet environment:

```shell
taq originate -e testing
```

This should return the address of the contract on the testnet which looks like this:

```shell
?????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
??? Contract       ??? Address                              ??? Alias          ??? Destination    ???
?????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
??? hello-tacos.tz ??? KT1KBBk3PXkKmGZn3K6FkktqyPRpEbzJoEPE ??? hello-tacos    ??? ghostnet       ???
?????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
```

> This scaffold comes with a pre-configured faucet file for the testnet which is shared by all users and can cause issues. It is recommended that you replace the faucet file in the project's `config.json` file with your own which you can get from the [Teztnets Faucet](https://teztnets.xyz/). Further information about network configuration can be found [here](/docs/getting-started/networks)
:::


### Build and Start the React Dapp

Now that the contract has been deployed and the address added to the dApp, you can build and start the React dApp

Change into the `/app` directory:

```shell
cd app
```

Build the React dApp:

```shell
npm run build
```

Start and serve the dApp:

```shell 
npm run start
```

### Hot Reload Contract Address 

By default, page refresh updates the page UI to point to the address of the new deployment.

### Insert the Contract Address (Optional)

There is a way to point dApp to a hardcoded contract.
To do so you need to insert the address of the contract into the `/app/App.tsx` file. Copy the address returned from the command above and paste it into the `contractAddress` variable in the `/app/index.tsx` file as shown here:

```ts /app/src/app.tsx
function app() {
  const [rpcUrl, setRpcUrl] = useState("https://ghostnet.ecadinfra.com");
  const [contractAddress, setContractAddress] = useState(
      "KT1CPASSW7rstFQw6vENBkXmG6mJNsDMauTP"
      // getAliasAddress(config, "hello-tacos")
  );
  const [contractStorage, setContractStorage] = useState<number | undefined>(
    undefined
  );
  const [Tezos, setTezos] = useState<TezosToolkit>();
  const [connected, setConnected] = useState(false);
```

You should now be able to access the Taco Shop dApp at [http://localhost:3000](http://localhost:3000/)

### Connect to Temple Wallet

Open a browser and navigate to [http://localhost:3000](http://localhost:3000/)

You should see the number of `available_tacos` displayed

Click on the `Connect wallet` button in the top right corner of the page and select `Temple Wallet`

Provide your credentials for the wallet, select a funded account, and click `connect`

### Buy Tacos

With your wallet connected, you can now interact with the contract entrypoint

Click the `order` button and then authorize the transaction in Temple Wallet

Once completed, you will see the value of `available_tacos` decrease by the number of tacos you ordered

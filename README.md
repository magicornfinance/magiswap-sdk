# unicorn Core SDK of #Magicorn ecosystems.

## Getting Started

### Running tests

To run the tests, follow these steps. You must have at least node v16 installed.

First clone the repository:

```sh
git clone https://github.com/magicornfinance/magiswap-sdk.git
```

Move into the dxswap-sdk working directory

```sh
cd magicorn-sdk
```

Install dependencies

```sh
npm install
```

Run tests

```sh
npm run test
```

## Multi-Eco Router Trades

magicorn uses multiple trades to find best protocol and route for traders. Currently supported DEXs are

| Protocol     | Ethereum | Arbitrum One | Gnosis Chain | Polygon |
| ------------ | -------- | ------------ | ------------ | ------- |
| magicorn     | ✅       | ✅           | ✅           |         |
| Uniswap v2   | ✅       | ✅           | ✅           |         |
| SushiSwap    | ✅       | ✅           | ✅           | ✅     |
| Pancakeswap  | WIP      | WIP           | WIP          |         |
| CoW Protocol | ✅       |              | ✅           |         |
| Apeswap      |          |              |               |         |
| Pangolin     |          |              |               |         |

The `Trade` class is extendable. New DEXs can be added to the SDK by extending the `Trade` and adding required methods.

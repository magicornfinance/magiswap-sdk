// ABIs

import { ContractInterface } from '@ethersproject/contracts'

import { poolMethods } from './common'

// 3pool ABI which has USDC, USDT and WXDAI
export const CURVE_3POOL_ABI: ContractInterface = [
  poolMethods['view']['fee'],
  poolMethods['view']['get_dy(int128,int128,uint256)'],
  poolMethods['nonpayable']['exchange(int128,int128,uint256,uint256)'],
  poolMethods['nonpayable']['exchange_underlying(uint256,uint256,uint256,uint256,address)'],
]

// 3pool ABI which has USDC, USDT and WXDAI
export const CURVE_3POOL_UNDERLYING_ABI: ContractInterface = [
  poolMethods['view']['fee'],
  poolMethods['view']['get_dy(int128,int128,uint256)'],
  poolMethods['nonpayable']['exchange(int128,int128,uint256,uint256)'],
  poolMethods['nonpayable']['exchange_underlying(int128,int128,uint256,uint256)'],
]

// 3pool ABI which has USDC, USDT and WXDAI
export const CURVE_EURSPOOL_ABI: ContractInterface = [
  poolMethods['view']['fee'],
  poolMethods['view']['get_dy(uint256,uint256,uint256)'],
  poolMethods['nonpayable']['exchange(int128,int128,uint256,uint256)'],
]

export const CURVE_CRYPTO_SWAP_ABI = [
  poolMethods['view']['fee'],
  poolMethods['view']['get_dy_underlying(uint256,uint256,uint256)'],
  poolMethods['nonpayable']['exchange_underlying(uint256,uint256,uint256,uint256)'],
  poolMethods['nonpayable']['exchange_underlying(uint256,uint256,uint256,uint256,address)'],
]

export const CURVE_WETH_ERC20_POOL_ABI: ContractInterface = [
  poolMethods['view']['fee'],
  poolMethods['view']['get_dy(uint256,uint256,uint256)'],
  poolMethods['payable']['exchange(uint256,uint256,uint256,uint256)'],
  poolMethods['payable']['exchange(uint256,uint256,uint256,uint256,bool)'],
  poolMethods['payable']['exchange(uint256,uint256,uint256,uint256,bool,address)'],
  poolMethods['payable']['exchange_underlying(uint256,uint256,uint256,uint256)'],
  poolMethods['payable']['exchange_underlying(uint256,uint256,uint256,uint256,address)'],
]

export const CURVE_ETHXERC20_ABI: ContractInterface = [
  poolMethods['view']['fee'],
  poolMethods['view']['get_dy(int128,int128,uint256)'],
  poolMethods['payable']['exchange(int128,int128,uint256,uint256)'],
]

export const CURVE_ETHXERC20_256_ABI: ContractInterface = [
  poolMethods['view']['fee'],
  poolMethods['view']['get_dy(uint256,uint256,uint256)'],
  poolMethods['payable']['exchange(uint256,uint256,uint256,uint256)'],
  poolMethods['payable']['exchange(uint256,uint256,uint256,uint256,bool)'],
  poolMethods['payable']['exchange_underlying(uint256,uint256,uint256,uint256)'],
]

/**
 * A custom contract to trade on the Curve between xDAI (native token on Gnosis Chain) and USDT and USDC
 */
export const CURVE_DAI_EXCHANGE_ABI: ContractInterface = [
  {
    inputs: [],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [],
    name: 'AlreadyInitialized',
    type: 'error',
  },
  {
    inputs: [],
    name: 'FailedToTransferFromWXDAI',
    type: 'error',
  },
  {
    inputs: [],
    name: 'Initialization',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NotWXDAIContract',
    type: 'error',
  },
  {
    inputs: [],
    name: 'Transfer',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [],
    name: 'Initialized',
    type: 'event',
  },
  {
    inputs: [],
    name: 'USDC',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'USDT',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'WXDAI',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_tokenIn',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_amountIn',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_minimumAmountOut',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: '_receiver',
        type: 'address',
      },
    ],
    name: 'exchangeExactERC20ForNativeToken',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_tokenOut',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_minimumAmountOut',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: '_receiver',
        type: 'address',
      },
    ],
    name: 'exchangeExactNativeTokenForERC20',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_tokenIn',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_tokenOut',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_amountIn',
        type: 'uint256',
      },
    ],
    name: 'getEstimatedAmountOut',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getFee',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'int128',
        name: '',
        type: 'int128',
      },
    ],
    name: 'getTokenAddress',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'getTokenIndex',
    outputs: [
      {
        internalType: 'int128',
        name: '',
        type: 'int128',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'initialize',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'initialized',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'pool3crv',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    stateMutability: 'payable',
    type: 'receive',
  },
]

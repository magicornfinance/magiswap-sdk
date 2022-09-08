import { AddressZero } from '@ethersproject/constants'
import {
  arbitrumGoerliTestnet as coreArbitrumGoerliTestnet,
  arbitrumOne as coreArbitrumOne,
  arbitrumRinkebyTestnet as coreArbitrumRinkebyTestnet,
  goerli as coreGoerli,
  mainnet as coreMainnet,
  rinkeby as coreRinkeby,
  xdai as coreXDai,
} from '@magicorn/core/.contracts.json'
import {
  arbitrumGoerliTestnet as peripheryArbitrumGoerliTestnet,
  arbitrumOne as peripheryArbitrumOne,
  arbitrumRinkebyTestnet as peripheryArbitrumRinkebyTestnet,
  goerli as peripheryGoerli,
  mainnet as peripheryMainnet,
  rinkeby as peripheryRinkeby,
  xdai as peripheryXDai,
} from '@magicorn/periphery/.contracts.json'

import { ChainId } from './chains'

const emptyAddressList: Record<ChainId, string> = {
  [ChainId.MAINNET]: AddressZero,
  [ChainId.BSC]: AddressZero,
  [ChainId.POLYGON]: AddressZero,
  [ChainId.AVAX]: AddressZero,

}

/**
 * List of the Swapr Factory contract address for each chain
 */
export const FACTORY_ADDRESS: Record<ChainId, string> = {
  ...emptyAddressList,
  [ChainId.MAINNET]: coreMainnet.factory,
  [ChainId.BSC]: coreBsc.factory,
  [ChainId.POLYGON]: corePolygon.factory,
  [ChainId.AVAX]: coreAvax.factory,
}

/**
 * List of the Swapr Router contract address for each chain
 */
export const ROUTER_ADDRESS: Record<ChainId, string> = {
  ...emptyAddressList,
  [ChainId.BSC]: peripheryBSC.router,
  [ChainId.MAINNET]: peripheryMainnet.router,
  [ChainId.POLYGON]: peripheryPOLYGON.router,
  [ChainId.AVAX]: peripheryAvax.router,
}

/**
 * List of the Swapr Staking Factory contract address for each chain
 */
export const STAKING_REWARDS_FACTORY_ADDRESS: Record<ChainId, string> = {
  ...emptyAddressList,
  [ChainId.MAINNET]: '0x156F0568a6cE827e5d39F6768A5D24B694e1EA7b',
  [ChainId.RINKEBY]: '0x0f9E49d473B813abe33F1BAB11fa9E16eE850EBa',
  [ChainId.XDAI]: '0xa039793Af0bb060c597362E8155a0327d9b8BEE8',
  [ChainId.ARBITRUM_ONE]: '0xecA7F78d59D16812948849663b26FE10E320f80C',
  [ChainId.ARBITRUM_RINKEBY]: '0x41e657cAdE74f45b7E2F0F4a5AeE0239f2fB4E1F',
  [ChainId.ARBITRUM_GOERLI]: '0x95Bf186929194099899139Ff79998cC147290F28',
}

/**
 * List of the Swapr Staking Factory contract address for each chain
 */
export const SWPR_CLAIMER_ADDRESS: Record<ChainId, string> = {
  ...emptyAddressList,
  [ChainId.RINKEBY]: '0x6D525E4115d339aD4e336bCF4C85A1Fb8f4a594C',
  [ChainId.ARBITRUM_RINKEBY]: '0x99583f330814E04de96C0288FBF82B5E35A009dc',
  [ChainId.ARBITRUM_ONE]: '0xe54942077Df7b8EEf8D4e6bCe2f7B58B0082b0cd',
}

/**
 * The Swapr Converter contract address, available on Arbritrum One
 */
export const SWPR_CONVERTER_ADDRESS: Record<ChainId, string> = {
  ...emptyAddressList,
  [ChainId.ARBITRUM_ONE]: '0x2b058af96175A847Bf3E5457B3A702F807daDdFd',
}

/**
 * Multicall2 contract address
 */
export const MULTICALL2_ADDRESS: Record<ChainId, string> = {
  [ChainId.MAINNET]: '0x5ba1e12693dc8f9c48aad8770482f4739beed696',
  [ChainId.RINKEBY]: '0x5ba1e12693dc8f9c48aad8770482f4739beed696',
  [ChainId.ARBITRUM_ONE]: '0x80c7dd17b01855a6d2347444a0fcc36136a314de',
  [ChainId.XDAI]: '0xFAa296891cA6CECAF2D86eF5F7590316d0A17dA0',
  [ChainId.ARBITRUM_RINKEBY]: '0x309e61A4c36a4a9f131f8844eA521F6384B6C9E3',
  [ChainId.ARBITRUM_GOERLI]: '0xBbB06b25484AB9E23FEe8Ee321Af8e253ea7A76a',
  [ChainId.POLYGON]: '0x275617327c958bD06b5D6b871E7f491D76113dd8',
  [ChainId.GOERLI]: '0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696',
  [ChainId.OPTIMISM_MAINNET]: '0xca11bde05977b3631167028862be2a173976ca11',
  [ChainId.OPTIMISM_GOERLI]: '0xca11bde05977b3631167028862be2a173976ca11',
}

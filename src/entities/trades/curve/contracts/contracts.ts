import { AddressZero } from '@ethersproject/constants'
import { Contract } from '@ethersproject/contracts'

import { ChainId } from '../../../../constants'
import { getProvider } from '../../utils'
// ABIs: trimmed for bundle size
import {
  ADDRESS_PROVIDER as ADDRESS_PROVIDER_ABI,
  CURVE_DAI_EXCHANGE_ABI,
  CURVE_ROUTER as CURVE_ROUTER_ABI,
  REGISTRY_EXCHANGE as REGISTRY_EXCHANGE_ABI,
} from '../abi'
import { TOKENS_MAINNET } from '../tokens'
import {
  GetBestPoolAndOutputParams,
  GetBestPoolAndOutputResult,
  GetExchangeRoutingInfoParams,
  GetExchangeRoutingInfoResults,
} from './types'

// Constants
export const MAINNET_CONTRACTS = {
  addressProvider: '0x0000000022d53366457f9d5e68ec105046fc4383',
  router: '0xfA9a30350048B2BF66865ee20363067c66f67e58',
} as const

/**
 * Returns the best pool to route a trade through using Curve Registry Exchange contract.
 * The contract is only available on Mainnet.
 * @returns the best pool to route the trade through and expected receive amount
 */
export async function getBestCurvePoolAndOutput({
  amountIn,
  tokenInAddress,
  tokenOutAddress,
  chainId,
}: GetBestPoolAndOutputParams): Promise<GetBestPoolAndOutputResult | undefined> {
  if (chainId !== ChainId.MAINNET) {
    throw new Error('Best Pool Find is only available on Mainnet')
  }

  const addressProviderContract = new Contract(
    MAINNET_CONTRACTS.addressProvider,
    ADDRESS_PROVIDER_ABI,
    getProvider(chainId)
  )

  // Curve V2 pools
  const tricryptoCoins = [
    TOKENS_MAINNET.usdt.address.toLowerCase(),
    TOKENS_MAINNET.wbtc.address.toLowerCase(),
    TOKENS_MAINNET.weth.address.toLowerCase(),
  ]

  if (tricryptoCoins.includes(tokenInAddress.toLowerCase()) && tricryptoCoins.includes(tokenOutAddress.toLowerCase())) {
    throw new Error("This pair can't be exchanged")
  }

  const registryExchangeAddress = await addressProviderContract.get_address(2, {
    gasLimit: 100000, // due to Berlin upgrade. See https://github.com/ethers-io/ethers.js/issues/1474
  })

  const registryExchangeContract = new Contract(registryExchangeAddress, REGISTRY_EXCHANGE_ABI, getProvider(chainId))
  const [poolAddress, expectedAmountOut] = await registryExchangeContract.get_best_rate(
    tokenInAddress,
    tokenOutAddress,
    amountIn.toString()
  )

  if (poolAddress === AddressZero) {
    return
  }

  return {
    poolAddress,
    expectedAmountOut,
    registryExchangeAddress,
  }
}

/**
 * Returns Curve's Smart Router contract instance
 */
export function getRouter() {
  return new Contract(MAINNET_CONTRACTS.router, CURVE_ROUTER_ABI, getProvider(ChainId.MAINNET))
}

/**
 * Returns routing information from the Curve Smart Router. The router is only available on Mainnet.
 * The contract calls reverts if there no route is found
 * @returns the routing information
 */
export async function getExchangeRoutingInfo({
  amountIn,
  tokenInAddress,
  tokenOutAddress,
}: GetExchangeRoutingInfoParams): Promise<GetExchangeRoutingInfoResults | undefined> {
  const routerContract = getRouter()

  try {
    const params = [tokenInAddress, tokenOutAddress, amountIn.toString()]

    const exchangeRoutingRes = await routerContract.get_exchange_routing(...params, {
      from: AddressZero,
    })

    const [routes, indices, expectedAmountOut] = exchangeRoutingRes

    return {
      expectedAmountOut,
      indices,
      routes,
    }
  } catch (error) {
    // Throw any non-EVM errors
    if (!error.message.includes('execution reverted')) {
      throw error
    }
  }
  return
}

/**
 * @description Returns an instance of the Curve DAI Exchange contract. This contract is only available on Gnosis Chain.
 * @returns the DAI Exchange contract instance
 */
export function getCurveDAIExchangeContract() {
  return new Contract('0x9C13176D08C699906fCbb3a6555fb24BD647BF06', CURVE_DAI_EXCHANGE_ABI, getProvider(ChainId.XDAI))
}

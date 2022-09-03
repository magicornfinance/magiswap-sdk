import { Contract } from '@ethersproject/contracts'
import { getNetwork } from '@ethersproject/networks'
import { getDefaultProvider } from '@ethersproject/providers'
import IDXswapFactory from '@swapr/core/build/IDXswapFactory.json'
import IDXswapPair from '@swapr/core/build/IDXswapPair.json'
import JSBI from 'jsbi'
import invariant from 'tiny-invariant'

import { MULTICALL2_ABI } from './abis'
import { BigintIsh, ChainId, FACTORY_ADDRESS, MULTICALL2_ADDRESS } from './constants'
import { TokenAmount } from './entities/fractions/tokenAmount'
import { Pair } from './entities/pair'
import { Token } from './entities/token'
import { UniswapV2RoutablePlatform } from './entities/trades/routable-platform'

/**
 * Contains methods for constructing instances of pairs and tokens from on-chain data.
 */
export abstract class Fetcher {
  /**
   * Cannot be constructed.
   */
  private constructor() {
    // do nothing.
  }

  /**
   * Fetches information about a pair and constructs a pair from the given two tokens.
   * @param tokenA first token
   * @param tokenB second token
   * @param provider the provider to use to fetch the data
   */
  public static async fetchPairData(
    tokenA: Token,
    tokenB: Token,
    provider = getDefaultProvider(getNetwork(tokenA.chainId)),
    platform: UniswapV2RoutablePlatform = UniswapV2RoutablePlatform.SWAPR
  ): Promise<Pair> {
    invariant(tokenA.chainId === tokenB.chainId, 'CHAIN_ID')
    const address = Pair.getAddress(tokenA, tokenB, platform)
    const [reserves0, reserves1] = await new Contract(address, IDXswapPair.abi, provider).getReserves()
    const balances = tokenA.sortsBefore(tokenB) ? [reserves0, reserves1] : [reserves1, reserves0]
    const tokenAmountA = new TokenAmount(tokenA, balances[0])
    const tokenAmountB = new TokenAmount(tokenB, balances[1])
    const tokenAmounts = tokenAmountA.token.sortsBefore(tokenAmountB.token) // does safety checks
      ? [tokenAmountA, tokenAmountB]
      : [tokenAmountB, tokenAmountA]
    const liquidityToken = new Token(
      tokenAmounts[0].token.chainId,
      Pair.getAddress(tokenAmounts[0].token, tokenAmounts[1].token, platform),
      18,
      'DXS',
      'DXswap'
    )
    const swapFee = JSBI.BigInt(await new Contract(liquidityToken.address, IDXswapPair.abi, provider).swapFee())
    const protocolFeeDenominator = JSBI.BigInt(
      await new Contract(
        FACTORY_ADDRESS[tokenAmountA.token.chainId],
        IDXswapFactory.abi,
        provider
      ).protocolFeeDenominator()
    )
    return new Pair(tokenAmountA, tokenAmountB, swapFee, protocolFeeDenominator)
  }

  /**
   * Fetches swap fee information from a liquidity token of a token pair
   * @param liquidityToken the liquidity token from which the swap fee info will be fetched
   * @param provider the provider to use to fetch the data
   */
  public static async fetchSwapFee(
    liquidityToken: Token,
    provider = getDefaultProvider(getNetwork(liquidityToken.chainId))
  ): Promise<{
    fee: BigintIsh
    owner: string
  }> {
    return {
      fee: JSBI.BigInt(await new Contract(liquidityToken.address, IDXswapPair.abi, provider).swapFee()),
      owner: await new Contract(FACTORY_ADDRESS[liquidityToken.chainId], IDXswapFactory.abi, provider).feeToSetter(),
    }
  }

  /**
   * Fetches swap fee information from liquidity tokens of token pairs
   * @param liquidityToken the liquidity tokens from which the swap fee info will be fetched
   * @param provider the provider to use to fetch the data
   */
  public static async fetchSwapFees(
    liquidityTokens: Token[],
    provider = getDefaultProvider(getNetwork(liquidityTokens[0].chainId))
  ): Promise<
    {
      fee: BigintIsh
      owner: string
    }[]
  > {
    const multicall = new Contract(MULTICALL2_ADDRESS[liquidityTokens[0].chainId], MULTICALL2_ABI, provider)
    const factoryContract = new Contract(FACTORY_ADDRESS[liquidityTokens[0].chainId], IDXswapFactory.abi, provider)
    const liquidityTokenContract = new Contract(liquidityTokens[0].address, IDXswapPair.abi, provider)
    const calls = []
    calls.push({
      address: factoryContract.address,
      callData: factoryContract.interface.encodeFunctionData(factoryContract.interface.getFunction('feeToSetter()')),
    })
    for (let tokenPairsIndex = 0; tokenPairsIndex < liquidityTokens.length; tokenPairsIndex++) {
      calls.push({
        address: liquidityTokens[tokenPairsIndex].address,
        callData: liquidityTokenContract.interface.encodeFunctionData(
          liquidityTokenContract.interface.getFunction('swapFee()')
        ),
      })
    }
    const result = await multicall.callStatic.aggregate(calls.map((call) => [call.address, call.callData]))
    const owner = factoryContract.interface.decodeFunctionResult(
      factoryContract.interface.getFunction('feeToSetter()'),
      result.returnData[0]
    )[0]
    const fees = []
    for (let resultIndex = 1; resultIndex < result.returnData.length; resultIndex++) {
      fees.push({
        fee: JSBI.BigInt(
          liquidityTokenContract.interface.decodeFunctionResult(
            liquidityTokenContract.interface.getFunction('swapFee()'),
            result.returnData[resultIndex]
          )[0]
        ),
        owner,
      })
    }
    return fees
  }

  /**
   * Fetches swap fee information of all registered token pairs from factory
   * @param chainId the chainId of the network to fecth the swap fees
   * @param swapFeesCache a cache of already fetched fees to be skiped
   * @param provider the provider to use to fetch the data
   */
  public static async fetchAllSwapFees(
    chainId: ChainId,
    swapFeesCache: {
      [key: string]: {
        fee: BigintIsh
        owner: string
      }
    } = {},
    provider = getDefaultProvider(getNetwork(chainId))
  ): Promise<{
    [key: string]: {
      fee: BigintIsh
      owner: string
    }
  }> {
    const multicall = new Contract(MULTICALL2_ADDRESS[chainId], MULTICALL2_ABI, provider)
    const factoryContract = new Contract(FACTORY_ADDRESS[chainId], IDXswapFactory.abi, provider)
    const allPairsLength = await factoryContract.allPairsLength()
    const allSwapPairs: {
      [key: string]: {
        fee: BigintIsh
        owner: string
      }
    } = {}

    // Get first token pairs from cache
    const tokenPairsCache = Object.keys(swapFeesCache)
    const tokenPairsToFetch: Token[] = []
    for (let tokenPaisCacheIndex = 0; tokenPaisCacheIndex < tokenPairsCache.length; tokenPaisCacheIndex++) {
      allSwapPairs[tokenPairsCache[tokenPaisCacheIndex]] = {
        fee: swapFeesCache[tokenPairsCache[tokenPaisCacheIndex]].fee,
        owner: swapFeesCache[tokenPairsCache[tokenPaisCacheIndex]].owner,
      }
    }

    // Get rest of the token pairs that are not cached
    const calls = []
    for (let pairIndex = tokenPairsCache.length; pairIndex < allPairsLength; pairIndex++)
      calls.push({
        address: factoryContract.address,
        callData: factoryContract.interface.encodeFunctionData(
          factoryContract.interface.getFunction('allPairs(uint)'),
          [pairIndex]
        ),
      })
    const result = await multicall.callStatic.aggregate(calls.map((call) => [call.address, call.callData]))
    for (let resultIndex = 0; resultIndex < result.returnData.length; resultIndex++) {
      const tokenPairAddress = factoryContract.interface.decodeFunctionResult(
        factoryContract.interface.getFunction('allPairs(uint256)'),
        result.returnData[resultIndex]
      )[0]
      tokenPairsToFetch.push(new Token(chainId, tokenPairAddress, 18, 'DXS', 'DXswap'))
    }

    // Fetch the pairs that we dont have the fee and owner
    const swapFeesFetched = tokenPairsToFetch.length === 0 ? [] : await this.fetchSwapFees(tokenPairsToFetch, provider)
    for (let tokenPairsToFetchIndex = 0; tokenPairsToFetchIndex < tokenPairsToFetch.length; tokenPairsToFetchIndex++)
      allSwapPairs[tokenPairsToFetch[tokenPairsToFetchIndex].address] = swapFeesFetched[tokenPairsToFetchIndex]
    return allSwapPairs
  }

  /**
   * Fetches protocol fee information from the token pair factory
   * @param chainId the chainId of the network to fecth the protocol fee
   * @param provider the provider to use to fetch the data
   */
  public static async fetchProtocolFee(
    chainId: ChainId,
    provider = getDefaultProvider(getNetwork(chainId))
  ): Promise<{
    feeDenominator: BigintIsh
    feeReceiver: string
  }> {
    const factoryContract = await new Contract(FACTORY_ADDRESS[chainId], IDXswapFactory.abi, provider)
    const feeDenominator = await factoryContract.protocolFeeDenominator()
    const feeReceiver = await factoryContract.feeTo()
    return { feeDenominator, feeReceiver }
  }
}

import { BigNumber } from '@ethersproject/bignumber'
import type { UnsignedTransaction } from '@ethersproject/transactions'
import JSBI from 'jsbi'
import fetch from 'node-fetch'
import invariant from 'tiny-invariant'

import { ONE, TradeType } from '../../../constants'
import { Currency } from '../../currency'
import { CurrencyAmount } from '../../fractions/currencyAmount'
import { Fraction } from '../../fractions/fraction'
import { Percent } from '../../fractions/percent'
import { Price } from '../../fractions/price'
import { TokenAmount } from '../../fractions/tokenAmount'
import { Breakdown } from '../../platforms-breakdown'
import { currencyEquals } from '../../token'
import { TradeWithSwapTransaction } from '../interfaces/trade'
import { RoutablePlatform } from '../routable-platform'
import { tryGetChainId, wrappedAmount, wrappedCurrency } from '../utils'
import { ZEROX_API_URL } from './constants'
import { ApiResponse, ZeroXTradeConstructorParams } from './types'
import { decodeStringToPercent, platformsFromSources } from './utils'

/**
 * Represents a trade executed against a list of pairs.
 * Does not account for slippage, i.e. trades that front run this trade and move the price.
 */
export class ZeroXTrade extends TradeWithSwapTransaction {
  public readonly to: string
  public readonly callData: string
  public readonly value: string

  public constructor({
    breakdown,
    input,
    output,
    maximumSlippage,
    tradeType,
    to,
    callData,
    value,
    priceImpact,
  }: ZeroXTradeConstructorParams) {
    invariant(!currencyEquals(input.currency, output.currency), 'CURRENCY')
    const chainId = breakdown.chainId
    super({
      details: breakdown,
      type: tradeType,
      inputAmount: input,
      outputAmount: output,
      executionPrice: new Price({
        baseCurrency: input.currency,
        quoteCurrency: output.currency,
        denominator: input.raw,
        numerator: output.raw,
      }),
      maximumSlippage,
      priceImpact,
      chainId,
      platform: RoutablePlatform.ZEROX,
      approveAddress: to,
    })
    this.to = to
    this.callData = callData
    this.value = value
  }

  public minimumAmountOut(): CurrencyAmount {
    if (this.tradeType === TradeType.EXACT_OUTPUT) {
      return this.outputAmount
    } else {
      const slippageAdjustedAmountOut = new Fraction(ONE)
        .add(this.maximumSlippage)
        .invert()
        .multiply(this.outputAmount.raw).quotient
      return this.outputAmount instanceof TokenAmount
        ? new TokenAmount(this.outputAmount.token, slippageAdjustedAmountOut)
        : CurrencyAmount.nativeCurrency(slippageAdjustedAmountOut, this.chainId)
    }
  }

  public maximumAmountIn(): CurrencyAmount {
    if (this.tradeType === TradeType.EXACT_INPUT) {
      return this.inputAmount
    } else {
      const slippageAdjustedAmountIn = new Fraction(ONE)
        .add(this.maximumSlippage)
        .multiply(this.inputAmount.raw).quotient
      return this.inputAmount instanceof TokenAmount
        ? new TokenAmount(this.inputAmount.token, slippageAdjustedAmountIn)
        : CurrencyAmount.nativeCurrency(slippageAdjustedAmountIn, this.chainId)
    }
  }

  public static async bestTradeExactIn(
    currencyAmountIn: CurrencyAmount,
    currencyOut: Currency,
    maximumSlippage: Percent
  ): Promise<ZeroXTrade | undefined> {
    const chainId = tryGetChainId(currencyAmountIn, currencyOut)
    const apiUrl = chainId && ZEROX_API_URL[chainId]
    invariant(chainId !== undefined && apiUrl !== undefined && apiUrl.length > 0, 'CHAIN_ID')
    const amountIn = wrappedAmount(currencyAmountIn, chainId)
    const tokenIn = wrappedCurrency(currencyAmountIn.currency, chainId)
    const tokenOut = wrappedCurrency(currencyOut, chainId)
    invariant(!tokenIn.equals(tokenOut), 'CURRENCY')

    let bestTrade
    try {
      const buyToken = Currency.isNative(currencyOut) ? currencyOut.symbol : tokenOut.address
      const sellToken = Currency.isNative(currencyAmountIn.currency)
        ? currencyAmountIn.currency.symbol
        : tokenIn.address

      // slippagePercentage for the 0X API needs to be a value between 0 and 1, others have between 0 and 100
      const response = await fetch(
        `${apiUrl}swap/v1/quote?buyToken=${buyToken}&sellToken=${sellToken}&sellAmount=${
          amountIn.raw
        }&slippagePercentage=${new Percent(
          maximumSlippage.numerator,
          JSBI.multiply(maximumSlippage.denominator, JSBI.BigInt(100))
        ).toFixed(4)}`
      )

      if (!response.ok) throw new Error('response not ok')
      const json = (await response.json()) as ApiResponse
      const breakdown = new Breakdown(
        chainId,
        platformsFromSources(json.sources),
        tokenIn,
        tokenOut,
        new Price({
          baseCurrency: tokenIn,
          quoteCurrency: tokenOut,
          denominator: amountIn.raw,
          numerator: json.buyAmount,
        })
      )
      bestTrade = new ZeroXTrade({
        breakdown,
        input: currencyAmountIn,
        output: Currency.isNative(currencyOut)
          ? CurrencyAmount.nativeCurrency(json.buyAmount, chainId)
          : new TokenAmount(tokenOut, json.buyAmount),
        maximumSlippage,
        tradeType: TradeType.EXACT_INPUT,
        to: json.to,
        callData: json.data,
        value: json.value,
        priceImpact: decodeStringToPercent(json.estimatedPriceImpact, true),
      })
    } catch (error) {
      console.error('could not fetch 0x trade', error)
    }
    return bestTrade
  }

  public static async bestTradeExactOut(
    currencyIn: Currency,
    currencyAmountOut: CurrencyAmount,
    maximumSlippage: Percent
  ): Promise<ZeroXTrade | undefined> {
    const chainId = tryGetChainId(currencyAmountOut, currencyIn)
    const apiUrl = chainId && ZEROX_API_URL[chainId]
    invariant(chainId !== undefined && apiUrl !== undefined && apiUrl.length > 0, 'CHAIN_ID')
    const tokenIn = wrappedCurrency(currencyIn, chainId)
    const amountOut = wrappedAmount(currencyAmountOut, chainId)
    const tokenOut = wrappedCurrency(currencyAmountOut.currency, chainId)
    invariant(!tokenIn.equals(tokenOut), 'CURRENCY')

    let bestTrade
    try {
      const buyToken = Currency.isNative(currencyIn) ? currencyIn.symbol : tokenIn.address
      const sellToken = Currency.isNative(currencyAmountOut.currency)
        ? currencyAmountOut.currency.symbol
        : tokenOut.address

      // slippagePercentage for the 0X API needs to be a value between 0 and 1, others have between 0 and 100
      const response = await fetch(
        `${apiUrl}swap/v1/quote?buyToken=${buyToken}&sellToken=${sellToken}&sellAmount=${
          amountOut.raw
        }&slippagePercentage=${new Percent(
          maximumSlippage.numerator,
          JSBI.multiply(maximumSlippage.denominator, JSBI.BigInt(100))
        ).toFixed(3)}`
      )
      if (!response.ok) throw new Error('response not ok')
      const json = (await response.json()) as ApiResponse
      const breakdown = new Breakdown(
        chainId,
        platformsFromSources(json.sources),
        tokenIn,
        tokenOut,
        new Price({
          baseCurrency: tokenOut,
          quoteCurrency: tokenIn,
          denominator: amountOut.raw,
          numerator: json.buyAmount,
        })
      )
      bestTrade = new ZeroXTrade({
        breakdown,
        input: Currency.isNative(currencyIn)
          ? CurrencyAmount.nativeCurrency(json.buyAmount, chainId)
          : new TokenAmount(tokenIn, json.buyAmount),
        output: currencyAmountOut,
        maximumSlippage,
        tradeType: TradeType.EXACT_OUTPUT,
        to: json.to,
        callData: json.data,
        value: json.value,
        priceImpact: decodeStringToPercent(json.estimatedPriceImpact, true),
      })
    } catch (error) {
      console.error('could not fetch 0x trade', error)
    }

    return bestTrade
  }

  public async swapTransaction(): Promise<UnsignedTransaction> {
    return {
      to: this.to,
      data: this.callData,
      value: BigNumber.from(this.value),
    }
  }
}

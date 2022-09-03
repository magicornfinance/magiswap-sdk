import type { UnsignedTransaction } from '@ethersproject/transactions'

import type { ChainId, TradeType } from '../../../constants'
import type { CurrencyAmount } from '../../fractions/currencyAmount'
import { Percent } from '../../fractions/percent'
import type { Price } from '../../fractions/price'
import type { Breakdown } from '../../platforms-breakdown'
import type { Route } from '../../route'
import type { RoutablePlatform } from '../routable-platform'
import type { TradeOptions } from './trade-options'

export type Details = Route | Breakdown | undefined

export interface TradeConstructorParams {
  details: Details
  type: TradeType
  inputAmount: CurrencyAmount
  outputAmount: CurrencyAmount
  executionPrice: Price
  maximumSlippage: Percent
  priceImpact: Percent
  chainId: ChainId
  platform: RoutablePlatform
  fee?: Percent
  approveAddress: string
}

/**
 * Represents a base Trade class.
 * Extend this class to create more trades to the Eco Router
 */
export abstract class Trade {
  public readonly details: Details
  /**
   * The input amount of the trade.
   */
  public readonly tradeType: TradeType
  /**
   * The input amount of the trade.
   */
  public readonly inputAmount: CurrencyAmount
  /**
   * The output amount of the trade.
   */
  public readonly outputAmount: CurrencyAmount
  /**
   * The maximum slippage allowed in the trade.
   */
  public readonly maximumSlippage: Percent
  /**
   * The execution price of the trade.
   */
  public readonly executionPrice: Price
  /**
   * The price impact of the trade, as a percentage.
   */
  public readonly priceImpact: Percent
  /**
   * The chainId of the trade.
   */
  public readonly chainId: ChainId
  /**
   * A platform that this trade is executed on.
   */
  public readonly platform: RoutablePlatform
  /**
   * An address the EOA must approve to spend its tokenIn
   */
  public readonly approveAddress: string
  /**
   * The trade fee
   */
  public readonly fee: Percent

  protected constructor({
    details,
    type,
    inputAmount,
    outputAmount,
    executionPrice,
    maximumSlippage,
    priceImpact,
    chainId,
    platform,
    fee = new Percent('0'),
    approveAddress,
  }: TradeConstructorParams) {
    this.details = details
    this.tradeType = type
    this.inputAmount = inputAmount
    this.maximumSlippage = maximumSlippage
    this.outputAmount = outputAmount
    this.executionPrice = executionPrice
    this.priceImpact = priceImpact
    this.chainId = chainId
    this.platform = platform
    this.fee = fee
    this.approveAddress = approveAddress
  }

  /**
   * Get the minimum amount that must be received from this trade for the given slippage tolerance
   */
  public abstract minimumAmountOut(): CurrencyAmount

  /**
   * Get the maximum amount in that can be spent via this trade for the given slippage tolerance
   */
  public abstract maximumAmountIn(): CurrencyAmount
}

/**
 * Represents a trade executed against a list of pairs.
 * Does not account for slippage, i.e. trades that front run this trade and move the price.
 */
export abstract class TradeWithSwapTransaction extends Trade {
  public abstract swapTransaction(options: TradeOptions): Promise<UnsignedTransaction>
}

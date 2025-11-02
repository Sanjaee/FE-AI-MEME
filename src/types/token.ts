export interface TokenData {
  pairAddress: string
  tokenAddress: string
  tokenName: string
  tokenTicker: string
  tokenImage: string
  volumeSol: number
  marketCapSol: number
  liquiditySol: number
  numTxns: number
  numBuys: number
  numSells: number
  top10HoldersPercent: number
  devHoldsPercent: number
  snipersHoldPercent: number
  insidersHoldPercent: number
  bundlersHoldPercent: number
  numHolders: number
  numTradingBotUsers: number
  createdAt: string
  openTrading: string
  website: string | null
  twitter: string | null
  telegram: string | null
  dexPaid: boolean
  isPumpLive: boolean
}


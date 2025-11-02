import { useState, useEffect } from "react"
import Marquee from "react-fast-marquee"
import axios from "axios"

interface PlisioCurrency {
  name: string
  cid: string
  currency: string
  icon: string
  rate_usd: string
  price_usd: string
  precision: number
  output_precision?: number
  fiat: string
  fiat_rate: string
  min_sum_in: string
  invoice_commission_percentage: string
  hidden: number
  maintenance: boolean
  contractOf?: string | null
  contractStandard?: string | null
  allowMemo: boolean
}

interface BackendResponse {
  success: boolean
  data: PlisioCurrency[]
  timestamp?: number
  message?: string
}

export default function PlisioMarquee() {
  const [currencies, setCurrencies] = useState<PlisioCurrency[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPlisioData = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
      
      const response = await axios.get<BackendResponse>(
        `${backendUrl}/api/currencies`,
        {
          timeout: 10000,
        }
      )

      if (response.data.success && response.data.data) {
        setCurrencies(response.data.data)
      }
    } catch {
      // Silently handle errors
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlisioData()
    const interval = setInterval(fetchPlisioData, 5000) // Refresh every 5 seconds for real-time data
    
    return () => clearInterval(interval)
  }, [])

  const formatPrice = (price: string) => {
    const num = parseFloat(price)
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(2)}M`
    }
    if (num >= 1000) {
      return `$${(num / 1000).toFixed(2)}K`
    }
    return `$${num.toFixed(2)}`
  }

  const getCurrencyColor = (cid: string): string => {
    // Map currency codes to their brand colors
    const colorMap: { [key: string]: string } = {
      // Bitcoin - Gold/Orange
      'BTC': 'text-orange-400',
      
      // Ethereum - Purple/Blue
      'ETH': 'text-blue-500',
      'APE': 'text-blue-600',
      
      // Solana - Purple/Blue gradient
      'SOL': 'text-[#00FF66]',
      'USDT_SOL': 'text-indigo-300',
      'USDC_SOL': 'text-indigo-300',
      
      // Binance - Yellow
      'BNB': 'text-yellow-400',
      'USDT_BSC': 'text-yellow-300',
      'USDC_BSC': 'text-yellow-300',
      'BUSD': 'text-yellow-300',
      
      // Tron - Red
      'TRX': 'text-red-400',
      'USDT_TRX': 'text-red-300',
      'BTT_TRX': 'text-red-300',
      
      // Stablecoins - Green
      'USDT': 'text-green-400',
      'USDC': 'text-green-400',
      'TUSD': 'text-green-300',
      'USDT_TON': 'text-green-400',
      'USDC_BASE': 'text-green-400',
      
      // Toncoin - Cyan
      'TON': 'text-cyan-400',
      
      // Dogecoin - Yellow
      'DOGE': 'text-yellow-500',
      
      // Monero - Orange
      'XMR': 'text-orange-500',
      
      // Litecoin - Silver/Gray
      'LTC': 'text-gray-400',
      
      // Bitcoin Cash - Green
      'BCH': 'text-green-500',
      
      // Dash - Blue
      'DASH': 'text-blue-400',
      
      // Zcash - Yellow
      'TZEC': 'text-yellow-600',
      'ZEC': 'text-yellow-600',
      
      // Ethereum Classic
      'ETC': 'text-green-400',
      
      // Base
      'ETH_BASE': 'text-blue-500',
      
      // Shiba Inu
      'SHIB': 'text-orange-300',
      
      // Love Bit
      'LB': 'text-pink-400',
    }
    
    return colorMap[cid] || 'text-zinc-400'
  }

  if (loading || currencies.length === 0) {
    return null
  }

  return (
    <div className="bg-zinc-900 border-b border-zinc-800">
      <Marquee gradient={false} speed={50} pauseOnHover={true}>
        {currencies.map((currency, index) => {
          const currencyColor = getCurrencyColor(currency.cid)
          return (
            <div key={index} className="flex items-center mx-8 py-2">
              <div className="flex items-center gap-3">
                <img 
                  src={currency.icon} 
                  alt={currency.name}
                  width={20}
                  height={20}
                  className="rounded-full"
                />
                <span className={`text-xs font-bold ${currencyColor}`}>
                  {currency.cid}
                </span>
                <span className="text-xs text-zinc-400">•</span>
                <span className={`text-xs font-semibold ${currencyColor}`}>
                  {formatPrice(currency.price_usd)}
                </span>
              </div>
            </div>
          )
        })}
      </Marquee>
    </div>
  )
}


// Currency conversion utility
// USD to JPY exchange rate (approximate)
const USD_TO_JPY = 150
// USD to CNY exchange rate (approximate)
const USD_TO_CNY = 7

export function formatCurrency(amount, currency = 'USD') {
  if (currency === 'JPY') {
    const yenAmount = Math.round(amount * USD_TO_JPY)
    return `¥${yenAmount.toLocaleString('ja-JP')}`
  }
  if (currency === 'CNY') {
    const yuanAmount = Math.round(amount * USD_TO_CNY)
    return `¥${yuanAmount.toLocaleString('zh-CN')}`
  }
  // Default USD
  return `$${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}

export function formatCurrencyWithDecimals(amount, currency = 'USD', decimals = 0) {
  if (currency === 'JPY') {
    const yenAmount = Math.round(amount * USD_TO_JPY)
    return `¥${yenAmount.toLocaleString('ja-JP')}`
  }
  if (currency === 'CNY') {
    const yuanAmount = Math.round(amount * USD_TO_CNY)
    return `¥${yuanAmount.toLocaleString('zh-CN')}`
  }
  // Default USD
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`
}

export function convertAmount(amount, currency = 'USD') {
  if (currency === 'JPY') {
    return Math.round(amount * USD_TO_JPY)
  }
  if (currency === 'CNY') {
    return Math.round(amount * USD_TO_CNY)
  }
  return amount
}

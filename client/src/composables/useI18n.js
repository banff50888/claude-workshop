import { ref, computed } from 'vue'
import en from '../locales/en'
import ja from '../locales/ja'
import pt_BR from '../locales/pt_BR'
import zh from '../locales/zh'

const translations = {
  en,
  ja,
  pt_BR: pt_BR,
  zh
}

const getBrowserLocale = () => {
  const lang = (navigator.language || '').toLowerCase()
  if (lang.startsWith('pt')) return 'pt_BR'
  if (lang.startsWith('ja')) return 'ja'
  if (lang.startsWith('zh')) return 'zh'
  return 'en'
}

// Load saved locale from localStorage, fall back to browser language detection
const savedLocale = localStorage.getItem('app-locale') || getBrowserLocale()
const currentLocale = ref(savedLocale)

// Currency is automatically set based on locale
const currentCurrency = computed(() => {
  if (currentLocale.value === 'ja') return 'JPY'
  if (currentLocale.value === 'pt_BR') return 'BRL'
  if (currentLocale.value === 'zh') return 'CNY'
  return 'USD'
})

export function useI18n() {
  const t = (key, params = {}) => {
    const keys = key.split('.')
    let value = translations[currentLocale.value]

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k]
      } else {
        // If translation not found, try English as fallback
        if (currentLocale.value !== 'en') {
          let fallback = translations.en
          for (const fk of keys) {
            if (fallback && typeof fallback === 'object') {
              fallback = fallback[fk]
            } else {
              break
            }
          }
          if (fallback && typeof fallback === 'string') {
            return replacePlaceholders(fallback, params)
          }
        }
        // If still not found, return the key itself
        return key
      }
    }

    if (typeof value === 'string') {
      return replacePlaceholders(value, params)
    }

    return key
  }

  const replacePlaceholders = (text, params) => {
    return text.replace(/\{(\w+)\}/g, (match, key) => {
      return params[key] !== undefined ? params[key] : match
    })
  }

  const setLocale = (locale) => {
    if (translations[locale]) {
      currentLocale.value = locale
      localStorage.setItem('app-locale', locale)
    }
  }

  const availableLocales = computed(() => Object.keys(translations))

  const localeName = computed(() => {
    const names = {
      en: 'English',
      ja: '日本語',
      pt_BR: 'Português (Brasil)',
      zh: '简体中文'
    }
    return names[currentLocale.value] || currentLocale.value
  })

  // Translate product names
  const translateProductName = (productName) => {
    if (currentLocale.value === 'ja' && translations.ja.productNames[productName]) {
      return translations.ja.productNames[productName]
    }
    if (currentLocale.value === 'zh' && translations.zh.productNames[productName]) {
      return translations.zh.productNames[productName]
    }
    return productName
  }

  // Translate customer names
  const translateCustomerName = (customerName) => {
    if (currentLocale.value === 'ja' && translations.ja.customerNames[customerName]) {
      return translations.ja.customerNames[customerName]
    }
    if (currentLocale.value === 'zh' && translations.zh.customerNames[customerName]) {
      return translations.zh.customerNames[customerName]
    }
    return customerName
  }

  // Translate warehouse names
  const translateWarehouse = (warehouseName) => {
    if (currentLocale.value === 'ja') {
      // Handle city names
      const cityMap = {
        'San Francisco': 'サンフランシスコ',
        'London': 'ロンドン',
        'Tokyo': '東京'
      }

      if (cityMap[warehouseName]) {
        return cityMap[warehouseName]
      }

      // Handle "Warehouse X-##" pattern
      if (warehouseName.startsWith('Warehouse ')) {
        return warehouseName.replace('Warehouse ', '倉庫')
      }

      return warehouseName
    }
    if (currentLocale.value === 'zh') {
      const cityMap = {
        'San Francisco': '旧金山',
        'London': '伦敦',
        'Tokyo': '东京'
      }

      if (cityMap[warehouseName]) {
        return cityMap[warehouseName]
      }

      if (warehouseName.startsWith('Warehouse ')) {
        return warehouseName.replace('Warehouse ', '仓库')
      }

      return warehouseName
    }
    return warehouseName
  }

  return {
    t,
    setLocale,
    currentLocale: computed(() => currentLocale.value),
    currentCurrency,
    availableLocales,
    localeName,
    translateProductName,
    translateCustomerName,
    translateWarehouse
  }
}

import { ref, computed } from 'vue'

const STORAGE_KEY = 'app-theme'
const themes = ['light', 'dark']

const getSavedTheme = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return themes.includes(saved) ? saved : 'dark'
  } catch (e) {
    return 'dark'
  }
}

const currentTheme = ref(getSavedTheme())

const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme)
}

// Apply on module load so the first paint uses the saved/default theme
applyTheme(currentTheme.value)

export function useTheme() {
  const setTheme = (theme) => {
    if (!themes.includes(theme)) return
    currentTheme.value = theme
    applyTheme(theme)
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch (e) {
      // Storage unavailable; theme still applies for this session
    }
  }

  const toggleTheme = () => {
    setTheme(currentTheme.value === 'dark' ? 'light' : 'dark')
  }

  return {
    currentTheme: computed(() => currentTheme.value),
    isDark: computed(() => currentTheme.value === 'dark'),
    setTheme,
    toggleTheme
  }
}

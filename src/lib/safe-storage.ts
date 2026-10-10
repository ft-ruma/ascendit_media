import { createJSONStorage, type StateStorage } from 'zustand/middleware'

// localStorage can throw (private mode, blocked site data, quota). Every
// persisted setting goes through this so a failure just means "not remembered".
const safe: StateStorage = {
  getItem: (k) => {
    try {
      return localStorage.getItem(k)
    } catch {
      return null
    }
  },
  setItem: (k, v) => {
    try {
      localStorage.setItem(k, v)
    } catch {
      // ignore
    }
  },
  removeItem: (k) => {
    try {
      localStorage.removeItem(k)
    } catch {
      // ignore
    }
  },
}

export const safeLocalStorage = createJSONStorage(() => safe)

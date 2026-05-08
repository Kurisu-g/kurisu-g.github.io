import AV from 'leancloud-storage'

let initialized = false

export function initLeanCloud() {
  if (initialized) return

  AV.init({
    appId: import.meta.env.VITE_LC_APP_ID,
    appKey: import.meta.env.VITE_LC_APP_KEY,
    serverURLs: import.meta.env.VITE_LC_SERVER_URL
  })

  initialized = true
}

export { AV }

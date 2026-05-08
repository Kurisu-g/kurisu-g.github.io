import AV from 'leancloud-storage'

let initialized = false

export function initLeanCloud() {
  if (initialized) return

  AV.init({
    appId: 'eX3nDnSKjEEHFtyyCU7ut1um-gzGzoHsz',
    appKey: 'vso9UDa0LlBvDEkh4NYjvCJL',
    serverURLs: 'https://ex3ndnsk.lc-cn-n1-shared.com'
  })

  initialized = true
}

export { AV }

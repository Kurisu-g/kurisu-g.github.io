import { AV } from './leancloud.js'

export function calcCursorPos(textarea, clientX, clientY) {
  const rect = textarea.getBoundingClientRect()
  const style = window.getComputedStyle(textarea)
  const lineH = parseInt(style.lineHeight) || parseInt(style.fontSize) * 1.4 || 18
  const padTop = parseInt(style.paddingTop) || 12
  const padLeft = parseInt(style.paddingLeft) || 12
  const borderTop = parseInt(style.borderTopWidth) || 0
  const borderLeft = parseInt(style.borderLeftWidth) || 0

  const y = clientY - rect.top - padTop - borderTop
  const x = clientX - rect.left - padLeft - borderLeft
  const lineIdx = Math.max(0, Math.floor(y / lineH))

  const lines = textarea.value.split('\n')
  let offset = 0
  for (let i = 0; i < lineIdx && i < lines.length; i++) {
    offset += lines[i].length + 1
  }
  if (lineIdx < lines.length) {
    const col = Math.max(0, Math.floor(x / 8))
    offset = Math.min(offset + col, offset + lines[lineIdx].length)
  }
  return Math.min(offset, textarea.value.length)
}

export function getMdForFile(file, url) {
  const isVideo = file.type.startsWith('video/')
  return isVideo ? `<video src="${url}" controls></video>` : `![${file.name}](${url})`
}

export async function uploadFile(file) {
  const avFile = new AV.File(file.name, file)
  await avFile.save()
  return avFile.url()
}

export async function handleFiles(files, { onStart, onProgress, onDone, onError }) {
  for (const file of files) {
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) continue
    onStart?.(file)
    try {
      const url = await uploadFile(file)
      const md = getMdForFile(file, url)
      onDone?.(file, md)
    } catch (e) {
      console.error('Upload failed:', e)
      onError?.(file, e.message || '上传失败')
    }
  }
}

<script setup>
import { ref, onMounted, nextTick, computed } from 'vue'
import { initLeanCloud, AV } from '../utils/leancloud.js'
import { calcCursorPos, handleFiles } from '../utils/upload.js'

const props = defineProps({
  postId: { type: String, required: true }
})

const comments = ref([])
const loading = ref(true)
const error = ref('')
const author = ref('')
const content = ref('')
const submitting = ref(false)
const submitError = ref('')
const uploading = ref(false)
const uploadMsg = ref('')
const showEmoji = ref(false)
const textareaRef = ref(null)
const dragOver = ref(false)
const lightboxSrc = ref('')
const lightboxType = ref('')
const showLightbox = ref(false)

function openLightbox(src, type) {
  lightboxSrc.value = src
  lightboxType.value = type
  showLightbox.value = true
  document.body.style.overflow = 'hidden'
}

function closeLightbox() {
  showLightbox.value = false
  document.body.style.overflow = ''
}

function onCommentClick(e) {
  const img = e.target.closest('.comment-image')
  if (img) { openLightbox(img.src, 'image'); return }
  const video = e.target.closest('.comment-video')
  if (video) { openLightbox(video.querySelector('source')?.src || video.src, 'video'); return }
}

const emojis = [
  '😀','😂','🤣','😊','😍','🥰','😘','😜','😎','🤩',
  '😢','😭','😡','🤬','👍','👎','🙏','💪','🎉','🔥',
  '❤️','💔','✨','🌟','🐱','🐶','🌸','🍕','⚡','💯',
  '🎂','🍰','☕','🎵','🏠','🚀','🌈','⭐','🤔','😅',
  '🥺','🙈','🐵','🦊','🐼','🍉','🍦','🎮','💻','📚',
  '👏','🤝','✌️','🤞','🍺','🎁','🌹','💐','🎄','😷'
]

function insertAtCursor(text) {
  const ta = textareaRef.value
  if (!ta) { content.value += text; return }
  if (ta._pendingCursor != null) {
    ta.selectionStart = ta._pendingCursor
    ta.selectionEnd = ta._pendingCursor
    ta._pendingCursor = null
  }
  const start = ta.selectionStart
  const end = ta.selectionEnd
  content.value = content.value.substring(0, start) + text + content.value.substring(end)
  nextTick(() => {
    ta.focus()
    ta.setSelectionRange(start + text.length, start + text.length)
  })
}

function insertEmoji(emoji) {
  insertAtCursor(emoji)
  showEmoji.value = false
}

function triggerUpload(type) {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = type === 'image' ? 'image/*' : 'video/*'
  input.onchange = (e) => {
    const file = e.target.files[0]
    if (file) uploadFiles([file])
  }
  input.click()
}

function uploadFiles(files) {
  const ta = textareaRef.value
  if (ta) ta._pendingCursor = ta.selectionStart
  uploading.value = true
  uploadMsg.value = '上传中...'
  handleFiles(files, {
    onStart() {},
    onDone(file, md) {
      insertAtCursor('\n' + md + '\n')
      uploadMsg.value = ''
    },
    onError(file, msg) {
      uploadMsg.value = msg
      setTimeout(() => { uploadMsg.value = '' }, 3000)
    },
  })
  uploading.value = false
}

// --- Drag & drop ---

function onDragOver(e) {
  e.preventDefault()
  dragOver.value = true
}

function onDragLeave() {
  dragOver.value = false
}

function onDrop(e) {
  e.preventDefault()
  dragOver.value = false
  const files = e.dataTransfer.files
  if (!files.length) return
  const ta = e.target
  ta._pendingCursor = calcCursorPos(ta, e.clientX, e.clientY)
  uploadFiles(files)
}

// --- Ctrl+V paste images ---

function onPaste(e) {
  const items = e.clipboardData?.items
  if (!items) return
  const files = []
  for (const item of items) {
    if (item.kind === 'file') files.push(item.getAsFile())
  }
  if (files.length) {
    e.preventDefault()
    const ta = e.target
    ta._pendingCursor = ta.selectionStart
    uploadFiles(files)
  }
}

function renderContent(text) {
  if (!text) return ''
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="comment-image" loading="lazy" />')
  html = html.replace(/<video src="([^"]+)" controls><\/video>/g, '<video controls class="comment-video" preload="metadata"><source src="$1"></video>')
  html = html.replace(/\n/g, '<br>')
  return html
}

onMounted(async () => {
  initLeanCloud()
  await loadComments()
})

async function loadComments() {
  loading.value = true
  error.value = ''
  try {
    const query = new AV.Query('Comment')
    query.equalTo('postId', props.postId)
    query.ascending('createdAt')
    const results = await query.find()
    comments.value = results.map(obj => ({
      id: obj.id,
      author: obj.get('author'),
      content: obj.get('content'),
      createdAt: obj.createdAt,
    }))
  } catch (e) {
    console.error('Failed to load comments:', e)
    error.value = '评论加载失败，请刷新页面重试'
  }
  loading.value = false
}

async function submitComment() {
  if (!author.value.trim() || !content.value.trim()) {
    submitError.value = '请填写昵称和评论内容'
    return
  }
  submitting.value = true
  submitError.value = ''
  try {
    const Comment = AV.Object.extend('Comment')
    const comment = new Comment()
    comment.set('postId', props.postId)
    comment.set('author', author.value.trim())
    comment.set('content', content.value.trim())
    const acl = new AV.ACL()
    acl.setPublicReadAccess(true)
    acl.setPublicWriteAccess(true)
    comment.setACL(acl)
    const saved = await comment.save()
    comments.value.push({
      id: saved.id,
      author: saved.get('author'),
      content: saved.get('content'),
      createdAt: saved.createdAt,
    })
    author.value = ''
    content.value = ''
  } catch (e) {
    console.error('Failed to submit comment:', e)
    submitError.value = '评论发布失败，请重试'
  }
  submitting.value = false
}

function formatDate(date) {
  if (!date) return ''
  const d = new Date(date)
  const now = new Date()
  const diff = now - d
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)} 天前`
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>

<template>
  <div class="comments-section">
    <h3>评论（{{ comments.length }}）</h3>

    <div v-if="loading" class="cs-loading">加载评论中...</div>

    <div v-else-if="error" class="cs-error">{{ error }}</div>

    <div v-else class="comments-list">
      <div v-if="comments.length === 0" class="cs-empty">
        还没有评论，来抢沙发吧！
      </div>
      <div v-for="c in comments" :key="c.id" class="comment-item">
        <div class="comment-header">
          <strong class="comment-author">{{ c.author }}</strong>
          <span class="comment-time">{{ formatDate(c.createdAt) }}</span>
        </div>
        <div class="comment-content" v-html="renderContent(c.content)" @click="onCommentClick"></div>
      </div>
    </div>

    <div class="comment-form">
      <h4>发表评论</h4>
      <input
        v-model="author"
        type="text"
        placeholder="你的昵称 *"
        maxlength="50"
        class="comment-input"
      />
      <textarea
        ref="textareaRef"
        v-model="content"
        placeholder="写下你的想法... 支持图片/视频和表情"
        rows="5"
        maxlength="2000"
        class="comment-textarea"
        :class="{ 'drag-active': dragOver }"
        @dragover="onDragOver"
        @dragleave="onDragLeave"
        @drop="onDrop"
        @paste="onPaste"
      ></textarea>
      <div class="form-tools">
        <div class="tool-buttons">
          <button type="button" class="tool-btn" :disabled="uploading" @click="triggerUpload('image')" title="插入图片">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          </button>
          <button type="button" class="tool-btn" :disabled="uploading" @click="triggerUpload('video')" title="插入视频">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
          </button>
          <button type="button" class="tool-btn" @click="showEmoji = !showEmoji" title="表情">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
          </button>
          <span v-if="uploadMsg" class="upload-msg">{{ uploadMsg }}</span>
        </div>
      </div>
      <div v-if="showEmoji" class="emoji-picker">
        <button v-for="e in emojis" :key="e" class="emoji-item" @click="insertEmoji(e)">{{ e }}</button>
      </div>
      <div v-if="submitError" class="comment-submit-error">{{ submitError }}</div>
      <button
        class="comment-submit-btn"
        :disabled="submitting"
        @click="submitComment"
      >
        {{ submitting ? '提交中...' : '发表评论' }}
      </button>
    </div>

    <Teleport to="body">
      <div v-if="showLightbox" class="lightbox-overlay" @click="closeLightbox">
        <img v-if="lightboxType === 'image'" :src="lightboxSrc" class="lightbox-img" @click.stop />
        <video v-else-if="lightboxType === 'video'" :src="lightboxSrc" controls class="lightbox-video" @click.stop></video>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.comments-section {
  margin-top: 48px;
  padding-top: 32px;
  border-top: 1px solid var(--vp-c-divider);
}
.comments-section h3 {
  font-size: 1.2rem;
  margin-bottom: 20px;
}
.cs-loading, .cs-empty, .cs-error {
  padding: 20px 0;
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
}
.cs-error {
  color: var(--vp-c-danger-1);
}
.comment-item {
  padding: 16px 0;
  border-bottom: 1px solid var(--vp-c-divider);
}
.comment-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}
.comment-author {
  font-size: 0.9rem;
  color: var(--vp-c-text-1);
}
.comment-time {
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
}
.comment-content {
  font-size: 0.95rem;
  line-height: 1.7;
  color: var(--vp-c-text-2);
  word-break: break-word;
}
.comment-content :deep(img.comment-image) {
  display: block;
  max-width: 100%;
  max-height: 400px;
  margin: 8px 0;
  border-radius: 8px;
  cursor: zoom-in;
  object-fit: contain;
}
.comment-content :deep(video.comment-video) {
  display: block;
  max-width: 100%;
  max-height: 400px;
  margin: 8px 0;
  border-radius: 8px;
  cursor: zoom-in;
}
.lightbox-overlay {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(0,0,0,0.85);
  display: flex; align-items: center; justify-content: center;
  cursor: zoom-out;
}
.lightbox-img {
  max-width: 90vw;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 8px;
}
.lightbox-video {
  max-width: 90vw;
  max-height: 90vh;
  border-radius: 8px;
}
.comment-form {
  margin-top: 32px;
}
.comment-form h4 {
  font-size: 1rem;
  margin-bottom: 12px;
}
.comment-input,
.comment-textarea {
  display: block;
  width: 100%;
  padding: 10px 12px;
  margin-bottom: 8px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-size: 0.9rem;
  font-family: inherit;
  box-sizing: border-box;
  transition: border-color 0.2s;
}
.comment-input:focus,
.comment-textarea:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
}
.comment-textarea.drag-active {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}
.comment-textarea {
  resize: vertical;
}
.form-tools {
  margin-bottom: 8px;
}
.tool-buttons {
  display: flex;
  align-items: center;
  gap: 4px;
}
.tool-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border: 1px solid transparent;
  border-radius: 4px;
  background: transparent;
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: all 0.15s;
}
.tool-btn:hover:not(:disabled) {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-divider);
}
.tool-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.upload-msg {
  font-size: 0.8rem;
  color: var(--vp-c-brand-1);
  margin-left: 4px;
}
.emoji-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 8px;
  margin-bottom: 8px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  max-height: 180px;
  overflow-y: auto;
}
.emoji-item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: 4px;
  background: transparent;
  font-size: 1.2rem;
  cursor: pointer;
  transition: background 0.1s;
}
.emoji-item:hover {
  background: var(--vp-c-divider);
}
.comment-submit-btn {
  padding: 8px 20px;
  border: none;
  border-radius: 6px;
  background: var(--vp-c-brand-1);
  color: #fff;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s;
}
.comment-submit-btn:hover:not(:disabled) {
  background: var(--vp-c-brand-2);
}
.comment-submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.comment-submit-error {
  color: var(--vp-c-danger-1);
  font-size: 0.85rem;
  margin-bottom: 8px;
}
</style>

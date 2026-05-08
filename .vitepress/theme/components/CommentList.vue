<script setup>
import { ref, onMounted } from 'vue'
import { initLeanCloud, AV } from '../utils/leancloud.js'

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
        <p class="comment-content">{{ c.content }}</p>
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
        v-model="content"
        placeholder="写下你的想法... *"
        rows="4"
        maxlength="1000"
        class="comment-textarea"
      ></textarea>
      <div v-if="submitError" class="comment-submit-error">{{ submitError }}</div>
      <button
        class="comment-submit-btn"
        :disabled="submitting"
        @click="submitComment"
      >
        {{ submitting ? '提交中...' : '发表评论' }}
      </button>
    </div>
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
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--vp-c-text-2);
  white-space: pre-wrap;
  word-break: break-word;
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
  margin-bottom: 10px;
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
.comment-textarea {
  resize: vertical;
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

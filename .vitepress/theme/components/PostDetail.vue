<script setup>
import { ref, onMounted } from 'vue'
import { initLeanCloud, AV } from '../utils/leancloud.js'
import CommentList from './CommentList.vue'
import LikeButton from './LikeButton.vue'
import ViewCounter from './ViewCounter.vue'

const post = ref(null)
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  initLeanCloud()
  const id = new URLSearchParams(window.location.search).get('id')
  if (!id) {
    error.value = '未找到文章'
    loading.value = false
    return
  }
  try {
    const query = new AV.Query('Post')
    query.equalTo('objectId', id)
    const obj = await query.get(id)
    post.value = {
      id: obj.id,
      title: obj.get('title'),
      content: obj.get('content'),
      tags: obj.get('tags') || [],
      description: obj.get('description') || '',
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt,
    }
  } catch (e) {
    console.error('Failed to load post:', e)
    error.value = '文章加载失败'
  }
  loading.value = false
})

function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
}

function renderMd(text) {
  // Split into blocks: code fences vs regular text
  const blocks = []
  let remaining = text
  let match
  const codeRegex = /```(\w*)\n([\s\S]*?)```/g
  let lastIdx = 0
  while ((match = codeRegex.exec(text)) !== null) {
    if (match.index > lastIdx) blocks.push({ type: 'text', content: text.slice(lastIdx, match.index) })
    blocks.push({ type: 'code', lang: match[1], content: match[2] })
    lastIdx = match.index + match[0].length
  }
  if (lastIdx < text.length) blocks.push({ type: 'text', content: text.slice(lastIdx) })
  if (blocks.length === 0) blocks.push({ type: 'text', content: text })

  return blocks.map(block => {
    if (block.type === 'code') {
      return `<pre><code>${esc(block.content)}</code></pre>`
    }

    let html = block.content
    // Extract raw HTML tags (video, iframe, etc.) and protect them
    const protectedTags = []
    html = html.replace(/<(video|iframe|audio|embed)\b[\s\S]*?<\/\1>/gi, (m) => {
      protectedTags.push(m)
      return `\x00PROTECTED${protectedTags.length - 1}\x00`
    })
    html = html.replace(/<(img|br|hr)\b[^>]*\/?>/gi, (m) => {
      protectedTags.push(m)
      return `\x00PROTECTED${protectedTags.length - 1}\x00`
    })

    html = esc(html)

    // Headers
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>')
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>')
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>')

    // Bold / italic
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>')

    // Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;border-radius:8px;">')

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')

    // Blockquote
    html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>')

    // Unordered list items
    html = html.replace(/^- (.+)$/gm, '<li>$1</li>')
    html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>')

    // Line breaks
    html = html.replace(/\n\n/g, '</p><p>')
    html = html.replace(/\n/g, '<br>')

    html = '<p>' + html + '</p>'

    // Restore protected tags
    protectedTags.forEach((tag, i) => {
      html = html.replace(`\x00PROTECTED${i}\x00`, tag)
    })

    return html
  }).join('')
}

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
</script>

<template>
  <div class="post-detail">
    <div v-if="loading" class="pd-loading">加载中...</div>

    <div v-else-if="error" class="pd-error">{{ error }}</div>

    <template v-else-if="post">
      <h1 class="pd-title">{{ post.title }}</h1>
      <div class="pd-meta">
        <span>{{ formatDate(post.createdAt) }}</span>
        <span class="pd-tags" v-if="post.tags.length">
          <span v-for="tag in post.tags" :key="tag" class="pd-tag">{{ tag }}</span>
        </span>
      </div>
      <div class="pd-content" v-html="renderMd(post.content)"></div>

      <div class="pd-footer">
        <ViewCounter :postId="post.id" />
        <div style="margin-top: 8px;">
          <LikeButton :postId="post.id" />
        </div>
        <CommentList :postId="post.id" />
      </div>
    </template>
  </div>
</template>

<style scoped>
.post-detail {
  max-width: 720px;
  margin: 0 auto;
  padding: 24px;
}
.pd-loading, .pd-error {
  text-align: center;
  padding: 60px 0;
  color: var(--vp-c-text-2);
}
.pd-error { color: var(--vp-c-danger-1); }
.pd-title {
  font-size: 1.8rem;
  margin-bottom: 8px;
  line-height: 1.3;
}
.pd-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
}
.pd-tags {
  display: flex;
  gap: 6px;
}
.pd-tag {
  padding: 1px 10px;
  border-radius: 12px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  font-size: 0.8rem;
}
.pd-content {
  line-height: 1.8;
  font-size: 1.05rem;
}
.pd-content :deep(h1) { font-size: 1.6rem; margin: 24px 0 12px; }
.pd-content :deep(h2) { font-size: 1.3rem; margin: 20px 0 10px; padding-bottom: 6px; border-bottom: 1px solid var(--vp-c-divider); }
.pd-content :deep(h3) { font-size: 1.1rem; margin: 16px 0 8px; }
.pd-content :deep(p) { margin: 12px 0; }
.pd-content :deep(strong) { font-weight: 600; }
.pd-content :deep(code) { padding: 2px 6px; border-radius: 4px; background: var(--vp-c-bg-soft); font-size: 0.9em; }
.pd-content :deep(pre) { padding: 16px; border-radius: 8px; background: var(--vp-c-bg-soft); overflow-x: auto; margin: 12px 0; }
.pd-content :deep(pre code) { padding: 0; background: none; }
.pd-content :deep(blockquote) { margin: 12px 0; padding: 8px 16px; border-left: 3px solid var(--vp-c-brand-1); background: var(--vp-c-bg-soft); }
.pd-content :deep(li) { margin: 4px 0; }
.pd-content :deep(a) { color: var(--vp-c-brand-1); }
.pd-content :deep(img) { max-width: 100%; border-radius: 8px; margin: 12px 0; }
.pd-content :deep(video) { max-width: 100%; border-radius: 8px; margin: 12px 0; }
.pd-content :deep(iframe) { max-width: 100%; border-radius: 8px; margin: 12px 0; }
.pd-footer {
  margin-top: 48px;
  padding-top: 24px;
  border-top: 1px solid var(--vp-c-divider);
}
</style>

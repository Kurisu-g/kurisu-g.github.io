<script setup>
import { ref, onMounted } from 'vue'
import { initLeanCloud, AV } from '../utils/leancloud.js'

const props = defineProps({
  limit: { type: Number, default: 0 }
})

const posts = ref([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  initLeanCloud()
  try {
    const query = new AV.Query('Post')
    query.equalTo('status', 'published')
    query.descending('createdAt')
    if (props.limit > 0) query.limit(props.limit)
    const results = await query.find()
    posts.value = results.map(obj => ({
      id: obj.id,
      title: obj.get('title'),
      tags: obj.get('tags') || [],
      description: obj.get('description') || '',
      createdAt: obj.createdAt,
    }))
  } catch (e) {
    console.error('Failed to load posts:', e)
    error.value = '加载文章失败'
  }
  loading.value = false
})

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
}
</script>

<template>
  <div class="post-list">
    <div v-if="loading" class="pl-status">加载中...</div>
    <div v-else-if="error" class="pl-status pl-error">{{ error }}</div>
    <div v-else-if="posts.length === 0" class="pl-status">还没有文章，敬请期待！</div>
    <template v-else>
      <article v-for="post in posts" :key="post.id" class="post-card">
        <h2 class="post-title">
          <a :href="'/post?id=' + post.id">{{ post.title }}</a>
        </h2>
        <div class="post-meta">
          <time>{{ formatDate(post.createdAt) }}</time>
          <span class="tags" v-if="post.tags && post.tags.length">
            <span v-for="tag in post.tags" :key="tag" class="tag">{{ tag }}</span>
          </span>
        </div>
        <p v-if="post.description" class="post-excerpt">{{ post.description }}</p>
        <a :href="'/post?id=' + post.id" class="read-more">阅读全文 →</a>
      </article>
    </template>
  </div>
</template>

<style scoped>
.post-list {
  max-width: 680px;
  margin: 0 auto;
  padding: 0 24px;
}
.post-card {
  padding: 24px 0;
  border-bottom: 1px solid var(--vp-c-divider);
}
.post-card:last-child {
  border-bottom: none;
}
.post-title {
  margin: 0 0 8px;
  font-size: 1.25rem;
  line-height: 1.4;
}
.post-title a {
  color: var(--vp-c-text-1);
  text-decoration: none;
}
.post-title a:hover {
  color: var(--vp-c-brand-1);
}
.post-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}
.tags {
  display: flex;
  gap: 6px;
}
.tag {
  display: inline-block;
  padding: 1px 8px;
  border-radius: 12px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  font-size: 0.75rem;
}
.post-excerpt {
  margin: 0 0 8px;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.read-more {
  font-size: 0.875rem;
  color: var(--vp-c-brand-1);
  text-decoration: none;
}
.read-more:hover {
  text-decoration: underline;
}
.pl-status {
  text-align: center;
  padding: 48px 0;
  color: var(--vp-c-text-2);
}
.pl-error {
  color: var(--vp-c-danger-1);
}
</style>

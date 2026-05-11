<script setup>
import { ref, onMounted } from 'vue'
import { initLeanCloud, AV } from '../utils/leancloud.js'

const props = defineProps({
  postId: { type: String, required: true }
})

const views = ref(0)
const loaded = ref(false)

function getVisitorId() {
  let vid = localStorage.getItem('blog_visitor_id')
  if (!vid) {
    vid = crypto.randomUUID()
    localStorage.setItem('blog_visitor_id', vid)
  }
  return vid
}

onMounted(async () => {
  initLeanCloud()
  const vid = getVisitorId()
  try {
    // Record unique view per visitor per post
    const query = new AV.Query('PageView')
    query.equalTo('postId', props.postId)
    query.equalTo('visitorId', vid)
    const existing = await query.first()
    if (!existing) {
      const PageView = AV.Object.extend('PageView')
      const pv = new PageView()
      pv.set('postId', props.postId)
      pv.set('visitorId', vid)
      const acl = new AV.ACL()
      acl.setPublicReadAccess(true)
      acl.setPublicWriteAccess(true)
      pv.setACL(acl)
      await pv.save()
    }
    // Count total unique views
    const countQuery = new AV.Query('PageView')
    countQuery.equalTo('postId', props.postId)
    views.value = await countQuery.count()
  } catch (e) {
    console.error('View counter error:', e)
  }
  loaded.value = true
})
</script>

<template>
  <span v-if="loaded" class="view-counter">
    <svg class="view-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
    {{ views }} 次阅读
  </span>
</template>

<style scoped>
.view-counter {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--vp-c-text-3);
  font-size: 0.875rem;
}
.view-icon { flex-shrink: 0; }
</style>

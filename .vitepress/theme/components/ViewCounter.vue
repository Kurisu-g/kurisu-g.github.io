<script setup>
import { ref, onMounted } from 'vue'
import { initLeanCloud, AV } from '../utils/leancloud.js'

const props = defineProps({
  postId: { type: String, required: true }
})

const views = ref(0)
const loaded = ref(false)

onMounted(async () => {
  initLeanCloud()
  try {
    const query = new AV.Query('PageView')
    query.equalTo('postId', props.postId)
    let obj = await query.first()
    if (obj) {
      // 同一个 session 内不重复计数
      const viewed = sessionStorage.getItem('blog_viewed_' + props.postId)
      if (!viewed) {
        obj.increment('count', 1)
        const acl = new AV.ACL()
        acl.setPublicReadAccess(true)
        acl.setPublicWriteAccess(true)
        obj.setACL(acl)
        await obj.save(null, { fetchWhenSave: true })
        sessionStorage.setItem('blog_viewed_' + props.postId, '1')
      }
      views.value = obj.get('count')
    } else {
      const PageView = AV.Object.extend('PageView')
      obj = new PageView()
      obj.set('postId', props.postId)
      obj.set('count', 1)
      const acl = new AV.ACL()
      acl.setPublicReadAccess(true)
      acl.setPublicWriteAccess(true)
      obj.setACL(acl)
      await obj.save()
      sessionStorage.setItem('blog_viewed_' + props.postId, '1')
      views.value = 1
    }
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
.view-icon {
  flex-shrink: 0;
}
</style>

<script setup>
import { ref, onMounted } from 'vue'
import { initLeanCloud, AV } from '../utils/leancloud.js'

const props = defineProps({
  postId: { type: String, required: true }
})

const likes = ref(0)
const liked = ref(false)
const loading = ref(true)
const visitorId = ref('')

onMounted(async () => {
  initLeanCloud()
  let vid = localStorage.getItem('blog_visitor_id')
  if (!vid) {
    vid = crypto.randomUUID()
    localStorage.setItem('blog_visitor_id', vid)
  }
  visitorId.value = vid
  await loadLikes()
})

async function loadLikes() {
  try {
    const countQuery = new AV.Query('Like')
    countQuery.equalTo('postId', props.postId)
    likes.value = await countQuery.count()

    const userQuery = new AV.Query('Like')
    userQuery.equalTo('postId', props.postId)
    userQuery.equalTo('visitorId', visitorId.value)
    const existing = await userQuery.first()
    liked.value = !!existing
  } catch (e) {
    console.error('Like load error:', e)
  }
  loading.value = false
}

async function toggleLike() {
  if (loading.value) return
  try {
    if (liked.value) {
      await removeLike()
    } else {
      await addLike()
    }
  } catch (e) {
    console.error('Toggle like error:', e)
  }
}

async function addLike() {
  // Prevent duplicate: check again right before save
  const existQuery = new AV.Query('Like')
  existQuery.equalTo('postId', props.postId)
  existQuery.equalTo('visitorId', visitorId.value)
  const dup = await existQuery.first()
  if (dup) { liked.value = true; return }
  // Ensure a view record exists for this visitor
  const vQuery = new AV.Query('PageView')
  vQuery.equalTo('postId', props.postId)
  vQuery.equalTo('visitorId', visitorId.value)
  const existingView = await vQuery.first()
  if (!existingView) {
    const PageView = AV.Object.extend('PageView')
    const pv = new PageView()
    pv.set('postId', props.postId)
    pv.set('visitorId', visitorId.value)
    const acl = new AV.ACL()
    acl.setPublicReadAccess(true)
    acl.setPublicWriteAccess(true)
    pv.setACL(acl)
    await pv.save()
  }
  const Like = AV.Object.extend('Like')
  const like = new Like()
  like.set('postId', props.postId)
  like.set('visitorId', visitorId.value)
  const acl2 = new AV.ACL()
  acl2.setPublicReadAccess(true)
  acl2.setPublicWriteAccess(true)
  like.setACL(acl2)
  await like.save()
  liked.value = true
  likes.value++
}

async function removeLike() {
  const query = new AV.Query('Like')
  query.equalTo('postId', props.postId)
  query.equalTo('visitorId', visitorId.value)
  const obj = await query.first()
  if (obj) {
    await obj.destroy()
    liked.value = false
    likes.value--
  }
}
</script>

<template>
  <div class="like-button-wrap">
    <button
      class="like-button"
      :class="{ liked: liked }"
      :disabled="loading"
      @click="toggleLike"
      :title="liked ? '取消点赞' : '点赞这篇文章'"
    >
      <svg class="heart-icon" viewBox="0 0 24 24" :fill="liked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
      <span class="like-count">{{ loading ? '...' : likes }} 赞</span>
    </button>
  </div>
</template>

<style scoped>
.like-button-wrap {
  display: inline-flex;
  margin: 32px 0 8px;
}
.like-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 24px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
}
.like-button:hover:not(:disabled) {
  border-color: #e74c3c;
  color: #e74c3c;
}
.like-button.liked {
  border-color: #e74c3c;
  background: #fde8e8;
  color: #e74c3c;
}
.like-button:disabled {
  cursor: default;
}
.heart-icon {
  width: 20px;
  height: 20px;
  transition: transform 0.2s;
}
.like-button:hover:not(:disabled) .heart-icon {
  transform: scale(1.15);
}
</style>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { initLeanCloud, AV } from '../utils/leancloud.js'

const PASSWORD_HASH = '53d6668b995a4117d05d7799f6563672f4659d05f9f9fd45f961164de256b5d0' // SHA-256 of 0709

let loggedIn = ref(false)
let password = ref('')
let loginError = ref('')
let posts = ref([])
let editingId = ref('')
let title = ref('')
let content = ref('')
let tagsInput = ref('')
let description = ref('')
let saving = ref(false)
let uploading = ref(false)
let uploadMsg = ref('')
let message = ref('')
let loading = ref(true)
let showDeleteConfirm = ref('')
let textareaEl = ref(null)

async function sha256(str) {
  const buf = new TextEncoder().encode(str)
  const hash = await crypto.subtle.digest('SHA-256', buf)
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
}

async function doLogin() {
  loginError.value = ''
  const h = await sha256(password.value)
  if (h === PASSWORD_HASH) {
    loggedIn.value = true
    sessionStorage.setItem('blog_admin', '1')
    loadPosts()
  } else {
    loginError.value = '密码错误'
  }
  password.value = ''
}

function doLogout() {
  loggedIn.value = false
  sessionStorage.removeItem('blog_admin')
}

async function loadPosts() {
  loading.value = true
  try {
    const query = new AV.Query('Post')
    query.descending('createdAt')
    const results = await query.find()
    posts.value = results.map(obj => ({
      id: obj.id,
      title: obj.get('title'),
      content: obj.get('content'),
      tags: obj.get('tags') || [],
      description: obj.get('description') || '',
      status: obj.get('status') || 'published',
      createdAt: obj.createdAt,
    }))
  } catch (e) {
    console.error('Failed to load posts:', e)
  }
  loading.value = false
}

function newPost() {
  editingId.value = ''
  title.value = ''
  content.value = ''
  tagsInput.value = ''
  description.value = ''
  message.value = ''
}

function editPost(post) {
  editingId.value = post.id
  title.value = post.title
  content.value = post.content
  tagsInput.value = post.tags.join(', ')
  description.value = post.description
  message.value = ''
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function savePost() {
  if (!title.value.trim() || !content.value.trim()) {
    message.value = '标题和内容不能为空'
    return
  }
  saving.value = true
  message.value = ''
  try {
    const Post = AV.Object.extend('Post')
    const tags = tagsInput.value.split(',').map(t => t.trim()).filter(Boolean)
    if (editingId.value) {
      const obj = AV.Object.createWithoutData('Post', editingId.value)
      obj.set('title', title.value.trim())
      obj.set('content', content.value.trim())
      obj.set('tags', tags)
      obj.set('description', description.value.trim() || content.value.trim().slice(0, 150))
      const acl = new AV.ACL()
      acl.setPublicReadAccess(true)
      acl.setPublicWriteAccess(true)
      obj.setACL(acl)
      await obj.save()
      message.value = '文章已更新'
    } else {
      const obj = new Post()
      obj.set('title', title.value.trim())
      obj.set('content', content.value.trim())
      obj.set('tags', tags)
      obj.set('description', description.value.trim() || content.value.trim().slice(0, 150))
      obj.set('status', 'published')
      const acl = new AV.ACL()
      acl.setPublicReadAccess(true)
      acl.setPublicWriteAccess(true)
      obj.setACL(acl)
      await obj.save()
      message.value = '文章已发布'
    }
    await loadPosts()
    newPost()
  } catch (e) {
    console.error('Failed to save post:', e)
    message.value = '保存失败：' + (e.message || e.code || JSON.stringify(e))
  }
  saving.value = false
}

function triggerUpload(type) {
  const input = document.createElement('input')
  input.type = 'file'
  if (type === 'image') {
    input.accept = 'image/jpeg,image/png,image/gif,image/webp,image/svg+xml'
  } else {
    input.accept = 'video/mp4,video/webm,video/ogg'
  }
  input.onchange = (e) => {
    const file = e.target.files[0]
    if (file) uploadFile(file, type)
  }
  input.click()
}

async function uploadFile(file, type) {
  uploading.value = true
  uploadMsg.value = '上传中...'
  try {
    const avFile = new AV.File(file.name, file)
    await avFile.save()
    const url = avFile.url()
    uploadMsg.value = '上传成功！已插入'
    insertAtCursor(type === 'image' ? `![${file.name}](${url})` : `<video src="${url}" controls></video>`)
    setTimeout(() => { uploadMsg.value = '' }, 2000)
  } catch (e) {
    console.error('Upload failed:', e)
    uploadMsg.value = '上传失败：' + (e.message || e.code || '未知错误')
  }
  uploading.value = false
}

function insertAtCursor(text) {
  const ta = document.querySelector('.form-textarea')
  if (!ta) { content.value += '\n' + text; return }
  const start = ta.selectionStart
  const end = ta.selectionEnd
  content.value = content.value.substring(0, start) + text + content.value.substring(end)
  setTimeout(() => {
    ta.focus()
    ta.setSelectionRange(start + text.length, start + text.length)
  }, 50)
}

async function deletePost(id) {
  try {
    const obj = AV.Object.createWithoutData('Post', id)
    await obj.destroy()
    await loadPosts()
    showDeleteConfirm.value = ''
    message.value = '文章已删除'
  } catch (e) {
    console.error('Failed to delete post:', e)
    message.value = '删除失败：' + (e.message || e.code || '未知错误')
  }
}

onMounted(async () => {
  initLeanCloud()
  if (sessionStorage.getItem('blog_admin') === '1') {
    loggedIn.value = true
    await loadPosts()
    loading.value = false
  } else {
    loading.value = false
  }
})
</script>

<template>
  <div class="admin-panel">
    <!-- Login -->
    <div v-if="!loggedIn" class="login-box">
      <h2>管理登录</h2>
      <input
        v-model="password"
        type="password"
        placeholder="请输入密码"
        class="login-input"
        @keyup.enter="doLogin"
      />
      <button class="login-btn" @click="doLogin">登录</button>
      <p v-if="loginError" class="login-error">{{ loginError }}</p>
    </div>

    <!-- Admin -->
    <div v-else>
      <div class="admin-header">
        <h2>文章管理</h2>
        <button class="logout-btn" @click="doLogout">退出</button>
      </div>

      <h3>{{ editingId ? '编辑文章' : '写新文章' }}</h3>

      <div v-if="message" class="msg">{{ message }}</div>

      <div class="form-group">
        <label>标题</label>
        <input v-model="title" type="text" placeholder="文章标题" class="form-input" />
      </div>
      <div class="form-group">
        <label>标签（逗号分隔）</label>
        <input v-model="tagsInput" type="text" placeholder="如：JavaScript, 教程, 前端" class="form-input" />
      </div>
      <div class="form-group">
        <label>简介</label>
        <input v-model="description" type="text" placeholder="简短描述（不填则取正文前150字）" class="form-input" />
      </div>
      <div class="form-group">
        <label>正文（Markdown 格式）</label>
        <div class="editor-toolbar">
          <button class="upload-btn" :disabled="uploading" @click="triggerUpload('image')" title="上传图片">
            🖼 插入图片
          </button>
          <button class="upload-btn" :disabled="uploading" @click="triggerUpload('video')" title="上传视频">
            🎬 插入视频
          </button>
          <span v-if="uploadMsg" class="upload-msg">{{ uploadMsg }}</span>
        </div>
        <textarea ref="textareaEl" v-model="content" rows="16" placeholder="这里写文章内容，支持 Markdown 格式..." class="form-textarea"></textarea>
      </div>
      <div class="form-actions">
        <button class="save-btn" :disabled="saving" @click="savePost">
          {{ saving ? '保存中...' : (editingId ? '更新文章' : '发布文章') }}
        </button>
        <button v-if="editingId" class="cancel-btn" @click="newPost">取消编辑</button>
      </div>

      <hr />

      <h3>已发布文章（{{ posts.length }}）</h3>
      <div v-if="loading" class="loading-text">加载中...</div>
      <table v-else-if="posts.length > 0" class="post-table">
        <thead>
          <tr>
            <th>标题</th>
            <th>标签</th>
            <th>日期</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="post in posts" :key="post.id">
            <td class="td-title">{{ post.title }}</td>
            <td class="td-tags">
              <span v-for="tag in post.tags" :key="tag" class="tag-sm">{{ tag }}</span>
            </td>
            <td class="td-date">{{ new Date(post.createdAt).toLocaleDateString('zh-CN') }}</td>
            <td class="td-actions">
              <button class="edit-btn" @click="editPost(post)">编辑</button>
              <button class="del-btn" @click="showDeleteConfirm = post.id">删除</button>
              <span v-if="showDeleteConfirm === post.id" class="delete-confirm">
                确定？
                <button class="del-yes" @click="deletePost(post.id)">是</button>
                <button class="del-no" @click="showDeleteConfirm = ''">否</button>
              </span>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else class="no-posts">还没有文章，写第一篇文章吧！</p>
    </div>
  </div>
</template>

<style scoped>
.admin-panel {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
}
.login-box {
  max-width: 360px;
  margin: 60px auto;
  text-align: center;
}
.login-input {
  display: block;
  width: 100%;
  padding: 10px 14px;
  margin: 12px 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-size: 1rem;
  font-family: inherit;
  box-sizing: border-box;
}
.login-input:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
}
.login-btn {
  padding: 10px 40px;
  border: none;
  border-radius: 6px;
  background: var(--vp-c-brand-1);
  color: #fff;
  font-size: 1rem;
  cursor: pointer;
}
.login-btn:hover {
  background: var(--vp-c-brand-2);
}
.login-error {
  color: var(--vp-c-danger-1);
  margin-top: 8px;
}
.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.logout-btn {
  padding: 4px 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  background: transparent;
  color: var(--vp-c-text-2);
  cursor: pointer;
  font-size: 0.85rem;
}
.msg {
  padding: 8px 14px;
  margin-bottom: 12px;
  border-radius: 6px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  font-size: 0.9rem;
}
.form-group {
  margin-bottom: 14px;
}
.form-group label {
  display: block;
  margin-bottom: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--vp-c-text-1);
}
.form-input,
.form-textarea {
  display: block;
  width: 100%;
  padding: 9px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-size: 0.9rem;
  font-family: inherit;
  box-sizing: border-box;
}
.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
}
.form-textarea {
  resize: vertical;
  line-height: 1.6;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.85rem;
}
.form-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}
.save-btn {
  padding: 8px 24px;
  border: none;
  border-radius: 6px;
  background: var(--vp-c-brand-1);
  color: #fff;
  cursor: pointer;
  font-size: 0.95rem;
}
.save-btn:hover:not(:disabled) {
  background: var(--vp-c-brand-2);
}
.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.cancel-btn {
  padding: 8px 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: transparent;
  color: var(--vp-c-text-2);
  cursor: pointer;
  font-size: 0.9rem;
}
hr {
  margin: 28px 0;
  border: none;
  border-top: 1px solid var(--vp-c-divider);
}
.post-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}
.post-table th {
  text-align: left;
  padding: 8px 10px;
  border-bottom: 2px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
  font-weight: 500;
}
.post-table td {
  padding: 10px;
  border-bottom: 1px solid var(--vp-c-divider);
}
.td-title {
  font-weight: 500;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.td-tags {
  max-width: 150px;
}
.tag-sm {
  display: inline-block;
  padding: 0 6px;
  margin: 1px;
  border-radius: 10px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  font-size: 0.75rem;
}
.edit-btn, .del-btn {
  padding: 3px 10px;
  margin-right: 4px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  font-size: 0.8rem;
}
.edit-btn { color: var(--vp-c-brand-1); }
.del-btn { color: var(--vp-c-danger-1); }
.delete-confirm {
  font-size: 0.8rem;
  margin-left: 4px;
  white-space: nowrap;
}
.del-yes, .del-no {
  padding: 1px 6px;
  margin-left: 2px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 0.75rem;
}
.del-yes { background: var(--vp-c-danger-1); color: #fff; }
.del-no { background: var(--vp-c-divider); color: var(--vp-c-text-2); }
.loading-text, .no-posts {
  text-align: center;
  padding: 30px 0;
  color: var(--vp-c-text-2);
}
</style>

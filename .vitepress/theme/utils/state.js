import { ref } from 'vue'

export const isAdmin = ref(false)

export function checkAdmin() {
  isAdmin.value = sessionStorage.getItem('blog_admin') === '1'
}

export function setAdmin(val) {
  isAdmin.value = val
  if (val) {
    sessionStorage.setItem('blog_admin', '1')
  } else {
    sessionStorage.removeItem('blog_admin')
  }
}

import DefaultTheme from 'vitepress/theme'
import './style.css'
import PostList from './components/PostList.vue'
import PostDetail from './components/PostDetail.vue'
import AdminPanel from './components/AdminPanel.vue'
import CommentList from './components/CommentList.vue'
import LikeButton from './components/LikeButton.vue'
import ViewCounter from './components/ViewCounter.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('PostList', PostList)
    app.component('PostDetail', PostDetail)
    app.component('CommentList', CommentList)
    app.component('AdminPanel', AdminPanel)
    app.component('LikeButton', LikeButton)
    app.component('ViewCounter', ViewCounter)
  }
}

# 关于我

<script setup>
</script>

<div class="about-page">

<div class="header">
  <div class="avatar-wrap">
    <div class="avatar">K</div>
    <div class="status-dot"></div>
  </div>
  <div class="header-text">
    <h1 class="name">Kurisu</h1>
    <div class="handle">@Kurisu-g · GitHub</div>
    <div class="tagline">
      电气工程在读，平时捣鼓<em>嵌入式硬件</em>和<em>PCB 设计</em>。<br>
      这个博客记录我踩的坑、学到的东西，偶尔也写些乱七八糟的想法。
    </div>
  </div>
</div>

<hr class="divider">

<div class="section-title">// 最近在搞什么</div>
<div class="now-grid">
  <div class="now-card">
    <div class="label">硬件项目</div>
    <div class="value">CH32H417 智能手表</div>
  </div>
  <div class="now-card">
    <div class="label">竞赛准备</div>
    <div class="value">成图大赛 · 电子类</div>
  </div>
  <div class="now-card">
    <div class="label">工具链</div>
    <div class="value accent">嘉立创 EDA Pro</div>
  </div>
  <div class="now-card">
    <div class="label">课余</div>
    <div class="value">健身 · 喝黑咖啡</div>
  </div>
</div>

<hr class="divider">

<div class="section-title">// 我会写什么</div>
<div class="writing-list">
  <div class="writing-item">
    <span class="writing-emoji">🔧</span>
    <span class="writing-text">嵌入式 & 硬件设计的踩坑笔记</span>
    <span class="writing-tag">主线</span>
  </div>
  <div class="writing-item">
    <span class="writing-emoji">⚡</span>
    <span class="writing-text">PCB 布线、DRC 报错那些事</span>
    <span class="writing-tag">主线</span>
  </div>
  <div class="writing-item">
    <span class="writing-emoji">💡</span>
    <span class="writing-text">偶尔发现的好工具和奇技淫巧</span>
    <span class="writing-tag">不定期</span>
  </div>
  <div class="writing-item">
    <span class="writing-emoji">✏️</span>
    <span class="writing-text">随便写写，没什么主题</span>
    <span class="writing-tag">心情</span>
  </div>
</div>

<hr class="divider">

<div class="section-title">// 联系我</div>
<div class="contact-row">
  <a class="contact-btn" href="https://github.com/Kurisu-g" target="_blank">
    GitHub · Kurisu-g
  </a>
  <a class="contact-btn" href="mailto:1261843659@qq.com">
    邮箱 · 1261843659@qq.com
  </a>
</div>

<div class="footnote">欢迎来聊，不咬人。<span class="blink">_</span></div>

</div>

<style scoped>
.about-page {
  max-width: 680px;
  margin: 0 auto;
  padding: 2rem 1rem 3rem;
  font-family: var(--vp-font-family-base);
}
.header {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  margin-bottom: 2rem;
}
.avatar-wrap {
  position: relative;
  flex-shrink: 0;
}
.avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1D9E75, #378ADD);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 600;
  color: #fff;
  font-family: 'JetBrains Mono', monospace;
}
.status-dot {
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #1D9E75;
  border: 2.5px solid var(--vp-c-bg);
}
.name {
  font-size: 26px !important;
  font-weight: 600 !important;
  border: none !important;
  margin: 0 0 4px !important;
  padding: 0 !important;
  letter-spacing: -0.3px;
}
.handle {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  color: var(--vp-c-text-2);
}
.tagline {
  margin-top: 10px;
  font-size: 15px;
  color: var(--vp-c-text-2);
  line-height: 1.7;
}
.tagline em {
  font-style: normal;
  color: #1D9E75;
  font-weight: 500;
}
.divider {
  border: none;
  border-top: 1px solid var(--vp-c-divider);
  margin: 1.8rem 0;
}
.section-title {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--vp-c-text-3);
  margin-bottom: 1rem;
}
.now-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.now-card {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 0.75rem 1rem;
}
.now-card .label {
  font-size: 11px;
  font-family: 'JetBrains Mono', monospace;
  color: var(--vp-c-text-3);
  margin-bottom: 4px;
}
.now-card .value {
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-1);
}
.now-card .value.accent { color: #378ADD; }
.writing-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.writing-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0.65rem 0.9rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  transition: background 0.15s;
}
.writing-item:hover { background: var(--vp-c-bg-soft); }
.writing-emoji { font-size: 16px; flex-shrink: 0; }
.writing-text { font-size: 14px; color: var(--vp-c-text-1); }
.writing-tag {
  margin-left: auto;
  font-size: 11px;
  font-family: 'JetBrains Mono', monospace;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  padding: 2px 8px;
  border-radius: 20px;
  flex-shrink: 0;
}
.contact-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.contact-btn {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  font-size: 13px;
  font-family: 'JetBrains Mono', monospace;
  color: var(--vp-c-text-1) !important;
  text-decoration: none !important;
  transition: background 0.12s, border-color 0.12s;
}
.contact-btn:hover {
  background: var(--vp-c-bg-soft);
  border-color: var(--vp-c-brand-1);
}
.footnote {
  margin-top: 2.5rem;
  font-size: 12px;
  font-family: 'JetBrains Mono', monospace;
  color: var(--vp-c-text-3);
}
.blink { animation: blink 1.2s step-end infinite; }
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
@media (max-width: 480px) {
  .header { flex-direction: column; }
  .now-grid { grid-template-columns: 1fr; }
  .contact-row { flex-direction: column; }
}
</style>

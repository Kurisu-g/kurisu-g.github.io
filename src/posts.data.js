import { createContentLoader } from 'vitepress'

export default createContentLoader('posts/*.md', {
  excerpt: true,
  transform(raw) {
    return raw
      .filter(p => {
        const slug = p.url.replace('/posts/', '').replace(/\.html?$/, '')
        return slug && slug !== 'index' && !slug.startsWith('_')
      })
      .map(p => ({
        slug: p.url.replace('/posts/', '').replace(/\.html?$/, ''),
        title: p.frontmatter.title || p.url,
        date: p.frontmatter.date || '',
        tags: p.frontmatter.tags || [],
        description: p.frontmatter.description || p.excerpt || '',
        url: p.url.replace(/\.html?$/, ''),
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  }
})

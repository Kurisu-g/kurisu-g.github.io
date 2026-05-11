export async function onRequestPost(context) {
  const { request, env } = context
  try {
    const body = await request.json()
    const { commentId, postId, reason, commentAuthor, commentText } = body

    if (!commentId || !reason) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const adminEmail = env.ADMIN_EMAIL || '1261843659@qq.com'

    // Try Brevo first (free, no domain setup needed)
    if (env.BREVO_API_KEY) {
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': env.BREVO_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sender: { email: 'noreply@kurisu-blog.pages.dev', name: '博客举报' },
          to: [{ email: adminEmail }],
          subject: `[博客举报] ${reason}`,
          textContent: [
            `评论者: ${commentAuthor}`,
            `评论内容: ${commentText}`,
            `举报理由: ${reason}`,
            '',
            `处理: https://kurisu-blog.pages.dev/admin`
          ].join('\n')
        })
      })
      console.log('Brevo status:', res.status, await res.text().catch(() => ''))
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

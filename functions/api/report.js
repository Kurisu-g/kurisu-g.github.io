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
    const apiUser = env.SC_API_USER
    const apiKey = env.SC_API_KEY

    if (apiUser && apiKey) {
      const text = [
        `评论者: ${commentAuthor}`,
        `评论内容: ${commentText}`,
        `举报理由: ${reason}`,
        `处理: https://kurisu-blog.pages.dev/admin`,
      ].join('\n')

      const form = new URLSearchParams({
        apiUser,
        apiKey,
        from: 'blog@kurisu-blog.pages.dev',
        fromName: '博客举报通知',
        to: adminEmail,
        subject: `[博客举报] ${reason}`,
        plain: text,
      })

      await fetch('https://api.sendcloud.net/apiv2/mail/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form.toString(),
      })
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

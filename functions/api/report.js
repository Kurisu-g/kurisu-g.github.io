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

    // Use MailChannels (free for Cloudflare, no API key needed)
    const mcReq = {
      personalizations: [{ to: [{ email: adminEmail }] }],
      from: { email: 'noreply@kurisu-blog.pages.dev', name: '博客举报通知' },
      subject: `[博客举报] ${reason}`,
      content: [{
        type: 'text/plain',
        value: [
          `新举报通知`,
          ``,
          `评论者: ${commentAuthor}`,
          `评论内容: ${commentText}`,
          `举报理由: ${reason}`,
          `评论ID: ${commentId}`,
          `文章ID: ${postId}`,
          ``,
          `处理: https://kurisu-blog.pages.dev/admin`,
        ].join('\n')
      }]
    }

    const resp = await fetch('https://api.mailchannels.net/tx/v1/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mcReq)
    })

    const mcResult = await resp.text()
    const emailSent = resp.ok

    return new Response(JSON.stringify({ success: true, emailSent, mcStatus: resp.status, mcResult }), {
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

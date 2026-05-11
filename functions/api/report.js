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

    const emailBody = `
新举报通知

评论ID: ${commentId}
文章ID: ${postId}
评论者: ${commentAuthor}
评论内容: ${commentText}
举报理由: ${reason}

请登录管理后台处理: https://kurisu-blog.pages.dev/admin
    `.trim()

    let emailSent = false
    if (env.RESEND_API_KEY) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'blog-report@kurisu-blog.pages.dev',
            to: adminEmail,
            subject: `[博客举报] ${reason}`,
            text: emailBody
          })
        })
        emailSent = res.ok
      } catch (e) {
        console.error('Email send failed:', e)
      }
    }

    return new Response(JSON.stringify({ success: true, emailSent }), {
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

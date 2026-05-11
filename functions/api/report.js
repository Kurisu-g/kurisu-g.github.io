export async function onRequestPost(context) {
  const { request } = context
  try {
    const body = await request.json()
    const { commentId, postId, reason, commentAuthor, commentText } = body

    if (!commentId || !reason) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const text = [
      `评论者: ${commentAuthor}`,
      `评论内容: ${commentText}`,
      `举报理由: ${reason}`,
      `处理: https://kurisu-blog.pages.dev/admin`,
    ].join('\n')

    const form = new URLSearchParams({
      apiUser: 'sc_gfqvlc_test_IGWHva',
      apiKey: '12a1eb6cff112641a2acf7d46aa1333c',
      from: 'blog@sendcloud.org',
      fromName: '博客举报通知',
      to: '1261843659@qq.com',
      subject: `[博客举报] ${reason}`,
      plain: text,
    })

    await fetch('https://api.sendcloud.net/apiv2/mail/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    })

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

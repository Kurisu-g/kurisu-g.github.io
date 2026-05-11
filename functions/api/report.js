export async function onRequestPost(context) {
  const { request } = context
  try {
    const body = await request.json()
    const { commentId, postId, reason, commentAuthor, commentText } = body

    if (!commentId || !reason) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      })
    }

    const desp = [
      `评论者: ${commentAuthor}`,
      `评论内容: ${commentText}`,
      `举报理由: ${reason}`,
      `处理: https://kurisu-blog.pages.dev/admin`,
    ].join('\n\n')

    const res = await fetch(`https://sctapi.ftqq.com/SCT348321TcWBDwFXQEZ1RpDvQFpZQZIYX.send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: `[博客举报] ${reason}`, desp }),
    })
    const scResult = await res.text()

    return new Response(JSON.stringify({ success: true, scStatus: res.status, scResult }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    })
  }
}

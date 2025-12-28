export async function onRequest(context) {
  const { searchParams } = new URL(context.request.url);
  const username = searchParams.get('user');
  if (!username) return new Response("Missing user", { status: 400 });

  // قائمة بروكسيات احتياطية (يمكنك إضافة المزيد هنا)
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://kick.com/api/v1/channels/${username}`)}`;

  try {
    // المحاولة الأولى: جلب مباشر عبر Cloudflare (القوي)
    let response = await fetch(`https://kick.com/api/v1/channels/${username}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/119.0.0.0 Safari/537.36' }
    });

    // المحاولة الثانية: إذا تم حظره (403) أو فشل، نستخدم البروكسي الاحتياطي
    if (!response.ok) {
      response = await fetch(proxyUrl);
      const proxyData = await response.json();
      return new Response(proxyData.contents, {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }

    const data = await response.text();
    return new Response(data, {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });

  } catch (e) {
    return new Response(JSON.stringify({ error: "Failed to fetch status" }), { status: 500 });
  }
}


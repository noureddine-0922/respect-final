export async function onRequest(context) {
  const { searchParams } = new URL(context.request.url);
  const username = searchParams.get('user');
  if (!username) return new Response("Missing user", { status: 400 });

  try {
    // إضافة رقم عشوائي للرابط لمنع الكاش (Cache Busting)
    const url = `https://kick.com/api/v1/channels/${username}?t=${Date.now()}`;
    
    const res = await fetch(url, {
      headers: { 
        'User-Agent': 'Mozilla/5.0',
        'Cache-Control': 'no-cache' 
      }
    });
    const data = await res.text();
    return new Response(data, {
      headers: { 
        "Content-Type": "application/json", 
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store, no-cache, must-revalidate" 
      }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}


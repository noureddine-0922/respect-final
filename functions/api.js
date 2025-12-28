export async function onRequest(context) {
  const { searchParams } = new URL(context.request.url);
  const username = searchParams.get('user');
  
  if (!username) return new Response("Missing username", { status: 400 });

  const url = `https://kick.com/api/v1/channels/${username}`;
  
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36' }
    });
    const data = await response.text();
    return new Response(data, {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}


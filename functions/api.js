export async function onRequest(context) {
  const { searchParams } = new URL(context.request.url);
  const username = searchParams.get('user');

  // التأكد من وجود اسم المستخدم في الطلب
  if (!username) {
    return new Response(JSON.stringify({ error: "اسم المستخدم مفقود" }), {
      status: 400,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }

  try {
    // إضافة رقم عشوائي (Timestamp) لإجبار كيك وكلاود فلير على إعطائنا بيانات جديدة فوراً
    const cacheBuster = Date.now();
    const targetUrl = `https://kick.com/api/v1/channels/${username}?t=${cacheBuster}`;

    // تنفيذ الطلب باستخدام رأس متصفح (User-Agent) حديث لتجنب المنع
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });

    // جلب محتوى الاستجابة
    const data = await response.text();

    // إرسال البيانات للموقع مع السماح بمرورها عبر الـ CORS
    return new Response(data, {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // مهم جداً للسماح للموقع بقراءة البيانات
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      }
    });

  } catch (error) {
    // في حال حدوث خطأ في الاتصال بالسيرفر
    return new Response(JSON.stringify({ 
      error: "فشل الاتصال بـ Kick عبر Cloudflare",
      details: error.message 
    }), {
      status: 500,
      headers: { 
        "Content-Type": "application/json", 
        "Access-Control-Allow-Origin": "*" 
      }
    });
  }
}


const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    // 1. استلام اسم المستخدم وتجهيزه
    let { username } = event.queryStringParameters;
    
    if (!username) {
        return {
            statusCode: 400,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ isLive: false, viewers: 0, error: "Missing username" })
        };
    }

    // تنظيف الاسم (حذف المسافات وتحويله لأحرف صغيرة)
    username = username.trim().toLowerCase();

    try {
        // 2. الاتصال برابط API الرسمي لـ Kick
        // هذا الرابط يعطي بيانات دقيقة 100% (JSON)
        const url = `https://kick.com/api/v1/channels/${username}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                // هيدر يوهم الموقع أننا متصفح حقيقي لتجنب الحظر
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "application/json",
                "Accept-Language": "en-US,en;q=0.9",
                "Cache-Control": "no-cache"
            }
        });

        // 3. التحقق من حالة الاتصال
        if (response.status === 404) {
            return {
                statusCode: 200,
                headers: { "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({ isLive: false, viewers: 0, error: "User not found" })
            };
        }

        if (!response.ok) {
            throw new Error(`Kick API Error: ${response.status}`);
        }

        // 4. استخراج البيانات
        const data = await response.json();

        // 5. تحليل البيانات (livestream يكون null إذا كان أوفلاين)
        const isLive = data.livestream !== null;
        let viewers = 0;

        if (isLive && data.livestream) {
            viewers = data.livestream.viewer_count || 0;
        }

        // 6. إرجاع النتيجة للموقع
        return {
            statusCode: 200,
            headers: { 
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*" // للسماح للموقع بقراءة البيانات
            },
            body: JSON.stringify({ isLive, viewers })
        };

    } catch (error) {
        console.log("Error checking streamer:", error.message);
        return {
            statusCode: 200, // نرجع 200 عشان ما يعلق الموقع، بس نقول إنه أوفلاين
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ isLive: false, viewers: 0, debug_error: error.message })
        };
    }
};


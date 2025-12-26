const axios = require('axios');

exports.handler = async function(event, context) {
    // نأخذ اسم المستخدم من الرابط
    const { username } = event.queryStringParameters;

    if (!username) {
        return { statusCode: 400, body: "Username required" };
    }

    // إعدادات التمويه (كأننا تطبيق آيفون)
    const config = {
        headers: {
            'User-Agent': 'Kick/29.0.0 (iPhone; iOS 16.6.1; Scale/3.00)',
            'Accept': 'application/json',
            'Connection': 'keep-alive'
        },
        timeout: 5000 // مهلة 5 ثواني
    };

    try {
        // استخدام V1 API لأنه الأسرع والأكثر استقراراً مع الدوال
        const url = `https://kick.com/api/v1/channels/${username}`;
        const response = await axios.get(url, config);
        
        const data = response.data;
        let isLive = false;
        let viewers = 0;

        // تحليل البيانات
        if (data && data.livestream && data.livestream.is_live) {
            isLive = true;
            viewers = data.livestream.viewer_count;
        }

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*", // السماح للموقع بقراءة البيانات
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ isLive, viewers })
        };

    } catch (error) {
        // في حالة الخطأ (مثل 404 القناة غير موجودة)، نعتبره أوفلاين
        return {
            statusCode: 200, // نرجع 200 عشان الموقع ما يعلق
            body: JSON.stringify({ isLive: false, viewers: 0 })
        };
    }
};


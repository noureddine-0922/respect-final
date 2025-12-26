const axios = require('axios');

exports.handler = async function(event, context) {
    const { username } = event.queryStringParameters;

    if (!username) {
        return { statusCode: 400, body: "Username required" };
    }

    // رؤوس مخادعة
    const config = {
        headers: {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
            'Accept': 'application/json',
            'Connection': 'keep-alive'
        }
    };

    try {
        // 🔥 السر هنا: نستخدم رابط البحث بدلاً من رابط القناة
        // رابط البحث نادراً ما يُحظر
        const url = `https://kick.com/api/search/channel?q=${username}`;
        
        const response = await axios.get(url, config);
        const data = response.data;
        
        let isLive = false;
        let viewers = 0;

        // البحث يعيد قائمة، نبحث عن الشخص الصحيح فيها
        if (data && Array.isArray(data)) {
            const target = data.find(u => u.slug.toLowerCase() === username.toLowerCase());
            
            if (target && target.livestream && target.livestream.is_live) {
                isLive = true;
                viewers = target.livestream.viewer_count;
            }
        }

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ isLive, viewers })
        };

    } catch (error) {
        console.log("Error:", error.message);
        return {
            statusCode: 200,
            body: JSON.stringify({ isLive: false, viewers: 0 })
        };
    }
};


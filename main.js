// استيراد مكتبات Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔴🔴 ألصق كود الـ Firebase Config حقك هنا (نفس اللي في الأدمن) 🔴🔴
const firebaseConfig = {
    apiKey: "AIzaSyBjEc-wdY6s6v0AiVg4texFrohLwDcdaiU",
    authDomain: "respect-db-d1320.firebaseapp.com",
    projectId: "respect-db-d1320", 
    storageBucket: "respect-db-d1320.firebasestorage.app",
    messagingSenderId: "823436634480",
    appId: "1:823436634480:web:3380974cce87d8e82b07b5"
};
// 🔴🔴 نهاية منطقة اللصق 🔴🔴

// تهيئة Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// دالة لجلب الستريمرز من قاعدة البيانات
async function fetchStreamers() {
    const container = document.getElementById('Streamer-grid'); // تأكد أن هذا هو اسم الـ ID في ملف html
    
    // إظهار علامة تحميل
    container.innerHTML = '<div style="color:white; text-align:center;">جاري جلب الستريمرز من السيرفر... 📡</div>';

    try {
        const querySnapshot = await getDocs(collection(db, "streamers"));
        const streamers = [];

        querySnapshot.forEach((doc) => {
            streamers.push(doc.data());
        });

        if (streamers.length === 0) {
            container.innerHTML = '<div style="color:white; text-align:center;">لا يوجد ستريمرز حالياً 🤷‍♂️</div>';
            return;
        }

        // بدء فحص الحالة
        checkStatus(streamers);

    } catch (error) {
        console.error("Error getting documents: ", error);
        container.innerHTML = '<div style="color:red; text-align:center;">حدث خطأ في الاتصال بقاعدة البيانات!</div>';
    }
}

// الدالة الرئيسية لفحص حالة البث (نفس المنطق القديم مع تعديلات بسيطة)
async function checkStatus(streamersList) {
    const container = document.getElementById('cards-container');
    container.innerHTML = ''; // تنظيف الحاوية لبدء الرسم

    // ترتيب القائمة (الأولوية لليوزر اللي عنده لايكات أو ترتيب معين - اختياري)
    // حالياً بنعرضهم زي ما هم

    for (const streamer of streamersList) {
        // إنشاء بطاقة الستريمر (HTML)
        const card = document.createElement('div');
        card.className = 'card'; // تأكد أن كلاس CSS اسمه card
        card.id = `card-${streamer.username}`;
        
        // القالب المبدئي (Offline)
        card.innerHTML = `
            <div class="status offline">OFFLINE</div>
            <img src="${streamer.image}" alt="${streamer.name}" class="pfp">
            <div class="info">
                <h3>${streamer.name}</h3>
                <p>${streamer.icName}</p>
                <span class="category-badge">${streamer.category}</span>
            </div>
            <a href="https://kick.com/${streamer.username}" target="_blank" class="watch-btn">صفحة القناة</a>
        `;
        
        container.appendChild(card);

        // فحص البث الحقيقي (API)
        checkLiveStatus(streamer.username, card);
    }
}

// دالة فحص الـ API (كل 30 ثانية تتحدث)
async function checkLiveStatus(username, cardElement) {
    try {
        // استخدام بروكسي لتجاوز مشاكل CORS (يمكنك تغييره إذا عندك بروكسي خاص)
        const response = await fetch(`https://kick.com/api/v1/channels/${username}`);
        const data = await response.json();

        if (data && data.livestream) {
            // الستريمر أونلاين 🔥
            const statusDiv = cardElement.querySelector('.status');
            statusDiv.className = 'status online';
            statusDiv.innerText = 'LIVE 🔥';
            
            cardElement.classList.add('is-live'); // كلاس إضافي للتأثيرات
            
            // تحديث الزر للمشاهدة المباشرة
            const btn = cardElement.querySelector('.watch-btn');
            btn.innerText = "تابع البث الآن 🔴";
            btn.style.background = "#53fc18";
            btn.style.color = "black";
        }
    } catch (e) {
        console.log(`Error checking ${username}:`, e);
    }
}

// تشغيل الكود عند فتح الصفحة
fetchStreamers();

// تحديث تلقائي كل دقيقة
setInterval(fetchStreamers, 60000);


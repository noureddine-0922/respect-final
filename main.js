import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBjEc-wdY6s6v0AiVg4texFrohLwDcdaiU",
    authDomain: "respect-db-d1320.firebaseapp.com",
    projectId: "respect-db-d1320",
    storageBucket: "respect-db-d1320.firebasestorage.app",
    messagingSenderId: "823436634480",
    appId: "1:823436634480:web:3380974cce87d8e82b07b5"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
let allStreamers = [];

// وظيفة جلب الحالة (معدلة لتكون أسرع ما يمكن)
async function fetchStatus(streamer) {
    try {
        // إضافة t=Date.now تمنع الكاش نهائياً
        const response = await fetch(`/api?user=${streamer.username}&t=${Date.now()}`);
        const data = await response.json();
        
        const status = {
            isLive: data.livestream?.is_live === true,
            viewers: data.livestream?.viewer_count || 0,
            pfp: data.user?.profile_pic || null
        };

        const idx = allStreamers.findIndex(s => s.username === streamer.username);
        if (idx !== -1) {
            allStreamers[idx] = { ...allStreamers[idx], ...status };
            // تحديث الواجهة فوراً بمجرد وصول بيانات هذا الستريمر
            refreshUI();
        }
    } catch (e) {
        console.error("Fetch Error:", streamer.username);
    }
}

async function loadData() {
    try {
        // إذا كانت القائمة فارغة (أول مرة)، نجلبها من Firebase
        if (allStreamers.length === 0) {
            const snap = await getDocs(collection(db, "streamers"));
            allStreamers = snap.docs.map(doc => ({ id: doc.id, ...doc.data(), isLive: false, viewers: 0 }));
            refreshUI(); // عرض البطاقات فوراً
        }

        // إطلاق جميع الطلبات "بالتوازي" فوراً
        // Promise.all تجعل الطلبات تنطلق معاً كطلقة واحدة
        await Promise.all(allStreamers.map(s => fetchStatus(s)));
        
    } catch (err) {
        console.error("Load Error:", err);
    }
}

function refreshUI() {
    // ترتيب ذكي: البث المباشر في الأعلى دائماً
    allStreamers.sort((a, b) => (b.isLive - a.isLive) || (b.viewers - a.viewers));
    renderCards(allStreamers);
    
    // تحديث الأرقام في الهيدر
    const live = allStreamers.filter(s => s.isLive);
    document.getElementById('total-streamers').innerText = allStreamers.length;
    document.getElementById('live-count').innerText = live.length;
    document.getElementById('total-viewers').innerText = live.reduce((a, b) => a + b.viewers, 0);
}

function renderCards(list) {
    const container = document.getElementById('streamers-container');
    if (!container) return;
    container.innerHTML = list.map(s => `
        <div class="card ${s.isLive ? 'border-live' : ''}">
            <div class="status-tag ${s.isLive ? 'bg-live' : 'bg-off'}">
                ${s.isLive ? `<span class="pulse-dot"></span> مباشر | ${s.viewers}` : 'غير متصل'}
            </div>
            <img src="${s.pfp || s.image || 'https://via.placeholder.com/150'}" class="pfp">
            <h3>${s.name}</h3>
            <p><i class="fa-solid fa-id-card"></i> ${s.icName || 'بدون اسم'}</p>
            <a href="https://kick.com/${s.username}" target="_blank" class="kick-link">مشاهدة</a>
        </div>
    `).join('');
}

// تشغيل النظام: جلب فوري ثم تحديث كل 20 ثانية
loadData(); 
setInterval(loadData, 20000); 


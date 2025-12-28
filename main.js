import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// إعدادات Firebase
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

// جلب حالة البث عبر البروكسي الداخلي لكلاود فلير
async function getKickStatus(username) {
    try {
        // نطلب المسار الداخلي /api الذي يمر عبر سيرفرات Cloudflare
        const response = await fetch(`/api?user=${username}`);
        if (!response.ok) throw new Error('Proxy error');
        const data = await response.json();
        
        return {
            isLive: data.livestream !== null,
            viewers: data.livestream ? data.livestream.viewer_count : 0,
            pfp: data.user ? data.user.profile_pic : null
        };
    } catch (e) {
        console.error("Error fetching status for:", username, e);
        return { isLive: false, viewers: 0, pfp: null };
    }
}

async function loadData() {
    const container = document.getElementById('streamers-container');
    try {
        const querySnapshot = await getDocs(collection(db, "streamers"));
        const rawData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // جلب الحالات بالتوازي لسرعة فائقة
        allStreamers = await Promise.all(rawData.map(async (s) => {
            const status = await getKickStatus(s.username);
            return { ...s, ...status };
        }));

        // الترتيب: المباشر أولاً، ثم حسب عدد المشاهدين
        allStreamers.sort((a, b) => {
            if (a.isLive === b.isLive) return b.viewers - a.viewers;
            return b.isLive - a.isLive;
        });

        updateStats();
        renderStreamers(allStreamers);
    } catch (error) {
        console.error("Critical Error:", error);
        container.innerHTML = `<p style="color:red; text-align:center; grid-column:1/-1;">خطأ في تحميل البيانات.</p>`;
    }
}

function updateStats() {
    document.getElementById('total-streamers').innerText = allStreamers.length;
    document.getElementById('live-count').innerText = allStreamers.filter(s => s.isLive).length;
    document.getElementById('total-viewers').innerText = allStreamers.reduce((acc, s) => acc + s.viewers, 0);
}

function renderStreamers(list) {
    const container = document.getElementById('streamers-container');
    container.innerHTML = '';

    if (list.length === 0) {
        container.innerHTML = '<p style="color:#888; text-align:center; grid-column:1/-1; padding:50px;">لا توجد نتائج.</p>';
        return;
    }

    list.forEach(s => {
        const card = document.createElement('div');
        card.className = `card ${s.isLive ? 'border-live' : ''}`;
        card.innerHTML = `
            <div class="status-tag ${s.isLive ? 'bg-live' : 'bg-off'}">
                ${s.isLive ? `<i class="fa-solid fa-tower-broadcast"></i> مباشر | ${s.viewers}` : 'غير متصل'}
            </div>
            <img src="${s.pfp || s.image || 'https://via.placeholder.com/150'}" class="pfp">
            <h3>${s.name}</h3>
            <p><i class="fa-solid fa-id-card"></i> ${s.icName || '---'}</p>
            <a href="https://kick.com/${s.username}" target="_blank" class="kick-link">
                ${s.isLive ? 'مشاهدة الآن' : 'انتقال للقناة'}
            </a>
        `;
        container.appendChild(card);
    });
}

// نظام البحث والفلترة
document.getElementById('searchInput')?.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    renderStreamers(allStreamers.filter(s => 
        s.name.toLowerCase().includes(term) || (s.icName && s.icName.toLowerCase().includes(term))
    ));
});

window.appFilter = (category) => {
    const filtered = (category === 'all') ? allStreamers : allStreamers.filter(s => s.category === category);
    renderStreamers(filtered);
};

// تشغيل التطبيق
loadData();


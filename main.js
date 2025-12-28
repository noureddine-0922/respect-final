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

// دالة جلب حالة البث من Kick (مع استخدام بروكزي لتجنب CORS)
async function getKickStatus(username) {
    try {
        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent('https://kick.com/api/v1/channels/' + username)}`);
        const json = await response.json();
        const data = JSON.parse(json.contents);
        
        return {
            isLive: data.livestream !== null,
            viewers: data.livestream ? data.livestream.viewer_count : 0,
            thumbnail: data.livestream ? data.livestream.thumbnail.url : null,
            pfp: data.user.profile_pic
        };
    } catch (e) {
        console.error("Error fetching Kick status for:", username);
        return { isLive: false, viewers: 0, thumbnail: null, pfp: null };
    }
}

// دالة جلب البيانات الأساسية من Firebase وتحديث الحالات
async function loadData() {
    const container = document.getElementById('streamers-container');
    try {
        const querySnapshot = await getDocs(collection(db, "streamers"));
        const rawData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // جلب حالة البث لكل ستريمر بالتوازي لتسريع العملية
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
        console.error("Error loading data:", error);
        container.innerHTML = `<p style="color:red; text-align:center; grid-column:1/-1;">حدث خطأ أثناء جلب البيانات.</p>`;
    }
}

// تحديث عداد الإحصائيات في الهيدر
function updateStats() {
    const total = allStreamers.length;
    const live = allStreamers.filter(s => s.isLive).length;
    const viewers = allStreamers.reduce((acc, s) => acc + s.viewers, 0);

    document.getElementById('total-streamers').innerText = total;
    document.getElementById('live-count').innerText = live;
    document.getElementById('total-viewers').innerText = viewers;
}

// دالة عرض البطاقات (3 في كل صف كما هو محدد في CSS)
function renderStreamers(list) {
    const container = document.getElementById('streamers-container');
    container.innerHTML = '';

    if (list.length === 0) {
        container.innerHTML = '<p style="color:#888; text-align:center; grid-column:1/-1; padding:50px;">لا توجد نتائج مطابقة.</p>';
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
            <div class="info">
                <h3>${s.name}</h3>
                <p><i class="fa-solid fa-id-card"></i> ${s.icName || '---'}</p>
            </div>
            <a href="https://kick.com/${s.username}" target="_blank" class="kick-link">
                ${s.isLive ? 'مشاهدة الآن' : 'انتقال للقناة'}
            </a>
        `;
        container.appendChild(card);
    });
}

// نظام البحث
document.getElementById('searchInput')?.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = allStreamers.filter(s => 
        s.name.toLowerCase().includes(term) || 
        (s.icName && s.icName.toLowerCase().includes(term))
    );
    renderStreamers(filtered);
});

// نظام الفلترة (مربوط بالنافذة ليراه index.html)
window.appFilter = (category) => {
    if (category === 'all') {
        renderStreamers(allStreamers);
    } else {
        const filtered = allStreamers.filter(s => s.category === category);
        renderStreamers(filtered);
    }
};

// تشغيل التطبيق
loadData();


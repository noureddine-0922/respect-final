import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// إعدادات Firebase الخاصة بمشروع ريسبكت
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
let refreshSeconds = 30; // توقيت التحديث التلقائي

/**
 * جلب حالة الستريمر مع إضافة t= لمنع الكاش وضمان الحالة اللحظية
 */
async function getKickStatus(username) {
    try {
        // إضافة Date.now() تجبر السيرفر على جلب بيانات جديدة دائماً
        const response = await fetch(`/api?user=${username}&t=${Date.now()}`);
        if (!response.ok) throw new Error('Network error');
        const data = await response.json();
        
        return {
            // التحقق الدقيق: يجب أن يكون livestream موجوداً وحالته is_live حقيقية
            isLive: data.livestream !== null && data.livestream.is_live === true,
            viewers: data.livestream ? data.livestream.viewer_count : 0,
            pfp: data.user ? data.user.profile_pic : null
        };
    } catch (e) {
        console.error("Error fetching Kick status:", e);
        return { isLive: false, viewers: 0, pfp: null };
    }
}

/**
 * جلب البيانات من Firebase وتحديث العرض
 */
async function loadData() {
    try {
        const querySnapshot = await getDocs(collection(db, "streamers"));
        const rawData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        allStreamers = await Promise.all(rawData.map(async (s) => {
            const status = await getKickStatus(s.username);
            return { ...s, ...status };
        }));

        // الترتيب: البث المباشر أولاً
        allStreamers.sort((a, b) => (b.isLive - a.isLive) || (b.viewers - a.viewers));

        updateStats();
        renderStreamers(allStreamers);
    } catch (error) {
        console.error("Error loading data:", error);
    }
}

function updateStats() {
    document.getElementById('total-streamers').innerText = allStreamers.length;
    document.getElementById('live-count').innerText = allStreamers.filter(s => s.isLive).length;
    document.getElementById('total-viewers').innerText = allStreamers.reduce((acc, s) => acc + s.viewers, 0);
}

function renderStreamers(list) {
    const container = document.getElementById('streamers-container');
    if (!container) return;
    
    container.innerHTML = list.map(s => `
        <div class="card ${s.isLive ? 'border-live' : ''}">
            <div class="status-tag ${s.isLive ? 'bg-live' : 'bg-off'}">
                ${s.isLive ? `<span class="pulse-dot"></span> مباشر | ${s.viewers}` : 'غير متصل'}
            </div>
            <img src="${s.pfp || s.image || 'https://via.placeholder.com/150'}" class="pfp">
            <div class="info">
                <h3>${s.name}</h3>
                <p><i class="fa-solid fa-id-card"></i> ${s.icName || 'بدون اسم'}</p>
            </div>
            <a href="https://kick.com/${s.username}" target="_blank" class="kick-link">مشاهدة</a>
        </div>
    `).join('');
}

function startCountdown() {
    const timerElement = document.getElementById('refresh-clock');
    setInterval(() => {
        refreshSeconds--;
        if (timerElement) timerElement.innerText = refreshSeconds;
        
        if (refreshSeconds <= 0) {
            refreshSeconds = 30;
            loadData(); // تحديث البيانات تلقائياً
        }
    }, 1000);
}

document.getElementById('searchInput')?.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = allStreamers.filter(s => 
        s.name.toLowerCase().includes(term) || (s.icName && s.icName.toLowerCase().includes(term))
    );
    renderStreamers(filtered);
});

window.appFilter = (category) => {
    renderStreamers(category === 'all' ? allStreamers : allStreamers.filter(s => s.category === category));
};

loadData();
startCountdown();


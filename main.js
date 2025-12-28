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
let timer = 15;

async function getKickStatus(username) {
    try {
        const res = await fetch(`/api?user=${username}&t=${Date.now()}`);
        const data = await res.json();
        return {
            live: data.livestream?.is_live || false,
            viewers: data.livestream?.viewer_count || 0,
            pfp: data.user?.profile_pic || null,
            title: data.livestream?.session_title || "لا يوجد عنوان"
        };
    } catch { return null; }
}

async function syncAll() {
    if (allStreamers.length === 0) {
        const snap = await getDocs(collection(db, "streamers"));
        allStreamers = snap.docs.map(doc => ({ ...doc.data(), live: false, viewers: 0 }));
        render();
    }

    // جلب البيانات على دفعات (4 في كل مرة) لمنع التخبط
    const list = [...allStreamers];
    for (let i = 0; i < list.length; i += 4) {
        const batch = list.slice(i, i + 4);
        await Promise.all(batch.map(async (s) => {
            const result = await getKickStatus(s.username);
            if (result) {
                const idx = allStreamers.findIndex(x => x.username === s.username);
                allStreamers[idx] = { ...allStreamers[idx], ...result };
                render(); // تحديث الواجهة فوراً
            }
        }));
    }
}

function render(filterList = null) {
    const container = document.getElementById('streamers-container');
    const displayList = filterList || allStreamers;
    
    // الترتيب: لايف أولاً ثم عدد المشاهدين
    displayList.sort((a,b) => (b.live - a.live) || (b.viewers - a.viewers));

    container.innerHTML = displayList.map(s => `
        <div class="card ${s.live ? 'is-live' : 'is-off'}">
            <div class="status-tag">${s.live ? `<i class="fa-solid fa-circle"></i> مباشر` : 'أوفلاين'}</div>
            <div class="pfp-box">
                <img src="${s.pfp || s.image}" alt="${s.name}">
                ${s.live ? `<div class="viewers-count"><i class="fa-solid fa-eye"></i> ${s.viewers}</div>` : ''}
            </div>
            <div class="info">
                <h3>${s.name}</h3>
                <p class="stream-title">${s.live ? s.title : (s.icName || 'مواطن')}</p>
            </div>
            <a href="https://kick.com/${s.username}" target="_blank" class="watch-link">مشاهدة القناة</a>
        </div>
    `).join('');

    updateStats();
}

function updateStats() {
    const live = allStreamers.filter(s => s.live);
    document.getElementById('total-streamers').innerText = allStreamers.length;
    document.getElementById('live-count').innerText = live.length;
    document.getElementById('total-viewers').innerText = live.reduce((a,b) => a + b.viewers, 0);
}

window.runFilter = (cat) => {
    if(cat === 'all') render();
    else render(allStreamers.filter(s => s.category === cat));
};

setInterval(() => {
    timer--;
    document.getElementById('refresh-clock').innerText = timer;
    document.getElementById('progress-fill').style.width = `${(timer/15)*100}%`;
    if(timer <= 0) { timer = 15; syncAll(); }
}, 1000);

syncAll();


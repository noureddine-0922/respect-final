import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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
const container = document.getElementById('streamers-container');

const categoryNames = {
    'police': '<i class="fa-solid fa-handcuffs"></i> الشرطة',
    'ems': '<i class="fa-solid fa-truck-medical"></i> الإسعاف',
    'justice': '<i class="fa-solid fa-scale-balanced"></i> العدل',
    'criminal': '<i class="fa-solid fa-user-ninja"></i> مجرم',
    'obeid': 'عائلة عبيد',
    'plus': 'عصابة البلس',
    'brazil': 'البرازيليين',
    'east': 'عصابة الشرق',
    'west': 'عصابة الغرب',
    'middle': 'Middle Gang',
    'nwa': 'N.W.A',
    'crypto': 'Crypto',
    'yakuza': 'الياكوزا',
    'oldschool': 'Old School'
};

async function checkMaintenance() {
    try {
        const mDoc = await getDoc(doc(db, "settings", "config"));
        if (mDoc.exists() && mDoc.data().maintenance === true) {
            document.body.innerHTML = `<div style="display:flex;flex-direction:column;justify-content:center;align-items:center;height:100vh;background:#0d1117;color:white;text-align:center;font-family:'Cairo'"><i class="fa-solid fa-screwdriver-wrench" style="font-size:4rem;color:#00ff88;margin-bottom:20px;"></i><h1>الموقع تحت الصيانة</h1></div>`;
            return true;
        }
    } catch (e) { console.log("Maint check skipped"); }
    return false;
}

function renderStreamers(list) {
    if(!container) return;
    container.innerHTML = '';
    if (list.length === 0) {
        container.innerHTML = '<p style="color:#888;text-align:center;grid-column:1/-1;padding:50px;">لا توجد بيانات حالياً.</p>';
        return;
    }
    list.forEach(s => {
        const catLabel = categoryNames[s.category] || s.category;
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="flip-wrapper">
                <div class="card-inner">
                    <div class="card-front">
                        <div class="status-badge offline">OFFLINE</div>
                        <img src="${s.image || ''}" class="pfp" onerror="this.src='https://via.placeholder.com/150'">
                        <div class="info">
                            <h3>${s.name}</h3>
                            <p><i class="fa-solid fa-id-card"></i> ${s.icName || '---'}</p>
                            <span class="category-tag">${catLabel}</span>
                        </div>
                    </div>
                    <div class="card-back">
                        <h3>${s.name}</h3>
                        <a href="https://kick.com/${s.username}" target="_blank" class="watch-btn">مشاهدة</a>
                    </div>
                </div>
            </div>`;
        container.appendChild(card);
    });
}

async function startApp() {
    const isM = await checkMaintenance();
    if (isM) return;
    try {
        const snap = await getDocs(collection(db, "streamers"));
        allStreamers = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        renderStreamers(allStreamers);
    } catch (e) { console.error(e); }
}

// ربط الفلترة بالنافذة العامة
window.appFilter = (category) => {
    const filtered = (category === 'all') ? allStreamers : allStreamers.filter(s => s.category === category);
    renderStreamers(filtered);
};

// نظام البحث
document.getElementById('searchInput')?.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = allStreamers.filter(s => s.name.toLowerCase().includes(term) || (s.icName && s.icName.toLowerCase().includes(term)));
    renderStreamers(filtered);
});

startApp();


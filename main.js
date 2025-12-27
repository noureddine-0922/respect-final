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

// ==========================================
// 1. نظام الحماية (Anti-Inspector) 🛡️🚫
// ==========================================
document.addEventListener('contextmenu', event => event.preventDefault()); // منع الزر الأيمن

document.onkeydown = function(e) {
    // F12
    if(e.keyCode == 123) { return false; }
    
    // Ctrl+Shift+I (فتح المطور)
    if(e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)) { return false; }
    
    // Ctrl+Shift+J (فتح الكونسول)
    if(e.ctrlKey && e.shiftKey && e.keyCode == 'J'.charCodeAt(0)) { return false; }
    
    // Ctrl+U (عرض المصدر)
    if(e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)) { return false; }
}

// ==========================================
// 2. منطق الموقع الأساسي
// ==========================================

let allStreamers = [];
let currentCategoryFilter = 'all';
let currentStatusFilter = 'all';

const categoryNames = {
    'police': '<i class="fa-solid fa-handcuffs"></i> الشرطة',
    'ems': '<i class="fa-solid fa-truck-medical"></i> الإسعاف',
    'justice': '<i class="fa-solid fa-scale-balanced"></i> العدل',
    's.ops': '<i class="fa-solid fa-mask"></i> قوات خاصة',
    'citizen': '<i class="fa-solid fa-user"></i> مواطن',
    'obeid': 'عائلة عبيد', 'plus': 'عصابة البلس', 'brazil': 'البرازيليين',
    'east': 'عصابة الشرق', 'west': 'عصابة الغرب', 'middle': 'Middle Gang',
    'nwa': 'N.W.A', 'crypto': 'Crypto', 'yakuza': 'الياكوزا', 'oldschool': 'Old School'
};

const maintenanceLogo = "https://cdn.discordapp.com/attachments/1436149485167185940/1454355201539702905/logo.png?ex=6950c954&is=694f77d4&hm=6f5fd0f1197cc84ffc9d2e18f97efba791ef75b01f7da85a79702ae22778b0b8&";

async function checkMaintenance() {
    try {
        const docSnap = await getDoc(doc(db, "settings", "config"));
        if (docSnap.exists() && docSnap.data().maintenance === true) {
            document.body.innerHTML = `
                <div style="display:flex; flex-direction:column; justify-content:center; align-items:center; height:100vh; background:#0b0e11; color:white; text-align:center; padding:20px;">
                    <img src="${maintenanceLogo}" alt="Logo" style="width:120px; margin-bottom:30px; border-radius:50%; box-shadow: 0 0 25px rgba(0, 255, 136, 0.2);">
                    <i class="fa-solid fa-triangle-exclamation" style="font-size:4rem; color:#ffcc00; margin-bottom:20px;"></i>
                    <h1 style="font-size:2.5rem; margin-bottom:15px; font-family:'Cairo', sans-serif;">الموقع تحت الصيانة</h1>
                    <p style="font-size:1.2rem; color:#ccc; margin-bottom:30px; max-width:500px; line-height:1.6; font-family:'Cairo', sans-serif;">
                        نعمل حالياً على تحسين وتطوير السيرفر لتقديم تجربة أفضل.
                        <br>يرجى متابعة صفحتنا لمعرفة موعد الافتتاح.
                    </p>
                    <a href="https://x.com/streamsrespect" target="_blank" style="text-decoration:none; background: linear-gradient(45deg, #1da1f2, #0d8bd9); color:white; padding:15px 35px; border-radius:30px; font-size:1.1rem; font-weight:bold; display:inline-flex; align-items:center; gap:10px; transition: transform 0.2s ease; box-shadow: 0 5px 15px rgba(29, 161, 242, 0.3); font-family:'Cairo', sans-serif;">
                        <i class="fa-brands fa-x-twitter" style="font-size:1.5rem;"></i> تابعنا على تويتر
                    </a>
                </div>
            `;
            const btn = document.querySelector('a[href*="x.com"]');
            if(btn){
                btn.onmouseover = () => btn.style.transform = 'translateY(-3px)';
                btn.onmouseout = () => btn.style.transform = 'translateY(0)';
            }
            return true;
        }
    } catch(e) {}
    return false;
}

window.checkModal = () => {
    const lastSeen = localStorage.getItem('lastSeenModal');
    const now = new Date().getTime();
    if (!lastSeen || now - lastSeen > 24 * 60 * 60 * 1000) {
        const m = document.getElementById('welcomeModal'); if(m) m.classList.add('show');
    }
}
window.closeModal = () => {
    const m = document.getElementById('welcomeModal'); if(m) m.classList.remove('show');
    localStorage.setItem('lastSeenModal', new Date().getTime());
}

async function fetchStreamers() {
    const isMaint = await checkMaintenance();
    if(isMaint) return;
    window.checkModal();

    const container = document.getElementById('Streamer-grid');
    try {
        const querySnapshot = await getDocs(collection(db, "streamers"));
        allStreamers = []; 
        querySnapshot.forEach((doc) => {
            allStreamers.push({ id: doc.id, ...doc.data(), isLive: false, viewers: 0 });
        });
        const totalEl = document.getElementById('totalStreamers');
        if(totalEl) totalEl.innerText = allStreamers.length;
        if (allStreamers.length === 0) { container.innerHTML = '<div class="no-results">لا يوجد ستريمرز حالياً</div>'; return; }
        applyFilters();
    } catch (error) { container.innerHTML = '<div class="no-results">خطأ في الاتصال</div>'; }
}

function renderStreamers(list) {
    const container = document.getElementById('Streamer-grid');
    container.innerHTML = ''; 
    if(list.length === 0) { container.innerHTML = '<div class="no-results">لا توجد نتائج</div>'; return; }

    list.forEach(streamer => {
        const catDisplay = categoryNames[streamer.category] || streamer.category;
        const card = document.createElement('div');
        card.className = 'card'; card.id = `card-${streamer.username}`;
        card.innerHTML = `
            <div class="flip-wrapper">
                <div class="card-inner">
                    <div class="card-front">
                        <div class="status-badge offline"><i class="fa-solid fa-power-off"></i> غير متصل</div>
                        <img src="${streamer.image}" alt="${streamer.name}" class="pfp">
                        <div class="info"><h3>${streamer.name}</h3><p>${streamer.icName}</p></div>
                    </div>
                    <div class="card-back">
                        <div class="back-category">${catDisplay}</div>
                        <div class="back-viewers"><span class="viewer-count">0</span> <i class="fa-solid fa-eye"></i></div>
                    </div>
                </div>
            </div>
            <a href="https://kick.com/${streamer.username}" target="_blank" class="watch-btn"><i class="fa-brands fa-kickstarter"></i> صفحة القناة</a>
        `;
        container.appendChild(card);
        checkLiveStatus(streamer.username, card);
    });
}

async function checkLiveStatus(username, cardElement) {
    try {
        const response = await fetch(`https://kick.com/api/v1/channels/${username}`);
        const data = await response.json();
        const index = allStreamers.findIndex(s => s.username === username);

        if (data && data.livestream) {
            if(index > -1) { allStreamers[index].isLive = true; allStreamers[index].viewers = data.livestream.viewer_count; }
            const cardFront = cardElement.querySelector('.card-front');
            const cardBack = cardElement.querySelector('.card-back');
            const btn = cardElement.querySelector('.watch-btn');
            
            cardFront.classList.add('is-live');
            const badge = cardFront.querySelector('.status-badge');
            if(badge) { badge.className = 'status-badge online'; badge.innerHTML = '<i class="fa-solid fa-fire fire-anim"></i> بث مباشر'; }
            if(cardBack) cardBack.querySelector('.viewer-count').innerText = data.livestream.viewer_count;
            if(btn) { btn.innerHTML = 'تابع البث الآن 🔴'; btn.classList.add('is-live-btn'); }
            
            const grid = document.getElementById('Streamer-grid');
            if(grid) grid.prepend(cardElement);
        }
        updateGlobalStats(); 
    } catch (e) {}
}

function updateGlobalStats() {
    const liveCount = allStreamers.filter(s => s.isLive).length;
    const totalViewers = allStreamers.reduce((sum, s) => sum + (s.viewers || 0), 0);
    const lEl = document.getElementById('liveNow'); const vEl = document.getElementById('totalViewersCount');
    if(lEl) lEl.innerText = liveCount; if(vEl) vEl.innerText = totalViewers;
}

window.filterData = (cat) => {
    document.querySelectorAll('.sidebar .filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    currentCategoryFilter = cat; applyFilters();
}
window.filterStatus = (status) => {
    document.querySelectorAll('.status-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    currentStatusFilter = status; applyFilters();
}

function applyFilters() {
    let filteredList = allStreamers;
    if (currentCategoryFilter !== 'all') filteredList = filteredList.filter(s => s.category === currentCategoryFilter);
    if (currentStatusFilter === 'live') filteredList = filteredList.filter(s => s.isLive);
    else if (currentStatusFilter === 'offline') filteredList = filteredList.filter(s => !s.isLive);
    const searchVal = document.getElementById('searchInput').value.toLowerCase();
    if(searchVal) {
        filteredList = filteredList.filter(s => 
            s.name.toLowerCase().includes(searchVal) || 
            s.icName.toLowerCase().includes(searchVal) ||
            (categoryNames[s.category] && categoryNames[s.category].toLowerCase().includes(searchVal))
        );
    }
    renderStreamers(filteredList);
}

const sInput = document.getElementById('searchInput');
if(sInput) sInput.addEventListener('keyup', applyFilters);
fetchStreamers();
setInterval(fetchStreamers, 60000);


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

async function sync() {
    if(allStreamers.length === 0) {
        const snap = await getDocs(collection(db, "streamers"));
        allStreamers = snap.docs.map(d => ({...d.data(), live: false, viewers: 0}));
        render();
    }

    for (let i = 0; i < allStreamers.length; i += 4) {
        const batch = allStreamers.slice(i, i + 4);
        await Promise.all(batch.map(async (s) => {
            try {
                const r = await fetch(`/api?user=${s.username}&t=${Date.now()}`);
                const d = await r.json();
                const idx = allStreamers.findIndex(x => x.username === s.username);
                allStreamers[idx] = {
                    ...allStreamers[idx],
                    live: d.livestream?.is_live || false,
                    viewers: d.livestream?.viewer_count || 0,
                    title: d.livestream?.session_title || "بث مباشر",
                    pfp: d.user?.profile_pic || s.image
                };
                render();
            } catch(e){}
        }));
    }
}

function render(filter = null) {
    const list = filter || allStreamers;
    list.sort((a,b) => (b.live - a.live) || (b.viewers - a.viewers));
    document.getElementById('streamers-container').innerHTML = list.map(s => `
        <div class="card ${s.live ? 'live-on' : 'live-off'}">
            <div class="badge">${s.live ? '🔴 مباشر' : 'غير متصل'}</div>
            <div class="pfp-wrap">
                <img src="${s.pfp || s.image}">
                ${s.live ? `<div class="v-count"><i class="fa-solid fa-eye"></i> ${s.viewers}</div>` : ''}
            </div>
            <h3>${s.name}</h3>
            <p class="s-title">${s.live ? s.title : (s.icName || 'مواطن')}</p>
            <a href="https://kick.com/${s.username}" target="_blank" class="go-btn">دخول القناة</a>
        </div>
    `).join('');
    
    const l = allStreamers.filter(x=>x.live);
    document.getElementById('total-streamers').innerText = allStreamers.length;
    document.getElementById('live-count').innerText = l.length;
    document.getElementById('total-viewers').innerText = l.reduce((a,b)=>a+b.viewers,0).toLocaleString();
}

window.runFilter = (c) => render(c === 'all' ? null : allStreamers.filter(x=>x.category === c));
setInterval(sync, 15000);
sync();


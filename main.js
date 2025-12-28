import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// إعدادات Firebase الخاصة بمشروعك (Respect DB)
const firebaseConfig = {
    apiKey: "AIzaSyBjEc-wdY6s6v0AiVg4texFrohLwDcdaiU",
    authDomain: "respect-db-d1320.firebaseapp.com",
    projectId: "respect-db-d1320",
    storageBucket: "respect-db-d1320.firebasestorage.app",
    messagingSenderId: "823436634480",
    appId: "1:823436634480:web:3380974cce87d8e82b07b5"
};

// تهيئة التطبيق وقاعدة البيانات
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// المتغيرات العالمية لحفظ البيانات والتحكم في العرض
let allStreamers = [];
const container = document.getElementById('streamers-container');

// قاموس الفئات (تأكد من مطابقتها لما في Firestore)
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

// 1. وظيفة التحقق من وضع الصيانة
async function checkMaintenance() {
    try {
        const configDoc = await getDoc(doc(db, "settings", "config"));
        if (configDoc.exists() && configDoc.data().maintenance === true) {
            document.body.innerHTML = `
                <div style="display:flex; flex-direction:column; justify-content:center; align-items:center; height:100vh; background:#0d1117; color:white; text-align:center; font-family:'Cairo'">
                    <i class="fa-solid fa-screwdriver-wrench" style="font-size:4rem; color:#00ff88; margin-bottom:20px;"></i>
                    <h1>الموقع تحت الصيانة حالياً</h1>
                    <p style="margin-top:10px; color:#888;">نعمل على تحسين تجربتكم، سنعود قريباً!</p>
                </div>
            `;
            return true;
        }
    } catch (e) { console.error("Maintenance Check Error:", e); }
    return false;
}

// 2. وظيفة جلب البيانات وعرضها
async function fetchStreamers() {
    const isMaintenance = await checkMaintenance();
    if (isMaintenance) return;

    try {
        const querySnapshot = await getDocs(collection(db, "streamers"));
        allStreamers = [];
        querySnapshot.forEach((doc) => {
            allStreamers.push({ id: doc.id, ...doc.data() });
        });
        renderStreamers(allStreamers);
    } catch (error) {
        console.error("Error fetching streamers:", error);
        container.innerHTML = `<p style="color:red; text-align:center; grid-column:1/-1;">خطأ في الاتصال بقاعدة البيانات. تأكد من إعدادات Firebase.</p>`;
    }
}

// 3. وظيفة رسم البطاقات في الـ HTML
function renderStreamers(list) {
    container.innerHTML = ''; // مسح رسالة التحميل

    if (list.length === 0) {
        container.innerHTML = '<p style="color:#888; text-align:center; grid-column:1/-1; padding:50px;">لا يوجد ستريمرز مضافين حالياً أو لا يوجد نتائج بحث..</p>';
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
                        <img src="${s.image || 'https://via.placeholder.com/150'}" class="pfp">
                        <div class="info">
                            <h3>${s.name}</h3>
                            <p class="ic-name"><i class="fa-solid fa-id-card"></i> ${s.icName || 'غير معروف'}</p>
                            <span class="category-tag">${catLabel}</span>
                        </div>
                    </div>
                    <div class="card-back">
                        <h3>${s.name}</h3>
                        <p style="margin:15px 0;">هل تريد مشاهدة البث؟</p>
                        <a href="https://kick.com/${s.username}" target="_blank" class="watch-btn">
                            <i class="fa-solid fa-play"></i> انتقال للبث
                        </a>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// 4. نظام الفلترة (مربوط مع نافذة window ليراه ملف index.html)
window.appFilter = (category) => {
    if (category === 'all') {
        renderStreamers(allStreamers);
    } else {
        const filtered = allStreamers.filter(s => s.category === category);
        renderStreamers(filtered);
    }
};

// 5. نظام البحث (مربوط بحقل الإدخال)
document.getElementById('searchInput')?.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = allStreamers.filter(s => 
        s.name.toLowerCase().includes(term) || 
        (s.icName && s.icName.toLowerCase().includes(term))
    );
    renderStreamers(filtered);
});

// بدء التشغيل
fetchStreamers();


import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import { getFirestore, collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";



// إعدادات الفايربيس (نفس الموجودة في admin.js)

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



// المتغيرات العامة

let allStreamers = [];

const container = document.getElementById('streamers-container');



// أسماء الفئات والأيقونات (محدثة)

const categoryNames = {

'police': '<i class="fa-solid fa-handcuffs"></i> الشرطة',

'ems': '<i class="fa-solid fa-truck-medical"></i> الإسعاف',

'justice': '<i class="fa-solid fa-scale-balanced"></i> العدل',

'criminal': '<i class="fa-solid fa-user-ninja"></i> مجرم', // التحديث الجديد



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



// 1. التحقق من وضع الصيانة أولاً

async function checkMaintenance() {

try {

const docSnap = await getDoc(doc(db, "settings", "config"));

if (docSnap.exists() && docSnap.data().maintenance === true) {

document.body.innerHTML = `

<div style="display:flex; flex-direction:column; justify-content:center; align-items:center; height:100vh; background:#0d1117; color:white; text-align:center;">

<i class="fa-solid fa-screwdriver-wrench" style="font-size:4rem; color:#ffcc00; margin-bottom:20px;"></i>

<h1 style="font-family:'Cairo'">الموقع تحت الصيانة</h1>

<p>نعمل على تحسينات جديدة، سنعود قريباً!</p>

</div>

`;

return true; // الموقع مغلق

}

} catch(e) { console.error("Maintenance check failed", e); }

return false; // الموقع مفتوح

}



// 2. جلب البيانات من الفايربيس

async function fetchStreamers() {

// إذا كان الموقع في صيانة نوقف التحميل

const isMaintenance = await checkMaintenance();

if(isMaintenance) return;



try {

const querySnapshot = await getDocs(collection(db, "streamers"));

allStreamers = [];

querySnapshot.forEach((doc) => {

allStreamers.push({ id: doc.id, ...doc.data() });

});

renderStreamers(allStreamers);

} catch (error) {

console.error("Error fetching data:", error);

container.innerHTML = '<p style="color:white; text-align:center;">حدث خطأ في تحميل البيانات.</p>';

}

}



// 3. عرض الكروت (Render)

async function renderStreamers(list) {

container.innerHTML = '';



if (list.length === 0) {

container.innerHTML = '<p style="color:#888; text-align:center; grid-column:1/-1;">لا يوجد ستريمرز في هذه الفئة حالياً.</p>';

return;

}



for (const streamer of list) {

// إنشاء الكرت

const card = document.createElement('div');

card.className = 'card';



// التحقق من البث (Kick API)

let isLive = false;

// ملاحظة: الـ API المباشر قد يواجه مشاكل CORS من المتصفح، هذا كود تجريبي

// في حال الفشل سيظهر كـ أوفلاين

try {

const res = await fetch(`https://kick.com/api/v1/channels/${streamer.username}`);

if(res.ok) {

const data = await res.json();

isLive = data.livestream !== null;

}

} catch(e) { /* تجاهل الخطأ وافتراض الأوفلاين */ }



const statusClass = isLive ? 'online' : 'offline';

const statusText = isLive ? 'LIVE' : 'OFFLINE';

const catName = categoryNames[streamer.category] || streamer.category;



card.innerHTML = `

<div class="flip-wrapper">

<div class="card-inner">

<div class="card-front">

<div class="status-badge ${statusClass}">

<i class="fa-solid fa-circle"></i> ${statusText}

</div>

<img src="${streamer.image}" alt="${streamer.name}" class="pfp">

<div class="info">

<h3>${streamer.name}</h3>

<p class="ic-name"><i class="fa-solid fa-id-card"></i> ${streamer.icName || 'غير محدد'}</p>

<span class="category-tag">${catName}</span>

</div>

</div>



<div class="card-back">

<h3>${streamer.name}</h3>

<p style="margin:10px 0; color:#ccc;">اضغط للمشاهدة على كيك</p>

<a href="https://kick.com/${streamer.username}" target="_blank" class="watch-btn">

<i class="fa-solid fa-video"></i> مشاهدة البث

</a>

</div>

</div>

</div>

`;

container.appendChild(card);

}

}



// 4. نظام الفلترة

window.appFilter = (category) => {

// تحديث الأزرار النشطة

document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));

// محاولة تفعيل الزر المضغوط (يعتمد على ترتيب الضغط)

const clickedBtn = event ? event.currentTarget : null;

if(clickedBtn) clickedBtn.classList.add('active');



if (category === 'all') {

renderStreamers(allStreamers);

} else {

const filtered = allStreamers.filter(s => s.category === category);

renderStreamers(filtered);

}

};



// 5. نظام البحث

document.getElementById('searchInput').addEventListener('input', (e) => {

const term = e.target.value.toLowerCase();

const filtered = allStreamers.filter(s =>

s.name.toLowerCase().includes(term) ||

(s.icName && s.icName.toLowerCase().includes(term))

);

renderStreamers(filtered);

});



// بدء التشغيل

fetchStreamers();



// ==========================================
// 1. القائمة الكاملة
// ==========================================
const streamersList = [
  { "id": 1, "name": "S5B", "icName": "ماثيو ستانلي", "username": "s5b", "image": "https://files.kick.com/images/user/5543715/profile_image/conversion/0f18fe5a-ccaf-4fc9-b6b4-fb6d953c7952-fullsize.webp", "category": "citizen" },
  { "id": 2, "name": "xKnDrx", "icName": "عبدالله الوليد", "username": "xkndrx", "image": "https://files.kick.com/images/user/5796065/profile_image/conversion/99da65f7-625f-408b-bc85-4328a64d9bf4-fullsize.webp", "category": "police" },
  { "id": 3, "name": "iSLF", "icName": "سلفستر سميث", "username": "islf", "image": "https://files.kick.com/images/user/5475836/profile_image/conversion/357fb6b0-9dbf-47c9-bf22-8304f8af5555-fullsize.webp", "category": "police" },
  { "id": 4, "name": "Drb7h", "icName": "كافح المكافح", "username": "drb7h", "image": "https://files.kick.com/images/user/4434632/profile_image/conversion/26516e13-f362-4f7d-8b16-f458b5414f3c-fullsize.webp", "category": "police" },
  { "id": 5, "name": "itsD70", "icName": "بوليلو", "username": "itsd70", "image": "https://files.kick.com/images/user/5950524/profile_image/conversion/acb54af5-efcb-4b5a-bcc5-e1824fe61676-fullsize.webp", "category": "gangs" },
  { "id": 6, "name": "aboali62", "icName": "علي عامر", "username": "aboali62", "image": "https://files.kick.com/images/user/50078315/profile_image/conversion/21a0677b-8092-4834-929f-9066ef4899f4-fullsize.webp", "category": "police" },
  { "id": 7, "name": "i2Reap", "icName": "عبد الودود البرماوي", "username": "i2reap", "image": "https://files.kick.com/images/user/1154012/profile_image/conversion/ceae6396-b57e-465c-9071-171e69d558ec-fullsize.webp", "category": "citizen" },
  { "id": 8, "name": "taf86", "icName": "صقر ال عبيد", "username": "taf86", "image": "https://files.kick.com/images/user/7364286/profile_image/conversion/474b770c-3110-4683-a732-8f9582b7de49-fullsize.webp", "category": "عائلة عبيد" },
  { "id": 9, "name": "taemor", "icName": "مصطفى سداح", "username": "taemor", "image": "https://files.kick.com/images/user/19779361/profile_image/conversion/2f0f0e7c-b58c-4ed5-a7ab-359ec1894320-fullsize.webp", "category": "عائلة الياكوزا" },
  { "id": 10, "name": "sayko_911", "icName": "حربي الزير", "username": "sayko_911", "image": "https://files.kick.com/images/user/16694172/profile_image/conversion/cbc3a87b-892f-40cb-a2f0-a4ef013425f6-fullsize.webp", "category": "عائلة الياكوزا" },
  { "id": 11, "name": "ogxhusni", "icName": ["حسني الهاشمي", "حسان الحربي"], "username": "ogxhusni", "image": "https://files.kick.com/images/user/17385774/profile_image/conversion/f577b87d-e16f-4d79-9914-047c099dd8a2-fullsize.webp", "category": ["الشرطة", "عصابة الياكوزا"] },
  { "id": 12, "name": "w1pey", "icName": "عبدالله كسار", "username": "w1pey", "image": "https://files.kick.com/images/user/21108622/profile_image/conversion/737ac243-568d-4cb1-a927-0d84356651ec-fullsize.webp", "category": "عصابة الغرب" },
  { "id": 13, "name": "zoo6k", "icName": "تاج السر", "username": "zoo6k", "image": "https://files.kick.com/images/user/36483292/profile_image/conversion/1a626c7a-b7be-4920-93a3-2a5ab885c4b1-fullsize.webp", "category": "عصابة البلس" },
  { "id": 14, "name": "ogsai", "icName": "ساي منكا", "username": "ogsai", "image": "https://files.kick.com/images/user/67123881/profile_image/conversion/422dcb7d-193f-49ed-b8da-229b6bb10013-fullsize.webp", "category": "عصابة البلس" },
  { "id": 15, "name": "odayyouyou", "icName": ["علمدار رحاحلة", "هيروشيما ايبيساو"], "username": "odayyouyou", "image": "https://files.kick.com/images/user/30488024/profile_image/conversion/1660d743-f9c4-4c52-8dbd-5d054de3aa9f-fullsize.webp", "category": ["الشرطة", "عصابة الياكوزا"] },
  { "id": 16, "name": "tadido", "icName": "لؤي الباهي", "username": "tadido", "image": "https://files.kick.com/images/user/6607518/profile_image/conversion/fa980ab2-7ed1-4f82-bd38-07521a50b09b-fullsize.webp", "category": "S.OPS" },
  { "id": 17, "name": "okb8", "icName": "عيسى ال عبيد", "username": "okb8", "image": "https://files.kick.com/images/user/5784690/profile_image/conversion/8197e81f-5c07-4669-bf6e-12a68b7f3d17-fullsize.webp", "category": "عائلة عبيد" },
  { "id": 18, "name": "naforall", "icName": "نايف الشمري", "username": "naforall", "image": "https://files.kick.com/images/user/34006282/profile_image/conversion/8fe699cf-4298-4e64-a6ed-f459240b2437-fullsize.webp", "category": "S.OPS" },
  { "id": 19, "name": "molakoo", "icName": "جمران مبارك", "username": "molakoo", "image": "https://files.kick.com/images/user/16423500/profile_image/conversion/abfefed8-812d-4f6b-b1cd-56b14681a4d5-fullsize.webp", "category": "OLD SCHOOL" },
  { "id": 20, "name": "zaikrx", "icName": "إريك سلفاتور", "username": "zaikrx", "image": "https://files.kick.com/images/user/5558522/profile_image/conversion/3e75df7e-25e3-4b7a-8bf1-b6221ef87039-fullsize.webp", "category": "N.W.A" },
  { "id": 21, "name": "team_wolf", "icName": "اوسكر", "username": "team_wolf", "image": "https://files.kick.com/images/user/5732869/profile_image/conversion/279747f2-0d97-476d-a11f-2c91773a316f-fullsize.webp", "category": "N.W.A" },
  { "id": 22, "name": "lavanda0", "icName": "اماندا سلفاتور", "username": "lavanda0", "image": "https://files.kick.com/images/user/23207948/profile_image/conversion/a741f4b1-4dc1-4bad-a590-7c596d99322a-fullsize.webp", "category": "N.W.A" },
  { "id": 23, "name": "r3d-x999", "icName": "", "username": "r3d-x999", "image": "https://files.kick.com/images/user/53587692/profile_image/conversion/db57dc2b-f5eb-4318-8238-0aa5f3a80939-fullsize.webp", "category": "Crypto" },
  { "id": 24, "name": "lhajar", "icName": "قمر محمد", "username": "lhajar", "image": "https://files.kick.com/images/user/6588423/profile_image/conversion/0aa4b373-fea5-4f83-b399-01a27f297007-fullsize.webp", "category": "mwatn" },
  { "id": 25, "name": "imonkey_d", "icName": "سياف ال عبيد", "username": "imonkey_d", "image": "https://files.kick.com/images/user/5742787/profile_image/conversion/26e738a7-4ee7-42ff-8964-e357230e72eb-fullsize.webp", "category": "عائلة عبيد" },
  { "id": 26, "name": "ibra49", "icName": "جابر جبران", "username": "ibra49", "image": "https://files.kick.com/images/user/4257263/profile_image/conversion/dd2a6b2d-17a9-4bd9-8d89-52faff7cea84-fullsize.webp", "category": "عصابة الشرق" },
  { "id": 27, "name": "ib6h", "icName": "داميان سيلفر", "username": "ib6h", "image": "https://files.kick.com/images/user/5822366/profile_image/conversion/7ccfaaaa-edfb-477f-aacb-106e9bbfa871-fullsize.webp", "category": "S.OPS" },
  { "id": 28, "name": "ic4c", "icName": "سيف الأنصاري", "username": "ic4c", "image": "https://files.kick.com/images/user/5815025/profile_image/conversion/a7fed3af-1a8a-4aec-b104-6c927a8d7f50-fullsize.webp", "category": "S.OPS" },
  { "id": 29, "name": "iimad", "icName": "سهيل بن شداد", "username": "iimad", "image": "https://files.kick.com/images/user/6253733/profile_image/conversion/339a50cb-a77b-4eea-8236-6c9d227040d0-fullsize.webp", "category": "اجرام" },
  { "id": 30, "name": "id7o", "icName": "سايكو دام", "username": "id7o", "image": "https://files.kick.com/images/user/5942660/profile_image/conversion/908202d1-7f4b-4f17-99ab-b32cb6926f20-fullsize.webp", "category": "الشرطة" },
  { "id": 31, "name": "ia4s", "icName": "مناحي مرواس", "username": "ia4s", "image": "https://files.kick.com/images/user/5750980/profile_image/conversion/4f1efc4d-0563-43b6-9c7f-b20206a56fb8-fullsize.webp", "category": "الشرطة" },
  { "id": 32, "name": "i_ayman", "icName": "خالد فيصل", "username": "i_ayman", "image": "https://files.kick.com/images/user/6134022/profile_image/conversion/c1265a6e-8322-4f87-aced-d251a21ca12f-fullsize.webp", "category": "OLD SCHOOL" },
  { "id": 33, "name": "hook", "icName": "سيف ال عبيد", "username": "hook", "image": "https://files.kick.com/images/user/5665994/profile_image/conversion/550120fb-3de7-4a42-bccc-cc83b5760a81-fullsize.webp", "category": "عائلة عبيد" },
  { "id": 34, "name": "foxrex", "icName": "", "username": "foxrex", "image": "https://files.kick.com/images/user/33211413/profile_image/conversion/b289d671-59e2-48d6-b86a-14d1143a48b7-fullsize.webp", "category": "عصابة البلس" },
  { "id": 35, "name": "f1aisal", "icName": "عقاب المخلوط", "username": "f1aisal", "image": "https://files.kick.com/images/user/5684147/profile_image/conversion/8a0ac812-3ea6-4ef6-90ef-da27fe7d94ca-fullsize.webp", "category": "الشرطة" },
  { "id": 36, "name": "drkaalo", "icName": "أبو جلمبو", "username": "drkaalo", "image": "https://files.kick.com/images/user/47831636/profile_image/conversion/7543a6e7-f8b3-498f-87e7-e5034672b837-fullsize.webp", "category": "Middle Gang" },
  { "id": 37, "name": "al_hashidi", "icName": "سعيد الحاشدي", "username": "al_hashidi", "image": "https://files.kick.com/images/user/40611253/profile_image/conversion/0e2faea9-5e49-4e4c-b313-e10e7eaaa10e-fullsize.webp", "category": "العدل" },
  { "id": 38, "name": "abokhaled_sa", "icName": "ذياب خلفان", "username": "abokhaled_sa", "image": "https://files.kick.com/images/user/6112408/profile_image/conversion/f4ac7373-aee8-4bbd-95aa-494af2454654-fullsize.webp", "category": "الشرطة" },
  { "id": 39, "name": "abdalluh124", "icName": "", "username": "abdalluh124", "image": "https://files.kick.com/images/user/40905121/profile_image/conversion/087fbf86-3291-43c7-b776-59810fb29f22-fullsize.webp", "category": "S.OPS" },
  { "id": 40, "name": "abadi", "icName": "", "username": "abadi", "image": "https://files.kick.com/images/user/1133536/profile_image/conversion/cae20ef2-37f9-415d-8b9b-703322085be2-fullsize.webp", "category": "Crypto" },
  { "id": 41, "name": "4trry", "icName": "", "username": "4trry", "image": "https://files.kick.com/images/user/54246796/profile_image/conversion/a96d5f23-15a6-41e4-83b8-fba40bb3f23f-fullsize.webp", "category": "عصابة البلس" },
  { "id": 42, "name": "3mrte0", "icName": "نمر ال عبيد", "username": "3mrte0", "image": "https://files.kick.com/images/user/40852277/profile_image/conversion/7ff53c6d-f7a3-4da4-a0e0-8a1df44480dc-fullsize.webp", "category": "عائلة عبيد" },
  { "id": 43, "name": "aymnalsatam", "icName": "ايمن سطام", "username": "aymnalsatam", "image": "https://files.kick.com/images/user/6053230/profile_image/conversion/7c282bda-ff93-4956-8313-dfcabcae0430-fullsize.webp", "category": "الشرطة" },
  { "id": 44, "name": "absi", "icName": "قومبز اوغلو", "username": "absi", "image": "https://files.kick.com/images/user/27894320/profile_image/conversion/0d098931-31c2-4720-a6fe-e0c82bef9986-fullsize.webp", "category": "عصابة البرازيليين" },
  { "id": 45, "name": "eeid", "icName": "سكيلر روس", "username": "eeid", "image": "https://files.kick.com/images/user/7315650/profile_image/conversion/b1611636-1d11-46d5-8182-c099a7faf13d-fullsize.webp", "category": "الشرطة" },
  { "id": 46, "name": "jaber1", "icName": "جابر أحمد", "username": "jaber1", "image": "https://files.kick.com/images/user/5734623/profile_image/conversion/8d668b6e-c2a2-4806-b726-63a613fff037-fullsize.webp", "category": "الشرطة" },
  { "id": 47, "name": "zAlbaloshi", "icName": "بلبي", "username": "zAlbaloshi", "image": "https://files.kick.com/images/user/5871412/profile_image/conversion/376f099c-afcc-41b4-981c-73dee3d3d8c4-fullsize.webp", "category": "Crypto" },
  { "id": 48, "name": "only_wily", "icName": "وليد فالح", "username": "only_wily", "image": "https://files.kick.com/images/user/8337940/profile_image/conversion/174b4e96-5d39-443a-a08a-eb4fc631d872-fullsize.webp", "category": "S.OPS" },
  { "id": 49, "name": "1mali", "icName": "مفرح بن علي", "username": "1mali", "image": "https://files.kick.com/images/user/5852294/profile_image/conversion/a385ff9d-ee7b-4fbb-87c2-cbb70ea2219b-fullsize.webp", "category": "الشرطة" },
  { "id": 50, "name": "Sodry", "icName": "محمد السودري", "username": "sodry", "image": "https://cdn.discordapp.com/attachments/1453231244169973792/1453977179787366521/17667255648187630729168925888187.jpg", "category": "police" }
];

// ==========================================
// 2. نظام الجسيمات
// ==========================================
function createParticles() {
    const container = document.getElementById('particles');
    if(!container) return;
    const isMobile = window.innerWidth <= 768;
    const particleCount = isMobile ? 15 : 30;
    
    for (let i = 0; i < particleCount; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        const size = Math.random() * 30 + 20; 
        p.style.width = `${size}px`;
        p.style.height = `${size}px`;
        p.style.opacity = Math.random() * 0.5 + 0.1;
        p.style.left = `${Math.random() * 100}%`;
        p.style.top = `${Math.random() * 100}%`;
        p.style.animation = `float ${Math.random() * 15 + 15}s linear infinite`;
        p.style.animationDelay = `-${Math.random() * 10}s`;
        container.appendChild(p);
    }
}

// ==========================================
// 3. المحرك الذكي (تحديث كل 30 ثانية)
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    renderInitialCards(); // رسم البطاقات فوراً
    
    checkAllStreamers();  // الفحص الأول
    
    // 🔥 التحديث التلقائي كل 30 ثانية
    setInterval(checkAllStreamers, 30000); 

    // شريط التحديث المتغير (أخضر -> بنفسجي)
    let progress = 0;
    let isPurpleMode = false;
    const bar = document.getElementById('progress-bar');
    if(bar) bar.style.backgroundColor = '#53fc18'; 

    setInterval(() => {
        progress += (100 / 30); // تم تعديل السرعة لـ 30 ثانية
        if (progress > 100) {
            progress = 0;
            isPurpleMode = !isPurpleMode;
            if (bar) bar.style.backgroundColor = isPurpleMode ? '#8a2be2' : '#53fc18';
        }
        if(bar) bar.style.width = `${progress}%`;
    }, 1000);
    
    // إخفاء شاشة التحميل
    setTimeout(() => {
        const loader = document.getElementById('image-loader');
        if(loader) {
            loader.classList.add('loader-hidden');
            setTimeout(() => loader.remove(), 1000);
        }
    }, 4000);
});

function renderInitialCards() {
    const grid = document.getElementById('streamer-grid');
    grid.innerHTML = ''; 
    streamersList.forEach(s => {
        const card = createCardElement(s, false, 0); 
        card.id = `card-${s.username}`; 
        grid.appendChild(card);
    });
    document.getElementById('total-streamers').innerText = streamersList.length;
}

// 🔥 دالة الفحص (استخدام corsproxy.io) 🔥
async function checkAllStreamers() {
    const batchSize = 6;
    let liveCounter = 0;
    let totalViewersCount = 0;

    for (let i = 0; i < streamersList.length; i += batchSize) {
        const batch = streamersList.slice(i, i + batchSize);
        
        const promises = batch.map(async (streamer) => {
            try {
                // ✅ العودة لاستخدام البروكسي المباشر الذي نجح سابقاً
                // إضافة ?t= للرابط لمنع المتصفح من حفظ النتيجة القديمة (الكاش)
                const proxyUrl = `https://corsproxy.io/?https://kick.com/api/v1/channels/${streamer.username}?t=${Date.now()}`;
                
                const response = await fetch(proxyUrl);
                
                if(response.ok) {
                    const data = await response.json();
                    
                    const isLive = data.livestream !== null;
                    let viewers = 0;
                    if (isLive && data.livestream) {
                        viewers = data.livestream.viewer_count || 0;
                    }

                    if (isLive) {
                        updateCardUI(streamer, true, viewers); 
                        liveCounter++;
                        totalViewersCount += viewers;
                    } else {
                        updateCardUI(streamer, false, 0);
                    }
                }
            } catch (e) {
                console.log(`Failed to check ${streamer.username}:`, e);
                // لا نغير الحالة للأوفلاين فوراً عند الخطأ لتجنب الرمش، إلا إذا أردت ذلك
            }
        });

        await Promise.all(promises);
        await new Promise(r => setTimeout(r, 500)); 
    }
    
    document.getElementById('live-count').innerText = liveCounter;
    document.getElementById('total-viewers').innerText = totalViewersCount.toLocaleString();
    
    findAndHighlightTop(); // تحديث التوب بعد كل دورة
    reorderGrid(); // إعادة الترتيب
}

// ==========================================
// 4. دوال التحديث والرسم (UI)
// ==========================================

function createCardElement(s, isLive, viewers) {
    const card = document.createElement('div');
    card.className = `card ${isLive ? 'online-card' : 'offline-card'}`;
    card.onclick = () => window.open(`https://kick.com/${s.username}`, '_blank');
    
    card.dataset.live = isLive ? "1" : "0";
    card.dataset.viewers = viewers;
    card.dataset.category = JSON.stringify(s.category).toLowerCase(); 

    let icNameHtml = s.icName ? `<div class="ic-name">🎭 ${s.icName}</div>` : '';

    card.innerHTML = `
        <div class="card-header">
            <div class="streamer-info">
                <h3>${s.name}</h3>
                <div class="username"><i class="fa-brands fa-kickstarter"></i> ${s.username}</div>
                ${icNameHtml}
            </div>
            <img src="${s.image}" class="streamer-img ${isLive ? 'pulse' : ''}" loading="lazy" alt="${s.name}">
        </div>
        
        <div class="card-footer">
            <div class="status-badge ${isLive ? 'status-on' : 'status-off'}">
                <span class="dot ${isLive ? '' : 'dot-red'}">●</span> ${isLive ? 'مباشر 🔥' : 'غير متصل'}
            </div>
            ${isLive ? `<div class="viewers-count"><i class="fa-regular fa-eye"></i> ${viewers.toLocaleString()}</div>` : ''}
        </div>
    `;
    return card;
}

// دالة التحديث الذكية (تغير الأرقام بدون وميض)
function updateCardUI(s, isLive, viewers) {
    const card = document.getElementById(`card-${s.username}`);
    if (!card) return;

    card.dataset.live = isLive ? "1" : "0";
    card.dataset.viewers = viewers;

    // إزالة التاج والإطار الذهبي (سيعاد وضعهم في دالة التوب)
    card.classList.remove('top-streamer-card');
    const crown = card.querySelector('.crown-icon');
    if(crown) crown.remove();

    if (isLive) {
        card.classList.add('online-card');
        card.classList.remove('offline-card');
        card.querySelector('.streamer-img').classList.add('pulse');
        
        const badge = card.querySelector('.status-badge');
        badge.className = 'status-badge status-on';
        badge.innerHTML = '<span class="dot">●</span> مباشر 🔥';
        
        // تحديث رقم المشاهدات
        let vDiv = card.querySelector('.viewers-count');
        if(!vDiv) {
            vDiv = document.createElement('div');
            vDiv.className = 'viewers-count';
            card.querySelector('.card-footer').appendChild(vDiv);
        }
        vDiv.innerHTML = `<i class="fa-solid fa-eye"></i> ${viewers.toLocaleString()}`;
        
    } else {
        card.classList.remove('online-card');
        card.classList.add('offline-card');
        card.querySelector('.streamer-img').classList.remove('pulse');
        
        const badge = card.querySelector('.status-badge');
        badge.className = 'status-badge status-off';
        badge.innerHTML = '<span class="dot dot-red">●</span> غير متصل';
        
        const vDiv = card.querySelector('.viewers-count');
        if(vDiv) vDiv.remove();
    }
}

// دالة تحديد التوب
function findAndHighlightTop() {
    const cards = Array.from(document.querySelectorAll('.card'));
    let maxViewers = -1;
    let topCard = null;

    cards.forEach(card => {
        if(card.dataset.live === "1") {
            const viewers = parseInt(card.dataset.viewers);
            if(viewers > maxViewers) {
                maxViewers = viewers;
                topCard = card;
            }
        }
    });

    if(topCard && maxViewers > 0) {
        topCard.classList.add('top-streamer-card');
        const nameHeader = topCard.querySelector('.streamer-info h3');
        if(!nameHeader.querySelector('.crown-icon')) {
             nameHeader.innerHTML += ` <span class="crown-icon">👑</span>`;
        }
        const badge = topCard.querySelector('.status-badge');
        badge.className = 'status-badge status-top';
        badge.innerHTML = 'الأكثر مشاهدة 👑';
    }
}

function reorderGrid() {
    const grid = document.getElementById('streamer-grid');
    const cards = Array.from(grid.children);

    cards.sort((a, b) => {
        // التوب دائماً الأول
        const isTopA = a.classList.contains('top-streamer-card');
        const isTopB = b.classList.contains('top-streamer-card');
        if (isTopA && !isTopB) return -1;
        if (!isTopA && isTopB) return 1;

        const liveA = parseInt(a.dataset.live);
        const liveB = parseInt(b.dataset.live);
        const viewA = parseInt(a.dataset.viewers);
        const viewB = parseInt(b.dataset.viewers);
        
        if (liveA !== liveB) return liveB - liveA;
        return viewB - viewA;
    });
    
    cards.forEach(card => grid.appendChild(card));
}

function formatCategory(cat) {
    if (Array.isArray(cat)) return cat.join(' - ');
    return cat;
}

// القائمة المنسدلة
function toggleDropdown() {
    document.getElementById('catDropdown').classList.toggle('show');
}
window.onclick = function(event) {
    if (!event.target.matches('.dropdown-btn') && !event.target.matches('.dropdown-btn *')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        for (var i = 0; i < dropdowns.length; i++) {
            if (dropdowns[i].classList.contains('show')) {
                dropdowns[i].classList.remove('show');
            }
        }
    }
}

function filterCategory(cat) {
    activeCategory = cat.toLowerCase();
    const btnText = document.querySelector('.dropdown-btn span');
    
    // تحديث نص الزر حسب الفئة المختارة
    const names = {
        'all': 'تصنيف الفئات',
        'police': 'الشرطة',
        's.ops': 'قوات خاصة',
        'gangs': 'عصابات',
        'عائلة عبيد': 'عائلة عبيد',
        'عصابة البلس': 'عصابة البلس',
        'n.w.a': 'N.W.A',
        'middle gang': 'Middle Gang',
        'عصابة الشرق': 'عصابة الشرق',
        'citizen': 'مواطنين'
    };
    
    btnText.innerText = names[activeCategory] || cat;
    applyFilters();
}

function filterStatus(status, btn) {
    activeStatus = status;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    applyFilters();
}

function applyFilters() {
    const grid = document.getElementById('streamer-grid');
    const cards = Array.from(grid.children);

    cards.forEach(card => {
        const cardCat = card.dataset.category;
        const isLive = card.dataset.live === "1";
        
        let showCat = activeCategory === 'all' || cardCat.includes(activeCategory);
        let showStatus = activeStatus === 'all' || 
                         (activeStatus === 'live' && isLive) || 
                         (activeStatus === 'offline' && !isLive);

        if (showCat && showStatus) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
    // إعادة الترتيب بعد الفلترة
    reorderGrid();
}

function searchStreamers() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        const text = card.innerText.toLowerCase();
        if(text.includes(query)) card.style.display = 'flex';
        else card.style.display = 'none';
    });
}

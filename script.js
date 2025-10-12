// هذا الكود يتطلب أن يكون لديك ملف data.js يحتوي على مصفوفة (Array) اسمها 'plumbers'

const plumberListContainer = document.getElementById('plumberList');
const searchInput = document.getElementById('searchInput');
const loadMoreButton = document.getElementById('loadMoreButton'); // الزر الجديد للتحميل
const CARDS_PER_LOAD = 12; // عدد البطاقات التي ستظهر في كل مرة
let currentFilter = 'all'; // الفلتر الافتراضي هو 'الكل'
let visiblePlumbers = []; // قائمة السباكين التي تطابق الفلتر الحالي
let loadedCount = 0; // عدد السباكين المعروضين حالياً

// دالة تحويل الرقم إلى نجوم (Stars)
function getStarRating(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? '★' : '';
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    let stars = '';
    for (let i = 0; i < fullStars; i++) {
        stars += '⭐';
    }
    if (halfStar) {
        stars += '★';
    }
    for (let i = 0; i < emptyStars; i++) {
        stars += '☆';
    }
    return `<span style="color: gold;">${stars}</span> (${rating})`;
}

// دالة عرض الرقم مع إخفاء الجزء الأوسط (التعديل الخاص بالتأمين التلقائي)
function formatPhoneNumber(fullNumber) {
    // إزالة أي رموز غير رقمية من الرقم قبل التشفير
    const cleanNumber = fullNumber.replace(/[^0-9]/g, '');
    if (!cleanNumber || cleanNumber.length < 5) return cleanNumber;
    
    // اظهار أول ثلاثة أرقام وآخر ثلاثة أرقام
    const prefix = cleanNumber.substring(0, 3);
    const suffix = cleanNumber.substring(cleanNumber.length - 3);
    
    // عدد النجوم يساوي عدد الأرقام المخفية (الوسط)
    // نطرح 6 (3 للأول و 3 للأخير)
    const hiddenStars = cleanNumber.length - 6; 
    const hiddenPart = '*'.repeat(hiddenStars > 0 ? hiddenStars : 0);
    
    return `${prefix}${hiddenPart}${suffix}`;
}


// دالة إنشاء بطاقة سباك واحدة
function createPlumberCard(plumber) {
    const card = document.createElement('div');
    card.classList.add('plumber-card');

    card.setAttribute('data-skill-maint', plumber.Skill_Maint);
    card.setAttribute('data-skill-est', plumber.Skill_Est);
    card.setAttribute('data-skill-rep', plumber.Skill_Rep);

    // الرقم النظيف يستخدم للاتصال (مع إزالة أي رموز في حال وجودها)
    const cleanNumberForCall = plumber.Phone_Internal.replace(/[^0-9]/g, '');
    const phoneLink = `tel:${cleanNumberForCall}`; 
    
    // الرقم المخفي جزئياً يستخدم للعرض
    const displayedNumber = formatPhoneNumber(plumber.Phone_Internal); 
    
    // بناء محتوى البطاقة (HTML الداخلي)
    card.innerHTML = `
        <div class="card-name">${plumber.Name}</div>
        <div class="card-rating">${getStarRating(plumber.Rating)}</div>
        
        <div class="card-info">
            <strong>المناطق:</strong> ${plumber.Areas}
        </div>
        
        <div class="card-info skills-list">
            <strong>التخصصات:</strong> 
            ${plumber.Skill_Est === 'نعم' ? '<span>تأسيس وتشطيب</span>' : ''}
            ${plumber.Skill_Maint === 'نعم' ? '<span>صيانة بسيطة</span>' : ''}
            ${plumber.Skill_Rep === 'نعم' ? '<span>  شبكات وأعمال صعبة</span>' : ''}
        </div>
        
        <p class="bio-text">
            <strong>نبذة:</strong> ${plumber.Bio || 'لم يقم السباك بتوفير نبذة بعد.'}
        </p>
        
        <a href="${phoneLink}" class="contact-button">
            📞 اتصل الآن: ${displayedNumber}
        </a>
    `;

    return card;
}


// دالة عرض الدفعة الحالية من السباكين
function displayPlumberChunk() {
    const nextPlumbers = visiblePlumbers.slice(loadedCount, loadedCount + CARDS_PER_LOAD);
    
    nextPlumbers.forEach(plumber => {
        plumberListContainer.appendChild(createPlumberCard(plumber));
    });

    loadedCount += nextPlumbers.length;
    
    // إخفاء زر "عرض المزيد" إذا لم يتبق سباكين
    if (loadedCount >= visiblePlumbers.length) {
        loadMoreButton.style.display = 'none';
    } else {
        loadMoreButton.style.display = 'block';
    }
}


// دالة التصفية الرئيسية (تُشغل بالبحث أو الأزرار)
function filterCards() {
    // 1. التصفية حسب نص البحث (الاسم أو المنطقة)
    const searchTerm = searchInput.value.toLowerCase();
    
    const filteredBySearch = plumbers.filter(plumber => {
        // نضمن أن البحث يعمل حتى لو لم يضع السباك بيانات كاملة
        const nameMatch = (plumber.Name || '').toLowerCase().includes(searchTerm);
        const areaMatch = (plumber.Areas || '').toLowerCase().includes(searchTerm);
        return nameMatch || areaMatch;
    });

    // 2. التصفية حسب المهارات (الأزرار)
    const filteredBySkill = filteredBySearch.filter(plumber => {
        if (currentFilter === 'all') {
            return true;
        }
        
        if (currentFilter === 'Skill_Est' && plumber.Skill_Est === 'نعم') {
            return true;
        }
        if (currentFilter === 'Skill_Maint' && plumber.Skill_Maint === 'نعم') {
            return true;
        }
        if (currentFilter === 'Skill_Rep' && plumber.Skill_Rep === 'نعم') {
            return true;
        }
        return false;
    });

    // 3. إعادة تعيين القائمة المرئية
    visiblePlumbers = filteredBySkill;
    loadedCount = 0; // نبدأ العد من الصفر
    plumberListContainer.innerHTML = ''; // تفريغ القائمة بالكامل
    
    if (visiblePlumbers.length === 0) {
        plumberListContainer.innerHTML = '<p style="text-align: center; grid-column: 1 / -1;">لا يوجد سباكين يطابقون شروط البحث.</p>';
        loadMoreButton.style.display = 'none'; // إخفاء الزر
        return;
    }

    // عرض الدفعة الأولى
    displayPlumberChunk();
}

// دالة لتغيير الفلتر عند الضغط على الأزرار
function filterBySkill(skillKey) {
    // تحديد الفلتر الحالي
    currentFilter = skillKey;

    // تفعيل الزر النشط
    document.querySelectorAll('.filter-buttons button').forEach(button => {
        button.classList.remove('active');
    });
    
    // تفعيل الزر المضغوط عليه
    // نستخدم data-filter لتحديد الزر بدقة
    document.querySelector(`.filter-buttons button[data-filter="${skillKey}"]`).classList.add('active');

    // تشغيل التصفية
    filterCards();
}

// تشغيل العرض الافتراضي عند تحميل الصفحة لأول مرة
document.addEventListener('DOMContentLoaded', () => {
    // التمهيد يتم بفلترة الكل (وهذا يشغل العرض لأول 12 بطاقة)
    filterCards(); 
    
    // تفعيل زر الكل كزر افتراضي نشط (يجب أن يكون الزر الأول)
    document.querySelector('.filter-buttons button').classList.add('active');
});

// ربط زر "عرض المزيد"
loadMoreButton.addEventListener('click', displayPlumberChunk);

// لجعل الدوال متاحة من HTML
window.filterCards = filterCards;
window.filterBySkill = filterBySkill;
window.displayPlumberChunk = displayPlumberChunk;

// **كود منع فحص المصدر والنسخ (لردع المستخدم العادي)**

// 1. منع النقر بالزر الأيمن (Context Menu)
document.addEventListener('contextmenu', event => event.preventDefault());

// 2. منع اختصارات فحص المصدر (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U)
document.onkeydown = function(e) {
    // F12
    if(e.keyCode == 123) {
        return false;
    }
    // Ctrl+Shift+I, J
    if(e.ctrlKey && e.shiftKey && (e.keyCode == 'I'.charCodeAt(0) || e.keyCode == 'J'.charCodeAt(0))) {
        return false;
    }
    // Ctrl+U
    if(e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)) {
        return false;
    }
}
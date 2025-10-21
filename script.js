// عدد البطاقات المراد عرضها في البداية
const initialDisplayCount = 12;
// عدد البطاقات المراد عرضها في كل ضغطة على زر "عرض المزيد"
const loadMoreCount = 6;
// عداد لتتبع عدد البطاقات المعروضة حاليًا
let currentDisplayedCount = 0;
// المتغير الذي سيحمل قائمة السباكين بعد التصفية (للحفاظ على حالة البحث)
let filteredPlumbers = [];


// 💡 الدالة الجديدة لتأمين رقم الهاتف
function securePhoneNumber(phone) {
    if (!phone || phone.length < 4) return phone;
    // عرض أول رقمين وآخر رقمين، واستبدال الباقي بنجوم
    const firstTwo = phone.substring(0, 2);
    const lastTwo = phone.substring(phone.length - 2);
    const middleStars = '*'.repeat(phone.length - 4);
    return `${firstTwo}${middleStars}${lastTwo}`;
}

// دالة لإنشاء بطاقة سباك واحدة
function createCard(plumber) {
    // تنسيق رقم الهاتف ليناسب الاتصال المباشر (يبقى الرقم الكامل في رابط الاتصال)
    const phoneNumberLink = `tel:+2${plumber.Phone_Internal}`;
    
    // 💡 استخدام دالة التأمين لعرض الرقم
    const securedPhone = securePhoneNumber(plumber.Phone_Internal);

    return `
        <div class="plumber-card">
            <div class="card-name">${plumber.Name}</div>
            
            <p class="card-info">
                <i class="fas fa-map-marker-alt"></i>
                <strong>المنطقة:</strong> ${plumber.Areas}
            </p>
            
            <p class="card-info">
                <i class="fas fa-phone"></i>
                <strong>الموبايل:</strong> ${securedPhone}
            </p>

            <a href="${phoneNumberLink}" class="contact-button">
                اتصل بالسباك الآن
            </a>
        </div>
    `;
}

// دالة لعرض البطاقات بناءً على قائمة معينة (سواء كانت مصفاة أو القائمة الأصلية)
function renderCards(plumbersToDisplay) {
    const listContainer = document.getElementById('plumberList');
    const loadMoreBtn = document.getElementById('loadMoreButton');
    
    // يتم عرض البيانات من البداية حتى العدد المحدد حالياً
    const slice = plumbersToDisplay.slice(0, currentDisplayedCount);
    
    listContainer.innerHTML = slice.map(createCard).join('');

    // إظهار أو إخفاء زر "عرض المزيد"
    if (currentDisplayedCount < plumbersToDisplay.length) {
        loadMoreBtn.style.display = 'block';
    } else {
        loadMoreBtn.style.display = 'none';
    }
    
    // حفظ القائمة المصفاة لاستخدامها في دالة loadMore
    filteredPlumbers = plumbersToDisplay;
}

// دالة لزيادة عدد البطاقات المعروضة
function loadMore() {
    // زيادة عدد البطاقات المعروضة بالعدد المحدد
    currentDisplayedCount += loadMoreCount;
    // إعادة عرض القائمة المصفاة (أو الأصلية)
    renderCards(filteredPlumbers);
}

// دالة تصفية البطاقات بناءً على مدخل البحث
function filterCards() {
    const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();
    
    // إذا كان حقل البحث فارغاً، يتم استخدام القائمة الأصلية
    if (searchTerm === "") {
        filtered = plumbers;
    } else {
        // تصفية السباكين
        filtered = plumbers.filter(plumber => {
            // البحث مازال يستخدم الرقم الكامل لضمان نجاح البحث برقم الهاتف
            const searchableText = `${plumber.Name} ${plumber.Areas} ${plumber.Phone_Internal}`.toLowerCase();
            return searchableText.includes(searchTerm);
        });
    }

    // بعد التصفية، نبدأ دائماً من عدد العرض الأولي (12)
    currentDisplayedCount = initialDisplayCount;
    
    // إذا لم يتم العثور على نتائج
    if (filtered.length === 0) {
        document.getElementById('plumberList').innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: #e91e63; font-size: 1.2em; padding: 50px;">عذراً، لم يتم العثور على نتائج مطابقة.</div>';
        document.getElementById('loadMoreButton').style.display = 'none';
        return;
    }

    // عرض النتائج المصفاة
    renderCards(filtered);
}

// ==========================================================
// عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    // ضبط عدد البطاقات المعروضة في البداية
    currentDisplayedCount = initialDisplayCount; 
    
    // عرض القائمة الأصلية
    renderCards(plumbers);
    
    // ربط زر عرض المزيد بالدالة
    document.getElementById('loadMoreButton').addEventListener('click', loadMore);
});

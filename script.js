// ── Fallback local hadiths (used when API is unreachable) ──────────────────
const LOCAL_HADITHS = [
    {
        text: "«إنَّما الأعْمالُ بالنِّيّاتِ، وإنَّما لِكُلِّ امْرِئٍ ما نَوى»",
        source: "رواه البخاري ومسلم",
        explanation: "النية هي أساس قبول العمل، فكل عمل بلا نية صالحة لا ثواب فيه.",
        grade: "صحيح"
    },
    {
        text: "«المُسْلِمُ مَن سَلِمَ المُسْلِمُونَ مِن لِسانِهِ ويَدِهِ»",
        source: "صحيح البخاري",
        explanation: "الإسلام الحقيقي يظهر في كف الأذى عن الناس قولاً وفعلاً.",
        grade: "صحيح"
    },
    {
        text: "«مَن سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا، سَهَّلَ اللَّهُ لَهُ بهِ طَرِيقًا إلى الجَنَّةِ»",
        source: "صحيح مسلم",
        explanation: "طلب العلم من أعظم القربات التي توصل العبد إلى رضوان الله ورحمته.",
        grade: "صحيح"
    },
    {
        text: "«الدِّينُ النَّصِيحَةُ»",
        source: "صحيح مسلم",
        explanation: "جوهر الدين هو إخلاص النصح لله ولرسوله ولأئمة المسلمين وعامتهم.",
        grade: "صحيح"
    },
    {
        text: "«لا يُؤْمِنُ أحَدُكُمْ حتَّى يُحِبَّ لأَخِيهِ ما يُحِبُّ لِنَفْسِهِ»",
        source: "صحيح البخاري",
        explanation: "كمال الإيمان أن تتمنى للآخرين من الخير ما تتمناه لنفسك.",
        grade: "صحيح"
    }
];

let currentHadith = null;
let retryCount = 0;
const MAX_RETRIES = 6;

const card = document.getElementById('hadith-card');

// ── DOM helpers ────────────────────────────────────────────────────────────
function showSkeleton() {
    document.getElementById('skeleton').style.display = 'flex';
    document.getElementById('hadith-text').style.display = 'none';
    document.getElementById('divider').style.display = 'none';
    document.getElementById('explanation').style.display = 'none';
    document.getElementById('hadith-grade').style.display = 'none';
    document.getElementById('hadith-source').textContent = 'جارٍ التحميل...';
}

function hideSkeleton() {
    document.getElementById('skeleton').style.display = 'none';
    document.getElementById('hadith-text').style.display = 'block';
    document.getElementById('divider').style.display = 'block';
    document.getElementById('explanation').style.display = 'block';
    document.getElementById('hadith-grade').style.display = 'inline-block';
}

function populateCard(hadith) {
    currentHadith = hadith;
    document.getElementById('hadith-text').textContent = hadith.text;
    document.getElementById('hadith-source').textContent = hadith.source;
    document.getElementById('explanation').textContent = hadith.explanation;

    const gradeBadge = document.getElementById('hadith-grade');
    gradeBadge.textContent = hadith.grade;
    gradeBadge.className = 'grade-badge';
    if (hadith.grade === 'صحيح')      gradeBadge.classList.add('grade-sahih');
    else if (hadith.grade === 'حسن') gradeBadge.classList.add('grade-hasan');
    else                              gradeBadge.classList.add('grade-other');

    hideSkeleton();
    updateBookmarkButton();
}

// ── API fetch with retry + local fallback ──────────────────────────────────
function getRandomId() {
    const min = 2932;
    const max = 3180;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function fetchHadith(animate = true) {
    if (animate && currentHadith) {
        card.classList.add('fade-out');
        await new Promise(r => setTimeout(r, 280));
        card.classList.remove('fade-out');
    }

    showSkeleton();
    retryCount = 0;
    await tryFetch();

    card.classList.add('fade-in');
    setTimeout(() => card.classList.remove('fade-in'), 400);
}

async function tryFetch() {
    const id = getRandomId();
    try {
        const res = await fetch(
            `https://hadeethenc.com/api/v1/hadeeths/one/?id=${id}&language=ar`,
            { signal: AbortSignal.timeout(6000) }
        );
        if (!res.ok) throw new Error('not_ok');
        const data = await res.json();
        if (!data || !data.hadeeth) throw new Error('empty');
        if (data.hadeeth.length >= 250) throw new Error('too_long');

        populateCard({
            text:        `«${data.hadeeth}»`,
            source:      data.attribution || '',
            explanation: data.explanation || '',
            grade:       data.grade || ''
        });
    } catch {
        if (retryCount < MAX_RETRIES) {
            retryCount++;
            await tryFetch();
        } else {
            showLocalHadith();
        }
    }
}

function showLocalHadith() {
    const idx = Math.floor(Math.random() * LOCAL_HADITHS.length);
    populateCard(LOCAL_HADITHS[idx]);
}

// ── Actions ────────────────────────────────────────────────────────────────
document.getElementById('btn-copy').addEventListener('click', async () => {
    if (!currentHadith) return;
    const btn = document.getElementById('btn-copy');
    try {
        await navigator.clipboard.writeText(
            `${currentHadith.text}\n— ${currentHadith.source}`
        );
        btn.textContent = '✅';
        setTimeout(() => { btn.textContent = '📋'; }, 1500);
    } catch {
        // clipboard unsupported — silent
    }
});

document.getElementById('btn-share').addEventListener('click', async () => {
    if (!currentHadith || !navigator.share) return;
    try {
        await navigator.share({
            title: 'حديث شريف',
            text:  `${currentHadith.text}\n— ${currentHadith.source}`
        });
    } catch {
        // cancelled or unsupported — silent
    }
});

document.getElementById('btn-bookmark').addEventListener('click', () => {
    if (!currentHadith) return;
    const bookmarks = getBookmarks();
    const idx = bookmarks.findIndex(b => b.text === currentHadith.text);
    if (idx === -1) {
        bookmarks.push(currentHadith);
    } else {
        bookmarks.splice(idx, 1);
    }
    localStorage.setItem('bookmarkedHadiths', JSON.stringify(bookmarks));
    updateBookmarkButton();
});

function getBookmarks() {
    try {
        return JSON.parse(localStorage.getItem('bookmarkedHadiths') || '[]');
    } catch {
        return [];
    }
}

function updateBookmarkButton() {
    const btn = document.getElementById('btn-bookmark');
    if (!currentHadith) return;
    const isBookmarked = getBookmarks().some(b => b.text === currentHadith.text);
    btn.classList.toggle('bookmarked', isBookmarked);
    btn.title = isBookmarked ? 'إلغاء الحفظ' : 'حفظ الحديث';
}

document.getElementById('refresh').addEventListener('click', () => fetchHadith(true));

// ── Initial load ───────────────────────────────────────────────────────────
fetchHadith(false);

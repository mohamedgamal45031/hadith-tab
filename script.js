const hadiths = [
    {
        text: "«إنَّما الأعْمالُ بالنِّيّاتِ، وإنَّما لِكُلِّ امْرِئٍ ما نَوى»",
        source: "رواه البخاري ومسلم",
        explanation: "النية هي أساس قبول العمل، فاجعل نيتك لله دائماً."
    },
    {
        text: "«المُسْلِمُ مَن سَلِمَ المُسْلِمُونَ مِن لِسانِهِ ويَدِهِ»",
        source: "صحيح البخاري",
        explanation: "الإسلام الحقيقي يظهر في كف الأذى عن الناس قولا وفعلاً."
    },
    {
        text: "«مَن سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا، سَهَّلَ اللَّهُ لَهُ به طَرِيقًا إلى الجَنَّةِ»",
        source: "صحيح مسلم",
        explanation: "طلب العلم من أعظم القربات التي توصل العبد لرضوان الله."
    },
    {
        text: "«الدِّينُ النَّصِيحَةُ»",
        source: "صحيح مسلم",
        explanation: "جوهر الدين هو إخلاص النصح لله ولرسوله ولعامة المسلمين."
    }
];

function displayRandomHadith() {
    const randomIndex = Math.floor(Math.random() * hadiths.length);
    const selected = hadiths[randomIndex];

    document.getElementById('hadith-text').innerText = selected.text;
    document.getElementById('hadith-source').innerText = selected.source;
    
    const explanationEl = document.getElementById('explanation');
    if(explanationEl) {
        explanationEl.innerText = selected.explanation;
    }
}

document.addEventListener('DOMContentLoaded', displayRandomHadith);

document.getElementById('refresh').addEventListener('click', displayRandomHadith);

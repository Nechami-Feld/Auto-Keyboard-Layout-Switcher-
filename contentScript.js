// מיפוי אותיות בין עברית לאנגלית (מפה בסיסית)
const hebToEngMap = {
  'ש':'a','נ':'b','ב':'c','ג':'d','כ':'e','ע':'f','י':'g','ן':'h','ר':'i','ט':'j',
  'ם':'k','מ':'l','צ':'m','ד':'n','פ':'o','א':'p','ל':'q','ך':'r','ס':'s','ז':'t',
  'ה':'u','ח':'v','ז':'w','ח':'x','ט':'y','ז':'z',' ': ' '
};

const engToHebMap = {};
for(const [key,val] of Object.entries(hebToEngMap)){
  engToHebMap[val] = key;
}

// פונקציה להמרת מחרוזת לפי מיפוי
function convertText(text, map){
  return text.split('').map(ch => map[ch] || ch).join('');
}

// זיהוי האם הטקסט הוא ברובו עברית או אנגלית
function isMostlyHeb(text){
  let hebCount=0, engCount=0;
  for(const ch of text){
    if(hebToEngMap[ch]) hebCount++;
    else if(engToHebMap[ch]) engCount++;
  }
  return hebCount >= engCount;
}

// מאזין לאירועי הקלדה בשדות טקסט, textarea ו-contenteditable
document.addEventListener('input', (e) => {
  const target = e.target;
  if(!target) return;
  if(target.isContentEditable || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA'){
    const val = target.value || target.innerText || '';
    if(val.length < 2) return; // להתעלם מטקסט קצר מדי

    // בדיקה והמרה בהתאם
    if(isMostlyHeb(val)){
      // אם הקלידו באנגלית בטעות - המרה לעברית
      const converted = convertText(val, engToHebMap);
      if(converted !== val){
        if(target.value !== undefined) target.value = converted;
        else target.innerText = converted;
      }
    } else {
      // אם הקלידו בעברית בטעות - המרה לאנגלית
      const converted = convertText(val, hebToEngMap);
      if(converted !== val){
        if(target.value !== undefined) target.value = converted;
        else target.innerText = converted;
      }
    }
  }
});

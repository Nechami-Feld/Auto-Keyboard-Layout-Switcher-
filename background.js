chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "convertHebToEng",
    title: "המר עברית → אנגלית",
    contexts: ["selection"]
  });
  chrome.contextMenus.create({
    id: "convertEngToHeb",
    title: "המר אנגלית → עברית",
    contexts: ["selection"]
  });
  chrome.contextMenus.create({
    id: "convertAuto",
    title: "המר אוטומטית לפי שפה",
    contexts: ["selection"]
  });
});

// מיפוי אותיות
const hebToEngMap = {
  '/': 'q',
  '\'': 'w',
  'ק': 'e',
  'ר': 'r',
  'א': 't',
  'ט': 'y',
  'ו': 'u',
  'ן': 'i',
  'ם': 'o',
  'פ': 'p',
  ']': '[',
  '[': ']',
  'ש': 'a',
  'ד': 's',
  'ג': 'd',
  'כ': 'f',
  'ע': 'g',
  'י': 'h',
  'ח': 'j',
  'ל': 'k',
  'ך': 'l',
  'ף': ';',
  ',': '\'',
  '\\': '\\',  // כאן יש escape כפול
  'ז': 'z',
  'ס': 'x',
  'ב': 'c',
  'ה': 'v',
  'נ': 'b',
  'מ': 'n',
  'צ': 'm',
  'ת': ',',
  'ץ': '.',
  '.': '/',
  '\\': '\\'  // שוב escape כפול
};

const engToHebMap = {};
for (const [heb, eng] of Object.entries(hebToEngMap)) {
  engToHebMap[eng] = heb;
}

function convertText(text, map) {
  return text.split('').map(ch => {
    const lower = ch.toLowerCase();
    const converted = map[lower];
    if (!converted) return ch;
    return ch === ch.toUpperCase() ? converted.toUpperCase() : converted;
  }).join('');
}

function isMostlyHeb(text) {
  let hebCount = 0, engCount = 0;
  for (const ch of text.toLowerCase()) {
    if (hebToEngMap[ch]) hebCount++;
    else if (engToHebMap[ch]) engCount++;
  }
  return hebCount >= engCount;
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!info.selectionText || !tab.id) return;

  let converted = "";

  switch (info.menuItemId) {
    case "convertHebToEng":
      converted = convertText(info.selectionText, hebToEngMap);
      break;

    case "convertEngToHeb":
      converted = convertText(info.selectionText, engToHebMap);
      break;

    case "convertAuto":
      if (isMostlyHeb(info.selectionText)) {
        converted = convertText(info.selectionText, hebToEngMap);
      } else {
        converted = convertText(info.selectionText, engToHebMap);
      }
      break;

    default:
      return;
  }

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: replaceSelectedText,
    args: [converted]
  });
});

function replaceSelectedText(replacementText) {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  const range = selection.getRangeAt(0);
  range.deleteContents();
  range.insertNode(document.createTextNode(replacementText));

  selection.removeAllRanges();
  const newRange = document.createRange();
  newRange.setStart(range.startContainer, replacementText.length);
  newRange.collapse(true);
  selection.addRange(newRange);
}

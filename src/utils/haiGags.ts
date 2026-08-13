/**
 * הלוגיקה של "מה קרה לחי הפעם" — רשימת התקריות ובחירת התקרית הבאה.
 * יושב בנפרד מהרכיב כדי שקובץ הרכיב יייצא רכיבים בלבד (react-refresh).
 */

export const HAI_GAG_IDS = [
  "tomatoes",
  "falafel",
  "diapers",
  "frogs",
  "bees",
  "elephant",
] as const;

export type HaiGagId = (typeof HAI_GAG_IDS)[number];

const GAG_STORAGE_KEY = "quest-adventure:hai-gag-index";

/**
 * מחזיר את הגאג הבא במחזור ומקדם את המונה.
 * מחזור ולא הגרלה: כך כל שש התקריות נראות, ואף אחת לא חוזרת פעמיים ברצף.
 */
export const nextHaiGag = (): HaiGagId => {
  let index = 0;
  try {
    const stored = window.localStorage.getItem(GAG_STORAGE_KEY);
    const parsed = Number(stored);
    if (Number.isFinite(parsed)) index = parsed;
    window.localStorage.setItem(
      GAG_STORAGE_KEY,
      String((index + 1) % HAI_GAG_IDS.length),
    );
  } catch {
    // מצב פרטי או אחסון חסום — נופלים לגאג אקראי
    index = Math.floor(Math.random() * HAI_GAG_IDS.length);
  }
  return HAI_GAG_IDS[index % HAI_GAG_IDS.length];
};

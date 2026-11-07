const CHARACTER_VIDEO_BY_IMAGE: Record<string, string> = {
  // 7.11.2026: הסרטונים של תשע הדמויות הבאות הוחלפו בחדשים, ובכולם
  // המפלצת עושה לחי משהו כואב, מצחיק או משפיל: קוני, וריטי, סירן־הד,
  // מפלצת הצבי, הבוילד וואן, איש המעלית, הלוקסט, איש השמש והדוקטור.
  "dn_the-boiled-one.png": "/videos/doctor-nowhere/boiled-one.mp4",
  "dn_the-locust.png": "/videos/doctor-nowhere/locust.mp4",
  "dn_scary-elevator-man.png": "/videos/doctor-nowhere/elevator-man.mp4",
  "dn_jeppy-jothers.png": "/videos/doctor-nowhere/jeppy-jothers.mp4",
  "dn_filbus.png": "/videos/doctor-nowhere/filbus.mp4",
  "dn_the-doctor.png": "/videos/doctor-nowhere/the-doctor.mp4",
  "verity.png": "/videos/verity/verity.mp4",
  // סרטונים מהסבב הקודם נשארים מחוברים להרפתקאות שכבר נשמרו.
  "dn_crayon-craig.png": "/videos/doctor-nowhere/crayon-craig.mp4",
  "dn_cymbal-sawhand.png": "/videos/doctor-nowhere/cymbal-sawhand.mp4",
  "dn_johnny-smokestalk.png": "/videos/doctor-nowhere/johnny-smokestalk.mp4",
  "dn_sunman.png": "/videos/doctor-nowhere/sunman.mp4",
  // קוני, הקונוס השמן. דמות חדשה שנוצרה במיוחד לסבב הזה (29.8) -
  // היחידה מבין השבע שגם עוצבה מאפס ולא רק צולמה מחדש.
  "dn_cony.png": "/videos/doctor-nowhere/cony.mp4",
  // שתי דמויות חדשות (24.9). מ-7.11 גם להן סרטון וידאו אמיתי, כמו לכולן.
  "dn_deer-monster.png": "/videos/doctor-nowhere/deer-monster.mp4",
  "dn_siren-head.png": "/videos/doctor-nowhere/siren-head.mp4",
};

export const characterVideoFor = (imageUrl?: string) => {
  if (!imageUrl) return null;
  const fileName = imageUrl.split("/").pop();
  return fileName ? (CHARACTER_VIDEO_BY_IMAGE[fileName] ?? null) : null;
};

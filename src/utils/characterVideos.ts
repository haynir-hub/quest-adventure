const CHARACTER_VIDEO_BY_IMAGE: Record<string, string> = {
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
  // עולם "מונסטר חי": בסוף כל משימה רואים את חי האמיתי מנצח את חיבוט
  // בתחנה שבה חיבוט חיבל. הסרטון של משימה 7 הוא הניצחון הסופי.
  "mh_01_power.png": "/videos/monster-hai/mh_win_01_power.mp4",
  "mh_02_water.png": "/videos/monster-hai/mh_win_02_water.mp4",
  "mh_03_signal.png": "/videos/monster-hai/mh_win_03_signal.mp4",
  "mh_04_traffic.png": "/videos/monster-hai/mh_win_04_traffic.mp4",
  "mh_05_court.png": "/videos/monster-hai/mh_win_05_court.mp4",
  "mh_06_school.png": "/videos/monster-hai/mh_win_06_school.mp4",
  "mh_07_core.png": "/videos/monster-hai/mh_win_07_core.mp4",
};

export const characterVideoFor = (imageUrl?: string) => {
  if (!imageUrl) return null;
  const fileName = imageUrl.split("/").pop();
  return fileName ? CHARACTER_VIDEO_BY_IMAGE[fileName] ?? null : null;
};

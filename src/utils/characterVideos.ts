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
  // שתי דמויות חדשות (24.9). הסרטונים שלהן הם מתיחה סטטית מונפשת:
  // התמונה הופקה, והתנועה נוספה מקומית ב-ffmpeg ולא במודל וידאו.
  "dn_deer-monster.png": "/videos/doctor-nowhere/deer-monster.mp4",
  "dn_siren-head.png": "/videos/doctor-nowhere/siren-head.mp4",
  // עולם "מונסטר חי": בסוף כל משימה רואים את חי האמיתי מנצח את חיבוט
  // בתחנה שבה חיבוט חיבל. הסרטון של משימה 7 הוא הניצחון הסופי.
  "mh_01_power.png": "/videos/monster-hai/mh_win_01_power.mp4",
  "mh_02_water.png": "/videos/monster-hai/mh_win_02_water.mp4",
  "mh_03_signal.png": "/videos/monster-hai/mh_win_03_signal.mp4",
  "mh_04_traffic.png": "/videos/monster-hai/mh_win_04_traffic.mp4",
  "mh_05_court.png": "/videos/monster-hai/mh_win_05_court.mp4",
  "mh_06_school.png": "/videos/monster-hai/mh_win_06_school.mp4",
  "mh_07_core.png": "/videos/monster-hai/mh_win_07_core.mp4",
  // עולם "Doctor Nowhere נגד חיבוט": שבע מערכות של מלחמה אחת. הסרטון של
  // מערכה 5 הוא הנפילה - הוא היחיד שנגמר רע, בכוונה.
  "dw_01_alliance.png": "/videos/dn-war/dw_win_01_alliance.mp4",
  "dw_02_ambush.png": "/videos/dn-war/dw_win_02_ambush.mp4",
  "dw_03_clone-army.png": "/videos/dn-war/dw_win_03_clone-army.mp4",
  "dw_04_the-doctor.png": "/videos/dn-war/dw_win_04_the-doctor.mp4",
  "dw_05_the-fall.png": "/videos/dn-war/dw_win_05_the-fall.mp4",
  "dw_06_counterattack.png": "/videos/dn-war/dw_win_06_counterattack.mp4",
  "dw_07_final-battle.png": "/videos/dn-war/dw_win_07_final-battle.mp4",
  // יואב רובוט באותו עולם: שבע מתיחות, ובכולן יואב מנצח וחי נשאר מתוח.
  "yv_01_bucket.png": "/videos/dn-war/yv_prank_01_bucket.mp4",
  "yv_02_glue.png": "/videos/dn-war/yv_prank_02_glue.mp4",
  "yv_03_laces.png": "/videos/dn-war/yv_prank_03_laces.mp4",
  "yv_04_mustache.png": "/videos/dn-war/yv_prank_04_mustache.mp4",
  "yv_05_slime.png": "/videos/dn-war/yv_prank_05_slime.mp4",
  "yv_06_dunk.png": "/videos/dn-war/yv_prank_06_dunk.mp4",
  "yv_07_mummy.png": "/videos/dn-war/yv_prank_07_mummy.mp4",
  // עולם "יואב & חי": יואב וחי כמו במציאות, בלי רובוט. כל סרטון הוא המתיחה,
  // וסרטון 7 הוא הנקמה של חי שנגמרת כשהוא רטוב ויואב מנצח.
  "yh_01_salt.png": "/videos/yoav-hai/yh_prank_01_salt.mp4",
  "yh_02_cushion.png": "/videos/yoav-hai/yh_prank_02_cushion.mp4",
  "yh_03_spider.png": "/videos/yoav-hai/yh_prank_03_spider.mp4",
  "yh_04_wrap.png": "/videos/yoav-hai/yh_prank_04_wrap.mp4",
  "yh_05_balloons.png": "/videos/yoav-hai/yh_prank_05_balloons.mp4",
  "yh_06_pop.png": "/videos/yoav-hai/yh_prank_06_pop.mp4",
  "yh_07_hose.png": "/videos/yoav-hai/yh_prank_07_hose.mp4",
};

export const characterVideoFor = (imageUrl?: string) => {
  if (!imageUrl) return null;
  const fileName = imageUrl.split("/").pop();
  return fileName ? (CHARACTER_VIDEO_BY_IMAGE[fileName] ?? null) : null;
};

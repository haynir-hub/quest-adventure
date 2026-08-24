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
};

export const characterVideoFor = (imageUrl?: string) => {
  if (!imageUrl) return null;
  const fileName = imageUrl.split("/").pop();
  return fileName ? CHARACTER_VIDEO_BY_IMAGE[fileName] ?? null : null;
};

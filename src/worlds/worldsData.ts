export interface WorldData {
  id: string;
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  emoji: string;
  // תמונת הכרטיס בבורר העולמות. בלעדיה נלקחת התמונה של המשימה הראשונה,
  // ואז כל שינוי בסדר המשימות מחליף בשקט גם את הכרטיס.
  coverImage?: string;
  missions: {
    id: string;
    title: string;
    description: string;
    missionType: string;
    amount: number;
    emoji?: string;
    imageUrl?: string;
  }[];
}

export const worldsData: WorldData[] = [
  {
    id: "mario",
    name: "מריו",
    description:
      "עולם מופלא של פטריות, צינורות ירוקים ומטבעות זהב! כאן תצטרכו לרוץ מהר ולקפוץ גבוה כדי לנצח ולהגיע לטירה.",
    primaryColor: "#FF0000", // אדום
    secondaryColor: "#FFFF00", // צהוב
    emoji: "🍄",
    missions: [
      {
        id: "m1",
        title: "קפיצה על פטריה",
        description: "קפוץ 10 פעמים במקום הכי מהר שאפשר!",
        missionType: "JUMPS",
        amount: 10,
        emoji: "🍄",
      },
      {
        id: "m2",
        title: "ריצת אקספרס לטירה",
        description: "רוץ במקום 30 שניות בלי לעצור",
        missionType: "RUN",
        amount: 30,
        emoji: "🏰",
      },
      {
        id: "m3",
        title: "איסוף מטבעות זהב",
        description: "קפוץ גבוה באוויר 15 פעמים כדי להגיע לכל המטבעות",
        missionType: "JUMPS",
        amount: 15,
        emoji: "🪙",
      },
      {
        id: "m4",
        title: "בריחה מבאוזר",
        description: "בצע ספרינט מהיר (ריצה במקום) למשך 45 שניות",
        missionType: "RUN",
        amount: 45,
        emoji: "🔥",
      },
      {
        id: "m5",
        title: "דילוג מעל צבים",
        description: "קפוץ 20 פעמים כדי לדלג מעל כל הצבים בדרך לניצחון",
        missionType: "JUMPS",
        amount: 20,
        emoji: "🐢",
      },
    ],
  },
  {
    id: "pokemon",
    name: "פוקימון",
    description:
      "צאו למסע בעשב הגבוה כדי לחפש ולמצוא פוקימונים נדירים! התאמנו איתם בקרבות מכון והשלימו את הפוקדקס.",
    primaryColor: "#FFFF00", // צהוב
    secondaryColor: "#0000FF", // כחול
    emoji: "⚡",
    missions: [
      {
        id: "p1",
        title: "זמן איכות בעשב הגבוה",
        description: "הליכה במקום 60 שניות (חיפוש בפינות הנסתרות)",
        missionType: "WALK",
        amount: 60,
        emoji: "🌿",
        imageUrl: "/images/pokemon_bulbasaur.png",
      },
      {
        id: "p2",
        title: "אימון של מאצ'אמפ",
        description: "בצע 15 שכיבות סמיכה (כדי לחזק את יד ימין כמו צ'אריזארד!)",
        missionType: "PUSHUPS",
        amount: 15,
        emoji: "💪",
        imageUrl: "/images/pokemon_charmander.png",
      },
      {
        id: "p3",
        title: "הליכה לעיר הבאה",
        description: "הליכה רגועה במקום למשך 40 שניות",
        missionType: "WALK",
        amount: 40,
        emoji: "🗺️",
        imageUrl: "/images/pokemon_squirtle.png",
      },
      {
        id: "p4",
        title: "התחמקות ממכת ברק",
        description: "בצע 10 שכיבות סמיכה הכי מהר שתוכל",
        missionType: "PUSHUPS",
        amount: 10,
        emoji: "⚡",
        imageUrl: "/images/pokemon_pikachu.png",
      },
      {
        id: "p5",
        title: "צעדה לניצחון במכון",
        description: "הליכה בקצב בינוני למשך 50 שניות",
        missionType: "WALK",
        amount: 50,
        emoji: "🏆",
        imageUrl: "/images/pokemon_mewtwo.png",
      },
    ],
  },
  {
    id: "doctor",
    name: "Doctor Nowhere",
    description:
      "אימה אנלוגית. היצורים יוצאים מבעד למסכים הישנים ורודפים אחרי הצופה. ברחו, התחבאו, ואל תיתנו להם לתפוס אתכם לפני שהאות נחתך.",
    primaryColor: "#B91C1C", // אדום דם
    secondaryColor: "#0F0F0F", // שחור-מסך
    emoji: "📺",
    missions: [
      {
        id: "dn1",
        title: "בריחה מהבוילד וואן",
        description: "רוץ במקום כדי לברוח מהבוילד וואן לפני שהאות ייעלם",
        missionType: "RUN",
        amount: 45,
        emoji: "🫧",
        imageUrl: "/images/doctor-nowhere/dn_the-boiled-one.png",
      },
      {
        id: "dn2",
        title: "קיפאון מול הלוקסט",
        description: "קפא בפלאנק ואל תזוז כשהלוקסט פורץ מבעד למסך",
        missionType: "PLANK",
        amount: 40,
        emoji: "🦗",
        imageUrl: "/images/doctor-nowhere/dn_the-locust.png",
      },
      {
        id: "dn3",
        title: "דילוג מעל ספיינמן",
        description: "קפוץ מעל עמוד השדרה המתפתל של ספיינמן",
        missionType: "JUMPS",
        amount: 15,
        emoji: "🦴",
        imageUrl: "/images/doctor-nowhere/dn_spineman.png",
      },
      {
        id: "dn4",
        title: "התרחקות מאיש הכובע",
        description: "רוץ בשקט והתרחק מאיש הכובע שעוקב אחריך",
        missionType: "RUN",
        amount: 30,
        emoji: "🎩",
        imageUrl: "/images/doctor-nowhere/dn_hat-man.png",
      },
      {
        id: "dn5",
        title: "יקיצה מאיש הסיוטים",
        description: "קפוץ מהר כדי להתעורר ולברוח מאיש הסיוטים",
        missionType: "JUMPS",
        amount: 20,
        emoji: "😱",
        imageUrl: "/images/doctor-nowhere/dn_nightmare-man.png",
      },
      {
        id: "dn6",
        title: "התגנבות מתחת לקרניים",
        description:
          "מפלצת הצבי תלתה לך את הכובע גבוה על הקרניים. זחל מתחתיה בשקט כדי לקחת אותו בחזרה",
        missionType: "CRAWL",
        amount: 12,
        emoji: "🦌",
        imageUrl: "/images/doctor-nowhere/dn_deer-monster.png",
      },
      {
        id: "dn7",
        title: "לקום אחרי הצפירה",
        description:
          "סירן־הד צפר לך באוזן והפיל אותך. עשה שכיבות סמיכה כדי לקום לפני הצפירה הבאה",
        missionType: "PUSHUPS",
        amount: 10,
        emoji: "📢",
        imageUrl: "/images/doctor-nowhere/dn_siren-head.png",
      },
    ],
  },
];

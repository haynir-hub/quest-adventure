export interface WorldData {
  id: string;
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  emoji: string;
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
    id: "poppy",
    name: "פופי פלייטיים",
    description:
      "חקרו את מפעל הצעצועים הנטוש של פלייטיים-קו. שמרו על שקט - לא כל הצעצועים ידידותיים. גלו את כל הדמויות והתחמקו מהמפלצות!",
    primaryColor: "#7C3AED", // סגול (CatNap)
    secondaryColor: "#EC4899", // ורוד (Kissy Missy)
    emoji: "🧸",
    missions: [
      {
        id: "pp1",
        title: "התחמקות מהאגי וואגי",
        description: "רוץ מהר במקום 45 שניות כדי לברוח מהאגי!",
        missionType: "RUN",
        amount: 45,
        emoji: "🧸",
        imageUrl: "/images/poppy-playtime/poppy_huggy-wuggy.png",
      },
      {
        id: "pp2",
        title: "מציאת קיסי מיסי",
        description: "בצע 12 קפיצות כדי להגיע אליה לפני האג'י!",
        missionType: "JUMPS",
        amount: 12,
        emoji: "💗",
        imageUrl: "/images/poppy-playtime/poppy_kissy-missy.png",
      },
      {
        id: "pp3",
        title: "מעבר במנהרת המיני האגיז",
        description: "זחל למרחק 15 קדימה ואחורה כדי לעבור את המנהרה הצרה",
        missionType: "CRAWL",
        amount: 15,
        emoji: "👶",
        imageUrl: "/images/poppy-playtime/poppy_mini-huggies.png",
      },
      {
        id: "pp4",
        title: "התחבאות מקאטנאפ",
        description: "הישאר בפלאנק 40 שניות בלי להזיז שריר!",
        missionType: "PLANK",
        amount: 40,
        emoji: "😼",
        imageUrl: "/images/poppy-playtime/poppy_catnap.png",
      },
      {
        id: "pp5",
        title: "בריחה ממאמי לונג לגז",
        description: "בצע 20 קפיצות מהירות כדי לחמוק מהרגליים שלה",
        missionType: "JUMPS",
        amount: 20,
        emoji: "🕷️",
        imageUrl: "/images/poppy-playtime/poppy_mommy-long-legs.png",
      },
    ],
  },
  {
    id: "fnaf",
    name: "Bite by Night",
    description:
      "לילה אחד. חמישה לילות. האנימטרוניקים מתעוררים בחשכה ואתם צריכים לשרוד עד עלות השחר. הסתתרו, רוצו, ואל תתנו להם לתפוס אתכם!",
    primaryColor: "#5C2D91",
    secondaryColor: "#FF6B00",
    emoji: "🌙",
    missions: [
      {
        id: "fn1",
        title: "בריחה מספרינגטראפ",
        description: "שניות ריצה מהירה במקום",
        missionType: "RUN",
        amount: 45,
        emoji: "🟢",
        imageUrl: "/images/fnaf-originals/Springtrap.png",
      },
      {
        id: "fn2",
        title: "התחבאות מהמחקה",
        description: "שניות פלאנק דוממות — אל תזוז",
        missionType: "PLANK",
        amount: 40,
        emoji: "🪞",
        imageUrl: "/images/fnaf-originals/The%20Mimic.png",
      },
      {
        id: "fn3",
        title: "קפיצה מעל חוטי אנארד",
        description: "קפיצות מעל החוטים",
        missionType: "JUMPS",
        amount: 15,
        emoji: "🔌",
        imageUrl: "/images/fnaf-originals/Ennard.png",
      },
      {
        id: "fn4",
        title: "ריצה מ'מים אנארד'",
        description: "שניות ריצה שקטה — הוא שומע הכל",
        missionType: "RUN",
        amount: 30,
        emoji: "🤫",
        imageUrl: "/images/fnaf-originals/Mime%20Ennard.png",
      },
      {
        id: "fn5",
        title: "דילוג מעל ספגטי אנארד",
        description: "קפיצות בזריזות מהמבוך",
        missionType: "JUMPS",
        amount: 20,
        emoji: "🍝",
        imageUrl: "/images/fnaf-originals/Spaghetti%20Ennard.png",
      },
    ],
  },
  {
    id: "treasure",
    name: "אוצרות",
    description:
      "צללו עמוק לאיים נסתרים ולמערות חשוכות כדי למצוא תיבות זהב, יהלומים וכתרים עתיקים שנשכחו לפני שנים.",
    primaryColor: "#FFA500", // כתום
    secondaryColor: "#8B4513", // חום
    emoji: "💎",
    missions: [
      {
        id: "t1",
        title: "זחילה מתחת לקורי עכביש",
        description:
          "זחילה על הרצפה במעין מבוך קורי עכביש למרחק קצר (10 קדימה ואחורה)",
        missionType: "CRAWL",
        amount: 10,
        emoji: "🕷️",
      },
      {
        id: "t2",
        title: "שקט כמו דג",
        description:
          "הישאר בתנוחת פלאנק למשך 30 שניות כדי שהשומרים לא ישמעו אותך",
        missionType: "PLANK",
        amount: 30,
        emoji: "🤫",
      },
      {
        id: "t3",
        title: "מעבר במערה הצרה",
        description: "זחילה על 6 למרחק 15 קדימה ואחורה",
        missionType: "CRAWL",
        amount: 15,
        emoji: "🦇",
      },
      {
        id: "t4",
        title: "התכוננות לפתיחת התיבה",
        description: "הישאר במצב פלאנק ל-45 שניות בזמן ששותפך מנטרל את המלכודת",
        missionType: "PLANK",
        amount: 45,
        emoji: "🗝️",
      },
      {
        id: "t5",
        title: "זחל ליהלום",
        description: "זחל הכי מהר אל תיבת האוצר - 20 נקודות מרחק (20 זחילות)",
        missionType: "CRAWL",
        amount: 20,
        emoji: "💎",
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
    ],
  },
  {
    id: "monster",
    name: "מונסטר חי",
    description:
      "חיבוט — שיבוט מכני של חי — ברח מהמעבדה והוא מחבל בעיר תחנה אחר תחנה. בכל משימה הוא משבית משהו אחר, ואתם אלה שנותנים לחי את הכוח לעצור אותו. שבע תחנות, קרב אחד אחרון.",
    primaryColor: "#DC2626", // אדום ליבה
    secondaryColor: "#0B1120", // כחול-פלדה כהה
    emoji: "🤖",
    missions: [
      {
        id: "mh1",
        title: "חיבוט מנתק את החשמל",
        description:
          "חיבוט תלש את הכבל הראשי והשכונה שקעה בחושך. קפצו במקום כדי להטעין את הגנרטור ולהחזיר את האור",
        missionType: "JUMPS",
        amount: 15,
        emoji: "⚡",
        imageUrl: "/images/monster-hai/mh_01_power.png",
      },
      {
        id: "mh2",
        title: "חיבוט סוגר את המים",
        description:
          "חיבוט סגר את ברז המים הראשי של העיר. זחלו בתוך צינור המים עד השסתום כדי לפתוח אותו מחדש",
        missionType: "CRAWL",
        amount: 12,
        emoji: "💧",
        imageUrl: "/images/monster-hai/mh_02_water.png",
      },
      {
        id: "mh3",
        title: "חיבוט מנפץ את האנטנה",
        description:
          "אין קליטה, אין קשר, אף אחד לא יכול לקרוא לעזרה. רוצו במקום כדי להעביר את ההודעה ברגל",
        missionType: "RUN",
        amount: 40,
        emoji: "📡",
        imageUrl: "/images/monster-hai/mh_03_signal.png",
      },
      {
        id: "mh4",
        title: "חיבוט משגע את הרמזורים",
        description:
          "כל הרמזורים בעיר נתקעו על אדום. צעדו במקום בקצב ויציב כדי להעביר את כולם בבטחה",
        missionType: "WALK",
        amount: 45,
        emoji: "🚦",
        imageUrl: "/images/monster-hai/mh_04_traffic.png",
      },
      {
        id: "mh5",
        title: "חיבוט הורס את המגרש",
        description:
          "חיבוט עיקם את הסל במגרש הכדורסל. עשו שכיבות סמיכה כדי לאסוף כוח וליישר אותו בחזרה",
        missionType: "PUSHUPS",
        amount: 10,
        emoji: "🏀",
        imageUrl: "/images/monster-hai/mh_05_court.png",
      },
      {
        id: "mh6",
        title: "חיבוט נועל את בית הספר",
        description:
          "חיבוט ריתך שרשראות על השער. החזיקו פלאנק ותחזיקו את השער פתוח עד שכולם ייצאו",
        missionType: "PLANK",
        amount: 40,
        emoji: "🏫",
        imageUrl: "/images/monster-hai/mh_06_school.png",
      },
      {
        id: "mh7",
        title: "הקרב האחרון מול חיבוט",
        description:
          "חיבוט הפעיל את מכונת השיבוט והוא מייצר עוד כמוהו. זה הקרב האחרון — רוצו במקום בכל הכוח ותנו לחי לסיים את זה",
        missionType: "RUN",
        amount: 60,
        emoji: "🔥",
        imageUrl: "/images/monster-hai/mh_07_core.png",
      },
    ],
  },
];

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
];

export type WorldTheme = {
  adventureIntro: string;
  missionPointName: string;
  missionWrapper: (desc: string, amount: number | string) => string;
  rewardText: string;
  rewardEmoji: string;
  characterName: string;
  missionEntities: { name: string; emoji: string; imageUrl?: string }[];
  entityLabel: string;
  catchItemImage?: string;
  catchItemEmoji?: string;
};

export const worldThemes: Record<string, WorldTheme> = {
  mario: {
    adventureIntro:
      "הצילו! הנסיכה נחטפה! עזור למריו לעבור את המכשולים בדרך לטירה.",
    missionPointName: "טירה",
    missionWrapper: (desc: string, amount: number | string) =>
      `מריו צריך ${amount} ${desc} כדי להציל את הממלכה!`,
    rewardText: "כוכב כוח",
    rewardEmoji: "⭐",
    characterName: "מריו",
    missionEntities: [
      { name: "גומבה", emoji: "🍄" },
      { name: "קופה טרופה", emoji: "🐢" },
      { name: "פרח אש", emoji: "🔥" },
      { name: "פטריה קסומה", emoji: "🍄" },
      { name: "כוכב", emoji: "⭐" },
      { name: "מטבע זהב", emoji: "🪙" },
    ],
    entityLabel: "בחרו חפץ או אויב למשימה:",
    catchItemEmoji: "🔥",
  },
  pokemon: {
    adventureIntro:
      "ברוכים הבאים למחוז קנטו! הגיע הזמן לאמן את הפוקימונים שלכם לקראת מנהיג המכון.",
    missionPointName: "ג'ים",
    missionWrapper: (desc: string, amount: number | string) =>
      `המאמן שלך צריך ${amount} ${desc} לפני הקרב!`,
    rewardText: "תג מכון",
    rewardEmoji: "⚡",
    characterName: "פוקימון",
    missionEntities: [
      { name: "פיקאצ'ו", emoji: "⚡", imageUrl: "/images/pokemon_pikachu.png" },
      {
        name: "צ'רמנדר",
        emoji: "🔥",
        imageUrl: "/images/pokemon_charmander.png",
      },
      {
        name: "בלבאזור",
        emoji: "🌿",
        imageUrl: "/images/pokemon_bulbasaur.png",
      },
      {
        name: "סקוויטל",
        emoji: "💧",
        imageUrl: "/images/pokemon_squirtle.png",
      },
      {
        name: "ג'יגליפאף",
        emoji: "🎵",
        imageUrl: "/images/pokemon_jigglypuff.png",
      },
      { name: "איווי", emoji: "🦊", imageUrl: "/images/pokemon_eevee.png" },
      { name: "מיוטו", emoji: "🔮", imageUrl: "/images/pokemon_mewtwo.png" },
    ],
    entityLabel: "איזה פוקימון תרצו לתפוס?",
    catchItemImage: "/images/ui_pokeball.png",
  },
  treasures: {
    adventureIntro: "אהוי מאטי! מפת האוצר מראה שהשלל נמצא ממש קרוב!",
    missionPointName: "סימן",
    missionWrapper: (desc: string, amount: number | string) =>
      `הפיראט האמיץ יעשה ${amount} ${desc} כדי למצוא את האוצר!`,
    rewardText: "מטבע זהב",
    rewardEmoji: "💰",
    characterName: "פיראט",
    missionEntities: [
      { name: "תיבת זהב יוקרתית", emoji: "📦" },
      { name: "יהלום כחול", emoji: "💎" },
      { name: "כתר עתיק", emoji: "👑" },
      { name: "מפה בבקבוק", emoji: "🗺️" },
      { name: "מצפן מכושף", emoji: "🧭" },
      { name: "שק מטבעות רובי", emoji: "💰" },
      { name: "חרב פיראטים נדירה", emoji: "🗡️" },
    ],
    entityLabel: "איזה אוצר נחפש במשימה זו?",
    catchItemEmoji: "🪝",
  },
};

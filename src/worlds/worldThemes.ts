export type WorldTheme = {
  adventureIntro: string;
  missionPointName: string;
  missionWrapper: (desc: string, amount: number | string) => string;
  rewardText: string;
  rewardEmoji: string;
  characterName: string;
  missionEntities: {
    name: string;
    emoji: string;
    imageUrl?: string;
    description?: string;
  }[];
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
      {
        name: "סנורלאקס",
        emoji: "😴",
        imageUrl: "/images/pokemon_snorlax.png",
      },
      {
        name: "סלואופוק",
        emoji: "🌀",
        imageUrl: "/images/pokemon_slowpoke.png",
      },
      { name: "פסיידק", emoji: "🦆", imageUrl: "/images/pokemon_psyduck.png" },
      { name: "מיאו", emoji: "🐱", imageUrl: "/images/pokemon_meowth.png" },
      {
        name: "מג׳יקרפ",
        emoji: "🐟",
        imageUrl: "/images/pokemon_magikarp.png",
      },
      { name: "לארפס", emoji: "🧊", imageUrl: "/images/pokemon_lapras.png" },
      { name: "גיאודוד", emoji: "🪨", imageUrl: "/images/pokemon_geodude.png" },
      { name: "גנגר", emoji: "👻", imageUrl: "/images/pokemon_gengar.png" },
      {
        name: "צ׳ריזארד",
        emoji: "🔥",
        imageUrl: "/images/pokemon_charizard.png",
      },
    ],
    entityLabel: "איזה פוקימון תרצו לתפוס?",
    catchItemImage: "/images/ui_pokeball.png",
  },
  doctor: {
    adventureIntro:
      "אות חלש נקלט בטלוויזיה הישנה. היצורים של Doctor Nowhere מתחילים לזחול מבעד למסך — שרדו עד שהשידור ייחתך.",
    missionPointName: "אות",
    // הטקסט לא נועל שם יצור כללי — שם הדמות שנבחרה מגיע מהתיאור עצמו,
    // כך שהמשפט שמופיע במסך המשימה תמיד מתאים לדמות שבחרת.
    missionWrapper: (desc: string, amount: number | string) =>
      `${desc} — נותרו לך ${amount} לפני שהוא יוצא מהמסך!`,
    rewardText: "קלטת ששרדה",
    rewardEmoji: "📼",
    characterName: "הצופה",
    missionEntities: [
      {
        name: "הבוילד וואן",
        emoji: "🫧",
        imageUrl: "/images/doctor-nowhere/dn_the-boiled-one.png",
        description:
          "דמות אדומה ומותכת בעלת פנים רותחות. אחד היצורים המרכזיים והמזוהים ביותר של Doctor Nowhere.",
      },
      {
        name: "הלוקסט",
        emoji: "🦗",
        imageUrl: "/images/doctor-nowhere/dn_the-locust.png",
        description:
          "יצור שחור, גבוה ורזה עם פנים אנושיות מעוותות. פורץ מבעד למסכים כדי לתפוס את הצופה — מהיר במיוחד.",
      },
      {
        name: "פילבוס",
        emoji: "🎩",
        imageUrl: "/images/doctor-nowhere/dn_filbus.png",
        description:
          "דמות הומנואידית מוזרה עם מגבעת קטנה ורגלי כיסא. מהפנט את הצופים ומפיץ את 'פילביזם'.",
      },
      {
        name: "ג'פי ג'אד'רס",
        emoji: "🧍",
        imageUrl: "/images/doctor-nowhere/dn_jeppy-jothers.png",
        description: "דמות ביזארית מסדרת היצורים של Doctor Nowhere.",
      },
      {
        name: "הדוקטור",
        emoji: "🩺",
        imageUrl: "/images/doctor-nowhere/dn_the-doctor.png",
        description: "הדמות שמאחורי השם — Doctor Nowhere בכבודו ובעצמו.",
      },
      {
        name: "איש הסיוטים",
        emoji: "😱",
        imageUrl: "/images/doctor-nowhere/dn_nightmare-man.png",
        description: "ישות גבוהה ומאיימת שרודפת אחרי הצופה דרך החלומות.",
      },
      {
        name: "איש הכובע",
        emoji: "🎩",
        imageUrl: "/images/doctor-nowhere/dn_hat-man.png",
        description: "צללית כהה עם מגבעת שעומדת בשקט בקצה החדר ועוקבת אחריך.",
      },
      {
        name: "ספיינמן",
        emoji: "🦴",
        imageUrl: "/images/doctor-nowhere/dn_spineman.png",
        description: "יצור ארוך ומעוות שגופו עשוי עמוד שדרה מתפתל.",
      },
      {
        name: "מפלצת הצבי",
        emoji: "🦌",
        imageUrl: "/images/doctor-nowhere/dn_deer-monster.png",
        description:
          "יצור יער גבוה וצנום עם ראש של צבי וקרניים ענפות. אוהב לתלות לך דברים גבוה על הקרניים ולהעמיד פנים שזה לא הוא.",
      },
      {
        name: "סירן־הד",
        emoji: "📢",
        imageUrl: "/images/doctor-nowhere/dn_siren-head.png",
        description:
          "עמוד מתכת חלוד וגבוה מאוד ששני רמקולי צפירה במקום ראש. מתגנב מאחוריך וצופר פתאום רק כדי לראות אותך קופץ.",
      },
      {
        name: "איש הבשר",
        emoji: "🥩",
        imageUrl: "/images/doctor-nowhere/dn_meat-man.png",
        description: "גוש בשר הומנואידי מהמם ומעורר חלחלה.",
      },
      {
        name: "הצוואר הארוך",
        emoji: "🦒",
        imageUrl: "/images/doctor-nowhere/dn_the-long-neck.png",
        description: "ישות עם צוואר ארוך ובלתי טבעי שמשקיפה מעל הכל.",
      },
      {
        name: "איש הכביש",
        emoji: "🛣️",
        imageUrl: "/images/doctor-nowhere/dn_the-highway-man.png",
        description: "דמות שמופיעה בכבישים ריקים בלילה.",
      },
      {
        name: "קרייג הצבעים",
        emoji: "🖍️",
        imageUrl: "/images/doctor-nowhere/dn_crayon-craig.png",
        description: "דמות ילדותית בצבעי פנדה שמסתירה משהו מטריד.",
      },
      {
        name: "ג'וני סמוקסטוק",
        emoji: "🚬",
        imageUrl: "/images/doctor-nowhere/dn_johnny-smokestalk.png",
        description: "יצור עשן מסדרת היצורים של Doctor Nowhere.",
      },
      {
        name: "מר גלאבסוורת'",
        emoji: "🧤",
        imageUrl: "/images/doctor-nowhere/dn_mr-glovesworth.png",
        description: "ישות מנומסת ומאיימת שמתבוננת בך מהצללים.",
      },
      {
        name: "אוהב המלפפונים",
        emoji: "🥒",
        imageUrl: "/images/doctor-nowhere/dn_pickle-lover.png",
        description: "דמות מוזרה ולא צפויה מהעולם של Doctor Nowhere.",
      },
      {
        name: "ראש הגידול",
        emoji: "🧠",
        imageUrl: "/images/doctor-nowhere/dn_tumor-head.png",
        description: "יצור שראשו מכוסה כולו בגידולים.",
      },
      {
        name: "סימבל סוהאנד",
        emoji: "🥁",
        imageUrl: "/images/doctor-nowhere/dn_cymbal-sawhand.png",
        description: "דמות עם מצילתיים וידיים-מסור שמשמיעה קולות מתכת.",
      },
      {
        name: "איש המעלית",
        emoji: "🛗",
        imageUrl: "/images/doctor-nowhere/dn_scary-elevator-man.png",
        description: "ישות שממתינה לך בתוך מעלית חשוכה.",
      },
      {
        name: "הפרעוש",
        emoji: "🪰",
        imageUrl: "/images/doctor-nowhere/dn_the-flea.png",
        description: "יצור קופצני וזריז שקשה לחמוק ממנו.",
      },
      {
        name: "המצורע הגדול",
        emoji: "🧟",
        imageUrl: "/images/doctor-nowhere/dn_the-great-leper.png",
        description: "ישות ענקית ומתפוררת מהעולם של Doctor Nowhere.",
      },
      {
        name: "איש השמש",
        emoji: "☀️",
        imageUrl: "/images/doctor-nowhere/dn_sunman.png",
        description: "פרצוף שמש מאיים שאי אפשר להפסיק להביט בו.",
      },
      {
        name: "קוני",
        emoji: "🚧",
        imageUrl: "/images/doctor-nowhere/dn_cony.png",
        description:
          "קונוס תנועה כתום, עגול ושמן, עם עיניים גדולות ותמימות. נראה חמוד לגמרי — עד שאתה נתקל בו.",
      },
      {
        name: "וריטי",
        emoji: "🟡",
        imageUrl: "/images/verity/verity.png",
        description:
          "היצור הצהוב ממוד האימה של Minecraft. הוא נראה ידידותי בהתחלה, אבל יודע עליך יותר מדי.",
      },
    ],
    entityLabel: "איזה יצור יופיע מבעד למסך?",
    catchItemEmoji: "🔦",
  },
};

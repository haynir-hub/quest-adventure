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
  poppy: {
    adventureIntro:
      "ברוכים הבאים למפעל פלייטיים-קו. שמרו על שקט - לא כל הדמויות פה ידידותיות...",
    missionPointName: "תחנה",
    missionWrapper: (desc: string, amount: number | string) =>
      `כדי להמשיך לתחנה הבאה, השלימו ${amount} ${desc} בלי שיתפסו אתכם!`,
    rewardText: "טוקן GrabPack",
    rewardEmoji: "🧸",
    characterName: "החוקר",
    missionEntities: [
      // Chapter 1
      {
        name: "פופי פלייטיים",
        emoji: "🎀",
        imageUrl: "/images/poppy-playtime/poppy_poppy-playtime.png",
      },
      {
        name: "האגי וואגי",
        emoji: "🧸",
        imageUrl: "/images/poppy-playtime/poppy_huggy-wuggy.png",
      },
      {
        name: "קאט-בי",
        emoji: "🐝",
        imageUrl: "/images/poppy-playtime/poppy_cat-bee.png",
      },
      {
        name: "קנדי קאט",
        emoji: "🍬",
        imageUrl: "/images/poppy-playtime/poppy_candy-cat.png",
      },
      {
        name: "בוגי בוט",
        emoji: "🤖",
        imageUrl: "/images/poppy-playtime/poppy_boogie-bot.png",
      },
      {
        name: "ברון",
        emoji: "🦕",
        imageUrl: "/images/poppy-playtime/poppy_bron.png",
      },
      // Chapter 2
      {
        name: "מאמי לונג לגז",
        emoji: "🕷️",
        imageUrl: "/images/poppy-playtime/poppy_mommy-long-legs.png",
      },
      {
        name: "קיסי מיסי",
        emoji: "💗",
        imageUrl: "/images/poppy-playtime/poppy_kissy-missy.png",
      },
      {
        name: "באנזו באני",
        emoji: "🐰",
        imageUrl: "/images/poppy-playtime/poppy_bunzo-bunny.png",
      },
      {
        name: "מיני האגיז",
        emoji: "👶",
        imageUrl: "/images/poppy-playtime/poppy_mini-huggies.png",
      },
      {
        name: "פי-ג׳יי פאג-א-פילר",
        emoji: "🐛",
        imageUrl: "/images/poppy-playtime/poppy_pj-pug-a-pillar.png",
      },
      {
        name: "בארי",
        emoji: "🛒",
        imageUrl: "/images/poppy-playtime/poppy_barry.png",
      },
      {
        name: "דייזי",
        emoji: "🌸",
        imageUrl: "/images/poppy-playtime/poppy_daisy.png",
      },
      {
        name: "דאדי לונג לגז",
        emoji: "🕸️",
        imageUrl: "/images/poppy-playtime/poppy_daddy-long-legs.png",
      },
      {
        name: "בייבי לונג לגז",
        emoji: "👶",
        imageUrl: "/images/poppy-playtime/poppy_baby-long-legs.png",
      },
      {
        name: "פטיט פוץ׳",
        emoji: "🐶",
        imageUrl: "/images/poppy-playtime/poppy_petite-pooch.png",
      },
      // Rejected toys
      {
        name: "סר פופס-א-לוט",
        emoji: "🚽",
        imageUrl: "/images/poppy-playtime/poppy_sir-poops-a-lot.png",
      },
      {
        name: "קיק-מי פול",
        emoji: "👟",
        imageUrl: "/images/poppy-playtime/poppy_kick-me-paul.png",
      },
      {
        name: "אוון התנור",
        emoji: "🔥",
        imageUrl: "/images/poppy-playtime/poppy_owen-the-oven.png",
      },
      {
        name: "פט סטון",
        emoji: "🪨",
        imageUrl: "/images/poppy-playtime/poppy_pet-stone.png",
      },
      {
        name: "סאני באדי",
        emoji: "🌻",
        imageUrl: "/images/poppy-playtime/poppy_sunni-buddi.png",
      },
      {
        name: "חבית של האגיז",
        emoji: "🛢️",
        imageUrl: "/images/poppy-playtime/poppy_barrel-o-huggys.png",
      },
      {
        name: "ארנב הפתעה",
        emoji: "🥚",
        imageUrl: "/images/poppy-playtime/poppy_surprise-hare.png",
      },
      {
        name: "לאב באג",
        emoji: "🦋",
        imageUrl: "/images/poppy-playtime/poppy_love-bug.png",
      },
      // Chapter 3 — Smiling Critters
      {
        name: "קאטנאפ",
        emoji: "😼",
        imageUrl: "/images/poppy-playtime/poppy_catnap.png",
      },
      {
        name: "דוגדיי",
        emoji: "🐕",
        imageUrl: "/images/poppy-playtime/poppy_dogday.png",
      },
      {
        name: "קיקין צ׳יקן",
        emoji: "🐔",
        imageUrl: "/images/poppy-playtime/poppy_kickinchicken.png",
      },
      {
        name: "קראפטיקורן",
        emoji: "🦄",
        imageUrl: "/images/poppy-playtime/poppy_craftycorn.png",
      },
      {
        name: "בובא בובאפנט",
        emoji: "🐘",
        imageUrl: "/images/poppy-playtime/poppy_bubba-bubbaphant.png",
      },
      {
        name: "בובי בירהאג",
        emoji: "🐻",
        imageUrl: "/images/poppy-playtime/poppy_bobby-bearhug.png",
      },
      {
        name: "פיקי פיגי",
        emoji: "🐷",
        imageUrl: "/images/poppy-playtime/poppy_picky-piggy.png",
      },
      {
        name: "הופי הופסקוץ׳",
        emoji: "🐰",
        imageUrl: "/images/poppy-playtime/poppy_hoppy-hopscotch.png",
      },
      {
        name: "קריטרים הרוסים",
        emoji: "💀",
        imageUrl: "/images/poppy-playtime/poppy_ruined-critters.png",
      },
      {
        name: "הפרוטוטיפ",
        emoji: "🦾",
        imageUrl: "/images/poppy-playtime/poppy_the-prototype.png",
      },
      {
        name: "מיס דילייט",
        emoji: "👩‍🏫",
        imageUrl: "/images/poppy-playtime/poppy_miss-delight.png",
      },
      // Chapter 4 — Safe Haven
      {
        name: "דואי הדואמן",
        emoji: "🥖",
        imageUrl: "/images/poppy-playtime/poppy_doey-the-doughman.png",
      },
      {
        name: "ד״ר הארלי סאוייר",
        emoji: "🥽",
        imageUrl: "/images/poppy-playtime/poppy_dr-harley-sawyer.png",
      },
      {
        name: "יארנאבי",
        emoji: "🦁",
        imageUrl: "/images/poppy-playtime/poppy_yarnaby.png",
      },
      {
        name: "פיאנוזאורוס",
        emoji: "🎹",
        imageUrl: "/images/poppy-playtime/poppy_pianosaurus.png",
      },
      // Nightmare Critters
      {
        name: "באבא צ׳ופס",
        emoji: "🦷",
        imageUrl: "/images/poppy-playtime/poppy_baba-chops.png",
      },
      {
        name: "איקי ליקי",
        emoji: "👅",
        imageUrl: "/images/poppy-playtime/poppy_icky-licky.png",
      },
      {
        name: "רייבי בייבי",
        emoji: "👶",
        imageUrl: "/images/poppy-playtime/poppy_rabie-baby.png",
      },
      {
        name: "אליסטר גייטור",
        emoji: "🐊",
        imageUrl: "/images/poppy-playtime/poppy_allister-gator.png",
      },
      {
        name: "סיימון סמוק",
        emoji: "💨",
        imageUrl: "/images/poppy-playtime/poppy_simon-smoke.png",
      },
      {
        name: "פו",
        emoji: "🐦‍⬛",
        imageUrl: "/images/poppy-playtime/poppy_poe.png",
      },
      {
        name: "טואיי",
        emoji: "🍳",
        imageUrl: "/images/poppy-playtime/poppy_touille.png",
      },
      {
        name: "מאגי מאקו",
        emoji: "🦈",
        imageUrl: "/images/poppy-playtime/poppy_maggie-mako.png",
      },
      // Chapter 5 — Broken Things
      {
        name: "גיבלט",
        emoji: "🦃",
        imageUrl: "/images/poppy-playtime/poppy_giblet.png",
      },
      {
        name: "צ׳אם צ׳ומפקינז",
        emoji: "🐡",
        imageUrl: "/images/poppy-playtime/poppy_chum-chompkins.png",
      },
      {
        name: "לילי לאבברייד",
        emoji: "👧",
        imageUrl: "/images/poppy-playtime/poppy_lily-lovebraids.png",
      },
      // Wrongside Outimals
      {
        name: "באבי צ׳אמז",
        emoji: "🍭",
        imageUrl: "/images/poppy-playtime/poppy_bubby-chumz.png",
      },
      {
        name: "בלנקי בלאנקז",
        emoji: "🛏️",
        imageUrl: "/images/poppy-playtime/poppy_blanky-blankz.png",
      },
      {
        name: "דודל בונס",
        emoji: "🦴",
        imageUrl: "/images/poppy-playtime/poppy_doodle-bones.png",
      },
      {
        name: "בינדל בוגי",
        emoji: "🎒",
        imageUrl: "/images/poppy-playtime/poppy_bindle-boogie.png",
      },
      {
        name: "גובר גאטז",
        emoji: "👽",
        imageUrl: "/images/poppy-playtime/poppy_goober-gutz.png",
      },
      {
        name: "דיזי בובו",
        emoji: "💫",
        imageUrl: "/images/poppy-playtime/poppy_dizzy-booboo.png",
      },
      {
        name: "לופסי נודל",
        emoji: "🍜",
        imageUrl: "/images/poppy-playtime/poppy_loopsy-noodle.png",
      },
      {
        name: "אאוטימלים הפוכים",
        emoji: "🔄",
        imageUrl: "/images/poppy-playtime/poppy_wrongside-outimals.png",
      },
      // Project: Playtime
      {
        name: "בוקסי בו",
        emoji: "📦",
        imageUrl: "/images/poppy-playtime/poppy_boxy-boo.png",
      },
      // Human staff
      {
        name: "אליוט לודוויג",
        emoji: "👨‍💼",
        imageUrl: "/images/poppy-playtime/poppy_elliot-ludwig.png",
      },
      {
        name: "לית׳ פייר",
        emoji: "🕴️",
        imageUrl: "/images/poppy-playtime/poppy_leith-pierre.png",
      },
      {
        name: "סטלה גרייבר",
        emoji: "👩",
        imageUrl: "/images/poppy-playtime/poppy_stella-greyber.png",
      },
      {
        name: "ריצ׳רד לוביץ",
        emoji: "📦",
        imageUrl: "/images/poppy-playtime/poppy_richard-lovitz.png",
      },
      {
        name: "רואן סטול",
        emoji: "💻",
        imageUrl: "/images/poppy-playtime/poppy_rowan-stoll.png",
      },
      // Test subjects
      {
        name: "תומאס קלארק",
        emoji: "🩺",
        imageUrl: "/images/poppy-playtime/poppy_thomas-clarke.png",
      },
      {
        name: "מארי פיין",
        emoji: "👩‍👧",
        imageUrl: "/images/poppy-playtime/poppy_marie-payne.png",
      },
      {
        name: "תיאודור גרמבל",
        emoji: "👦",
        imageUrl: "/images/poppy-playtime/poppy_theodore-grambell.png",
      },
      {
        name: "קווין נווידסון",
        emoji: "🧒",
        imageUrl: "/images/poppy-playtime/poppy_quinn-navidson.png",
      },
      {
        name: "גרייסי גרין",
        emoji: "🎬",
        imageUrl: "/images/poppy-playtime/poppy_gracie-green.png",
      },
      {
        name: "ג׳ק אאיירס",
        emoji: "👦",
        imageUrl: "/images/poppy-playtime/poppy_jack-ayers.png",
      },
      {
        name: "קווין בארנס",
        emoji: "👦",
        imageUrl: "/images/poppy-playtime/poppy_kevin-barnes.png",
      },
      {
        name: "מתיו הלרד",
        emoji: "👦",
        imageUrl: "/images/poppy-playtime/poppy_matthew-hallard.png",
      },
      {
        name: "מיקאלה היסופ",
        emoji: "👧",
        imageUrl: "/images/poppy-playtime/poppy_makayla-hyssop.png",
      },
      {
        name: "ריילי",
        emoji: "📓",
        imageUrl: "/images/poppy-playtime/poppy_riley.png",
      },
    ],
    entityLabel: "איזו דמות תפגוש בנקודה זו?",
    catchItemEmoji: "🦋",
  },
  fnaf: {
    adventureIntro:
      "ברוכים הבאים למסעדה. השעה 00:00. האנימטרוניקים זזים בחופשיות בלילה — שרדו עד 6 בבוקר!",
    missionPointName: "חדר",
    missionWrapper: (desc: string, amount: number | string) =>
      `האנימטרוניק מתקרב! ${desc} — יש לכם ${amount} לפני שהוא מגיע!`,
    rewardText: "לילה שרוד",
    rewardEmoji: "🌙",
    characterName: "השומר",
    missionEntities: [
      {
        name: "ספרינגטראפ",
        emoji: "🟢",
        imageUrl: "/images/fnaf-originals/Springtrap.png",
        description:
          "אנימטרוניק עתיק ומחורר כלוא בחליפת אביב ירוקה. הוא חכם, מסוכן ומחפש אתכם — אל תתנו לצבע הירוק לרמות אתכם!",
      },
      {
        name: "המחקה",
        emoji: "🪞",
        imageUrl: "/images/fnaf-originals/The%20Mimic.png",
        description:
          "יצור שמסוגל להעתיק כל תנועה וצורה שהוא רואה. הוא לומד מכם — אי אפשר לסמוך על מה שאתם רואים כשהוא בקרבת מקום.",
      },
      {
        name: "אנארד",
        emoji: "🔌",
        imageUrl: "/images/fnaf-originals/Ennard.png",
        description:
          "גוף מורכב ממספר אנימטרוניקים שהתמזגו לאחד. מלא חוטים חשופים, עיניים זוהרות ושלל רגליים — נראה כמו סיוט חי.",
      },
      {
        name: "מים אנארד",
        emoji: "🤫",
        imageUrl: "/images/fnaf-originals/Mime%20Ennard.png",
        description:
          "גרסת המחווה השקטה של אנארד. הוא לא מוציא קול — רק מחקה תנועות ומתקרב לאט. אחד המוזרים והמפחידים בסדרה.",
      },
      {
        name: "ספגטי אנארד",
        emoji: "🍝",
        imageUrl: "/images/fnaf-originals/Spaghetti%20Ennard.png",
        description:
          "אנארד בגרסתו הכי כאוטית — גוף שמתפזר ומתפתל בכל כיוון כמו ספגטי. מהיר, בלתי צפוי, ומסוכן פי כמה.",
      },
    ],
    entityLabel: "איזו אנימטרוניק תפגוש בחדר הזה?",
    catchItemEmoji: "🔦",
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
    ],
    entityLabel: "איזה יצור יופיע מבעד למסך?",
    catchItemEmoji: "🔦",
  },
};

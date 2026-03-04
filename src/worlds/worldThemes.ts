export type WorldTheme = {
    adventureIntro: string; // פתיח הרפתקה
    missionPointName: string; // שם נקודה (למשל "טירה")
    missionWrapper: (desc: string, amount: number | string) => string; // עוטף את המשימה בשפת העולם
    rewardText: string; // טקסט תגמול
    rewardEmoji: string; // אמוג'י תגמול
    characterName: string; // דמות ראשית
    missionEntities: { name: string; emoji: string; imageUrl: string }[]; // רשימת ישויות
    entityLabel: string; // תוית לבחירת הישות (למשל: "בחר פוקימון לתפיסה")
    catchItemImage?: string; // תמונת הלכידה (למשל פוקדור) בתחתית המסך ב-AR
};

export const worldThemes: Record<string, WorldTheme> = {
    mario: {
        adventureIntro: 'הצילו! הנסיכה נחטפה! עזור למריו לעבור את המכשולים בדרך לטירה.',
        missionPointName: 'טירה',
        missionWrapper: (desc: string, amount: number | string) => `מריו צריך ${amount} ${desc} כדי להציל את הממלכה!`,
        rewardText: 'כוכב כוח',
        rewardEmoji: '⭐',
        characterName: 'מריו',
        missionEntities: [
            { name: 'גומבה', emoji: '🍄', imageUrl: '/images/mario_goomba.png' },
            { name: 'קופה טרופה', emoji: '🐢', imageUrl: '/images/mario_koopa.png' },
            { name: 'פרח אש', emoji: '🔥', imageUrl: '/images/mario_fireflower.png' },
            { name: 'פטריה קסומה', emoji: '🍄', imageUrl: '/images/mario_mushroom.png' },
            { name: 'כוכב', emoji: '⭐', imageUrl: '/images/mario_star.png' },
            { name: 'מטבע זהב', emoji: '🪙', imageUrl: '/images/mario_coin.png' }
        ],
        entityLabel: 'בחרו חפץ או אויב למשימה:',
        catchItemImage: '/images/ui_mario_fireball.png',
    },
    pokemon: {
        adventureIntro: 'ברוכים הבאים למחוז קנטו! הגיע הזמן לאמן את הפוקימונים שלכם לקראת מנהיג המכון.',
        missionPointName: "ג'ים",
        missionWrapper: (desc: string, amount: number | string) => `המאמן שלך צריך ${amount} ${desc} לפני הקרב!`,
        rewardText: 'תג מכון',
        rewardEmoji: '⚡',
        characterName: 'פוקימון',
        missionEntities: [
            { name: 'פיקאצ\'ו', emoji: '⚡', imageUrl: '/images/pokemon_pikachu.png' },
            { name: 'צ\'רמנדר', emoji: '🔥', imageUrl: '/images/pokemon_charmander.png' },
            { name: 'בלבאזור', emoji: '🌿', imageUrl: '/images/pokemon_bulbasaur.png' },
            { name: 'סקוויטל', emoji: '💧', imageUrl: '/images/pokemon_squirtle.png' },
            { name: 'ג\'יגליפאף', emoji: '🎵', imageUrl: '/images/pokemon_jigglypuff.png' },
            { name: 'איווי', emoji: '🦊', imageUrl: '/images/pokemon_eevee.png' },
            { name: 'מיוטו', emoji: '🔮', imageUrl: '/images/pokemon_mewtwo.png' }
        ],
        entityLabel: 'איזה פוקימון תרצו לתפוס?',
        catchItemImage: '/images/ui_pokeball.png',
    },
    treasures: {
        adventureIntro: 'אהוי מאטי! מפת האוצר מראה שהשלל נמצא ממש קרוב!',
        missionPointName: 'סימן',
        missionWrapper: (desc: string, amount: number | string) => `הפיראט האמיץ יעשה ${amount} ${desc} כדי למצוא את האוצר!`,
        rewardText: 'מטבע זהב',
        rewardEmoji: '💰',
        characterName: 'פיראט',
        missionEntities: [
            { name: 'תיבת זהב יוקרתית', emoji: '📦', imageUrl: '/images/treasure_chest.png' },
            { name: 'יהלום כחול', emoji: '💎', imageUrl: '/images/treasure_diamond_blue.png' },
            { name: 'כתר עתיק', emoji: '👑', imageUrl: '/images/treasure_crown.png' },
            { name: 'מפה בבקבוק', emoji: '🗺️', imageUrl: '/images/treasure_bottle_map.png' },
            { name: 'מצפן מכושף', emoji: '🧭', imageUrl: '/images/treasure_compass.png' },
            { name: 'שק מטבעות רובי', emoji: '💰', imageUrl: '/images/treasure_ruby_bag.png' },
            { name: 'חרב פיראטים נדירה', emoji: '🗡️', imageUrl: '/images/treasure_sword.png' }
        ],
        entityLabel: 'איזה אוצר נחפש במשימה זו?',
        catchItemImage: '/images/ui_pirate_net.png',
    }
};

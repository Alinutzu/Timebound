/**
 * Mini-Game Achievements Database
 * Achievements specific pentru Daily Spin, 2048, și Match-3
 */

export const MINI_GAME_ACHIEVEMENTS = {
  // ==================== DAILY SPIN ACHIEVEMENTS ====================
  dailySpin: [
    {
      id: 'spin_first',
      name: 'First Spin',
      description: 'Complete your first daily spin',
      icon: '🎰',
      category: 'dailySpin',
      tier: 'bronze',
      reward: { gems: 25, energy: 500 }, // Redus: timeShards eliminat, rewards reduse
      condition: (stats) => stats.totalSpins >= 1,
      hidden: false
    },
    {
      id: 'spin_streak_3',
      name: 'Spin Streak',
      description: 'Spin 3 days in a row',
      icon: '🔥',
      category: 'dailySpin',
      tier: 'bronze',
      reward: { gems: 50, energy: 1000 }, // Redus
      condition: (stats) => stats.currentStreak >= 3,
      hidden: false
    },
    {
      id: 'spin_streak_7',
      name: 'Lucky Week',
      description: 'Spin 7 days in a row',
      icon: '🍀',
      category: 'dailySpin',
      tier: 'silver',
      reward: { gems: 100, crystals: 2, energy: 2500 }, // Redus
      condition: (stats) => stats. currentStreak >= 7,
      hidden: false
    },
    {
      id: 'spin_streak_30',
      name: 'Spin Master',
      description: 'Spin 30 days in a row',
      icon: '👑',
      category: 'dailySpin',
      tier: 'gold',
      reward: { gems: 400, crystals: 8, guardian: 1 }, // Redus
      condition: (stats) => stats.currentStreak >= 30,
      hidden: false
    },
    {
      id: 'spin_total_50',
      name: 'Frequent Spinner',
      description: 'Complete 50 total spins',
      icon: '🎡',
      category: 'dailySpin',
      tier: 'silver',
      reward: { gems: 120, crystals: 3 }, // Redus
      condition: (stats) => stats.totalSpins >= 50,
      hidden: false
    },
    {
      id: 'spin_total_100',
      name: 'Spin Veteran',
      description: 'Complete 100 total spins',
      icon: '🏆',
      category: 'dailySpin',
      tier: 'gold',
      reward: { gems: 300, crystals: 10 }, // Redus
      condition: (stats) => stats.totalSpins >= 100,
      hidden: false
    },
    {
      id: 'spin_jackpot_gems',
      name: 'Gem Jackpot',
      description: 'Land on the 500 Gems segment',
      icon: '💎',
      category: 'dailySpin',
      tier: 'gold',
      reward: { gems: 200, crystals: 5 }, // Redus
      condition: (stats) => stats.highestGemReward >= 500,
      hidden: false
    },
    {
      id: 'spin_guardian',
      name: 'Guardian Summoner',
      description: 'Win a Guardian from the wheel',
      icon: '🛡️',
      category: 'dailySpin',
      tier: 'platinum',
      reward: { gems: 500, crystals: 15 }, // Redus
      condition: (stats) => stats.guardiansWon >= 1,
      hidden: false
    }
  ],

  // ==================== 2048 ACHIEVEMENTS ====================
  game2048: [
    {
      id: '2048_first_game',
      name: 'Tile Beginner',
      description: 'Play your first 2048 game',
      icon: '🎮',
      category: 'game2048',
      tier: 'bronze',
      reward: { gems: 20, energy: 1000 }, // Redus
      condition: (stats) => stats.gamesPlayed >= 1,
      hidden: false
    },
    {
      id: '2048_reach_128',
      name: 'Early Success',
      description: 'Reach the 128 tile',
      icon: '🟪',
      category: 'game2048',
      tier: 'bronze',
      reward: { gems: 30, energy: 1500 }, // Nou achievement pentru progresie mai smooth
      condition: (stats) => stats.highestTile >= 128,
      hidden: false
    },
    {
      id: '2048_reach_256',
      name: 'Getting Started',
      description: 'Reach the 256 tile',
      icon: '🟦',
      category: 'game2048',
      tier: 'silver',
      reward: { gems: 50, crystals: 1 }, // Redus
      condition: (stats) => stats.highestTile >= 256,
      hidden: false
    },
    {
      id: '2048_reach_512',
      name: 'Tile Adept',
      description: 'Reach the 512 tile',
      icon: '🟩',
      category: 'game2048',
      tier: 'silver',
      reward: { gems: 80, crystals: 2 }, // Redus
      condition: (stats) => stats.highestTile >= 512,
      hidden: false
    },
    {
      id: '2048_reach_1024',
      name: 'Tile Expert',
      description: 'Reach the 1024 tile',
      icon: '🟨',
      category: 'game2048',
      tier: 'gold',
      reward: { gems: 150, crystals: 5 }, // Redus
      condition: (stats) => stats.highestTile >= 1024,
      hidden: false
    },
    {
      id: '2048_reach_2048',
      name: 'Victory!',
      description: 'Reach the legendary 2048 tile',
      icon: '🏆',
      category: 'game2048',
      tier: 'platinum',
      reward: { gems: 400, crystals: 15, guardian: 1 }, // Redus
      condition: (stats) => stats.highestTile >= 2048,
      hidden: false
    },
    {
      id: '2048_reach_4096',
      name: 'Beyond Victory',
      description: 'Reach the 4096 tile',
      icon: '💫',
      category: 'game2048',
      tier: 'diamond',
      reward: { gems: 1000, crystals: 30 }, // Redus
      condition: (stats) => stats.highestTile >= 4096,
      hidden: false
    },
    {
      id: '2048_score_5k',
      name: 'Score Starter',
      description: 'Reach 5,000 points in a single game',
      icon: '⭐',
      category: 'game2048',
      tier: 'bronze',
      reward: { gems: 40, energy: 2000 }, // Nou - milestone mai mic
      condition: (stats) => stats.highScore >= 5000,
      hidden: false
    },
    {
      id: '2048_score_10k',
      name: 'Score Crusher',
      description: 'Reach 10,000 points in a single game',
      icon: '💥',
      category: 'game2048',
      tier: 'silver',
      reward: { gems: 100, crystals: 3 }, // Redus
      condition: (stats) => stats.highScore >= 10000,
      hidden: false
    },
    {
      id: '2048_score_50k',
      name: 'Score Master',
      description: 'Reach 50,000 points in a single game',
      icon: '🌟',
      category: 'game2048',
      tier: 'gold',
      reward: { gems: 300, crystals: 10 }, // Redus
      condition: (stats) => stats.highScore >= 50000,
      hidden: false
    },
    {
      id: '2048_games_10',
      name: 'Getting Practice',
      description: 'Play 10 games',
      icon: '🎲',
      category: 'game2048',
      tier: 'bronze',
      reward: { gems: 50, energy: 2500 }, // Nou - milestone mai mic
      condition: (stats) => stats.gamesPlayed >= 10,
      hidden: false
    },
    {
      id: '2048_games_25',
      name: 'Persistent Player',
      description: 'Play 25 games',
      icon: '🎯',
      category: 'game2048',
      tier: 'silver',
      reward: { gems: 120, crystals: 4 }, // Redus
      condition: (stats) => stats. gamesPlayed >= 25,
      hidden: false
    },
    {
      id: '2048_games_100',
      name: '2048 Veteran',
      description: 'Play 100 games',
      icon: '👾',
      category: 'game2048',
      tier: 'gold',
      reward: { gems: 400, crystals: 15 }, // Redus
      condition: (stats) => stats. gamesPlayed >= 100,
      hidden: false
    }
  ],

  // ==================== MATCH-3 ACHIEVEMENTS ====================
  match3: [
    {
      id: 'match3_first_game',
      name: 'Match Beginner',
      description: 'Play your first Match-3 game',
      icon: '🧩',
      category: 'match3',
      tier: 'bronze',
      reward: { gems: 25, energy: 1000 }, // Redus
      condition: (stats) => stats.gamesPlayed >= 1,
      hidden: false
    },
    {
      id: 'match3_combo_3',
      name: 'Combo Starter',
      description: 'Achieve a 3x combo',
      icon: '🔥',
      category: 'match3',
      tier: 'bronze',
      reward: { gems: 30, energy: 1500 }, // Nou - milestone mai mic
      condition: (stats) => stats.bestCombo >= 3,
      hidden: false
    },
    {
      id: 'match3_combo_5',
      name: 'Combo Builder',
      description: 'Achieve a 5x combo',
      icon: '💫',
      category: 'match3',
      tier: 'silver',
      reward: { gems: 60, crystals: 2 }, // Redus
      condition: (stats) => stats.bestCombo >= 5,
      hidden: false
    },
    {
      id: 'match3_combo_10',
      name: 'Combo Expert',
      description: 'Achieve a 10x combo',
      icon: '⚡',
      category: 'match3',
      tier: 'silver',
      reward: { gems: 120, crystals: 4 }, // Redus
      condition: (stats) => stats. bestCombo >= 10,
      hidden: false
    },
    {
      id: 'match3_combo_15',
      name: 'Combo Master',
      description: 'Achieve a 15x combo',
      icon: '💥',
      category: 'match3',
      tier: 'gold',
      reward: { gems: 250, crystals: 10 }, // Redus
      condition: (stats) => stats. bestCombo >= 15,
      hidden: false
    },
    {
      id: 'match3_score_500',
      name: 'Score Beginner',
      description: 'Score 500 points in a single game',
      icon: '🎯',
      category: 'match3',
      tier: 'bronze',
      reward: { gems: 40, energy: 2000 }, // Nou - milestone mai mic
      condition: (stats) => stats.highScore >= 500,
      hidden: false
    },
    {
      id: 'match3_score_1000',
      name: 'High Scorer',
      description: 'Score 1,000 points in a single game',
      icon: '⭐',
      category: 'match3',
      tier: 'silver',
      reward: { gems: 80, crystals: 3 }, // Redus
      condition: (stats) => stats. highScore >= 1000,
      hidden: false
    },
    {
      id: 'match3_score_2500',
      name: 'Score Champion',
      description: 'Score 2,500 points in a single game',
      icon: '🏆',
      category: 'match3',
      tier: 'gold',
      reward: { gems: 250, crystals: 8 }, // Redus
      condition: (stats) => stats. highScore >= 2500,
      hidden: false
    },
    {
      id: 'match3_special_bomb',
      name: 'Bomb Master',
      description: 'Create 10 bomb special gems',
      icon: '💣',
      category: 'match3',
      tier: 'silver',
      reward: { gems: 100, crystals: 3 }, // Redus
      condition: (stats) => stats. specialGemsCreated?. bomb >= 10,
      hidden: false
    },
    {
      id: 'match3_special_lightning',
      name: 'Lightning Striker',
      description: 'Create 5 lightning special gems',
      icon: '⚡',
      category: 'match3',
      tier: 'gold',
      reward: { gems: 180, crystals: 6 }, // Redus
      condition: (stats) => stats. specialGemsCreated?.lightning >= 5,
      hidden: false
    },
    {
      id: 'match3_special_rainbow',
      name: 'Rainbow Wizard',
      description: 'Create a rainbow special gem',
      icon: '🌈',
      category: 'match3',
      tier: 'platinum',
      reward: { gems: 400, crystals: 12 }, // Redus
      condition: (stats) => stats.specialGemsCreated?.rainbow >= 1,
      hidden: false
    },
    {
      id: 'match3_games_10',
      name: 'Match Explorer',
      description: 'Play 10 Match-3 games',
      icon: '🎮',
      category: 'match3',
      tier: 'bronze',
      reward: { gems: 60, energy: 3000 }, // Nou - milestone mai mic
      condition: (stats) => stats.gamesPlayed >= 10,
      hidden: false
    },
    {
      id: 'match3_games_50',
      name: 'Match Veteran',
      description: 'Play 50 Match-3 games',
      icon: '🎯',
      category: 'match3',
      tier: 'gold',
      reward: { gems: 300, crystals: 10 }, // Redus
      condition: (stats) => stats. gamesPlayed >= 50,
      hidden: false
    },
    {
      id: 'match3_perfect_score',
      name: 'Perfect Victory',
      description: 'Win a boss battle with 2000+ score',
      icon: '⭐',
      category: 'match3',
      tier: 'platinum',
      reward: { gems: 600, crystals: 20, guardian: 1 }, // Redus + score requirement redus
      condition: (stats) => stats.perfectVictories >= 1,
      hidden: false
    }
  ]
};

/**
 * Achievement tier colors & rewards
 */
export const ACHIEVEMENT_TIERS = {
  bronze: { color: '#CD7F32', icon: '🥉', multiplier: 1 },
  silver: { color: '#C0C0C0', icon: '🥈', multiplier: 1.5 },
  gold: { color: '#FFD700', icon: '🥇', multiplier: 2 },
  platinum: { color: '#E5E4E2', icon: '💎', multiplier: 2.5 }, // Redus de la 3
  diamond: { color: '#B9F2FF', icon: '💠', multiplier: 4 } // Redus de la 5
};

/**
 * Get all achievements for a specific game
 */
export function getAchievementsByGame(gameType) {
  return MINI_GAME_ACHIEVEMENTS[gameType] || [];
}

/**
 * Get achievement by ID
 */
export function getAchievementById(achievementId) {
  for (const [game, achievements] of Object.entries(MINI_GAME_ACHIEVEMENTS)) {
    const achievement = achievements.find(a => a.id === achievementId);
    if (achievement) return achievement;
  }
  return null;
}

/**
 * Get all achievements (flat array)
 */
export function getAllMiniGameAchievements() {
  return Object.values(MINI_GAME_ACHIEVEMENTS). flat();
}
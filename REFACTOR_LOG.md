# REFACTOR_LOG

> **Living document — fiecare schimbare e notată aici.**
> Orice thread nou citește acest fișier ca să știe exact unde suntem.

---

## Context

- **Proiect**: Idle Energy Empire (Timebound) — PWA idle/clicker game
- **Stack**: Vanilla JS, ES modules, Browserify, StateManager (Redux-like), EventBus
- **Medii**: WSL dev (local), GitHub Pages (live), RPi3 (DB/backend)
- **Branch refactor**: `refactor/resource-api` (din `develop`)

---

## Status Curent

### Faza 1: ResourceAPI Centralizat

**Status: ÎN DESFĂȘURARE**

| Pas | Descriere | Status |
|-----|-----------|--------|
| 1 | Creat `js/api/ResourceAPI.js` | ✅ Complet |
| 2 | Creat `tests/ResourceAPI.test.js` (34 teste) | ✅ Toate trec |
| 3 | Migrat `ResourceDisplay.js` (proof of concept) | ✅ Complet |
| 4 | Build `dist/bundle.js` | ✅ Complet |
| 5 | Test manual pe Pages | ✅ Confirmat de user |
| 6 | Migrat `DailyRewardSystem.js` | ✅ Complet |
| 7 | Migrat `GuardianSystem.js` | ✅ Complet |
| 8 | Migrat `ShopSystem.js` | ✅ Complet |
| 9 | Migrat `DailySpinGame.js` | ✅ Complet |
| 10 | Migrat `Game2048.js` | ✅ Complet |
| 11 | Migrat `BadgeManager.js` | ✅ Complet |
| 12 | Migrat `AscensionSystem.js` | ✅ Complet |
| 13 | Migrat `AutomationSystem.js` | ✅ Complet |
| 14 | Migrat `UpgradeQueueSystem.js` | ✅ Complet |
| 15 | Migrat `TutorialSystem.js` | ✅ Complet |
| 16 | Migrat `QuestSystem.js` | ✅ Complet |
| 17 | Migrat `AchievementSystem.js` | ✅ Complet |
| 18 | Migrat `MiniGameAchievementSystem.js` | ✅ Complet |
| 19 | Migrat `BossSystem.js` | ✅ Complet |
| 20 | Migrat `StructuresUI.js` | ✅ Complet |
| 21 | Migrat `GuardiansUI.js` | ✅ Complet |
| 22 | Migrat `StatisticsSystem.js` | ✅ Complet |
| 23 | Creat `CheatMenu.js` (in-game UI) | ✅ Complet |
| 14 | Migrat `ArenaUI.js` (partial — resource reads) | 🔜 Singurul rămas |
| 15 | Eliminat `this.energy` / `this.gems` din ArenaUI | 🔜 În Faza 5 (decompoziție) |

---

## Fișiere Create (Noi)

| Fișier | Linii | Scop |
|--------|-------|------|
| `js/api/ResourceAPI.js` | 165 | API centralizat pentru resurse: get/add/spend/set/canAfford/spendMultiple |
| `tests/ResourceAPI.test.js` | 310 | 34 unit tests (node:test) |

## Fișiere Modificate

| Fișier | Ce s-a schimbat |
|--------|----------------|
| `js/ui/components/ResourceDisplay.js` | Importă `resourceApi` în loc de `stateManager` pentru citirea resurselor. Realm visibility rămâne pe `stateManager` (nu e resursă). |
| `js/systems/DailyRewardSystem.js` | `claim()` folosește `resourceApi.add()` în loc de `stateManager.dispatch(ADD_RESOURCE)` |
| `js/systems/GuardianSystem.js` | `canSummon()` și `summonBulk()` folosesc `resourceApi.canAfford()` în loc de `state.resources.gems >=` |
| `js/systems/ShopSystem.js` | `completePurchase()`, `completeSpinPurchase()`, `completeAd()` folosesc `resourceApi.add()` |
| `js/ui/games/DailySpinGame.js` | `grantReward()` folosește `resourceApi.add()` |
| `js/ui/games/Game2048.js` | `grantReward()` folosește `resourceApi.add()` |
| `js/ui/BadgeManager.js` | `updateGuardiansBadge()` folosește `resourceApi.canAfford()` |
| `js/systems/AscensionSystem.js` | `getAscensionPreview()` și `applyQuickStart()` folosesc `resourceApi.get()`/`add()` |
| `js/systems/AutomationSystem.js` | `unlock()`, `autoBuyStructures()`, `autoSummonGuardians()`, `autoPuzzlePlay()` folosesc ResourceAPI |
| `js/systems/UpgradeQueueSystem.js` | `cancelQueuedUpgrade()`, `speedUp()`, `upgradeQueueSlots()` folosesc ResourceAPI |
| `js/systems/TutorialSystem.js` | `condition` checks și rewards folosesc ResourceAPI |
| `js/systems/QuestSystem.js` | `pearls` check și quest rewards folosesc ResourceAPI |
| `js/systems/AchievementSystem.js` | Achievement rewards folosesc `resourceApi.add()` |
| `js/systems/MiniGameAchievementSystem.js` | Achievement rewards folosesc `resourceApi.add()` |
| `js/systems/BossSystem.js` | Boss rewards folosesc `resourceApi.add()` |
| `js/ui/StructuresUI.js` | Realm unlock crystals check folosește `resourceApi.canAfford()` |
| `js/ui/GuardiansUI.js` | Summon x10 gems check folosește `resourceApi.canAfford()` |
| `js/systems/StatisticsSystem.js` | Gem tracking și export folosesc `resourceApi.get()` |
| `js/ui/CheatMenu.js` | **NOU** — panel de cheat în joc (SET/ADD/MAX/RESET/Spin) |

---

## Planul Complet de Refactorizare (din REFACTORING.md)

### Faza 1: ResourceAPI — **ACUM**
Centralizează accesul la energy/gems/mana/crystals/etc. printr-un singur punct.

### Faza 2: AuthManager cu State Machine
Flow-ul auth e haotic (api.js + ArenaUI.js). Necesită AuthManager cu states: UNAUTHENTICATED | GUEST | AUTHENTICATED | CONVERTING.

### Faza 3: DB Migration Refactor
Schema versioning, column DEFAULT corect, migration runner.

### Faza 4: PersistenceManager
Unifică SaveManager (localStorage) + ArenaUI (cloud) într-un singur modul cu conflict resolution.

### Faza 5: ArenaUI Decomposition
ArenaUI (1050 linii) → 7+ componente mici: GuardianList, BattlePanel, OpponentList, Leaderboard, etc.

### Faza 6: Testing Infrastructure
Teste pentru ResourceAPI, AuthManager, DailyRewardSystem. Vitest sau node:test.

---

## Bugs Cunoscute

| Bug | Cauza | Fix |
|-----|-------|-----|
| EventBus blochează al 2-lea listener pentru `notification:show` | Hack în EventBus.js:27-33 | De rezolvat înainte de Faza 2 |
| `window.claimAchievement` definit de 2 ori | AchievementsUI + AchievementSystem | De consolidat |
| `ResourceManager.js` e denumit greșit | Track-uiește timer-e, nu resurse | De redenumit `TimerManager.js` |
| `MiniGamesHub.js` nu e folosit | PuzzleUI importă direct jocurile | De evaluat: delete sau integrat |
| Zero cleanup la event subscriptions | UI-urile nu stochează unsubscribe | De rezolvat în Faza 5 |
| `setInterval` fără cleanup | StatisticsUI, BadgeManager, UpgradeQueueDisplay | De rezolvat |

---

## Notații pentru Thread Nou

Dacă se deschide un thread nou, citește acest fișier și continuă de la ultimul pas marcat ⏳. Ia și `REFACTORING.md` pentru context complet.

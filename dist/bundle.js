(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
/**
 * Global Game Configuration
 * Centralizează toate constantele și setările globale
 */

var CONFIG = {
  // Game identity
  GAME_NAME: 'Idle Energy Empire',
  VERSION: '2.0.0',
  // Save system
  SAVE_KEY: 'idle_energy_empire_save_v2',
  AUTO_SAVE_INTERVAL: 30000,
  // 30 secunde

  // Game loop
  TICK_RATE: 100,
  // ms (10 ticks per second)

  // Debug
  DEBUG_MODE: true,
  ENABLE_CHEATS: true,
  // Development only
  LOG_LEVEL: 'info',
  // 'error', 'warn', 'info', 'debug'

  // UI
  ANIMATION_SPEED: 300,
  // ms
  NOTIFICATION_DURATION: 3000,
  // ms
  TOOLTIP_DELAY: 500,
  // ms

  // Balancing
  BALANCING: {
    // Starting resources
    STARTING_ENERGY: 50,
    STARTING_MANA: 0,
    STARTING_GEMS: 100,
    // Tutorial bonus
    STARTING_CRYSTALS: 0,
    // Caps
    BASE_ENERGY_CAP: 5000,
    BASE_MANA_CAP: 100,
    BASE_VOLCANIC_ENERGY_CAP: 5000,
    // Offline
    OFFLINE_PRODUCTION_BASE: 0.5,
    // 50% without upgrades
    OFFLINE_TIME_CAP: 86400000,
    // 24h in ms

    // Daily
    DAILY_QUEST_LIMIT: 10,
    // Ascension
    ASCENSION_MIN_ENERGY: 10000000,
    // 10M
    ASCENSION_CRYSTAL_FORMULA: function ASCENSION_CRYSTAL_FORMULA(lifetimeEnergy) {
      return Math.floor(Math.sqrt(lifetimeEnergy / 1000000));
    },
    ASCENSION_PRODUCTION_BONUS: 0.1,
    // +10% per level
    ASCENSION_CAPACITY_BONUS: 0.5,
    // +50% per level

    // Guardians
    GUARDIAN_SUMMON_COST: 100,
    // gems
    GUARDIAN_RARITIES: {
      common: {
        weight: 50,
        bonusRange: [5, 15]
      },
      uncommon: {
        weight: 30,
        bonusRange: [15, 30]
      },
      rare: {
        weight: 15,
        bonusRange: [30, 50]
      },
      epic: {
        weight: 4,
        bonusRange: [50, 100]
      },
      legendary: {
        weight: 1,
        bonusRange: [100, 200]
      }
    },
    // Volcano unlock
    VOLCANO_UNLOCK_COST: 100,
    // crystals
    VOLCANO_MIN_ASCENSION: 1
  },
  // Features flags
  FEATURES: {
    PUZZLE_ENABLED: true,
    BOSSES_ENABLED: true,
    SHOP_ENABLED: true,
    ACHIEVEMENTS_ENABLED: true,
    STATISTICS_ENABLED: true,
    AUTOMATION_ENABLED: true
  }
};

// Freeze to prevent accidental modifications
Object.freeze(CONFIG);
Object.freeze(CONFIG.BALANCING);
Object.freeze(CONFIG.FEATURES);
var _default = exports["default"] = CONFIG;

},{}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NOTIFICATION_CONFIG = void 0;
exports.shouldShowNotification = shouldShowNotification;
/**
 * Notification Configuration - ce notificări să apară
 */

var NOTIFICATION_CONFIG = exports.NOTIFICATION_CONFIG = {
  // Achievements - ÎNTOTDEAUNA
  achievement: {
    enabled: true,
    priority: 4,
    duration: 5000,
    showOnMobile: true
  },
  // Ascension - ÎNTOTDEAUNA
  ascension: {
    enabled: true,
    priority: 4,
    duration: 8000,
    showOnMobile: true
  },
  // Quest completat - DA
  questCompleted: {
    enabled: true,
    priority: 3,
    duration: 3000,
    showOnMobile: true
  },
  // Quest claimed - NU pe mobile (vezi în badge)
  questClaimed: {
    enabled: true,
    priority: 2,
    duration: 2000,
    showOnMobile: false
  },
  // Daily Reward - DA
  dailyReward: {
    enabled: true,
    priority: 3,
    duration: 4000,
    showOnMobile: true
  },
  // Upgrade completat - NU pe mobile (prea multe)
  upgradeCompleted: {
    enabled: true,
    priority: 2,
    duration: 2000,
    showOnMobile: false
  },
  // Structure purchased - NU niciodată (prea des)
  structurePurchased: {
    enabled: false,
    priority: 1,
    duration: 1500,
    showOnMobile: false
  },
  // Save game - NU niciodată
  gameSaved: {
    enabled: false,
    priority: 0,
    duration: 1000,
    showOnMobile: false
  },
  // Offline progress - DA
  offlineProgress: {
    enabled: true,
    priority: 3,
    duration: 5000,
    showOnMobile: true
  },
  // Critical hit - NU (prea des)
  criticalHit: {
    enabled: false,
    priority: 1,
    duration: 1500,
    showOnMobile: false
  },
  // Lucky gems - DA (e rar)
  luckyGems: {
    enabled: true,
    priority: 3,
    duration: 3000,
    showOnMobile: true
  }
};

/**
 * Check if notification should be shown
 */
function shouldShowNotification(notificationType) {
  var config = NOTIFICATION_CONFIG[notificationType];
  if (!config || !config.enabled) return false;
  var isMobile = window.innerWidth <= 768;
  if (isMobile && !config.showOnMobile) return false;
  return true;
}

},{}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _config = _interopRequireDefault(require("../config.js"));
var _StateManager = _interopRequireDefault(require("./StateManager.js"));
var _SaveManager = _interopRequireDefault(require("./SaveManager.js"));
var _TickManager = _interopRequireDefault(require("./TickManager.js"));
var _EventBus = _interopRequireDefault(require("../utils/EventBus.js"));
var _Logger = _interopRequireDefault(require("../utils/Logger.js"));
var _StructureSystem = _interopRequireDefault(require("../systems/StructureSystem.js"));
var _UpgradeSystem = _interopRequireDefault(require("../systems/UpgradeSystem.js"));
var _UpgradeQueueSystem = _interopRequireDefault(require("../systems/UpgradeQueueSystem.js"));
var _GuardianSystem = _interopRequireDefault(require("../systems/GuardianSystem.js"));
var _QuestSystem = _interopRequireDefault(require("../systems/QuestSystem.js"));
var _AchievementSystem = _interopRequireDefault(require("../systems/AchievementSystem.js"));
var _RealmSystem = _interopRequireDefault(require("../systems/RealmSystem.js"));
var _AscensionSystem = _interopRequireDefault(require("../systems/AscensionSystem.js"));
var _BossSystem = _interopRequireDefault(require("../systems/BossSystem.js"));
var _ShopSystem = _interopRequireDefault(require("../systems/ShopSystem.js"));
var _DailyRewardSystem = _interopRequireDefault(require("../systems/DailyRewardSystem.js"));
var _AutomationSystem = _interopRequireDefault(require("../systems/AutomationSystem.js"));
var _StatisticsSystem = _interopRequireDefault(require("../systems/StatisticsSystem.js"));
var _TutorialSystem = _interopRequireDefault(require("../systems/TutorialSystem.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /**
 * Game - Main game controller
 * Coordinates all systems
 */ // Import all systems
var Game = /*#__PURE__*/function () {
  function Game() {
    _classCallCheck(this, Game);
    this.initialized = false;
    this.systems = {
      structure: _StructureSystem["default"],
      upgrade: _UpgradeSystem["default"],
      upgradeQueue: _UpgradeQueueSystem["default"],
      guardian: _GuardianSystem["default"],
      quest: _QuestSystem["default"],
      achievement: _AchievementSystem["default"],
      realm: _RealmSystem["default"],
      ascension: _AscensionSystem["default"],
      boss: _BossSystem["default"],
      shop: _ShopSystem["default"],
      dailyReward: _DailyRewardSystem["default"],
      automation: _AutomationSystem["default"],
      statistics: _StatisticsSystem["default"],
      tutorial: _TutorialSystem["default"]
    };
    _Logger["default"].info('Game', 'Game instance created');
  }

  /**
   * Initialize game
   */
  return _createClass(Game, [{
    key: "init",
    value: (function () {
      var _init = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {
        var saveData, offlineProgress, _t;
        return _regenerator().w(function (_context) {
          while (1) switch (_context.p = _context.n) {
            case 0:
              if (!this.initialized) {
                _context.n = 1;
                break;
              }
              _Logger["default"].warn('Game', 'Already initialized');
              return _context.a(2);
            case 1:
              _Logger["default"].info('Game', 'Initializing game...');
              _context.p = 2;
              // Load save
              saveData = _SaveManager["default"].load();
              if (saveData) {
                _Logger["default"].info('Game', 'Save loaded successfully');

                // Calculate offline progress
                offlineProgress = _TickManager["default"].calculateOfflineProgress(saveData.timestamp);
                if (offlineProgress) {
                  _TickManager["default"].applyOfflineProgress(offlineProgress);
                }
              } else {
                _Logger["default"].info('Game', 'New game started');
              }

              // Start game loop
              _TickManager["default"].start();

              // Start auto-save
              _SaveManager["default"].startAutoSave();

              // Initialize UI (will be done in UI layer)
              _EventBus["default"].emit('game:initialized');
              this.initialized = true;
              _Logger["default"].info('Game', '✅ Game initialized successfully!');
              return _context.a(2, true);
            case 3:
              _context.p = 3;
              _t = _context.v;
              _Logger["default"].error('Game', 'Failed to initialize:', _t);
              return _context.a(2, false);
          }
        }, _callee, this, [[2, 3]]);
      }));
      function init() {
        return _init.apply(this, arguments);
      }
      return init;
    }()
    /**
     * Get system by name
     */
    )
  }, {
    key: "getSystem",
    value: function getSystem(name) {
      return this.systems[name];
    }

    /**
     * Get all systems
     */
  }, {
    key: "getAllSystems",
    value: function getAllSystems() {
      return this.systems;
    }

    /**
     * Save game manually
     */
  }, {
    key: "save",
    value: function save() {
      return _SaveManager["default"].save();
    }

    /**
     * Reset game
     */
  }, {
    key: "reset",
    value: function reset() {
      if (!confirm('Are you sure you want to reset the game? All progress will be lost!')) {
        return false;
      }
      _SaveManager["default"].deleteSave();
      location.reload();
      return true;
    }

    /**
     * Export save
     */
  }, {
    key: "exportSave",
    value: function exportSave() {
      return _SaveManager["default"]["export"]();
    }

    /**
     * Import save
     */
  }, {
    key: "importSave",
    value: (function () {
      var _importSave = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(file) {
        return _regenerator().w(function (_context2) {
          while (1) switch (_context2.n) {
            case 0:
              _context2.n = 1;
              return _SaveManager["default"]["import"](file);
            case 1:
              return _context2.a(2, _context2.v);
          }
        }, _callee2);
      }));
      function importSave(_x) {
        return _importSave.apply(this, arguments);
      }
      return importSave;
    }())
  }]);
}(); // Create global game instance
var game = new Game();

// Make available globally for debugging
if (_config["default"].DEBUG_MODE) {
  window.game = game;
  window.stateManager = _StateManager["default"];
  window.eventBus = _EventBus["default"];
  window.logger = _Logger["default"];
}
var _default = exports["default"] = game;

},{"../config.js":1,"../systems/AchievementSystem.js":18,"../systems/AscensionSystem.js":19,"../systems/AutomationSystem.js":20,"../systems/BossSystem.js":21,"../systems/DailyRewardSystem.js":22,"../systems/GuardianSystem.js":23,"../systems/QuestSystem.js":26,"../systems/RealmSystem.js":27,"../systems/ShopSystem.js":28,"../systems/StatisticsSystem.js":29,"../systems/StructureSystem.js":30,"../systems/TutorialSystem.js":31,"../systems/UpgradeQueueSystem.js":32,"../systems/UpgradeSystem.js":33,"../utils/EventBus.js":56,"../utils/Logger.js":58,"./SaveManager.js":5,"./StateManager.js":6,"./TickManager.js":7}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _Logger = _interopRequireDefault(require("../utils/Logger.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /**
 * ResourceManager - Manages timeouts, intervals, and listeners
 * Prevents memory leaks by tracking and cleaning up resources
 */
var ResourceManager = /*#__PURE__*/function () {
  function ResourceManager() {
    var _this = this;
    _classCallCheck(this, ResourceManager);
    this.timeouts = new Set();
    this.intervals = new Set();
    this.animations = new Set();
    this.listeners = [];

    // Cleanup on page unload
    window.addEventListener('beforeunload', function () {
      return _this.cleanup();
    });
    _Logger["default"].info('ResourceManager', 'Initialized');
  }

  /**
   * Safe setTimeout with automatic tracking
   */
  return _createClass(ResourceManager, [{
    key: "setTimeout",
    value: function (_setTimeout) {
      function setTimeout(_x, _x2) {
        return _setTimeout.apply(this, arguments);
      }
      setTimeout.toString = function () {
        return _setTimeout.toString();
      };
      return setTimeout;
    }(function (callback, delay) {
      var _this2 = this;
      var debugLabel = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
      var timeoutId = setTimeout(function () {
        try {
          callback();
        } catch (error) {
          _Logger["default"].error('ResourceManager', "Error in timeout ".concat(debugLabel, ":"), error);
        }
        _this2.timeouts["delete"](timeoutId);
      }, delay);
      this.timeouts.add(timeoutId);
      if (debugLabel) {
        _Logger["default"].debug('ResourceManager', "Timeout created: ".concat(debugLabel));
      }
      return timeoutId;
    }

    /**
     * Safe setInterval with automatic tracking
     */)
  }, {
    key: "setInterval",
    value: function (_setInterval) {
      function setInterval(_x3, _x4) {
        return _setInterval.apply(this, arguments);
      }
      setInterval.toString = function () {
        return _setInterval.toString();
      };
      return setInterval;
    }(function (callback, interval) {
      var debugLabel = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
      var intervalId = setInterval(function () {
        try {
          callback();
        } catch (error) {
          _Logger["default"].error('ResourceManager', "Error in interval ".concat(debugLabel, ":"), error);
        }
      }, interval);
      this.intervals.add(intervalId);
      if (debugLabel) {
        _Logger["default"].debug('ResourceManager', "Interval created: ".concat(debugLabel));
      }
      return intervalId;
    }

    /**
     * Safe requestAnimationFrame
     */)
  }, {
    key: "requestAnimationFrame",
    value: function (_requestAnimationFrame) {
      function requestAnimationFrame(_x5) {
        return _requestAnimationFrame.apply(this, arguments);
      }
      requestAnimationFrame.toString = function () {
        return _requestAnimationFrame.toString();
      };
      return requestAnimationFrame;
    }(function (callback) {
      var _this3 = this;
      var debugLabel = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
      var frameId = requestAnimationFrame(function () {
        try {
          callback();
        } catch (error) {
          _Logger["default"].error('ResourceManager', "Error in animation ".concat(debugLabel, ":"), error);
        }
        _this3.animations["delete"](frameId);
      });
      this.animations.add(frameId);
      return frameId;
    }

    /**
     * Clear specific timeout
     */)
  }, {
    key: "clearTimeout",
    value: function (_clearTimeout) {
      function clearTimeout(_x6) {
        return _clearTimeout.apply(this, arguments);
      }
      clearTimeout.toString = function () {
        return _clearTimeout.toString();
      };
      return clearTimeout;
    }(function (timeoutId) {
      clearTimeout(timeoutId);
      this.timeouts["delete"](timeoutId);
    }

    /**
     * Clear specific interval
     */)
  }, {
    key: "clearInterval",
    value: function (_clearInterval) {
      function clearInterval(_x7) {
        return _clearInterval.apply(this, arguments);
      }
      clearInterval.toString = function () {
        return _clearInterval.toString();
      };
      return clearInterval;
    }(function (intervalId) {
      clearInterval(intervalId);
      this.intervals["delete"](intervalId);
    }

    /**
     * Cancel specific animation frame
     */)
  }, {
    key: "cancelAnimationFrame",
    value: function (_cancelAnimationFrame) {
      function cancelAnimationFrame(_x8) {
        return _cancelAnimationFrame.apply(this, arguments);
      }
      cancelAnimationFrame.toString = function () {
        return _cancelAnimationFrame.toString();
      };
      return cancelAnimationFrame;
    }(function (frameId) {
      cancelAnimationFrame(frameId);
      this.animations["delete"](frameId);
    }

    /**
     * Add event listener with tracking
     */)
  }, {
    key: "addEventListener",
    value: function addEventListener(element, event, handler) {
      var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
      element.addEventListener(event, handler, options);
      this.listeners.push({
        element: element,
        event: event,
        handler: handler,
        options: options
      });
      _Logger["default"].debug('ResourceManager', "Listener added: ".concat(event, " on ").concat(element.tagName));
    }

    /**
     * Remove specific event listener
     */
  }, {
    key: "removeEventListener",
    value: function removeEventListener(element, event, handler) {
      element.removeEventListener(event, handler);
      var index = this.listeners.findIndex(function (l) {
        return l.element === element && l.event === event && l.handler === handler;
      });
      if (index !== -1) {
        this.listeners.splice(index, 1);
      }
    }

    /**
     * Cleanup all resources
     */
  }, {
    key: "cleanup",
    value: function cleanup() {
      _Logger["default"].info('ResourceManager', 'Cleaning up all resources...');

      // Clear timeouts
      this.timeouts.forEach(function (id) {
        return clearTimeout(id);
      });
      this.timeouts.clear();
      _Logger["default"].debug('ResourceManager', 'Timeouts cleared');

      // Clear intervals
      this.intervals.forEach(function (id) {
        return clearInterval(id);
      });
      this.intervals.clear();
      _Logger["default"].debug('ResourceManager', 'Intervals cleared');

      // Clear animations
      this.animations.forEach(function (id) {
        return cancelAnimationFrame(id);
      });
      this.animations.clear();
      _Logger["default"].debug('ResourceManager', 'Animations cleared');

      // Remove listeners
      this.listeners.forEach(function (_ref) {
        var element = _ref.element,
          event = _ref.event,
          handler = _ref.handler,
          options = _ref.options;
        element.removeEventListener(event, handler, options);
      });
      this.listeners = [];
      _Logger["default"].debug('ResourceManager', 'Listeners removed');
      _Logger["default"].info('ResourceManager', 'Cleanup complete!');
    }

    /**
     * Get resource stats
     */
  }, {
    key: "getStats",
    value: function getStats() {
      return {
        timeouts: this.timeouts.size,
        intervals: this.intervals.size,
        animations: this.animations.size,
        listeners: this.listeners.length
      };
    }

    /**
     * Debug info
     */
  }, {
    key: "debug",
    value: function debug() {
      var stats = this.getStats();
      console.log('[ResourceManager] Active resources:', stats);
      console.log('[ResourceManager] Timeouts:', Array.from(this.timeouts));
      console.log('[ResourceManager] Intervals:', Array.from(this.intervals));
      console.log('[ResourceManager] Listeners:', this.listeners);
    }
  }]);
}(); // Singleton
var resourceManager = new ResourceManager();
var _default = exports["default"] = resourceManager;

},{"../utils/Logger.js":58}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _config = _interopRequireDefault(require("../config.js"));
var _StateManager = _interopRequireDefault(require("./StateManager.js"));
var _EventBus = _interopRequireDefault(require("../utils/EventBus.js"));
var _Logger = _interopRequireDefault(require("../utils/Logger.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /**
 * SaveManager - Handle save/load with versioning and migration
 */
var SaveManager = /*#__PURE__*/function () {
  function SaveManager() {
    _classCallCheck(this, SaveManager);
    this.saveKey = _config["default"].SAVE_KEY;
    this.compressionEnabled = true;
    this.autoSaveEnabled = true;
    this.autoSaveInterval = null;
    _Logger["default"].info('SaveManager', 'Initialized');
  }

  /**
   * Save game to localStorage
   */
  return _createClass(SaveManager, [{
    key: "save",
    value: function save() {
      try {
        var state = _StateManager["default"].getState();

        // Create save object
        var saveData = {
          version: _config["default"].VERSION,
          timestamp: Date.now(),
          state: state
        };

        // Stringify
        var jsonString = JSON.stringify(saveData);

        // Compress if enabled (simple LZString would be better in production)
        if (this.compressionEnabled) {
          // For now, just use regular JSON
          // In production, use: jsonString = LZString.compress(jsonString);
        }

        // Save to localStorage
        localStorage.setItem(this.saveKey, jsonString);

        // Update last saved time
        _StateManager["default"].dispatch({
          type: 'SAVE_GAME',
          payload: {}
        });
        _Logger["default"].info('SaveManager', 'Game saved successfully');
        _EventBus["default"].emit('game:saved', {
          timestamp: Date.now()
        });
        return true;
      } catch (error) {
        _Logger["default"].error('SaveManager', 'Failed to save game:', error);
        _EventBus["default"].emit('game:save-failed', {
          error: error.message
        });
        return false;
      }
    }

    /**
     * Load game from localStorage
     */
  }, {
    key: "load",
    value: function load() {
      try {
        var savedData = localStorage.getItem(this.saveKey);
        if (!savedData) {
          _Logger["default"].info('SaveManager', 'No save data found');
          return null;
        }

        // Decompress if needed
        var jsonString = savedData;
        if (this.compressionEnabled) {
          // jsonString = LZString.decompress(savedData) || savedData;
        }

        // Parse
        var saveData = JSON.parse(jsonString);

        // Validate
        if (!this.validateSave(saveData)) {
          _Logger["default"].error('SaveManager', 'Invalid save data');
          return null;
        }

        // Migrate if needed
        var migratedData = this.migrate(saveData);

        // Load into state
        _StateManager["default"].dispatch({
          type: 'LOAD_STATE',
          payload: {
            state: migratedData.state
          }
        });
        _Logger["default"].info('SaveManager', 'Game loaded successfully', {
          version: migratedData.version,
          timestamp: new Date(migratedData.timestamp).toLocaleString()
        });
        _EventBus["default"].emit('game:loaded', {
          saveData: migratedData
        });
        return migratedData;
      } catch (error) {
        _Logger["default"].error('SaveManager', 'Failed to load game:', error);
        _EventBus["default"].emit('game:load-failed', {
          error: error.message
        });
        return null;
      }
    }

    /**
     * Validate save data structure
     */
  }, {
    key: "validateSave",
    value: function validateSave(saveData) {
      if (!saveData || _typeof(saveData) !== 'object') {
        return false;
      }
      if (!saveData.version || !saveData.state) {
        return false;
      }

      // Basic structure validation
      var requiredKeys = ['resources', 'structures', 'upgrades'];
      for (var _i = 0, _requiredKeys = requiredKeys; _i < _requiredKeys.length; _i++) {
        var key = _requiredKeys[_i];
        if (!saveData.state[key]) {
          _Logger["default"].warn('SaveManager', "Missing required key: ".concat(key));
          return false;
        }
      }
      return true;
    }

    /**
     * Migrate old save versions to current
     */
  }, {
    key: "migrate",
    value: function migrate(saveData) {
      var savedVersion = saveData.version;
      var currentVersion = _config["default"].VERSION;
      if (savedVersion === currentVersion) {
        _Logger["default"].info('SaveManager', 'Save data is current version');
        return saveData;
      }
      _Logger["default"].info('SaveManager', "Migrating from ".concat(savedVersion, " to ").concat(currentVersion));
      var migratedState = _objectSpread({}, saveData.state);

      // Migration logic based on version
      // Example: v1.x.x → v2.x.x
      if (this.compareVersions(savedVersion, '2.0.0') < 0) {
        migratedState = this.migrateToV2(migratedState);
      }

      // Add more migrations as needed
      // if (this.compareVersions(savedVersion, '2.1.0') < 0) {
      //   migratedState = this.migrateToV2_1(migratedState);
      // }

      return _objectSpread(_objectSpread({}, saveData), {}, {
        version: currentVersion,
        state: migratedState
      });
    }

    /**
     * Migration to v2.0.0
     */
  }, {
    key: "migrateToV2",
    value: function migrateToV2(state) {
      _Logger["default"].info('SaveManager', 'Applying v2.0.0 migration');

      // Ensure new structure exists
      if (!state.ascension) {
        state.ascension = {
          level: 0,
          lifetimeEnergy: state.lifetimeEnergy || 0,
          totalAscensions: 0
        };
      }
      if (!state.realms) {
        state.realms = {
          current: 'forest',
          unlocked: ['forest']
        };
      }
      if (!state.automation) {
        state.automation = {
          autoBuyStructures: false,
          autoClaimQuests: false,
          autoPuzzle: false,
          autoBuyThreshold: 0.8
        };
      }

      // Migrate old structure format
      if (state.structures) {
        var newStructures = {};
        for (var _i2 = 0, _Object$entries = Object.entries(state.structures); _i2 < _Object$entries.length; _i2++) {
          var _Object$entries$_i = _slicedToArray(_Object$entries[_i2], 2),
            key = _Object$entries$_i[0],
            value = _Object$entries$_i[1];
          if (typeof value === 'number') {
            // Old format: just level
            newStructures[key] = {
              level: value,
              totalPurchased: value
            };
          } else {
            // Already new format
            newStructures[key] = value;
          }
        }
        state.structures = newStructures;
      }

      // Ensure statistics exist
      if (!state.statistics) {
        state.statistics = {
          sessionsPlayed: 1,
          totalPlayTime: 0,
          sessionStartTime: Date.now(),
          structuresPurchased: 0,
          upgradesPurchased: 0,
          guardiansSummoned: 0,
          questsCompleted: 0,
          bossesDefeated: 0,
          puzzlesPlayed: 0,
          puzzleHighScore: 0,
          gemsSpent: 0,
          gemsEarned: 0,
          highestEnergyPerSecond: 0
        };
      }
      return state;
    }

    /**
     * Compare version strings
     * Returns: -1 if v1 < v2, 0 if equal, 1 if v1 > v2
     */
  }, {
    key: "compareVersions",
    value: function compareVersions(v1, v2) {
      var parts1 = v1.split('.').map(Number);
      var parts2 = v2.split('.').map(Number);
      for (var i = 0; i < 3; i++) {
        if (parts1[i] > parts2[i]) return 1;
        if (parts1[i] < parts2[i]) return -1;
      }
      return 0;
    }

    /**
     * Export save as downloadable file
     */
  }, {
    key: "export",
    value: function _export() {
      try {
        var state = _StateManager["default"].getState();
        var exportData = {
          version: _config["default"].VERSION,
          timestamp: Date.now(),
          state: state
        };
        var json = JSON.stringify(exportData, null, 2);
        var blob = new Blob([json], {
          type: 'application/json'
        });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = "idle_game_save_".concat(Date.now(), ".json");
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        _Logger["default"].info('SaveManager', 'Save exported');
        _EventBus["default"].emit('game:exported');
        return true;
      } catch (error) {
        _Logger["default"].error('SaveManager', 'Failed to export save:', error);
        return false;
      }
    }

    /**
     * Import save from file
     */
  }, {
    key: "import",
    value: (function () {
      var _import2 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(file) {
        var text, importData, migratedData, _t;
        return _regenerator().w(function (_context) {
          while (1) switch (_context.p = _context.n) {
            case 0:
              _context.p = 0;
              _context.n = 1;
              return file.text();
            case 1:
              text = _context.v;
              importData = JSON.parse(text);
              if (this.validateSave(importData)) {
                _context.n = 2;
                break;
              }
              throw new Error('Invalid save file');
            case 2:
              migratedData = this.migrate(importData);
              _StateManager["default"].dispatch({
                type: 'LOAD_STATE',
                payload: {
                  state: migratedData.state
                }
              });

              // Save immediately
              this.save();
              _Logger["default"].info('SaveManager', 'Save imported successfully');
              _EventBus["default"].emit('game:imported', {
                saveData: migratedData
              });
              return _context.a(2, true);
            case 3:
              _context.p = 3;
              _t = _context.v;
              _Logger["default"].error('SaveManager', 'Failed to import save:', _t);
              _EventBus["default"].emit('game:import-failed', {
                error: _t.message
              });
              return _context.a(2, false);
          }
        }, _callee, this, [[0, 3]]);
      }));
      function _import(_x) {
        return _import2.apply(this, arguments);
      }
      return _import;
    }()
    /**
     * Delete save
     */
    )
  }, {
    key: "deleteSave",
    value: function deleteSave() {
      try {
        localStorage.removeItem(this.saveKey);
        _Logger["default"].info('SaveManager', 'Save deleted');
        _EventBus["default"].emit('game:save-deleted');
        return true;
      } catch (error) {
        _Logger["default"].error('SaveManager', 'Failed to delete save:', error);
        return false;
      }
    }

    /**
     * Check if save exists
     */
  }, {
    key: "hasSave",
    value: function hasSave() {
      return localStorage.getItem(this.saveKey) !== null;
    }

    /**
     * Get save size in bytes
     */
  }, {
    key: "getSaveSize",
    value: function getSaveSize() {
      var savedData = localStorage.getItem(this.saveKey);
      if (!savedData) return 0;

      // Rough estimate (UTF-16)
      return new Blob([savedData]).size;
    }

    /**
     * Get save info without loading
     */
  }, {
    key: "getSaveInfo",
    value: function getSaveInfo() {
      try {
        var savedData = localStorage.getItem(this.saveKey);
        if (!savedData) return null;
        var saveData = JSON.parse(savedData);
        return {
          version: saveData.version,
          timestamp: saveData.timestamp,
          size: this.getSaveSize(),
          hasState: !!saveData.state
        };
      } catch (error) {
        _Logger["default"].error('SaveManager', 'Failed to get save info:', error);
        return null;
      }
    }

    /**
     * Start auto-save
     */
  }, {
    key: "startAutoSave",
    value: function startAutoSave() {
      var _this = this;
      if (this.autoSaveInterval) {
        this.stopAutoSave();
      }
      this.autoSaveInterval = setInterval(function () {
        if (_this.autoSaveEnabled) {
          _this.save();
        }
      }, _config["default"].AUTO_SAVE_INTERVAL);
      _Logger["default"].info('SaveManager', "Auto-save started (every ".concat(_config["default"].AUTO_SAVE_INTERVAL / 1000, "s)"));
    }

    /**
     * Stop auto-save
     */
  }, {
    key: "stopAutoSave",
    value: function stopAutoSave() {
      if (this.autoSaveInterval) {
        clearInterval(this.autoSaveInterval);
        this.autoSaveInterval = null;
        _Logger["default"].info('SaveManager', 'Auto-save stopped');
      }
    }

    /**
     * Toggle auto-save
     */
  }, {
    key: "toggleAutoSave",
    value: function toggleAutoSave(enabled) {
      this.autoSaveEnabled = enabled;
      if (enabled && !this.autoSaveInterval) {
        this.startAutoSave();
      } else if (!enabled && this.autoSaveInterval) {
        this.stopAutoSave();
      }
    }
  }]);
}(); // Singleton
var saveManager = new SaveManager();
var _default = exports["default"] = saveManager;

},{"../config.js":1,"../utils/EventBus.js":56,"../utils/Logger.js":58,"./StateManager.js":6}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _config = _interopRequireDefault(require("../config.js"));
var _EventBus = _interopRequireDefault(require("../utils/EventBus.js"));
var _Logger = _interopRequireDefault(require("../utils/Logger.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /**
 * StateManager - Centralized state management
 * Redux-like pattern with actions and reducers
 */
var StateManager = /*#__PURE__*/function () {
  function StateManager() {
    _classCallCheck(this, StateManager);
    this.state = this.getInitialState();
    this.listeners = new Map();
    this.history = [];
    this.maxHistory = 50;
    _Logger["default"].info('StateManager', 'Initialized');
  }

  /**
   * Initial state structure
   */
  return _createClass(StateManager, [{
    key: "getInitialState",
    value: function getInitialState() {
      return {
        // Meta
        version: _config["default"].VERSION,
        createdAt: Date.now(),
        lastSaved: null,
        // Resources
        resources: {
          energy: _config["default"].BALANCING.STARTING_ENERGY,
          mana: _config["default"].BALANCING.STARTING_MANA,
          gems: _config["default"].BALANCING.STARTING_GEMS,
          crystals: _config["default"].BALANCING.STARTING_CRYSTALS,
          volcanicEnergy: 0
        },
        // Caps
        caps: {
          energy: _config["default"].BALANCING.BASE_ENERGY_CAP,
          mana: _config["default"].BALANCING.BASE_MANA_CAP,
          volcanicEnergy: _config["default"].BALANCING.BASE_VOLCANIC_ENERGY_CAP
        },
        // Production rates
        production: {
          energy: 0,
          mana: 0,
          volcanicEnergy: 0
        },
        // Structures (will be populated)
        structures: {},
        // Upgrades (will be populated)
        upgrades: {},
        // Guardians
        guardians: [],
        // Quests
        quests: {
          active: [],
          completed: [],
          completedToday: 0,
          dailyLimit: _config["default"].BALANCING.DAILY_QUEST_LIMIT,
          lastReset: Date.now()
        },
        // ✅ MODIFICAT - Achievements cu structură completă
        achievements: {
          // Pentru achievement system-ul principal (idle game)
          unlocked: [],
          // ← ADĂUGAT
          claimed: [],
          // ← ADĂUGAT
          // Pentru mini-game achievements
          miniGames: {
            dailySpin: [],
            game2048: [],
            match3: []
          },
          miniGamesTimestamps: {}
        },
        // Bosses
        bosses: {},
        currentBoss: null,
        bossHP: 0,
        // Realms
        realms: {
          current: 'forest',
          unlocked: ['forest']
        },
        // Ascension
        ascension: {
          level: 0,
          lifetimeEnergy: 0,
          totalAscensions: 0
        },
        // Shop
        shop: {
          purchaseHistory: [],
          vipActive: false,
          vipExpiry: null,
          adsWatchedToday: 0,
          lastAdReset: Date.now()
        },
        // Daily rewards
        dailyRewards: {
          streak: 0,
          lastClaim: null,
          lastModalShown: null,
          claimed: []
        },
        // Automation
        automation: {
          autoBuyStructures: false,
          autoClaimQuests: false,
          autoPuzzle: false,
          autoBuyThreshold: 0.8 // Buy when >= 80% of cost
        },
        // Statistics
        statistics: {
          sessionsPlayed: 0,
          totalPlayTime: 0,
          sessionStartTime: Date.now(),
          totalClicks: 0,
          // ← ADĂUGAT pentru firstClick achievement
          structuresPurchased: 0,
          upgradesPurchased: 0,
          guardiansSummoned: 0,
          questsCompleted: 0,
          bossesDefeated: 0,
          puzzlesPlayed: 0,
          puzzlesWon: 0,
          puzzleHighScore: 0,
          gemsSpent: 0,
          gemsEarned: 0,
          highestEnergyPerSecond: 0
        },
        // Mini-Games
        miniGames: {
          dailySpin: {
            lastSpinDate: '',
            lastSpin: 0,
            totalSpins: 0,
            purchasedSpins: 0,
            unlimitedUntil: 0
          },
          game2048: {
            highScore: 0,
            gamesPlayed: 0
          },
          match3: {
            // ← ADĂUGAT
            highScore: 0,
            gamesPlayed: 0,
            bestCombo: 0,
            specialGemsCreated: {},
            perfectVictories: 0
          }
        },
        // Upgrade Queue
        upgradeQueue: {
          queue: [],
          slots: 1,
          activeUpgrade: null
        },
        // Settings
        settings: {
          theme: 'dark',
          soundEnabled: true,
          musicEnabled: false,
          notificationsEnabled: true,
          particleQuality: 'medium',
          autoSaveEnabled: true,
          showFPS: false
        },
        // Tutorial
        tutorial: {
          completed: false,
          currentStep: 0,
          skipped: false
        }
      };
    }

    /**
     * Dispatch an action to modify state
     * @param {object} action - { type: string, payload: any }
     */
  }, {
    key: "dispatch",
    value: function dispatch(action) {
      if (!action || !action.type) {
        _Logger["default"].error('StateManager', 'Invalid action', action);
        return;
      }
      _Logger["default"].debug('StateManager', "Action: ".concat(action.type), action.payload);

      // Store previous state for history
      var previousState = JSON.parse(JSON.stringify(this.state));

      // Apply reducer
      this.state = this.reducer(this.state, action);

      // Add to history
      this.history.push({
        action: action,
        timestamp: Date.now(),
        previousState: previousState
      });

      // Maintain history size
      if (this.history.length > this.maxHistory) {
        this.history.shift();
      }

      // Notify listeners
      this.notifyListeners(action.type, this.state);

      // Emit event
      _EventBus["default"].emit("state:".concat(action.type), {
        action: action,
        state: this.state
      });
    }

    /**
     * Reducer - pure function that returns new state
     */
  }, {
    key: "reducer",
    value: function reducer(state, action) {
      var _state$structures$str, _state$structures$str2, _state$upgrades$upgra, _state$upgradeQueue, _state$shop$adWatchCo, _state$miniGames6, _state$miniGames7, _state$miniGames8, _state$miniGames9, _state$miniGames0, _state$miniGames1, _state$miniGames10, _state$miniGames11;
      switch (action.type) {
        // ===== RESOURCES =====
        case 'ADD_RESOURCE':
          return _objectSpread(_objectSpread({}, state), {}, {
            resources: _objectSpread(_objectSpread({}, state.resources), {}, _defineProperty({}, action.payload.resource, Math.min(state.resources[action.payload.resource] + action.payload.amount, state.caps[action.payload.resource] || Infinity)))
          });
        case 'REMOVE_RESOURCE':
          return _objectSpread(_objectSpread({}, state), {}, {
            resources: _objectSpread(_objectSpread({}, state.resources), {}, _defineProperty({}, action.payload.resource, Math.max(state.resources[action.payload.resource] - action.payload.amount, 0)))
          });
        case 'SET_RESOURCE':
          return _objectSpread(_objectSpread({}, state), {}, {
            resources: _objectSpread(_objectSpread({}, state.resources), {}, _defineProperty({}, action.payload.resource, action.payload.amount))
          });
        case 'SET_CAP':
          return _objectSpread(_objectSpread({}, state), {}, {
            caps: _objectSpread(_objectSpread({}, state.caps), {}, _defineProperty({}, action.payload.resource, action.payload.amount))
          });
        case 'SET_PRODUCTION':
          return _objectSpread(_objectSpread({}, state), {}, {
            production: _objectSpread(_objectSpread({}, state.production), {}, _defineProperty({}, action.payload.resource, action.payload.amount))
          });

        // ===== STRUCTURES =====
        case 'BUY_STRUCTURE':
          var _action$payload = action.payload,
            structureKey = _action$payload.structureKey,
            cost = _action$payload.cost;
          var currentLevel = ((_state$structures$str = state.structures[structureKey]) === null || _state$structures$str === void 0 ? void 0 : _state$structures$str.level) || 0;
          return _objectSpread(_objectSpread({}, state), {}, {
            resources: _objectSpread(_objectSpread({}, state.resources), {}, {
              energy: state.resources.energy - cost
            }),
            structures: _objectSpread(_objectSpread({}, state.structures), {}, _defineProperty({}, structureKey, {
              level: currentLevel + 1,
              totalPurchased: (((_state$structures$str2 = state.structures[structureKey]) === null || _state$structures$str2 === void 0 ? void 0 : _state$structures$str2.totalPurchased) || 0) + 1
            })),
            statistics: _objectSpread(_objectSpread({}, state.statistics), {}, {
              structuresPurchased: state.statistics.structuresPurchased + 1
            })
          });
        case 'RESET_STRUCTURES':
          return _objectSpread(_objectSpread({}, state), {}, {
            structures: {}
          });

        // ===== UPGRADES =====
        case 'BUY_UPGRADE':
          var _action$payload2 = action.payload,
            upgradeKey = _action$payload2.upgradeKey,
            upgradeCost = _action$payload2.upgradeCost,
            costResource = _action$payload2.costResource,
            skipResourceDeduction = _action$payload2.skipResourceDeduction;
          var currentUpgradeLevel = ((_state$upgrades$upgra = state.upgrades[upgradeKey]) === null || _state$upgrades$upgra === void 0 ? void 0 : _state$upgrades$upgra.level) || 0;

          // Calculate new resources (only deduct if not already deducted)
          var newResources = skipResourceDeduction ? state.resources : _objectSpread(_objectSpread({}, state.resources), {}, _defineProperty({}, costResource, state.resources[costResource] - upgradeCost));
          return _objectSpread(_objectSpread({}, state), {}, {
            resources: newResources,
            upgrades: _objectSpread(_objectSpread({}, state.upgrades), {}, _defineProperty({}, upgradeKey, {
              level: currentUpgradeLevel + 1
            })),
            statistics: _objectSpread(_objectSpread({}, state.statistics), {}, {
              upgradesPurchased: state.statistics.upgradesPurchased + 1
            })
          });
        case 'RESET_UPGRADES':
          return _objectSpread(_objectSpread({}, state), {}, {
            upgrades: {}
          });

        // ===== GUARDIANS =====
        case 'ADD_GUARDIAN':
          return _objectSpread(_objectSpread({}, state), {}, {
            guardians: [].concat(_toConsumableArray(state.guardians), [action.payload.guardian]),
            resources: _objectSpread(_objectSpread({}, state.resources), {}, {
              gems: state.resources.gems - _config["default"].BALANCING.GUARDIAN_SUMMON_COST
            }),
            statistics: _objectSpread(_objectSpread({}, state.statistics), {}, {
              guardiansSummoned: (state.statistics.guardiansSummoned || 0) + 1,
              gemsSpent: state.statistics.gemsSpent + _config["default"].BALANCING.GUARDIAN_SUMMON_COST
            })
          });
        case 'ADD_GUARDIAN_DIRECT':
          return _objectSpread(_objectSpread({}, state), {}, {
            guardians: [].concat(_toConsumableArray(state.guardians), [action.payload.guardian])
          });
        case 'REMOVE_GUARDIAN':
          return _objectSpread(_objectSpread({}, state), {}, {
            guardians: state.guardians.filter(function (g) {
              return g.id !== action.payload.guardianId;
            })
          });
        case 'RESET_GUARDIANS':
          return _objectSpread(_objectSpread({}, state), {}, {
            guardians: []
          });

        // ===== QUESTS =====
        case 'ADD_QUEST':
          return _objectSpread(_objectSpread({}, state), {}, {
            quests: _objectSpread(_objectSpread({}, state.quests), {}, {
              active: [].concat(_toConsumableArray(state.quests.active), [action.payload.quest])
            })
          });
        case 'UPDATE_QUEST_PROGRESS':
          return _objectSpread(_objectSpread({}, state), {}, {
            quests: _objectSpread(_objectSpread({}, state.quests), {}, {
              active: state.quests.active.map(function (quest) {
                if (quest.id === action.payload.questId) {
                  var newProgress = quest.progress + action.payload.amount;
                  return _objectSpread(_objectSpread({}, quest), {}, {
                    progress: newProgress,
                    completed: newProgress >= quest.amount
                  });
                }
                return quest;
              })
            })
          });
        case 'COMPLETE_QUEST':
          return _objectSpread(_objectSpread({}, state), {}, {
            quests: _objectSpread(_objectSpread({}, state.quests), {}, {
              active: state.quests.active.filter(function (q) {
                return q.id !== action.payload.questId;
              }),
              completed: [].concat(_toConsumableArray(state.quests.completed), [action.payload.questId]),
              completedToday: state.quests.completedToday + 1
            }),
            statistics: _objectSpread(_objectSpread({}, state.statistics), {}, {
              questsCompleted: state.statistics.questsCompleted + 1
            })
          });

        // ===== ACHIEVEMENTS (General Idle Game) =====
        case 'UNLOCK_ACHIEVEMENT':
          {
            var _state$achievements, _state$achievements2;
            var achievementId = action.payload.id || action.payload.achievementKey;

            // Check if already unlocked
            if ((_state$achievements = state.achievements) !== null && _state$achievements !== void 0 && (_state$achievements = _state$achievements.unlocked) !== null && _state$achievements !== void 0 && _state$achievements.includes(achievementId)) {
              return state;
            }
            return _objectSpread(_objectSpread({}, state), {}, {
              achievements: _objectSpread(_objectSpread({}, state.achievements), {}, {
                unlocked: [].concat(_toConsumableArray(((_state$achievements2 = state.achievements) === null || _state$achievements2 === void 0 ? void 0 : _state$achievements2.unlocked) || []), [achievementId])
              })
            });
          }
        case 'CLAIM_ACHIEVEMENT':
          {
            var _state$achievements3;
            var _achievementId = action.payload.id || action.payload.achievementKey;
            return _objectSpread(_objectSpread({}, state), {}, {
              achievements: _objectSpread(_objectSpread({}, state.achievements), {}, {
                claimed: [].concat(_toConsumableArray(((_state$achievements3 = state.achievements) === null || _state$achievements3 === void 0 ? void 0 : _state$achievements3.claimed) || []), [_achievementId])
              })
            });
          }
        case 'TRIGGER_ACHIEVEMENT':
          return _objectSpread(_objectSpread({}, state), {}, {
            achievements: _objectSpread(_objectSpread({}, state.achievements), {}, _defineProperty({}, action.payload.achievementKey, _objectSpread(_objectSpread({}, state.achievements[action.payload.achievementKey]), {}, {
              triggered: true
            })))
          });

        // ===== MINI-GAME ACHIEVEMENTS =====
        case 'UNLOCK_MINI_GAME_ACHIEVEMENT':
          {
            var _state$achievements4, _state$achievements5, _state$achievements6, _state$achievements7;
            var _action$payload3 = action.payload,
              _game = _action$payload3.game,
              _achievementId2 = _action$payload3.achievementId,
              timestamp = _action$payload3.timestamp;
            return _objectSpread(_objectSpread({}, state), {}, {
              achievements: _objectSpread(_objectSpread({}, state.achievements), {}, {
                miniGames: _objectSpread(_objectSpread({}, (_state$achievements4 = state.achievements) === null || _state$achievements4 === void 0 ? void 0 : _state$achievements4.miniGames), {}, _defineProperty({}, _game, [].concat(_toConsumableArray(((_state$achievements5 = state.achievements) === null || _state$achievements5 === void 0 || (_state$achievements5 = _state$achievements5.miniGames) === null || _state$achievements5 === void 0 ? void 0 : _state$achievements5[_game]) || []), [_achievementId2]))),
                miniGamesTimestamps: _objectSpread(_objectSpread({}, (_state$achievements6 = state.achievements) === null || _state$achievements6 === void 0 ? void 0 : _state$achievements6.miniGamesTimestamps), {}, _defineProperty({}, _game, _objectSpread(_objectSpread({}, (_state$achievements7 = state.achievements) === null || _state$achievements7 === void 0 || (_state$achievements7 = _state$achievements7.miniGamesTimestamps) === null || _state$achievements7 === void 0 ? void 0 : _state$achievements7[_game]), {}, _defineProperty({}, _achievementId2, timestamp))))
              })
            });
          }
        case 'UPDATE_MINI_GAME_STATS':
          {
            var _state$miniGames;
            var _action$payload4 = action.payload,
              _game2 = _action$payload4.game,
              stats = _action$payload4.stats;
            return _objectSpread(_objectSpread({}, state), {}, {
              miniGames: _objectSpread(_objectSpread({}, state.miniGames), {}, _defineProperty({}, _game2, _objectSpread(_objectSpread({}, (_state$miniGames = state.miniGames) === null || _state$miniGames === void 0 ? void 0 : _state$miniGames[_game2]), stats)))
            });
          }
        case 'TRACK_SPECIAL_GEM_CREATED':
          {
            var _state$miniGames2;
            var _action$payload5 = action.payload,
              _game3 = _action$payload5.game,
              gemType = _action$payload5.gemType;
            var currentStats = ((_state$miniGames2 = state.miniGames) === null || _state$miniGames2 === void 0 ? void 0 : _state$miniGames2[_game3]) || {};
            var specialGems = currentStats.specialGemsCreated || {};
            return _objectSpread(_objectSpread({}, state), {}, {
              miniGames: _objectSpread(_objectSpread({}, state.miniGames), {}, _defineProperty({}, _game3, _objectSpread(_objectSpread({}, currentStats), {}, {
                specialGemsCreated: _objectSpread(_objectSpread({}, specialGems), {}, _defineProperty({}, gemType, (specialGems[gemType] || 0) + 1))
              })))
            });
          }
        case 'TRACK_SPIN_REWARD':
          {
            var _state$miniGames3;
            var _action$payload6 = action.payload,
              gemAmount = _action$payload6.gemAmount,
              hasGuardian = _action$payload6.hasGuardian;
            var spinData = ((_state$miniGames3 = state.miniGames) === null || _state$miniGames3 === void 0 ? void 0 : _state$miniGames3.dailySpin) || {};
            return _objectSpread(_objectSpread({}, state), {}, {
              miniGames: _objectSpread(_objectSpread({}, state.miniGames), {}, {
                dailySpin: _objectSpread(_objectSpread({}, spinData), {}, {
                  highestGemReward: Math.max(spinData.highestGemReward || 0, gemAmount || 0),
                  guardiansWon: (spinData.guardiansWon || 0) + (hasGuardian ? 1 : 0),
                  spinHistory: [].concat(_toConsumableArray(spinData.spinHistory || []), [Date.now()]).slice(-100)
                })
              })
            });
          }
        case 'TRACK_2048_TILE':
          {
            var _state$miniGames4;
            var _action$payload7 = action.payload,
              tile = _action$payload7.tile,
              score = _action$payload7.score;
            var gameData = ((_state$miniGames4 = state.miniGames) === null || _state$miniGames4 === void 0 ? void 0 : _state$miniGames4.game2048) || {};
            return _objectSpread(_objectSpread({}, state), {}, {
              miniGames: _objectSpread(_objectSpread({}, state.miniGames), {}, {
                game2048: _objectSpread(_objectSpread({}, gameData), {}, {
                  highestTile: Math.max(gameData.highestTile || 0, tile),
                  highScore: Math.max(gameData.highScore || 0, score)
                })
              })
            });
          }
        case 'TRACK_MATCH3_GAME':
          {
            var _state$miniGames5;
            var _action$payload8 = action.payload,
              _score = _action$payload8.score,
              combo = _action$payload8.combo,
              isPerfect = _action$payload8.isPerfect;
            var _gameData = ((_state$miniGames5 = state.miniGames) === null || _state$miniGames5 === void 0 ? void 0 : _state$miniGames5.match3) || {};
            return _objectSpread(_objectSpread({}, state), {}, {
              miniGames: _objectSpread(_objectSpread({}, state.miniGames), {}, {
                match3: _objectSpread(_objectSpread({}, _gameData), {}, {
                  gamesPlayed: (_gameData.gamesPlayed || 0) + 1,
                  highScore: Math.max(_gameData.highScore || 0, _score),
                  bestCombo: Math.max(_gameData.bestCombo || 0, combo),
                  perfectVictories: (_gameData.perfectVictories || 0) + (isPerfect ? 1 : 0)
                })
              })
            });
          }

        // ===== BOSSES =====
        case 'INIT_BOSSES':
          return _objectSpread(_objectSpread({}, state), {}, {
            bosses: action.payload.bosses
          });
        case 'UNLOCK_BOSS':
          return _objectSpread(_objectSpread({}, state), {}, {
            bosses: _objectSpread(_objectSpread({}, state.bosses), {}, _defineProperty({}, action.payload.bossKey, _objectSpread(_objectSpread({}, state.bosses[action.payload.bossKey]), {}, {
              unlocked: true
            })))
          });
        case 'START_BOSS_BATTLE':
          return _objectSpread(_objectSpread({}, state), {}, {
            currentBoss: action.payload.bossKey
          });
        case 'DAMAGE_BOSS':
          return _objectSpread(_objectSpread({}, state), {}, {
            bosses: _objectSpread(_objectSpread({}, state.bosses), {}, _defineProperty({}, action.payload.bossKey, _objectSpread(_objectSpread({}, state.bosses[action.payload.bossKey]), {}, {
              currentHP: action.payload.newHP,
              attempts: (state.bosses[action.payload.bossKey].attempts || 0) + 1,
              bestScore: Math.max(state.bosses[action.payload.bossKey].bestScore || 0, action.payload.score)
            })))
          });
        case 'DEFEAT_BOSS':
          return _objectSpread(_objectSpread({}, state), {}, {
            bosses: _objectSpread(_objectSpread({}, state.bosses), {}, _defineProperty({}, action.payload.bossKey, _objectSpread(_objectSpread({}, state.bosses[action.payload.bossKey]), {}, {
              defeated: true,
              currentHP: 0,
              defeatedCount: (state.bosses[action.payload.bossKey].defeatedCount || 0) + 1,
              firstDefeatAt: state.bosses[action.payload.bossKey].firstDefeatAt || Date.now()
            }))),
            currentBoss: null,
            statistics: _objectSpread(_objectSpread({}, state.statistics), {}, {
              bossesDefeated: state.statistics.bossesDefeated + 1
            })
          });
        case 'EXIT_BOSS_BATTLE':
          return _objectSpread(_objectSpread({}, state), {}, {
            currentBoss: null
          });

        // ===== REALMS =====
        case 'UNLOCK_REALM':
          return _objectSpread(_objectSpread({}, state), {}, {
            realms: _objectSpread(_objectSpread({}, state.realms), {}, {
              unlocked: [].concat(_toConsumableArray(state.realms.unlocked), [action.payload.realmId])
            }),
            resources: _objectSpread(_objectSpread({}, state.resources), {}, {
              crystals: state.resources.crystals - (action.payload.cost || 0)
            })
          });
        case 'SWITCH_REALM':
          return _objectSpread(_objectSpread({}, state), {}, {
            realms: _objectSpread(_objectSpread({}, state.realms), {}, {
              current: action.payload.realmId
            })
          });

        // ===== ASCENSION =====
        case 'ASCEND':
          return _objectSpread(_objectSpread({}, state), {}, {
            ascension: {
              level: state.ascension.level + 1,
              lifetimeEnergy: state.ascension.lifetimeEnergy,
              totalAscensions: state.ascension.totalAscensions + 1
            },
            resources: _objectSpread(_objectSpread({}, state.resources), {}, {
              energy: _config["default"].BALANCING.STARTING_ENERGY,
              mana: 0,
              volcanicEnergy: 0,
              crystals: state.resources.crystals + action.payload.crystalsEarned
            }),
            structures: {},
            upgrades: {},
            upgradeQueue: {
              queue: [],
              slots: ((_state$upgradeQueue = state.upgradeQueue) === null || _state$upgradeQueue === void 0 ? void 0 : _state$upgradeQueue.slots) || 1,
              activeUpgrade: null
            }
          });
        case 'UPDATE_LIFETIME_ENERGY':
          return _objectSpread(_objectSpread({}, state), {}, {
            ascension: _objectSpread(_objectSpread({}, state.ascension), {}, {
              lifetimeEnergy: state.ascension.lifetimeEnergy + action.payload.amount
            })
          });

        // ===== SHOP =====
        case 'RECORD_PURCHASE':
          return _objectSpread(_objectSpread({}, state), {}, {
            shop: _objectSpread(_objectSpread({}, state.shop), {}, {
              purchaseHistory: [].concat(_toConsumableArray(state.shop.purchaseHistory), [action.payload])
            })
          });
        case 'ACTIVATE_VIP':
          return _objectSpread(_objectSpread({}, state), {}, {
            shop: _objectSpread(_objectSpread({}, state.shop), {}, {
              vipActive: true,
              vipExpiry: action.payload.expiryTime,
              vipBenefits: action.payload.benefits
            })
          });
        case 'DEACTIVATE_VIP':
          return _objectSpread(_objectSpread({}, state), {}, {
            shop: _objectSpread(_objectSpread({}, state.shop), {}, {
              vipActive: false,
              vipExpiry: null,
              vipBenefits: null
            })
          });
        case 'RESET_AD_COUNTER':
          return _objectSpread(_objectSpread({}, state), {}, {
            shop: _objectSpread(_objectSpread({}, state.shop), {}, {
              adsWatchedToday: 0,
              adWatchCount: {},
              lastAdReset: Date.now()
            })
          });
        case 'INCREMENT_AD_WATCH':
          var adType = action.payload.adType;
          return _objectSpread(_objectSpread({}, state), {}, {
            shop: _objectSpread(_objectSpread({}, state.shop), {}, {
              adsWatchedToday: state.shop.adsWatchedToday + 1,
              adWatchCount: _objectSpread(_objectSpread({}, state.shop.adWatchCount), {}, _defineProperty({}, adType, (((_state$shop$adWatchCo = state.shop.adWatchCount) === null || _state$shop$adWatchCo === void 0 ? void 0 : _state$shop$adWatchCo[adType]) || 0) + 1))
            })
          });
        case 'APPLY_TEMP_MULTIPLIER':
          return _objectSpread(_objectSpread({}, state), {}, {
            tempMultiplier: {
              active: true,
              multiplier: action.payload.multiplier,
              expiresAt: action.payload.expiresAt
            }
          });
        case 'REMOVE_TEMP_MULTIPLIER':
          return _objectSpread(_objectSpread({}, state), {}, {
            tempMultiplier: {
              active: false,
              multiplier: 1,
              expiresAt: null
            }
          });
        case 'REFRESH_DAILY_DEAL':
          return _objectSpread(_objectSpread({}, state), {}, {
            shop: _objectSpread(_objectSpread({}, state.shop), {}, {
              dailyDeal: _objectSpread(_objectSpread({}, action.payload.deal), {}, {
                refreshedAt: action.payload.refreshedAt
              })
            })
          });

        // ===== DAILY REWARDS =====
        case 'CLAIM_DAILY_REWARD':
          return _objectSpread(_objectSpread({}, state), {}, {
            dailyRewards: _objectSpread(_objectSpread({}, state.dailyRewards), {}, {
              streak: action.payload.streak,
              lastClaim: action.payload.lastClaim,
              claimed: [].concat(_toConsumableArray(state.dailyRewards.claimed || []), [{
                day: action.payload.day,
                timestamp: action.payload.lastClaim
              }])
            })
          });

        // ✅ ADAUGĂ ACEST NOU CASE AICI (DUPĂ CLAIM_DAILY_REWARD):
        case 'DAILY_REWARD_MODAL_SHOWN':
          return _objectSpread(_objectSpread({}, state), {}, {
            dailyRewards: _objectSpread(_objectSpread({}, state.dailyRewards), {}, {
              lastModalShown: action.payload.timestamp
            })
          });

        // ===== AUTOMATION =====
        case 'UNLOCK_AUTOMATION':
          return _objectSpread(_objectSpread({}, state), {}, {
            automation: _objectSpread(_objectSpread({}, state.automation), {}, _defineProperty({}, action.payload.featureKey, _objectSpread(_objectSpread({}, state.automation[action.payload.featureKey]), {}, {
              unlocked: true,
              enabled: false
            })))
          });
        case 'TOGGLE_AUTOMATION':
          return _objectSpread(_objectSpread({}, state), {}, {
            automation: _objectSpread(_objectSpread({}, state.automation), {}, _defineProperty({}, action.payload.featureKey, _objectSpread(_objectSpread({}, state.automation[action.payload.featureKey]), {}, {
              enabled: action.payload.enabled
            })))
          });
        case 'SET_AUTO_BUY_THRESHOLD':
          return _objectSpread(_objectSpread({}, state), {}, {
            automation: _objectSpread(_objectSpread({}, state.automation), {}, {
              autoBuyThreshold: action.payload.threshold
            })
          });
        case 'SET_AUTO_SUMMON_THRESHOLD':
          return _objectSpread(_objectSpread({}, state), {}, {
            automation: _objectSpread(_objectSpread({}, state.automation), {}, {
              autoSummonThreshold: action.payload.threshold
            })
          });

        // ===== STATISTICS =====
        case 'UPDATE_STATISTIC':
          return _objectSpread(_objectSpread({}, state), {}, {
            statistics: _objectSpread(_objectSpread({}, state.statistics), {}, _defineProperty({}, action.payload.key, action.payload.value))
          });
        case 'INCREMENT_STATISTIC':
          return _objectSpread(_objectSpread({}, state), {}, {
            statistics: _objectSpread(_objectSpread({}, state.statistics), {}, _defineProperty({}, action.payload.key, (state.statistics[action.payload.key] || 0) + action.payload.amount))
          });

        // ===== MINI-GAMES =====
        case 'UPDATE_MINI_GAME':
          return _objectSpread(_objectSpread({}, state), {}, {
            miniGames: _objectSpread(_objectSpread({}, state.miniGames), {}, _defineProperty({}, action.payload.game, _objectSpread(_objectSpread({}, ((_state$miniGames6 = state.miniGames) === null || _state$miniGames6 === void 0 ? void 0 : _state$miniGames6[action.payload.game]) || {}), action.payload.data)))
          });
        case 'INCREMENT_MINI_GAME_STAT':
          var game = action.payload.game;
          var stat = action.payload.stat;
          return _objectSpread(_objectSpread({}, state), {}, {
            miniGames: _objectSpread(_objectSpread({}, state.miniGames), {}, _defineProperty({}, game, _objectSpread(_objectSpread({}, ((_state$miniGames7 = state.miniGames) === null || _state$miniGames7 === void 0 ? void 0 : _state$miniGames7[game]) || {}), {}, _defineProperty({}, stat, (((_state$miniGames8 = state.miniGames) === null || _state$miniGames8 === void 0 || (_state$miniGames8 = _state$miniGames8[game]) === null || _state$miniGames8 === void 0 ? void 0 : _state$miniGames8[stat]) || 0) + 1))))
          });
        case 'ADD_PURCHASED_SPINS':
          return _objectSpread(_objectSpread({}, state), {}, {
            miniGames: _objectSpread(_objectSpread({}, state.miniGames), {}, {
              dailySpin: _objectSpread(_objectSpread({}, ((_state$miniGames9 = state.miniGames) === null || _state$miniGames9 === void 0 ? void 0 : _state$miniGames9.dailySpin) || {}), {}, {
                purchasedSpins: (((_state$miniGames0 = state.miniGames) === null || _state$miniGames0 === void 0 || (_state$miniGames0 = _state$miniGames0.dailySpin) === null || _state$miniGames0 === void 0 ? void 0 : _state$miniGames0.purchasedSpins) || 0) + action.payload.count
              })
            })
          });
        case 'DECREMENT_PURCHASED_SPINS':
          return _objectSpread(_objectSpread({}, state), {}, {
            miniGames: _objectSpread(_objectSpread({}, state.miniGames), {}, {
              dailySpin: _objectSpread(_objectSpread({}, ((_state$miniGames1 = state.miniGames) === null || _state$miniGames1 === void 0 ? void 0 : _state$miniGames1.dailySpin) || {}), {}, {
                purchasedSpins: Math.max(0, (((_state$miniGames10 = state.miniGames) === null || _state$miniGames10 === void 0 || (_state$miniGames10 = _state$miniGames10.dailySpin) === null || _state$miniGames10 === void 0 ? void 0 : _state$miniGames10.purchasedSpins) || 0) - 1)
              })
            })
          });
        case 'ACTIVATE_UNLIMITED_SPINS':
          return _objectSpread(_objectSpread({}, state), {}, {
            miniGames: _objectSpread(_objectSpread({}, state.miniGames), {}, {
              dailySpin: _objectSpread(_objectSpread({}, ((_state$miniGames11 = state.miniGames) === null || _state$miniGames11 === void 0 ? void 0 : _state$miniGames11.dailySpin) || {}), {}, {
                unlimitedUntil: action.payload.expiresAt
              })
            })
          });

        // ===== UPGRADE QUEUE =====
        case 'INIT_UPGRADE_QUEUE':
          return _objectSpread(_objectSpread({}, state), {}, {
            upgradeQueue: {
              queue: [],
              slots: 1,
              activeUpgrade: null
            }
          });
        case 'ADD_TO_UPGRADE_QUEUE':
          return _objectSpread(_objectSpread({}, state), {}, {
            upgradeQueue: _objectSpread(_objectSpread({}, state.upgradeQueue), {}, {
              queue: [].concat(_toConsumableArray(state.upgradeQueue.queue), [action.payload.item])
            }),
            resources: _objectSpread(_objectSpread({}, state.resources), {}, _defineProperty({}, action.payload.item.costResource, state.resources[action.payload.item.costResource] - action.payload.item.cost))
          });
        case 'REMOVE_FROM_UPGRADE_QUEUE':
          return _objectSpread(_objectSpread({}, state), {}, {
            upgradeQueue: _objectSpread(_objectSpread({}, state.upgradeQueue), {}, {
              queue: state.upgradeQueue.queue.filter(function (item) {
                return item.upgradeKey !== action.payload.upgradeKey;
              })
            })
          });
        case 'START_UPGRADE':
          return _objectSpread(_objectSpread({}, state), {}, {
            upgradeQueue: _objectSpread(_objectSpread({}, state.upgradeQueue), {}, {
              queue: state.upgradeQueue.queue.slice(1),
              activeUpgrade: action.payload.upgrade
            })
          });
        case 'COMPLETE_UPGRADE':
          return _objectSpread(_objectSpread({}, state), {}, {
            upgradeQueue: _objectSpread(_objectSpread({}, state.upgradeQueue), {}, {
              activeUpgrade: null
            })
          });
        case 'UPGRADE_QUEUE_SLOTS':
          return _objectSpread(_objectSpread({}, state), {}, {
            upgradeQueue: _objectSpread(_objectSpread({}, state.upgradeQueue), {}, {
              slots: action.payload.slots
            })
          });

        // ===== SETTINGS =====
        case 'UPDATE_SETTING':
          return _objectSpread(_objectSpread({}, state), {}, {
            settings: _objectSpread(_objectSpread({}, state.settings), {}, _defineProperty({}, action.payload.key, action.payload.value))
          });

        // ===== TUTORIAL =====
        case 'COMPLETE_TUTORIAL':
          return _objectSpread(_objectSpread({}, state), {}, {
            tutorial: _objectSpread(_objectSpread({}, state.tutorial), {}, {
              completed: true,
              completedAt: Date.now()
            })
          });
        case 'SKIP_TUTORIAL':
          return _objectSpread(_objectSpread({}, state), {}, {
            tutorial: _objectSpread(_objectSpread({}, state.tutorial), {}, {
              skipped: true,
              skippedAt: Date.now()
            })
          });
        case 'RESET_TUTORIAL':
          return _objectSpread(_objectSpread({}, state), {}, {
            tutorial: {
              completed: false,
              skipped: false,
              currentStep: 0
            }
          });

        // ===== SAVE/LOAD =====
        case 'SAVE_GAME':
          return _objectSpread(_objectSpread({}, state), {}, {
            lastSaved: Date.now()
          });
        case 'LOAD_STATE':
          return action.payload.state;
        case 'RESET_STATE':
          return this.getInitialState();
        default:
          _Logger["default"].warn('StateManager', "Unknown action type: ".concat(action.type));
          return state;
      }
    }

    /**
     * Subscribe to state changes
     * @param {string} key - State key to watch (or '*' for all)
     * @param {function} callback - Handler
     */
  }, {
    key: "subscribe",
    value: function subscribe(key, callback) {
      var _this = this;
      if (!this.listeners.has(key)) {
        this.listeners.set(key, []);
      }
      this.listeners.get(key).push(callback);

      // Return unsubscribe function
      return function () {
        var callbacks = _this.listeners.get(key);
        var index = callbacks.indexOf(callback);
        if (index !== -1) {
          callbacks.splice(index, 1);
        }
      };
    }

    /**
     * Notify listeners
     */
  }, {
    key: "notifyListeners",
    value: function notifyListeners(actionType, newState) {
      // Notify specific listeners
      if (this.listeners.has(actionType)) {
        this.listeners.get(actionType).forEach(function (callback) {
          try {
            callback(newState);
          } catch (error) {
            _Logger["default"].error('StateManager', "Error in listener for ".concat(actionType, ":"), error);
          }
        });
      }

      // Notify global listeners
      if (this.listeners.has('*')) {
        this.listeners.get('*').forEach(function (callback) {
          try {
            callback(newState, actionType);
          } catch (error) {
            _Logger["default"].error('StateManager', 'Error in global listener:', error);
          }
        });
      }
    }

    /**
     * Get current state (read-only)
     */
  }, {
    key: "getState",
    value: function getState() {
      return JSON.parse(JSON.stringify(this.state)); // Deep clone
    }

    /**
     * Get specific state value
     */
  }, {
    key: "get",
    value: function get(path) {
      var keys = path.split('.');
      var value = this.state;
      var _iterator = _createForOfIteratorHelper(keys),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var _value;
          var key = _step.value;
          value = (_value = value) === null || _value === void 0 ? void 0 : _value[key];
          if (value === undefined) break;
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      return value;
    }

    /**
     * Undo last action
     */
  }, {
    key: "undo",
    value: function undo() {
      if (this.history.length === 0) {
        _Logger["default"].warn('StateManager', 'No history to undo');
        return;
      }
      var lastEntry = this.history.pop();
      this.state = lastEntry.previousState;
      _Logger["default"].info('StateManager', "Undid action: ".concat(lastEntry.action.type));
      this.notifyListeners('UNDO', this.state);
    }

    /**
     * Get action history
     */
  }, {
    key: "getHistory",
    value: function getHistory() {
      var count = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 10;
      return this.history.slice(-count);
    }

    /**
     * Debug info
     */
  }, {
    key: "debug",
    value: function debug() {
      console.log('[StateManager] Current state:', this.state);
      console.log('[StateManager] Listeners:', Array.from(this.listeners.keys()));
      console.log('[StateManager] Recent history:', this.history.slice(-5));
    }
  }]);
}(); // Singleton
var stateManager = new StateManager();
var _default = exports["default"] = stateManager;

},{"../config.js":1,"../utils/EventBus.js":56,"../utils/Logger.js":58}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _config = _interopRequireDefault(require("../config.js"));
var _StateManager = _interopRequireDefault(require("./StateManager.js"));
var _EventBus = _interopRequireDefault(require("../utils/EventBus.js"));
var _Logger = _interopRequireDefault(require("../utils/Logger.js"));
var _ResourceManager = _interopRequireDefault(require("./ResourceManager.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /**
 * TickManager - Game loop and time management
 */
var TickManager = /*#__PURE__*/function () {
  function TickManager() {
    _classCallCheck(this, TickManager);
    this.isRunning = false;
    this.tickInterval = null;
    this.lastTick = Date.now();
    this.tickCount = 0;
    this.deltaTime = 0;

    // Performance tracking
    this.performance = {
      averageTickTime: 0,
      maxTickTime: 0,
      tickTimes: []
    };
    _Logger["default"].info('TickManager', 'Initialized');
  }

  /**
   * Start game loop
   */
  return _createClass(TickManager, [{
    key: "start",
    value: function start() {
      var _this = this;
      if (this.isRunning) {
        _Logger["default"].warn('TickManager', 'Already running');
        return;
      }
      this.isRunning = true;
      this.lastTick = Date.now();

      // Use setInterval for consistent timing
      this.tickInterval = _ResourceManager["default"].setInterval(function () {
        _this.tick();
      }, _config["default"].TICK_RATE, 'GameLoop');
      _Logger["default"].info('TickManager', "Game loop started (".concat(_config["default"].TICK_RATE, "ms per tick)"));
      _EventBus["default"].emit('game:started');
    }

    /**
     * Stop game loop
     */
  }, {
    key: "stop",
    value: function stop() {
      if (!this.isRunning) return;
      this.isRunning = false;
      if (this.tickInterval) {
        _ResourceManager["default"].clearInterval(this.tickInterval);
        this.tickInterval = null;
      }
      _Logger["default"].info('TickManager', 'Game loop stopped');
      _EventBus["default"].emit('game:stopped');
    }

    /**
     * Main game tick
     */
  }, {
    key: "tick",
    value: function tick() {
      var tickStart = performance.now();
      var now = Date.now();

      // Calculate delta time (in seconds)
      this.deltaTime = (now - this.lastTick) / 1000;
      this.lastTick = now;

      // Prevent huge jumps (e.g., tab was inactive)
      if (this.deltaTime > 1) {
        this.deltaTime = 1;
      }
      try {
        // Emit tick event with delta time
        _EventBus["default"].emit('game:tick', {
          deltaTime: this.deltaTime,
          tickCount: this.tickCount
        });

        // Update play time
        this.updatePlayTime();

        // Production tick (resources generation)
        this.productionTick();

        // Update statistics
        this.updateStatistics();
        this.tickCount++;

        // Performance tracking
        var tickEnd = performance.now();
        var tickTime = tickEnd - tickStart;
        this.trackPerformance(tickTime);
      } catch (error) {
        _Logger["default"].error('TickManager', 'Error in game tick:', error);
      }
    }

    /**
     * Production tick - generate resources
     */
  }, {
    key: "productionTick",
    value: function productionTick() {
      var state = _StateManager["default"].getState();

      // ===== FIX: Apply critical energy chance =====
      var upgradeSystem = require('../systems/UpgradeSystem.js')["default"];
      var criticalChance = upgradeSystem.getCriticalChance(); // Returns 0-0.20 (0-20%)
      var isCritical = Math.random() < criticalChance;
      var criticalMultiplier = isCritical ? 2 : 1;
      // ===== END FIX =====

      // Energy production
      var energyPerTick = state.production.energy * this.deltaTime;

      // ✅ Apply critical multiplier
      if (isCritical && energyPerTick > 0) {
        energyPerTick *= criticalMultiplier;
        // Optional: emit event for visual effect
        _EventBus["default"].emit('production:critical', {
          resource: 'energy',
          amount: energyPerTick
        });
      }
      if (energyPerTick > 0) {
        _StateManager["default"].dispatch({
          type: 'ADD_RESOURCE',
          payload: {
            resource: 'energy',
            amount: energyPerTick // ✅ Acum include critical! 
          }
        });

        // Update lifetime energy
        _StateManager["default"].dispatch({
          type: 'UPDATE_LIFETIME_ENERGY',
          payload: {
            amount: energyPerTick
          }
        });
      }

      // Mana production (same as before)
      var manaPerTick = state.production.mana * this.deltaTime;
      if (manaPerTick > 0) {
        _StateManager["default"].dispatch({
          type: 'ADD_RESOURCE',
          payload: {
            resource: 'mana',
            amount: manaPerTick
          }
        });
      }

      // Volcanic energy production (same as before)
      if (state.realms.unlocked.includes('volcano')) {
        var volcanicPerTick = state.production.volcanicEnergy * this.deltaTime;
        if (volcanicPerTick > 0) {
          _StateManager["default"].dispatch({
            type: 'ADD_RESOURCE',
            payload: {
              resource: 'volcanicEnergy',
              amount: volcanicPerTick
            }
          });
        }
      }
    }

    /**
     * Update play time statistics
     */
  }, {
    key: "updatePlayTime",
    value: function updatePlayTime() {
      var deltaMs = this.deltaTime * 1000;
      _StateManager["default"].dispatch({
        type: 'INCREMENT_STATISTIC',
        payload: {
          key: 'totalPlayTime',
          amount: deltaMs
        }
      });
    }

    /**
     * Update statistics
     */
  }, {
    key: "updateStatistics",
    value: function updateStatistics() {
      var state = _StateManager["default"].getState();

      // Update highest energy/s
      if (state.production.energy > state.statistics.highestEnergyPerSecond) {
        _StateManager["default"].dispatch({
          type: 'UPDATE_STATISTIC',
          payload: {
            key: 'highestEnergyPerSecond',
            value: state.production.energy
          }
        });
      }
    }

    /**
     * Track performance metrics
     */
  }, {
    key: "trackPerformance",
    value: function trackPerformance(tickTime) {
      this.performance.tickTimes.push(tickTime);

      // Keep only last 100 ticks
      if (this.performance.tickTimes.length > 100) {
        this.performance.tickTimes.shift();
      }

      // Calculate average
      this.performance.averageTickTime = this.performance.tickTimes.reduce(function (a, b) {
        return a + b;
      }, 0) / this.performance.tickTimes.length;

      // Track max
      if (tickTime > this.performance.maxTickTime) {
        this.performance.maxTickTime = tickTime;
      }

      // Warn if tick is slow
      if (tickTime > _config["default"].TICK_RATE * 0.8) {
        _Logger["default"].warn('TickManager', "Slow tick: ".concat(tickTime.toFixed(2), "ms"));
      }
    }

    /**
     * Calculate offline progress
     */
  }, {
    key: "calculateOfflineProgress",
    value: function calculateOfflineProgress(lastPlayed) {
      var now = Date.now();
      var timeDiff = now - lastPlayed;
      if (timeDiff < 60000) {
        return null;
      }
      var cappedTimeDiff = Math.min(timeDiff, _config["default"].BALANCING.OFFLINE_TIME_CAP);
      var state = _StateManager["default"].getState();

      // ===== FIX: Use upgrade effect directly =====
      var upgradeSystem = require('../systems/UpgradeSystem.js')["default"];
      var offlinePercent = upgradeSystem.getLevel('offlineProduction') > 0 ? upgradeSystem.getEffect('offlineProduction') // Returns 10, 20, 30...100
      : _config["default"].BALANCING.OFFLINE_PRODUCTION_BASE * 100; // 50%

      var offlineMultiplier = offlinePercent / 100; // Convert to decimal
      // ===== END FIX =====

      var secondsOffline = cappedTimeDiff / 1000;
      var energyEarned = Math.floor(state.production.energy * secondsOffline * offlineMultiplier);
      var manaEarned = Math.floor(state.production.mana * secondsOffline * offlineMultiplier);
      var volcanicEarned = state.realms.unlocked.includes('volcano') ? Math.floor(state.production.volcanicEnergy * secondsOffline * offlineMultiplier) : 0;
      _Logger["default"].info('TickManager', 'Offline progress calculated', {
        timeOffline: cappedTimeDiff,
        offlinePercent: offlinePercent,
        energyEarned: energyEarned,
        manaEarned: manaEarned,
        volcanicEarned: volcanicEarned
      });
      return {
        timeOffline: cappedTimeDiff,
        resources: {
          energy: energyEarned,
          mana: manaEarned,
          volcanicEnergy: volcanicEarned
        },
        wasCapped: timeDiff > _config["default"].BALANCING.OFFLINE_TIME_CAP
      };
    }

    /**
     * Apply offline progress
     */
  }, {
    key: "applyOfflineProgress",
    value: function applyOfflineProgress(offlineData) {
      if (!offlineData) return;
      var resources = offlineData.resources;
      if (resources.energy > 0) {
        _StateManager["default"].dispatch({
          type: 'ADD_RESOURCE',
          payload: {
            resource: 'energy',
            amount: resources.energy
          }
        });
        _StateManager["default"].dispatch({
          type: 'UPDATE_LIFETIME_ENERGY',
          payload: {
            amount: resources.energy
          }
        });
      }
      if (resources.mana > 0) {
        _StateManager["default"].dispatch({
          type: 'ADD_RESOURCE',
          payload: {
            resource: 'mana',
            amount: resources.mana
          }
        });
      }
      if (resources.volcanicEnergy > 0) {
        _StateManager["default"].dispatch({
          type: 'ADD_RESOURCE',
          payload: {
            resource: 'volcanicEnergy',
            amount: resources.volcanicEnergy
          }
        });
      }
      _EventBus["default"].emit('game:offline-progress', offlineData);
    }

    /**
     * Get performance stats
     */
  }, {
    key: "getPerformanceStats",
    value: function getPerformanceStats() {
      return _objectSpread(_objectSpread({}, this.performance), {}, {
        tickCount: this.tickCount,
        isRunning: this.isRunning,
        currentFPS: this.performance.averageTickTime > 0 ? 1000 / this.performance.averageTickTime : 0
      });
    }

    /**
     * Reset performance tracking
     */
  }, {
    key: "resetPerformance",
    value: function resetPerformance() {
      this.performance = {
        averageTickTime: 0,
        maxTickTime: 0,
        tickTimes: []
      };
    }
  }]);
}(); // Singleton
var tickManager = new TickManager();
var _default = exports["default"] = tickManager;

},{"../config.js":1,"../systems/UpgradeSystem.js":33,"../utils/EventBus.js":56,"../utils/Logger.js":58,"./ResourceManager.js":4,"./StateManager.js":6}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _StateManager = _interopRequireDefault(require("../core/StateManager.js"));
var _StructureSystem = _interopRequireDefault(require("../systems/StructureSystem.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
/**
 * Achievement definitions
 * Progressive goals that reward players
 */

var ACHIEVEMENTS = {
  // ===== TUTORIAL & FIRST STEPS =====
  firstClick: {
    id: 'firstClick',
    name: 'First Click',
    description: 'Click your first energy source',
    emoji: '👆',
    category: 'tutorial',
    tier: 'bronze',
    condition: function condition() {
      var state = _StateManager["default"].getState();
      return state.statistics.totalClicks >= 1;
    },
    reward: {
      gems: 5
    },
    hidden: false
  },
  firstStructure: {
    id: 'firstStructure',
    name: 'Builder',
    description: 'Purchase your first structure',
    emoji: '🏗️',
    category: 'tutorial',
    tier: 'bronze',
    condition: function condition() {
      var state = require('../core/StateManager.js')["default"].getState();
      return state.statistics.structuresPurchased >= 1;
    },
    reward: {
      gems: 10,
      energy: 50
    },
    hidden: false
  },
  firstUpgrade: {
    id: 'firstUpgrade',
    name: 'Researcher',
    description: 'Purchase your first upgrade',
    emoji: '🔬',
    category: 'tutorial',
    tier: 'bronze',
    condition: function condition() {
      var state = require('../core/StateManager.js')["default"].getState();
      return state.statistics.upgradesPurchased >= 1;
    },
    reward: {
      gems: 15
    },
    hidden: false
  },
  firstGuardian: {
    id: 'firstGuardian',
    name: 'Summoner',
    description: 'Summon your first guardian',
    emoji: '🐉',
    category: 'tutorial',
    tier: 'bronze',
    condition: function condition() {
      var state = require('../core/StateManager.js')["default"].getState();
      return state.guardians.length >= 1;
    },
    reward: {
      gems: 25,
      energy: 500
    },
    hidden: false
  },
  // ===== ENERGY PRODUCTION =====
  energyCollector: {
    id: 'energyCollector',
    name: 'Energy Collector',
    description: 'Produce 5,000 total energy',
    emoji: '⚡',
    category: 'production',
    tier: 'bronze',
    condition: function condition() {
      var state = require('../core/StateManager.js')["default"].getState();
      return state.ascension.lifetimeEnergy >= 5000;
    },
    reward: {
      gems: 15,
      energy: 250
    },
    hidden: false
  },
  energyHoarder: {
    id: 'energyHoarder',
    name: 'Energy Hoarder',
    description: 'Produce 50,000 total energy',
    emoji: '⚡',
    category: 'production',
    tier: 'silver',
    condition: function condition() {
      var state = require('../core/StateManager.js')["default"].getState();
      return state.ascension.lifetimeEnergy >= 50000;
    },
    reward: {
      gems: 30,
      crystals: 1
    },
    hidden: false
  },
  energyTycoon: {
    id: 'energyTycoon',
    name: 'Energy Tycoon',
    description: 'Produce 500,000 total energy',
    emoji: '⚡',
    category: 'production',
    tier: 'gold',
    condition: function condition() {
      var state = require('../core/StateManager.js')["default"].getState();
      return state.ascension.lifetimeEnergy >= 500000;
    },
    reward: {
      gems: 60,
      crystals: 3
    },
    hidden: false
  },
  energyGod: {
    id: 'energyGod',
    name: 'Energy God',
    description: 'Produce 10,000,000 total energy',
    emoji: '⚡',
    category: 'production',
    tier: 'platinum',
    condition: function condition() {
      var state = require('../core/StateManager.js')["default"].getState();
      return state.ascension.lifetimeEnergy >= 10000000;
    },
    reward: {
      gems: 250,
      crystals: 15
    },
    hidden: false
  },
  // ===== PRODUCTION RATE =====
  productionNovice: {
    id: 'productionNovice',
    name: 'Production Novice',
    description: 'Reach 50 energy/second',
    emoji: '📈',
    category: 'milestone',
    tier: 'bronze',
    condition: function condition() {
      var state = require('../core/StateManager.js')["default"].getState();
      return state.production.energy >= 50;
    },
    reward: {
      gems: 20,
      energy: 1000
    },
    hidden: false
  },
  productionExpert: {
    id: 'productionExpert',
    name: 'Production Expert',
    description: 'Reach 500 energy/second',
    emoji: '📈',
    category: 'milestone',
    tier: 'silver',
    condition: function condition() {
      var state = require('../core/StateManager.js')["default"].getState();
      return state.production.energy >= 500;
    },
    reward: {
      gems: 40,
      crystals: 2
    },
    hidden: false
  },
  productionMaster: {
    id: 'productionMaster',
    name: 'Production Master',
    description: 'Reach 5,000 energy/second',
    emoji: '📈',
    category: 'milestone',
    tier: 'gold',
    condition: function condition() {
      var state = require('../core/StateManager.js')["default"].getState();
      return state.production.energy >= 5000;
    },
    reward: {
      gems: 100,
      crystals: 8
    },
    hidden: false
  },
  // ===== STRUCTURES =====
  structureBuilder: {
    id: 'structureBuilder',
    name: 'Structure Builder',
    description: 'Own 10 total structure levels',
    emoji: '🏗️',
    category: 'structures',
    tier: 'bronze',
    condition: function condition() {
      var structureSystem = require('../systems/StructureSystem.js')["default"];
      return structureSystem.getStats().totalLevels >= 10;
    },
    reward: {
      gems: 20,
      energy: 2000
    },
    hidden: false
  },
  structureArchitect: {
    id: 'structureArchitect',
    name: 'Structure Architect',
    description: 'Own 30 total structure levels',
    emoji: '🏗️',
    category: 'structures',
    tier: 'silver',
    condition: function condition() {
      var structureSystem = require('../systems/StructureSystem.js')["default"];
      return structureSystem.getStats().totalLevels >= 30;
    },
    reward: {
      gems: 50,
      crystals: 2
    },
    hidden: false
  },
  structureMagnate: {
    id: 'structureMagnate',
    name: 'Structure Magnate',
    description: 'Own 100 total structure levels',
    emoji: '🏗️',
    category: 'structures',
    tier: 'gold',
    condition: function condition() {
      var structureSystem = require('../systems/StructureSystem.js')["default"];
      return structureSystem.getStats().totalLevels >= 100;
    },
    reward: {
      gems: 150,
      crystals: 10
    },
    hidden: false
  },
  maxedOut: {
    id: 'maxedOut',
    name: 'Maxed Out',
    description: 'Get any structure to level 50',
    emoji: '💯',
    category: 'structures',
    tier: 'platinum',
    condition: function condition() {
      var state = require('../core/StateManager.js')["default"].getState();
      return Object.values(state.structures).some(function (s) {
        return s.level >= 50;
      });
    },
    reward: {
      gems: 300,
      crystals: 15
    },
    hidden: false
  },
  // ===== UPGRADES =====
  upgradeEnthusiast: {
    id: 'upgradeEnthusiast',
    name: 'Upgrade Enthusiast',
    description: 'Purchase 5 upgrades',
    emoji: '⬆️',
    category: 'upgrades',
    tier: 'bronze',
    condition: function condition() {
      var state = require('../core/StateManager.js')["default"].getState();
      return state.statistics.upgradesPurchased >= 5;
    },
    reward: {
      gems: 25
    },
    hidden: false
  },
  upgradeAddict: {
    id: 'upgradeAddict',
    name: 'Upgrade Addict',
    description: 'Purchase 25 upgrades',
    emoji: '⬆️',
    category: 'upgrades',
    tier: 'silver',
    condition: function condition() {
      var state = require('../core/StateManager.js')["default"].getState();
      return state.statistics.upgradesPurchased >= 25;
    },
    reward: {
      gems: 80,
      crystals: 3
    },
    hidden: false
  },
  patientUpgrader: {
    id: 'patientUpgrader',
    name: 'Patient Upgrader',
    description: 'Complete an upgrade that took over 1 hour',
    emoji: '⏰',
    category: 'upgrades',
    tier: 'gold',
    condition: function condition() {
      var _state$achievements$p;
      // This will be tracked via event
      var state = require('../core/StateManager.js')["default"].getState();
      return ((_state$achievements$p = state.achievements.patientUpgrader) === null || _state$achievements$p === void 0 ? void 0 : _state$achievements$p.triggered) || false;
    },
    reward: {
      gems: 120,
      crystals: 8
    },
    hidden: false
  },
  // ===== GUARDIANS =====
  guardianCollector: {
    id: 'guardianCollector',
    name: 'Guardian Collector',
    description: 'Own 3 guardians',
    emoji: '🐉',
    category: 'guardians',
    tier: 'bronze',
    condition: function condition() {
      var state = require('../core/StateManager.js')["default"].getState();
      return state.guardians.length >= 3;
    },
    reward: {
      gems: 40
    },
    hidden: false
  },
  guardianHoarder: {
    id: 'guardianHoarder',
    name: 'Guardian Hoarder',
    description: 'Own 10 guardians',
    emoji: '🐉',
    category: 'guardians',
    tier: 'silver',
    condition: function condition() {
      var state = require('../core/StateManager.js')["default"].getState();
      return state.guardians.length >= 10;
    },
    reward: {
      gems: 100,
      crystals: 4
    },
    hidden: false
  },
  guardianArmy: {
    id: 'guardianArmy',
    name: 'Guardian Army',
    description: 'Own 25 guardians',
    emoji: '🐉',
    category: 'guardians',
    tier: 'gold',
    condition: function condition() {
      var state = require('../core/StateManager.js')["default"].getState();
      return state.guardians.length >= 25;
    },
    reward: {
      gems: 250,
      crystals: 15
    },
    hidden: false
  },
  rareFind: {
    id: 'rareFind',
    name: 'Rare Find',
    description: 'Summon a rare guardian',
    emoji: '💎',
    category: 'guardians',
    tier: 'bronze',
    condition: function condition() {
      var state = require('../core/StateManager.js')["default"].getState();
      return state.guardians.some(function (g) {
        return g.rarity === 'rare';
      });
    },
    reward: {
      gems: 30
    },
    hidden: false
  },
  epicDiscovery: {
    id: 'epicDiscovery',
    name: 'Epic Discovery',
    description: 'Summon an epic guardian',
    emoji: '💜',
    category: 'guardians',
    tier: 'silver',
    condition: function condition() {
      var state = require('../core/StateManager.js')["default"].getState();
      return state.guardians.some(function (g) {
        return g.rarity === 'epic';
      });
    },
    reward: {
      gems: 80,
      crystals: 3
    },
    hidden: false
  },
  legendaryPull: {
    id: 'legendaryPull',
    name: 'Legendary Pull',
    description: 'Summon a legendary guardian',
    emoji: '⭐',
    category: 'guardians',
    tier: 'platinum',
    condition: function condition() {
      var state = require('../core/StateManager.js')["default"].getState();
      return state.guardians.some(function (g) {
        return g.rarity === 'legendary';
      });
    },
    reward: {
      gems: 300,
      crystals: 20
    },
    hidden: false
  },
  // ===== QUESTS =====
  questCompleter: {
    id: 'questCompleter',
    name: 'Quest Completer',
    description: 'Complete 5 quests',
    emoji: '📜',
    category: 'quests',
    tier: 'bronze',
    condition: function condition() {
      var state = require('../core/StateManager.js')["default"].getState();
      return state.statistics.questsCompleted >= 5;
    },
    reward: {
      gems: 25
    },
    hidden: false
  },
  questMaster: {
    id: 'questMaster',
    name: 'Quest Master',
    description: 'Complete 25 quests',
    emoji: '📜',
    category: 'quests',
    tier: 'silver',
    condition: function condition() {
      var state = require('../core/StateManager.js')["default"].getState();
      return state.statistics.questsCompleted >= 25;
    },
    reward: {
      gems: 80,
      crystals: 4
    },
    hidden: false
  },
  questLegend: {
    id: 'questLegend',
    name: 'Quest Legend',
    description: 'Complete 100 quests',
    emoji: '📜',
    category: 'quests',
    tier: 'gold',
    condition: function condition() {
      var state = require('../core/StateManager.js')["default"].getState();
      return state.statistics.questsCompleted >= 100;
    },
    reward: {
      gems: 200,
      crystals: 15
    },
    hidden: false
  },
  // ===== PUZZLE =====
  puzzleNovice: {
    id: 'puzzleNovice',
    name: 'Puzzle Novice',
    description: 'Win your first puzzle game',
    emoji: '🧩',
    category: 'puzzle',
    tier: 'bronze',
    condition: function condition() {
      var state = require('../core/StateManager.js')["default"].getState();
      return state.statistics.puzzlesWon >= 1;
    },
    reward: {
      gems: 15
    },
    hidden: false
  },
  puzzleExpert: {
    id: 'puzzleExpert',
    name: 'Puzzle Expert',
    description: 'Win 10 puzzle games',
    emoji: '🧩',
    category: 'puzzle',
    tier: 'silver',
    condition: function condition() {
      var state = require('../core/StateManager.js')["default"].getState();
      return state.statistics.puzzlesWon >= 10;
    },
    reward: {
      gems: 50,
      crystals: 2
    },
    hidden: false
  },
  highScorer: {
    id: 'highScorer',
    name: 'High Scorer',
    description: 'Score 1500+ in a puzzle game',
    emoji: '🎯',
    category: 'puzzle',
    tier: 'gold',
    condition: function condition() {
      var state = require('../core/StateManager.js')["default"].getState();
      return state.statistics.puzzleHighScore >= 1500;
    },
    reward: {
      gems: 100,
      crystals: 8
    },
    hidden: false
  },
  // ===== ASCENSION =====
  firstAscension: {
    id: 'firstAscension',
    name: 'Ascendant',
    description: 'Perform your first ascension',
    emoji: '✨',
    category: 'ascension',
    tier: 'gold',
    condition: function condition() {
      var state = require('../core/StateManager.js')["default"].getState();
      return state.ascension.level >= 1;
    },
    reward: {
      gems: 150,
      crystals: 10
    },
    hidden: false
  },
  serialAscender: {
    id: 'serialAscender',
    name: 'Serial Ascender',
    description: 'Reach ascension level 3',
    emoji: '✨',
    category: 'ascension',
    tier: 'platinum',
    condition: function condition() {
      var state = require('../core/StateManager.js')["default"].getState();
      return state.ascension.level >= 3;
    },
    reward: {
      gems: 400,
      crystals: 30
    },
    hidden: false
  },
  transcendent: {
    id: 'transcendent',
    name: 'Transcendent',
    description: 'Reach ascension level 5',
    emoji: '🌟',
    category: 'ascension',
    tier: 'diamond',
    condition: function condition() {
      var state = require('../core/StateManager.js')["default"].getState();
      return state.ascension.level >= 5;
    },
    reward: {
      gems: 1000,
      crystals: 60
    },
    hidden: false
  },
  // ===== REALMS =====
  realmExplorer: {
    id: 'realmExplorer',
    name: 'Realm Explorer',
    description: 'Unlock the Volcano Realm',
    emoji: '🌋',
    category: 'realms',
    tier: 'gold',
    condition: function condition() {
      var state = require('../core/StateManager.js')["default"].getState();
      return state.realms.unlocked.includes('volcano');
    },
    reward: {
      gems: 120,
      crystals: 8
    },
    hidden: false
  },
  // ===== BOSSES =====
  firstVictory: {
    id: 'firstVictory',
    name: 'First Victory',
    description: 'Defeat your first boss',
    emoji: '⚔️',
    category: 'bosses',
    tier: 'silver',
    condition: function condition() {
      var state = require('../core/StateManager.js')["default"].getState();
      return state.statistics.bossesDefeated >= 1;
    },
    reward: {
      gems: 80,
      crystals: 4
    },
    hidden: false
  },
  bossSlayer: {
    id: 'bossSlayer',
    name: 'Boss Slayer',
    description: 'Defeat 3 bosses',
    emoji: '⚔️',
    category: 'bosses',
    tier: 'gold',
    condition: function condition() {
      var state = require('../core/StateManager.js')["default"].getState();
      return state.statistics.bossesDefeated >= 3;
    },
    reward: {
      gems: 200,
      crystals: 15
    },
    hidden: false
  },
  // ===== OCEAN REALM ACHIEVEMENTS =====
  firstDive: {
    id: 'firstDive',
    name: 'First Dive',
    description: 'Unlock the Ocean Realm.',
    emoji: '🌊',
    category: 'realms',
    tier: 'gold',
    condition: function condition() {
      var state = require('../core/StateManager.js')["default"].getState();
      return state.realms.unlocked.includes('ocean');
    },
    reward: {
      gems: 100,
      crystals: 5
    },
    hidden: false,
    lore: 'You plunged into the deep — this marks a new adventure!'
  },
  tideTycoon: {
    id: 'tideTycoon',
    name: 'Tide Tycoon',
    description: 'Reach 1,000 tidal energy/sec in Ocean Realm.',
    emoji: '🌊',
    category: 'milestone',
    tier: 'gold',
    condition: function condition() {
      var state = require('../core/StateManager.js')["default"].getState();
      return state.production.tidalEnergy >= 1000 && state.realms.current === 'ocean';
    },
    reward: {
      gems: 80,
      pearls: 8
    },
    hidden: false,
    lore: 'Industrial mastery under the waves!'
  },
  kelpOverlord: {
    id: 'kelpOverlord',
    name: 'Kelp Overlord',
    description: 'Own at least 25 Kelp Farms in Ocean Realm.',
    emoji: '🪸',
    category: 'structures',
    tier: 'platinum',
    condition: function condition() {
      var _state$structures$kel;
      var state = require('../core/StateManager.js')["default"].getState();
      return ((_state$structures$kel = state.structures.kelpFarm) === null || _state$structures$kel === void 0 ? void 0 : _state$structures$kel.level) >= 25;
    },
    reward: {
      tidalEnergy: 15000,
      gems: 120,
      pearls: 10
    },
    hidden: false,
    lore: 'You\'re the ruler of aquatic farming!'
  },
  pearlMagnate: {
    id: 'pearlMagnate',
    name: 'Pearl Magnate',
    description: 'Collect 100 pearls in Ocean Realm.',
    emoji: '🏝️',
    category: 'resources',
    tier: 'platinum',
    condition: function condition() {
      var state = require('../core/StateManager.js')["default"].getState();
      return state.resources.pearls >= 100;
    },
    reward: {
      gems: 150,
      crystals: 12
    },
    hidden: false,
    lore: 'Every pearl is a testament to your deep-sea skill.'
  },
  abyssVanquisher: {
    id: 'abyssVanquisher',
    name: 'Abyss Vanquisher',
    description: 'Defeat the Ocean Leviathan.',
    emoji: '🦈',
    category: 'bosses',
    tier: 'diamond',
    condition: function condition() {
      var _state$statistics$bos;
      var state = require('../core/StateManager.js')["default"].getState();
      return (_state$statistics$bos = state.statistics.bossesDefeatedIds) === null || _state$statistics$bos === void 0 ? void 0 : _state$statistics$bos.includes('oceanLeviathan');
    },
    reward: {
      gems: 300,
      crystals: 25,
      legendaryGuardian: {
        type: 'water',
        rarity: 'legendary'
      }
    },
    hidden: false,
    lore: 'Deep abyss now bows to your power.'
  },
  // ===== SPECIAL/HIDDEN =====
  speedrunner: {
    id: 'speedrunner',
    name: 'Speedrunner',
    description: 'Reach 500K energy in under 1 hour',
    emoji: '⚡',
    category: 'special',
    tier: 'platinum',
    condition: function condition() {
      var state = require('../core/StateManager.js')["default"].getState();
      return state.ascension.lifetimeEnergy >= 500000 && state.statistics.totalPlayTime < 3600000;
    },
    reward: {
      gems: 500,
      crystals: 30
    },
    hidden: true
  },
  gemHoarder: {
    id: 'gemHoarder',
    name: 'Gem Hoarder',
    description: 'Accumulate 2,500 gems',
    emoji: '💎',
    category: 'special',
    tier: 'gold',
    condition: function condition() {
      var state = require('../core/StateManager.js')["default"].getState();
      return state.resources.gems >= 2500;
    },
    reward: {
      gems: 250
    },
    hidden: true
  },
  dedicatedPlayer: {
    id: 'dedicatedPlayer',
    name: 'Dedicated Player',
    description: 'Play for 5 hours total',
    emoji: '⏱️',
    category: 'special',
    tier: 'silver',
    condition: function condition() {
      var state = require('../core/StateManager.js')["default"].getState();
      return state.statistics.totalPlayTime >= 18000000; // 5 hours in ms
    },
    reward: {
      gems: 150,
      crystals: 10
    },
    hidden: true
  },
  noLifeGamer: {
    id: 'noLifeGamer',
    name: 'No Life Gamer',
    description: 'Play for 50 hours total',
    emoji: '🎮',
    category: 'special',
    tier: 'platinum',
    condition: function condition() {
      var state = require('../core/StateManager.js')["default"].getState();
      return state.statistics.totalPlayTime >= 180000000; // 50 hours in ms
    },
    reward: {
      gems: 1000,
      crystals: 60
    },
    hidden: true
  }
};
var _default = exports["default"] = ACHIEVEMENTS;

},{"../core/StateManager.js":6,"../systems/StructureSystem.js":30}],9:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
/**
 * Boss definitions
 * Challenging encounters that require puzzle mastery
 */

var BOSSES = {
  corruptedTreeant: {
    id: 'corruptedTreeant',
    name: 'Corrupted Treant',
    description: 'An ancient tree guardian twisted by dark energy',
    emoji: '🌳',
    realm: 'forest',
    tier: 1,
    hp: 2500,
    // Redus de la 1000

    // ✅ Fără unlock condition - primul boss e disponibil de la început

    puzzleRequirement: {
      targetScore: 800,
      // Crescut de la 500
      maxMoves: 25,
      // Crescut de la 20
      difficulty: 'normal'
    },
    damageFormula: function damageFormula(score, combo) {
      var damage = Math.floor(score / 12); // Redus de la /10
      if (combo >= 5) damage *= 1.5;
      if (combo >= 10) damage *= 2;
      return Math.floor(damage);
    },
    rewards: {
      firstTime: {
        gems: 100,
        // Redus de la 200
        crystals: 5,
        // Redus de la 10
        energy: 25000,
        // Redus de la 50000
        guaranteedGuardian: {
          rarity: 'rare',
          type: 'energy'
        }
      },
      repeat: {
        gems: 30,
        // Redus de la 50
        crystals: 1,
        // Redus de la 2
        energy: 5000 // Redus de la 10000
      }
    },
    lore: 'Once a protector of the forest, now consumed by corruption. Only by matching the natural elements can you purify its twisted form.',
    achievements: ['firstVictory'],
    strategies: ['Focus on high combos for maximum damage', 'Use all 25 moves efficiently', 'Try to clear the board systematically']
  },
  infernoTitan: {
    id: 'infernoTitan',
    name: 'Inferno Titan',
    description: 'A colossal being of living flame',
    emoji: '🔥',
    realm: 'volcano',
    tier: 2,
    hp: 8000,
    // Crescut de la 5000

    unlockCondition: {
      realms: {
        volcano: 'unlocked'
      },
      ascension: {
        level: 1
      },
      bosses: {
        corruptedTreeant: 'defeated'
      }
    },
    puzzleRequirement: {
      targetScore: 1200,
      // Crescut de la 1000
      maxMoves: 28,
      // Crescut de la 25
      difficulty: 'hard'
    },
    damageFormula: function damageFormula(score, combo) {
      var damage = Math.floor(score / 10); // Redus de la /8

      if (combo >= 7) damage *= 1.5;
      if (combo >= 12) damage *= 2;
      if (combo >= 15) damage *= 2.5;
      return Math.floor(damage);
    },
    rewards: {
      firstTime: {
        gems: 250,
        // Redus de la 500
        crystals: 20,
        // Redus de la 30
        volcanicEnergy: 50000,
        // Redus de la 100000
        guaranteedGuardian: {
          rarity: 'epic',
          type: 'volcanic'
        }
      },
      repeat: {
        gems: 60,
        // Redus de la 100
        crystals: 4,
        // Redus de la 5
        volcanicEnergy: 10000 // Redus de la 20000
      }
    },
    lore: 'Forged in the heart of the volcano eons ago, this titan has never been defeated. Its flames burn hot enough to melt reality itself.',
    achievements: ['bossSlayer'],
    strategies: ['Volcanic puzzles are more challenging', 'Aim for 15+ combos for massive damage', 'May take multiple attempts - HP persists!']
  },
  voidLeviathan: {
    id: 'voidLeviathan',
    name: 'Void Leviathan',
    description: 'Creature from beyond the stars',
    emoji: '🐉',
    realm: 'forest',
    tier: 3,
    hp: 30000,
    // Crescut de la 20000

    unlockCondition: {
      ascension: {
        level: 3
      },
      // Redus de la 5
      bosses: {
        corruptedTreeant: 'defeated',
        infernoTitan: 'defeated'
      },
      production: {
        energy: 5000
      } // Redus de la 10000
    },
    puzzleRequirement: {
      targetScore: 1800,
      // Redus de la 2000
      maxMoves: 32,
      // Crescut de la 30
      difficulty: 'extreme'
    },
    damageFormula: function damageFormula(score, combo) {
      var damage = Math.floor(score / 7); // Redus de la /5

      if (combo >= 10) damage *= 1.5;
      if (combo >= 15) damage *= 2;
      if (combo >= 20) damage *= 3;
      return Math.floor(damage);
    },
    rewards: {
      firstTime: {
        gems: 1000,
        // Redus de la 2000
        crystals: 60,
        // Redus de la 100
        energy: 500000,
        // Redus de la 1000000
        guaranteedGuardian: {
          rarity: 'legendary',
          type: 'all'
        },
        specialReward: {
          type: 'cosmetic',
          name: 'Void Conqueror Title'
        }
      },
      repeat: {
        gems: 150,
        // Redus de la 300
        crystals: 12,
        // Redus de la 20
        energy: 100000 // Redus de la 200000
      }
    },
    lore: 'The Void Leviathan exists outside time and space.  Defeating it requires mastery of all puzzle mechanics and unparalleled skill.',
    achievements: ['bossSlayer', 'transcendent'],
    strategies: ['This is the ultimate challenge', 'HP persists between attempts', 'Perfect combo chains are essential', 'Consider using gems to boost puzzle rewards']
  },
  oceanLeviathan: {
    id: 'oceanLeviathan',
    name: 'Ocean Leviathan',
    description: 'Ancient beast lurking in the abyss, harnesses the hidden currents.',
    emoji: '🦈',
    realm: 'ocean',
    tier: 2,
    hp: 15000,
    // Crescut de la 12000

    unlockCondition: {
      realms: {
        ocean: 'unlocked'
      },
      ascension: {
        level: 2
      },
      // Redus de la 3
      structures: {
        deepSeaPump: 2
      } // Redus de la 3
    },
    puzzleRequirement: {
      targetScore: 1500,
      // Crescut de la 1400
      maxMoves: 26,
      // Crescut de la 24
      difficulty: 'hard'
    },
    damageFormula: function damageFormula(score, combo) {
      var damage = Math.floor(score / 8); // Redus de la /6
      if (combo >= 8) damage *= 1.5;
      if (combo >= 12) damage *= 2;
      if (combo >= 16) damage *= 2.5; // Adăugat bonus extra
      return Math.floor(damage);
    },
    rewards: {
      firstTime: {
        gems: 400,
        // Redus de la 800
        crystals: 30,
        // Redus de la 50
        tidalEnergy: 100000,
        // Redus de la 180000
        pearls: 50,
        // ✅ ADĂUGAT pearls ca reward
        guaranteedGuardian: {
          rarity: 'legendary',
          type: 'water'
        }
      },
      repeat: {
        gems: 80,
        // Redus de la 160
        crystals: 8,
        // Redus de la 12
        tidalEnergy: 20000,
        // Redus de la 35000
        pearls: 10 // ✅ ADĂUGAT pearls pentru repeat
      }
    },
    lore: 'Deepest terror and guardian of the abyss. Only with mastery of Ocean structures and guardians can one hope to prevail.',
    achievements: ['abyssVanquisher'],
    strategies: ['Try for combos >12 for maximum damage', 'Balance puzzle moves vs direct scores', 'Focus on kelp synergy and pearl bonuses', 'Ocean guardians boost damage significantly']
  },
  // FUTURE BOSSES

  tidalKraken: {
    id: 'tidalKraken',
    name: 'Tidal Kraken',
    description: 'Terror of the deep ocean',
    emoji: '🦑',
    realm: 'ocean',
    tier: 2,
    hp: 10000,
    // Crescut de la 8000

    unlockCondition: {
      realms: {
        ocean: 'unlocked'
      },
      ascension: {
        level: 2
      },
      // Redus de la 3
      bosses: {
        oceanLeviathan: 'defeated'
      } // ✅ ADĂUGAT prerequisite
    },
    puzzleRequirement: {
      targetScore: 1300,
      // Crescut de la 1200
      maxMoves: 27,
      // Crescut de la 25
      difficulty: 'hard'
    },
    damageFormula: function damageFormula(score, combo) {
      var damage = Math.floor(score / 9); // Redus de la /7
      if (combo >= 8) damage *= 1.5;
      if (combo >= 13) damage *= 2;
      return Math.floor(damage);
    },
    rewards: {
      firstTime: {
        gems: 300,
        // Redus de la 600
        crystals: 25,
        // Redus de la 40
        tidalEnergy: 80000,
        // Redus de la 150000
        pearls: 30,
        // ✅ ADĂUGAT pearls
        guaranteedGuardian: {
          rarity: 'epic',
          type: 'water'
        }
      },
      repeat: {
        gems: 60,
        // Redus de la 120
        crystals: 6,
        // Redus de la 8
        tidalEnergy: 15000,
        pearls: 5 // ✅ ADĂUGAT pearls
      }
    },
    lore: 'Ancient ruler of the ocean depths, commands the tides with its tentacles.',
    achievements: ['bossSlayer'],
    locked: true // Not implemented yet
  },
  cosmicHarbinger: {
    id: 'cosmicHarbinger',
    name: 'Cosmic Harbinger',
    description: 'Herald of the end times',
    emoji: '🌌',
    realm: 'cosmos',
    tier: 4,
    hp: 75000,
    // Crescut de la 50000

    unlockCondition: {
      realms: {
        cosmos: 'unlocked'
      },
      ascension: {
        level: 5
      },
      // Redus de la 10
      bosses: {
        voidLeviathan: 'defeated',
        oceanLeviathan: 'defeated',
        infernoTitan: 'defeated'
      }
    },
    puzzleRequirement: {
      targetScore: 3000,
      // Redus de la 5000
      maxMoves: 40,
      difficulty: 'nightmare'
    },
    damageFormula: function damageFormula(score, combo) {
      var damage = Math.floor(score / 4); // Redus de la /3
      if (combo >= 15) damage *= 1.5;
      if (combo >= 20) damage *= 2;
      if (combo >= 25) damage *= 3;
      return Math.floor(damage);
    },
    rewards: {
      firstTime: {
        gems: 5000,
        // Redus de la 10000
        crystals: 300,
        // Redus de la 500
        cosmicEnergy: 5000000,
        // Redus de la 10000000
        guaranteedGuardian: {
          rarity: 'legendary',
          type: 'cosmic'
        },
        specialReward: {
          type: 'ending',
          name: 'True Ending Unlocked'
        }
      },
      repeat: {
        gems: 500,
        // Redus de la 1000
        crystals: 60 // Redus de la 100
      }
    },
    lore: 'The final challenge. Are you worthy?',
    locked: true // Not implemented yet
  }
};
var _default = exports["default"] = BOSSES;

},{}],10:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.RARITIES = exports.GUARDIAN_POOL = void 0;
var _config = _interopRequireDefault(require("../config.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
/**
 * Guardian definitions - summonable creatures with bonuses
 */

var GUARDIAN_POOL = exports.GUARDIAN_POOL = {
  // ===== ENERGY GUARDIANS =====
  solarSpirit: {
    id: 'solarSpirit',
    name: 'Solar Spirit',
    description: 'A radiant being of pure sunlight',
    emoji: '☀️',
    type: 'energy',
    realm: 'forest',
    rarities: ['common', 'uncommon'],
    lore: 'Born from the first rays of dawn, it channels solar power.'
  },
  thunderbird: {
    id: 'thunderbird',
    name: 'Thunderbird',
    description: 'Majestic bird crackling with electricity',
    emoji: '⚡',
    type: 'energy',
    realm: 'forest',
    rarities: ['uncommon', 'rare'],
    lore: 'Its wings generate storms that power ancient technologies.'
  },
  stormElemental: {
    id: 'stormElemental',
    name: 'Storm Elemental',
    description: 'Condensed storm clouds given form',
    emoji: '🌩️',
    type: 'energy',
    realm: 'forest',
    rarities: ['rare', 'epic'],
    lore: 'Where it goes, lightning follows.'
  },
  cosmicBeing: {
    id: 'cosmicBeing',
    name: 'Cosmic Being',
    description: 'Entity from beyond the stars',
    emoji: '🌌',
    type: 'energy',
    realm: 'forest',
    rarities: ['epic', 'legendary'],
    lore: 'It understands the universe\'s infinite energy.'
  },
  // ===== MANA GUARDIANS =====
  mysticFox: {
    id: 'mysticFox',
    name: 'Mystic Fox',
    description: 'Nine-tailed guardian of magic',
    emoji: '🦊',
    type: 'mana',
    realm: 'forest',
    rarities: ['common', 'uncommon'],
    lore: 'Each tail holds a different magical secret.'
  },
  arcaneOwl: {
    id: 'arcaneOwl',
    name: 'Arcane Owl',
    description: 'Wise keeper of magical knowledge',
    emoji: '🦉',
    type: 'mana',
    realm: 'forest',
    rarities: ['uncommon', 'rare'],
    lore: 'Its eyes see the flows of mana itself.'
  },
  arcanePhoenix: {
    id: 'arcanePhoenix',
    name: 'Arcane Phoenix',
    description: 'Reborn in flames of pure mana',
    emoji: '🔥',
    type: 'mana',
    realm: 'forest',
    rarities: ['rare', 'epic'],
    lore: 'Death only makes it stronger, mana flowing eternal.'
  },
  voidWitch: {
    id: 'voidWitch',
    name: 'Void Witch',
    description: 'Channels the darkness between worlds',
    emoji: '🌑',
    type: 'mana',
    realm: 'forest',
    rarities: ['epic', 'legendary'],
    lore: 'Where light ends, her power begins.'
  },
  // ===== VOLCANIC GUARDIANS =====
  magmaGolem: {
    id: 'magmaGolem',
    name: 'Magma Golem',
    description: 'Living stone and molten rock',
    emoji: '🗿',
    type: 'volcanic',
    realm: 'volcano',
    rarities: ['common', 'uncommon'],
    lore: 'Forged in the heart of the volcano itself.'
  },
  lavaSerpent: {
    id: 'lavaSerpent',
    name: 'Lava Serpent',
    description: 'Serpent swimming through molten rock',
    emoji: '🐍',
    type: 'volcanic',
    realm: 'volcano',
    rarities: ['uncommon', 'rare'],
    lore: 'It drinks lava like water.'
  },
  infernoTitan: {
    id: 'infernoTitan',
    name: 'Inferno Titan',
    description: 'Giant wreathed in eternal flames',
    emoji: '👹',
    type: 'volcanic',
    realm: 'volcano',
    rarities: ['rare', 'epic'],
    lore: 'Mountains crumble before its fury.'
  },
  primordialFlame: {
    id: 'primordialFlame',
    name: 'Primordial Flame',
    description: 'The first fire that ever burned',
    emoji: '🔥',
    type: 'volcanic',
    realm: 'volcano',
    rarities: ['legendary'],
    lore: 'All fire in the world is but an echo of its essence.'
  },
  // ===== UNIVERSAL GUARDIANS =====
  fortuneCat: {
    id: 'fortuneCat',
    name: 'Fortune Cat',
    description: 'Brings luck and prosperity',
    emoji: '🐱',
    type: 'all',
    realm: 'any',
    rarities: ['uncommon', 'rare'],
    lore: 'Where it walks, fortune follows.'
  },
  ancientTurtle: {
    id: 'ancientTurtle',
    name: 'Ancient Turtle',
    description: 'Wise guardian as old as time',
    emoji: '🐢',
    type: 'all',
    realm: 'any',
    rarities: ['rare', 'epic'],
    lore: 'It has seen civilizations rise and fall.'
  },
  cosmicDragon: {
    id: 'cosmicDragon',
    name: 'Cosmic Dragon',
    description: 'Dragon of infinite power',
    emoji: '🐉',
    type: 'all',
    realm: 'any',
    rarities: ['legendary'],
    lore: 'Its roar echoes across dimensions, amplifying all power.'
  },
  celestialKirin: {
    id: 'celestialKirin',
    name: 'Celestial Kirin',
    description: 'Divine beast of balance',
    emoji: '🦄',
    type: 'all',
    realm: 'any',
    rarities: ['legendary'],
    lore: 'Appears only to those who seek harmony.'
  },
  // ===== SPECIAL GUARDIANS =====
  timeKeeper: {
    id: 'timeKeeper',
    name: 'Time Keeper',
    description: 'Guardian that manipulates time itself',
    emoji: '⏰',
    type: 'all',
    realm: 'any',
    rarities: ['legendary'],
    lore: 'Past, present, and future are one to it.',
    special: {
      offlineBonus: 0.15 // +15% offline production (reduced from 20%)
    }
  },
  gemFairy: {
    id: 'gemFairy',
    name: 'Gem Fairy',
    description: 'Tiny creature that creates gems',
    emoji: '🧚',
    type: 'gems',
    realm: 'any',
    rarities: ['rare', 'epic'],
    lore: 'Its tears crystallize into precious gems.',
    special: {
      gemBonus: 0.08 // +8% gems from all sources (reduced from 10%)
    }
  },
  // ===== OCEAN REALM GUARDIANS =====
  aquaSprite: {
    id: 'aquaSprite',
    name: 'Aqua Sprite',
    description: 'A playful spirit of the waves, boosts tidal energy production.',
    emoji: '💧',
    type: 'water',
    realm: 'ocean',
    rarities: ['common', 'uncommon'],
    lore: 'Born in the foam, carries whispers of the deep.',
    ability: {
      type: 'boost',
      target: 'tidalEnergy',
      multiplier: 1.08 // +8% tidal energy (reduced from 10%)
    }
  },
  kelpGuardian: {
    id: 'kelpGuardian',
    name: 'Kelp Guardian',
    description: 'Guardian of the underwater kelp forests.',
    emoji: '🪸',
    type: 'water',
    realm: 'ocean',
    rarities: ['rare'],
    lore: 'Watches over secret currents and kelp thickets.',
    ability: {
      type: 'synergy',
      target: 'kelpFarm',
      multiplier: 1.20 // +20% production from kelpFarm (reduced from 25%)
    }
  },
  coralWarden: {
    id: 'coralWarden',
    name: 'Coral Warden',
    description: 'Protector of reefs, sometimes finds pearls.',
    emoji: '🏝️',
    type: 'water',
    realm: 'ocean',
    rarities: ['epic'],
    lore: 'Defends reefs and cultivates pearl treasures.',
    ability: {
      type: 'chanceBonus',
      target: 'coralBattery',
      chance: 0.08,
      // 8% chance for extra pearls (reduced from 10%)
      resource: 'pearls'
    }
  },
  abyssSerpent: {
    id: 'abyssSerpent',
    name: 'Abyss Serpent',
    description: 'Ancient serpent from the deep sea. Increases production and unlocks deep sea upgrades.',
    emoji: '🐍',
    type: 'water',
    realm: 'ocean',
    rarities: ['legendary'],
    lore: 'Spins the unseen tides; legends are its children.',
    ability: {
      type: 'unlock',
      target: 'pressureTech'
    }
  }
};

// Rarity configurations (from CONFIG but can be overridden here)
var RARITIES = exports.RARITIES = _config["default"].BALANCING.GUARDIAN_RARITIES;
var _default = exports["default"] = GUARDIAN_POOL;

},{"../config.js":1}],11:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MINI_GAME_ACHIEVEMENTS = exports.ACHIEVEMENT_TIERS = void 0;
exports.getAchievementById = getAchievementById;
exports.getAchievementsByGame = getAchievementsByGame;
exports.getAllMiniGameAchievements = getAllMiniGameAchievements;
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
/**
 * Mini-Game Achievements Database
 * Achievements specific pentru Daily Spin, 2048, și Match-3
 */

var MINI_GAME_ACHIEVEMENTS = exports.MINI_GAME_ACHIEVEMENTS = {
  // ==================== DAILY SPIN ACHIEVEMENTS ====================
  dailySpin: [{
    id: 'spin_first',
    name: 'First Spin',
    description: 'Complete your first daily spin',
    icon: '🎰',
    category: 'dailySpin',
    tier: 'bronze',
    reward: {
      gems: 25,
      energy: 500
    },
    // Redus: timeShards eliminat, rewards reduse
    condition: function condition(stats) {
      return stats.totalSpins >= 1;
    },
    hidden: false
  }, {
    id: 'spin_streak_3',
    name: 'Spin Streak',
    description: 'Spin 3 days in a row',
    icon: '🔥',
    category: 'dailySpin',
    tier: 'bronze',
    reward: {
      gems: 50,
      energy: 1000
    },
    // Redus
    condition: function condition(stats) {
      return stats.currentStreak >= 3;
    },
    hidden: false
  }, {
    id: 'spin_streak_7',
    name: 'Lucky Week',
    description: 'Spin 7 days in a row',
    icon: '🍀',
    category: 'dailySpin',
    tier: 'silver',
    reward: {
      gems: 100,
      crystals: 2,
      energy: 2500
    },
    // Redus
    condition: function condition(stats) {
      return stats.currentStreak >= 7;
    },
    hidden: false
  }, {
    id: 'spin_streak_30',
    name: 'Spin Master',
    description: 'Spin 30 days in a row',
    icon: '👑',
    category: 'dailySpin',
    tier: 'gold',
    reward: {
      gems: 400,
      crystals: 8,
      guardian: 1
    },
    // Redus
    condition: function condition(stats) {
      return stats.currentStreak >= 30;
    },
    hidden: false
  }, {
    id: 'spin_total_50',
    name: 'Frequent Spinner',
    description: 'Complete 50 total spins',
    icon: '🎡',
    category: 'dailySpin',
    tier: 'silver',
    reward: {
      gems: 120,
      crystals: 3
    },
    // Redus
    condition: function condition(stats) {
      return stats.totalSpins >= 50;
    },
    hidden: false
  }, {
    id: 'spin_total_100',
    name: 'Spin Veteran',
    description: 'Complete 100 total spins',
    icon: '🏆',
    category: 'dailySpin',
    tier: 'gold',
    reward: {
      gems: 300,
      crystals: 10
    },
    // Redus
    condition: function condition(stats) {
      return stats.totalSpins >= 100;
    },
    hidden: false
  }, {
    id: 'spin_jackpot_gems',
    name: 'Gem Jackpot',
    description: 'Land on the 500 Gems segment',
    icon: '💎',
    category: 'dailySpin',
    tier: 'gold',
    reward: {
      gems: 200,
      crystals: 5
    },
    // Redus
    condition: function condition(stats) {
      return stats.highestGemReward >= 500;
    },
    hidden: false
  }, {
    id: 'spin_guardian',
    name: 'Guardian Summoner',
    description: 'Win a Guardian from the wheel',
    icon: '🛡️',
    category: 'dailySpin',
    tier: 'platinum',
    reward: {
      gems: 500,
      crystals: 15
    },
    // Redus
    condition: function condition(stats) {
      return stats.guardiansWon >= 1;
    },
    hidden: false
  }],
  // ==================== 2048 ACHIEVEMENTS ====================
  game2048: [{
    id: '2048_first_game',
    name: 'Tile Beginner',
    description: 'Play your first 2048 game',
    icon: '🎮',
    category: 'game2048',
    tier: 'bronze',
    reward: {
      gems: 20,
      energy: 1000
    },
    // Redus
    condition: function condition(stats) {
      return stats.gamesPlayed >= 1;
    },
    hidden: false
  }, {
    id: '2048_reach_128',
    name: 'Early Success',
    description: 'Reach the 128 tile',
    icon: '🟪',
    category: 'game2048',
    tier: 'bronze',
    reward: {
      gems: 30,
      energy: 1500
    },
    // Nou achievement pentru progresie mai smooth
    condition: function condition(stats) {
      return stats.highestTile >= 128;
    },
    hidden: false
  }, {
    id: '2048_reach_256',
    name: 'Getting Started',
    description: 'Reach the 256 tile',
    icon: '🟦',
    category: 'game2048',
    tier: 'silver',
    reward: {
      gems: 50,
      crystals: 1
    },
    // Redus
    condition: function condition(stats) {
      return stats.highestTile >= 256;
    },
    hidden: false
  }, {
    id: '2048_reach_512',
    name: 'Tile Adept',
    description: 'Reach the 512 tile',
    icon: '🟩',
    category: 'game2048',
    tier: 'silver',
    reward: {
      gems: 80,
      crystals: 2
    },
    // Redus
    condition: function condition(stats) {
      return stats.highestTile >= 512;
    },
    hidden: false
  }, {
    id: '2048_reach_1024',
    name: 'Tile Expert',
    description: 'Reach the 1024 tile',
    icon: '🟨',
    category: 'game2048',
    tier: 'gold',
    reward: {
      gems: 150,
      crystals: 5
    },
    // Redus
    condition: function condition(stats) {
      return stats.highestTile >= 1024;
    },
    hidden: false
  }, {
    id: '2048_reach_2048',
    name: 'Victory!',
    description: 'Reach the legendary 2048 tile',
    icon: '🏆',
    category: 'game2048',
    tier: 'platinum',
    reward: {
      gems: 400,
      crystals: 15,
      guardian: 1
    },
    // Redus
    condition: function condition(stats) {
      return stats.highestTile >= 2048;
    },
    hidden: false
  }, {
    id: '2048_reach_4096',
    name: 'Beyond Victory',
    description: 'Reach the 4096 tile',
    icon: '💫',
    category: 'game2048',
    tier: 'diamond',
    reward: {
      gems: 1000,
      crystals: 30
    },
    // Redus
    condition: function condition(stats) {
      return stats.highestTile >= 4096;
    },
    hidden: false
  }, {
    id: '2048_score_5k',
    name: 'Score Starter',
    description: 'Reach 5,000 points in a single game',
    icon: '⭐',
    category: 'game2048',
    tier: 'bronze',
    reward: {
      gems: 40,
      energy: 2000
    },
    // Nou - milestone mai mic
    condition: function condition(stats) {
      return stats.highScore >= 5000;
    },
    hidden: false
  }, {
    id: '2048_score_10k',
    name: 'Score Crusher',
    description: 'Reach 10,000 points in a single game',
    icon: '💥',
    category: 'game2048',
    tier: 'silver',
    reward: {
      gems: 100,
      crystals: 3
    },
    // Redus
    condition: function condition(stats) {
      return stats.highScore >= 10000;
    },
    hidden: false
  }, {
    id: '2048_score_50k',
    name: 'Score Master',
    description: 'Reach 50,000 points in a single game',
    icon: '🌟',
    category: 'game2048',
    tier: 'gold',
    reward: {
      gems: 300,
      crystals: 10
    },
    // Redus
    condition: function condition(stats) {
      return stats.highScore >= 50000;
    },
    hidden: false
  }, {
    id: '2048_games_10',
    name: 'Getting Practice',
    description: 'Play 10 games',
    icon: '🎲',
    category: 'game2048',
    tier: 'bronze',
    reward: {
      gems: 50,
      energy: 2500
    },
    // Nou - milestone mai mic
    condition: function condition(stats) {
      return stats.gamesPlayed >= 10;
    },
    hidden: false
  }, {
    id: '2048_games_25',
    name: 'Persistent Player',
    description: 'Play 25 games',
    icon: '🎯',
    category: 'game2048',
    tier: 'silver',
    reward: {
      gems: 120,
      crystals: 4
    },
    // Redus
    condition: function condition(stats) {
      return stats.gamesPlayed >= 25;
    },
    hidden: false
  }, {
    id: '2048_games_100',
    name: '2048 Veteran',
    description: 'Play 100 games',
    icon: '👾',
    category: 'game2048',
    tier: 'gold',
    reward: {
      gems: 400,
      crystals: 15
    },
    // Redus
    condition: function condition(stats) {
      return stats.gamesPlayed >= 100;
    },
    hidden: false
  }],
  // ==================== MATCH-3 ACHIEVEMENTS ====================
  match3: [{
    id: 'match3_first_game',
    name: 'Match Beginner',
    description: 'Play your first Match-3 game',
    icon: '🧩',
    category: 'match3',
    tier: 'bronze',
    reward: {
      gems: 25,
      energy: 1000
    },
    // Redus
    condition: function condition(stats) {
      return stats.gamesPlayed >= 1;
    },
    hidden: false
  }, {
    id: 'match3_combo_3',
    name: 'Combo Starter',
    description: 'Achieve a 3x combo',
    icon: '🔥',
    category: 'match3',
    tier: 'bronze',
    reward: {
      gems: 30,
      energy: 1500
    },
    // Nou - milestone mai mic
    condition: function condition(stats) {
      return stats.bestCombo >= 3;
    },
    hidden: false
  }, {
    id: 'match3_combo_5',
    name: 'Combo Builder',
    description: 'Achieve a 5x combo',
    icon: '💫',
    category: 'match3',
    tier: 'silver',
    reward: {
      gems: 60,
      crystals: 2
    },
    // Redus
    condition: function condition(stats) {
      return stats.bestCombo >= 5;
    },
    hidden: false
  }, {
    id: 'match3_combo_10',
    name: 'Combo Expert',
    description: 'Achieve a 10x combo',
    icon: '⚡',
    category: 'match3',
    tier: 'silver',
    reward: {
      gems: 120,
      crystals: 4
    },
    // Redus
    condition: function condition(stats) {
      return stats.bestCombo >= 10;
    },
    hidden: false
  }, {
    id: 'match3_combo_15',
    name: 'Combo Master',
    description: 'Achieve a 15x combo',
    icon: '💥',
    category: 'match3',
    tier: 'gold',
    reward: {
      gems: 250,
      crystals: 10
    },
    // Redus
    condition: function condition(stats) {
      return stats.bestCombo >= 15;
    },
    hidden: false
  }, {
    id: 'match3_score_500',
    name: 'Score Beginner',
    description: 'Score 500 points in a single game',
    icon: '🎯',
    category: 'match3',
    tier: 'bronze',
    reward: {
      gems: 40,
      energy: 2000
    },
    // Nou - milestone mai mic
    condition: function condition(stats) {
      return stats.highScore >= 500;
    },
    hidden: false
  }, {
    id: 'match3_score_1000',
    name: 'High Scorer',
    description: 'Score 1,000 points in a single game',
    icon: '⭐',
    category: 'match3',
    tier: 'silver',
    reward: {
      gems: 80,
      crystals: 3
    },
    // Redus
    condition: function condition(stats) {
      return stats.highScore >= 1000;
    },
    hidden: false
  }, {
    id: 'match3_score_2500',
    name: 'Score Champion',
    description: 'Score 2,500 points in a single game',
    icon: '🏆',
    category: 'match3',
    tier: 'gold',
    reward: {
      gems: 250,
      crystals: 8
    },
    // Redus
    condition: function condition(stats) {
      return stats.highScore >= 2500;
    },
    hidden: false
  }, {
    id: 'match3_special_bomb',
    name: 'Bomb Master',
    description: 'Create 10 bomb special gems',
    icon: '💣',
    category: 'match3',
    tier: 'silver',
    reward: {
      gems: 100,
      crystals: 3
    },
    // Redus
    condition: function condition(stats) {
      var _stats$specialGemsCre;
      return ((_stats$specialGemsCre = stats.specialGemsCreated) === null || _stats$specialGemsCre === void 0 ? void 0 : _stats$specialGemsCre.bomb) >= 10;
    },
    hidden: false
  }, {
    id: 'match3_special_lightning',
    name: 'Lightning Striker',
    description: 'Create 5 lightning special gems',
    icon: '⚡',
    category: 'match3',
    tier: 'gold',
    reward: {
      gems: 180,
      crystals: 6
    },
    // Redus
    condition: function condition(stats) {
      var _stats$specialGemsCre2;
      return ((_stats$specialGemsCre2 = stats.specialGemsCreated) === null || _stats$specialGemsCre2 === void 0 ? void 0 : _stats$specialGemsCre2.lightning) >= 5;
    },
    hidden: false
  }, {
    id: 'match3_special_rainbow',
    name: 'Rainbow Wizard',
    description: 'Create a rainbow special gem',
    icon: '🌈',
    category: 'match3',
    tier: 'platinum',
    reward: {
      gems: 400,
      crystals: 12
    },
    // Redus
    condition: function condition(stats) {
      var _stats$specialGemsCre3;
      return ((_stats$specialGemsCre3 = stats.specialGemsCreated) === null || _stats$specialGemsCre3 === void 0 ? void 0 : _stats$specialGemsCre3.rainbow) >= 1;
    },
    hidden: false
  }, {
    id: 'match3_games_10',
    name: 'Match Explorer',
    description: 'Play 10 Match-3 games',
    icon: '🎮',
    category: 'match3',
    tier: 'bronze',
    reward: {
      gems: 60,
      energy: 3000
    },
    // Nou - milestone mai mic
    condition: function condition(stats) {
      return stats.gamesPlayed >= 10;
    },
    hidden: false
  }, {
    id: 'match3_games_50',
    name: 'Match Veteran',
    description: 'Play 50 Match-3 games',
    icon: '🎯',
    category: 'match3',
    tier: 'gold',
    reward: {
      gems: 300,
      crystals: 10
    },
    // Redus
    condition: function condition(stats) {
      return stats.gamesPlayed >= 50;
    },
    hidden: false
  }, {
    id: 'match3_perfect_score',
    name: 'Perfect Victory',
    description: 'Win a boss battle with 2000+ score',
    icon: '⭐',
    category: 'match3',
    tier: 'platinum',
    reward: {
      gems: 600,
      crystals: 20,
      guardian: 1
    },
    // Redus + score requirement redus
    condition: function condition(stats) {
      return stats.perfectVictories >= 1;
    },
    hidden: false
  }]
};

/**
 * Achievement tier colors & rewards
 */
var ACHIEVEMENT_TIERS = exports.ACHIEVEMENT_TIERS = {
  bronze: {
    color: '#CD7F32',
    icon: '🥉',
    multiplier: 1
  },
  silver: {
    color: '#C0C0C0',
    icon: '🥈',
    multiplier: 1.5
  },
  gold: {
    color: '#FFD700',
    icon: '🥇',
    multiplier: 2
  },
  platinum: {
    color: '#E5E4E2',
    icon: '💎',
    multiplier: 2.5
  },
  // Redus de la 3
  diamond: {
    color: '#B9F2FF',
    icon: '💠',
    multiplier: 4
  } // Redus de la 5
};

/**
 * Get all achievements for a specific game
 */
function getAchievementsByGame(gameType) {
  return MINI_GAME_ACHIEVEMENTS[gameType] || [];
}

/**
 * Get achievement by ID
 */
function getAchievementById(achievementId) {
  for (var _i = 0, _Object$entries = Object.entries(MINI_GAME_ACHIEVEMENTS); _i < _Object$entries.length; _i++) {
    var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
      game = _Object$entries$_i[0],
      achievements = _Object$entries$_i[1];
    var achievement = achievements.find(function (a) {
      return a.id === achievementId;
    });
    if (achievement) return achievement;
  }
  return null;
}

/**
 * Get all achievements (flat array)
 */
function getAllMiniGameAchievements() {
  return Object.values(MINI_GAME_ACHIEVEMENTS).flat();
}

},{}],12:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
/**
 * Quest templates for generation
 */

var QUEST_TEMPLATES = {
  // ===== PRODUCTION QUESTS =====
  produceEnergy: {
    id: 'produceEnergy',
    type: 'produce',
    name: 'Energy Production',
    description: 'Produce {amount} energy',
    emoji: '⚡',
    resource: 'energy',
    amounts: [500, 2000, 5000, 15000, 50000],
    rewards: function rewards(amount) {
      return {
        energy: Math.floor(amount * 0.08),
        // 8% bonus (reduced from 10%)
        gems: Math.min(3 + Math.floor(amount / 5000), 30)
      };
    },
    weight: 30,
    difficulty: 'easy'
  },
  produceMana: {
    id: 'produceMana',
    type: 'produce',
    name: 'Mana Production',
    description: 'Produce {amount} mana',
    emoji: '✨',
    resource: 'mana',
    amounts: [5, 20, 50, 200, 500],
    rewards: function rewards(amount) {
      return {
        mana: Math.floor(amount * 0.15),
        // 15% bonus (reduced from 20%)
        gems: Math.min(5 + Math.floor(amount / 25), 50)
      };
    },
    weight: 25,
    difficulty: 'easy',
    unlockCondition: {
      resources: {
        mana: 1
      }
    }
  },
  produceVolcanic: {
    id: 'produceVolcanic',
    type: 'produce',
    name: 'Volcanic Energy',
    description: 'Produce {amount} volcanic energy',
    emoji: '🌋',
    resource: 'volcanicEnergy',
    amounts: [50, 250, 500, 2500, 5000],
    rewards: function rewards(amount) {
      return {
        volcanicEnergy: Math.floor(amount * 0.12),
        gems: Math.min(8 + Math.floor(amount / 250), 80),
        crystals: Math.floor(amount / 2500)
      };
    },
    weight: 20,
    difficulty: 'medium',
    unlockCondition: {
      realms: {
        volcano: true
      }
    }
  },
  // ===== STRUCTURE QUESTS =====
  buyStructures: {
    id: 'buyStructures',
    type: 'buy',
    name: 'Structure Investment',
    description: 'Purchase {amount} structures',
    emoji: '🏗️',
    target: 'any',
    amounts: [3, 5, 10, 25, 50],
    rewards: function rewards(amount) {
      return {
        energy: amount * 200,
        gems: Math.min(5 + amount, 50),
        mana: Math.floor(amount / 5)
      };
    },
    weight: 20,
    difficulty: 'easy'
  },
  buySpecificStructure: {
    id: 'buySpecificStructure',
    type: 'buy',
    name: 'Focused Development',
    description: 'Purchase {amount} {structure}',
    emoji: '🎯',
    targets: ['solarPanel', 'windTurbine', 'hydroPlant', 'manaExtractor'],
    amounts: [2, 3, 5, 10],
    rewards: function rewards(amount) {
      return {
        energy: amount * 500,
        gems: amount * 3
      };
    },
    weight: 15,
    difficulty: 'medium'
  },
  // ===== UPGRADE QUESTS =====
  buyUpgrades: {
    id: 'buyUpgrades',
    type: 'upgrade',
    name: 'Research & Development',
    description: 'Purchase {amount} upgrades',
    emoji: '🔬',
    amounts: [1, 2, 3, 5],
    rewards: function rewards(amount) {
      return {
        gems: amount * 15,
        energy: amount * 1000,
        mana: amount * 5
      };
    },
    weight: 15,
    difficulty: 'medium',
    unlockCondition: {
      upgrades: {
        energyBoost: 1
      }
    }
  },
  // ===== MILESTONE QUESTS =====
  reachProduction: {
    id: 'reachProduction',
    type: 'milestone',
    name: 'Production Milestone',
    description: 'Reach {amount} energy/s',
    emoji: '📈',
    metric: 'energyPerSecond',
    amounts: [50, 200, 500, 2000, 5000],
    rewards: function rewards(amount) {
      return {
        gems: Math.min(15 + Math.floor(amount / 50), 100),
        crystals: Math.floor(amount / 500),
        energy: amount * 50
      };
    },
    weight: 10,
    difficulty: 'hard'
  },
  reachLevel: {
    id: 'reachLevel',
    type: 'milestone',
    name: 'Level Up',
    description: 'Reach structure level {amount}',
    emoji: '⬆️',
    metric: 'maxStructureLevel',
    amounts: [5, 10, 25, 50],
    rewards: function rewards(amount) {
      return {
        gems: amount * 1,
        energy: amount * 500
      };
    },
    weight: 10,
    difficulty: 'medium'
  },
  // ===== PUZZLE QUESTS =====
  winPuzzle: {
    id: 'winPuzzle',
    type: 'puzzle',
    name: 'Puzzle Master',
    description: 'Win {amount} puzzle games',
    emoji: '🧩',
    counts: [1, 2, 3, 5],
    minScore: 500,
    rewards: function rewards(count) {
      return {
        gems: count * 10,
        energy: count * 1000
      };
    },
    weight: 15,
    difficulty: 'medium'
  },
  puzzleHighScore: {
    id: 'puzzleHighScore',
    type: 'puzzle',
    name: 'High Scorer',
    description: 'Score {amount} in puzzle',
    emoji: '🎯',
    scores: [800, 1200, 1600, 2500],
    rewards: function rewards(score) {
      return {
        gems: Math.floor(score / 80),
        energy: score * 3
      };
    },
    weight: 10,
    difficulty: 'hard'
  },
  // ===== GUARDIAN QUESTS =====
  summonGuardians: {
    id: 'summonGuardians',
    type: 'summon',
    name: 'Guardian Summoner',
    description: 'Summon {amount} guardians',
    emoji: '🐉',
    counts: [1, 2, 3, 5],
    rewards: function rewards(count) {
      return {
        gems: count * 30,
        energy: count * 2500
      };
    },
    weight: 10,
    difficulty: 'hard',
    unlockCondition: {
      guardians: {
        count: 1
      }
    }
  },
  collectRarity: {
    id: 'collectRarity',
    type: 'collect',
    name: 'Rare Collection',
    description: 'Own a {rarity} guardian',
    emoji: '💎',
    rarities: ['rare', 'epic', 'legendary'],
    rewards: function rewards(rarity) {
      var rewardMap = {
        rare: {
          gems: 50,
          crystals: 1
        },
        epic: {
          gems: 150,
          crystals: 3
        },
        legendary: {
          gems: 300,
          crystals: 8
        }
      };
      return rewardMap[rarity];
    },
    weight: 5,
    difficulty: 'hard',
    unlockCondition: {
      guardians: {
        count: 3
      }
    }
  },
  // ===== BOSS QUESTS =====
  defeatBoss: {
    id: 'defeatBoss',
    type: 'boss',
    name: 'Boss Slayer',
    description: 'Defeat {boss}',
    emoji: '⚔️',
    bosses: ['corruptedTreeant', 'infernoTitan', 'voidLeviathan'],
    rewards: function rewards(bossId) {
      return {
        gems: 75,
        crystals: 5,
        energy: 25000
      };
    },
    weight: 5,
    difficulty: 'hard',
    unlockCondition: {
      bosses: {
        unlocked: 1
      }
    }
  },
  // ===== REALM QUESTS =====
  exploreRealm: {
    id: 'exploreRealm',
    type: 'realm',
    name: 'Realm Explorer',
    description: 'Unlock the {realm}',
    emoji: '🗺️',
    realms: ['volcano'],
    rewards: function rewards(realmId) {
      return {
        gems: 100,
        crystals: 8,
        energy: 50000
      };
    },
    weight: 3,
    difficulty: 'hard'
  },
  // ===== ASCENSION QUESTS =====
  ascend: {
    id: 'ascend',
    type: 'ascension',
    name: 'Transcendence',
    description: 'Perform ascension',
    emoji: '✨',
    rewards: function rewards() {
      return {
        gems: 250,
        crystals: 15
      };
    },
    weight: 2,
    difficulty: 'hard',
    unlockCondition: {
      ascension: {
        canAscend: true
      }
    }
  },
  // ===== OCEAN REALM QUESTS =====
  ocean_intro: {
    id: 'ocean_intro',
    type: 'realm',
    name: 'Discover the Ocean',
    description: 'Unlock and enter the Ocean Realm.',
    emoji: '🌊',
    realm: 'ocean',
    requirements: {
      realms: {
        ocean: true
      }
    },
    rewards: {
      tidalEnergy: 2500,
      gems: 50,
      crystals: 3
    },
    weight: 3,
    difficulty: 'hard',
    lore: 'You found your way to the mysterious underwater world. The tides welcome you.'
  },
  tide_master: {
    id: 'tide_master',
    type: 'milestone',
    name: 'Tide Master',
    description: 'Reach 250 tidal energy/sec production in the Ocean Realm.',
    emoji: '🌊',
    realm: 'ocean',
    metric: 'tidalEnergyPerSecond',
    amounts: [250],
    rewards: function rewards(amount) {
      return {
        pearls: 15,
        gems: 30,
        crystals: 5
      };
    },
    weight: 8,
    difficulty: 'hard',
    unlockCondition: {
      realms: {
        ocean: true
      }
    },
    lore: 'You tamed the tides and mastered the ocean\'s energy.'
  },
  kelp_tycoon: {
    id: 'kelp_tycoon',
    type: 'buy',
    name: 'Kelp Tycoon',
    description: 'Own at least 10 Kelp Farms in Ocean Realm.',
    emoji: '🪸',
    realm: 'ocean',
    target: 'kelpFarm',
    amounts: [10],
    rewards: function rewards(amount) {
      return {
        tidalEnergy: 8000,
        gems: 15
      };
    },
    weight: 12,
    difficulty: 'medium',
    unlockCondition: {
      realms: {
        ocean: true
      },
      structures: {
        kelpFarm: 5
      }
    },
    lore: 'You\'ve built the largest kelp farm in the deep.'
  },
  pearl_diver: {
    id: 'pearl_diver',
    type: 'collect',
    name: 'Pearl Diver',
    description: 'Collect 30 pearls using Coral Battery.',
    emoji: '🏝️',
    realm: 'ocean',
    resource: 'pearls',
    amounts: [30],
    rewards: function rewards(amount) {
      return {
        gems: 20,
        crystals: 5
      };
    },
    weight: 10,
    difficulty: 'hard',
    unlockCondition: {
      realms: {
        ocean: true
      },
      structures: {
        coralBattery: 3
      }
    },
    lore: 'Your diving skills have brought back the ocean\'s treasures.'
  },
  abyss_conqueror: {
    id: 'abyss_conqueror',
    type: 'boss',
    name: 'Abyss Conqueror',
    description: 'Defeat the Ocean Leviathan boss.',
    emoji: '🦈',
    realm: 'ocean',
    bosses: ['oceanLeviathan'],
    rewards: function rewards(bossId) {
      return {
        gems: 100,
        crystals: 10,
        tidalEnergy: 50000,
        legendaryGuardian: {
          type: 'water',
          rarity: 'legendary'
        }
      };
    },
    weight: 3,
    difficulty: 'hard',
    unlockCondition: {
      realms: {
        ocean: true
      },
      bosses: {
        oceanLeviathan: 'unlocked'
      }
    },
    lore: 'You conquered the deepest horror the ocean could offer.'
  },
  // ===== OCEAN PRODUCTION QUESTS =====
  produceTidal: {
    id: 'produceTidal',
    type: 'produce',
    name: 'Tidal Wave',
    description: 'Produce {amount} tidal energy',
    emoji: '🌊',
    resource: 'tidalEnergy',
    amounts: [100, 500, 1500, 5000, 15000],
    rewards: function rewards(amount) {
      return {
        tidalEnergy: Math.floor(amount * 0.12),
        gems: Math.min(8 + Math.floor(amount / 300), 70),
        pearls: Math.floor(amount / 3000)
      };
    },
    weight: 20,
    difficulty: 'medium',
    unlockCondition: {
      realms: {
        ocean: true
      }
    }
  }
};
var _default = exports["default"] = QUEST_TEMPLATES;

},{}],13:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.canUnlockRealm = canUnlockRealm;
exports["default"] = void 0;
exports.getRealmById = getRealmById;
exports.getUnlockedRealms = getUnlockedRealms;
var _config = _interopRequireDefault(require("../config.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; } /**
 * Realm definitions
 */
var REALMS = {
  forest: {
    id: 'forest',
    name: 'Forest Realm',
    description: 'The starting realm, lush with natural energy',
    emoji: '🌲',
    theme: 'green',
    unlockCondition: null,
    // Always unlocked
    unlockCost: null,
    features: {
      structures: ['solarPanel', 'windTurbine', 'hydroPlant', 'geoThermal', 'fusionReactor', 'antimatterGenerator'],
      guardianTypes: ['energy', 'mana', 'all'],
      specialResources: []
    },
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    lore: 'A peaceful forest where energy flows naturally through ancient trees and crystal-clear streams.',
    bonuses: {
      // Starter realm - no special bonuses
      energyProduction: 1.0,
      manaProduction: 1.0
    }
  },
  volcano: {
    id: 'volcano',
    name: 'Volcanic Realm',
    description: 'A realm of fire and molten power',
    emoji: '🌋',
    theme: 'red',
    unlockCondition: {
      ascension: {
        level: 1
      },
      bosses: {
        corruptedTreeant: 'defeated'
      }
    },
    unlockCost: {
      crystals: _config["default"].BALANCING.VOLCANO_UNLOCK_COST || 200 // Fallback dacă nu e în CONFIG
    },
    features: {
      structures: ['magmaVent', 'lavaCrystallizer', 'obsidianForge'],
      guardianTypes: ['volcanic', 'all'],
      specialResources: ['volcanicEnergy']
    },
    background: 'linear-gradient(135deg, #f12711 0%, #f5af19 100%)',
    lore: 'An ancient volcano where primordial fire still burns. The heat here can forge anything... or destroy everything.',
    bonuses: {
      volcanicProduction: 1.10,
      // +10% volcanic energy (redus de la implicit)
      manaConversion: 1.15,
      // +15% mana from volcanic sources (redus de la 1.2)
      gemChance: 0.03 // 3% chance for gems (redus de la 5%)
    },
    bossId: 'infernoTitan'
  },
  // === OCEAN REALM ===
  ocean: {
    id: 'ocean',
    name: 'Ocean Depths',
    description: 'Mysteries and power beneath the waves',
    emoji: '🌊',
    theme: 'blue',
    unlockCondition: {
      ascension: {
        level: 2
      },
      // Redus de la 3
      realms: {
        volcano: 'unlocked'
      },
      production: {
        energy: 2000
      } // Adăugat milestone de producție
    },
    unlockCost: {
      crystals: 300 // Redus de la 500
    },
    features: {
      structures: ['tidalGenerator', 'kelpFarm', 'coralBattery', 'deepSeaPump', 'pressureReactor'],
      guardianTypes: ['water', 'all'],
      specialResources: ['tidalEnergy', 'pearls']
    },
    background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
    lore: 'The ocean depths hold secrets older than time itself.  Harness tides and marine life for immense energy.',
    bonuses: {
      tidalProduction: 1.08,
      // +8% tidal energy production (redus de la 1. 15)
      pearlDropChance: 0.06,
      // 6% chance for pearls (redus de la 10%)
      guardianAffinity: 1.12 // +12% water guardian bonus (redus de la 1. 20)
    },
    bossId: 'oceanLeviathan',
    questIds: ['ocean_intro', 'tide_master', 'kelp_tycoon', 'pearl_diver'],
    locked: false // ✅ Acum e disponibil! 
  },
  // === FUTURE REALMS ===

  desert: {
    id: 'desert',
    name: 'Desert Expanse',
    description: 'Endless dunes hiding ancient solar power',
    emoji: '�sa',
    theme: 'yellow',
    unlockCondition: {
      ascension: {
        level: 3
      },
      realms: {
        ocean: 'unlocked'
      }
    },
    unlockCost: {
      crystals: 600
    },
    features: {
      structures: ['solarArray', 'sandExtractor', 'mirageCore'],
      guardianTypes: ['solar', 'all'],
      specialResources: ['solarEssence']
    },
    background: 'linear-gradient(135deg, #f2994a 0%, #f2c94c 100%)',
    lore: 'Where the sun burns brightest and sand holds forgotten secrets.',
    bonuses: {
      solarProduction: 1.25,
      // +25% solar energy
      energyProduction: 1.10,
      // +10% all energy
      heatResistance: 0.9 // -10% structure costs
    },
    locked: true // Not implemented yet
  },
  tundra: {
    id: 'tundra',
    name: 'Frozen Tundra',
    description: 'Ice and cold preserve ancient energies',
    emoji: '❄️',
    theme: 'cyan',
    unlockCondition: {
      ascension: {
        level: 4
      },
      realms: {
        desert: 'unlocked'
      }
    },
    unlockCost: {
      crystals: 1000
    },
    features: {
      structures: ['cryoReactor', 'iceHarvester', 'auraBorealis'],
      guardianTypes: ['ice', 'all'],
      specialResources: ['cryoEnergy']
    },
    background: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)',
    lore: 'Frozen wastes where time moves slowly and energy is preserved eternally.',
    bonuses: {
      cryoProduction: 1.30,
      // +30% cryo energy
      crystalChance: 0.08,
      // 8% chance for crystals
      guardianDuration: 1.20 // +20% guardian buff duration
    },
    locked: true // Not implemented yet
  },
  cosmos: {
    id: 'cosmos',
    name: 'Cosmic Expanse',
    description: 'The realm beyond the stars',
    emoji: '🌌',
    theme: 'dark',
    unlockCondition: {
      ascension: {
        level: 5
      },
      realms: {
        tundra: 'unlocked'
      },
      bosses: {
        voidLeviathan: 'defeated',
        oceanLeviathan: 'defeated',
        infernoTitan: 'defeated'
      }
    },
    unlockCost: {
      crystals: 2000
    },
    features: {
      structures: ['starForge', 'blackHoleGenerator', 'warpReactor'],
      guardianTypes: ['cosmic', 'all'],
      specialResources: ['cosmicEnergy', 'starDust']
    },
    background: 'linear-gradient(135deg, #000000 0%, #434343 100%)',
    lore: 'Where reality bends and infinite energy awaits.  The final frontier.',
    bonuses: {
      allProduction: 1.50,
      // +50% ALL production types
      ascensionBonus: 1.25,
      // +25% ascension crystal gain
      guardianPower: 1.40 // +40% all guardian bonuses
    },
    bossId: 'cosmicHarbinger',
    locked: true // Final realm - Not implemented yet
  }
};

/**
 * Get realm by ID
 */
function getRealmById(realmId) {
  return REALMS[realmId] || null;
}

/**
 * Get unlocked realms based on state
 */
function getUnlockedRealms(state) {
  return Object.values(REALMS).filter(function (realm) {
    if (!realm.unlockCondition) return true; // Forest always unlocked
    if (realm.locked) return false; // Not implemented

    return state.realms.unlocked.includes(realm.id);
  });
}

/**
 * Check if realm can be unlocked
 */
function canUnlockRealm(realmId, state) {
  var _realm$unlockCost;
  var realm = REALMS[realmId];
  if (!realm || realm.locked) return false;
  if (!realm.unlockCondition) return true;
  var condition = realm.unlockCondition;

  // Check ascension level
  if (condition.ascension && state.ascension.level < condition.ascension.level) {
    return false;
  }

  // Check other realms
  if (condition.realms) {
    for (var _i = 0, _Object$entries = Object.entries(condition.realms); _i < _Object$entries.length; _i++) {
      var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
        requiredRealm = _Object$entries$_i[0],
        status = _Object$entries$_i[1];
      if (status === 'unlocked' && !state.realms.unlocked.includes(requiredRealm)) {
        return false;
      }
    }
  }

  // Check bosses
  if (condition.bosses) {
    for (var _i2 = 0, _Object$entries2 = Object.entries(condition.bosses); _i2 < _Object$entries2.length; _i2++) {
      var _state$bosses$boss;
      var _Object$entries2$_i = _slicedToArray(_Object$entries2[_i2], 2),
        boss = _Object$entries2$_i[0],
        _status = _Object$entries2$_i[1];
      if (_status === 'defeated' && !((_state$bosses$boss = state.bosses[boss]) !== null && _state$bosses$boss !== void 0 && _state$bosses$boss.defeated)) {
        return false;
      }
    }
  }

  // Check production
  if (condition.production) {
    for (var _i3 = 0, _Object$entries3 = Object.entries(condition.production); _i3 < _Object$entries3.length; _i3++) {
      var _Object$entries3$_i = _slicedToArray(_Object$entries3[_i3], 2),
        resource = _Object$entries3$_i[0],
        amount = _Object$entries3$_i[1];
      if (state.production[resource] < amount) {
        return false;
      }
    }
  }

  // Check resources for cost
  if ((_realm$unlockCost = realm.unlockCost) !== null && _realm$unlockCost !== void 0 && _realm$unlockCost.crystals && state.resources.crystals < realm.unlockCost.crystals) {
    return false;
  }
  return true;
}
var _default = exports["default"] = REALMS;

},{"../config.js":1}],14:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
exports.getPackageById = getPackageById;
exports.getPackagesByCategory = getPackagesByCategory;
exports.isOfferAvailable = isOfferAvailable;
/**
 * Shop definitions - IAP packages, VIP, etc. 
 */

var SHOP_ITEMS = {
  // ===== GEM PACKAGES =====
  gemPackages: {
    starter: {
      id: 'starter',
      name: 'Starter Pack',
      description: 'Perfect for beginners',
      gems: 500,
      bonus: {
        energy: 5000,
        // Redus de la 10000
        mana: 50 // Redus de la 100
      },
      price: 0.99,
      priceDisplay: '$0. 99',
      emoji: '💎',
      popular: false
    },
    medium: {
      id: 'medium',
      name: 'Medium Pack',
      description: 'Good value for active players',
      gems: 1200,
      bonus: {
        energy: 15000,
        // Redus de la 25000
        mana: 150,
        // Redus de la 250
        crystals: 3 // Redus de la 5
      },
      price: 1.99,
      priceDisplay: '$1.99',
      emoji: '💎',
      popular: true,
      bonusPercentage: 20
    },
    large: {
      id: 'large',
      name: 'Large Pack',
      description: 'Best value!',
      gems: 3000,
      bonus: {
        energy: 50000,
        // Redus de la 100000
        mana: 500,
        // Redus de la 1000
        crystals: 10,
        // Redus de la 15
        guardian: 1
      },
      price: 4.99,
      priceDisplay: '$4.99',
      emoji: '💎',
      popular: false,
      bonusPercentage: 50
    },
    mega: {
      id: 'mega',
      name: 'Mega Pack',
      description: 'For serious players',
      gems: 7500,
      bonus: {
        energy: 250000,
        // Redus de la 500000
        mana: 2500,
        // Redus de la 5000
        crystals: 30,
        // Redus de la 50
        guardian: 2 // Redus de la 3
      },
      price: 9.99,
      priceDisplay: '$9.99',
      emoji: '💎',
      popular: false,
      bonusPercentage: 100
    },
    ultimate: {
      id: 'ultimate',
      name: 'Ultimate Pack',
      description: 'The best deal',
      gems: 20000,
      bonus: {
        energy: 1000000,
        // Redus de la 2000000
        mana: 10000,
        // Redus de la 20000
        crystals: 120,
        // Redus de la 200
        guardian: 6,
        // Redus de la 10
        guaranteedLegendary: 1
      },
      price: 19.99,
      priceDisplay: '$19.99',
      emoji: '💎',
      popular: false,
      bonusPercentage: 150,
      special: true
    }
  },
  // ===== VIP SUBSCRIPTION =====
  vip: {
    id: 'vip',
    name: 'VIP Membership',
    description: 'Premium benefits for 30 days',
    price: 4.99,
    priceDisplay: '$4.99/month',
    duration: 2592000000,
    // 30 days
    emoji: '👑',
    benefits: {
      offlineProduction: 0.75,
      // Redus de la 1.0 (100% → 75%)
      dailyGems: 30,
      // Redus de la 50
      questSlots: 4,
      // Redus de la 5 (+1 în loc de +2)
      upgradeQueueSlots: 4,
      // Redus de la 5
      guardianDiscount: 0.20,
      // Redus de la 0.5 (50% → 20%)
      noAds: true,
      exclusiveCosmetics: true
    },
    benefitsDisplay: ['75% offline production',
    // Updated
    '30 gems daily',
    // Updated
    '+1 quest slot',
    // Updated
    '+1 upgrade queue slot',
    // Updated
    '20% off guardian summons',
    // Updated
    'No ads', 'Exclusive cosmetics']
  },
  // ===== LIMITED TIME OFFERS =====
  limitedOffers: [{
    id: 'welcome_offer',
    name: 'Welcome Offer',
    description: 'New player special - 24h only!',
    gems: 1500,
    // Redus de la 2000
    bonus: {
      energy: 50000,
      // Redus de la 100000
      crystals: 12,
      // Redus de la 20
      guardian: 1 // Redus de la 2
    },
    price: 2.99,
    priceDisplay: '$2.99',
    emoji: '🎁',
    duration: 86400000,
    // 24h
    condition: {
      playTime: {
        max: 3600000
      } // First hour
    },
    discount: 70
  }, {
    id: 'ascension_boost',
    name: 'Ascension Boost',
    description: 'Just ascended? Get a head start!',
    gems: 800,
    // Redus de la 1000
    bonus: {
      energy: 250000,
      // Redus de la 500000
      crystals: 30,
      // Redus de la 50
      quickStart: true
    },
    price: 3.99,
    priceDisplay: '$3.99',
    emoji: '✨',
    duration: 1800000,
    // 30 min offer window
    condition: {
      justAscended: true
    },
    discount: 50
  },
  // ✅ NOU - Weekend Deal
  {
    id: 'weekend_special',
    name: 'Weekend Special',
    description: 'Weekend only - Double rewards!',
    gems: 2500,
    bonus: {
      energy: 100000,
      mana: 1000,
      crystals: 20,
      guardian: 2
    },
    price: 4.99,
    priceDisplay: '$4.99',
    emoji: '🎉',
    duration: 172800000,
    // 48h (weekend)
    condition: {
      dayOfWeek: [6, 0] // Saturday & Sunday
    },
    discount: 60
  }],
  // ===== REWARDED ADS =====
  rewardedAds: {
    energyBoost: {
      id: 'energyBoost',
      name: 'Energy Boost',
      description: 'Watch ad for energy',
      reward: {
        energy: 2500 // Redus de la 5000
      },
      cooldown: 300000,
      // 5 min
      dailyLimit: 8,
      // Redus de la 10
      emoji: '⚡'
    },
    gemReward: {
      id: 'gemReward',
      name: 'Free Gems',
      description: 'Watch ad for gems',
      reward: {
        gems: 15 // Redus de la 25
      },
      cooldown: 600000,
      // 10 min
      dailyLimit: 4,
      // Redus de la 5
      emoji: '💎'
    },
    doubleReward: {
      id: 'doubleReward',
      name: 'Double Rewards',
      description: '1. 5x all production for 10 minutes',
      // Updated description
      reward: {
        multiplier: 1.5,
        // Redus de la 2 (100% → 50%)
        duration: 600000 // 10 min
      },
      cooldown: 3600000,
      // Crescut la 1h (de la 30 min)
      dailyLimit: 2,
      // Redus de la 3
      emoji: '✨'
    },
    // ✅ NOU - Mana Boost
    manaBoost: {
      id: 'manaBoost',
      name: 'Mana Surge',
      description: 'Watch ad for mana',
      reward: {
        mana: 100
      },
      cooldown: 450000,
      // 7.5 min
      dailyLimit: 6,
      emoji: '✨'
    }
  },
  // ===== DAILY DEAL =====
  dailyDeal: {
    refreshTime: 86400000,
    // 24h
    deals: [{
      id: 'energy_sale',
      name: 'Energy Sale',
      gems: 400,
      // Redus de la 500
      bonus: {
        energy: 50000
      },
      // Redus de la 100000
      price: 0.99,
      discount: 50
    }, {
      id: 'crystal_deal',
      name: 'Crystal Deal',
      gems: 800,
      // Redus de la 1000
      bonus: {
        crystals: 15
      },
      // Redus de la 25
      price: 1.99,
      discount: 60
    }, {
      id: 'guardian_special',
      name: 'Guardian Special',
      gems: 600,
      // Redus de la 800
      bonus: {
        guardian: 3
      },
      // Redus de la 5
      price: 2.99,
      discount: 40
    },
    // ✅ NOU - Mana Deal
    {
      id: 'mana_bundle',
      name: 'Mana Bundle',
      gems: 500,
      bonus: {
        mana: 500,
        energy: 25000
      },
      price: 1.49,
      discount: 55
    }]
  },
  // ===== MINI-GAMES PACKAGES =====
  miniGamesPackages: {
    extraSpins3: {
      id: 'extra_spins_3',
      name: '3 Extra Spins',
      description: 'Get 3 additional spins for the Daily Wheel!',
      spins: 3,
      bonus: {
        gems: 50 // Redus de la 100
      },
      price: 0.99,
      priceDisplay: '$0.99',
      emoji: '🎡',
      popular: false
    },
    extraSpins10: {
      id: 'extra_spins_10',
      name: '10 Extra Spins',
      description: 'Best value! 10 spins + bonus gems',
      spins: 10,
      bonus: {
        gems: 300,
        // Redus de la 500
        energy: 5000 // Redus de la 10000
      },
      price: 2.99,
      priceDisplay: '$2. 99',
      emoji: '🎡',
      popular: true,
      bonusPercentage: 30
    },
    unlimitedSpins24h: {
      id: 'unlimited_spins_24h',
      name: 'Unlimited Spins - 24h',
      description: 'Spin as much as you want for 24 hours!',
      unlimited: true,
      duration: 86400000,
      // 24h
      bonus: {
        gems: 500 // Redus de la 1000
      },
      price: 4.99,
      priceDisplay: '$4.99',
      emoji: '🎡✨',
      special: true
    },
    // ✅ NOU - 2048 Undo Pack
    game2048UndoPack: {
      id: '2048_undo_pack',
      name: '2048 Undo Pack',
      description: '10 undo moves for 2048 game',
      undoMoves: 10,
      bonus: {
        gems: 100
      },
      price: 1.99,
      priceDisplay: '$1.99',
      emoji: '↩️',
      popular: false
    },
    // ✅ NOU - Match-3 Power-Up Bundle
    match3PowerUpBundle: {
      id: 'match3_powerup_bundle',
      name: 'Match-3 Power-Ups',
      description: 'Get 5 of each special gem power-up! ',
      powerUps: {
        bomb: 5,
        lightning: 5,
        rainbow: 2
      },
      bonus: {
        gems: 200
      },
      price: 2.99,
      priceDisplay: '$2.99',
      emoji: '💥',
      popular: true
    }
  },
  // ===== COSMETICS & CUSTOMIZATION =====
  cosmetics: {
    themes: [{
      id: 'dark_nebula',
      name: 'Dark Nebula Theme',
      description: 'Cosmic dark theme with animated stars',
      price: 500,
      currency: 'gems',
      emoji: '🌌',
      category: 'theme'
    }, {
      id: 'ocean_waves',
      name: 'Ocean Waves Theme',
      description: 'Soothing blue ocean theme',
      price: 400,
      currency: 'gems',
      emoji: '🌊',
      category: 'theme'
    }, {
      id: 'lava_flow',
      name: 'Lava Flow Theme',
      description: 'Hot volcanic theme',
      price: 450,
      currency: 'gems',
      emoji: '🌋',
      category: 'theme'
    }],
    animations: [{
      id: 'sparkle_click',
      name: 'Sparkle Click',
      description: 'Sparkles when clicking',
      price: 200,
      currency: 'gems',
      emoji: '✨'
    }, {
      id: 'energy_trail',
      name: 'Energy Trail',
      description: 'Leaves energy trail on cursor',
      price: 300,
      currency: 'gems',
      emoji: '⚡'
    }]
  }
};

/**
 * Get package by ID
 */
function getPackageById(packageId) {
  var _SHOP_ITEMS$category;
  var category = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'gemPackages';
  return ((_SHOP_ITEMS$category = SHOP_ITEMS[category]) === null || _SHOP_ITEMS$category === void 0 ? void 0 : _SHOP_ITEMS$category[packageId]) || null;
}

/**
 * Get all packages in a category
 */
function getPackagesByCategory(category) {
  return SHOP_ITEMS[category] || {};
}

/**
 * Check if limited offer is available
 */
function isOfferAvailable(offer, playerState) {
  if (!offer.condition) return true;
  var condition = offer.condition;

  // Check play time
  if (condition.playTime) {
    var totalPlayTime = playerState.statistics.totalPlayTime;
    if (condition.playTime.max && totalPlayTime > condition.playTime.max) {
      return false;
    }
    if (condition.playTime.min && totalPlayTime < condition.playTime.min) {
      return false;
    }
  }

  // Check ascension
  if (condition.justAscended) {
    var timeSinceAscension = Date.now() - (playerState.ascension.lastAscensionTime || 0);
    if (timeSinceAscension > offer.duration) {
      return false;
    }
  }

  // Check day of week
  if (condition.dayOfWeek) {
    var currentDay = new Date().getDay();
    if (!condition.dayOfWeek.includes(currentDay)) {
      return false;
    }
  }
  return true;
}
var _default = exports["default"] = SHOP_ITEMS;

},{}],15:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
/**
 * Structure definitions with balancing
 */

var STRUCTURES = {
  // ===== TIER 1: EARLY GAME =====
  solarPanel: {
    id: 'solarPanel',
    name: 'Solar Panel',
    description: 'Converts sunlight into energy',
    emoji: '☀️',
    tier: 1,
    // Costs
    baseCost: 50,
    costMultiplier: 1.25,
    costResource: 'energy',
    // Production
    baseProduction: 0.5,
    productionExponent: 1.0,
    resource: 'energy',
    // Unlock
    unlockCondition: null,
    // Always available

    // Flavor
    flavorTexts: ['Harnessing the power of the sun', 'Clean energy for a brighter future', 'Solar power at its finest']
  },
  windTurbine: {
    id: 'windTurbine',
    name: 'Wind Turbine',
    description: 'Generates energy from wind',
    emoji: '💨',
    tier: 1,
    baseCost: 300,
    costMultiplier: 1.30,
    costResource: 'energy',
    baseProduction: 2,
    productionExponent: 1.05,
    resource: 'energy',
    unlockCondition: {
      resources: {
        energy: 500
      }
    },
    flavorTexts: ['The wind whispers of energy', 'Spinning into the future', 'Renewable and reliable']
  },
  // ===== TIER 2: MID GAME =====
  hydroPlant: {
    id: 'hydroPlant',
    name: 'Hydro Plant',
    description: 'Water-powered energy generation',
    emoji: '💧',
    tier: 2,
    baseCost: 2500,
    costMultiplier: 1.35,
    costResource: 'energy',
    baseProduction: 10,
    productionExponent: 1.1,
    resource: 'energy',
    unlockCondition: {
      resources: {
        energy: 5000
      }
    },
    flavorTexts: ['The power of flowing water', 'Hydro energy never sleeps', 'Rivers of electricity']
  },
  geoThermal: {
    id: 'geoThermal',
    name: 'Geothermal Plant',
    description: 'Taps into Earth\'s heat',
    emoji: '🌋',
    tier: 2,
    baseCost: 25000,
    costMultiplier: 1.40,
    costResource: 'energy',
    baseProduction: 50,
    productionExponent: 1.12,
    resource: 'energy',
    unlockCondition: {
      structures: {
        hydroPlant: 5
      }
    },
    flavorTexts: ['Earth\'s warmth flows through', 'Geothermal excellence', 'Heat from the depths']
  },
  // ===== TIER 3: LATE GAME =====
  fusionReactor: {
    id: 'fusionReactor',
    name: 'Fusion Reactor',
    description: 'Nuclear fusion energy',
    emoji: '⚛️',
    tier: 3,
    baseCost: 500000,
    costMultiplier: 1.45,
    costResource: 'energy',
    baseProduction: 300,
    productionExponent: 1.15,
    resource: 'energy',
    unlockCondition: {
      resources: {
        energy: 1000000
      },
      upgrades: {
        advancedTech: 1
      }
    },
    flavorTexts: ['The power of the stars', 'Fusion: tomorrow\'s energy today', 'Unlimited clean energy']
  },
  antimatterGenerator: {
    id: 'antimatterGenerator',
    name: 'Antimatter Generator',
    description: 'Harnesses antimatter reactions',
    emoji: '✨',
    tier: 3,
    baseCost: 1000000,
    costMultiplier: 1.30,
    costResource: 'energy',
    baseProduction: 10000,
    productionExponent: 1.2,
    resource: 'energy',
    unlockCondition: {
      ascension: {
        level: 1
      },
      resources: {
        crystals: 5
      }
    },
    flavorTexts: ['Matter meets antimatter', 'The ultimate energy source', 'Beyond comprehension']
  },
  // ===== MANA PRODUCERS =====
  manaExtractor: {
    id: 'manaExtractor',
    name: 'Mana Extractor',
    description: 'Extracts mana from energy',
    emoji: '🔮',
    tier: 2,
    baseCost: 100000,
    costMultiplier: 1.25,
    costResource: 'energy',
    baseProduction: 0.05,
    productionExponent: 1.1,
    resource: 'mana',
    unlockCondition: {
      resources: {
        energy: 25000
      }
    },
    flavorTexts: ['Converting energy to magic', 'Mana flows freely', 'The mystic conversion']
  },
  manaCrystallizer: {
    id: 'manaCrystallizer',
    name: 'Mana Crystallizer',
    description: 'Crystallizes pure mana',
    emoji: '💎',
    tier: 3,
    baseCost: 1500000,
    costMultiplier: 1.28,
    costResource: 'energy',
    baseProduction: 1,
    productionExponent: 1.15,
    resource: 'mana',
    unlockCondition: {
      resources: {
        mana: 200
      },
      structures: {
        manaExtractor: 10
      }
    },
    flavorTexts: ['Pure crystallized mana', 'Magic made solid', 'Crystalline perfection']
  },
  // ===== VOLCANO REALM =====
  magmaVent: {
    id: 'magmaVent',
    name: 'Magma Vent',
    description: 'Volcanic energy source',
    emoji: '🌋',
    tier: 1,
    realm: 'volcano',
    baseCost: 500,
    costMultiplier: 1.28,
    costResource: 'volcanicEnergy',
    baseProduction: 2,
    productionExponent: 1.1,
    resource: 'volcanicEnergy',
    unlockCondition: {
      realms: {
        volcano: true
      }
    },
    flavorTexts: ['Magma surges upward', 'The volcano\'s breath', 'Molten energy']
  },
  lavaCrystallizer: {
    id: 'lavaCrystallizer',
    name: 'Lava Crystallizer',
    description: 'Converts volcanic energy to mana',
    emoji: '🔥',
    tier: 2,
    realm: 'volcano',
    baseCost: 5000,
    costMultiplier: 1.32,
    costResource: 'volcanicEnergy',
    baseProduction: 0.2,
    productionExponent: 1.15,
    resource: 'mana',
    unlockCondition: {
      realms: {
        volcano: true
      },
      structures: {
        magmaVent: 5
      }
    },
    flavorTexts: ['Lava transforms to magic', 'Fire and mana intertwine', 'Volcanic alchemy']
  },
  obsidianForge: {
    id: 'obsidianForge',
    name: 'Obsidian Forge',
    description: 'Forges gems from volcanic energy',
    emoji: '⚒️',
    tier: 3,
    realm: 'volcano',
    // ===== OCEAN REALM =====
    tidalGenerator: {
      id: 'tidalGenerator',
      name: 'Tidal Generator',
      description: 'Harnesses tidal forces for energy',
      emoji: '🌊',
      tier: 1,
      realm: 'ocean',
      baseCost: 800,
      costMultiplier: 1.28,
      costResource: 'tidalEnergy',
      baseProduction: 3,
      productionExponent: 1.12,
      resource: 'tidalEnergy',
      unlockCondition: {
        realms: {
          ocean: true
        }
      },
      flavorTexts: ['Power from the rhythm of the deep', 'Tides never sleep', 'Harnessing oceanic force']
    },
    kelpFarm: {
      id: 'kelpFarm',
      name: 'Kelp Farm',
      description: 'Cultivates kelp for tidal resources',
      emoji: '🪸',
      tier: 2,
      realm: 'ocean',
      baseCost: 8000,
      costMultiplier: 1.32,
      costResource: 'tidalEnergy',
      baseProduction: 15,
      productionExponent: 1.13,
      resource: 'tidalEnergy',
      unlockCondition: {
        realms: {
          ocean: true
        },
        structures: {
          tidalGenerator: 5
        }
      },
      flavorTexts: ['Kelp waves with watery promise', 'Aquatic farming fuels progress', 'Oceanic abundance']
    },
    coralBattery: {
      id: 'coralBattery',
      name: 'Coral Battery',
      description: 'Stores energy, sometimes yields pearls',
      emoji: '🏝️',
      tier: 3,
      realm: 'ocean',
      baseCost: 100000,
      costMultiplier: 1.38,
      costResource: 'tidalEnergy',
      baseProduction: 80,
      productionExponent: 1.15,
      resource: 'tidalEnergy',
      unlockCondition: {
        realms: {
          ocean: true
        },
        structures: {
          kelpFarm: 8
        }
      },
      flavorTexts: ['Corals accumulate deep power', 'Pearls of production', 'Battery from the reef']
    },
    deepSeaPump: {
      id: 'deepSeaPump',
      name: 'Deep Sea Pump',
      description: 'Draws energy from ocean depths',
      emoji: '🦑',
      tier: 3,
      realm: 'ocean',
      baseCost: 500000,
      costMultiplier: 1.42,
      costResource: 'tidalEnergy',
      baseProduction: 250,
      productionExponent: 1.18,
      resource: 'tidalEnergy',
      unlockCondition: {
        realms: {
          ocean: true
        },
        structures: {
          coralBattery: 5
        },
        upgrades: {
          pressureTech: 1
        }
      },
      flavorTexts: ['Energy from the abyss', 'Pressure fuels innovation', 'Unleashing deep force']
    },
    pressureReactor: {
      id: 'pressureReactor',
      name: 'Pressure Reactor',
      description: 'Reacts oceanic pressure to create mana',
      emoji: '⚓',
      tier: 3,
      realm: 'ocean',
      baseCost: 1500000,
      costMultiplier: 1.45,
      costResource: 'tidalEnergy',
      baseProduction: 1,
      productionExponent: 1.2,
      resource: 'mana',
      unlockCondition: {
        realms: {
          ocean: true
        },
        structures: {
          deepSeaPump: 5
        }
      },
      flavorTexts: ['Mana condensed from oceanic pressure', 'Depth and force combine', 'Mystic equilibrium']
    },
    baseCost: 10000,
    costMultiplier: 1.30,
    costResource: 'volcanicEnergy',
    baseProduction: 0.01,
    // Very slow gem production
    productionExponent: 1.2,
    resource: 'gems',
    unlockCondition: {
      realms: {
        volcano: true
      },
      structures: {
        lavaCrystallizer: 10
      }
    },
    flavorTexts: ['Forging precious gems', 'Obsidian and fire', 'Gems from the depths']
  }
};
var _default = exports["default"] = STRUCTURES;

},{}],16:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
/**
 * Upgrade definitions with balancing
 *
 * Balancing philosophy (in linii mari, ca în idle/incremental games):
 * - Primele upgrade-uri sunt accesibile și dau un „wow” vizibil.
 * - Costurile cresc exponențial, dar nu atât de brutal încât să blocheze progresul.
 * - Capacity upgrades apar când începi să „lovești cap-ul” des.
 * - Synergiile sunt mai scumpe și mai late-game, dar foarte puternice.
 * - QoL și special sunt milestones, nu blocaje.
 */

var UPGRADES = {
  // ===== PRODUCTION MULTIPLIERS =====
  energyBoost: {
    id: 'energyBoost',
    name: 'Energy Amplifier',
    description: 'Increases all energy production',
    emoji: '⚡',
    category: 'production',
    // Early-mid game backbone: simți câștigul, dar nu sari instant în infinit
    maxLevel: 40,
    baseCost: 200,
    // accesibil foarte devreme
    costMultiplier: 1.5,
    // scaling blând, potrivit pentru „primul” upgrade important
    costResource: 'energy',
    effect: function effect(level) {
      // ~+12% per level, compounding
      return Math.pow(1.12, level);
    },
    getDescription: function getDescription(level) {
      var bonus = ((Math.pow(1.12, level) - 1) * 100).toFixed(1);
      return "+".concat(bonus, "% energy production");
    },
    unlockCondition: null // disponibil de la început
  },
  manaEfficiency: {
    id: 'manaEfficiency',
    name: 'Mana Efficiency',
    description: 'Increases mana production',
    emoji: '✨',
    category: 'production',
    // Mana e o resursă secundară, dar importantă
    maxLevel: 25,
    baseCost: 300,
    costMultiplier: 1.8,
    // mai agresiv decât energy, dar nu absurd
    costResource: 'mana',
    effect: function effect(level) {
      // ~+14% per level, compounding
      return Math.pow(1.14, level);
    },
    getDescription: function getDescription(level) {
      var bonus = ((Math.pow(1.14, level) - 1) * 100).toFixed(1);
      return "+".concat(bonus, "% mana production");
    },
    unlockCondition: {
      // intri în jocul cu mana destul de repede
      resources: {
        mana: 20
      }
    }
  },
  volcanicPower: {
    id: 'volcanicPower',
    name: 'Volcanic Amplification',
    description: 'Boosts volcanic energy production',
    emoji: '🌋',
    category: 'production',
    // Realm mai avansat → costuri mai mari dar scaling ceva mai blând
    maxLevel: 30,
    baseCost: 2000,
    costMultiplier: 1.6,
    costResource: 'volcanicEnergy',
    effect: function effect(level) {
      // ~+15% per level, compounding
      return Math.pow(1.15, level);
    },
    getDescription: function getDescription(level) {
      var bonus = ((Math.pow(1.15, level) - 1) * 100).toFixed(1);
      return "+".concat(bonus, "% volcanic energy production");
    },
    unlockCondition: {
      realms: {
        volcano: true
      }
    }
  },
  // ===== RESOURCE CAPS =====
  energyCap: {
    id: 'energyCap',
    name: 'Energy Storage',
    description: 'Increases maximum energy capacity',
    emoji: '🔋',
    category: 'capacity',
    // Capacity de early-mid game
    maxLevel: 20,
    baseCost: 500,
    // corelat cu ce vezi în UI ca „prim milestone”
    costMultiplier: 1.6,
    costResource: 'energy',
    effect: function effect(level) {
      // Plecăm de la un cap decent și scalăm sănătos
      // Level 0 (implicit) înseamnă cap de bază din CONFIG; aici dăm valoarea când ai 1 level
      // Din sistemul tău: SET_CAP setează efectul direct ca nou cap
      return 3000 * Math.pow(1.8, level);
    },
    getDescription: function getDescription(level) {
      var cap = Math.floor(3000 * Math.pow(1.8, level));
      return "Energy cap: ".concat(cap.toLocaleString());
    },
    unlockCondition: {
      // simți nevoia de cap când ai atins de câteva ori acest prag
      resources: {
        energy: 500
      }
    }
  },
  manaCap: {
    id: 'manaCap',
    name: 'Mana Reservoir',
    description: 'Increases maximum mana capacity',
    emoji: '🔮',
    category: 'capacity',
    maxLevel: 15,
    baseCost: 300,
    costMultiplier: 1.7,
    costResource: 'mana',
    effect: function effect(level) {
      return 500 * Math.pow(1.8, level);
    },
    getDescription: function getDescription(level) {
      var cap = Math.floor(500 * Math.pow(1.8, level));
      return "Mana cap: ".concat(cap.toLocaleString());
    },
    unlockCondition: {
      resources: {
        mana: 50
      }
    }
  },
  volcanicCap: {
    id: 'volcanicCap',
    name: 'Magma Chamber',
    description: 'Increases volcanic energy capacity',
    emoji: '⚱️',
    category: 'capacity',
    maxLevel: 15,
    baseCost: 5000,
    costMultiplier: 1.7,
    costResource: 'volcanicEnergy',
    effect: function effect(level) {
      return 4000 * Math.pow(1.8, level);
    },
    getDescription: function getDescription(level) {
      var cap = Math.floor(4000 * Math.pow(1.8, level));
      return "Volcanic cap: ".concat(cap.toLocaleString());
    },
    unlockCondition: {
      realms: {
        volcano: true
      }
    }
  },
  // ===== STRUCTURE SYNERGIES =====
  solarSynergy: {
    id: 'solarSynergy',
    name: 'Solar Optimization',
    description: 'Boosts Solar Panel efficiency',
    emoji: '☀️',
    category: 'synergy',
    maxLevel: 5,
    baseCost: 5000,
    costMultiplier: 2.5,
    costResource: 'energy',
    targetStructure: 'solarPanel',
    effect: function effect(level) {
      // +40% per level (linear) – foarte puternic pe structuri mari
      return 1 + level * 0.4;
    },
    getDescription: function getDescription(level) {
      var bonus = level * 40;
      return "+".concat(bonus, "% Solar Panel production");
    },
    unlockCondition: {
      structures: {
        solarPanel: 10
      }
    }
  },
  windSynergy: {
    id: 'windSynergy',
    name: 'Wind Optimization',
    description: 'Boosts Wind Turbine efficiency',
    emoji: '💨',
    category: 'synergy',
    maxLevel: 5,
    baseCost: 15000,
    costMultiplier: 2.5,
    costResource: 'energy',
    targetStructure: 'windTurbine',
    effect: function effect(level) {
      return 1 + level * 0.4;
    },
    getDescription: function getDescription(level) {
      var bonus = level * 40;
      return "+".concat(bonus, "% Wind Turbine production");
    },
    unlockCondition: {
      structures: {
        windTurbine: 10
      }
    }
  },
  hydroSynergy: {
    id: 'hydroSynergy',
    name: 'Hydro Optimization',
    description: 'Boosts Hydro Plant efficiency',
    emoji: '💧',
    category: 'synergy',
    maxLevel: 5,
    baseCost: 30000,
    costMultiplier: 2.5,
    costResource: 'energy',
    targetStructure: 'hydroPlant',
    effect: function effect(level) {
      // Hydro ceva mai „late-game”, deci puțin mai puternic
      return 1 + level * 0.5;
    },
    getDescription: function getDescription(level) {
      var bonus = level * 50;
      return "+".concat(bonus, "% Hydro Plant production");
    },
    unlockCondition: {
      structures: {
        hydroPlant: 10
      }
    }
  },
  // ===== QUALITY OF LIFE =====
  offlineProduction: {
    id: 'offlineProduction',
    name: 'Offline Generator',
    description: 'Earn resources while offline',
    emoji: '🌙',
    category: 'qol',
    maxLevel: 10,
    baseCost: 500,
    costMultiplier: 1.4,
    // nu chiar fix, dar nici prea agresiv
    costResource: 'gems',
    effect: function effect(level) {
      // 0% → 100% in 10 levels
      return Math.min(level * 10, 100);
    },
    getDescription: function getDescription(level) {
      var percent = Math.min(level * 10, 100);
      return "".concat(percent, "% production while offline");
    },
    unlockCondition: {
      resources: {
        gems: 200
      } // mai ușor de deblocat, dar scaling de cost mai dur pe termen lung
    }
  },
  autoCollect: {
    id: 'autoCollect',
    name: 'Auto-Collector',
    description: 'Automatically collect offline resources',
    emoji: '🤖',
    category: 'qol',
    maxLevel: 1,
    baseCost: 2000,
    // puțin mai scump, să simți că e „feature premium”
    costMultiplier: 1.0,
    costResource: 'gems',
    effect: function effect(level) {
      return level > 0;
    },
    getDescription: function getDescription(level) {
      return level > 0 ? 'Auto-collect enabled' : 'Auto-collect offline resources';
    },
    unlockCondition: {
      upgrades: {
        offlineProduction: 3
      } // unlock mai devreme decât 5, dar nu instant
    }
  },
  quickStart: {
    id: 'quickStart',
    name: 'Quick Start',
    description: 'Start with bonus resources after ascension',
    emoji: '🚀',
    category: 'qol',
    maxLevel: 5,
    baseCost: 3000,
    costMultiplier: 1.7,
    costResource: 'gems',
    effect: function effect(level) {
      // Start with 10% of previous run resources per level
      return level * 0.1;
    },
    getDescription: function getDescription(level) {
      var percent = level * 10;
      return "Start with ".concat(percent, "% of previous resources");
    },
    unlockCondition: {
      ascension: {
        level: 1
      }
    }
  },
  // ===== UNLOCK UPGRADES =====
  advancedTech: {
    id: 'advancedTech',
    name: 'Advanced Technology',
    description: 'Unlock Fusion Reactor',
    emoji: '🔬',
    category: 'unlock',
    maxLevel: 1,
    baseCost: 100000,
    costMultiplier: 1.0,
    costResource: 'energy',
    effect: function effect() {
      return {
        unlock: 'fusionReactor'
      };
    },
    getDescription: function getDescription() {
      return 'Unlocks: Fusion Reactor';
    },
    unlockCondition: {
      // „late-mid / early-late game” milestone
      resources: {
        energy: 250000
      },
      structures: {
        geoThermal: 5
      }
    }
  },
  manaConvergence: {
    id: 'manaConvergence',
    name: 'Mana Convergence',
    description: 'Unlock Mana Crystallizer',
    emoji: '💠',
    category: 'unlock',
    maxLevel: 1,
    baseCost: 1000,
    costMultiplier: 1.0,
    costResource: 'mana',
    effect: function effect() {
      return {
        unlock: 'manaCrystallizer'
      };
    },
    getDescription: function getDescription() {
      return 'Unlocks: Mana Crystallizer';
    },
    unlockCondition: {
      resources: {
        mana: 500
      },
      structures: {
        manaExtractor: 10
      }
    }
  },
  // ===== SPECIAL UPGRADES =====
  criticalEnergy: {
    id: 'criticalEnergy',
    name: 'Critical Energy',
    description: 'Chance for 2x energy production ticks',
    emoji: '💥',
    category: 'special',
    maxLevel: 10,
    baseCost: 10000,
    costMultiplier: 2.2,
    costResource: 'gems',
    effect: function effect(level) {
      return level * 2; // 2% per level
    },
    getDescription: function getDescription(level) {
      var chance = level * 2;
      return "".concat(chance, "% chance for 2x energy ticks");
    },
    unlockCondition: {
      resources: {
        gems: 5000
      },
      ascension: {
        level: 2
      }
    }
  },
  luckyGems: {
    id: 'luckyGems',
    name: 'Lucky Gems',
    description: 'Chance to get bonus gems from quests',
    emoji: '🍀',
    category: 'special',
    maxLevel: 10,
    baseCost: 8000,
    costMultiplier: 2.0,
    costResource: 'gems',
    effect: function effect(level) {
      return level * 5; // 5% per level
    },
    getDescription: function getDescription(level) {
      var chance = level * 5;
      return "".concat(chance, "% chance for bonus gems");
    },
    unlockCondition: {
      statistics: {
        questsCompleted: 10
      }
    }
  },
  guardianBond: {
    id: 'guardianBond',
    name: 'Guardian Bond',
    description: 'Increases all guardian bonuses',
    emoji: '🤝',
    category: 'special',
    maxLevel: 10,
    baseCost: 5000,
    costMultiplier: 2.0,
    costResource: 'gems',
    effect: function effect(level) {
      return 1 + level * 0.1; // +10% per level
    },
    getDescription: function getDescription(level) {
      var bonus = level * 10;
      return "+".concat(bonus, "% to all guardian bonuses");
    },
    unlockCondition: {
      guardians: {
        count: 5
      }
    }
  },
  // ===== OCEAN REALM UPGRADES =====
  tidalSynergy: {
    id: 'tidalSynergy',
    name: 'Tidal Synergy',
    description: 'Boosts Tidal Generator efficiency.',
    emoji: '🌊',
    category: 'synergy',
    maxLevel: 5,
    baseCost: 8000,
    costMultiplier: 2.8,
    costResource: 'tidalEnergy',
    targetStructure: 'tidalGenerator',
    effect: function effect(level) {
      return 1 + level * 0.5; // +50% per level
    },
    getDescription: function getDescription(level) {
      var bonus = level * 50;
      return "+".concat(bonus, "% Tidal Generator production");
    },
    unlockCondition: {
      // corectăm cerința: număr de structuri, nu „8000”
      structures: {
        tidalGenerator: 10
      }
    }
  },
  kelpSynergy: {
    id: 'kelpSynergy',
    name: 'Kelp Optimization',
    description: 'Boosts Kelp Farm efficiency.',
    emoji: '🪸',
    category: 'synergy',
    maxLevel: 5,
    baseCost: 15000,
    costMultiplier: 2.8,
    costResource: 'tidalEnergy',
    targetStructure: 'kelpFarm',
    effect: function effect(level) {
      return 1 + level * 0.5; // +50% per level
    },
    getDescription: function getDescription(level) {
      var bonus = level * 50;
      return "+".concat(bonus, "% Kelp Farm production");
    },
    unlockCondition: {
      structures: {
        kelpFarm: 10
      }
    }
  },
  coralSynergy: {
    id: 'coralSynergy',
    name: 'Coral Battery Optimization',
    description: 'Boosts Coral Battery efficiency.',
    emoji: '🏝️',
    category: 'synergy',
    maxLevel: 5,
    baseCost: 35000,
    costMultiplier: 3.0,
    costResource: 'tidalEnergy',
    targetStructure: 'coralBattery',
    effect: function effect(level) {
      return 1 + level * 0.5; // +50% per level
    },
    getDescription: function getDescription(level) {
      var bonus = level * 50;
      return "+".concat(bonus, "% Coral Battery production");
    },
    unlockCondition: {
      structures: {
        coralBattery: 10
      }
    }
  },
  abyssalTech: {
    id: 'abyssalTech',
    name: 'Abyssal Pressure Tech',
    description: 'Unlocks Deep Sea Pump, boosts tidal energy by +20%.',
    emoji: '⚓',
    category: 'unlock',
    maxLevel: 1,
    baseCost: 200000,
    costMultiplier: 1.0,
    costResource: 'tidalEnergy',
    effect: function effect() {
      return {
        unlock: 'deepSeaPump',
        bonus: 1.2
      };
    },
    getDescription: function getDescription() {
      return 'Unlocks: Deep Sea Pump (+20% tidal energy)';
    },
    unlockCondition: {
      // milestone de structură, nu valoare numerică random
      structures: {
        coralBattery: 5
      }
    }
  },
  pearlHarvest: {
    id: 'pearlHarvest',
    name: 'Pearl Harvesting Tech',
    description: 'Increase chance to find pearls from Coral Battery by +10%.',
    emoji: '🏝️',
    category: 'special',
    maxLevel: 1,
    baseCost: 8000,
    costMultiplier: 1.0,
    costResource: 'pearls',
    effect: function effect() {
      return {
        pearlDropBonus: 0.1
      };
    },
    getDescription: function getDescription() {
      return '+10% Pearl drop chance from Coral Battery';
    },
    unlockCondition: {
      structures: {
        coralBattery: 10
      }
    }
  }
};
var _default = exports["default"] = UPGRADES;

},{}],17:[function(require,module,exports){
"use strict";

var _config = _interopRequireDefault(require("./config.js"));
var _Game = _interopRequireDefault(require("./core/Game.js"));
var _EventBus = _interopRequireDefault(require("./utils/EventBus.js"));
var _NotificationHelper = _interopRequireDefault(require("./utils/NotificationHelper.js"));
require("./systems/NotificationManager.js");
var _Logger = _interopRequireDefault(require("./utils/Logger.js"));
var _StateManager = _interopRequireDefault(require("./core/StateManager.js"));
var _Formatters = _interopRequireDefault(require("./utils/Formatters.js"));
var _MiniGameAchievementSystem = _interopRequireDefault(require("./systems/MiniGameAchievementSystem.js"));
var _ResourceDisplay = _interopRequireDefault(require("./ui/components/ResourceDisplay.js"));
var _StructuresUI = _interopRequireDefault(require("./ui/StructuresUI.js"));
var _UpgradesUI = _interopRequireDefault(require("./ui/UpgradesUI.js"));
var _GuardiansUI = _interopRequireDefault(require("./ui/GuardiansUI.js"));
var _QuestsUI = _interopRequireDefault(require("./ui/QuestsUI.js"));
var _AchievementsUI = _interopRequireDefault(require("./ui/AchievementsUI.js"));
var _BossesUI = _interopRequireDefault(require("./ui/BossesUI.js"));
var _ShopUI = _interopRequireDefault(require("./ui/ShopUI.js"));
var _StatisticsUI = _interopRequireDefault(require("./ui/StatisticsUI.js"));
var _DailyRewardUI = _interopRequireDefault(require("./ui/DailyRewardUI.js"));
var _AutomationUI = _interopRequireDefault(require("./ui/AutomationUI.js"));
var _PuzzleUI = _interopRequireDefault(require("./ui/PuzzleUI.js"));
var _BadgeManager = _interopRequireDefault(require("./ui/BadgeManager.js"));
var _NotificationManager2 = _interopRequireDefault(require("./ui/NotificationManager.js"));
var _ModalManager = _interopRequireDefault(require("./ui/ModalManager.js"));
var _TabManager = _interopRequireDefault(require("./ui/TabManager.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; } /**
 * Main Entry Point
 * Initializes the game and binds UI
 */ //import eventBus from './utils/EventBus.js';
// Inițializează
// ✅ ADĂUGAT
// UI Managers
// Component Managers
// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/service-worker.js').then(function (registration) {
      console.log('ServiceWorker registered:', registration);
    })["catch"](function (error) {
      console.log('ServiceWorker registration failed:', error);
    });
  });
}

/**
 * Initialize application
 */
function initApp() {
  return _initApp.apply(this, arguments);
}
/**
 * Show loading screen with progress
 */
function _initApp() {
  _initApp = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2() {
    var _t;
    return _regenerator().w(function (_context2) {
      while (1) switch (_context2.p = _context2.n) {
        case 0:
          _Logger["default"].info('Main', 'Starting application...');

          // Show loading screen
          showLoadingScreen();
          _context2.p = 1;
          _context2.n = 2;
          return sleep(1000);
        case 2:
          _context2.n = 3;
          return _Game["default"].init();
        case 3:
          // ✅ ADĂUGAT - Initialize mini-game achievement system
          _MiniGameAchievementSystem["default"].init();
          _Logger["default"].info('Main', '✅ Mini-game achievement system initialized');

          // Initialize UI
          initUI();

          // Bind global events
          bindGlobalEvents();

          // Hide loading screen
          hideLoadingScreen();

          // Show game container
          document.getElementById('game-container').style.display = 'flex';
          _Logger["default"].info('Main', '✅ Application started successfully!');

          // Check for tutorial
          setTimeout(function () {
            checkTutorial();
          }, 1000);

          // Check for offline progress
          checkOfflineProgress();

          // Check for daily reward
          setTimeout(function () {
            checkDailyReward();
          }, 2000);
          _context2.n = 5;
          break;
        case 4:
          _context2.p = 4;
          _t = _context2.v;
          _Logger["default"].error('Main', 'Failed to initialize:', _t);
          showError('Failed to load game. Please refresh the page.');
        case 5:
          return _context2.a(2);
      }
    }, _callee2, null, [[1, 4]]);
  }));
  return _initApp.apply(this, arguments);
}
function showLoadingScreen() {
  var loadingScreen = document.getElementById('loading-screen');
  var progress = document.getElementById('loading-progress');
  var currentProgress = 0;
  var interval = setInterval(function () {
    currentProgress += Math.random() * 30;
    if (currentProgress >= 100) {
      currentProgress = 100;
      clearInterval(interval);
    }
    progress.style.width = "".concat(currentProgress, "%");
  }, 200);
}

/**
 * Hide loading screen
 */
function hideLoadingScreen() {
  var loadingScreen = document.getElementById('loading-screen');
  loadingScreen.style.opacity = '0';
  setTimeout(function () {
    loadingScreen.style.display = 'none';
  }, 300);
}

/**
 * Initialize UI components
 */
function initUI() {
  _Logger["default"].info('Main', 'Initializing UI...');

  // Initialize resource display
  new _ResourceDisplay["default"]('resource-display');

  // Initialize tab manager
  var tabManager = new _TabManager["default"]();

  // Initialize modal manager
  var modalManager = new _ModalManager["default"]();

  // Initialize notification manager
  var notificationManager = new _NotificationManager2["default"]();

  // Initialize tab content
  new _StructuresUI["default"]('structures-container');
  new _UpgradesUI["default"]('upgrades-container');
  new _GuardiansUI["default"]('guardians-container');
  new _QuestsUI["default"]('quests-container');
  new _AchievementsUI["default"]('achievements-container');
  new _BossesUI["default"]('bosses-container');
  new _PuzzleUI["default"]('puzzle-game-container');
  new _ShopUI["default"]('shop-container');
  new _StatisticsUI["default"]('statistics-container');

  // Update last save time
  updateLastSaveTime();
  setInterval(updateLastSaveTime, 1000);
  _Logger["default"].info('Main', '✅ UI initialized');
}

/**
 * Bind global events
 */
function bindGlobalEvents() {
  var _document$getElementB, _document$getElementB2, _document$getElementB3, _document$getElementB4, _document$getElementB5;
  // Settings button
  (_document$getElementB = document.getElementById('settings-btn')) === null || _document$getElementB === void 0 || _document$getElementB.addEventListener('click', function () {
    _EventBus["default"].emit('modal:show', {
      modalId: 'settings-modal'
    });
  });

  // Save button
  (_document$getElementB2 = document.getElementById('save-btn')) === null || _document$getElementB2 === void 0 || _document$getElementB2.addEventListener('click', function () {
    _Game["default"].save();
    showNotification('Game saved!', 'success');
  });

  // Ascension button
  (_document$getElementB3 = document.getElementById('ascension-btn')) === null || _document$getElementB3 === void 0 || _document$getElementB3.addEventListener('click', function () {
    var ascensionSystem = _Game["default"].getSystem('ascension');
    var canAscend = ascensionSystem.canAscend();
    if (canAscend.can) {
      _EventBus["default"].emit('modal:show', {
        modalId: 'ascension-modal'
      });
    } else {
      showNotification("Need ".concat(_Formatters["default"].formatNumber(canAscend.remaining), " more energy"), 'warning');
    }
  });

  // Automation button
  (_document$getElementB4 = document.getElementById('automation-btn')) === null || _document$getElementB4 === void 0 || _document$getElementB4.addEventListener('click', function () {
    _EventBus["default"].emit('modal:show', {
      modalId: 'automation-modal'
    });
  });

  // Daily reward button
  (_document$getElementB5 = document.getElementById('daily-reward-btn')) === null || _document$getElementB5 === void 0 || _document$getElementB5.addEventListener('click', function () {
    _EventBus["default"].emit('modal:show', {
      modalId: 'daily-reward-modal'
    });
  });
  document.querySelectorAll('.tab-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var tabName = btn.dataset.tab;
      _BadgeManager["default"].clearBadgeOnTabClick(tabName);
    });
  });

  // Settings modal bindings
  bindSettingsModal();

  // Listen for game events
  _EventBus["default"].on('game:saved', function () {
    showNotification('Progress saved', 'success', 2000);
  });
  _EventBus["default"].on('notification:show', function (data) {
    showNotification(data.message, data.type || 'info', data.duration);
  });
}

/**
 * Bind settings modal events
 */
function bindSettingsModal() {
  var _document$getElementB6, _document$getElementB7, _document$getElementB8, _document$getElementB9, _document$getElementB0, _document$getElementB1, _document$getElementB10;
  // Theme change
  (_document$getElementB6 = document.getElementById('theme-select')) === null || _document$getElementB6 === void 0 || _document$getElementB6.addEventListener('change', function (e) {
    var theme = e.target.value;
    document.body.className = theme === 'light' ? 'light-theme' : 'dark-theme';
    _StateManager["default"].dispatch({
      type: 'UPDATE_SETTING',
      payload: {
        key: 'theme',
        value: theme
      }
    });
  });

  // Sound toggle
  (_document$getElementB7 = document.getElementById('sound-enabled')) === null || _document$getElementB7 === void 0 || _document$getElementB7.addEventListener('change', function (e) {
    _StateManager["default"].dispatch({
      type: 'UPDATE_SETTING',
      payload: {
        key: 'soundEnabled',
        value: e.target.checked
      }
    });
  });

  // Music toggle
  (_document$getElementB8 = document.getElementById('music-enabled')) === null || _document$getElementB8 === void 0 || _document$getElementB8.addEventListener('change', function (e) {
    _StateManager["default"].dispatch({
      type: 'UPDATE_SETTING',
      payload: {
        key: 'musicEnabled',
        value: e.target.checked
      }
    });
  });

  // Export save
  (_document$getElementB9 = document.getElementById('export-save-btn')) === null || _document$getElementB9 === void 0 || _document$getElementB9.addEventListener('click', function () {
    _Game["default"].exportSave();
    showNotification('Save exported!', 'success');
  });

  // Import save
  (_document$getElementB0 = document.getElementById('import-save-btn')) === null || _document$getElementB0 === void 0 || _document$getElementB0.addEventListener('click', function () {
    document.getElementById('import-save-input').click();
  });
  (_document$getElementB1 = document.getElementById('import-save-input')) === null || _document$getElementB1 === void 0 || _document$getElementB1.addEventListener('change', /*#__PURE__*/function () {
    var _ref = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(e) {
      var file, success;
      return _regenerator().w(function (_context) {
        while (1) switch (_context.n) {
          case 0:
            file = e.target.files[0];
            if (!file) {
              _context.n = 2;
              break;
            }
            _context.n = 1;
            return _Game["default"].importSave(file);
          case 1:
            success = _context.v;
            if (success) {
              showNotification('Save imported! Reloading...', 'success');
              setTimeout(function () {
                return location.reload();
              }, 2000);
            } else {
              showNotification('Failed to import save', 'error');
            }
          case 2:
            return _context.a(2);
        }
      }, _callee);
    }));
    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }());

  // Reset game
  (_document$getElementB10 = document.getElementById('reset-game-btn')) === null || _document$getElementB10 === void 0 || _document$getElementB10.addEventListener('click', function () {
    if (confirm('Are you ABSOLUTELY SURE? This will delete ALL progress!')) {
      if (confirm('Last chance! This cannot be undone!')) {
        _Game["default"].reset();
      }
    }
  });
}

/**
 * Check tutorial
 */
function checkTutorial() {
  var tutorialSystem = _Game["default"].getSystem('tutorial');
  var state = _StateManager["default"].getState();
  if (!state.tutorial.completed && !state.tutorial.skipped) {
    // Tutorial will auto-start via TutorialSystem
  }
}

/**
 * Check offline progress
 */
function checkOfflineProgress() {
  var state = _StateManager["default"].getState();
  if (state.offlineProgress && state.offlineProgress.resources) {
    // Show offline modal
    setTimeout(function () {
      showOfflineModal(state.offlineProgress);
    }, 1500);
  }
}

/**
 * Check daily reward
 */
function checkDailyReward() {
  var dailyRewardSystem = _Game["default"].getSystem('dailyReward');
  var canClaim = dailyRewardSystem.canClaim();
  if (canClaim.can) {
    // Show notification
    showNotification('Daily reward available!', 'info', 5000);

    // Add badge to button
    var btn = document.getElementById('daily-reward-btn');
    if (btn && !btn.querySelector('.badge')) {
      var badge = document.createElement('span');
      badge.className = 'badge';
      badge.textContent = '!';
      btn.appendChild(badge);
    }
  }
}

/**
 * Show offline modal
 */
function showOfflineModal(offlineData) {
  var modal = document.getElementById('offline-modal');
  if (!modal) return;

  // Update content
  document.getElementById('offline-time').textContent = _Formatters["default"].formatTime(offlineData.timeOffline);
  var rewardsEl = document.getElementById('offline-rewards');
  rewardsEl.innerHTML = '';
  for (var _i = 0, _Object$entries = Object.entries(offlineData.resources); _i < _Object$entries.length; _i++) {
    var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
      resource = _Object$entries$_i[0],
      amount = _Object$entries$_i[1];
    if (amount > 0) {
      var div = document.createElement('div');
      div.textContent = _Formatters["default"].formatWithSuffix(amount, resource);
      div.style.fontSize = '1.25rem';
      div.style.fontWeight = '600';
      div.style.marginBottom = 'var(--spacing-sm)';
      rewardsEl.appendChild(div);
    }
  }

  // Show modal
  modal.classList.add('active');

  // Collect button
  document.getElementById('offline-collect-btn').onclick = function () {
    modal.classList.remove('active');
  };
}

/**
 * Update last save time
 */
function updateLastSaveTime() {
  var state = _StateManager["default"].getState();
  var lastSaved = state.lastSaved;
  var element = document.getElementById('last-save-time');
  if (!element) return;
  if (!lastSaved) {
    element.textContent = 'Last saved: Never';
    return;
  }
  var timeSince = Date.now() - lastSaved;
  if (timeSince < 60000) {
    element.textContent = 'Last saved: Just now';
  } else {
    element.textContent = "Last saved: ".concat(_Formatters["default"].formatRelativeTime(lastSaved));
  }
}

/**
 * Show notification (helper)
 */
function showNotification(message) {
  var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'info';
  var duration = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 3000;
  _EventBus["default"].emit('notification:show', {
    message: message,
    type: type,
    duration: duration
  });
}

/**
 * Show error
 */
function showError(message) {
  var loadingScreen = document.getElementById('loading-screen');
  loadingScreen.innerHTML = "\n        <div class=\"loading-content\">\n            <h2 style=\"color: var(--danger);\">\u274C Error</h2>\n            <p>".concat(message, "</p>\n            <button class=\"btn btn-primary\" onclick=\"location.reload()\">\n                Reload Page\n            </button>\n        </div>\n    ");
}

/**
 * Sleep helper
 */
function sleep(ms) {
  return new Promise(function (resolve) {
    return setTimeout(resolve, ms);
  });
}

// Start app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// Make game available globally in debug mode
if (_config["default"].DEBUG_MODE) {
  window.game = _Game["default"];
  window.eventBus = _EventBus["default"];
  window.stateManager = _StateManager["default"];
  window.logger = _Logger["default"];

  // Debug commands
  window.cheat = {
    addEnergy: function addEnergy(amount) {
      _StateManager["default"].dispatch({
        type: 'ADD_RESOURCE',
        payload: {
          resource: 'energy',
          amount: amount
        }
      });
    },
    addGems: function addGems(amount) {
      _StateManager["default"].dispatch({
        type: 'ADD_RESOURCE',
        payload: {
          resource: 'gems',
          amount: amount
        }
      });
    },
    addCrystals: function addCrystals(amount) {
      _StateManager["default"].dispatch({
        type: 'ADD_RESOURCE',
        payload: {
          resource: 'crystals',
          amount: amount
        }
      });
    },
    unlockAll: function unlockAll() {
      // Unlock all features
      console.log('Unlocking all features...');
    },
    ascend: function ascend() {
      var ascensionSystem = _Game["default"].getSystem('ascension');
      ascensionSystem.confirmAscend();
    }
  };
  console.log('%c🎮 Debug Mode Active', 'font-size: 20px; font-weight: bold; color: #10b981;');
  console.log('%cAvailable commands:', 'font-size: 14px; color: #3b82f6;');
  console.log('  window.game - Game instance');
  console.log('  window.stateManager - State manager');
  console.log('  window.eventBus - Event bus');
  console.log('  window.cheat - Cheat commands');
  console.log('    cheat.addEnergy(1000000)');
  console.log('    cheat.addGems(10000)');
  console.log('    cheat.addCrystals(100)');
  console.log('    cheat.ascend()');
}

// ===== MOBILE SWIPE GESTURES (OPȚIONAL) =====
var touchStartX = 0;
var touchEndX = 0;
document.addEventListener('touchstart', function (e) {
  touchStartX = e.changedTouches[0].screenX;
});
document.addEventListener('touchend', function (e) {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
});
function handleSwipe() {
  var diff = touchEndX - touchStartX;
  if (Math.abs(diff) < 50) return; // Minimum swipe distance

  var activeTab = document.querySelector('.tab-btn. active');
  var allTabs = Array.from(document.querySelectorAll('.tab-btn'));
  var currentIndex = allTabs.indexOf(activeTab);
  if (diff < 0 && currentIndex < allTabs.length - 1) {
    // Swipe left - next tab
    allTabs[currentIndex + 1].click();
  } else if (diff > 0 && currentIndex > 0) {
    // Swipe right - previous tab
    allTabs[currentIndex - 1].click();
  }
}
// ===== SFÂRȘIT SWIPE GESTURES =====

// ===== HAPTIC FEEDBACK (OPȚIONAL) =====
function vibrate() {
  var pattern = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 10;
  if (navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}

// Vibrație la click pe buttons
document.addEventListener('click', function (e) {
  if (e.target.closest('.btn') || e.target.closest('.tab-btn')) {
    vibrate(10);
  }
});
// ===== SFÂRȘIT HAPTIC FEEDBACK =====

},{"./config.js":1,"./core/Game.js":3,"./core/StateManager.js":6,"./systems/MiniGameAchievementSystem.js":24,"./systems/NotificationManager.js":25,"./ui/AchievementsUI.js":34,"./ui/AutomationUI.js":35,"./ui/BadgeManager.js":36,"./ui/BossesUI.js":37,"./ui/DailyRewardUI.js":38,"./ui/GuardiansUI.js":39,"./ui/ModalManager.js":41,"./ui/NotificationManager.js":42,"./ui/PuzzleUI.js":43,"./ui/QuestsUI.js":44,"./ui/ShopUI.js":45,"./ui/StatisticsUI.js":46,"./ui/StructuresUI.js":47,"./ui/TabManager.js":48,"./ui/UpgradesUI.js":49,"./ui/components/ResourceDisplay.js":50,"./utils/EventBus.js":56,"./utils/Formatters.js":57,"./utils/Logger.js":58,"./utils/NotificationHelper.js":59}],18:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _achievements = _interopRequireDefault(require("../data/achievements.js"));
var _StateManager = _interopRequireDefault(require("../core/StateManager.js"));
var _EventBus = _interopRequireDefault(require("../utils/EventBus.js"));
var _Logger = _interopRequireDefault(require("../utils/Logger.js"));
var _ResourceManager = _interopRequireDefault(require("../core/ResourceManager.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /**
 * AchievementSystem - Tracks and unlocks achievements
 * OPTIMIZED VERSION with proper state management
 */
var AchievementSystem = /*#__PURE__*/function () {
  function AchievementSystem() {
    _classCallCheck(this, AchievementSystem);
    this.achievements = _achievements["default"];
    this.checkInterval = null;
    this.debugMode = false; // ✅ Toggle pentru logging

    this.initializeState();
    this.subscribeToEvents();
    this.startPeriodicCheck();
    _Logger["default"].info('AchievementSystem', 'Initialized with achievements:', Object.keys(this.achievements).length);
  }

  /**
   * Initialize achievement state
   */
  return _createClass(AchievementSystem, [{
    key: "initializeState",
    value: function initializeState() {
      var state = _StateManager["default"].getState();

      // Verifică dacă avem structura nouă (unlocked/claimed arrays)
      if (!state.achievements.unlocked || !state.achievements.claimed) {
        _Logger["default"].warn('AchievementSystem', 'Legacy achievement structure detected - using new format');
      }
    }

    /**
     * Subscribe to events for instant checking
     */
  }, {
    key: "subscribeToEvents",
    value: function subscribeToEvents() {
      var _this = this;
      // Check achievements on key events
      _EventBus["default"].on('structure:purchased', function () {
        return _this.checkAchievements();
      });
      _EventBus["default"].on('upgrade:purchased', function () {
        return _this.checkAchievements();
      });
      _EventBus["default"].on('upgrade:completed', function () {
        return _this.checkAchievements();
      });
      _EventBus["default"].on('guardian:summoned', function () {
        return _this.checkAchievements();
      });
      _EventBus["default"].on('quest:claimed', function () {
        return _this.checkAchievements();
      });
      _EventBus["default"].on('puzzle:won', function () {
        return _this.checkAchievements();
      });
      _EventBus["default"].on('boss:defeated', function () {
        return _this.checkAchievements();
      });
      _EventBus["default"].on('ascension:completed', function () {
        return _this.checkAchievements();
      });
      _EventBus["default"].on('realm:unlocked', function () {
        return _this.checkAchievements();
      });

      // Special: Patient Upgrader (upgrade took > 1 hour)
      _EventBus["default"].on('upgrade:completed', function (data) {
        var duration = data.duration || 0;
        if (duration >= 3600000) {
          // 1 hour
          _StateManager["default"].dispatch({
            type: 'TRIGGER_ACHIEVEMENT',
            payload: {
              achievementKey: 'patientUpgrader'
            }
          });
        }
      });
    }

    /**
     * Start periodic checking (for time-based achievements)
     */
  }, {
    key: "startPeriodicCheck",
    value: function startPeriodicCheck() {
      var _this2 = this;
      this.checkInterval = _ResourceManager["default"].setInterval(function () {
        _this2.checkAchievements();
      }, 5000, 'AchievementCheck'); // Check every 5 seconds
    }

    /**
     * Check all achievements
     */
  }, {
    key: "checkAchievements",
    value: function checkAchievements() {
      var state = _StateManager["default"].getState();
      var newUnlocks = 0;
      for (var _i = 0, _Object$entries = Object.entries(this.achievements); _i < _Object$entries.length; _i++) {
        var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
          key = _Object$entries$_i[0],
          achievement = _Object$entries$_i[1];
        // ✅ FIX: Folosește getAchievementState pentru verificare corectă
        var achievementState = this.getAchievementState(key);

        // Skip if already unlocked
        if (achievementState !== null && achievementState !== void 0 && achievementState.unlocked) continue;

        // Check condition
        try {
          if (achievement.condition()) {
            this.unlockAchievement(key);
            newUnlocks++;
          }
        } catch (error) {
          _Logger["default"].error('AchievementSystem', "Error checking ".concat(key, ":"), error);
        }
      }
      if (newUnlocks > 0) {
        _Logger["default"].info('AchievementSystem', "Unlocked ".concat(newUnlocks, " new achievements"));
      }
    }

    /**
     * Unlock an achievement
     */
  }, {
    key: "unlockAchievement",
    value: function unlockAchievement(achievementKey) {
      var achievement = this.achievements[achievementKey];
      if (!achievement) {
        _Logger["default"].error('AchievementSystem', "Achievement ".concat(achievementKey, " not found"));
        return;
      }

      // ✅ FIX: Dispatch cu 'id' în loc de 'achievementKey'
      _StateManager["default"].dispatch({
        type: 'UNLOCK_ACHIEVEMENT',
        payload: {
          id: achievementKey
        }
      });
      _Logger["default"].info('AchievementSystem', "\u2705 Unlocked: ".concat(achievement.name));

      // Show notification
      this.showUnlockNotification(achievementKey, achievement);

      // Emit event
      _EventBus["default"].emit('achievement:unlocked', {
        achievementKey: achievementKey,
        achievement: achievement
      });
    }

    /**
     * Show unlock notification
     */
  }, {
    key: "showUnlockNotification",
    value: function showUnlockNotification(key, achievement) {
      var notification = {
        type: 'achievement',
        title: '🏆 Achievement Unlocked!',
        message: "".concat(achievement.emoji, " ").concat(achievement.name),
        description: achievement.description,
        duration: 5000
      };
      _EventBus["default"].emit('notification:show', notification);
    }

    /**
     * ✅ FIXED: Claim achievement rewards
     */
  }, {
    key: "claim",
    value: function claim(achievementKey) {
      if (this.debugMode) {
        _Logger["default"].info('AchievementSystem', '🎯 Attempting to claim:', achievementKey);
      }
      var state = this.getAchievementState(achievementKey);
      var achievement = this.achievements[achievementKey];
      if (!achievement) {
        _Logger["default"].error('AchievementSystem', "\u274C Achievement ".concat(achievementKey, " not found"));
        return false;
      }

      // ✅ Validations
      if (!state.unlocked) {
        _Logger["default"].warn('AchievementSystem', "\u274C Achievement ".concat(achievementKey, " not unlocked"));
        _EventBus["default"].emit('notification:show', {
          type: 'error',
          message: 'Achievement not unlocked yet!',
          duration: 2000
        });
        return false;
      }
      if (state.claimed) {
        _Logger["default"].warn('AchievementSystem', "\u26A0\uFE0F Achievement ".concat(achievementKey, " already claimed"));
        _EventBus["default"].emit('notification:show', {
          type: 'warning',
          message: 'Already claimed!',
          duration: 2000
        });
        return false;
      }

      // ✅ Give rewards
      var rewards = achievement.reward;
      if (this.debugMode) {
        _Logger["default"].info('AchievementSystem', '✅ Granting rewards:', rewards);
      }
      for (var _i2 = 0, _Object$entries2 = Object.entries(rewards); _i2 < _Object$entries2.length; _i2++) {
        var _Object$entries2$_i = _slicedToArray(_Object$entries2[_i2], 2),
          resource = _Object$entries2$_i[0],
          amount = _Object$entries2$_i[1];
        _StateManager["default"].dispatch({
          type: 'ADD_RESOURCE',
          payload: {
            resource: resource,
            amount: amount
          }
        });

        // Track gem earnings
        if (resource === 'gems') {
          _StateManager["default"].dispatch({
            type: 'INCREMENT_STATISTIC',
            payload: {
              key: 'gemsEarned',
              amount: amount
            }
          });
        }
      }

      // ✅ Mark as claimed (folosește 'id' nu 'achievementKey')
      _StateManager["default"].dispatch({
        type: 'CLAIM_ACHIEVEMENT',
        payload: {
          id: achievementKey
        }
      });
      _Logger["default"].info('AchievementSystem', "\u2705 Claimed ".concat(achievement.name, ":"), rewards);

      // ✅ Show success notification
      var rewardText = Object.entries(rewards).map(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
          r = _ref2[0],
          a = _ref2[1];
        var icons = {
          gems: '💎',
          crystals: '💠',
          energy: '⚡',
          timeShards: '⏰'
        };
        return "".concat(a, " ").concat(icons[r] || r);
      }).join(', ');
      _EventBus["default"].emit('notification:show', {
        type: 'success',
        title: "\uD83C\uDFC6 ".concat(achievement.name),
        message: "Claimed: ".concat(rewardText),
        duration: 4000
      });

      // Emit event
      _EventBus["default"].emit('achievement:claimed', {
        achievementKey: achievementKey,
        rewards: rewards
      });
      return true;
    }

    /**
     * ✅ FIXED: Get achievement state from new structure
     */
  }, {
    key: "getAchievementState",
    value: function getAchievementState(achievementKey) {
      var _state$achievements$u, _state$achievements$c;
      var state = _StateManager["default"].getState();
      if (!state.achievements) {
        return {
          unlocked: false,
          claimed: false
        };
      }

      // ✅ Check în unlocked/claimed arrays
      var isUnlocked = ((_state$achievements$u = state.achievements.unlocked) === null || _state$achievements$u === void 0 ? void 0 : _state$achievements$u.includes(achievementKey)) || false;
      var isClaimed = ((_state$achievements$c = state.achievements.claimed) === null || _state$achievements$c === void 0 ? void 0 : _state$achievements$c.includes(achievementKey)) || false;

      // ✅ Doar debug logging, nu spam
      if (this.debugMode) {
        _Logger["default"].debug('AchievementSystem', "getState(".concat(achievementKey, "):"), {
          unlocked: isUnlocked,
          claimed: isClaimed
        });
      }
      return {
        unlocked: isUnlocked,
        claimed: isClaimed
      };
    }

    /**
     * Get all achievements by category
     */
  }, {
    key: "getByCategory",
    value: function getByCategory() {
      var category = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      if (!category) {
        return this.achievements;
      }
      return Object.entries(this.achievements).filter(function (_ref3) {
        var _ref4 = _slicedToArray(_ref3, 2),
          key = _ref4[0],
          data = _ref4[1];
        return data.category === category;
      }).reduce(function (obj, _ref5) {
        var _ref6 = _slicedToArray(_ref5, 2),
          key = _ref6[0],
          data = _ref6[1];
        obj[key] = data;
        return obj;
      }, {});
    }

    /**
     * ✅ FIXED: Get achievement progress
     */
  }, {
    key: "getProgress",
    value: function getProgress() {
      var _state$achievements, _state$achievements2;
      var state = _StateManager["default"].getState();
      var total = Object.keys(this.achievements).length;
      var unlocked = ((_state$achievements = state.achievements) === null || _state$achievements === void 0 || (_state$achievements = _state$achievements.unlocked) === null || _state$achievements === void 0 ? void 0 : _state$achievements.length) || 0;
      var claimed = ((_state$achievements2 = state.achievements) === null || _state$achievements2 === void 0 || (_state$achievements2 = _state$achievements2.claimed) === null || _state$achievements2 === void 0 ? void 0 : _state$achievements2.length) || 0;
      return {
        total: total,
        unlocked: unlocked,
        claimed: claimed,
        percentageUnlocked: total > 0 ? unlocked / total * 100 : 0,
        percentageClaimed: total > 0 ? claimed / total * 100 : 0
      };
    }

    /**
     * ✅ FIXED: Get unclaimed achievements count
     */
  }, {
    key: "getUnclaimedCount",
    value: function getUnclaimedCount() {
      var _state$achievements3, _state$achievements4;
      var state = _StateManager["default"].getState();
      var unlocked = ((_state$achievements3 = state.achievements) === null || _state$achievements3 === void 0 ? void 0 : _state$achievements3.unlocked) || [];
      var claimed = ((_state$achievements4 = state.achievements) === null || _state$achievements4 === void 0 ? void 0 : _state$achievements4.claimed) || [];

      // Unclaimed = unlocked dar nu claimed
      var unclaimed = unlocked.filter(function (key) {
        return !claimed.includes(key);
      });
      return unclaimed.length;
    }

    /**
     * Get stats by tier
     */
  }, {
    key: "getStatsByTier",
    value: function getStatsByTier() {
      var state = _StateManager["default"].getState();
      var stats = {
        bronze: {
          total: 0,
          unlocked: 0
        },
        silver: {
          total: 0,
          unlocked: 0
        },
        gold: {
          total: 0,
          unlocked: 0
        },
        platinum: {
          total: 0,
          unlocked: 0
        },
        diamond: {
          total: 0,
          unlocked: 0
        }
      };
      for (var _i3 = 0, _Object$entries3 = Object.entries(this.achievements); _i3 < _Object$entries3.length; _i3++) {
        var _Object$entries3$_i = _slicedToArray(_Object$entries3[_i3], 2),
          key = _Object$entries3$_i[0],
          achievement = _Object$entries3$_i[1];
        var tier = achievement.tier;
        if (stats[tier]) {
          stats[tier].total++;
          var achievementState = this.getAchievementState(key);
          if (achievementState.unlocked) {
            stats[tier].unlocked++;
          }
        }
      }
      return stats;
    }

    /**
     * ✅ FIXED: Get recently unlocked achievements
     */
  }, {
    key: "getRecentlyUnlocked",
    value: function getRecentlyUnlocked() {
      var _state$achievements5;
      var count = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 5;
      var state = _StateManager["default"].getState();
      var unlocked = [];

      // Get all unlocked achievement keys
      var unlockedKeys = ((_state$achievements5 = state.achievements) === null || _state$achievements5 === void 0 ? void 0 : _state$achievements5.unlocked) || [];
      var _iterator = _createForOfIteratorHelper(unlockedKeys),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var key = _step.value;
          var achievement = this.achievements[key];
          if (achievement) {
            unlocked.push({
              key: key,
              achievement: achievement,
              unlockedAt: Date.now() // Would need timestamp tracking
            });
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      return unlocked.slice(0, count);
    }

    /**
     * Check if should show hint for close achievements
     */
  }, {
    key: "getCloseAchievements",
    value: function getCloseAchievements() {
      var hints = [];

      // This would check achievements that are almost complete
      // For example: "You're 80% done with Energy Collector!"

      // To be implemented based on specific achievement types

      return hints;
    }

    /**
     * ✅ Enable/disable debug logging
     */
  }, {
    key: "setDebugMode",
    value: function setDebugMode(enabled) {
      this.debugMode = enabled;
      _Logger["default"].info('AchievementSystem', "Debug mode: ".concat(enabled ? 'ON' : 'OFF'));
    }
  }]);
}(); // Singleton
var achievementSystem = new AchievementSystem();

// ✅ Make claim globally accessible
window.claimAchievement = function (achievementKey) {
  return achievementSystem.claim(achievementKey);
};
var _default = exports["default"] = achievementSystem;

},{"../core/ResourceManager.js":4,"../core/StateManager.js":6,"../data/achievements.js":8,"../utils/EventBus.js":56,"../utils/Logger.js":58}],19:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _config = _interopRequireDefault(require("../config.js"));
var _StateManager = _interopRequireDefault(require("../core/StateManager.js"));
var _EventBus = _interopRequireDefault(require("../utils/EventBus.js"));
var _Logger = _interopRequireDefault(require("../utils/Logger.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /**
 * AscensionSystem - Prestige/Ascension mechanic
 */
var AscensionSystem = /*#__PURE__*/function () {
  function AscensionSystem() {
    _classCallCheck(this, AscensionSystem);
    this.minEnergy = _config["default"].BALANCING.ASCENSION_MIN_ENERGY;
    this.crystalFormula = _config["default"].BALANCING.ASCENSION_CRYSTAL_FORMULA;
    this.productionBonus = _config["default"].BALANCING.ASCENSION_PRODUCTION_BONUS;
    this.capacityBonus = _config["default"].BALANCING.ASCENSION_CAPACITY_BONUS;
    _Logger["default"].info('AscensionSystem', 'Initialized');
  }

  /**
   * Check if can ascend
   */
  return _createClass(AscensionSystem, [{
    key: "canAscend",
    value: function canAscend() {
      var state = _StateManager["default"].getState();
      var lifetimeEnergy = state.ascension.lifetimeEnergy;
      if (lifetimeEnergy < this.minEnergy) {
        return {
          can: false,
          reason: 'insufficient-energy',
          required: this.minEnergy,
          current: lifetimeEnergy,
          remaining: this.minEnergy - lifetimeEnergy
        };
      }
      return {
        can: true
      };
    }

    /**
     * Calculate crystals earned from ascension
     */
  }, {
    key: "calculateCrystalsEarned",
    value: function calculateCrystalsEarned() {
      var state = _StateManager["default"].getState();
      var lifetimeEnergy = state.ascension.lifetimeEnergy;
      return this.crystalFormula(lifetimeEnergy);
    }

    /**
     * Get ascension preview (what will happen)
     */
  }, {
    key: "getAscensionPreview",
    value: function getAscensionPreview() {
      var state = _StateManager["default"].getState();
      var crystalsEarned = this.calculateCrystalsEarned();
      var newLevel = state.ascension.level + 1;
      return {
        currentLevel: state.ascension.level,
        newLevel: newLevel,
        crystalsEarned: crystalsEarned,
        totalCrystals: state.resources.crystals + crystalsEarned,
        bonuses: {
          production: {
            current: 1 + state.ascension.level * this.productionBonus,
            "new": 1 + newLevel * this.productionBonus,
            increase: this.productionBonus
          },
          capacity: {
            current: 1 + state.ascension.level * this.capacityBonus,
            "new": 1 + newLevel * this.capacityBonus,
            increase: this.capacityBonus
          }
        },
        willLose: {
          energy: state.resources.energy,
          mana: state.resources.mana,
          volcanicEnergy: state.resources.volcanicEnergy,
          structures: this.getStructuresSummary(),
          upgrades: this.getUpgradesSummary()
        },
        willKeep: {
          gems: state.resources.gems,
          crystals: state.resources.crystals + crystalsEarned,
          guardians: state.guardians.length,
          achievements: this.getUnlockedAchievementsCount(),
          realms: state.realms.unlocked.length,
          bossProgress: this.getBossProgress()
        }
      };
    }

    /**
     * Perform ascension
     */
  }, {
    key: "ascend",
    value: function ascend() {
      var canAscend = this.canAscend();
      if (!canAscend.can) {
        _Logger["default"].warn('AscensionSystem', 'Cannot ascend:', canAscend.reason);
        _EventBus["default"].emit('ascension:failed', canAscend);
        return false;
      }
      var state = _StateManager["default"].getState();
      var crystalsEarned = this.calculateCrystalsEarned();
      var preview = this.getAscensionPreview();

      // Confirm with player (UI will handle this)
      _EventBus["default"].emit('ascension:confirm-required', {
        preview: preview
      });

      // Actual ascension will be triggered by confirmAscend()
      return true;
    }

    /**
     * Confirm and execute ascension
     */
  }, {
    key: "confirmAscend",
    value: function confirmAscend() {
      // ===== ADAUGĂ: Save current resources for Quick Start =====
      var stateBefore = _StateManager["default"].getState();
      var previousResources = {
        energy: stateBefore.resources.energy,
        mana: stateBefore.resources.mana,
        volcanicEnergy: stateBefore.resources.volcanicEnergy
      };
      // ===== SFÂRȘIT ADĂUGARE =====

      var crystalsEarned = this.calculateCrystalsEarned();

      // Dispatch ascension action
      _StateManager["default"].dispatch({
        type: 'ASCEND',
        payload: {
          crystalsEarned: crystalsEarned,
          previousResources: previousResources
        }
      });
      var state = _StateManager["default"].getState();
      _Logger["default"].info('AscensionSystem', "Ascended to level ".concat(state.ascension.level, "! Earned ").concat(crystalsEarned, " crystals"));

      // Apply quick start bonus if upgrade exists
      this.applyQuickStart(previousResources);

      // Recalculate everything
      _EventBus["default"].emit('ascension:completed', {
        level: state.ascension.level,
        crystalsEarned: crystalsEarned
      });

      // Show celebration
      _EventBus["default"].emit('notification:show', {
        type: 'ascension',
        title: 'ASCENSION!',
        message: "Level ".concat(state.ascension.level),
        description: "Earned ".concat(crystalsEarned, " \uD83D\uDCA0 crystals!"),
        duration: 10000
      });
      return true;
    }

    /**
    * Apply quick start bonus (from upgrades)
    */
  }, {
    key: "applyQuickStart",
    value: function applyQuickStart() {
      var previousResources = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var upgradeSystem = require('./UpgradeSystem.js')["default"];
      var quickStartLevel = upgradeSystem.getLevel('quickStart');
      if (quickStartLevel === 0) return;
      var quickStartPercent = upgradeSystem.getEffect('quickStart');

      // ✅ Acum folosim resursele reale din run-ul anterior
      if (previousResources) {
        var energyBonus = Math.floor(previousResources.energy * quickStartPercent);
        var manaBonus = Math.floor(previousResources.mana * quickStartPercent);
        var volcanicBonus = Math.floor(previousResources.volcanicEnergy * quickStartPercent);
        if (energyBonus > 0) {
          _StateManager["default"].dispatch({
            type: 'ADD_RESOURCE',
            payload: {
              resource: 'energy',
              amount: energyBonus
            }
          });
        }
        if (manaBonus > 0) {
          _StateManager["default"].dispatch({
            type: 'ADD_RESOURCE',
            payload: {
              resource: 'mana',
              amount: manaBonus
            }
          });
        }
        if (volcanicBonus > 0) {
          _StateManager["default"].dispatch({
            type: 'ADD_RESOURCE',
            payload: {
              resource: 'volcanicEnergy',
              amount: volcanicBonus
            }
          });
        }
        _Logger["default"].info('AscensionSystem', "\uD83D\uDE80 Quick Start bonus: +".concat(energyBonus, " energy, +").concat(manaBonus, " mana, +").concat(volcanicBonus, " volcanic"));
      }
    }

    /**
     * Get production multiplier from ascension
     */
  }, {
    key: "getProductionMultiplier",
    value: function getProductionMultiplier() {
      var state = _StateManager["default"].getState();
      return 1 + state.ascension.level * this.productionBonus;
    }

    /**
     * Get capacity multiplier from ascension
     */
  }, {
    key: "getCapacityMultiplier",
    value: function getCapacityMultiplier() {
      var state = _StateManager["default"].getState();
      return 1 + state.ascension.level * this.capacityBonus;
    }

    /**
     * Get ascension stats
     */
  }, {
    key: "getStats",
    value: function getStats() {
      var state = _StateManager["default"].getState();
      return {
        level: state.ascension.level,
        totalAscensions: state.ascension.totalAscensions,
        lifetimeEnergy: state.ascension.lifetimeEnergy,
        canAscend: this.canAscend().can,
        nextAscensionAt: this.minEnergy,
        crystalsOnAscend: this.calculateCrystalsEarned(),
        productionBonus: this.getProductionMultiplier(),
        capacityBonus: this.getCapacityMultiplier()
      };
    }

    /**
     * Helper: Get structures summary
     */
  }, {
    key: "getStructuresSummary",
    value: function getStructuresSummary() {
      var state = _StateManager["default"].getState();
      var total = 0;
      for (var _i = 0, _Object$values = Object.values(state.structures); _i < _Object$values.length; _i++) {
        var structure = _Object$values[_i];
        total += structure.level || 0;
      }
      return total;
    }

    /**
     * Helper: Get upgrades summary
     */
  }, {
    key: "getUpgradesSummary",
    value: function getUpgradesSummary() {
      var state = _StateManager["default"].getState();
      var total = 0;
      for (var _i2 = 0, _Object$values2 = Object.values(state.upgrades); _i2 < _Object$values2.length; _i2++) {
        var upgrade = _Object$values2[_i2];
        total += upgrade.level || 0;
      }
      return total;
    }

    /**
     * Helper: Get unlocked achievements count
     */
  }, {
    key: "getUnlockedAchievementsCount",
    value: function getUnlockedAchievementsCount() {
      var state = _StateManager["default"].getState();
      var count = 0;
      for (var _i3 = 0, _Object$values3 = Object.values(state.achievements); _i3 < _Object$values3.length; _i3++) {
        var achievement = _Object$values3[_i3];
        if (achievement.unlocked) count++;
      }
      return count;
    }

    /**
     * Helper: Get boss progress
     */
  }, {
    key: "getBossProgress",
    value: function getBossProgress() {
      var state = _StateManager["default"].getState();
      var defeated = 0;
      for (var _i4 = 0, _Object$values4 = Object.values(state.bosses); _i4 < _Object$values4.length; _i4++) {
        var boss = _Object$values4[_i4];
        if (boss.defeated) defeated++;
      }
      return defeated;
    }

    /**
     * Get next milestone info
     */
  }, {
    key: "getNextMilestone",
    value: function getNextMilestone() {
      var state = _StateManager["default"].getState();
      var currentLevel = state.ascension.level;
      var milestones = [{
        level: 1,
        reward: 'Unlock Volcano Realm'
      }, {
        level: 3,
        reward: 'Unlock Ocean Realm'
      }, {
        level: 5,
        reward: 'Unlock Cosmic Realm, Boss 3'
      }, {
        level: 10,
        reward: 'Special Achievement'
      }];
      return milestones.find(function (m) {
        return m.level > currentLevel;
      }) || null;
    }
  }]);
}(); // Singleton
var ascensionSystem = new AscensionSystem();
var _default = exports["default"] = ascensionSystem;

},{"../config.js":1,"../core/StateManager.js":6,"../utils/EventBus.js":56,"../utils/Logger.js":58,"./UpgradeSystem.js":33}],20:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _StateManager = _interopRequireDefault(require("../core/StateManager.js"));
var _EventBus = _interopRequireDefault(require("../utils/EventBus.js"));
var _Logger = _interopRequireDefault(require("../utils/Logger.js"));
var _ResourceManager = _interopRequireDefault(require("../core/ResourceManager.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /**
 * AutomationSystem - Auto-buy, auto-claim, auto-play features
 */
var AutomationSystem = /*#__PURE__*/function () {
  function AutomationSystem() {
    _classCallCheck(this, AutomationSystem);
    this.features = {
      autoBuyStructures: {
        name: 'Auto-Buy Structures',
        description: 'Automatically purchase structures when affordable',
        cost: 500,
        // gems
        unlocked: false,
        enabled: false
      },
      autoClaimQuests: {
        name: 'Auto-Claim Quests',
        description: 'Automatically claim completed quests',
        cost: 300,
        unlocked: false,
        enabled: false
      },
      autoPuzzle: {
        name: 'Auto-Puzzle',
        description: 'Automatically play puzzle games',
        cost: 1000,
        unlocked: false,
        enabled: false
      },
      autoUpgrade: {
        name: 'Auto-Upgrade',
        description: 'Automatically queue upgrades',
        cost: 750,
        unlocked: false,
        enabled: false
      },
      autoSummon: {
        name: 'Auto-Summon',
        description: 'Automatically summon guardians',
        cost: 2000,
        unlocked: false,
        enabled: false
      }
    };
    this.initializeState();
    this.subscribeToEvents();
    this.startAutomationLoop();
    _Logger["default"].info('AutomationSystem', 'Initialized');
  }

  /**
   * Initialize automation state
   */
  return _createClass(AutomationSystem, [{
    key: "initializeState",
    value: function initializeState() {
      var state = _StateManager["default"].getState();
      if (!state.automation) {
        // Initialize in StateManager getInitialState
      }

      // Load unlocked features from state
      for (var _i = 0, _Object$entries = Object.entries(this.features); _i < _Object$entries.length; _i++) {
        var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
          key = _Object$entries$_i[0],
          feature = _Object$entries$_i[1];
        var stateFeature = state.automation[key];
        if (stateFeature) {
          feature.unlocked = stateFeature.unlocked || false;
          feature.enabled = stateFeature.enabled || false;
        }
      }
    }

    /**
     * Subscribe to events
     */
  }, {
    key: "subscribeToEvents",
    value: function subscribeToEvents() {
      var _this = this;
      // When quests complete, check auto-claim
      _EventBus["default"].on('quest:completed', function () {
        if (_this.isEnabled('autoClaimQuests')) {
          _this.autoClaimQuests();
        }
      });

      // When resources change, check auto-buy
      _EventBus["default"].on('state:ADD_RESOURCE', function () {
        if (_this.isEnabled('autoBuyStructures')) {
          // Debounce auto-buy (don't trigger on every resource tick)
          if (!_this.autoBuyDebounce) {
            _this.autoBuyDebounce = true;
            setTimeout(function () {
              _this.autoBuyStructures();
              _this.autoBuyDebounce = false;
            }, 1000);
          }
        }
      });
    }

    /**
     * Start automation loop
     */
  }, {
    key: "startAutomationLoop",
    value: function startAutomationLoop() {
      var _this2 = this;
      this.automationInterval = _ResourceManager["default"].setInterval(function () {
        _this2.tick();
      }, 5000, 'AutomationLoop'); // Every 5 seconds
    }

    /**
     * Automation tick
     */
  }, {
    key: "tick",
    value: function tick() {
      if (this.isEnabled('autoBuyStructures')) {
        this.autoBuyStructures();
      }
      if (this.isEnabled('autoUpgrade')) {
        this.autoQueueUpgrades();
      }
      if (this.isEnabled('autoSummon')) {
        this.autoSummonGuardians();
      }
      if (this.isEnabled('autoPuzzle')) {
        this.autoPuzzlePlay();
      }
    }

    /**
     * Check if feature is enabled
     */
  }, {
    key: "isEnabled",
    value: function isEnabled(featureKey) {
      var state = _StateManager["default"].getState();
      var feature = state.automation[featureKey];
      return (feature === null || feature === void 0 ? void 0 : feature.unlocked) && (feature === null || feature === void 0 ? void 0 : feature.enabled);
    }

    /**
     * Unlock a feature
     */
  }, {
    key: "unlock",
    value: function unlock(featureKey) {
      var _state$automation$fea;
      var feature = this.features[featureKey];
      if (!feature) {
        _Logger["default"].error('AutomationSystem', "Feature ".concat(featureKey, " not found"));
        return false;
      }
      var state = _StateManager["default"].getState();

      // Check if already unlocked
      if ((_state$automation$fea = state.automation[featureKey]) !== null && _state$automation$fea !== void 0 && _state$automation$fea.unlocked) {
        _Logger["default"].warn('AutomationSystem', "".concat(feature.name, " already unlocked"));
        return false;
      }

      // Check cost
      if (state.resources.gems < feature.cost) {
        _Logger["default"].warn('AutomationSystem', "Not enough gems for ".concat(feature.name, " (need ").concat(feature.cost, ")"));
        _EventBus["default"].emit('automation:unlock-failed', {
          featureKey: featureKey,
          reason: 'insufficient-gems',
          cost: feature.cost
        });
        return false;
      }

      // Deduct cost
      _StateManager["default"].dispatch({
        type: 'REMOVE_RESOURCE',
        payload: {
          resource: 'gems',
          amount: feature.cost
        }
      });

      // Track spending
      _StateManager["default"].dispatch({
        type: 'INCREMENT_STATISTIC',
        payload: {
          key: 'gemsSpent',
          amount: feature.cost
        }
      });

      // Unlock feature
      _StateManager["default"].dispatch({
        type: 'UNLOCK_AUTOMATION',
        payload: {
          featureKey: featureKey
        }
      });
      _Logger["default"].info('AutomationSystem', "Unlocked: ".concat(feature.name));
      _EventBus["default"].emit('automation:unlocked', {
        featureKey: featureKey,
        feature: feature
      });

      // Show notification
      _EventBus["default"].emit('notification:show', {
        type: 'automation',
        title: 'Automation Unlocked!',
        message: "\uD83E\uDD16 ".concat(feature.name),
        description: feature.description,
        duration: 5000
      });
      return true;
    }

    /**
     * Toggle feature on/off
     */
  }, {
    key: "toggle",
    value: function toggle(featureKey) {
      var state = _StateManager["default"].getState();
      var feature = state.automation[featureKey];
      if (!(feature !== null && feature !== void 0 && feature.unlocked)) {
        _Logger["default"].warn('AutomationSystem', "".concat(featureKey, " not unlocked"));
        return false;
      }
      var newState = !feature.enabled;
      _StateManager["default"].dispatch({
        type: 'TOGGLE_AUTOMATION',
        payload: {
          featureKey: featureKey,
          enabled: newState
        }
      });
      _Logger["default"].info('AutomationSystem', "".concat(featureKey, " ").concat(newState ? 'enabled' : 'disabled'));
      _EventBus["default"].emit('automation:toggled', {
        featureKey: featureKey,
        enabled: newState
      });
      return true;
    }

    /**
     * Auto-buy structures
     */
  }, {
    key: "autoBuyStructures",
    value: function autoBuyStructures() {
      var state = _StateManager["default"].getState();
      var structureSystem = require('./StructureSystem.js')["default"];
      var threshold = state.automation.autoBuyThreshold || 0.8; // 80% of cost

      // Get all affordable structures
      var currentRealm = state.realms.current;
      var structures = structureSystem.getStructuresForRealm(currentRealm);
      var purchasesMade = 0;
      for (var _i2 = 0, _Object$entries2 = Object.entries(structures); _i2 < _Object$entries2.length; _i2++) {
        var _Object$entries2$_i = _slicedToArray(_Object$entries2[_i2], 2),
          key = _Object$entries2$_i[0],
          structureData = _Object$entries2$_i[1];
        if (!structureSystem.isUnlocked(key)) continue;
        var cost = structureSystem.getCost(key);
        var canAfford = state.resources.energy >= cost * threshold;
        if (canAfford) {
          var success = structureSystem.buy(key);
          if (success) {
            purchasesMade++;
          }
        }
      }
      if (purchasesMade > 0) {
        _Logger["default"].debug('AutomationSystem', "Auto-bought ".concat(purchasesMade, " structures"));
      }
    }

    /**
     * Auto-claim quests
     */
  }, {
    key: "autoClaimQuests",
    value: function autoClaimQuests() {
      var questSystem = require('./QuestSystem.js')["default"];
      var activeQuests = questSystem.getActiveQuests();
      var claimedCount = 0;
      var _iterator = _createForOfIteratorHelper(activeQuests),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var quest = _step.value;
          if (quest.completed) {
            var success = questSystem.claim(quest.id);
            if (success) {
              claimedCount++;
            }
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      if (claimedCount > 0) {
        _Logger["default"].info('AutomationSystem', "Auto-claimed ".concat(claimedCount, " quests"));
      }
    }

    /**
     * Auto-queue upgrades
     */
  }, {
    key: "autoQueueUpgrades",
    value: function autoQueueUpgrades() {
      var state = _StateManager["default"].getState();
      var upgradeSystem = require('./UpgradeSystem.js')["default"];
      var upgradeQueueSystem = require('./UpgradeQueueSystem.js')["default"];

      // Check if queue has space
      var queueInfo = upgradeQueueSystem.getQueueInfo();
      if (queueInfo.queue.length >= queueInfo.slots) {
        return; // Queue full
      }

      // Get recommended upgrades
      var recommended = upgradeSystem.getRecommendedUpgrades(3);
      var _iterator2 = _createForOfIteratorHelper(recommended),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var rec = _step2.value;
          if (queueInfo.queue.length >= queueInfo.slots) break;

          // Try to buy/queue
          var success = upgradeSystem.buy(rec.key);
          if (success) {
            _Logger["default"].debug('AutomationSystem', "Auto-queued upgrade: ".concat(rec.key));
          }
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    }

    /**
     * Auto-summon guardians
     */
  }, {
    key: "autoSummonGuardians",
    value: function autoSummonGuardians() {
      var state = _StateManager["default"].getState();
      var guardianSystem = require('./GuardianSystem.js')["default"];

      // Check gem threshold (only summon if >= 1000 gems)
      var gemThreshold = state.automation.autoSummonThreshold || 1000;
      if (state.resources.gems >= gemThreshold) {
        var success = guardianSystem.summon();
        if (success) {
          _Logger["default"].info('AutomationSystem', 'Auto-summoned guardian');
        }
      }
    }

    /**
     * Auto-play puzzle
     */
  }, {
    key: "autoPuzzlePlay",
    value: function autoPuzzlePlay() {
      var state = _StateManager["default"].getState();

      // Check if puzzle is available and not in boss battle
      if (state.currentBoss) {
        return; // Don't auto-play during boss battles
      }

      // Check gem cost (auto-puzzle costs gems)
      var cost = 50; // 50 gems per auto-puzzle

      if (state.resources.gems < cost) {
        return;
      }

      // Simulate puzzle play
      // In real implementation, this would use AI or random moves
      var simulatedScore = Math.floor(Math.random() * 1000) + 500;

      // Deduct cost
      _StateManager["default"].dispatch({
        type: 'REMOVE_RESOURCE',
        payload: {
          resource: 'gems',
          amount: cost
        }
      });

      // Give puzzle reward based on score
      var gemReward = Math.floor(simulatedScore / 50);
      var energyReward = simulatedScore * 5;
      _StateManager["default"].dispatch({
        type: 'ADD_RESOURCE',
        payload: {
          resource: 'gems',
          amount: gemReward
        }
      });
      _StateManager["default"].dispatch({
        type: 'ADD_RESOURCE',
        payload: {
          resource: 'energy',
          amount: energyReward
        }
      });
      _Logger["default"].debug('AutomationSystem', "Auto-puzzle: score ".concat(simulatedScore, ", earned ").concat(gemReward, " gems"));
    }

    /**
     * Set auto-buy threshold
     */
  }, {
    key: "setAutoBuyThreshold",
    value: function setAutoBuyThreshold(threshold) {
      if (threshold < 0.5 || threshold > 1) {
        _Logger["default"].warn('AutomationSystem', "Invalid threshold: ".concat(threshold, " (must be 0.5-1.0)"));
        return false;
      }
      _StateManager["default"].dispatch({
        type: 'SET_AUTO_BUY_THRESHOLD',
        payload: {
          threshold: threshold
        }
      });
      _Logger["default"].info('AutomationSystem', "Auto-buy threshold set to ".concat(threshold * 100, "%"));
      return true;
    }

    /**
     * Set auto-summon threshold
     */
  }, {
    key: "setAutoSummonThreshold",
    value: function setAutoSummonThreshold(gemAmount) {
      if (gemAmount < 100) {
        _Logger["default"].warn('AutomationSystem', 'Gem threshold too low (min 100)');
        return false;
      }
      _StateManager["default"].dispatch({
        type: 'SET_AUTO_SUMMON_THRESHOLD',
        payload: {
          threshold: gemAmount
        }
      });
      _Logger["default"].info('AutomationSystem', "Auto-summon threshold set to ".concat(gemAmount, " gems"));
      return true;
    }

    /**
     * Get automation stats
     */
  }, {
    key: "getStats",
    value: function getStats() {
      var state = _StateManager["default"].getState();
      var stats = {
        totalUnlocked: 0,
        totalEnabled: 0,
        features: {}
      };
      for (var _i3 = 0, _Object$entries3 = Object.entries(this.features); _i3 < _Object$entries3.length; _i3++) {
        var _Object$entries3$_i = _slicedToArray(_Object$entries3[_i3], 2),
          key = _Object$entries3$_i[0],
          feature = _Object$entries3$_i[1];
        var stateFeature = state.automation[key];
        if (stateFeature !== null && stateFeature !== void 0 && stateFeature.unlocked) stats.totalUnlocked++;
        if (stateFeature !== null && stateFeature !== void 0 && stateFeature.enabled) stats.totalEnabled++;
        stats.features[key] = _objectSpread(_objectSpread({}, feature), {}, {
          unlocked: (stateFeature === null || stateFeature === void 0 ? void 0 : stateFeature.unlocked) || false,
          enabled: (stateFeature === null || stateFeature === void 0 ? void 0 : stateFeature.enabled) || false
        });
      }
      return stats;
    }

    /**
     * Get unlockable features
     */
  }, {
    key: "getUnlockableFeatures",
    value: function getUnlockableFeatures() {
      var state = _StateManager["default"].getState();
      var unlockable = [];
      for (var _i4 = 0, _Object$entries4 = Object.entries(this.features); _i4 < _Object$entries4.length; _i4++) {
        var _Object$entries4$_i = _slicedToArray(_Object$entries4[_i4], 2),
          key = _Object$entries4$_i[0],
          feature = _Object$entries4$_i[1];
        var stateFeature = state.automation[key];
        if (!(stateFeature !== null && stateFeature !== void 0 && stateFeature.unlocked)) {
          unlockable.push(_objectSpread(_objectSpread({
            key: key
          }, feature), {}, {
            canAfford: state.resources.gems >= feature.cost
          }));
        }
      }
      return unlockable;
    }
  }]);
}(); // Singleton
var automationSystem = new AutomationSystem();
var _default = exports["default"] = automationSystem;

},{"../core/ResourceManager.js":4,"../core/StateManager.js":6,"../utils/EventBus.js":56,"../utils/Logger.js":58,"./GuardianSystem.js":23,"./QuestSystem.js":26,"./StructureSystem.js":30,"./UpgradeQueueSystem.js":32,"./UpgradeSystem.js":33}],21:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _bosses = _interopRequireDefault(require("../data/bosses.js"));
var _StateManager = _interopRequireDefault(require("../core/StateManager.js"));
var _EventBus = _interopRequireDefault(require("../utils/EventBus.js"));
var _Logger = _interopRequireDefault(require("../utils/Logger.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /**
 * BossSystem - Manages boss encounters and battles
 */
var BossSystem = /*#__PURE__*/function () {
  function BossSystem() {
    _classCallCheck(this, BossSystem);
    this.bosses = _bosses["default"];
    this.currentBattle = null;
    this.initializeState();
    this.subscribeToEvents();
    _Logger["default"].info('BossSystem', 'Initialized with bosses:', Object.keys(this.bosses));
  }

  /**
   * Initialize boss state
   */
  return _createClass(BossSystem, [{
    key: "initializeState",
    value: function initializeState() {
      var state = _StateManager["default"].getState();

      // Check if bosses are already initialized
      if (!state.bosses || Object.keys(state.bosses).length === 0) {
        _Logger["default"].info('BossSystem', 'Initializing boss states...');
        var initialBosses = {};
        for (var _i = 0, _Object$entries = Object.entries(this.bosses); _i < _Object$entries.length; _i++) {
          var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
            key = _Object$entries$_i[0],
            boss = _Object$entries$_i[1];
          // Skip locked bosses
          if (boss.locked) {
            _Logger["default"].info('BossSystem', "Skipping locked boss: ".concat(key));
            continue;
          }

          // First boss (corruptedTreeant) should be unlocked by default
          var isFirstBoss = key === 'corruptedTreeant';
          initialBosses[key] = {
            unlocked: isFirstBoss,
            defeated: false,
            currentHP: boss.hp,
            maxHP: boss.hp,
            attempts: 0,
            bestScore: 0,
            defeatedCount: 0,
            firstDefeatAt: null
          };
          _Logger["default"].info('BossSystem', "Initialized boss ".concat(key, ":"), {
            unlocked: isFirstBoss,
            hp: boss.hp
          });
        }

        // Dispatch to state
        _StateManager["default"].dispatch({
          type: 'INIT_BOSSES',
          payload: {
            bosses: initialBosses
          }
        });
        _Logger["default"].info('BossSystem', 'Boss states initialized:', initialBosses);
      } else {
        _Logger["default"].info('BossSystem', 'Bosses already initialized');
      }

      // Check for unlocks
      this.checkUnlocks();
    }

    /**
     * Subscribe to events
     */
  }, {
    key: "subscribeToEvents",
    value: function subscribeToEvents() {
      var _this = this;
      // Check unlocks on key milestones
      _EventBus["default"].on('structure:purchased', function () {
        return _this.checkUnlocks();
      });
      _EventBus["default"].on('production:updated', function () {
        return _this.checkUnlocks();
      });
      _EventBus["default"].on('realm:unlocked', function () {
        return _this.checkUnlocks();
      });
      _EventBus["default"].on('ascension:completed', function () {
        return _this.checkUnlocks();
      });
      _EventBus["default"].on('boss:defeated', function () {
        return _this.checkUnlocks();
      });

      // Handle puzzle completion during boss battle
      _EventBus["default"].on('puzzle:completed', function (data) {
        if (_this.currentBattle) {
          _this.processPuzzleResult(data);
        }
      });
    }

    /**
     * Check which bosses should be unlocked
     */
  }, {
    key: "checkUnlocks",
    value: function checkUnlocks() {
      var state = _StateManager["default"].getState();
      for (var _i2 = 0, _Object$entries2 = Object.entries(this.bosses); _i2 < _Object$entries2.length; _i2++) {
        var _Object$entries2$_i = _slicedToArray(_Object$entries2[_i2], 2),
          key = _Object$entries2$_i[0],
          boss = _Object$entries2$_i[1];
        if (boss.locked) continue;
        var bossState = state.bosses[key];
        if (bossState !== null && bossState !== void 0 && bossState.unlocked) continue;
        if (this.meetsUnlockCondition(key)) {
          this.unlockBoss(key);
        }
      }
    }

    /**
     * Check if boss unlock condition is met
     */
  }, {
    key: "meetsUnlockCondition",
    value: function meetsUnlockCondition(bossKey) {
      var boss = this.bosses[bossKey];
      var condition = boss.unlockCondition;

      // If no condition, always unlocked (for first boss)
      if (!condition) {
        _Logger["default"].info('BossSystem', "Boss ".concat(bossKey, " has no unlock conditions - auto unlocked"));
        return true;
      }
      var state = _StateManager["default"].getState();

      // Check production requirement
      if (condition.production) {
        for (var _i3 = 0, _Object$entries3 = Object.entries(condition.production); _i3 < _Object$entries3.length; _i3++) {
          var _Object$entries3$_i = _slicedToArray(_Object$entries3[_i3], 2),
            resource = _Object$entries3$_i[0],
            required = _Object$entries3$_i[1];
          if (state.production[resource] < required) {
            return false;
          }
        }
      }

      // Check structure requirement
      if (condition.structures) {
        if (condition.structures.total) {
          var structureSystem = require('./StructureSystem.js')["default"];
          var totalLevels = structureSystem.getStats().totalLevels;
          if (totalLevels < condition.structures.total) {
            return false;
          }
        }
      }

      // Check realm requirement
      if (condition.realms) {
        for (var _i4 = 0, _Object$entries4 = Object.entries(condition.realms); _i4 < _Object$entries4.length; _i4++) {
          var _Object$entries4$_i = _slicedToArray(_Object$entries4[_i4], 2),
            realm = _Object$entries4$_i[0],
            requirement = _Object$entries4$_i[1];
          if (requirement === 'unlocked' && !state.realms.unlocked.includes(realm)) {
            return false;
          }
        }
      }

      // Check ascension requirement
      if (condition.ascension) {
        if (state.ascension.level < condition.ascension.level) {
          return false;
        }
      }

      // Check boss requirements
      if (condition.bosses) {
        for (var _i5 = 0, _Object$entries5 = Object.entries(condition.bosses); _i5 < _Object$entries5.length; _i5++) {
          var _Object$entries5$_i = _slicedToArray(_Object$entries5[_i5], 2),
            requiredBoss = _Object$entries5$_i[0],
            _requirement = _Object$entries5$_i[1];
          var requiredBossState = state.bosses[requiredBoss];
          if (_requirement === 'defeated' && !(requiredBossState !== null && requiredBossState !== void 0 && requiredBossState.defeated)) {
            return false;
          }
        }
      }
      return true;
    }

    /**
     * Unlock a boss
     */
  }, {
    key: "unlockBoss",
    value: function unlockBoss(bossKey) {
      _StateManager["default"].dispatch({
        type: 'UNLOCK_BOSS',
        payload: {
          bossKey: bossKey
        }
      });
      var boss = this.bosses[bossKey];
      _Logger["default"].info('BossSystem', "Unlocked boss: ".concat(boss.name));
      _EventBus["default"].emit('notification:show', {
        type: 'boss',
        title: 'Boss Unlocked!',
        message: "".concat(boss.emoji, " ").concat(boss.name),
        description: boss.description,
        duration: 6000
      });
      _EventBus["default"].emit('boss:unlocked', {
        bossKey: bossKey,
        boss: boss
      });
    }

    /**
     * Start a boss battle
     */
  }, {
    key: "startBattle",
    value: function startBattle(bossKey) {
      var state = _StateManager["default"].getState();
      var bossState = state.bosses[bossKey];
      var boss = this.bosses[bossKey];
      if (!boss) {
        _Logger["default"].error('BossSystem', "Boss ".concat(bossKey, " not found"));
        return false;
      }
      if (!(bossState !== null && bossState !== void 0 && bossState.unlocked)) {
        _Logger["default"].warn('BossSystem', "Boss ".concat(bossKey, " not unlocked"));
        _EventBus["default"].emit('boss:battle-failed', {
          bossKey: bossKey,
          reason: 'locked'
        });
        return false;
      }
      if (bossState.currentHP <= 0) {
        _Logger["default"].warn('BossSystem', "Boss ".concat(bossKey, " already defeated"));
        // Allow re-fighting for rewards
      }

      // Set current battle
      this.currentBattle = {
        bossKey: bossKey,
        startedAt: Date.now(),
        attempts: 0
      };

      // Update state
      _StateManager["default"].dispatch({
        type: 'START_BOSS_BATTLE',
        payload: {
          bossKey: bossKey
        }
      });
      _Logger["default"].info('BossSystem', "Started battle with ".concat(boss.name));
      _EventBus["default"].emit('boss:battle-started', {
        bossKey: bossKey,
        boss: boss,
        bossState: bossState
      });
      return true;
    }

    /**
     * Process puzzle result during boss battle
     */
  }, {
    key: "processPuzzleResult",
    value: function processPuzzleResult(puzzleData) {
      if (!this.currentBattle) {
        _Logger["default"].warn('BossSystem', 'No active boss battle');
        return;
      }
      var bossKey = this.currentBattle.bossKey;
      var boss = this.bosses[bossKey];
      var state = _StateManager["default"].getState();
      var bossState = state.bosses[bossKey];
      var score = puzzleData.score,
        combo = puzzleData.combo,
        moves = puzzleData.moves;

      // Calculate damage
      var damage = boss.damageFormula(score, combo);

      // Apply damage
      var newHP = Math.max(0, bossState.currentHP - damage);
      _StateManager["default"].dispatch({
        type: 'DAMAGE_BOSS',
        payload: {
          bossKey: bossKey,
          damage: damage,
          newHP: newHP,
          score: score
        }
      });
      this.currentBattle.attempts++;
      _Logger["default"].info('BossSystem', "Dealt ".concat(damage, " damage to ").concat(boss.name, " (").concat(newHP, "/").concat(bossState.maxHP, " HP)"));
      _EventBus["default"].emit('boss:damage-dealt', {
        bossKey: bossKey,
        damage: damage,
        currentHP: newHP,
        maxHP: bossState.maxHP,
        score: score,
        combo: combo
      });

      // Check if defeated
      if (newHP <= 0) {
        this.defeatBoss(bossKey);
      }
    }

    /**
     * Defeat a boss
     */
  }, {
    key: "defeatBoss",
    value: function defeatBoss(bossKey) {
      var boss = this.bosses[bossKey];
      var state = _StateManager["default"].getState();
      var bossState = state.bosses[bossKey];
      var isFirstDefeat = !bossState.defeated;

      // Mark as defeated
      _StateManager["default"].dispatch({
        type: 'DEFEAT_BOSS',
        payload: {
          bossKey: bossKey
        }
      });

      // Give rewards
      var rewards = isFirstDefeat ? boss.rewards.firstTime : boss.rewards.repeat;
      this.giveRewards(bossKey, rewards, isFirstDefeat);

      // Clear current battle
      this.currentBattle = null;
      _Logger["default"].info('BossSystem', "Defeated ".concat(boss.name, "!"), {
        isFirstDefeat: isFirstDefeat,
        rewards: rewards
      });

      // Show victory screen
      _EventBus["default"].emit('boss:defeated', {
        bossKey: bossKey,
        boss: boss,
        isFirstDefeat: isFirstDefeat,
        rewards: rewards
      });

      // Update statistics
      _StateManager["default"].dispatch({
        type: 'INCREMENT_STATISTIC',
        payload: {
          key: 'bossesDefeated',
          amount: 1
        }
      });

      // Trigger achievements
      if (boss.achievements) {
        var _iterator = _createForOfIteratorHelper(boss.achievements),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var achievementKey = _step.value;
            _EventBus["default"].emit('achievement:check', {
              achievementKey: achievementKey
            });
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      }
    }

    /**
     * Give boss rewards
     */
  }, {
    key: "giveRewards",
    value: function giveRewards(bossKey, rewards, isFirstDefeat) {
      // Resource rewards
      for (var _i6 = 0, _Object$entries6 = Object.entries(rewards); _i6 < _Object$entries6.length; _i6++) {
        var _Object$entries6$_i = _slicedToArray(_Object$entries6[_i6], 2),
          resource = _Object$entries6$_i[0],
          amount = _Object$entries6$_i[1];
        if (resource === 'guaranteedGuardian' || resource === 'specialReward') continue;
        _StateManager["default"].dispatch({
          type: 'ADD_RESOURCE',
          payload: {
            resource: resource,
            amount: amount
          }
        });

        // Track gem earnings
        if (resource === 'gems') {
          _StateManager["default"].dispatch({
            type: 'INCREMENT_STATISTIC',
            payload: {
              key: 'gemsEarned',
              amount: amount
            }
          });
        }
      }

      // Guaranteed guardian
      if (rewards.guaranteedGuardian) {
        var guardianSystem = require('./GuardianSystem.js')["default"];

        // Summon specific rarity/type
        var _rewards$guaranteedGu = rewards.guaranteedGuardian,
          rarity = _rewards$guaranteedGu.rarity,
          type = _rewards$guaranteedGu.type;

        // Filter guardians by type
        var guardianPool = require('../data/guardians.js')["default"];
        var availableGuardians = Object.entries(guardianPool).filter(function (_ref) {
          var _ref2 = _slicedToArray(_ref, 2),
            key = _ref2[0],
            data = _ref2[1];
          if (data.type !== type && data.type !== 'all') return false;
          if (!data.rarities.includes(rarity)) return false;
          return true;
        }).map(function (_ref3) {
          var _ref4 = _slicedToArray(_ref3, 1),
            key = _ref4[0];
          return key;
        });
        if (availableGuardians.length > 0) {
          var guardianKey = availableGuardians[Math.floor(Math.random() * availableGuardians.length)];
          var guardianData = guardianPool[guardianKey];

          // Roll bonus in rarity range
          var rarityData = require('../data/guardians.js').RARITIES[rarity];
          var _rarityData$bonusRang = _slicedToArray(rarityData.bonusRange, 2),
            min = _rarityData$bonusRang[0],
            max = _rarityData$bonusRang[1];
          var bonus = Math.floor(Math.random() * (max - min + 1)) + min;
          var guardian = {
            id: Date.now() + Math.random(),
            key: guardianKey,
            name: guardianData.name,
            emoji: guardianData.emoji,
            type: guardianData.type,
            rarity: rarity,
            bonus: bonus,
            summonedAt: Date.now(),
            special: guardianData.special || null,
            source: "Boss: ".concat(bossKey)
          };
          _StateManager["default"].dispatch({
            type: 'ADD_GUARDIAN_DIRECT',
            payload: {
              guardian: guardian
            }
          });
          _Logger["default"].info('BossSystem', "Awarded guaranteed guardian: ".concat(guardian.name, " (").concat(rarity, ")"));
        }
      }

      // Special rewards
      if (rewards.specialReward) {
        _Logger["default"].info('BossSystem', "Special reward: ".concat(rewards.specialReward.name));
        // Handle special rewards (cosmetics, titles, etc.)
        _EventBus["default"].emit('special-reward:unlocked', rewards.specialReward);
      }
    }

    /**
     * Exit boss battle
     */
  }, {
    key: "exitBattle",
    value: function exitBattle() {
      if (!this.currentBattle) {
        return false;
      }
      var bossKey = this.currentBattle.bossKey;
      this.currentBattle = null;
      _StateManager["default"].dispatch({
        type: 'EXIT_BOSS_BATTLE'
      });
      _Logger["default"].info('BossSystem', "Exited battle with ".concat(bossKey));
      _EventBus["default"].emit('boss:battle-exited', {
        bossKey: bossKey
      });
      return true;
    }

    /**
     * Get boss state
     */
  }, {
    key: "getBossState",
    value: function getBossState(bossKey) {
      var state = _StateManager["default"].getState();
      return state.bosses[bossKey];
    }

    /**
     * Get unlocked bosses
     */
  }, {
    key: "getUnlockedBosses",
    value: function getUnlockedBosses() {
      var state = _StateManager["default"].getState();
      var unlocked = [];
      for (var _i7 = 0, _Object$entries7 = Object.entries(this.bosses); _i7 < _Object$entries7.length; _i7++) {
        var _Object$entries7$_i = _slicedToArray(_Object$entries7[_i7], 2),
          key = _Object$entries7$_i[0],
          boss = _Object$entries7$_i[1];
        if (boss.locked) continue;
        var bossState = state.bosses[key];
        if (bossState !== null && bossState !== void 0 && bossState.unlocked) {
          unlocked.push({
            key: key,
            boss: boss,
            state: bossState
          });
        }
      }
      return unlocked;
    }

    /**
     * Get boss stats
     */
  }, {
    key: "getStats",
    value: function getStats() {
      var state = _StateManager["default"].getState();
      var totalBosses = 0;
      var unlockedBosses = 0;
      var defeatedBosses = 0;
      for (var _i8 = 0, _Object$entries8 = Object.entries(this.bosses); _i8 < _Object$entries8.length; _i8++) {
        var _Object$entries8$_i = _slicedToArray(_Object$entries8[_i8], 2),
          key = _Object$entries8$_i[0],
          boss = _Object$entries8$_i[1];
        if (boss.locked) continue;
        totalBosses++;
        var bossState = state.bosses[key];
        if (bossState !== null && bossState !== void 0 && bossState.unlocked) unlockedBosses++;
        if (bossState !== null && bossState !== void 0 && bossState.defeated) defeatedBosses++;
      }
      return {
        total: totalBosses,
        unlocked: unlockedBosses,
        defeated: defeatedBosses,
        percentageUnlocked: unlockedBosses / totalBosses * 100,
        percentageDefeated: defeatedBosses / totalBosses * 100
      };
    }

    /**
     * Get current battle info
     */
  }, {
    key: "getCurrentBattle",
    value: function getCurrentBattle() {
      if (!this.currentBattle) {
        return null;
      }
      var _this$currentBattle = this.currentBattle,
        bossKey = _this$currentBattle.bossKey,
        startedAt = _this$currentBattle.startedAt,
        attempts = _this$currentBattle.attempts;
      var boss = this.bosses[bossKey];
      var bossState = this.getBossState(bossKey);
      return {
        bossKey: bossKey,
        boss: boss,
        bossState: bossState,
        startedAt: startedAt,
        attempts: attempts,
        duration: Date.now() - startedAt
      };
    }
  }]);
}(); // Singleton
var bossSystem = new BossSystem();
var _default = exports["default"] = bossSystem;

},{"../core/StateManager.js":6,"../data/bosses.js":9,"../data/guardians.js":10,"../utils/EventBus.js":56,"../utils/Logger.js":58,"./GuardianSystem.js":23,"./StructureSystem.js":30}],22:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _StateManager = _interopRequireDefault(require("../core/StateManager.js"));
var _EventBus = _interopRequireDefault(require("../utils/EventBus.js"));
var _Logger = _interopRequireDefault(require("../utils/Logger.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /**
 * DailyRewardSystem - Daily login rewards with streak tracking
 */
var DailyRewardSystem = /*#__PURE__*/function () {
  function DailyRewardSystem() {
    var _this = this;
    _classCallCheck(this, DailyRewardSystem);
    this.rewards = this.getRewardStructure();
    _EventBus["default"].on('game:initialized', function () {
      _this.checkDailyReward();
    });
    _Logger["default"].info('DailyRewardSystem', 'Initialized');
  }

  /**
   * Get 7-day reward structure
   */
  return _createClass(DailyRewardSystem, [{
    key: "getRewardStructure",
    value: function getRewardStructure() {
      return [{
        day: 1,
        rewards: {
          gems: 25,
          energy: 1000
        },
        emoji: '🎁'
      }, {
        day: 2,
        rewards: {
          gems: 50,
          energy: 2500,
          mana: 50
        },
        emoji: '🎁'
      }, {
        day: 3,
        rewards: {
          gems: 75,
          energy: 5000,
          mana: 100
        },
        emoji: '🎁'
      }, {
        day: 4,
        rewards: {
          gems: 100,
          energy: 10000,
          mana: 200,
          crystals: 1
        },
        emoji: '🎁'
      }, {
        day: 5,
        rewards: {
          gems: 150,
          energy: 20000,
          mana: 500,
          crystals: 3
        },
        emoji: '🎁'
      }, {
        day: 6,
        rewards: {
          gems: 200,
          energy: 50000,
          mana: 1000,
          crystals: 5
        },
        emoji: '🎁'
      }, {
        day: 7,
        rewards: {
          gems: 500,
          energy: 100000,
          mana: 5000,
          crystals: 20,
          guardian: 1 // Random guardian
        },
        emoji: '🏆',
        special: true
      }];
    }

    /**
     * Check if can claim daily reward
     */
  }, {
    key: "canClaim",
    value: function canClaim() {
      var state = _StateManager["default"].getState();
      var now = Date.now();
      var lastClaim = state.dailyRewards.lastClaim;
      if (!lastClaim) {
        return {
          can: true,
          reason: 'first-time'
        };
      }
      var timeSince = now - lastClaim;
      var oneDay = 86400000; // 24h in ms
      var twoDays = 172800000; // 48h in ms

      // Already claimed today
      if (timeSince < oneDay) {
        return {
          can: false,
          reason: 'already-claimed',
          nextClaimIn: oneDay - timeSince
        };
      }

      // Missed a day - streak broken
      if (timeSince > twoDays) {
        return {
          can: true,
          reason: 'streak-broken',
          streakReset: true
        };
      }

      // Can claim next day
      return {
        can: true,
        reason: 'next-day'
      };
    }

    /**
     * Claim daily reward
     */
  }, {
    key: "claim",
    value: function claim() {
      var canClaimResult = this.canClaim();
      if (!canClaimResult.can) {
        _Logger["default"].warn('DailyRewardSystem', 'Cannot claim:', canClaimResult.reason);
        _EventBus["default"].emit('daily-reward:claim-failed', canClaimResult);
        return false;
      }
      var state = _StateManager["default"].getState();
      var streak = state.dailyRewards.streak;

      // Reset streak if broken
      if (canClaimResult.streakReset) {
        streak = 0;
      }

      // Increment streak
      streak++;

      // Cap at 7 days
      if (streak > 7) {
        streak = 1; // Start new cycle
      }

      // Get reward for current day
      var dayReward = this.rewards[streak - 1];

      // Give rewards
      for (var _i = 0, _Object$entries = Object.entries(dayReward.rewards); _i < _Object$entries.length; _i++) {
        var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
          resource = _Object$entries$_i[0],
          amount = _Object$entries$_i[1];
        if (resource === 'guardian') {
          // Summon random guardian
          var guardianSystem = require('./GuardianSystem.js')["default"];
          for (var i = 0; i < amount; i++) {
            guardianSystem.summon();
          }
        } else {
          _StateManager["default"].dispatch({
            type: 'ADD_RESOURCE',
            payload: {
              resource: resource,
              amount: amount
            }
          });

          // Track gem earnings
          if (resource === 'gems') {
            _StateManager["default"].dispatch({
              type: 'INCREMENT_STATISTIC',
              payload: {
                key: 'gemsEarned',
                amount: amount
              }
            });
          }
        }
      }

      // Update state
      _StateManager["default"].dispatch({
        type: 'CLAIM_DAILY_REWARD',
        payload: {
          streak: streak,
          lastClaim: Date.now(),
          day: streak
        }
      });
      _Logger["default"].info('DailyRewardSystem', "Claimed day ".concat(streak, " reward"), dayReward.rewards);
      _EventBus["default"].emit('daily-reward:claimed', {
        day: streak,
        rewards: dayReward.rewards,
        isSpecial: dayReward.special
      });

      // Show notification
      this.showClaimNotification(streak, dayReward);
      return true;
    }

    /**
     * Show claim notification
     */
  }, {
    key: "showClaimNotification",
    value: function showClaimNotification(day, reward) {
      var rewardText = this.formatRewards(reward.rewards);
      _EventBus["default"].emit('notification:show', {
        type: 'daily-reward',
        title: reward.special ? '🏆 7-Day Streak!' : "".concat(reward.emoji, " Day ").concat(day, " Reward"),
        message: rewardText,
        duration: 7000
      });
    }

    /**
     * Format rewards for display
     */
  }, {
    key: "formatRewards",
    value: function formatRewards(rewards) {
      var parts = [];
      for (var _i2 = 0, _Object$entries2 = Object.entries(rewards); _i2 < _Object$entries2.length; _i2++) {
        var _Object$entries2$_i = _slicedToArray(_Object$entries2[_i2], 2),
          resource = _Object$entries2$_i[0],
          amount = _Object$entries2$_i[1];
        if (resource === 'guardian') {
          parts.push("".concat(amount, " Guardian").concat(amount > 1 ? 's' : ''));
        } else {
          var icons = {
            gems: '💎',
            energy: '⚡',
            mana: '✨',
            crystals: '💠'
          };
          parts.push("".concat(amount, " ").concat(icons[resource] || resource));
        }
      }
      return parts.join(', ');
    }

    /**
    * Check daily reward on game start
    */
  }, {
    key: "checkDailyReward",
    value: function checkDailyReward() {
      var state = _StateManager["default"].getState();
      var canClaimResult = this.canClaim();
      var now = Date.now();

      // ✅ PRIORITATE 1: Dacă ai claimed deja azi, STOP!
      if (canClaimResult.reason === 'already-claimed') {
        _Logger["default"].info('DailyRewardSystem', 'Reward already claimed today, no modal');
        return;
      }

      // ✅ PRIORITATE 2: Verifică dacă modalul a fost deja arătat azi
      var lastModalShown = state.dailyRewards.lastModalShown || 0;
      var timeSinceModal = now - lastModalShown;
      var oneDay = 86400000; // 24h in ms

      // Dacă ai văzut modalul în ultimele 24h (chiar dacă n-ai claimed), nu-l mai arăta
      if (timeSinceModal < oneDay) {
        _Logger["default"].info('DailyRewardSystem', "Modal already shown ".concat(Math.floor(timeSinceModal / 1000 / 60), " minutes ago - not showing again"));
        return;
      }

      // ✅ PRIORITATE 3: Poți revendica și modalul n-a fost arătat azi = SHOW MODAL!
      if (canClaimResult.can) {
        // Marchează că ai arătat modalul ACUM
        _StateManager["default"].dispatch({
          type: 'DAILY_REWARD_MODAL_SHOWN',
          payload: {
            timestamp: now
          }
        });
        _Logger["default"].info('DailyRewardSystem', 'Showing daily reward modal');
        setTimeout(function () {
          _EventBus["default"].emit('daily-reward:available');
        }, 2000); // Delay to let game load
      }
    }

    /**
     * Get current streak
     */
  }, {
    key: "getStreak",
    value: function getStreak() {
      var state = _StateManager["default"].getState();
      return state.dailyRewards.streak || 0;
    }

    /**
     * Get next reward preview
     */
  }, {
    key: "getNextReward",
    value: function getNextReward() {
      var state = _StateManager["default"].getState();
      var currentStreak = state.dailyRewards.streak || 0;
      var nextDay = currentStreak >= 7 ? 1 : currentStreak + 1;
      return this.rewards[nextDay - 1];
    }

    /**
     * Get all rewards (for UI display)
     */
  }, {
    key: "getAllRewards",
    value: function getAllRewards() {
      var state = _StateManager["default"].getState();
      var currentStreak = state.dailyRewards.streak || 0;
      return this.rewards.map(function (reward, index) {
        var day = index + 1;
        return _objectSpread(_objectSpread({}, reward), {}, {
          claimed: day <= currentStreak,
          current: day === currentStreak,
          next: day === currentStreak + 1
        });
      });
    }

    /**
     * Get stats
     */
  }, {
    key: "getStats",
    value: function getStats() {
      var _state$dailyRewards$c;
      var state = _StateManager["default"].getState();
      var canClaimResult = this.canClaim();
      return {
        streak: state.dailyRewards.streak || 0,
        lastClaim: state.dailyRewards.lastClaim,
        canClaim: canClaimResult.can,
        nextClaimIn: canClaimResult.nextClaimIn || 0,
        totalClaimed: ((_state$dailyRewards$c = state.dailyRewards.claimed) === null || _state$dailyRewards$c === void 0 ? void 0 : _state$dailyRewards$c.length) || 0
      };
    }
  }]);
}(); // Singleton
var dailyRewardSystem = new DailyRewardSystem();
var _default = exports["default"] = dailyRewardSystem;

},{"../core/StateManager.js":6,"../utils/EventBus.js":56,"../utils/Logger.js":58,"./GuardianSystem.js":23}],23:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _guardians = require("../data/guardians.js");
var _config = _interopRequireDefault(require("../config.js"));
var _StateManager = _interopRequireDefault(require("../core/StateManager.js"));
var _EventBus = _interopRequireDefault(require("../utils/EventBus.js"));
var _Logger = _interopRequireDefault(require("../utils/Logger.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /**
 * GuardianSystem - Handles guardian summoning and bonuses
 */
var GuardianSystem = /*#__PURE__*/function () {
  function GuardianSystem() {
    _classCallCheck(this, GuardianSystem);
    this.guardianPool = _guardians.GUARDIAN_POOL;
    this.rarities = _guardians.RARITIES;
    this.summonCost = _config["default"].BALANCING.GUARDIAN_SUMMON_COST;
    this.subscribeToEvents();
    _Logger["default"].info('GuardianSystem', 'Initialized with guardian pool:', Object.keys(this.guardianPool));
  }

  /**
   * Subscribe to events
   */
  return _createClass(GuardianSystem, [{
    key: "subscribeToEvents",
    value: function subscribeToEvents() {
      // When guardians change, recalculate bonuses
      _EventBus["default"].on('state:ADD_GUARDIAN', function () {
        _EventBus["default"].emit('guardians:changed');
      });
      _EventBus["default"].on('state:REMOVE_GUARDIAN', function () {
        _EventBus["default"].emit('guardians:changed');
      });
    }

    /**
     * Check if can summon
     */
  }, {
    key: "canSummon",
    value: function canSummon() {
      var state = _StateManager["default"].getState();
      return state.resources.gems >= this.summonCost;
    }

    /**
     * Summon a random guardian
     */
  }, {
    key: "summon",
    value: function summon() {
      var realmId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      if (!this.canSummon()) {
        _Logger["default"].warn('GuardianSystem', 'Cannot afford summon');
        _EventBus["default"].emit('guardian:summon-failed', {
          reason: 'insufficient-gems'
        });
        return null;
      }
      var state = _StateManager["default"].getState();
      var currentRealm = realmId || state.realms.current;

      // Get available guardians for realm
      var availableGuardians = this.getAvailableGuardians(currentRealm);
      if (availableGuardians.length === 0) {
        _Logger["default"].error('GuardianSystem', 'No guardians available for realm:', currentRealm);
        return null;
      }

      // Pick random guardian
      var guardianKey = availableGuardians[Math.floor(Math.random() * availableGuardians.length)];
      var guardianData = this.guardianPool[guardianKey];

      // Roll rarity
      var rarity = this.rollRarity(guardianData.rarities);

      // Roll bonus within rarity range
      var bonus = this.rollBonus(rarity);

      // Create guardian instance
      var guardian = {
        id: Date.now() + Math.random(),
        // Unique ID
        key: guardianKey,
        name: guardianData.name,
        emoji: guardianData.emoji,
        type: guardianData.type,
        rarity: rarity,
        bonus: bonus,
        summonedAt: Date.now(),
        special: guardianData.special || null
      };

      // Add to state
      _StateManager["default"].dispatch({
        type: 'ADD_GUARDIAN',
        payload: {
          guardian: guardian
        }
      });
      _Logger["default"].info('GuardianSystem', "Summoned ".concat(guardian.name, " (").concat(rarity, ") with +").concat(bonus, "% bonus"));

      // Emit event
      _EventBus["default"].emit('guardian:summoned', guardian);
      return guardian;
    }

    /**
     * Get available guardians for realm
     */
  }, {
    key: "getAvailableGuardians",
    value: function getAvailableGuardians(realmId) {
      return Object.entries(this.guardianPool).filter(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
          key = _ref2[0],
          data = _ref2[1];
        return data.realm === realmId || data.realm === 'any';
      }).map(function (_ref3) {
        var _ref4 = _slicedToArray(_ref3, 1),
          key = _ref4[0];
        return key;
      });
    }

    /**
     * Roll rarity using weighted random
     */
  }, {
    key: "rollRarity",
    value: function rollRarity(allowedRarities) {
      // Filter rarities to only allowed ones
      var validRarities = Object.entries(this.rarities).filter(function (_ref5) {
        var _ref6 = _slicedToArray(_ref5, 1),
          rarityKey = _ref6[0];
        return allowedRarities.includes(rarityKey);
      });

      // Calculate total weight
      var totalWeight = validRarities.reduce(function (sum, _ref7) {
        var _ref8 = _slicedToArray(_ref7, 2),
          key = _ref8[0],
          data = _ref8[1];
        return sum + data.weight;
      }, 0);

      // Roll
      var roll = Math.random() * totalWeight;
      var _iterator = _createForOfIteratorHelper(validRarities),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var _step$value = _slicedToArray(_step.value, 2),
            rarityKey = _step$value[0],
            rarityData = _step$value[1];
          roll -= rarityData.weight;
          if (roll <= 0) {
            return rarityKey;
          }
        }

        // Fallback to first allowed rarity
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      return allowedRarities[0];
    }

    /**
     * Roll bonus within rarity range
     */
  }, {
    key: "rollBonus",
    value: function rollBonus(rarity) {
      var rarityData = this.rarities[rarity];
      var _rarityData$bonusRang = _slicedToArray(rarityData.bonusRange, 2),
        min = _rarityData$bonusRang[0],
        max = _rarityData$bonusRang[1];
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Get all guardians
     */
  }, {
    key: "getGuardians",
    value: function getGuardians() {
      var state = _StateManager["default"].getState();
      return state.guardians;
    }

    /**
     * Get guardians by type
     */
  }, {
    key: "getGuardiansByType",
    value: function getGuardiansByType(type) {
      var guardians = this.getGuardians();
      return guardians.filter(function (g) {
        return g.type === type || g.type === 'all';
      });
    }

    /**
     * Get guardians by rarity
     */
  }, {
    key: "getGuardiansByRarity",
    value: function getGuardiansByRarity(rarity) {
      var guardians = this.getGuardians();
      return guardians.filter(function (g) {
        return g.rarity === rarity;
      });
    }

    /**
     * Calculate total bonus for a resource type
     */
  }, {
    key: "getTotalBonus",
    value: function getTotalBonus(resourceType) {
      var guardians = this.getGuardiansByType(resourceType);

      // Sum all bonuses
      var totalBonus = guardians.reduce(function (sum, g) {
        return sum + g.bonus;
      }, 0);

      // Apply guardian bond upgrade if exists
      var upgradeSystem = require('./UpgradeSystem.js')["default"];
      if (upgradeSystem.getLevel('guardianBond') > 0) {
        var bondMultiplier = upgradeSystem.getGuardianBonusMultiplier();
        totalBonus *= bondMultiplier;
      }
      return totalBonus;
    }

    /**
     * Get production multiplier from guardians
     */
  }, {
    key: "getProductionMultiplier",
    value: function getProductionMultiplier(resourceType) {
      var bonus = this.getTotalBonus(resourceType);
      return 1 + bonus / 100; // Convert percentage to multiplier
    }

    /**
     * Dismiss a guardian
     */
  }, {
    key: "dismiss",
    value: function dismiss(guardianId) {
      _StateManager["default"].dispatch({
        type: 'REMOVE_GUARDIAN',
        payload: {
          guardianId: guardianId
        }
      });
      _Logger["default"].info('GuardianSystem', "Dismissed guardian ".concat(guardianId));
      _EventBus["default"].emit('guardian:dismissed', {
        guardianId: guardianId
      });
    }

    /**
     * Get guardian stats
     */
  }, {
    key: "getStats",
    value: function getStats() {
      var guardians = this.getGuardians();
      var stats = {
        total: guardians.length,
        byRarity: {},
        byType: {},
        totalBonus: {
          energy: this.getTotalBonus('energy'),
          mana: this.getTotalBonus('mana'),
          volcanic: this.getTotalBonus('volcanic'),
          all: this.getTotalBonus('all')
        },
        averageBonus: 0,
        bestGuardian: null
      };

      // Count by rarity
      var _loop = function _loop() {
        var rarity = _arr[_i];
        stats.byRarity[rarity] = guardians.filter(function (g) {
          return g.rarity === rarity;
        }).length;
      };
      for (var _i = 0, _arr = ['common', 'uncommon', 'rare', 'epic', 'legendary']; _i < _arr.length; _i++) {
        _loop();
      }

      // Count by type
      var types = ['energy', 'mana', 'volcanic', 'all', 'gems'];
      var _loop2 = function _loop2() {
        var type = _types[_i2];
        stats.byType[type] = guardians.filter(function (g) {
          return g.type === type;
        }).length;
      };
      for (var _i2 = 0, _types = types; _i2 < _types.length; _i2++) {
        _loop2();
      }

      // Calculate average
      if (guardians.length > 0) {
        stats.averageBonus = guardians.reduce(function (sum, g) {
          return sum + g.bonus;
        }, 0) / guardians.length;
      }

      // Find best guardian
      if (guardians.length > 0) {
        stats.bestGuardian = guardians.reduce(function (best, current) {
          return current.bonus > best.bonus ? current : best;
        });
      }
      return stats;
    }

    /**
     * Get collection progress
     */
  }, {
    key: "getCollectionProgress",
    value: function getCollectionProgress() {
      var guardians = this.getGuardians();
      var uniqueKeys = new Set(guardians.map(function (g) {
        return g.key;
      }));
      var totalUnique = Object.keys(this.guardianPool).length;
      return {
        unique: uniqueKeys.size,
        total: totalUnique,
        percentage: uniqueKeys.size / totalUnique * 100,
        missing: totalUnique - uniqueKeys.size
      };
    }

    /**
     * Get special bonuses (from special guardians)
     */
  }, {
    key: "getSpecialBonuses",
    value: function getSpecialBonuses() {
      var guardians = this.getGuardians();
      var bonuses = {
        offlineBonus: 0,
        gemBonus: 0
      };
      var _iterator2 = _createForOfIteratorHelper(guardians),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var guardian = _step2.value;
          if (guardian.special) {
            if (guardian.special.offlineBonus) {
              bonuses.offlineBonus += guardian.special.offlineBonus;
            }
            if (guardian.special.gemBonus) {
              bonuses.gemBonus += guardian.special.gemBonus;
            }
          }
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
      return bonuses;
    }

    /**
     * Summon multiple guardians
     */
  }, {
    key: "summonMultiple",
    value: (function () {
      var _summonMultiple = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(count) {
        var results, i, guardian;
        return _regenerator().w(function (_context) {
          while (1) switch (_context.n) {
            case 0:
              results = [];
              i = 0;
            case 1:
              if (!(i < count)) {
                _context.n = 4;
                break;
              }
              if (this.canSummon()) {
                _context.n = 2;
                break;
              }
              return _context.a(3, 4);
            case 2:
              guardian = this.summon();
              if (guardian) {
                results.push(guardian);
              }
            case 3:
              i++;
              _context.n = 1;
              break;
            case 4:
              if (results.length > 0) {
                _EventBus["default"].emit('guardian:bulk-summoned', {
                  count: results.length,
                  guardians: results
                });
              }
              return _context.a(2, results);
          }
        }, _callee, this);
      }));
      function summonMultiple(_x) {
        return _summonMultiple.apply(this, arguments);
      }
      return summonMultiple;
    }()
    /**
     * Get rarity display name
     */
    )
  }, {
    key: "getRarityName",
    value: function getRarityName(rarity) {
      var names = {
        common: 'Common',
        uncommon: 'Uncommon',
        rare: 'Rare',
        epic: 'Epic',
        legendary: 'Legendary'
      };
      return names[rarity] || rarity;
    }

    /**
     * Get rarity color
     */
  }, {
    key: "getRarityColor",
    value: function getRarityColor(rarity) {
      var colors = {
        common: '#9ca3af',
        // Gray
        uncommon: '#10b981',
        // Green
        rare: '#3b82f6',
        // Blue
        epic: '#a855f7',
        // Purple
        legendary: '#f59e0b' // Gold
      };
      return colors[rarity] || '#ffffff';
    }
  }]);
}(); // Singleton
var guardianSystem = new GuardianSystem();
var _default = exports["default"] = guardianSystem;

},{"../config.js":1,"../core/StateManager.js":6,"../data/guardians.js":10,"../utils/EventBus.js":56,"../utils/Logger.js":58,"./UpgradeSystem.js":33}],24:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _StateManager = _interopRequireDefault(require("../core/StateManager.js"));
var _EventBus = _interopRequireDefault(require("../utils/EventBus.js"));
var _Logger = _interopRequireDefault(require("../utils/Logger.js"));
var _miniGameAchievements = require("../data/miniGameAchievements.js");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /**
 * MiniGameAchievementSystem - Manages mini-game specific achievements
 * Tracks progress, unlocks, and rewards
 */
var MiniGameAchievementSystem = /*#__PURE__*/function () {
  function MiniGameAchievementSystem() {
    _classCallCheck(this, MiniGameAchievementSystem);
    this.checkQueue = [];
    this.isProcessing = false;
    this.init();
  }
  return _createClass(MiniGameAchievementSystem, [{
    key: "init",
    value: function init() {
      var _this = this;
      // Listen for mini-game events
      _EventBus["default"].on('daily-spin:reward-granted', function () {
        return _this.checkAchievements('dailySpin');
      });
      _EventBus["default"].on('game-2048:game-over', function () {
        return _this.checkAchievements('game2048');
      });
      _EventBus["default"].on('match3:game-complete', function () {
        return _this.checkAchievements('match3');
      });

      // Also check on stats update
      _EventBus["default"].on('mini-game:stats-updated', function (data) {
        if (data.game) {
          _this.checkAchievements(data.game);
        }
      });
      _Logger["default"].info('MiniGameAchievementSystem', 'Initialized');
    }

    /**
     * Check all achievements for a specific game
     */
  }, {
    key: "checkAchievements",
    value: function checkAchievements(gameType) {
      var _state$achievements,
        _this2 = this;
      var achievements = (0, _miniGameAchievements.getAchievementsByGame)(gameType);
      if (!achievements || achievements.length === 0) return;
      var stats = this.getMiniGameStats(gameType);
      var state = _StateManager["default"].getState();
      var unlockedAchievements = ((_state$achievements = state.achievements) === null || _state$achievements === void 0 || (_state$achievements = _state$achievements.miniGames) === null || _state$achievements === void 0 ? void 0 : _state$achievements[gameType]) || [];
      achievements.forEach(function (achievement) {
        // Skip if already unlocked
        if (unlockedAchievements.includes(achievement.id)) return;

        // Check condition
        if (achievement.condition(stats)) {
          _this2.unlockAchievement(achievement);
        }
      });
    }

    /**
     * Get mini-game stats from state
     */
  }, {
    key: "getMiniGameStats",
    value: function getMiniGameStats(gameType) {
      var _state$miniGames;
      var state = _StateManager["default"].getState();
      var miniGameData = ((_state$miniGames = state.miniGames) === null || _state$miniGames === void 0 ? void 0 : _state$miniGames[gameType]) || {};
      switch (gameType) {
        case 'dailySpin':
          return {
            totalSpins: miniGameData.totalSpins || 0,
            currentStreak: this.calculateSpinStreak(),
            highestGemReward: miniGameData.highestGemReward || 0,
            guardiansWon: miniGameData.guardiansWon || 0
          };
        case 'game2048':
          return {
            gamesPlayed: miniGameData.gamesPlayed || 0,
            highScore: miniGameData.highScore || 0,
            highestTile: miniGameData.highestTile || 0
          };
        case 'match3':
          return {
            gamesPlayed: miniGameData.gamesPlayed || 0,
            highScore: miniGameData.highScore || 0,
            bestCombo: miniGameData.bestCombo || 0,
            specialGemsCreated: miniGameData.specialGemsCreated || {},
            perfectVictories: miniGameData.perfectVictories || 0
          };
        default:
          return {};
      }
    }

    /**
     * Calculate spin streak (consecutive days)
     */
  }, {
    key: "calculateSpinStreak",
    value: function calculateSpinStreak() {
      var _state$miniGames2;
      var state = _StateManager["default"].getState();
      var spinData = ((_state$miniGames2 = state.miniGames) === null || _state$miniGames2 === void 0 ? void 0 : _state$miniGames2.dailySpin) || {};
      var spinHistory = spinData.spinHistory || [];
      if (spinHistory.length === 0) return 0;
      var streak = 1;
      var today = new Date().toDateString();

      // Check backward from today
      for (var i = 1; i < spinHistory.length; i++) {
        var prevDate = new Date(spinHistory[i]);
        var expectedDate = new Date();
        expectedDate.setDate(expectedDate.getDate() - i);
        if (prevDate.toDateString() === expectedDate.toDateString()) {
          streak++;
        } else {
          break;
        }
      }
      return streak;
    }

    /**
     * Unlock achievement
     */
  }, {
    key: "unlockAchievement",
    value: function unlockAchievement(achievement) {
      _Logger["default"].info('MiniGameAchievementSystem', "Achievement unlocked: ".concat(achievement.name), achievement);

      // Mark as unlocked
      _StateManager["default"].dispatch({
        type: 'UNLOCK_MINI_GAME_ACHIEVEMENT',
        payload: {
          game: achievement.category,
          achievementId: achievement.id,
          timestamp: Date.now()
        }
      });

      // Grant rewards
      this.grantReward(achievement);

      // Show notification
      this.showAchievementNotification(achievement);

      // Emit event
      _EventBus["default"].emit('mini-game-achievement:unlocked', {
        achievement: achievement
      });

      // Update statistics
      _StateManager["default"].dispatch({
        type: 'INCREMENT_STATISTIC',
        payload: {
          key: 'miniGameAchievementsUnlocked',
          value: 1
        }
      });
    }

    /**
     * Grant achievement rewards
     */
  }, {
    key: "grantReward",
    value: function grantReward(achievement) {
      var reward = achievement.reward;
      for (var _i = 0, _Object$entries = Object.entries(reward); _i < _Object$entries.length; _i++) {
        var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
          resource = _Object$entries$_i[0],
          amount = _Object$entries$_i[1];
        if (resource === 'guardian') {
          // Trigger guardian summon
          _EventBus["default"].emit('guardian:summon', {
            amount: amount,
            source: "achievement-".concat(achievement.id),
            guaranteed: true
          });
        } else {
          // Add resource
          _StateManager["default"].dispatch({
            type: 'ADD_RESOURCE',
            payload: {
              resource: resource,
              amount: amount
            }
          });
        }
      }
      _Logger["default"].info('MiniGameAchievementSystem', 'Rewards granted', reward);
    }

    /**
     * Show achievement unlock notification
     */
  }, {
    key: "showAchievementNotification",
    value: function showAchievementNotification(achievement) {
      var tier = _miniGameAchievements.ACHIEVEMENT_TIERS[achievement.tier];
      var rewardText = this.formatReward(achievement.reward);
      _EventBus["default"].emit('notification:show', {
        type: 'achievement',
        title: "".concat(tier.icon, " Achievement Unlocked!"),
        message: "<strong>".concat(achievement.name, "</strong><br>").concat(achievement.description, "<br><small>Reward: ").concat(rewardText, "</small>"),
        duration: 7000,
        sound: 'achievement'
      });
    }

    /**
     * Format reward for display
     */
  }, {
    key: "formatReward",
    value: function formatReward(reward) {
      var parts = [];
      var icons = {
        timeShards: '⏰',
        gems: '💎',
        energy: '⚡',
        crystals: '💠',
        guardian: '🛡️'
      };
      for (var _i2 = 0, _Object$entries2 = Object.entries(reward); _i2 < _Object$entries2.length; _i2++) {
        var _Object$entries2$_i = _slicedToArray(_Object$entries2[_i2], 2),
          resource = _Object$entries2$_i[0],
          amount = _Object$entries2$_i[1];
        if (resource === 'guardian') {
          parts.push("".concat(icons[resource], " Guardian"));
        } else {
          parts.push("".concat(amount, " ").concat(icons[resource]));
        }
      }
      return parts.join(', ');
    }

    /**
     * Get achievement progress for a specific game
     */
  }, {
    key: "getProgress",
    value: function getProgress(gameType) {
      var _state$achievements2,
        _this3 = this;
      var achievements = (0, _miniGameAchievements.getAchievementsByGame)(gameType);
      var state = _StateManager["default"].getState();
      var unlocked = ((_state$achievements2 = state.achievements) === null || _state$achievements2 === void 0 || (_state$achievements2 = _state$achievements2.miniGames) === null || _state$achievements2 === void 0 ? void 0 : _state$achievements2[gameType]) || [];
      var stats = this.getMiniGameStats(gameType);
      return achievements.map(function (achievement) {
        var isUnlocked = unlocked.includes(achievement.id);
        return _objectSpread(_objectSpread({}, achievement), {}, {
          unlocked: isUnlocked,
          progress: _this3.calculateProgress(achievement, stats),
          timestamp: isUnlocked ? _this3.getUnlockTimestamp(gameType, achievement.id) : null
        });
      });
    }

    /**
     * Calculate progress percentage
     */
  }, {
    key: "calculateProgress",
    value: function calculateProgress(achievement, stats) {
      // Simple heuristic - can be improved per achievement
      try {
        var result = achievement.condition(stats);
        return result ? 100 : 0;
      } catch (e) {
        return 0;
      }
    }

    /**
     * Get unlock timestamp
     */
  }, {
    key: "getUnlockTimestamp",
    value: function getUnlockTimestamp(gameType, achievementId) {
      var _state$achievements3;
      var state = _StateManager["default"].getState();
      var unlockData = (_state$achievements3 = state.achievements) === null || _state$achievements3 === void 0 || (_state$achievements3 = _state$achievements3.miniGamesTimestamps) === null || _state$achievements3 === void 0 || (_state$achievements3 = _state$achievements3[gameType]) === null || _state$achievements3 === void 0 ? void 0 : _state$achievements3[achievementId];
      return unlockData || null;
    }

    /**
     * Get overall mini-game achievement stats
     */
  }, {
    key: "getOverallStats",
    value: function getOverallStats() {
      var _state$achievements4;
      var allAchievements = (0, _miniGameAchievements.getAllMiniGameAchievements)();
      var state = _StateManager["default"].getState();
      var miniGameAchievements = ((_state$achievements4 = state.achievements) === null || _state$achievements4 === void 0 ? void 0 : _state$achievements4.miniGames) || {};
      var totalUnlocked = 0;
      Object.values(miniGameAchievements).forEach(function (gameAchievements) {
        totalUnlocked += gameAchievements.length;
      });
      return {
        total: allAchievements.length,
        unlocked: totalUnlocked,
        percentage: Math.round(totalUnlocked / allAchievements.length * 100),
        byGame: {
          dailySpin: this.getGameStats('dailySpin'),
          game2048: this.getGameStats('game2048'),
          match3: this.getGameStats('match3')
        }
      };
    }

    /**
     * Get stats for a specific game
     */
  }, {
    key: "getGameStats",
    value: function getGameStats(gameType) {
      var _state$achievements5;
      var achievements = (0, _miniGameAchievements.getAchievementsByGame)(gameType);
      var state = _StateManager["default"].getState();
      var unlocked = ((_state$achievements5 = state.achievements) === null || _state$achievements5 === void 0 || (_state$achievements5 = _state$achievements5.miniGames) === null || _state$achievements5 === void 0 ? void 0 : _state$achievements5[gameType]) || [];
      return {
        total: achievements.length,
        unlocked: unlocked.length,
        percentage: achievements.length > 0 ? Math.round(unlocked.length / achievements.length * 100) : 0
      };
    }
  }]);
}();
var _default = exports["default"] = new MiniGameAchievementSystem();

},{"../core/StateManager.js":6,"../data/miniGameAchievements.js":11,"../utils/EventBus.js":56,"../utils/Logger.js":58}],25:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _EventBus = _interopRequireDefault(require("../utils/EventBus.js"));
var _Logger = _interopRequireDefault(require("../utils/Logger.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /**
 * NotificationManager - Smart notification filtering
 */
var NotificationManager = /*#__PURE__*/function () {
  function NotificationManager() {
    _classCallCheck(this, NotificationManager);
    this.container = document.getElementById('notification-container');
    this.queue = [];
    this.activeNotifications = [];
    this.maxNotifications = window.innerWidth <= 768 ? 2 : 4; // Max 2 pe mobile, 4 pe desktop

    // Prioritățile notificărilor
    this.priorities = {
      'critical': 5,
      // Erori importante
      'achievement': 4,
      // Achievement-uri
      'ascension': 4,
      // Ascension
      'quest': 3,
      // Quest completat
      'reward': 3,
      // Daily reward
      'upgrade': 2,
      // Upgrade completat
      'purchase': 1,
      // Cumpărare structură
      'info': 0 // Info generală
    };

    // Cooldown pentru același tip de notificare
    this.cooldowns = {};
    this.cooldownTime = 3000; // 3 secunde între același tip

    this.subscribeToEvents();
    _Logger["default"].info('NotificationManager', 'Initialized');
  }
  return _createClass(NotificationManager, [{
    key: "subscribeToEvents",
    value: function subscribeToEvents() {
      var _this = this;
      // Reascultă la resize pentru a ajusta maxNotifications
      window.addEventListener('resize', function () {
        _this.maxNotifications = window.innerWidth <= 768 ? 2 : 4;
      });
    }

    /**
     * Show notification with smart filtering
     */
  }, {
    key: "show",
    value: function show(_ref) {
      var _ref$type = _ref.type,
        type = _ref$type === void 0 ? 'info' : _ref$type,
        title = _ref.title,
        message = _ref.message,
        _ref$description = _ref.description,
        description = _ref$description === void 0 ? '' : _ref$description,
        _ref$duration = _ref.duration,
        duration = _ref$duration === void 0 ? 3000 : _ref$duration;
      // Verifică cooldown
      if (this.isOnCooldown(type)) {
        _Logger["default"].debug('NotificationManager', "Notification ".concat(type, " on cooldown, skipping"));
        return;
      }
      var notification = {
        id: Date.now() + Math.random(),
        type: type,
        title: title,
        message: message,
        description: description,
        duration: duration,
        priority: this.priorities[type] || 0,
        timestamp: Date.now()
      };

      // Adaugă în queue
      this.queue.push(notification);
      this.setCooldown(type);

      // Procesează queue-ul
      this.processQueue();
    }

    /**
     * Process notification queue based on priority
     */
  }, {
    key: "processQueue",
    value: function processQueue() {
      // Sortează după prioritate
      this.queue.sort(function (a, b) {
        return b.priority - a.priority;
      });

      // Afișează doar dacă avem loc
      while (this.activeNotifications.length < this.maxNotifications && this.queue.length > 0) {
        var notification = this.queue.shift();
        this.displayNotification(notification);
      }
    }

    /**
     * Display notification DOM
     */
  }, {
    key: "displayNotification",
    value: function displayNotification(notification) {
      var _this2 = this;
      var el = document.createElement('div');
      el.className = "notification ".concat(notification.type);
      el.dataset.id = notification.id;

      // Construiește conținutul - MAI COMPACT pe mobile
      var isMobile = window.innerWidth <= 768;
      el.innerHTML = "\n      <div class=\"notification-header\">\n        <h4 class=\"notification-title\">".concat(notification.title, "</h4>\n        <button class=\"notification-close\" aria-label=\"Close\">&times;</button>\n      </div>\n      <p class=\"notification-message\">").concat(notification.message, "</p>\n      ").concat(!isMobile && notification.description ? "<p class=\"notification-description\">".concat(notification.description, "</p>") : '', "\n    ");

      // Close button
      el.querySelector('.notification-close').addEventListener('click', function () {
        _this2.closeNotification(notification.id);
      });

      // Auto-close
      setTimeout(function () {
        _this2.closeNotification(notification.id);
      }, notification.duration);
      this.container.appendChild(el);
      this.activeNotifications.push(notification);
      _Logger["default"].debug('NotificationManager', "Displayed: ".concat(notification.title));
    }

    /**
     * Close notification
     */
  }, {
    key: "closeNotification",
    value: function closeNotification(id) {
      var _this3 = this;
      var el = this.container.querySelector("[data-id=\"".concat(id, "\"]"));
      if (!el) return;
      el.classList.add('closing');
      setTimeout(function () {
        el.remove();
        _this3.activeNotifications = _this3.activeNotifications.filter(function (n) {
          return n.id !== id;
        });

        // Procesează queue-ul din nou
        _this3.processQueue();
      }, 300);
    }

    /**
     * Cooldown management
     */
  }, {
    key: "isOnCooldown",
    value: function isOnCooldown(type) {
      return this.cooldowns[type] && Date.now() - this.cooldowns[type] < this.cooldownTime;
    }
  }, {
    key: "setCooldown",
    value: function setCooldown(type) {
      this.cooldowns[type] = Date.now();
    }

    /**
     * Clear all notifications
     */
  }, {
    key: "clearAll",
    value: function clearAll() {
      this.container.innerHTML = '';
      this.activeNotifications = [];
      this.queue = [];
    }
  }]);
}();
var notificationManager = new NotificationManager();
var _default = exports["default"] = notificationManager;

},{"../utils/EventBus.js":56,"../utils/Logger.js":58}],26:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _quests = _interopRequireDefault(require("../data/quests.js"));
var _config = _interopRequireDefault(require("../config.js"));
var _StateManager = _interopRequireDefault(require("../core/StateManager.js"));
var _EventBus = _interopRequireDefault(require("../utils/EventBus.js"));
var _Logger = _interopRequireDefault(require("../utils/Logger.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /**
 * QuestSystem - Generates, tracks, and completes quests
 */
var QuestSystem = /*#__PURE__*/function () {
  function QuestSystem() {
    _classCallCheck(this, QuestSystem);
    this.templates = _quests["default"];
    this.maxActiveQuests = 3;
    this.initializeState();
    this.subscribeToEvents();
    _Logger["default"].info('QuestSystem', 'Initialized with templates:', Object.keys(this.templates));
  }

  /**
   * Initialize quest state
   */
  return _createClass(QuestSystem, [{
    key: "initializeState",
    value: function initializeState() {
      var state = _StateManager["default"].getState();

      // Generate initial quests if none exist
      if (state.quests.active.length === 0) {
        this.generateQuests(this.maxActiveQuests);
      }
    }

    /**
     * Subscribe to events for quest tracking
     */
  }, {
    key: "subscribeToEvents",
    value: function subscribeToEvents() {
      var _this = this;
      // Structure purchases
      _EventBus["default"].on('structure:purchased', function (data) {
        _this.updateProgress('buy', data.structureKey, 1);
        _this.updateProgress('buy', 'any', 1);
      });

      // Upgrade purchases
      _EventBus["default"].on('upgrade:purchased', function () {
        _this.updateProgress('upgrade', 'any', 1);
      });

      // Guardian summons
      _EventBus["default"].on('guardian:summoned', function (guardian) {
        _this.updateProgress('summon', 'any', 1);
        _this.updateProgress('collect', guardian.rarity, 1);
      });

      // Puzzle wins
      _EventBus["default"].on('puzzle:won', function (data) {
        _this.updateProgress('puzzle', 'win', 1);
        _this.updateProgress('puzzle', 'score', data.score);
      });

      // Boss defeats
      _EventBus["default"].on('boss:defeated', function (data) {
        _this.updateProgress('boss', data.bossId, 1);
      });

      // Realm unlocks
      _EventBus["default"].on('realm:unlocked', function (data) {
        _this.updateProgress('realm', data.realmId, 1);
      });

      // Ascension
      _EventBus["default"].on('ascension:completed', function () {
        _this.updateProgress('ascension', 'any', 1);
      });

      // Production tracking (checked periodically)
      _EventBus["default"].on('game:tick', function () {
        _this.trackProductionQuests();
      });
    }

    /**
     * Generate random quests
     */
  }, {
    key: "generateQuests",
    value: function generateQuests(count) {
      var _this2 = this;
      var state = _StateManager["default"].getState();
      var availableTemplates = this.getAvailableTemplates();
      if (availableTemplates.length === 0) {
        _Logger["default"].warn('QuestSystem', 'No available quest templates');
        return;
      }
      var generated = [];
      var _loop = function _loop() {
        // Weighted random selection
        var template = _this2.weightedRandom(availableTemplates);
        var quest = _this2.createQuestFromTemplate(template);
        if (quest) {
          _StateManager["default"].dispatch({
            type: 'ADD_QUEST',
            payload: {
              quest: quest
            }
          });
          generated.push(quest);

          // Remove template from available pool to avoid duplicates
          var index = availableTemplates.findIndex(function (t) {
            return t.id === template.id;
          });
          if (index !== -1) {
            availableTemplates.splice(index, 1);
          }
        }
      };
      for (var i = 0; i < count && availableTemplates.length > 0; i++) {
        _loop();
      }
      _Logger["default"].info('QuestSystem', "Generated ".concat(generated.length, " quests"));
      _EventBus["default"].emit('quests:generated', {
        quests: generated
      });
      return generated;
    }

    /**
     * Get available quest templates (unlocked)
     */
  }, {
    key: "getAvailableTemplates",
    value: function getAvailableTemplates() {
      var state = _StateManager["default"].getState();
      return Object.values(this.templates).filter(function (template) {
        // Check unlock condition
        if (template.unlockCondition) {
          var condition = template.unlockCondition;

          // Resources
          if (condition.resources) {
            for (var _i = 0, _Object$entries = Object.entries(condition.resources); _i < _Object$entries.length; _i++) {
              var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
                resource = _Object$entries$_i[0],
                amount = _Object$entries$_i[1];
              if (state.resources[resource] < amount) {
                return false;
              }
            }
          }

          // Upgrades
          if (condition.upgrades) {
            for (var _i2 = 0, _Object$entries2 = Object.entries(condition.upgrades); _i2 < _Object$entries2.length; _i2++) {
              var _state$upgrades$upgra;
              var _Object$entries2$_i = _slicedToArray(_Object$entries2[_i2], 2),
                upgrade = _Object$entries2$_i[0],
                level = _Object$entries2$_i[1];
              if ((((_state$upgrades$upgra = state.upgrades[upgrade]) === null || _state$upgrades$upgra === void 0 ? void 0 : _state$upgrades$upgra.level) || 0) < level) {
                return false;
              }
            }
          }

          // Guardians
          if (condition.guardians) {
            if (condition.guardians.count && state.guardians.length < condition.guardians.count) {
              return false;
            }
          }

          // Realms
          if (condition.realms) {
            for (var _i3 = 0, _Object$entries3 = Object.entries(condition.realms); _i3 < _Object$entries3.length; _i3++) {
              var _Object$entries3$_i = _slicedToArray(_Object$entries3[_i3], 2),
                realm = _Object$entries3$_i[0],
                required = _Object$entries3$_i[1];
              if (required && !state.realms.unlocked.includes(realm)) {
                return false;
              }
            }
          }

          // Bosses
          if (condition.bosses) {
            if (condition.bosses.unlocked) {
              var unlockedBosses = Object.values(state.bosses).filter(function (b) {
                return b.unlocked;
              }).length;
              if (unlockedBosses < condition.bosses.unlocked) {
                return false;
              }
            }
          }

          // Ascension
          if (condition.ascension) {
            if (condition.ascension.canAscend) {
              // Check if player meets ascension requirements
              var canAscend = state.ascension.lifetimeEnergy >= _config["default"].BALANCING.ASCENSION_MIN_ENERGY;
              if (!canAscend) return false;
            }
            if (condition.ascension.level && state.ascension.level < condition.ascension.level) {
              return false;
            }
          }
        }
        return true;
      });
    }

    /**
     * Create quest instance from template
     */
  }, {
    key: "createQuestFromTemplate",
    value: function createQuestFromTemplate(template) {
      var state = _StateManager["default"].getState();

      // Determine amount/target based on player progress
      var progressLevel = this.getPlayerProgressLevel();
      var amount, target, description;
      switch (template.type) {
        case 'produce':
          amount = this.selectScaledValue(template.amounts, progressLevel);
          description = template.description.replace('{amount}', amount.toLocaleString());
          break;
        case 'buy':
          amount = this.selectScaledValue(template.amounts, progressLevel);
          target = template.target || 'any';
          if (template.targets) {
            // Select random specific target
            target = template.targets[Math.floor(Math.random() * template.targets.length)];
            var structureName = target; // You'd get actual name from structures.js
            description = template.description.replace('{amount}', amount).replace('{structure}', structureName);
          } else {
            description = template.description.replace('{amount}', amount);
          }
          break;
        case 'upgrade':
          amount = this.selectScaledValue(template.amounts, progressLevel);
          description = template.description.replace('{amount}', amount);
          break;
        case 'milestone':
          amount = this.selectScaledValue(template.amounts, progressLevel);
          description = template.description.replace('{amount}', amount.toLocaleString());
          break;
        case 'puzzle':
          if (template.counts) {
            amount = this.selectScaledValue(template.counts, progressLevel);
            description = template.description.replace('{amount}', amount);
          } else if (template.scores) {
            amount = this.selectScaledValue(template.scores, progressLevel);
            description = template.description.replace('{amount}', amount.toLocaleString());
          }
          break;
        case 'summon':
          amount = this.selectScaledValue(template.counts, progressLevel);
          description = template.description.replace('{amount}', amount);
          break;
        case 'collect':
          target = template.rarities[Math.floor(Math.random() * template.rarities.length)];
          description = template.description.replace('{rarity}', target);
          amount = 1;
          break;
        case 'boss':
          target = template.bosses[Math.floor(Math.random() * template.bosses.length)];
          var bossName = target; // You'd get actual boss name
          description = template.description.replace('{boss}', bossName);
          amount = 1;
          break;
        case 'realm':
          target = template.realms[Math.floor(Math.random() * template.realms.length)];
          description = template.description.replace('{realm}', target);
          amount = 1;
          break;
        case 'ascension':
          description = template.description;
          amount = 1;
          break;
        default:
          _Logger["default"].error('QuestSystem', "Unknown quest type: ".concat(template.type));
          return null;
      }

      // Calculate rewards
      var rewards = template.rewards(amount, target);

      // Create quest object
      var quest = {
        id: "quest_".concat(Date.now(), "_").concat(Math.random()),
        templateId: template.id,
        name: template.name,
        description: description,
        emoji: template.emoji,
        type: template.type,
        target: target,
        amount: amount,
        progress: 0,
        completed: false,
        rewards: rewards,
        difficulty: template.difficulty,
        createdAt: Date.now()
      };
      return quest;
    }

    /**
     * Get player progress level (0-4) for quest scaling
     */
  }, {
    key: "getPlayerProgressLevel",
    value: function getPlayerProgressLevel() {
      var state = _StateManager["default"].getState();

      // Based on ascension level and lifetime energy
      if (state.ascension.level >= 3) return 4;
      if (state.ascension.level >= 1) return 3;
      if (state.ascension.lifetimeEnergy >= 1000000) return 2;
      if (state.ascension.lifetimeEnergy >= 100000) return 1;
      return 0;
    }

    /**
     * Select value from array based on progress level
     */
  }, {
    key: "selectScaledValue",
    value: function selectScaledValue(array, progressLevel) {
      var index = Math.min(progressLevel, array.length - 1);
      return array[index];
    }

    /**
     * Weighted random selection
     */
  }, {
    key: "weightedRandom",
    value: function weightedRandom(templates) {
      var totalWeight = templates.reduce(function (sum, t) {
        return sum + (t.weight || 1);
      }, 0);
      var random = Math.random() * totalWeight;
      var _iterator = _createForOfIteratorHelper(templates),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var template = _step.value;
          random -= template.weight || 1;
          if (random <= 0) {
            return template;
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      return templates[0];
    }

    /**
     * Update quest progress
     */
  }, {
    key: "updateProgress",
    value: function updateProgress(type, target, amount) {
      var state = _StateManager["default"].getState();
      var activeQuests = state.quests.active;
      var _iterator2 = _createForOfIteratorHelper(activeQuests),
        _step2;
      try {
        var _loop2 = function _loop2() {
            var quest = _step2.value;
            if (quest.completed) return 0; // continue

            // Check if quest matches
            if (quest.type !== type) return 0; // continue

            // Check target
            if (quest.target && quest.target !== 'any' && quest.target !== target) {
              return 0; // continue
            }

            // Update progress
            _StateManager["default"].dispatch({
              type: 'UPDATE_QUEST_PROGRESS',
              payload: {
                questId: quest.id,
                amount: amount
              }
            });

            // Check if completed
            var updatedState = _StateManager["default"].getState();
            var updatedQuest = updatedState.quests.active.find(function (q) {
              return q.id === quest.id;
            });
            if (updatedQuest && updatedQuest.completed) {
              _Logger["default"].info('QuestSystem', "Quest completed: ".concat(updatedQuest.name));
              _EventBus["default"].emit('quest:completed', updatedQuest);
            }
          },
          _ret;
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          _ret = _loop2();
          if (_ret === 0) continue;
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    }

    /**
     * Track production-based quests (called from game tick)
     */
  }, {
    key: "trackProductionQuests",
    value: function trackProductionQuests() {
      var state = _StateManager["default"].getState();

      // Track 'produce' quests
      // These are incremented when resources are actually produced
      // Already handled via tick system adding resources

      // Track 'milestone' quests
      var _iterator3 = _createForOfIteratorHelper(state.quests.active),
        _step3;
      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var quest = _step3.value;
          if (quest.completed) continue;
          if (quest.type === 'milestone') {
            var currentValue = 0;
            switch (quest.metric) {
              case 'energyPerSecond':
                currentValue = state.production.energy;
                break;
              case 'maxStructureLevel':
                currentValue = Math.max.apply(Math, _toConsumableArray(Object.values(state.structures).map(function (s) {
                  return s.level || 0;
                })));
                break;
            }
            if (currentValue >= quest.amount && quest.progress < quest.amount) {
              _StateManager["default"].dispatch({
                type: 'UPDATE_QUEST_PROGRESS',
                payload: {
                  questId: quest.id,
                  amount: quest.amount - quest.progress
                }
              });
            }
          }
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
    }

    /**
     * Claim quest rewards
     */
  }, {
    key: "claim",
    value: function claim(questId) {
      var state = _StateManager["default"].getState();
      var quest = state.quests.active.find(function (q) {
        return q.id === questId;
      });
      if (!quest) {
        _Logger["default"].error('QuestSystem', "Quest ".concat(questId, " not found"));
        return false;
      }
      if (!quest.completed) {
        _Logger["default"].warn('QuestSystem', "Quest ".concat(questId, " not completed"));
        return false;
      }

      // ===== INSEREAZĂ AICI - FIX LUCKY GEMS =====
      // Apply lucky gems bonus chance
      var upgradeSystem = require('./UpgradeSystem.js')["default"];
      var luckyChance = upgradeSystem.getLuckyGemsChance(); // Returns 0-0.50

      if (quest.rewards.gems && luckyChance > 0 && Math.random() < luckyChance) {
        var bonusGems = Math.floor(quest.rewards.gems * 0.5); // +50% bonus
        quest.rewards.gems += bonusGems;
        _Logger["default"].info('QuestSystem', "\uD83C\uDF40 Lucky Gems!  Bonus: +".concat(bonusGems, " gems"));

        // Optional: emit event for UI notification
        _EventBus["default"].emit('quest:lucky-gems', {
          questId: questId,
          bonusGems: bonusGems
        });
      }

      // Give rewards
      for (var _i4 = 0, _Object$entries4 = Object.entries(quest.rewards); _i4 < _Object$entries4.length; _i4++) {
        var _Object$entries4$_i = _slicedToArray(_Object$entries4[_i4], 2),
          resource = _Object$entries4$_i[0],
          amount = _Object$entries4$_i[1];
        _StateManager["default"].dispatch({
          type: 'ADD_RESOURCE',
          payload: {
            resource: resource,
            amount: amount
          }
        });

        // Track gem earnings
        if (resource === 'gems') {
          _StateManager["default"].dispatch({
            type: 'INCREMENT_STATISTIC',
            payload: {
              key: 'gemsEarned',
              amount: amount
            }
          });
        }
      }

      // Complete quest
      _StateManager["default"].dispatch({
        type: 'COMPLETE_QUEST',
        payload: {
          questId: questId
        }
      });
      _Logger["default"].info('QuestSystem', "Claimed quest: ".concat(quest.name), quest.rewards);
      _EventBus["default"].emit('quest:claimed', {
        quest: quest,
        rewards: quest.rewards
      });

      // Check if should generate new quest
      var newState = _StateManager["default"].getState();
      if (newState.quests.active.length < this.maxActiveQuests) {
        if (newState.quests.completedToday < _config["default"].BALANCING.DAILY_QUEST_LIMIT) {
          this.generateQuests(1);
        }
      }
      return true;
    }

    /**
     * Get active quests
     */
  }, {
    key: "getActiveQuests",
    value: function getActiveQuests() {
      var state = _StateManager["default"].getState();
      return state.quests.active;
    }

    /**
     * Get completed quests
     */
  }, {
    key: "getCompletedQuests",
    value: function getCompletedQuests() {
      var state = _StateManager["default"].getState();
      return state.quests.completed;
    }

    /**
     * Get quest stats
     */
  }, {
    key: "getStats",
    value: function getStats() {
      var state = _StateManager["default"].getState();
      return {
        active: state.quests.active.length,
        completed: state.quests.completed.length,
        completedToday: state.quests.completedToday,
        dailyLimit: state.quests.dailyLimit,
        remainingToday: state.quests.dailyLimit - state.quests.completedToday
      };
    }

    /**
     * Reset daily quests (called at midnight)
     */
  }, {
    key: "resetDaily",
    value: function resetDaily() {
      var state = _StateManager["default"].getState();

      // Reset daily counter
      state.quests.completedToday = 0;
      state.quests.lastReset = Date.now();

      // Generate new quests if needed
      if (state.quests.active.length < this.maxActiveQuests) {
        this.generateQuests(this.maxActiveQuests - state.quests.active.length);
      }
      _Logger["default"].info('QuestSystem', 'Daily quests reset');
      _EventBus["default"].emit('quests:daily-reset');
    }
  }]);
}(); // Singleton
var questSystem = new QuestSystem();
var _default = exports["default"] = questSystem;

},{"../config.js":1,"../core/StateManager.js":6,"../data/quests.js":12,"../utils/EventBus.js":56,"../utils/Logger.js":58,"./UpgradeSystem.js":33}],27:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _realms = _interopRequireDefault(require("../data/realms.js"));
var _StateManager = _interopRequireDefault(require("../core/StateManager.js"));
var _EventBus = _interopRequireDefault(require("../utils/EventBus.js"));
var _Logger = _interopRequireDefault(require("../utils/Logger.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /**
 * RealmSystem - Handles realm switching and unlocking
 */
var RealmSystem = /*#__PURE__*/function () {
  function RealmSystem() {
    _classCallCheck(this, RealmSystem);
    this.realms = _realms["default"];
    this.initializeState();
    _Logger["default"].info('RealmSystem', 'Initialized with realms:', Object.keys(this.realms));
  }

  /**
   * Initialize realm state
   */
  return _createClass(RealmSystem, [{
    key: "initializeState",
    value: function initializeState() {
      var state = _StateManager["default"].getState();

      // Ensure forest is unlocked
      if (!state.realms.unlocked.includes('forest')) {
        _StateManager["default"].dispatch({
          type: 'UNLOCK_REALM',
          payload: {
            realmId: 'forest',
            cost: 0
          }
        });
      }
    }

    /**
     * Get realm data
     */
  }, {
    key: "getRealm",
    value: function getRealm(realmId) {
      return this.realms[realmId];
    }

    /**
     * Get current realm
     */
  }, {
    key: "getCurrentRealm",
    value: function getCurrentRealm() {
      var state = _StateManager["default"].getState();
      return this.realms[state.realms.current];
    }

    /**
     * Check if realm is unlocked
     */
  }, {
    key: "isUnlocked",
    value: function isUnlocked(realmId) {
      var state = _StateManager["default"].getState();
      return state.realms.unlocked.includes(realmId);
    }

    /**
     * Check if can unlock realm
     */
  }, {
    key: "canUnlock",
    value: function canUnlock(realmId) {
      var realm = this.realms[realmId];
      if (!realm) {
        return {
          can: false,
          reason: 'invalid-realm'
        };
      }
      if (realm.locked) {
        return {
          can: false,
          reason: 'not-implemented'
        };
      }
      if (this.isUnlocked(realmId)) {
        return {
          can: false,
          reason: 'already-unlocked'
        };
      }
      var state = _StateManager["default"].getState();
      var condition = realm.unlockCondition;
      if (!condition) {
        return {
          can: true
        }; // No requirements
      }

      // Check ascension requirement
      if (condition.ascension) {
        if (state.ascension.level < condition.ascension.level) {
          return {
            can: false,
            reason: 'ascension-required',
            required: condition.ascension.level,
            current: state.ascension.level
          };
        }
      }

      // Check boss requirements
      if (condition.bosses) {
        for (var _i = 0, _Object$entries = Object.entries(condition.bosses); _i < _Object$entries.length; _i++) {
          var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
            bossId = _Object$entries$_i[0],
            requirement = _Object$entries$_i[1];
          var bossState = state.bosses[bossId];
          if (requirement === 'defeated' && !(bossState !== null && bossState !== void 0 && bossState.defeated)) {
            return {
              can: false,
              reason: 'boss-required',
              bossId: bossId
            };
          }
        }
      }

      // Check realm requirements
      if (condition.realms) {
        for (var _i2 = 0, _Object$entries2 = Object.entries(condition.realms); _i2 < _Object$entries2.length; _i2++) {
          var _Object$entries2$_i = _slicedToArray(_Object$entries2[_i2], 2),
            _realmId = _Object$entries2$_i[0],
            _requirement = _Object$entries2$_i[1];
          if (_requirement === 'unlocked' && !this.isUnlocked(_realmId)) {
            return {
              can: false,
              reason: 'realm-required',
              realmId: _realmId
            };
          }
        }
      }

      // Check cost
      if (realm.unlockCost) {
        for (var _i3 = 0, _Object$entries3 = Object.entries(realm.unlockCost); _i3 < _Object$entries3.length; _i3++) {
          var _Object$entries3$_i = _slicedToArray(_Object$entries3[_i3], 2),
            resource = _Object$entries3$_i[0],
            amount = _Object$entries3$_i[1];
          if (state.resources[resource] < amount) {
            return {
              can: false,
              reason: 'insufficient-resources',
              resource: resource,
              required: amount,
              current: state.resources[resource]
            };
          }
        }
      }
      return {
        can: true
      };
    }

    /**
     * Unlock a realm
     */
  }, {
    key: "unlock",
    value: function unlock(realmId) {
      var canUnlock = this.canUnlock(realmId);
      if (!canUnlock.can) {
        _Logger["default"].warn('RealmSystem', "Cannot unlock ".concat(realmId, ":"), canUnlock.reason);
        _EventBus["default"].emit('realm:unlock-failed', {
          realmId: realmId,
          reason: canUnlock.reason
        });
        return false;
      }
      var realm = this.realms[realmId];
      var cost = 0;
      if (realm.unlockCost) {
        for (var _i4 = 0, _Object$entries4 = Object.entries(realm.unlockCost); _i4 < _Object$entries4.length; _i4++) {
          var _Object$entries4$_i = _slicedToArray(_Object$entries4[_i4], 2),
            resource = _Object$entries4$_i[0],
            amount = _Object$entries4$_i[1];
          cost = amount; // Assuming single resource cost
        }
      }

      // Unlock realm
      _StateManager["default"].dispatch({
        type: 'UNLOCK_REALM',
        payload: {
          realmId: realmId,
          cost: cost
        }
      });
      _Logger["default"].info('RealmSystem', "Unlocked realm: ".concat(realm.name));

      // Show notification
      _EventBus["default"].emit('notification:show', {
        type: 'realm',
        title: 'Realm Unlocked!',
        message: "".concat(realm.emoji, " ").concat(realm.name),
        description: realm.lore,
        duration: 7000
      });
      _EventBus["default"].emit('realm:unlocked', {
        realmId: realmId,
        realm: realm
      });
      return true;
    }

    /**
     * Switch to a realm
     */
  }, {
    key: "switchTo",
    value: function switchTo(realmId) {
      if (!this.isUnlocked(realmId)) {
        _Logger["default"].warn('RealmSystem', "Realm ".concat(realmId, " is not unlocked"));
        _EventBus["default"].emit('realm:switch-failed', {
          realmId: realmId,
          reason: 'locked'
        });
        return false;
      }
      var state = _StateManager["default"].getState();
      if (state.realms.current === realmId) {
        _Logger["default"].warn('RealmSystem', "Already in realm ".concat(realmId));
        return false;
      }
      _StateManager["default"].dispatch({
        type: 'SWITCH_REALM',
        payload: {
          realmId: realmId
        }
      });
      var realm = this.realms[realmId];
      _Logger["default"].info('RealmSystem', "Switched to realm: ".concat(realm.name));
      _EventBus["default"].emit('realm:switched', {
        realmId: realmId,
        realm: realm
      });
      return true;
    }

    /**
     * Get unlocked realms
     */
  }, {
    key: "getUnlockedRealms",
    value: function getUnlockedRealms() {
      var _this = this;
      var state = _StateManager["default"].getState();
      return state.realms.unlocked.map(function (id) {
        return _this.realms[id];
      });
    }

    /**
     * Get available realms (can be unlocked)
     */
  }, {
    key: "getAvailableRealms",
    value: function getAvailableRealms() {
      var available = [];
      for (var _i5 = 0, _Object$entries5 = Object.entries(this.realms); _i5 < _Object$entries5.length; _i5++) {
        var _Object$entries5$_i = _slicedToArray(_Object$entries5[_i5], 2),
          id = _Object$entries5$_i[0],
          realm = _Object$entries5$_i[1];
        if (realm.locked) continue;
        if (this.isUnlocked(id)) continue;
        var canUnlock = this.canUnlock(id);
        available.push({
          id: id,
          realm: realm,
          canUnlock: canUnlock.can,
          reason: canUnlock.reason
        });
      }
      return available;
    }

    /**
     * Get realm bonuses
     */
  }, {
    key: "getRealmBonuses",
    value: function getRealmBonuses() {
      var realmId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var state = _StateManager["default"].getState();
      var currentRealmId = realmId || state.realms.current;
      var realm = this.realms[currentRealmId];
      return (realm === null || realm === void 0 ? void 0 : realm.bonuses) || {};
    }

    /**
     * Get realm stats
     */
  }, {
    key: "getStats",
    value: function getStats() {
      var _this2 = this;
      var state = _StateManager["default"].getState();
      return {
        current: state.realms.current,
        unlocked: state.realms.unlocked.length,
        total: Object.keys(this.realms).filter(function (id) {
          return !_this2.realms[id].locked;
        }).length,
        percentage: state.realms.unlocked.length / Object.keys(this.realms).filter(function (id) {
          return !_this2.realms[id].locked;
        }).length * 100
      };
    }
  }]);
}(); // Singleton
var realmSystem = new RealmSystem();
var _default = exports["default"] = realmSystem;

},{"../core/StateManager.js":6,"../data/realms.js":13,"../utils/EventBus.js":56,"../utils/Logger.js":58}],28:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _shop = _interopRequireDefault(require("../data/shop.js"));
var _StateManager = _interopRequireDefault(require("../core/StateManager.js"));
var _EventBus = _interopRequireDefault(require("../utils/EventBus.js"));
var _Logger = _interopRequireDefault(require("../utils/Logger.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /**
 * ShopSystem - Handles shop purchases, VIP, ads
 */
var ShopSystem = /*#__PURE__*/function () {
  function ShopSystem() {
    _classCallCheck(this, ShopSystem);
    this.items = _shop["default"];
    this.maxAdsPerDay = 20;
    this.initializeState();
    this.checkDailyDeal();
    this.checkVIPExpiry();
    _Logger["default"].info('ShopSystem', 'Initialized');
  }

  /**
   * Initialize shop state
   */
  return _createClass(ShopSystem, [{
    key: "initializeState",
    value: function initializeState() {
      var state = _StateManager["default"].getState();
      if (!state.shop) {
        // Initialize in StateManager getInitialState
      }
    }

    /**
     * Purchase gem package (mock)
     */
  }, {
    key: "purchasePackage",
    value: function purchasePackage(packageId) {
      var pkg = this.items.gemPackages[packageId];
      if (!pkg) {
        _Logger["default"].error('ShopSystem', "Package ".concat(packageId, " not found"));
        return false;
      }

      // In real implementation, this would trigger IAP
      _Logger["default"].info('ShopSystem', "Initiating purchase: ".concat(pkg.name, " (").concat(pkg.priceDisplay, ")"));
      _EventBus["default"].emit('shop:purchase-initiated', {
        packageId: packageId,
        pkg: pkg
      });

      // For demo, complete immediately
      this.completePurchase(packageId);
      return true;
    }

    /**
     * Complete purchase (called after payment)
     */
  }, {
    key: "completePurchase",
    value: function completePurchase(packageId) {
      var pkg = this.items.gemPackages[packageId];
      if (!pkg) {
        _Logger["default"].error('ShopSystem', "Package ".concat(packageId, " not found"));
        return false;
      }

      // Give gems
      _StateManager["default"].dispatch({
        type: 'ADD_RESOURCE',
        payload: {
          resource: 'gems',
          amount: pkg.gems
        }
      });

      // Give bonuses
      if (pkg.bonus) {
        for (var _i = 0, _Object$entries = Object.entries(pkg.bonus); _i < _Object$entries.length; _i++) {
          var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
            resource = _Object$entries$_i[0],
            amount = _Object$entries$_i[1];
          if (resource === 'guardian') {
            // Summon guardians
            var guardianSystem = require('./GuardianSystem.js')["default"];
            for (var i = 0; i < amount; i++) {
              guardianSystem.summon();
            }
          } else if (resource === 'guaranteedLegendary') {
            // Summon legendary guardian
            this.summonGuaranteedLegendary(amount);
          } else {
            _StateManager["default"].dispatch({
              type: 'ADD_RESOURCE',
              payload: {
                resource: resource,
                amount: amount
              }
            });
          }
        }
      }

      // Track purchase
      _StateManager["default"].dispatch({
        type: 'RECORD_PURCHASE',
        payload: {
          packageId: packageId,
          price: pkg.price,
          gems: pkg.gems,
          timestamp: Date.now()
        }
      });
      _Logger["default"].info('ShopSystem', "Purchase completed: ".concat(pkg.name));
      _EventBus["default"].emit('shop:purchase-completed', {
        packageId: packageId,
        pkg: pkg
      });

      // Show success notification
      _EventBus["default"].emit('notification:show', {
        type: 'purchase',
        title: 'Purchase Complete!',
        message: "".concat(pkg.gems, " \uD83D\uDC8E gems added!"),
        duration: 5000
      });
      return true;
    }

    // Adaugă după metoda completePurchase()

    /**
     * Purchase spin package
     */
  }, {
    key: "purchaseSpinPackage",
    value: function purchaseSpinPackage(packageId) {
      var pkg = this.items.miniGamesPackages[packageId];
      if (!pkg) {
        _Logger["default"].error('ShopSystem', "Spin package ".concat(packageId, " not found"));
        return false;
      }

      // In real implementation, this would trigger IAP
      _Logger["default"].info('ShopSystem', "Initiating spin purchase: ".concat(pkg.name, " (").concat(pkg.priceDisplay, ")"));
      _EventBus["default"].emit('shop:purchase-initiated', {
        packageId: packageId,
        pkg: pkg
      });

      // For demo, complete immediately
      this.completeSpinPurchase(packageId);
      return true;
    }

    /**
     * Complete spin purchase (called after payment)
     */
  }, {
    key: "completeSpinPurchase",
    value: function completeSpinPurchase(packageId) {
      var pkg = this.items.miniGamesPackages[packageId];
      if (!pkg) {
        _Logger["default"].error('ShopSystem', "Spin package ".concat(packageId, " not found"));
        return false;
      }
      if (pkg.unlimited) {
        // Grant unlimited spins for 24h
        _StateManager["default"].dispatch({
          type: 'ACTIVATE_UNLIMITED_SPINS',
          payload: {
            expiresAt: Date.now() + pkg.duration
          }
        });
        _Logger["default"].info('ShopSystem', 'Unlimited spins activated for 24h');
      } else {
        // Add purchased spins
        var DailySpinGame = require('../ui/games/DailySpinGame.js')["default"];
        DailySpinGame.addPurchasedSpins(pkg.spins);
      }

      // Give bonuses
      if (pkg.bonus) {
        for (var _i2 = 0, _Object$entries2 = Object.entries(pkg.bonus); _i2 < _Object$entries2.length; _i2++) {
          var _Object$entries2$_i = _slicedToArray(_Object$entries2[_i2], 2),
            resource = _Object$entries2$_i[0],
            amount = _Object$entries2$_i[1];
          _StateManager["default"].dispatch({
            type: 'ADD_RESOURCE',
            payload: {
              resource: resource,
              amount: amount
            }
          });
        }
      }

      // Track purchase
      _StateManager["default"].dispatch({
        type: 'RECORD_PURCHASE',
        payload: {
          packageId: packageId,
          price: pkg.price,
          spins: pkg.spins || 'unlimited',
          timestamp: Date.now()
        }
      });
      _Logger["default"].info('ShopSystem', "Spin purchase completed: ".concat(pkg.name));
      _EventBus["default"].emit('shop:purchase-completed', {
        packageId: packageId,
        pkg: pkg
      });
      _EventBus["default"].emit('daily-spin:purchased-spins', {
        spins: pkg.spins
      });

      // Show success notification
      var message = pkg.unlimited ? '∞ Unlimited spins for 24h!' : "+".concat(pkg.spins, " \uD83C\uDFA1 extra spins!");
      _EventBus["default"].emit('notification:show', {
        type: 'purchase',
        title: 'Purchase Complete!',
        message: message,
        duration: 5000
      });
      return true;
    }

    /**
     * Summon guaranteed legendary
     */
  }, {
    key: "summonGuaranteedLegendary",
    value: function summonGuaranteedLegendary(count) {
      var guardianPool = require('../data/guardians.js')["default"];

      // Get all legendary guardians
      var legendaryGuardians = Object.entries(guardianPool).filter(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
          key = _ref2[0],
          data = _ref2[1];
        return data.rarities.includes('legendary');
      });
      for (var i = 0; i < count; i++) {
        if (legendaryGuardians.length === 0) break;
        var _legendaryGuardians$M = _slicedToArray(legendaryGuardians[Math.floor(Math.random() * legendaryGuardians.length)], 2),
          guardianKey = _legendaryGuardians$M[0],
          guardianData = _legendaryGuardians$M[1];

        // Roll bonus in legendary range
        var rarityData = require('../data/guardians.js').RARITIES.legendary;
        var _rarityData$bonusRang = _slicedToArray(rarityData.bonusRange, 2),
          min = _rarityData$bonusRang[0],
          max = _rarityData$bonusRang[1];
        var bonus = Math.floor(Math.random() * (max - min + 1)) + min;
        var guardian = {
          id: Date.now() + Math.random(),
          key: guardianKey,
          name: guardianData.name,
          emoji: guardianData.emoji,
          type: guardianData.type,
          rarity: 'legendary',
          bonus: bonus,
          summonedAt: Date.now(),
          special: guardianData.special || null,
          source: 'Shop Purchase'
        };
        _StateManager["default"].dispatch({
          type: 'ADD_GUARDIAN_DIRECT',
          payload: {
            guardian: guardian
          }
        });
        _Logger["default"].info('ShopSystem', "Awarded legendary guardian: ".concat(guardian.name));
      }
    }

    /**
     * Purchase VIP
     */
  }, {
    key: "purchaseVIP",
    value: function purchaseVIP() {
      var vip = this.items.vip;
      _Logger["default"].info('ShopSystem', "Initiating VIP purchase: ".concat(vip.priceDisplay));
      _EventBus["default"].emit('shop:vip-initiated', {
        vip: vip
      });

      // For demo, activate immediately
      this.activateVIP();
      return true;
    }

    /**
     * Activate VIP
     */
  }, {
    key: "activateVIP",
    value: function activateVIP() {
      var vip = this.items.vip;
      var now = Date.now();
      var expiryTime = now + vip.duration;
      _StateManager["default"].dispatch({
        type: 'ACTIVATE_VIP',
        payload: {
          expiryTime: expiryTime,
          benefits: vip.benefits
        }
      });
      _Logger["default"].info('ShopSystem', 'VIP activated until', new Date(expiryTime));
      _EventBus["default"].emit('shop:vip-activated', {
        expiryTime: expiryTime
      });

      // Show notification
      _EventBus["default"].emit('notification:show', {
        type: 'vip',
        title: 'VIP Activated!',
        message: '👑 Welcome to VIP',
        description: 'Enjoy premium benefits for 30 days!',
        duration: 7000
      });
      return true;
    }

    /**
     * Check VIP expiry
     */
  }, {
    key: "checkVIPExpiry",
    value: function checkVIPExpiry() {
      var state = _StateManager["default"].getState();
      if (state.shop.vipActive && Date.now() > state.shop.vipExpiry) {
        _StateManager["default"].dispatch({
          type: 'DEACTIVATE_VIP'
        });
        _Logger["default"].info('ShopSystem', 'VIP expired');
        _EventBus["default"].emit('notification:show', {
          type: 'info',
          title: 'VIP Expired',
          message: 'Your VIP membership has ended',
          duration: 5000
        });
      }
    }

    /**
     * Check if VIP is active
     */
  }, {
    key: "isVIPActive",
    value: function isVIPActive() {
      var state = _StateManager["default"].getState();
      return state.shop.vipActive && Date.now() < state.shop.vipExpiry;
    }

    /**
     * Get VIP benefits
     */
  }, {
    key: "getVIPBenefits",
    value: function getVIPBenefits() {
      if (!this.isVIPActive()) {
        return null;
      }
      return this.items.vip.benefits;
    }

    /**
     * Watch rewarded ad
     */
  }, {
    key: "watchAd",
    value: function watchAd(adType) {
      var _state$shop$adWatchCo;
      var ad = this.items.rewardedAds[adType];
      if (!ad) {
        _Logger["default"].error('ShopSystem', "Ad type ".concat(adType, " not found"));
        return false;
      }
      var state = _StateManager["default"].getState();

      // Check daily limit
      var today = new Date().toDateString();
      var lastReset = new Date(state.shop.lastAdReset).toDateString();
      if (today !== lastReset) {
        // Reset daily counter
        _StateManager["default"].dispatch({
          type: 'RESET_AD_COUNTER'
        });
      }
      if (state.shop.adsWatchedToday >= this.maxAdsPerDay) {
        _Logger["default"].warn('ShopSystem', 'Daily ad limit reached');
        _EventBus["default"].emit('shop:ad-limit-reached');
        return false;
      }

      // Check ad-specific limit
      var adWatchCount = ((_state$shop$adWatchCo = state.shop.adWatchCount) === null || _state$shop$adWatchCo === void 0 ? void 0 : _state$shop$adWatchCo[adType]) || 0;
      if (adWatchCount >= ad.dailyLimit) {
        _Logger["default"].warn('ShopSystem', "Daily limit for ".concat(adType, " reached"));
        return false;
      }

      // Show ad (mock)
      _Logger["default"].info('ShopSystem', "Showing ad: ".concat(ad.name));
      _EventBus["default"].emit('shop:ad-started', {
        adType: adType,
        ad: ad
      });

      // Simulate ad duration (30 seconds)
      this.showMockAd(adType, ad);
      return true;
    }

    /**
     * Show mock ad with countdown
     */
  }, {
    key: "showMockAd",
    value: function showMockAd(adType, ad) {
      var _this = this;
      var timeLeft = 5; // 5 seconds for demo (real would be 30)

      var countdown = setInterval(function () {
        timeLeft--;
        _EventBus["default"].emit('shop:ad-countdown', {
          timeLeft: timeLeft
        });
        if (timeLeft <= 0) {
          clearInterval(countdown);
          _this.completeAd(adType, ad);
        }
      }, 1000);
    }

    /**
     * Complete ad watch and give reward
     */
  }, {
    key: "completeAd",
    value: function completeAd(adType, ad) {
      // Give reward
      for (var _i3 = 0, _Object$entries3 = Object.entries(ad.reward); _i3 < _Object$entries3.length; _i3++) {
        var _Object$entries3$_i = _slicedToArray(_Object$entries3[_i3], 2),
          resource = _Object$entries3$_i[0],
          amount = _Object$entries3$_i[1];
        if (resource === 'multiplier') {
          // Apply temporary multiplier
          this.applyTemporaryMultiplier(amount, ad.reward.duration);
        } else {
          _StateManager["default"].dispatch({
            type: 'ADD_RESOURCE',
            payload: {
              resource: resource,
              amount: amount
            }
          });
        }
      }

      // Track ad watch
      _StateManager["default"].dispatch({
        type: 'INCREMENT_AD_WATCH',
        payload: {
          adType: adType
        }
      });
      _Logger["default"].info('ShopSystem', "Ad completed: ".concat(ad.name), ad.reward);
      _EventBus["default"].emit('shop:ad-completed', {
        adType: adType,
        reward: ad.reward
      });

      // Show reward notification
      _EventBus["default"].emit('notification:show', {
        type: 'reward',
        title: 'Ad Reward!',
        message: this.formatAdReward(ad.reward),
        duration: 3000
      });
    }

    /**
     * Apply temporary multiplier
     */
  }, {
    key: "applyTemporaryMultiplier",
    value: function applyTemporaryMultiplier(multiplier, duration) {
      _StateManager["default"].dispatch({
        type: 'APPLY_TEMP_MULTIPLIER',
        payload: {
          multiplier: multiplier,
          expiresAt: Date.now() + duration
        }
      });
      _Logger["default"].info('ShopSystem', "Applied ".concat(multiplier, "x multiplier for ").concat(duration / 1000, "s"));

      // Schedule removal
      setTimeout(function () {
        _StateManager["default"].dispatch({
          type: 'REMOVE_TEMP_MULTIPLIER'
        });
        _EventBus["default"].emit('notification:show', {
          type: 'info',
          message: 'Multiplier expired',
          duration: 2000
        });
      }, duration);
    }

    /**
     * Format ad reward for display
     */
  }, {
    key: "formatAdReward",
    value: function formatAdReward(reward) {
      var parts = [];
      for (var _i4 = 0, _Object$entries4 = Object.entries(reward); _i4 < _Object$entries4.length; _i4++) {
        var _Object$entries4$_i = _slicedToArray(_Object$entries4[_i4], 2),
          resource = _Object$entries4$_i[0],
          amount = _Object$entries4$_i[1];
        if (resource === 'multiplier') {
          parts.push("".concat(amount, "x production boost"));
        } else {
          var icons = {
            energy: '⚡',
            gems: '💎',
            mana: '✨',
            crystals: '💠'
          };
          parts.push("".concat(amount, " ").concat(icons[resource] || resource));
        }
      }
      return parts.join(', ');
    }

    /**
     * Check and refresh daily deal
     */
  }, {
    key: "checkDailyDeal",
    value: function checkDailyDeal() {
      var state = _StateManager["default"].getState();
      var now = Date.now();
      if (!state.shop.dailyDeal || now - state.shop.dailyDeal.refreshedAt > this.items.dailyDeal.refreshTime) {
        this.refreshDailyDeal();
      }
    }

    /**
     * Refresh daily deal
     */
  }, {
    key: "refreshDailyDeal",
    value: function refreshDailyDeal() {
      var deals = this.items.dailyDeal.deals;
      var randomDeal = deals[Math.floor(Math.random() * deals.length)];
      _StateManager["default"].dispatch({
        type: 'REFRESH_DAILY_DEAL',
        payload: {
          deal: randomDeal,
          refreshedAt: Date.now()
        }
      });
      _Logger["default"].info('ShopSystem', "Daily deal refreshed: ".concat(randomDeal.name));
      _EventBus["default"].emit('shop:daily-deal-refreshed', {
        deal: randomDeal
      });
    }

    /**
     * Get shop stats
     */
  }, {
    key: "getStats",
    value: function getStats() {
      var state = _StateManager["default"].getState();
      return {
        totalPurchases: state.shop.purchaseHistory.length,
        totalSpent: state.shop.purchaseHistory.reduce(function (sum, p) {
          return sum + p.price;
        }, 0),
        vipActive: this.isVIPActive(),
        vipExpiry: state.shop.vipExpiry,
        adsWatchedToday: state.shop.adsWatchedToday,
        adsRemaining: this.maxAdsPerDay - state.shop.adsWatchedToday
      };
    }
  }]);
}(); // Singleton
var shopSystem = new ShopSystem();
var _default = exports["default"] = shopSystem;

},{"../core/StateManager.js":6,"../data/guardians.js":10,"../data/shop.js":14,"../ui/games/DailySpinGame.js":53,"../utils/EventBus.js":56,"../utils/Logger.js":58,"./GuardianSystem.js":23}],29:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _StateManager = _interopRequireDefault(require("../core/StateManager.js"));
var _EventBus = _interopRequireDefault(require("../utils/EventBus.js"));
var _Logger = _interopRequireDefault(require("../utils/Logger.js"));
var _Formatters = _interopRequireDefault(require("../utils/Formatters.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /**
 * StatisticsSystem - Track and display game statistics
 */
var StatisticsSystem = /*#__PURE__*/function () {
  function StatisticsSystem() {
    _classCallCheck(this, StatisticsSystem);
    this.categories = {
      general: 'General Stats',
      resources: 'Resources',
      structures: 'Structures',
      upgrades: 'Upgrades',
      guardians: 'Guardians',
      quests: 'Quests',
      puzzles: 'Puzzles',
      bosses: 'Bosses',
      achievements: 'Achievements',
      shop: 'Shop'
    };
    this.subscribeToEvents();
    this.startTracking();
    _Logger["default"].info('StatisticsSystem', 'Initialized');
  }

  /**
   * Subscribe to events for automatic tracking
   */
  return _createClass(StatisticsSystem, [{
    key: "subscribeToEvents",
    value: function subscribeToEvents() {
      var _this = this;
      // Track session start
      _EventBus["default"].on('game:started', function () {
        _this.incrementStat('sessionsPlayed');
        _this.setStat('sessionStartTime', Date.now());
      });

      // Track purchases
      _EventBus["default"].on('structure:purchased', function () {
        _this.incrementStat('structuresPurchased');
      });
      _EventBus["default"].on('upgrade:purchased', function () {
        _this.incrementStat('upgradesPurchased');
      });

      // Track guardians
      _EventBus["default"].on('guardian:summoned', function () {
        _this.incrementStat('guardiansSummoned');
      });

      // Track quests
      _EventBus["default"].on('quest:claimed', function () {
        _this.incrementStat('questsCompleted');
      });

      // Track puzzles
      _EventBus["default"].on('puzzle:won', function (data) {
        _this.incrementStat('puzzlesWon');
        _this.incrementStat('puzzlesPlayed');
        if (data.score > _this.getStat('puzzleHighScore')) {
          _this.setStat('puzzleHighScore', data.score);
        }
      });
      _EventBus["default"].on('puzzle:lost', function () {
        _this.incrementStat('puzzlesPlayed');
      });

      // Track bosses
      _EventBus["default"].on('boss:defeated', function () {
        _this.incrementStat('bossesDefeated');
      });

      // Track achievements
      _EventBus["default"].on('achievement:unlocked', function () {
        _this.incrementStat('achievementsUnlocked');
      });
      _EventBus["default"].on('achievement:claimed', function () {
        _this.incrementStat('achievementsClaimed');
      });

      // Track gems
      _EventBus["default"].on('state:ADD_RESOURCE', function (data) {
        if (data.state.resources.gems > _this.getStat('highestGems')) {
          _this.setStat('highestGems', data.state.resources.gems);
        }
      });

      // Track production
      _EventBus["default"].on('production:updated', function (data) {
        if (data.energy > _this.getStat('highestEnergyPerSecond')) {
          _this.setStat('highestEnergyPerSecond', data.energy);
        }
      });
    }

    /**
     * Start tracking play time
     */
  }, {
    key: "startTracking",
    value: function startTracking() {
      var _this2 = this;
      // Update play time every minute
      setInterval(function () {
        _this2.updatePlayTime();
      }, 60000);
    }

    /**
     * Update total play time
     */
  }, {
    key: "updatePlayTime",
    value: function updatePlayTime() {
      var state = _StateManager["default"].getState();
      var sessionStart = state.statistics.sessionStartTime;
      if (sessionStart) {
        var sessionTime = Date.now() - sessionStart;
        this.incrementStat('totalPlayTime', sessionTime);
        this.setStat('sessionStartTime', Date.now()); // Reset for next interval
      }
    }

    /**
     * Get statistic value
     */
  }, {
    key: "getStat",
    value: function getStat(key) {
      var state = _StateManager["default"].getState();
      return state.statistics[key] || 0;
    }

    /**
     * Set statistic value
     */
  }, {
    key: "setStat",
    value: function setStat(key, value) {
      _StateManager["default"].dispatch({
        type: 'UPDATE_STATISTIC',
        payload: {
          key: key,
          value: value
        }
      });
    }

    /**
     * Increment statistic
     */
  }, {
    key: "incrementStat",
    value: function incrementStat(key) {
      var amount = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
      _StateManager["default"].dispatch({
        type: 'INCREMENT_STATISTIC',
        payload: {
          key: key,
          amount: amount
        }
      });
    }

    /**
     * Get all statistics by category
     */
  }, {
    key: "getAllStats",
    value: function getAllStats() {
      var state = _StateManager["default"].getState();
      var stats = state.statistics;
      var categorized = {
        general: {
          'Sessions Played': stats.sessionsPlayed || 0,
          'Total Play Time': _Formatters["default"].formatTime(stats.totalPlayTime || 0),
          'Account Created': _Formatters["default"].formatDate(state.createdAt)
        },
        resources: {
          'Lifetime Energy': _Formatters["default"].formatNumber(state.ascension.lifetimeEnergy),
          'Current Energy': _Formatters["default"].formatNumber(state.resources.energy),
          'Current Mana': _Formatters["default"].formatNumber(state.resources.mana),
          'Current Gems': _Formatters["default"].formatNumber(state.resources.gems),
          'Current Crystals': _Formatters["default"].formatNumber(state.resources.crystals),
          'Highest Energy/s': _Formatters["default"].formatNumber(stats.highestEnergyPerSecond || 0),
          'Highest Gems': _Formatters["default"].formatNumber(stats.highestGems || 0)
        },
        structures: {
          'Structures Purchased': stats.structuresPurchased || 0,
          'Total Structure Levels': this.getTotalStructureLevels(),
          'Highest Structure Level': this.getHighestStructureLevel(),
          'Favorite Structure': this.getFavoriteStructure()
        },
        upgrades: {
          'Upgrades Purchased': stats.upgradesPurchased || 0,
          'Total Upgrade Levels': this.getTotalUpgradeLevels(),
          'Upgrades Completed': this.getCompletedUpgrades()
        },
        guardians: {
          'Total Guardians': state.guardians.length,
          'Guardians Summoned': stats.guardiansSummoned || 0,
          'Legendary Guardians': this.getLegendaryCount(),
          'Most Powerful Guardian': this.getMostPowerfulGuardian(),
          'Total Guardian Bonus': this.getTotalGuardianBonus()
        },
        quests: {
          'Quests Completed': stats.questsCompleted || 0,
          'Current Streak': state.quests.completedToday || 0
        },
        puzzles: {
          'Puzzles Played': stats.puzzlesPlayed || 0,
          'Puzzles Won': stats.puzzlesWon || 0,
          'Win Rate': this.getPuzzleWinRate(),
          'High Score': stats.puzzleHighScore || 0
        },
        bosses: {
          'Bosses Defeated': stats.bossesDefeated || 0,
          'Bosses Unlocked': this.getBossesUnlocked()
        },
        achievements: {
          'Achievements Unlocked': stats.achievementsUnlocked || 0,
          'Achievements Claimed': stats.achievementsClaimed || 0,
          'Completion': this.getAchievementCompletion()
        },
        shop: {
          'Gems Earned': stats.gemsEarned || 0,
          'Gems Spent': stats.gemsSpent || 0,
          'Net Gems': (stats.gemsEarned || 0) - (stats.gemsSpent || 0),
          'VIP Active': state.shop.vipActive ? 'Yes' : 'No'
        }
      };
      return categorized;
    }

    /**
     * Get total structure levels
     */
  }, {
    key: "getTotalStructureLevels",
    value: function getTotalStructureLevels() {
      var structureSystem = require('./StructureSystem.js')["default"];
      return structureSystem.getStats().totalLevels;
    }

    /**
     * Get highest structure level
     */
  }, {
    key: "getHighestStructureLevel",
    value: function getHighestStructureLevel() {
      var state = _StateManager["default"].getState();
      var highest = 0;
      for (var _i = 0, _Object$values = Object.values(state.structures); _i < _Object$values.length; _i++) {
        var structure = _Object$values[_i];
        if (structure.level > highest) {
          highest = structure.level;
        }
      }
      return highest;
    }

    /**
     * Get favorite structure (most purchased)
     */
  }, {
    key: "getFavoriteStructure",
    value: function getFavoriteStructure() {
      var state = _StateManager["default"].getState();
      var favorite = null;
      var maxLevel = 0;
      for (var _i2 = 0, _Object$entries = Object.entries(state.structures); _i2 < _Object$entries.length; _i2++) {
        var _Object$entries$_i = _slicedToArray(_Object$entries[_i2], 2),
          key = _Object$entries$_i[0],
          structure = _Object$entries$_i[1];
        if (structure.level > maxLevel) {
          maxLevel = structure.level;
          favorite = key;
        }
      }
      if (favorite) {
        var structureSystem = require('./StructureSystem.js')["default"];
        var data = structureSystem.getStructure(favorite);
        return "".concat(data.emoji, " ").concat(data.name);
      }
      return 'None';
    }

    /**
     * Get total upgrade levels
     */
  }, {
    key: "getTotalUpgradeLevels",
    value: function getTotalUpgradeLevels() {
      var upgradeSystem = require('./UpgradeSystem.js')["default"];
      return upgradeSystem.getStats().totalLevels;
    }

    /**
     * Get completed upgrades
     */
  }, {
    key: "getCompletedUpgrades",
    value: function getCompletedUpgrades() {
      var state = _StateManager["default"].getState();
      var completed = 0;
      for (var _i3 = 0, _Object$values2 = Object.values(state.upgrades); _i3 < _Object$values2.length; _i3++) {
        var upgrade = _Object$values2[_i3];
        if (upgrade.level > 0) completed++;
      }
      return completed;
    }

    /**
     * Get legendary guardian count
     */
  }, {
    key: "getLegendaryCount",
    value: function getLegendaryCount() {
      var state = _StateManager["default"].getState();
      return state.guardians.filter(function (g) {
        return g.rarity === 'legendary';
      }).length;
    }

    /**
     * Get most powerful guardian
     */
  }, {
    key: "getMostPowerfulGuardian",
    value: function getMostPowerfulGuardian() {
      var state = _StateManager["default"].getState();
      if (state.guardians.length === 0) return 'None';
      var strongest = state.guardians.reduce(function (best, current) {
        return current.bonus > best.bonus ? current : best;
      });
      return "".concat(strongest.emoji, " ").concat(strongest.name, " (+").concat(strongest.bonus, "%)");
    }

    /**
     * Get total guardian bonus
     */
  }, {
    key: "getTotalGuardianBonus",
    value: function getTotalGuardianBonus() {
      var guardianSystem = require('./GuardianSystem.js')["default"];
      var energyBonus = guardianSystem.getTotalBonus('energy');
      var manaBonus = guardianSystem.getTotalBonus('mana');
      var allBonus = guardianSystem.getTotalBonus('all');
      return "Energy: +".concat(energyBonus, "%, Mana: +").concat(manaBonus, "%, All: +").concat(allBonus, "%");
    }

    /**
     * Get puzzle win rate
     */
  }, {
    key: "getPuzzleWinRate",
    value: function getPuzzleWinRate() {
      var stats = _StateManager["default"].getState().statistics;
      var played = stats.puzzlesPlayed || 0;
      var won = stats.puzzlesWon || 0;
      if (played === 0) return '0%';
      return "".concat((won / played * 100).toFixed(1), "%");
    }

    /**
     * Get bosses unlocked
     */
  }, {
    key: "getBossesUnlocked",
    value: function getBossesUnlocked() {
      var bossSystem = require('./BossSystem.js')["default"];
      return bossSystem.getStats().unlocked;
    }

    /**
     * Get achievement completion
     */
  }, {
    key: "getAchievementCompletion",
    value: function getAchievementCompletion() {
      var achievementSystem = require('./AchievementSystem.js')["default"];
      var progress = achievementSystem.getProgress();
      return "".concat(progress.unlocked, "/").concat(progress.total, " (").concat(progress.percentageUnlocked.toFixed(1), "%)");
    }

    /**
     * Export statistics to file
     */
  }, {
    key: "exportStats",
    value: function exportStats() {
      var stats = this.getAllStats();
      var exportData = {
        version: _StateManager["default"].getState().version,
        exportedAt: new Date().toISOString(),
        statistics: stats
      };
      var json = JSON.stringify(exportData, null, 2);
      var blob = new Blob([json], {
        type: 'application/json'
      });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = "game_statistics_".concat(Date.now(), ".json");
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      _Logger["default"].info('StatisticsSystem', 'Statistics exported');
      return true;
    }

    /**
     * Get milestones reached
     */
  }, {
    key: "getMilestones",
    value: function getMilestones() {
      var state = _StateManager["default"].getState();
      var milestones = [];

      // Energy milestones
      if (state.ascension.lifetimeEnergy >= 1000000) {
        milestones.push({
          name: '1M Lifetime Energy',
          emoji: '⚡'
        });
      }
      if (state.ascension.lifetimeEnergy >= 100000000) {
        milestones.push({
          name: '100M Lifetime Energy',
          emoji: '⚡'
        });
      }

      // Ascension milestones
      if (state.ascension.level >= 1) {
        milestones.push({
          name: 'First Ascension',
          emoji: '✨'
        });
      }
      if (state.ascension.level >= 10) {
        milestones.push({
          name: '10 Ascensions',
          emoji: '✨'
        });
      }

      // Guardian milestones
      if (state.guardians.length >= 50) {
        milestones.push({
          name: '50 Guardians',
          emoji: '🐉'
        });
      }

      // Boss milestones
      if (state.statistics.bossesDefeated >= 5) {
        milestones.push({
          name: '5 Bosses Defeated',
          emoji: '⚔️'
        });
      }
      return milestones;
    }

    /**
     * Get session summary
     */
  }, {
    key: "getSessionSummary",
    value: function getSessionSummary() {
      var state = _StateManager["default"].getState();
      var sessionStart = state.statistics.sessionStartTime;
      if (!sessionStart) {
        return null;
      }
      var sessionDuration = Date.now() - sessionStart;
      return {
        duration: _Formatters["default"].formatTime(sessionDuration),
        structuresPurchased: state.statistics.structuresPurchasedThisSession || 0,
        upgradesPurchased: state.statistics.upgradesPurchasedThisSession || 0,
        questsCompleted: state.statistics.questsCompletedThisSession || 0,
        guardiansSummoned: state.statistics.guardiansSummonedThisSession || 0
      };
    }
  }]);
}(); // Singleton
var statisticsSystem = new StatisticsSystem();
var _default = exports["default"] = statisticsSystem;

},{"../core/StateManager.js":6,"../utils/EventBus.js":56,"../utils/Formatters.js":57,"../utils/Logger.js":58,"./AchievementSystem.js":18,"./BossSystem.js":21,"./GuardianSystem.js":23,"./StructureSystem.js":30,"./UpgradeSystem.js":33}],30:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _structures = _interopRequireDefault(require("../data/structures.js"));
var _StateManager = _interopRequireDefault(require("../core/StateManager.js"));
var _EventBus = _interopRequireDefault(require("../utils/EventBus.js"));
var _Logger = _interopRequireDefault(require("../utils/Logger.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /**
 * StructureSystem - Handles all structure-related logic
 */
var StructureSystem = /*#__PURE__*/function () {
  function StructureSystem() {
    _classCallCheck(this, StructureSystem);
    this.structures = _structures["default"];

    // Initialize structures in state if needed
    this.initializeState();

    // Subscribe to state changes
    this.subscribeToEvents();
    _Logger["default"].info('StructureSystem', 'Initialized with structures:', Object.keys(this.structures));
  }

  /**
   * Initialize structure state
   */
  return _createClass(StructureSystem, [{
    key: "initializeState",
    value: function initializeState() {
      var state = _StateManager["default"].getState();

      // Ensure all structures exist in state
      for (var _i = 0, _Object$keys = Object.keys(this.structures); _i < _Object$keys.length; _i++) {
        var key = _Object$keys[_i];
        if (!state.structures[key]) {
          // Will be added when first purchased
        }
      }
    }

    /**
     * Subscribe to relevant events
     */
  }, {
    key: "subscribeToEvents",
    value: function subscribeToEvents() {
      var _this = this;
      // Recalculate production when structures change
      _EventBus["default"].on('state:BUY_STRUCTURE', function () {
        _this.recalculateProduction();
      });

      // Recalculate when upgrades change
      _EventBus["default"].on('state:BUY_UPGRADE', function () {
        _this.recalculateProduction();
      });

      // Recalculate when guardians change
      _EventBus["default"].on('state:ADD_GUARDIAN', function () {
        _this.recalculateProduction();
      });

      // Initial calculation
      this.recalculateProduction();
    }

    /**
     * Get structure definition
     */
  }, {
    key: "getStructure",
    value: function getStructure(key) {
      return this.structures[key];
    }

    /**
     * Get all structures for current realm
     */
  }, {
    key: "getStructuresForRealm",
    value: function getStructuresForRealm() {
      var realmId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var state = _StateManager["default"].getState();
      var currentRealm = realmId || state.realms.current;
      return Object.entries(this.structures).filter(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
          key = _ref2[0],
          data = _ref2[1];
        // Forest structures have no realm specified
        if (currentRealm === 'forest') {
          return !data.realm || data.realm === 'forest';
        }
        // Other realms
        return data.realm === currentRealm;
      }).reduce(function (obj, _ref3) {
        var _ref4 = _slicedToArray(_ref3, 2),
          key = _ref4[0],
          data = _ref4[1];
        obj[key] = data;
        return obj;
      }, {});
    }

    /**
     * Check if structure is unlocked
     */
  }, {
    key: "isUnlocked",
    value: function isUnlocked(structureKey) {
      var structure = this.structures[structureKey];
      if (!structure) return false;
      if (!structure.unlockCondition) return true;
      var state = _StateManager["default"].getState();
      var condition = structure.unlockCondition;

      // Check resource requirements
      if (condition.resources) {
        for (var _i2 = 0, _Object$entries = Object.entries(condition.resources); _i2 < _Object$entries.length; _i2++) {
          var _Object$entries$_i = _slicedToArray(_Object$entries[_i2], 2),
            resource = _Object$entries$_i[0],
            amount = _Object$entries$_i[1];
          if (state.resources[resource] < amount) {
            return false;
          }
        }
      }

      // Check structure requirements
      if (condition.structures) {
        for (var _i3 = 0, _Object$entries2 = Object.entries(condition.structures); _i3 < _Object$entries2.length; _i3++) {
          var _state$structures$req;
          var _Object$entries2$_i = _slicedToArray(_Object$entries2[_i3], 2),
            reqStructure = _Object$entries2$_i[0],
            reqLevel = _Object$entries2$_i[1];
          var currentLevel = ((_state$structures$req = state.structures[reqStructure]) === null || _state$structures$req === void 0 ? void 0 : _state$structures$req.level) || 0;
          if (currentLevel < reqLevel) {
            return false;
          }
        }
      }

      // Check upgrade requirements
      if (condition.upgrades) {
        for (var _i4 = 0, _Object$entries3 = Object.entries(condition.upgrades); _i4 < _Object$entries3.length; _i4++) {
          var _state$upgrades$reqUp;
          var _Object$entries3$_i = _slicedToArray(_Object$entries3[_i4], 2),
            reqUpgrade = _Object$entries3$_i[0],
            _reqLevel = _Object$entries3$_i[1];
          var _currentLevel = ((_state$upgrades$reqUp = state.upgrades[reqUpgrade]) === null || _state$upgrades$reqUp === void 0 ? void 0 : _state$upgrades$reqUp.level) || 0;
          if (_currentLevel < _reqLevel) {
            return false;
          }
        }
      }

      // Check ascension requirements
      if (condition.ascension) {
        if (state.ascension.level < condition.ascension.level) {
          return false;
        }
      }

      // Check realm requirements
      if (condition.realms) {
        for (var _i5 = 0, _Object$entries4 = Object.entries(condition.realms); _i5 < _Object$entries4.length; _i5++) {
          var _Object$entries4$_i = _slicedToArray(_Object$entries4[_i5], 2),
            realm = _Object$entries4$_i[0],
            required = _Object$entries4$_i[1];
          if (required && !state.realms.unlocked.includes(realm)) {
            return false;
          }
        }
      }
      return true;
    }

    /**
     * Get structure level
     */
  }, {
    key: "getLevel",
    value: function getLevel(structureKey) {
      var _state$structures$str;
      var state = _StateManager["default"].getState();
      return ((_state$structures$str = state.structures[structureKey]) === null || _state$structures$str === void 0 ? void 0 : _state$structures$str.level) || 0;
    }

    /**
     * Calculate cost for next level
     */
  }, {
    key: "getCost",
    value: function getCost(structureKey) {
      var structure = this.structures[structureKey];
      if (!structure) return 0;
      var currentLevel = this.getLevel(structureKey);
      return Math.floor(structure.baseCost * Math.pow(structure.costMultiplier, currentLevel));
    }

    /**
     * Calculate production for structure
     */
  }, {
    key: "getProduction",
    value: function getProduction(structureKey) {
      var structure = this.structures[structureKey];
      if (!structure) return 0;
      var level = this.getLevel(structureKey);
      if (level === 0) return 0;

      // Base production
      var production = structure.baseProduction * Math.pow(level, structure.productionExponent);

      // Apply global multipliers
      var multipliers = this.getGlobalMultipliers(structure.resource);
      production *= multipliers.total;

      // Apply structure-specific synergies
      var synergies = this.getSynergies(structureKey);
      production *= synergies;
      return production;
    }

    /**
     * Get global multipliers for resource type
     */
  }, {
    key: "getGlobalMultipliers",
    value: function getGlobalMultipliers(resource) {
      var state = _StateManager["default"].getState();
      var multipliers = {
        ascension: 1,
        upgrades: 1,
        guardians: 1,
        total: 1
      };

      // Ascension bonus
      if (state.ascension.level > 0) {
        multipliers.ascension = 1 + state.ascension.level * 0.1;
      }

      // ===== FIX: Use UpgradeSystem instead of duplicate logic =====
      var upgradeSystem = require('./UpgradeSystem.js')["default"];
      multipliers.upgrades = upgradeSystem.getProductionMultiplier(resource);
      // ===== END FIX =====

      // Guardian bonuses
      var guardianSystem = require('./GuardianSystem.js')["default"];
      multipliers.guardians = guardianSystem.getProductionMultiplier(resource);

      // Calculate total
      multipliers.total = multipliers.ascension * multipliers.upgrades * multipliers.guardians;
      return multipliers;
    }

    /**
     * Get structure-specific synergies
     */
  }, {
    key: "getSynergies",
    value: function getSynergies(structureKey) {
      var state = _StateManager["default"].getState();
      var synergyMultiplier = 1;

      // Example: Solar Synergy upgrade
      if (structureKey === 'solarPanel' && state.upgrades.solarSynergy) {
        synergyMultiplier *= 1 + state.upgrades.solarSynergy.level * 0.5;
      }

      // Add more synergies as needed

      return synergyMultiplier;
    }

    /**
     * Check if can afford structure
     */
  }, {
    key: "canAfford",
    value: function canAfford(structureKey) {
      var structure = this.structures[structureKey];
      if (!structure) return false;
      var cost = this.getCost(structureKey);
      var state = _StateManager["default"].getState();
      var costResource = structure.costResource;
      return state.resources[costResource] >= cost;
    }

    /**
     * Buy structure (increment level)
     */
  }, {
    key: "buy",
    value: function buy(structureKey) {
      // Validate
      if (!this.isUnlocked(structureKey)) {
        _Logger["default"].warn('StructureSystem', "Structure ".concat(structureKey, " is not unlocked"));
        _EventBus["default"].emit('structure:purchase-failed', {
          structureKey: structureKey,
          reason: 'locked'
        });
        return false;
      }
      if (!this.canAfford(structureKey)) {
        _Logger["default"].warn('StructureSystem', "Cannot afford ".concat(structureKey));
        _EventBus["default"].emit('structure:purchase-failed', {
          structureKey: structureKey,
          reason: 'insufficient-resources'
        });
        return false;
      }
      var cost = this.getCost(structureKey);

      // Dispatch purchase
      _StateManager["default"].dispatch({
        type: 'BUY_STRUCTURE',
        payload: {
          structureKey: structureKey,
          cost: cost
        }
      });
      var newLevel = this.getLevel(structureKey);
      _Logger["default"].info('StructureSystem', "Purchased ".concat(structureKey, " (level ").concat(newLevel, ")"));

      // Emit success event
      _EventBus["default"].emit('structure:purchased', {
        structureKey: structureKey,
        level: newLevel,
        cost: cost,
        production: this.getProduction(structureKey)
      });
      return true;
    }

    /**
     * Buy maximum affordable structures
     */
  }, {
    key: "buyMax",
    value: function buyMax(structureKey) {
      var maxPurchases = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 100;
      var purchased = 0;
      for (var i = 0; i < maxPurchases; i++) {
        if (this.buy(structureKey)) {
          purchased++;
        } else {
          break;
        }
      }
      if (purchased > 0) {
        _Logger["default"].info('StructureSystem', "Bought ".concat(purchased, "x ").concat(structureKey));
        _EventBus["default"].emit('structure:bulk-purchased', {
          structureKey: structureKey,
          count: purchased,
          level: this.getLevel(structureKey)
        });
      }
      return purchased;
    }

    /**
     * Recalculate total production
     */
  }, {
    key: "recalculateProduction",
    value: function recalculateProduction() {
      var state = _StateManager["default"].getState();
      var energyProduction = 0;
      var manaProduction = 0;
      var volcanicProduction = 0;

      // Sum production from all structures
      for (var _i6 = 0, _Object$entries5 = Object.entries(this.structures); _i6 < _Object$entries5.length; _i6++) {
        var _Object$entries5$_i = _slicedToArray(_Object$entries5[_i6], 2),
          key = _Object$entries5$_i[0],
          structure = _Object$entries5$_i[1];
        var level = this.getLevel(key);
        if (level === 0) continue;
        var production = this.getProduction(key);
        switch (structure.resource) {
          case 'energy':
            energyProduction += production;
            break;
          case 'mana':
            manaProduction += production;
            break;
          case 'volcanicEnergy':
            volcanicProduction += production;
            break;
          case 'gems':
            // Gems production is handled separately (very slow)
            break;
        }
      }

      // Update state
      _StateManager["default"].dispatch({
        type: 'SET_PRODUCTION',
        payload: {
          resource: 'energy',
          amount: energyProduction
        }
      });
      _StateManager["default"].dispatch({
        type: 'SET_PRODUCTION',
        payload: {
          resource: 'mana',
          amount: manaProduction
        }
      });
      _StateManager["default"].dispatch({
        type: 'SET_PRODUCTION',
        payload: {
          resource: 'volcanicEnergy',
          amount: volcanicProduction
        }
      });
      _Logger["default"].debug('StructureSystem', 'Production recalculated', {
        energy: energyProduction,
        mana: manaProduction,
        volcanic: volcanicProduction
      });
      _EventBus["default"].emit('production:updated', {
        energy: energyProduction,
        mana: manaProduction,
        volcanicEnergy: volcanicProduction
      });
    }

    /**
     * Get all structure stats
     */
  }, {
    key: "getStats",
    value: function getStats() {
      var state = _StateManager["default"].getState();
      var stats = {
        totalStructures: 0,
        totalLevels: 0,
        byTier: {
          1: 0,
          2: 0,
          3: 0
        },
        byResource: {
          energy: 0,
          mana: 0,
          volcanicEnergy: 0,
          gems: 0
        }
      };
      for (var _i7 = 0, _Object$entries6 = Object.entries(this.structures); _i7 < _Object$entries6.length; _i7++) {
        var _Object$entries6$_i = _slicedToArray(_Object$entries6[_i7], 2),
          key = _Object$entries6$_i[0],
          structure = _Object$entries6$_i[1];
        var level = this.getLevel(key);
        if (level > 0) {
          stats.totalStructures++;
          stats.totalLevels += level;
          stats.byTier[structure.tier] = (stats.byTier[structure.tier] || 0) + level;
          stats.byResource[structure.resource] = (stats.byResource[structure.resource] || 0) + level;
        }
      }
      return stats;
    }

    /**
     * Get unlock progress
     */
  }, {
    key: "getUnlockProgress",
    value: function getUnlockProgress() {
      var _this2 = this;
      var total = Object.keys(this.structures).length;
      var unlocked = Object.keys(this.structures).filter(function (key) {
        return _this2.isUnlocked(key);
      }).length;
      return {
        unlocked: unlocked,
        total: total,
        percentage: unlocked / total * 100
      };
    }
  }]);
}(); // Singleton
var structureSystem = new StructureSystem();
var _default = exports["default"] = structureSystem;

},{"../core/StateManager.js":6,"../data/structures.js":15,"../utils/EventBus.js":56,"../utils/Logger.js":58,"./GuardianSystem.js":23,"./UpgradeSystem.js":33}],31:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _StateManager = _interopRequireDefault(require("../core/StateManager.js"));
var _EventBus = _interopRequireDefault(require("../utils/EventBus.js"));
var _Logger = _interopRequireDefault(require("../utils/Logger.js"));
var _ResourceManager = _interopRequireDefault(require("../core/ResourceManager.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /**
 * TutorialSystem - Interactive tutorial for new players
 */
var TutorialSystem = /*#__PURE__*/function () {
  function TutorialSystem() {
    _classCallCheck(this, TutorialSystem);
    this.steps = this.getTutorialSteps();
    this.currentStep = 0;
    this.active = false;
    this.spotlight = null;
    this.subscribeToEvents();
    _Logger["default"].info('TutorialSystem', 'Initialized');
  }

  /**
   * Get tutorial steps
   */
  return _createClass(TutorialSystem, [{
    key: "getTutorialSteps",
    value: function getTutorialSteps() {
      var _this = this;
      return [{
        id: 'welcome',
        title: 'Welcome to Idle Energy Empire!',
        message: 'Let\'s get you started on your journey to infinite energy!',
        target: null,
        position: 'center',
        onClick: null,
        condition: function condition() {
          return true;
        },
        onComplete: null
      }, {
        id: 'resources',
        title: 'Resources',
        message: 'This is your energy counter. Energy is the core resource of the game!',
        target: '#energy-display',
        position: 'bottom',
        highlight: true,
        condition: function condition() {
          return true;
        }
      }, {
        id: 'first_structure',
        title: 'Build Your First Structure',
        message: 'Click on Solar Panel to purchase your first energy generator!',
        target: '.structure-card[data-key="solarPanel"]',
        position: 'right',
        highlight: true,
        onClick: function onClick() {
          // Wait for structure purchase
        },
        condition: function condition() {
          var state = _StateManager["default"].getState();
          return !state.structures.solarPanel || state.structures.solarPanel.level === 0;
        },
        waitFor: 'structure:purchased',
        onComplete: function onComplete() {
          // Give bonus
          _StateManager["default"].dispatch({
            type: 'ADD_RESOURCE',
            payload: {
              resource: 'energy',
              amount: 100
            }
          });
        }
      }, {
        id: 'production',
        title: 'Passive Production',
        message: 'Great! Your Solar Panel is now generating energy automatically. Watch your energy grow!',
        target: '#energy-rate',
        position: 'bottom',
        highlight: true,
        duration: 3000
      }, {
        id: 'buy_more',
        title: 'Scale Up',
        message: 'Buy more structures to increase your energy production!',
        target: '.structure-card[data-key="solarPanel"] .buy-btn',
        position: 'right',
        highlight: true,
        condition: function condition() {
          var _state$structures$sol;
          var state = _StateManager["default"].getState();
          return ((_state$structures$sol = state.structures.solarPanel) === null || _state$structures$sol === void 0 ? void 0 : _state$structures$sol.level) < 3;
        },
        waitFor: 'structure:purchased',
        skipAfter: 30000 // Skip after 30s
      }, {
        id: 'upgrades_tab',
        title: 'Upgrades',
        message: 'Upgrades multiply your production! Let\'s check them out.',
        target: '.tab-btn[data-tab="upgrades"]',
        position: 'bottom',
        highlight: true,
        onClick: 'click',
        condition: function condition() {
          var state = _StateManager["default"].getState();
          return state.resources.energy >= 100;
        }
      }, {
        id: 'first_upgrade',
        title: 'Buy an Upgrade',
        message: 'Energy Boost multiplies ALL your energy production. Very powerful!',
        target: '.upgrade-card[data-key="energyBoost"]',
        position: 'right',
        highlight: true,
        condition: function condition() {
          var upgradeSystem = require('./UpgradeSystem.js')["default"];
          return upgradeSystem.getLevel('energyBoost') === 0;
        },
        waitFor: 'upgrade:purchased'
      }, {
        id: 'upgrade_queue',
        title: 'Upgrade Queue',
        message: 'Higher level upgrades take time to complete. You can queue them up!',
        target: '#upgrade-queue-section',
        position: 'left',
        highlight: true,
        duration: 4000
      }, {
        id: 'guardians_tab',
        title: 'Guardians',
        message: 'Guardians are powerful allies that boost your production!',
        target: '.tab-btn[data-tab="guardians"]',
        position: 'bottom',
        highlight: true,
        onClick: 'click',
        condition: function condition() {
          var state = _StateManager["default"].getState();
          return state.resources.gems >= 100;
        }
      }, {
        id: 'summon_guardian',
        title: 'Summon a Guardian',
        message: 'Use 100 gems to summon your first guardian!',
        target: '#summon-guardian-btn',
        position: 'bottom',
        highlight: true,
        condition: function condition() {
          var state = _StateManager["default"].getState();
          return state.guardians.length === 0;
        },
        waitFor: 'guardian:summoned',
        onComplete: function onComplete() {
          // Give bonus gems
          _StateManager["default"].dispatch({
            type: 'ADD_RESOURCE',
            payload: {
              resource: 'gems',
              amount: 50
            }
          });
        }
      }, {
        id: 'quests_tab',
        title: 'Quests',
        message: 'Complete quests to earn gems and other rewards!',
        target: '.tab-btn[data-tab="quests"]',
        position: 'bottom',
        highlight: true,
        onClick: 'click'
      }, {
        id: 'quest_info',
        title: 'Quest System',
        message: 'You can have up to 3 active quests. They refresh daily!',
        target: '#quests-container',
        position: 'right',
        highlight: true,
        duration: 4000
      }, {
        id: 'achievements',
        title: 'Achievements',
        message: 'Check your achievements for extra rewards!',
        target: '.tab-btn[data-tab="achievements"]',
        position: 'bottom',
        highlight: true,
        onClick: 'click'
      }, {
        id: 'puzzle_intro',
        title: 'Puzzle Mini-Game',
        message: 'Play the puzzle game to earn bonus gems and energy!',
        target: '.tab-btn[data-tab="puzzle"]',
        position: 'bottom',
        highlight: true,
        onClick: 'click'
      }, {
        id: 'ascension_teaser',
        title: 'Ascension (Prestige)',
        message: 'When you reach 10M lifetime energy, you can ascend for permanent bonuses!',
        target: '#ascension-btn',
        position: 'left',
        highlight: true,
        duration: 5000
      }, {
        id: 'tutorial_complete',
        title: 'Tutorial Complete!',
        message: 'You\'re ready to build your energy empire! Here\'s 500 gems to get you started. 💎',
        target: null,
        position: 'center',
        onComplete: function onComplete() {
          _this.completeTutorial();
        }
      }];
    }

    /**
     * Subscribe to events
     */
  }, {
    key: "subscribeToEvents",
    value: function subscribeToEvents() {
      var _this2 = this;
      // Listen for tutorial triggers
      _EventBus["default"].on('game:started', function () {
        _this2.checkShouldStart();
      });

      // Listen for step completion events
      _EventBus["default"].on('structure:purchased', function (data) {
        _this2.checkStepCompletion('structure:purchased', data);
      });
      _EventBus["default"].on('upgrade:purchased', function (data) {
        _this2.checkStepCompletion('upgrade:purchased', data);
      });
      _EventBus["default"].on('guardian:summoned', function (data) {
        _this2.checkStepCompletion('guardian:summoned', data);
      });
    }

    /**
     * Check if tutorial should start
     */
  }, {
    key: "checkShouldStart",
    value: function checkShouldStart() {
      var _this3 = this;
      var state = _StateManager["default"].getState();

      // Don't start if already completed
      if (state.tutorial.completed) {
        return;
      }

      // Don't start if skipped
      if (state.tutorial.skipped) {
        return;
      }

      // Check if veteran player (has progress)
      var isVeteran = state.ascension.lifetimeEnergy > 10000 || state.statistics.sessionsPlayed > 1;
      if (isVeteran) {
        // Ask if they want tutorial
        this.offerTutorial();
      } else {
        // Start automatically for new players
        setTimeout(function () {
          _this3.start();
        }, 2000);
      }
    }

    /**
     * Offer tutorial to returning players
     */
  }, {
    key: "offerTutorial",
    value: function offerTutorial() {
      var _this4 = this;
      _EventBus["default"].emit('tutorial:offer', {
        onAccept: function onAccept() {
          return _this4.start();
        },
        onDecline: function onDecline() {
          return _this4.skip();
        }
      });
    }

    /**
     * Start tutorial
     */
  }, {
    key: "start",
    value: function start() {
      var state = _StateManager["default"].getState();
      if (state.tutorial.completed || state.tutorial.skipped) {
        _Logger["default"].warn('TutorialSystem', 'Tutorial already completed or skipped');
        return false;
      }
      this.active = true;
      this.currentStep = 0;
      _Logger["default"].info('TutorialSystem', 'Tutorial started');
      _EventBus["default"].emit('tutorial:started');
      this.showCurrentStep();
      return true;
    }

    /**
     * Show current step
     */
  }, {
    key: "showCurrentStep",
    value: function showCurrentStep() {
      var _this5 = this;
      if (!this.active) return;
      var step = this.steps[this.currentStep];
      if (!step) {
        this.complete();
        return;
      }

      // Check condition
      if (step.condition && !step.condition()) {
        // Skip this step
        this.next();
        return;
      }
      _Logger["default"].debug('TutorialSystem', "Showing step: ".concat(step.id));

      // Show step UI
      this.displayStep(step);

      // Set up auto-skip if specified
      if (step.skipAfter) {
        setTimeout(function () {
          if (_this5.active && _this5.currentStep === _this5.steps.indexOf(step)) {
            _this5.next();
          }
        }, step.skipAfter);
      }

      // Set up auto-advance for timed steps
      if (step.duration) {
        setTimeout(function () {
          if (_this5.active && _this5.currentStep === _this5.steps.indexOf(step)) {
            _this5.next();
          }
        }, step.duration);
      }
    }

    /**
     * Display step (UI)
     */
  }, {
    key: "displayStep",
    value: function displayStep(step) {
      var _this6 = this;
      // Show tooltip
      this.showTooltip(step);

      // Show spotlight if needed
      if (step.highlight && step.target) {
        this.showSpotlight(step.target);
      }

      // Set up click handler if needed
      if (step.onClick === 'click' && step.target) {
        var element = document.querySelector(step.target);
        if (element) {
          var _clickHandler = function clickHandler() {
            element.removeEventListener('click', _clickHandler);
            _this6.next();
          };
          element.addEventListener('click', _clickHandler);
        }
      }
      _EventBus["default"].emit('tutorial:step-shown', {
        step: step,
        index: this.currentStep
      });
    }

    /**
     * Show tooltip
     */
  }, {
    key: "showTooltip",
    value: function showTooltip(step) {
      var _this7 = this;
      var tooltip = {
        title: step.title,
        message: step.message,
        target: step.target,
        position: step.position || 'auto',
        buttons: []
      };

      // Add next button if not waiting for event
      if (!step.waitFor) {
        tooltip.buttons.push({
          text: 'Next',
          action: function action() {
            return _this7.next();
          }
        });
      }

      // Add skip button
      tooltip.buttons.push({
        text: 'Skip Tutorial',
        action: function action() {
          return _this7.skip();
        },
        secondary: true
      });
      _EventBus["default"].emit('tutorial:show-tooltip', tooltip);
    }

    /**
     * Show spotlight on element
     */
  }, {
    key: "showSpotlight",
    value: function showSpotlight(selector) {
      var _this8 = this;
      var element = document.querySelector(selector);
      if (!element) {
        _Logger["default"].warn('TutorialSystem', "Spotlight target not found: ".concat(selector));
        return;
      }

      // Create spotlight overlay
      this.spotlight = document.createElement('div');
      this.spotlight.className = 'tutorial-spotlight';
      var rect = element.getBoundingClientRect();
      this.spotlight.style.cssText = "\n      position: fixed;\n      top: ".concat(rect.top - 10, "px;\n      left: ").concat(rect.left - 10, "px;\n      width: ").concat(rect.width + 20, "px;\n      height: ").concat(rect.height + 20, "px;\n      border: 3px solid #f59e0b;\n      border-radius: 8px;\n      box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7);\n      pointer-events: none;\n      z-index: 9998;\n      animation: pulse 2s ease-in-out infinite;\n    ");
      document.body.appendChild(this.spotlight);

      // Update position if element moves
      var updatePosition = function updatePosition() {
        if (!_this8.spotlight) return;
        var newRect = element.getBoundingClientRect();
        _this8.spotlight.style.top = "".concat(newRect.top - 10, "px");
        _this8.spotlight.style.left = "".concat(newRect.left - 10, "px");
      };
      this.spotlightInterval = setInterval(updatePosition, 100);
    }

    /**
     * Hide spotlight
     */
  }, {
    key: "hideSpotlight",
    value: function hideSpotlight() {
      if (this.spotlight) {
        this.spotlight.remove();
        this.spotlight = null;
      }
      if (this.spotlightInterval) {
        clearInterval(this.spotlightInterval);
        this.spotlightInterval = null;
      }
    }

    /**
     * Check if step is complete
     */
  }, {
    key: "checkStepCompletion",
    value: function checkStepCompletion(eventType, data) {
      if (!this.active) return;
      var step = this.steps[this.currentStep];
      if (step && step.waitFor === eventType) {
        // Step completed!
        if (step.onComplete) {
          step.onComplete(data);
        }
        this.next();
      }
    }

    /**
     * Go to next step
     */
  }, {
    key: "next",
    value: function next() {
      if (!this.active) return;
      this.hideSpotlight();
      this.currentStep++;
      if (this.currentStep >= this.steps.length) {
        this.complete();
      } else {
        this.showCurrentStep();
      }
    }

    /**
     * Go to previous step
     */
  }, {
    key: "previous",
    value: function previous() {
      if (!this.active) return;
      if (this.currentStep <= 0) return;
      this.hideSpotlight();
      this.currentStep--;
      this.showCurrentStep();
    }

    /**
     * Skip tutorial
     */
  }, {
    key: "skip",
    value: function skip() {
      if (!this.active) return;
      this.active = false;
      this.hideSpotlight();
      _StateManager["default"].dispatch({
        type: 'SKIP_TUTORIAL'
      });
      _Logger["default"].info('TutorialSystem', 'Tutorial skipped');
      _EventBus["default"].emit('tutorial:skipped');
      _EventBus["default"].emit('tutorial:hide-tooltip');
    }

    /**
     * Complete tutorial
     */
  }, {
    key: "complete",
    value: function complete() {
      this.active = false;
      this.hideSpotlight();

      // Give completion reward
      _StateManager["default"].dispatch({
        type: 'ADD_RESOURCE',
        payload: {
          resource: 'gems',
          amount: 500
        }
      });
      _StateManager["default"].dispatch({
        type: 'COMPLETE_TUTORIAL'
      });
      _Logger["default"].info('TutorialSystem', 'Tutorial completed');
      _EventBus["default"].emit('tutorial:completed');
      _EventBus["default"].emit('tutorial:hide-tooltip');

      // Show completion notification
      _EventBus["default"].emit('notification:show', {
        type: 'success',
        title: '🎓 Tutorial Complete!',
        message: 'You earned 500 gems!',
        duration: 7000
      });
    }

    /**
     * Replay tutorial
     */
  }, {
    key: "replay",
    value: function replay() {
      _StateManager["default"].dispatch({
        type: 'RESET_TUTORIAL'
      });
      this.start();
    }

    /**
     * Get tutorial progress
     */
  }, {
    key: "getProgress",
    value: function getProgress() {
      return {
        currentStep: this.currentStep,
        totalSteps: this.steps.length,
        percentage: this.currentStep / this.steps.length * 100,
        active: this.active
      };
    }
  }]);
}(); // Singleton
var tutorialSystem = new TutorialSystem();
var _default = exports["default"] = tutorialSystem;

},{"../core/ResourceManager.js":4,"../core/StateManager.js":6,"../utils/EventBus.js":56,"../utils/Logger.js":58,"./UpgradeSystem.js":33}],32:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _config = _interopRequireDefault(require("../config.js"));
var _StateManager = _interopRequireDefault(require("../core/StateManager.js"));
var _EventBus = _interopRequireDefault(require("../utils/EventBus.js"));
var _Logger = _interopRequireDefault(require("../utils/Logger.js"));
var _ResourceManager = _interopRequireDefault(require("../core/ResourceManager.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /**
 * UpgradeQueueSystem - Time-gated upgrade progression
 * Upgrades take time to complete, can be queued, and speed-boosted with gems
 */
var UpgradeQueueSystem = /*#__PURE__*/function () {
  function UpgradeQueueSystem() {
    _classCallCheck(this, UpgradeQueueSystem);
    this.maxQueueSize = 3; // Can queue up to 3 upgrades
    this.instantLevels = 3; // First 3 levels are instant

    this.initializeState();
    this.subscribeToEvents();
    this.startQueueProcessor();
    _Logger["default"].info('UpgradeQueueSystem', 'Initialized');
  }

  /**
   * Initialize state
   */
  return _createClass(UpgradeQueueSystem, [{
    key: "initializeState",
    value: function initializeState() {
      var state = _StateManager["default"].getState();
      if (!state.upgradeQueue) {
        // Add to state
        _StateManager["default"].dispatch({
          type: 'INIT_UPGRADE_QUEUE',
          payload: {
            queue: [],
            slots: 1,
            // Can be upgraded with gems
            activeUpgrade: null
          }
        });
      }
    }

    /**
     * Subscribe to events
     */
  }, {
    key: "subscribeToEvents",
    value: function subscribeToEvents() {
      var _this = this;
      // Process queue every tick
      _EventBus["default"].on('game:tick', function () {
        _this.processQueue();
      });
    }

    /**
     * Calculate upgrade time based on level
     */
  }, {
    key: "calculateUpgradeTime",
    value: function calculateUpgradeTime(upgradeKey, targetLevel) {
      // First few levels are instant
      if (targetLevel <= this.instantLevels) {
        return 0;
      }

      // Base time formula (in seconds)
      // Level 4: 60s (1 min)
      // Level 5: 180s (3 min)
      // Level 6: 420s (7 min)
      // Level 7: 900s (15 min)
      // Level 8: 1800s (30 min)
      // Level 10: 5400s (90 min)
      // Level 15: 21600s (6 hours)
      // Level 20: 43200s (12 hours)

      var baseTime = 30; // 30 seconds base
      var levelMultiplier = Math.pow(1.8, targetLevel - this.instantLevels);
      var timeInSeconds = Math.floor(baseTime * levelMultiplier);

      // Cap at 24 hours
      return Math.min(timeInSeconds * 1000, 86400000); // Convert to ms
    }

    /**
     * Get upgrade time in human-readable format
     */
  }, {
    key: "getUpgradeTimeFormatted",
    value: function getUpgradeTimeFormatted(upgradeKey, targetLevel) {
      var ms = this.calculateUpgradeTime(upgradeKey, targetLevel);
      if (ms === 0) return 'Instant';
      var seconds = Math.floor(ms / 1000);
      var minutes = Math.floor(seconds / 60);
      var hours = Math.floor(minutes / 60);
      if (hours > 0) {
        var remainingMinutes = minutes % 60;
        return "".concat(hours, "h ").concat(remainingMinutes, "m");
      }
      if (minutes > 0) {
        var remainingSeconds = seconds % 60;
        return "".concat(minutes, "m ").concat(remainingSeconds, "s");
      }
      return "".concat(seconds, "s");
    }

    /**
     * Check if upgrade is instant
     */
  }, {
    key: "isInstant",
    value: function isInstant(upgradeKey, targetLevel) {
      return targetLevel <= this.instantLevels;
    }

    /**
     * Check if can queue upgrade
     */
  }, {
    key: "canQueue",
    value: function canQueue(upgradeKey) {
      var _state$upgradeQueue, _state$upgradeQueue2, _state$upgradeQueue3;
      var state = _StateManager["default"].getState();
      var queue = ((_state$upgradeQueue = state.upgradeQueue) === null || _state$upgradeQueue === void 0 ? void 0 : _state$upgradeQueue.queue) || [];
      var slots = ((_state$upgradeQueue2 = state.upgradeQueue) === null || _state$upgradeQueue2 === void 0 ? void 0 : _state$upgradeQueue2.slots) || 1;

      // Check queue size
      if (queue.length >= slots) {
        return {
          can: false,
          reason: 'queue-full'
        };
      }

      // Check if already in queue
      var alreadyQueued = queue.some(function (item) {
        return item.upgradeKey === upgradeKey;
      });
      if (alreadyQueued) {
        return {
          can: false,
          reason: 'already-queued'
        };
      }

      // Check if currently upgrading
      if (((_state$upgradeQueue3 = state.upgradeQueue) === null || _state$upgradeQueue3 === void 0 || (_state$upgradeQueue3 = _state$upgradeQueue3.activeUpgrade) === null || _state$upgradeQueue3 === void 0 ? void 0 : _state$upgradeQueue3.upgradeKey) === upgradeKey) {
        return {
          can: false,
          reason: 'already-upgrading'
        };
      }
      return {
        can: true
      };
    }

    /**
     * Queue an upgrade
     */
  }, {
    key: "queueUpgrade",
    value: function queueUpgrade(upgradeKey, cost, costResource) {
      var canQueue = this.canQueue(upgradeKey);
      if (!canQueue.can) {
        _Logger["default"].warn('UpgradeQueueSystem', "Cannot queue ".concat(upgradeKey, ": ").concat(canQueue.reason));
        _EventBus["default"].emit('upgrade:queue-failed', {
          upgradeKey: upgradeKey,
          reason: canQueue.reason
        });
        return false;
      }
      var upgradeSystem = require('./UpgradeSystem.js')["default"];
      var currentLevel = upgradeSystem.getLevel(upgradeKey);
      var targetLevel = currentLevel + 1;
      var upgradeTime = this.calculateUpgradeTime(upgradeKey, targetLevel);
      var queueItem = {
        upgradeKey: upgradeKey,
        targetLevel: targetLevel,
        cost: cost,
        costResource: costResource,
        duration: upgradeTime,
        queuedAt: Date.now()
      };

      // If instant, complete immediately
      if (upgradeTime === 0) {
        this.completeUpgrade(queueItem);
        return true;
      }

      // Add to queue
      _StateManager["default"].dispatch({
        type: 'ADD_TO_UPGRADE_QUEUE',
        payload: {
          item: queueItem
        }
      });
      _Logger["default"].info('UpgradeQueueSystem', "Queued ".concat(upgradeKey, " (").concat(this.getUpgradeTimeFormatted(upgradeKey, targetLevel), ")"));
      _EventBus["default"].emit('upgrade:queued', queueItem);

      // Start processing if nothing is currently upgrading
      this.startNextUpgrade();
      return true;
    }

    /**
     * Start next upgrade from queue
     */
  }, {
    key: "startNextUpgrade",
    value: function startNextUpgrade() {
      var _state$upgradeQueue4, _state$upgradeQueue5;
      var state = _StateManager["default"].getState();

      // Check if already upgrading
      if ((_state$upgradeQueue4 = state.upgradeQueue) !== null && _state$upgradeQueue4 !== void 0 && _state$upgradeQueue4.activeUpgrade) {
        return;
      }
      var queue = ((_state$upgradeQueue5 = state.upgradeQueue) === null || _state$upgradeQueue5 === void 0 ? void 0 : _state$upgradeQueue5.queue) || [];
      if (queue.length === 0) {
        return;
      }

      // Take first item from queue
      var nextUpgrade = queue[0];

      // Remove from queue and set as active
      _StateManager["default"].dispatch({
        type: 'START_UPGRADE',
        payload: {
          upgrade: _objectSpread(_objectSpread({}, nextUpgrade), {}, {
            startedAt: Date.now(),
            completesAt: Date.now() + nextUpgrade.duration
          })
        }
      });
      _Logger["default"].info('UpgradeQueueSystem', "Started upgrade: ".concat(nextUpgrade.upgradeKey));
      _EventBus["default"].emit('upgrade:started', nextUpgrade);
    }

    /**
     * Process active upgrade (called every tick)
     */
  }, {
    key: "processQueue",
    value: function processQueue() {
      var _state$upgradeQueue6;
      var state = _StateManager["default"].getState();
      var activeUpgrade = (_state$upgradeQueue6 = state.upgradeQueue) === null || _state$upgradeQueue6 === void 0 ? void 0 : _state$upgradeQueue6.activeUpgrade;
      if (!activeUpgrade) {
        return;
      }
      var now = Date.now();

      // Check if completed
      if (now >= activeUpgrade.completesAt) {
        this.completeUpgrade(activeUpgrade);
      }
    }

    /**
    * Complete an upgrade
    */
  }, {
    key: "completeUpgrade",
    value: function completeUpgrade(upgrade) {
      // Apply the upgrade
      _StateManager["default"].dispatch({
        type: 'BUY_UPGRADE',
        payload: {
          upgradeKey: upgrade.upgradeKey,
          upgradeCost: upgrade.cost,
          costResource: upgrade.costResource,
          skipResourceDeduction: true
        }
      });

      // ===== FIX: Apply special effects (capacity updates, unlocks, etc.) =====
      var upgradeSystem = require('./UpgradeSystem.js')["default"];
      var newLevel = upgradeSystem.getLevel(upgrade.upgradeKey);
      upgradeSystem.applySpecialEffects(upgrade.upgradeKey, newLevel);
      // ===== END FIX =====

      // Clear active upgrade
      _StateManager["default"].dispatch({
        type: 'COMPLETE_UPGRADE',
        payload: {
          upgradeKey: upgrade.upgradeKey
        }
      });
      _Logger["default"].info('UpgradeQueueSystem', "Completed upgrade: ".concat(upgrade.upgradeKey, " \u2192 Level ").concat(upgrade.targetLevel));
      _EventBus["default"].emit('upgrade:completed', upgrade);

      // Start next upgrade in queue
      this.startNextUpgrade();
    }

    /**
     * Cancel queued upgrade (refund resources)
     */
  }, {
    key: "cancelQueuedUpgrade",
    value: function cancelQueuedUpgrade(upgradeKey) {
      var _state$upgradeQueue7;
      var state = _StateManager["default"].getState();
      var queue = ((_state$upgradeQueue7 = state.upgradeQueue) === null || _state$upgradeQueue7 === void 0 ? void 0 : _state$upgradeQueue7.queue) || [];
      var item = queue.find(function (q) {
        return q.upgradeKey === upgradeKey;
      });
      if (!item) {
        _Logger["default"].warn('UpgradeQueueSystem', "Upgrade ".concat(upgradeKey, " not in queue"));
        return false;
      }

      // Refund cost
      _StateManager["default"].dispatch({
        type: 'ADD_RESOURCE',
        payload: {
          resource: item.costResource,
          amount: item.cost
        }
      });

      // Remove from queue
      _StateManager["default"].dispatch({
        type: 'REMOVE_FROM_UPGRADE_QUEUE',
        payload: {
          upgradeKey: upgradeKey
        }
      });
      _Logger["default"].info('UpgradeQueueSystem', "Cancelled upgrade: ".concat(upgradeKey, " (refunded ").concat(item.cost, ")"));
      _EventBus["default"].emit('upgrade:cancelled', {
        upgradeKey: upgradeKey,
        refund: item.cost
      });
      return true;
    }

    /**
     * Speed up active upgrade with gems
     */
  }, {
    key: "speedUp",
    value: function speedUp() {
      var _state$upgradeQueue8;
      var useGems = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      var state = _StateManager["default"].getState();
      var activeUpgrade = (_state$upgradeQueue8 = state.upgradeQueue) === null || _state$upgradeQueue8 === void 0 ? void 0 : _state$upgradeQueue8.activeUpgrade;
      if (!activeUpgrade) {
        _Logger["default"].warn('UpgradeQueueSystem', 'No active upgrade to speed up');
        return false;
      }
      var now = Date.now();
      var remainingTime = activeUpgrade.completesAt - now;
      if (remainingTime <= 0) {
        // Already done, just complete it
        this.completeUpgrade(activeUpgrade);
        return true;
      }

      // Calculate gem cost (1 gem per minute remaining, minimum 10 gems)
      var remainingMinutes = Math.ceil(remainingTime / 60000);
      var gemCost = Math.max(10, remainingMinutes);
      if (useGems) {
        // Check if player has enough gems
        if (state.resources.gems < gemCost) {
          _Logger["default"].warn('UpgradeQueueSystem', "Not enough gems (need ".concat(gemCost, ")"));
          _EventBus["default"].emit('upgrade:speedup-failed', {
            reason: 'insufficient-gems',
            cost: gemCost
          });
          return false;
        }

        // Deduct gems
        _StateManager["default"].dispatch({
          type: 'REMOVE_RESOURCE',
          payload: {
            resource: 'gems',
            amount: gemCost
          }
        });

        // Track spending
        _StateManager["default"].dispatch({
          type: 'INCREMENT_STATISTIC',
          payload: {
            key: 'gemsSpent',
            amount: gemCost
          }
        });
      }

      // Complete immediately
      this.completeUpgrade(activeUpgrade);
      _Logger["default"].info('UpgradeQueueSystem', "Sped up ".concat(activeUpgrade.upgradeKey, " for ").concat(gemCost, " gems"));
      _EventBus["default"].emit('upgrade:sped-up', {
        upgradeKey: activeUpgrade.upgradeKey,
        gemCost: gemCost
      });
      return true;
    }

    /**
     * Get remaining time for active upgrade
     */
  }, {
    key: "getRemainingTime",
    value: function getRemainingTime() {
      var _state$upgradeQueue9;
      var state = _StateManager["default"].getState();
      var activeUpgrade = (_state$upgradeQueue9 = state.upgradeQueue) === null || _state$upgradeQueue9 === void 0 ? void 0 : _state$upgradeQueue9.activeUpgrade;
      if (!activeUpgrade) {
        return 0;
      }
      var now = Date.now();
      return Math.max(0, activeUpgrade.completesAt - now);
    }

    /**
     * Get progress percentage
     */
  }, {
    key: "getProgress",
    value: function getProgress() {
      var _state$upgradeQueue0;
      var state = _StateManager["default"].getState();
      var activeUpgrade = (_state$upgradeQueue0 = state.upgradeQueue) === null || _state$upgradeQueue0 === void 0 ? void 0 : _state$upgradeQueue0.activeUpgrade;
      if (!activeUpgrade) {
        return 0;
      }
      var now = Date.now();
      var elapsed = now - activeUpgrade.startedAt;
      var total = activeUpgrade.duration;
      return Math.min(100, elapsed / total * 100);
    }

    /**
     * Get queue info
     */
  }, {
    key: "getQueueInfo",
    value: function getQueueInfo() {
      var _state$upgradeQueue1, _state$upgradeQueue10, _state$upgradeQueue11;
      var state = _StateManager["default"].getState();
      return {
        active: ((_state$upgradeQueue1 = state.upgradeQueue) === null || _state$upgradeQueue1 === void 0 ? void 0 : _state$upgradeQueue1.activeUpgrade) || null,
        queue: ((_state$upgradeQueue10 = state.upgradeQueue) === null || _state$upgradeQueue10 === void 0 ? void 0 : _state$upgradeQueue10.queue) || [],
        slots: ((_state$upgradeQueue11 = state.upgradeQueue) === null || _state$upgradeQueue11 === void 0 ? void 0 : _state$upgradeQueue11.slots) || 1,
        remainingTime: this.getRemainingTime(),
        progress: this.getProgress()
      };
    }

    /**
     * Upgrade queue slots (with gems)
     */
  }, {
    key: "upgradeQueueSlots",
    value: function upgradeQueueSlots() {
      var _state$upgradeQueue12;
      var state = _StateManager["default"].getState();
      var currentSlots = ((_state$upgradeQueue12 = state.upgradeQueue) === null || _state$upgradeQueue12 === void 0 ? void 0 : _state$upgradeQueue12.slots) || 1;
      if (currentSlots >= 5) {
        _Logger["default"].warn('UpgradeQueueSystem', 'Maximum queue slots reached');
        return false;
      }

      // Cost: 1000 gems per slot
      var cost = 1000 * currentSlots;
      if (state.resources.gems < cost) {
        _Logger["default"].warn('UpgradeQueueSystem', "Not enough gems for slot upgrade (need ".concat(cost, ")"));
        return false;
      }

      // Deduct gems
      _StateManager["default"].dispatch({
        type: 'REMOVE_RESOURCE',
        payload: {
          resource: 'gems',
          amount: cost
        }
      });

      // Increase slots
      _StateManager["default"].dispatch({
        type: 'UPGRADE_QUEUE_SLOTS',
        payload: {
          slots: currentSlots + 1
        }
      });
      _Logger["default"].info('UpgradeQueueSystem', "Upgraded queue slots to ".concat(currentSlots + 1));
      _EventBus["default"].emit('upgrade:slots-upgraded', {
        slots: currentSlots + 1
      });
      return true;
    }

    /**
     * Start queue processor
     */
  }, {
    key: "startQueueProcessor",
    value: function startQueueProcessor() {
      var _this2 = this;
      // Process every second
      this.processorInterval = _ResourceManager["default"].setInterval(function () {
        _this2.processQueue();
      }, 1000, 'UpgradeQueueProcessor');
    }
  }]);
}(); // Singleton
var upgradeQueueSystem = new UpgradeQueueSystem();
var _default = exports["default"] = upgradeQueueSystem;

},{"../config.js":1,"../core/ResourceManager.js":4,"../core/StateManager.js":6,"../utils/EventBus.js":56,"../utils/Logger.js":58,"./UpgradeSystem.js":33}],33:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _upgrades = _interopRequireDefault(require("../data/upgrades.js"));
var _StateManager = _interopRequireDefault(require("../core/StateManager.js"));
var _EventBus = _interopRequireDefault(require("../utils/EventBus.js"));
var _Logger = _interopRequireDefault(require("../utils/Logger.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /**
 * UpgradeSystem - Handles all upgrade-related logic
 */
var UpgradeSystem = /*#__PURE__*/function () {
  function UpgradeSystem() {
    _classCallCheck(this, UpgradeSystem);
    this.upgrades = _upgrades["default"];
    this.initializeState();
    this.subscribeToEvents();
    _Logger["default"].info('UpgradeSystem', 'Initialized with upgrades:', Object.keys(this.upgrades));
  }

  /**
   * Initialize upgrade state
   */
  return _createClass(UpgradeSystem, [{
    key: "initializeState",
    value: function initializeState() {
      var state = _StateManager["default"].getState();

      // Ensure all upgrades exist in state
      for (var _i = 0, _Object$keys = Object.keys(this.upgrades); _i < _Object$keys.length; _i++) {
        var key = _Object$keys[_i];
        if (!state.upgrades[key]) {
          // Will be added when first purchased
        }
      }
    }

    /**
     * Subscribe to relevant events
     */
  }, {
    key: "subscribeToEvents",
    value: function subscribeToEvents() {
      // When upgrades change, recalculate production
      _EventBus["default"].on('state:BUY_UPGRADE', function () {
        _EventBus["default"].emit('upgrades:changed');
      });
    }

    /**
     * Get upgrade definition
     */
  }, {
    key: "getUpgrade",
    value: function getUpgrade(key) {
      return this.upgrades[key];
    }

    /**
     * Get all upgrades by category
     */
  }, {
    key: "getUpgradesByCategory",
    value: function getUpgradesByCategory() {
      var category = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      if (!category) {
        return this.upgrades;
      }
      return Object.entries(this.upgrades).filter(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
          key = _ref2[0],
          data = _ref2[1];
        return data.category === category;
      }).reduce(function (obj, _ref3) {
        var _ref4 = _slicedToArray(_ref3, 2),
          key = _ref4[0],
          data = _ref4[1];
        obj[key] = data;
        return obj;
      }, {});
    }

    /**
     * Check if upgrade is unlocked
     */
  }, {
    key: "isUnlocked",
    value: function isUnlocked(upgradeKey) {
      var upgrade = this.upgrades[upgradeKey];
      if (!upgrade) return false;
      if (!upgrade.unlockCondition) return true;
      var state = _StateManager["default"].getState();
      var condition = upgrade.unlockCondition;

      // Check resource requirements
      if (condition.resources) {
        for (var _i2 = 0, _Object$entries = Object.entries(condition.resources); _i2 < _Object$entries.length; _i2++) {
          var _Object$entries$_i = _slicedToArray(_Object$entries[_i2], 2),
            resource = _Object$entries$_i[0],
            amount = _Object$entries$_i[1];
          if (state.resources[resource] < amount) {
            return false;
          }
        }
      }

      // Check structure requirements
      if (condition.structures) {
        for (var _i3 = 0, _Object$entries2 = Object.entries(condition.structures); _i3 < _Object$entries2.length; _i3++) {
          var _state$structures$str;
          var _Object$entries2$_i = _slicedToArray(_Object$entries2[_i3], 2),
            structure = _Object$entries2$_i[0],
            reqLevel = _Object$entries2$_i[1];
          var currentLevel = ((_state$structures$str = state.structures[structure]) === null || _state$structures$str === void 0 ? void 0 : _state$structures$str.level) || 0;
          if (currentLevel < reqLevel) {
            return false;
          }
        }
      }

      // Check upgrade requirements
      if (condition.upgrades) {
        for (var _i4 = 0, _Object$entries3 = Object.entries(condition.upgrades); _i4 < _Object$entries3.length; _i4++) {
          var _state$upgrades$reqUp;
          var _Object$entries3$_i = _slicedToArray(_Object$entries3[_i4], 2),
            reqUpgrade = _Object$entries3$_i[0],
            _reqLevel = _Object$entries3$_i[1];
          var _currentLevel = ((_state$upgrades$reqUp = state.upgrades[reqUpgrade]) === null || _state$upgrades$reqUp === void 0 ? void 0 : _state$upgrades$reqUp.level) || 0;
          if (_currentLevel < _reqLevel) {
            return false;
          }
        }
      }

      // Check ascension requirements
      if (condition.ascension) {
        if (state.ascension.level < condition.ascension.level) {
          return false;
        }
      }

      // Check realm requirements
      if (condition.realms) {
        for (var _i5 = 0, _Object$entries4 = Object.entries(condition.realms); _i5 < _Object$entries4.length; _i5++) {
          var _Object$entries4$_i = _slicedToArray(_Object$entries4[_i5], 2),
            realm = _Object$entries4$_i[0],
            required = _Object$entries4$_i[1];
          if (required && !state.realms.unlocked.includes(realm)) {
            return false;
          }
        }
      }

      // Check statistics requirements
      if (condition.statistics) {
        for (var _i6 = 0, _Object$entries5 = Object.entries(condition.statistics); _i6 < _Object$entries5.length; _i6++) {
          var _Object$entries5$_i = _slicedToArray(_Object$entries5[_i6], 2),
            stat = _Object$entries5$_i[0],
            _required = _Object$entries5$_i[1];
          if (state.statistics[stat] < _required) {
            return false;
          }
        }
      }

      // Check guardian requirements
      if (condition.guardians) {
        if (condition.guardians.count) {
          if (state.guardians.length < condition.guardians.count) {
            return false;
          }
        }
      }
      return true;
    }

    /**
     * Get upgrade level
     */
  }, {
    key: "getLevel",
    value: function getLevel(upgradeKey) {
      var _state$upgrades$upgra;
      var state = _StateManager["default"].getState();
      return ((_state$upgrades$upgra = state.upgrades[upgradeKey]) === null || _state$upgrades$upgra === void 0 ? void 0 : _state$upgrades$upgra.level) || 0;
    }

    /**
     * Check if upgrade is maxed
     */
  }, {
    key: "isMaxed",
    value: function isMaxed(upgradeKey) {
      var upgrade = this.upgrades[upgradeKey];
      if (!upgrade) return false;
      var currentLevel = this.getLevel(upgradeKey);
      return currentLevel >= upgrade.maxLevel;
    }

    /**
     * Calculate cost for next level
     */
  }, {
    key: "getCost",
    value: function getCost(upgradeKey) {
      var upgrade = this.upgrades[upgradeKey];
      if (!upgrade) return 0;
      var currentLevel = this.getLevel(upgradeKey);

      // Check if maxed
      if (currentLevel >= upgrade.maxLevel) {
        return Infinity;
      }
      return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, currentLevel));
    }

    /**
     * Get current effect value
     */
  }, {
    key: "getEffect",
    value: function getEffect(upgradeKey) {
      var upgrade = this.upgrades[upgradeKey];
      if (!upgrade) return null;
      var level = this.getLevel(upgradeKey);
      if (level === 0) return null;
      return upgrade.effect(level);
    }

    /**
     * Check if can afford upgrade
     */
  }, {
    key: "canAfford",
    value: function canAfford(upgradeKey) {
      var upgrade = this.upgrades[upgradeKey];
      if (!upgrade) return false;
      if (this.isMaxed(upgradeKey)) return false;
      var cost = this.getCost(upgradeKey);
      var state = _StateManager["default"].getState();
      var costResource = upgrade.costResource;
      return state.resources[costResource] >= cost;
    }

    /**
    * Buy upgrade (increment level) - with queue support
    */
  }, {
    key: "buy",
    value: function buy(upgradeKey) {
      // Import queue system
      var upgradeQueueSystem = require('./UpgradeQueueSystem.js')["default"];

      // Validate
      if (!this.isUnlocked(upgradeKey)) {
        _Logger["default"].warn('UpgradeSystem', "Upgrade ".concat(upgradeKey, " is not unlocked"));
        _EventBus["default"].emit('upgrade:purchase-failed', {
          upgradeKey: upgradeKey,
          reason: 'locked'
        });
        return false;
      }
      if (this.isMaxed(upgradeKey)) {
        _Logger["default"].warn('UpgradeSystem', "Upgrade ".concat(upgradeKey, " is already maxed"));
        _EventBus["default"].emit('upgrade:purchase-failed', {
          upgradeKey: upgradeKey,
          reason: 'maxed'
        });
        return false;
      }
      if (!this.canAfford(upgradeKey)) {
        _Logger["default"].warn('UpgradeSystem', "Cannot afford ".concat(upgradeKey));
        _EventBus["default"].emit('upgrade:purchase-failed', {
          upgradeKey: upgradeKey,
          reason: 'insufficient-resources'
        });
        return false;
      }
      var upgrade = this.upgrades[upgradeKey];
      var cost = this.getCost(upgradeKey);
      var currentLevel = this.getLevel(upgradeKey);
      var targetLevel = currentLevel + 1;

      // Check if upgrade should be queued
      if (!upgradeQueueSystem.isInstant(upgradeKey, targetLevel)) {
        // Queue the upgrade
        return upgradeQueueSystem.queueUpgrade(upgradeKey, cost, upgrade.costResource);
      }

      // Instant upgrade (levels 1-3)
      _StateManager["default"].dispatch({
        type: 'BUY_UPGRADE',
        payload: {
          upgradeKey: upgradeKey,
          upgradeCost: cost,
          costResource: upgrade.costResource
        }
      });
      var newLevel = this.getLevel(upgradeKey);
      _Logger["default"].info('UpgradeSystem', "Purchased ".concat(upgradeKey, " (level ").concat(newLevel, ") - INSTANT"));

      // Handle special effects
      this.applySpecialEffects(upgradeKey, newLevel);

      // Emit success event
      _EventBus["default"].emit('upgrade:purchased', {
        upgradeKey: upgradeKey,
        level: newLevel,
        cost: cost,
        effect: this.getEffect(upgradeKey)
      });
      return true;
    }

    /**
    * Apply special effects (like unlocks and capacity updates)
    * NOTE: Called by both instant upgrades and UpgradeQueueSystem
    */
  }, {
    key: "applySpecialEffects",
    value: function applySpecialEffects(upgradeKey, level) {
      var upgrade = this.upgrades[upgradeKey];
      var effect = upgrade.effect(level);

      // Handle unlock effects
      if (effect && effect.unlock) {
        _Logger["default"].info('UpgradeSystem', "Unlocked: ".concat(effect.unlock));
        _EventBus["default"].emit('unlock:structure', {
          structureKey: effect.unlock
        });
      }

      // Handle capacity upgrades
      if (upgrade.category === 'capacity') {
        var resource = upgradeKey.replace('Cap', ''); // energyCap → energy
        _StateManager["default"].dispatch({
          type: 'SET_CAP',
          payload: {
            resource: resource,
            amount: effect
          }
        });
        _Logger["default"].info('UpgradeSystem', "Updated ".concat(resource, " cap to ").concat(effect));
      }
    }

    /**
     * Get multiplier for production
     */
  }, {
    key: "getProductionMultiplier",
    value: function getProductionMultiplier(resource) {
      var multiplier = 1;

      // Energy boost
      if (resource === 'energy' && this.getLevel('energyBoost') > 0) {
        multiplier *= this.getEffect('energyBoost');
      }

      // Mana efficiency
      if (resource === 'mana' && this.getLevel('manaEfficiency') > 0) {
        multiplier *= this.getEffect('manaEfficiency');
      }

      // Volcanic power
      if (resource === 'volcanicEnergy' && this.getLevel('volcanicPower') > 0) {
        multiplier *= this.getEffect('volcanicPower');
      }
      return multiplier;
    }

    /**
     * Get structure synergy multiplier
     */
  }, {
    key: "getStructureSynergy",
    value: function getStructureSynergy(structureKey) {
      var multiplier = 1;

      // Check for structure-specific synergies
      for (var _i7 = 0, _Object$entries6 = Object.entries(this.upgrades); _i7 < _Object$entries6.length; _i7++) {
        var _Object$entries6$_i = _slicedToArray(_Object$entries6[_i7], 2),
          upgradeKey = _Object$entries6$_i[0],
          upgrade = _Object$entries6$_i[1];
        if (upgrade.category === 'synergy' && upgrade.targetStructure === structureKey && this.getLevel(upgradeKey) > 0) {
          multiplier *= this.getEffect(upgradeKey);
        }
      }
      return multiplier;
    }

    /**
     * Get guardian bonus multiplier
     */
  }, {
    key: "getGuardianBonusMultiplier",
    value: function getGuardianBonusMultiplier() {
      if (this.getLevel('guardianBond') > 0) {
        return this.getEffect('guardianBond');
      }
      return 1;
    }

    /**
     * Get offline production percentage
     */
  }, {
    key: "getOfflineProductionRate",
    value: function getOfflineProductionRate() {
      if (this.getLevel('offlineProduction') > 0) {
        return this.getEffect('offlineProduction') / 100; // Convert to decimal
      }
      return 0;
    }

    /**
     * Check if auto-collect is enabled
     */
  }, {
    key: "hasAutoCollect",
    value: function hasAutoCollect() {
      return this.getLevel('autoCollect') > 0;
    }

    /**
     * Get critical energy chance
     */
  }, {
    key: "getCriticalChance",
    value: function getCriticalChance() {
      if (this.getLevel('criticalEnergy') > 0) {
        return this.getEffect('criticalEnergy') / 100;
      }
      return 0;
    }

    /**
     * Get lucky gems chance
     */
  }, {
    key: "getLuckyGemsChance",
    value: function getLuckyGemsChance() {
      if (this.getLevel('luckyGems') > 0) {
        return this.getEffect('luckyGems') / 100;
      }
      return 0;
    }

    /**
     * Get all upgrade stats
     */
  }, {
    key: "getStats",
    value: function getStats() {
      var state = _StateManager["default"].getState();
      var stats = {
        totalUpgrades: 0,
        totalLevels: 0,
        byCategory: {},
        totalSpent: {}
      };
      for (var _i8 = 0, _Object$entries7 = Object.entries(this.upgrades); _i8 < _Object$entries7.length; _i8++) {
        var _Object$entries7$_i = _slicedToArray(_Object$entries7[_i8], 2),
          key = _Object$entries7$_i[0],
          upgrade = _Object$entries7$_i[1];
        var level = this.getLevel(key);
        if (level > 0) {
          stats.totalUpgrades++;
          stats.totalLevels += level;

          // By category
          if (!stats.byCategory[upgrade.category]) {
            stats.byCategory[upgrade.category] = 0;
          }
          stats.byCategory[upgrade.category] += level;

          // Total spent calculation
          var costResource = upgrade.costResource;
          if (!stats.totalSpent[costResource]) {
            stats.totalSpent[costResource] = 0;
          }

          // Sum all costs from level 0 to current level
          for (var i = 0; i < level; i++) {
            var cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, i));
            stats.totalSpent[costResource] += cost;
          }
        }
      }
      return stats;
    }

    /**
     * Get unlock progress
     */
  }, {
    key: "getUnlockProgress",
    value: function getUnlockProgress() {
      var _this = this;
      var total = Object.keys(this.upgrades).length;
      var unlocked = Object.keys(this.upgrades).filter(function (key) {
        return _this.isUnlocked(key);
      }).length;
      var purchased = Object.keys(this.upgrades).filter(function (key) {
        return _this.getLevel(key) > 0;
      }).length;
      return {
        unlocked: unlocked,
        purchased: purchased,
        total: total,
        percentageUnlocked: unlocked / total * 100,
        percentagePurchased: purchased / total * 100
      };
    }

    /**
     * Get recommended upgrades
     */
  }, {
    key: "getRecommendedUpgrades",
    value: function getRecommendedUpgrades() {
      var count = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 3;
      var state = _StateManager["default"].getState();
      var affordable = [];
      for (var _i9 = 0, _Object$entries8 = Object.entries(this.upgrades); _i9 < _Object$entries8.length; _i9++) {
        var _Object$entries8$_i = _slicedToArray(_Object$entries8[_i9], 2),
          key = _Object$entries8$_i[0],
          upgrade = _Object$entries8$_i[1];
        if (this.isUnlocked(key) && !this.isMaxed(key) && this.canAfford(key)) {
          var cost = this.getCost(key);
          var priority = this.calculateUpgradePriority(key);
          affordable.push({
            key: key,
            cost: cost,
            priority: priority,
            category: upgrade.category
          });
        }
      }

      // Sort by priority
      affordable.sort(function (a, b) {
        return b.priority - a.priority;
      });
      return affordable.slice(0, count);
    }

    /**
     * Calculate upgrade priority for recommendations
     */
  }, {
    key: "calculateUpgradePriority",
    value: function calculateUpgradePriority(upgradeKey) {
      var upgrade = this.upgrades[upgradeKey];
      var priority = 0;

      // Production upgrades = high priority
      if (upgrade.category === 'production') {
        priority += 10;
      }

      // Capacity upgrades = medium priority
      if (upgrade.category === 'capacity') {
        priority += 5;
      }

      // QoL upgrades = lower priority
      if (upgrade.category === 'qol') {
        priority += 3;
      }

      // Synergies = depends on structure level
      if (upgrade.category === 'synergy' && upgrade.targetStructure) {
        var _state$structures$upg;
        var state = _StateManager["default"].getState();
        var structureLevel = ((_state$structures$upg = state.structures[upgrade.targetStructure]) === null || _state$structures$upg === void 0 ? void 0 : _state$structures$upg.level) || 0;
        priority += structureLevel / 10;
      }

      // Lower level upgrades = higher priority (diminishing returns)
      var currentLevel = this.getLevel(upgradeKey);
      priority += (upgrade.maxLevel - currentLevel) / upgrade.maxLevel * 5;
      return priority;
    }
  }]);
}(); // Singleton
var upgradeSystem = new UpgradeSystem();
var _default = exports["default"] = upgradeSystem;

},{"../core/StateManager.js":6,"../data/upgrades.js":16,"../utils/EventBus.js":56,"../utils/Logger.js":58,"./UpgradeQueueSystem.js":32}],34:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _AchievementSystem = _interopRequireDefault(require("../systems/AchievementSystem.js"));
var _StateManager = _interopRequireDefault(require("../core/StateManager.js"));
var _EventBus = _interopRequireDefault(require("../utils/EventBus.js"));
var _MiniGameStatsUI = _interopRequireDefault(require("./MiniGameStatsUI.js"));
var _achievements = _interopRequireDefault(require("../data/achievements.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /**
 * AchievementsUI - Manages achievements tab display
 */
var AchievementsUI = /*#__PURE__*/function () {
  function AchievementsUI(containerId) {
    _classCallCheck(this, AchievementsUI);
    this.container = document.getElementById(containerId);
    this.currentCategory = 'all';
    this.currentMainTab = 'general'; // 'general' or 'mini-games'

    if (!this.container) {
      console.error("AchievementsUI: Container ".concat(containerId, " not found"));
      return;
    }
    this.render();
    this.subscribe();
  }
  return _createClass(AchievementsUI, [{
    key: "subscribe",
    value: function subscribe() {
      var _this = this;
      _EventBus["default"].on('achievement:unlocked', function () {
        return _this.render();
      });
      _EventBus["default"].on('achievement:claimed', function () {
        return _this.render();
      });
      _EventBus["default"].on('mini-game-achievement:unlocked', function () {
        return _this.render();
      });
    }
  }, {
    key: "render",
    value: function render() {
      if (!this.container) {
        console.error('AchievementsUI: Container not found!');
        return;
      }

      // Clear și rebuild complet
      this.container.innerHTML = "\n      <div class=\"achievements-wrapper\">\n        <!-- Main Tabs: General vs Mini-Games -->\n        <div class=\"achievements-main-tabs\">\n          <button class=\"achievement-main-tab ".concat(this.currentMainTab === 'general' ? 'active' : '', "\" data-main-tab=\"general\">\n            \uD83C\uDFC6 General Achievements\n          </button>\n          <button class=\"achievement-main-tab ").concat(this.currentMainTab === 'mini-games' ? 'active' : '', "\" data-main-tab=\"mini-games\">\n            \uD83C\uDFAE Mini-Game Achievements\n          </button>\n        </div>\n        \n        <!-- Content Area -->\n        <div class=\"achievements-content-area\">\n          ").concat(this.currentMainTab === 'general' ? this.renderGeneralAchievements() : this.renderMiniGameSection(), "\n        </div>\n      </div>\n    ");
      this.bindEvents();
    }
  }, {
    key: "renderGeneralAchievements",
    value: function renderGeneralAchievements() {
      var _this2 = this;
      // Filtrează achievements după categorie
      var achievements = this.currentCategory === 'all' ? _achievements["default"] : Object.fromEntries(Object.entries(_achievements["default"]).filter(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
          key = _ref2[0],
          ach = _ref2[1];
        return ach.category === _this2.currentCategory;
      }));
      if (!achievements || Object.keys(achievements).length === 0) {
        return "\n        <div class=\"empty-state\">\n          <p>No achievements in this category</p>\n        </div>\n      ";
      }

      // Sort: unlocked first, then by tier
      var sorted = Object.entries(achievements).sort(function (_ref3, _ref4) {
        var _ref5 = _slicedToArray(_ref3, 2),
          keyA = _ref5[0],
          achA = _ref5[1];
        var _ref6 = _slicedToArray(_ref4, 2),
          keyB = _ref6[0],
          achB = _ref6[1];
        var stateA = _AchievementSystem["default"].getAchievementState(keyA);
        var stateB = _AchievementSystem["default"].getAchievementState(keyB);
        if (stateA !== null && stateA !== void 0 && stateA.unlocked && !(stateB !== null && stateB !== void 0 && stateB.unlocked)) return -1;
        if (!(stateA !== null && stateA !== void 0 && stateA.unlocked) && stateB !== null && stateB !== void 0 && stateB.unlocked) return 1;
        var tierOrder = {
          bronze: 1,
          silver: 2,
          gold: 3,
          platinum: 4,
          diamond: 5
        };
        return (tierOrder[achB.tier] || 0) - (tierOrder[achA.tier] || 0);
      });
      return "\n      <!-- Category Filters -->\n      <div class=\"category-filters\">\n        <button class=\"category-btn ".concat(this.currentCategory === 'all' ? 'active' : '', "\" data-category=\"all\">\n          All\n        </button>\n        <button class=\"category-btn ").concat(this.currentCategory === 'tutorial' ? 'active' : '', "\" data-category=\"tutorial\">\n          Tutorial\n        </button>\n        <button class=\"category-btn ").concat(this.currentCategory === 'production' ? 'active' : '', "\" data-category=\"production\">\n          Production\n        </button>\n        <button class=\"category-btn ").concat(this.currentCategory === 'structures' ? 'active' : '', "\" data-category=\"structures\">\n          Structures\n        </button>\n        <button class=\"category-btn ").concat(this.currentCategory === 'upgrades' ? 'active' : '', "\" data-category=\"upgrades\">\n          Upgrades\n        </button>\n        <button class=\"category-btn ").concat(this.currentCategory === 'guardians' ? 'active' : '', "\" data-category=\"guardians\">\n          Guardians\n        </button>\n        <button class=\"category-btn ").concat(this.currentCategory === 'quests' ? 'active' : '', "\" data-category=\"quests\">\n          Quests\n        </button>\n        <button class=\"category-btn ").concat(this.currentCategory === 'bosses' ? 'active' : '', "\" data-category=\"bosses\">\n          Bosses\n        </button>\n        <button class=\"category-btn ").concat(this.currentCategory === 'special' ? 'active' : '', "\" data-category=\"special\">\n          Special\n        </button>\n      </div>\n      \n      <!-- Achievements Grid -->\n      <div class=\"achievements-grid\">\n        ").concat(sorted.map(function (_ref7) {
        var _ref8 = _slicedToArray(_ref7, 2),
          key = _ref8[0],
          achievement = _ref8[1];
        return _this2.renderAchievementCardHTML(key, achievement);
      }).join(''), "\n      </div>\n    ");
    }
  }, {
    key: "renderMiniGameSection",
    value: function renderMiniGameSection() {
      return "\n      <div class=\"mini-game-tabs\">\n        <button class=\"mini-game-tab active\" data-game=\"dailySpin\">\n          \uD83C\uDFB0 Daily Spin\n        </button>\n        <button class=\"mini-game-tab\" data-game=\"game2048\">\n          \uD83C\uDFAE 2048\n        </button>\n        <button class=\"mini-game-tab\" data-game=\"match3\">\n          \uD83E\uDDE9 Match-3\n        </button>\n      </div>\n      <div class=\"mini-game-tab-content\" id=\"mini-game-achievements-content\"></div>\n    ";
    }
  }, {
    key: "renderAchievementCardHTML",
    value: function renderAchievementCardHTML(key, achievement) {
      var _state$achievements, _state$achievements2;
      var state = _StateManager["default"].getState();
      var isUnlocked = (_state$achievements = state.achievements) === null || _state$achievements === void 0 || (_state$achievements = _state$achievements.unlocked) === null || _state$achievements === void 0 ? void 0 : _state$achievements.includes(key);
      var isClaimed = (_state$achievements2 = state.achievements) === null || _state$achievements2 === void 0 || (_state$achievements2 = _state$achievements2.claimed) === null || _state$achievements2 === void 0 ? void 0 : _state$achievements2.includes(key);
      var cardClass = 'achievement-card';
      if (!isUnlocked) cardClass += ' locked';
      if (isUnlocked && !isClaimed) cardClass += ' unlocked';
      if (isClaimed) cardClass += ' claimed';

      // Format rewards
      var rewardParts = [];
      if (achievement.reward.gems) rewardParts.push("".concat(achievement.reward.gems, " \uD83D\uDC8E"));
      if (achievement.reward.crystals) rewardParts.push("".concat(achievement.reward.crystals, " \uD83D\uDCA0"));
      if (achievement.reward.energy) rewardParts.push("".concat(achievement.reward.energy, " \u26A1"));
      if (achievement.reward.timeShards) rewardParts.push("".concat(achievement.reward.timeShards, " \u23F0"));
      return "\n      <div class=\"".concat(cardClass, "\" data-key=\"").concat(key, "\">\n        <div class=\"achievement-tier-badge ").concat(achievement.tier, "\">\n          ").concat(this.getTierIcon(achievement.tier), "\n        </div>\n        \n        <div class=\"achievement-content\">\n          <span class=\"achievement-emoji\">").concat(achievement.emoji, "</span>\n          <div class=\"achievement-info\">\n            <h4 class=\"achievement-name\">").concat(achievement.name, "</h4>\n            <p class=\"achievement-description\">").concat(achievement.description, "</p>\n          </div>\n        </div>\n        \n        <div class=\"achievement-reward\">\n          Reward: ").concat(rewardParts.join(', '), "\n        </div>\n        \n        ").concat(isUnlocked && !isClaimed ? "\n          <button class=\"btn btn-success\" onclick=\"claimAchievement('".concat(key, "')\">\n            \u2705 Claim Reward\n          </button>\n        ") : isClaimed ? "\n          <div class=\"achievement-claimed\">\n            \u2713 Claimed\n          </div>\n        " : "\n          <div class=\"achievement-locked\">\n            \uD83D\uDD12 Locked\n          </div>\n        ", "\n      </div>\n    ");
    }
  }, {
    key: "getTierIcon",
    value: function getTierIcon(tier) {
      var icons = {
        bronze: '🥉',
        silver: '🥈',
        gold: '🥇',
        platinum: '💿',
        diamond: '💎'
      };
      return icons[tier] || '🏆';
    }
  }, {
    key: "bindEvents",
    value: function bindEvents() {
      var _this3 = this;
      // Main tabs (General vs Mini-Games)
      var mainTabs = this.container.querySelectorAll('.achievement-main-tab');
      mainTabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
          _this3.currentMainTab = tab.dataset.mainTab;
          _this3.render();
        });
      });

      // Category filters (pentru General tab)
      var categoryBtns = this.container.querySelectorAll('.category-btn');
      categoryBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          _this3.currentCategory = btn.dataset.category;
          _this3.render();
        });
      });

      // Mini-game tabs
      var miniGameTabs = this.container.querySelectorAll('.mini-game-tab');
      miniGameTabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
          miniGameTabs.forEach(function (t) {
            return t.classList.remove('active');
          });
          tab.classList.add('active');
          var gameType = tab.dataset.game;
          var content = document.getElementById('mini-game-achievements-content');
          if (content) {
            _MiniGameStatsUI["default"].renderMiniGameAchievements(content, gameType);
          }
        });
      });

      // Render initial mini-game content
      if (this.currentMainTab === 'mini-games') {
        setTimeout(function () {
          var content = document.getElementById('mini-game-achievements-content');
          if (content) {
            _MiniGameStatsUI["default"].renderMiniGameAchievements(content, 'dailySpin');
          }
        }, 100);
      }
    }
  }, {
    key: "updateBadge",
    value: function updateBadge() {
      var unclaimedCount = _AchievementSystem["default"].getUnclaimedCount();
      _EventBus["default"].emit('tab:badge-update', {
        tab: 'achievements',
        count: unclaimedCount
      });
    }
  }]);
}(); // Global claim function
window.claimAchievement = function (key) {
  _AchievementSystem["default"].claim(key);
};
var _default = exports["default"] = AchievementsUI;

},{"../core/StateManager.js":6,"../data/achievements.js":8,"../systems/AchievementSystem.js":18,"../utils/EventBus.js":56,"./MiniGameStatsUI.js":40}],35:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _AutomationSystem = _interopRequireDefault(require("../systems/AutomationSystem.js"));
var _EventBus = _interopRequireDefault(require("../utils/EventBus.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /**
 * AutomationUI - Automation features modal
 */
var AutomationUI = /*#__PURE__*/function () {
  function AutomationUI() {
    _classCallCheck(this, AutomationUI);
    this.subscribe();
  }
  return _createClass(AutomationUI, [{
    key: "subscribe",
    value: function subscribe() {
      var _this = this;
      _EventBus["default"].on('modal:shown', function (data) {
        if (data.modalId === 'automation-modal') {
          _this.render();
        }
      });
      _EventBus["default"].on('automation:unlocked', function () {
        return _this.render();
      });
      _EventBus["default"].on('automation:toggled', function () {
        return _this.render();
      });
    }
  }, {
    key: "render",
    value: function render() {
      var container = document.getElementById('automation-features');
      if (!container) return;
      var stats = _AutomationSystem["default"].getStats();
      container.innerHTML = "\n      <div class=\"automation-summary\">\n        <p>".concat(stats.totalUnlocked, "/").concat(Object.keys(stats.features).length, " features unlocked</p>\n        <p>").concat(stats.totalEnabled, " currently active</p>\n      </div>\n      \n      ").concat(Object.entries(stats.features).map(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
          key = _ref2[0],
          feature = _ref2[1];
        return "\n        <div class=\"automation-feature ".concat(feature.unlocked ? 'unlocked' : 'locked', "\">\n          <div class=\"automation-header\">\n            <div class=\"automation-info\">\n              <h4>").concat(feature.name, "</h4>\n              <p>").concat(feature.description, "</p>\n            </div>\n            \n            ").concat(!feature.unlocked ? "\n              <div class=\"automation-cost\">".concat(feature.cost, " \uD83D\uDC8E</div>\n            ") : '', "\n          </div>\n          \n          <div class=\"automation-actions\">\n            ").concat(!feature.unlocked ? "\n              <button class=\"btn btn-primary\" onclick=\"unlockAutomation('".concat(key, "')\">\n                Unlock\n              </button>\n            ") : "\n              <div class=\"automation-toggle\">\n                <input type=\"checkbox\" \n                       id=\"auto-".concat(key, "\" \n                       ").concat(feature.enabled ? 'checked' : '', "\n                       onchange=\"toggleAutomation('").concat(key, "')\">\n                <label for=\"auto-").concat(key, "\">\n                  ").concat(feature.enabled ? 'Enabled' : 'Disabled', "\n                </label>\n              </div>\n            "), "\n          </div>\n        </div>\n      ");
      }).join(''), "\n    ");
    }
  }]);
}(); // Global functions
window.unlockAutomation = function (featureKey) {
  _AutomationSystem["default"].unlock(featureKey);
};
window.toggleAutomation = function (featureKey) {
  _AutomationSystem["default"].toggle(featureKey);
};

// Initialize
new AutomationUI();
var _default = exports["default"] = AutomationUI;

},{"../systems/AutomationSystem.js":20,"../utils/EventBus.js":56}],36:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _StateManager = _interopRequireDefault(require("../core/StateManager.js"));
var _EventBus = _interopRequireDefault(require("../utils/EventBus.js"));
var _Logger = _interopRequireDefault(require("../utils/Logger.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /**
 * BadgeManager - Manages notification badges across tabs
 */
var BadgeManager = /*#__PURE__*/function () {
  function BadgeManager() {
    _classCallCheck(this, BadgeManager);
    this.badges = {
      quests: document.getElementById('quests-badge'),
      achievements: document.getElementById('achievements-badge'),
      guardians: document.getElementById('guardians-badge')
    };
    this.subscribeToEvents();
    this.updateAllBadges();
    _Logger["default"].info('BadgeManager', 'Initialized');
  }
  return _createClass(BadgeManager, [{
    key: "subscribeToEvents",
    value: function subscribeToEvents() {
      var _this = this;
      // Update on state changes
      _EventBus["default"].on('quest:completed', function () {
        return _this.updateQuestsBadge();
      });
      _EventBus["default"].on('quest:claimed', function () {
        return _this.updateQuestsBadge();
      });
      _EventBus["default"].on('achievement:unlocked', function () {
        return _this.updateAchievementsBadge();
      });
      _EventBus["default"].on('achievement:claimed', function () {
        return _this.updateAchievementsBadge();
      });

      // Update on game tick (for completed quests)
      _EventBus["default"].on('game:tick', function () {
        // Throttle to once per second
        if (!_this.lastUpdate || Date.now() - _this.lastUpdate > 1000) {
          _this.updateAllBadges();
          _this.lastUpdate = Date.now();
        }
      });
    }
  }, {
    key: "updateAllBadges",
    value: function updateAllBadges() {
      this.updateQuestsBadge();
      this.updateAchievementsBadge();
      this.updateGuardiansBadge();
    }
  }, {
    key: "updateQuestsBadge",
    value: function updateQuestsBadge() {
      var state = _StateManager["default"].getState();
      var completedQuests = state.quests.active.filter(function (q) {
        return q.completed;
      }).length;
      this.setBadge('quests', completedQuests);
    }
  }, {
    key: "updateAchievementsBadge",
    value: function updateAchievementsBadge() {
      var _state$achievements;
      var state = _StateManager["default"].getState();

      // ===== FIX: Adaptare pentru structura de array =====
      // Verifică dacă achievements sunt în formatul vechi (array-based)
      if (Array.isArray((_state$achievements = state.achievements) === null || _state$achievements === void 0 ? void 0 : _state$achievements.unlocked)) {
        // Formatul: { unlocked: [], claimed: [] }
        var unlockedAchievements = state.achievements.unlocked || [];
        var claimedAchievements = state.achievements.claimed || [];

        // Achievements unlocked dar NU claimed
        var _unclaimedCount = unlockedAchievements.filter(function (key) {
          return !claimedAchievements.includes(key);
        }).length;
        this.setBadge('achievements', _unclaimedCount);
        return;
      }

      // Fallback: format nou (object-based)
      var unclaimedCount = 0;
      for (var _i = 0, _Object$values = Object.values(state.achievements); _i < _Object$values.length; _i++) {
        var achievement = _Object$values[_i];
        if (achievement.unlocked && !achievement.claimed) {
          unclaimedCount++;
        }
      }
      this.setBadge('achievements', unclaimedCount);
      // ===== SFÂRȘIT FIX =====
    }
  }, {
    key: "updateGuardiansBadge",
    value: function updateGuardiansBadge() {
      var state = _StateManager["default"].getState();
      var canSummon = state.resources.gems >= 100;

      // Show "!" if can summon guardian
      if (canSummon) {
        this.setBadge('guardians', '!');
      } else {
        this.hideBadge('guardians');
      }
    }
  }, {
    key: "setBadge",
    value: function setBadge(badgeKey, value) {
      var badge = this.badges[badgeKey];
      if (!badge) return;
      if (value && value !== 0) {
        badge.textContent = value;
        badge.style.display = 'inline-block';

        // Add pulse animation
        badge.classList.add('badge-pulse');
        setTimeout(function () {
          return badge.classList.remove('badge-pulse');
        }, 300);
      } else {
        this.hideBadge(badgeKey);
      }
    }
  }, {
    key: "hideBadge",
    value: function hideBadge(badgeKey) {
      var badge = this.badges[badgeKey];
      if (badge) {
        badge.style.display = 'none';
      }
    }

    // Clear badge when tab is clicked
  }, {
    key: "clearBadgeOnTabClick",
    value: function clearBadgeOnTabClick(tabName) {
      var _this2 = this;
      var badge = this.badges[tabName];
      if (badge) {
        // Don't clear immediately - let the system update it naturally
        setTimeout(function () {
          if (tabName === 'quests') _this2.updateQuestsBadge();
          if (tabName === 'achievements') _this2.updateAchievementsBadge();
        }, 100);
      }
    }
  }]);
}();
var badgeManager = new BadgeManager();
var _default = exports["default"] = badgeManager;

},{"../core/StateManager.js":6,"../utils/EventBus.js":56,"../utils/Logger.js":58}],37:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _BossSystem = _interopRequireDefault(require("../systems/BossSystem.js"));
var _StateManager = _interopRequireDefault(require("../core/StateManager.js"));
var _EventBus = _interopRequireDefault(require("../utils/EventBus.js"));
var _Formatters = _interopRequireDefault(require("../utils/Formatters.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /**
 * BossesUI - Manages bosses tab display
 */
var BossesUI = /*#__PURE__*/function () {
  function BossesUI(containerId) {
    _classCallCheck(this, BossesUI);
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error("BossesUI: Container ".concat(containerId, " not found"));
      return;
    }
    this.render();
    this.subscribe();
  }
  return _createClass(BossesUI, [{
    key: "subscribe",
    value: function subscribe() {
      var _this = this;
      _EventBus["default"].on('boss:unlocked', function () {
        return _this.render();
      });
      _EventBus["default"].on('boss:defeated', function () {
        return _this.render();
      });
      _EventBus["default"].on('boss:damage-dealt', function (data) {
        return _this.updateBossHP(data);
      });
    }
  }, {
    key: "render",
    value: function render() {
      var bosses = _BossSystem["default"].bosses;
      this.container.innerHTML = '';
      for (var _i = 0, _Object$entries = Object.entries(bosses); _i < _Object$entries.length; _i++) {
        var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
          key = _Object$entries$_i[0],
          boss = _Object$entries$_i[1];
        if (boss.locked) continue;
        var card = this.createBossCard(key, boss);
        this.container.appendChild(card);
      }
    }
  }, {
    key: "createBossCard",
    value: function createBossCard(key, boss) {
      var state = _BossSystem["default"].getBossState(key);
      var card = document.createElement('div');
      card.className = 'boss-card';
      card.dataset.bossKey = key;
      if (!(state !== null && state !== void 0 && state.unlocked)) card.classList.add('locked');
      var hpPercentage = state ? state.currentHP / state.maxHP * 100 : 100;
      var isDefeated = state && state.currentHP <= 0;

      // Format rewards
      var rewards = boss.rewards.firstTime;
      var rewardParts = [];
      if (rewards.gems) rewardParts.push("".concat(rewards.gems, " \uD83D\uDC8E"));
      if (rewards.crystals) rewardParts.push("".concat(rewards.crystals, " \uD83D\uDCA0"));
      if (rewards.energy) rewardParts.push("".concat(_Formatters["default"].formatNumber(rewards.energy), " \u26A1"));
      if (rewards.guaranteedGuardian) {
        rewardParts.push("".concat(rewards.guaranteedGuardian.rarity, " Guardian"));
      }
      card.innerHTML = "\n      <div class=\"boss-tier-badge\">\n        Tier ".concat(boss.tier, "\n      </div>\n      \n      <div class=\"boss-header\">\n        <div class=\"boss-emoji\">").concat(boss.emoji, "</div>\n        <h3 class=\"boss-name\">").concat(boss.name, "</h3>\n        <p class=\"boss-description\">").concat(boss.description, "</p>\n      </div>\n      \n      ").concat(state !== null && state !== void 0 && state.unlocked ? "\n        <div class=\"boss-hp-bar\">\n          <div class=\"boss-hp-label\">\n            <span>HP:</span>\n            <span>".concat(_Formatters["default"].formatNumber(state.currentHP), " / ").concat(_Formatters["default"].formatNumber(state.maxHP), "</span>\n          </div>\n          <div class=\"boss-hp-bar-bg\">\n            <div class=\"boss-hp-bar-fill\" style=\"width: ").concat(hpPercentage, "%\"></div>\n          </div>\n        </div>\n        \n        ").concat(state.attempts > 0 ? "\n          <div class=\"boss-stats\">\n            <p>Attempts: ".concat(state.attempts, "</p>\n            <p>Best Score: ").concat(state.bestScore, "</p>\n            ").concat(state.defeatedCount > 0 ? "<p>Times Defeated: ".concat(state.defeatedCount, "</p>") : '', "\n          </div>\n        ") : '', "\n        \n        <div class=\"boss-rewards\">\n          <h4>").concat(isDefeated ? 'Repeat Rewards:' : 'First Clear Rewards:', "</h4>\n          <div class=\"boss-reward-list\">\n            ").concat(rewardParts.map(function (r) {
        return "<span class=\"boss-reward-item\">".concat(r, "</span>");
      }).join(''), "\n          </div>\n        </div>\n        \n        <button class=\"btn btn-danger btn-large\" onclick=\"challengeBoss('").concat(key, "')\">\n          \u2694\uFE0F ").concat(isDefeated ? 'Challenge Again' : 'Challenge Boss', "\n        </button>\n      ") : "\n        <div class=\"boss-locked-info\">\n          <p>\uD83D\uDD12 Requirements:</p>\n          <ul>\n            ".concat(this.getUnlockRequirements(boss).map(function (req) {
        return "<li>".concat(req, "</li>");
      }).join(''), "\n          </ul>\n        </div>\n      "), "\n    ");
      return card;
    }
  }, {
    key: "updateBossHP",
    value: function updateBossHP(data) {
      var card = this.container.querySelector("[data-boss-key=\"".concat(data.bossKey, "\"]"));
      if (!card) return;
      var hpBar = card.querySelector('.boss-hp-bar-fill');
      var hpLabel = card.querySelector('.boss-hp-label span:last-child');
      if (hpBar) {
        var percentage = data.currentHP / data.maxHP * 100;
        hpBar.style.width = "".concat(percentage, "%");
      }
      if (hpLabel) {
        hpLabel.textContent = "".concat(_Formatters["default"].formatNumber(data.currentHP), " / ").concat(_Formatters["default"].formatNumber(data.maxHP));
      }
    }
  }, {
    key: "getUnlockRequirements",
    value: function getUnlockRequirements(boss) {
      var requirements = [];
      var condition = boss.unlockCondition;
      if (!condition) return ['Always available'];
      if (condition.production) {
        for (var _i2 = 0, _Object$entries2 = Object.entries(condition.production); _i2 < _Object$entries2.length; _i2++) {
          var _Object$entries2$_i = _slicedToArray(_Object$entries2[_i2], 2),
            resource = _Object$entries2$_i[0],
            amount = _Object$entries2$_i[1];
          requirements.push("".concat(_Formatters["default"].formatNumber(amount), " ").concat(resource, "/s"));
        }
      }
      if (condition.structures) {
        if (condition.structures.total) {
          requirements.push("".concat(condition.structures.total, " total structure levels"));
        }
      }
      if (condition.ascension) {
        requirements.push("Ascension Level ".concat(condition.ascension.level));
      }
      if (condition.realms) {
        for (var _i3 = 0, _Object$entries3 = Object.entries(condition.realms); _i3 < _Object$entries3.length; _i3++) {
          var _Object$entries3$_i = _slicedToArray(_Object$entries3[_i3], 2),
            realm = _Object$entries3$_i[0],
            req = _Object$entries3$_i[1];
          if (req === 'unlocked') {
            requirements.push("Unlock ".concat(realm, " realm"));
          }
        }
      }
      if (condition.bosses) {
        for (var _i4 = 0, _Object$entries4 = Object.entries(condition.bosses); _i4 < _Object$entries4.length; _i4++) {
          var _Object$entries4$_i = _slicedToArray(_Object$entries4[_i4], 2),
            bossId = _Object$entries4$_i[0],
            _req = _Object$entries4$_i[1];
          if (_req === 'defeated') {
            var bossData = _BossSystem["default"].bosses[bossId];
            requirements.push("Defeat ".concat((bossData === null || bossData === void 0 ? void 0 : bossData.name) || bossId));
          }
        }
      }
      return requirements;
    }
  }]);
}(); // Global challenge function
window.challengeBoss = function (bossKey) {
  _BossSystem["default"].startBattle(bossKey);
  _EventBus["default"].emit('modal:show', {
    modalId: 'boss-battle-modal'
  });
};
var _default = exports["default"] = BossesUI;

},{"../core/StateManager.js":6,"../systems/BossSystem.js":21,"../utils/EventBus.js":56,"../utils/Formatters.js":57}],38:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _DailyRewardSystem = _interopRequireDefault(require("../systems/DailyRewardSystem.js"));
var _EventBus = _interopRequireDefault(require("../utils/EventBus.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /**
 * DailyRewardUI - Daily rewards modal
 */
var DailyRewardUI = /*#__PURE__*/function () {
  function DailyRewardUI() {
    _classCallCheck(this, DailyRewardUI);
    this.init();
    this.subscribe();
  }
  return _createClass(DailyRewardUI, [{
    key: "subscribe",
    value: function subscribe() {
      var _this = this;
      _EventBus["default"].on('modal:shown', function (data) {
        if (data.modalId === 'daily-reward-modal') {
          _this.render();
        }
      });
      _EventBus["default"].on('daily-reward:claimed', function () {
        _this.render();
      });
      _EventBus["default"].on('daily-reward:available', function () {
        _EventBus["default"].emit('modal:show', {
          modalId: 'daily-reward-modal'
        });
      });
    }
  }, {
    key: "init",
    value: function init() {
      // Will render when modal opens
    }
  }, {
    key: "render",
    value: function render() {
      var container = document.getElementById('daily-rewards-grid');
      if (!container) return;
      var rewards = _DailyRewardSystem["default"].getAllRewards();
      var canClaim = _DailyRewardSystem["default"].canClaim();
      container.innerHTML = '';
      rewards.forEach(function (reward) {
        var item = document.createElement('div');
        item.className = 'daily-reward-item';
        if (reward.claimed) item.classList.add('claimed');
        if (reward.current) item.classList.add('current');
        if (reward.next && canClaim.can) item.classList.add('available');

        // Format rewards
        var rewardParts = [];
        if (reward.rewards.gems) rewardParts.push("".concat(reward.rewards.gems, " \uD83D\uDC8E"));
        if (reward.rewards.energy) rewardParts.push("".concat(reward.rewards.energy, " \u26A1"));
        if (reward.rewards.mana) rewardParts.push("".concat(reward.rewards.mana, " \u2728"));
        if (reward.rewards.crystals) rewardParts.push("".concat(reward.rewards.crystals, " \uD83D\uDCA0"));
        if (reward.rewards.guardian) rewardParts.push('Guardian');
        item.innerHTML = "\n        <div class=\"daily-reward-day\">Day ".concat(reward.day, "</div>\n        <div class=\"daily-reward-emoji\">").concat(reward.emoji, "</div>\n        <div class=\"daily-reward-content\">\n          ").concat(rewardParts.map(function (r) {
          return "<div>".concat(r, "</div>");
        }).join(''), "\n        </div>\n      ");

        // Add click handler for available reward
        if (reward.next && canClaim.can) {
          item.style.cursor = 'pointer';
          item.addEventListener('click', function () {
            _DailyRewardSystem["default"].claim();
          });
        }
        container.appendChild(item);
      });
    }
  }]);
}(); // Initialize
new DailyRewardUI();
var _default = exports["default"] = DailyRewardUI;

},{"../systems/DailyRewardSystem.js":22,"../utils/EventBus.js":56}],39:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _GuardianSystem = _interopRequireDefault(require("../systems/GuardianSystem.js"));
var _StateManager = _interopRequireDefault(require("../core/StateManager.js"));
var _EventBus = _interopRequireDefault(require("../utils/EventBus.js"));
var _Formatters = _interopRequireDefault(require("../utils/Formatters.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /**
 * GuardiansUI - Manages guardians tab display
 */
var GuardiansUI = /*#__PURE__*/function () {
  function GuardiansUI(containerId) {
    var _document$getElementB,
      _this = this;
    _classCallCheck(this, GuardiansUI);
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error("GuardiansUI: Container ".concat(containerId, " not found"));
      return;
    }
    this.render();
    this.subscribe();

    // Bind summon button
    (_document$getElementB = document.getElementById('summon-guardian-btn')) === null || _document$getElementB === void 0 || _document$getElementB.addEventListener('click', function () {
      _this.summonGuardian();
    });
  }
  return _createClass(GuardiansUI, [{
    key: "subscribe",
    value: function subscribe() {
      var _this2 = this;
      _EventBus["default"].on('guardian:summoned', function () {
        return _this2.render();
      });
      _EventBus["default"].on('guardian:dismissed', function () {
        return _this2.render();
      });
      _EventBus["default"].on('state:ADD_RESOURCE', function () {
        return _this2.updateSummonButton();
      });
    }
  }, {
    key: "render",
    value: function render() {
      this.renderStats();
      this.renderGuardians();
      this.updateSummonButton();
    }
  }, {
    key: "renderStats",
    value: function renderStats() {
      var statsContainer = document.getElementById('guardian-stats');
      if (!statsContainer) return;
      var stats = _GuardianSystem["default"].getStats();
      var state = _StateManager["default"].getState();
      statsContainer.innerHTML = "\n      <div class=\"summary-card\">\n        <h4>Total Guardians</h4>\n        <p class=\"summary-value\">".concat(stats.total, "</p>\n      </div>\n      \n      <div class=\"summary-card\">\n        <h4>\u26A1 Energy Bonus</h4>\n        <p class=\"summary-value\">+").concat(stats.totalBonus.energy, "%</p>\n      </div>\n      \n      <div class=\"summary-card\">\n        <h4>\u2728 Mana Bonus</h4>\n        <p class=\"summary-value\">+").concat(stats.totalBonus.mana, "%</p>\n      </div>\n      \n      <div class=\"summary-card\">\n        <h4>\uD83C\uDF1F Universal Bonus</h4>\n        <p class=\"summary-value\">+").concat(stats.totalBonus.all, "%</p>\n      </div>\n      \n      <div class=\"summary-card\">\n        <h4>Average Bonus</h4>\n        <p class=\"summary-value\">").concat(stats.averageBonus.toFixed(1), "%</p>\n      </div>\n      \n      <div class=\"summary-card\">\n        <h4>\u2B50 Legendary</h4>\n        <p class=\"summary-value\">").concat(stats.byRarity.legendary || 0, "</p>\n      </div>\n    ");
    }
  }, {
    key: "renderGuardians",
    value: function renderGuardians() {
      var _this3 = this;
      var guardians = _GuardianSystem["default"].getGuardians();
      if (guardians.length === 0) {
        this.container.innerHTML = "\n        <div class=\"empty-state\">\n          <p style=\"font-size: 3rem; margin-bottom: 1rem;\">\uD83D\uDC09</p>\n          <h3>No Guardians Yet</h3>\n          <p>Summon your first guardian to boost your production!</p>\n        </div>\n      ";
        return;
      }

      // Sort by rarity and bonus
      var sorted = _toConsumableArray(guardians).sort(function (a, b) {
        var rarityOrder = {
          legendary: 5,
          epic: 4,
          rare: 3,
          uncommon: 2,
          common: 1
        };
        var rarityDiff = rarityOrder[b.rarity] - rarityOrder[a.rarity];
        if (rarityDiff !== 0) return rarityDiff;
        return b.bonus - a.bonus;
      });
      this.container.innerHTML = '';
      sorted.forEach(function (guardian) {
        var card = _this3.createGuardianCard(guardian);
        _this3.container.appendChild(card);
      });
    }
  }, {
    key: "createGuardianCard",
    value: function createGuardianCard(guardian) {
      var card = document.createElement('div');
      card.className = "guardian-card rarity-".concat(guardian.rarity);
      var typeName = this.getTypeName(guardian.type);
      card.innerHTML = "\n      <div class=\"guardian-header\">\n        <span class=\"guardian-emoji\">".concat(guardian.emoji, "</span>\n        <div class=\"guardian-info\">\n          <h4 class=\"guardian-name\">").concat(guardian.name, "</h4>\n          <span class=\"guardian-rarity ").concat(guardian.rarity, "\">\n            ").concat(_GuardianSystem["default"].getRarityName(guardian.rarity), "\n          </span>\n        </div>\n      </div>\n      \n      <div class=\"guardian-bonus\">\n        <div class=\"guardian-bonus-value\">+").concat(guardian.bonus, "%</div>\n        <div class=\"guardian-bonus-label\">").concat(typeName, " Production</div>\n      </div>\n      \n      <div class=\"guardian-meta\">\n        <small>Summoned: ").concat(new Date(guardian.summonedAt).toLocaleDateString(), "</small>\n      </div>\n      \n      <button class=\"btn btn-small btn-danger\" onclick=\"dismissGuardian('").concat(guardian.id, "')\">\n        Dismiss\n      </button>\n    ");
      return card;
    }
  }, {
    key: "summonGuardian",
    value: function summonGuardian() {
      var success = _GuardianSystem["default"].summon();
      if (!success) {
        // Notification will be shown by GuardianSystem
        return;
      }

      // Show animation
      var btn = document.getElementById('summon-guardian-btn');
      if (btn) {
        btn.classList.add('btn-loading');
        setTimeout(function () {
          btn.classList.remove('btn-loading');
        }, 1000);
      }
    }
  }, {
    key: "updateSummonButton",
    value: function updateSummonButton() {
      var btn = document.getElementById('summon-guardian-btn');
      if (!btn) return;
      var canSummon = _GuardianSystem["default"].canSummon();
      btn.disabled = !canSummon;
    }
  }, {
    key: "getTypeName",
    value: function getTypeName(type) {
      var names = {
        energy: 'Energy',
        mana: 'Mana',
        volcanic: 'Volcanic',
        all: 'All Resources',
        gems: 'Gem'
      };
      return names[type] || type;
    }
  }]);
}(); // Global dismiss function
window.dismissGuardian = function (guardianId) {
  if (confirm('Are you sure you want to dismiss this guardian? This cannot be undone!')) {
    _GuardianSystem["default"].dismiss(guardianId);
  }
};
var _default = exports["default"] = GuardiansUI;

},{"../core/StateManager.js":6,"../systems/GuardianSystem.js":23,"../utils/EventBus.js":56,"../utils/Formatters.js":57}],40:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _MiniGameAchievementSystem = _interopRequireDefault(require("../systems/MiniGameAchievementSystem.js"));
var _miniGameAchievements = require("../data/miniGameAchievements.js");
var _Formatters = _interopRequireDefault(require("../utils/Formatters.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /**
 * MiniGameStatsUI - Display mini-game statistics and achievements
 */
var MiniGameStatsUI = /*#__PURE__*/function () {
  function MiniGameStatsUI() {
    _classCallCheck(this, MiniGameStatsUI);
  }
  return _createClass(MiniGameStatsUI, [{
    key: "renderMiniGameAchievements",
    value:
    /**
     * Render mini-game achievements section in Achievements UI
     */
    function renderMiniGameAchievements(container, gameType) {
      var _this = this;
      var progress = _MiniGameAchievementSystem["default"].getProgress(gameType);
      var stats = _MiniGameAchievementSystem["default"].getGameStats(gameType);
      var gameNames = {
        dailySpin: '🎰 Daily Spin',
        game2048: '🎮 2048',
        match3: '🧩 Match-3'
      };
      container.innerHTML = "\n      <div class=\"mini-game-achievements\">\n        <div class=\"achievement-header\">\n          <h3>".concat(gameNames[gameType], "</h3>\n          <div class=\"achievement-progress-bar\">\n            <div class=\"progress-fill\" style=\"width: ").concat(stats.percentage, "%\"></div>\n            <span class=\"progress-text\">").concat(stats.unlocked, "/").concat(stats.total, " (").concat(stats.percentage, "%)</span>\n          </div>\n        </div>\n        \n        <div class=\"achievements-grid\">\n          ").concat(progress.map(function (achievement) {
        return _this.renderAchievementCard(achievement);
      }).join(''), "\n        </div>\n      </div>\n    ");
    }

    /**
     * Render single achievement card - MATCHES GENERAL ACHIEVEMENTS STRUCTURE
     */
  }, {
    key: "renderAchievementCard",
    value: function renderAchievementCard(achievement) {
      var tier = _miniGameAchievements.ACHIEVEMENT_TIERS[achievement.tier];
      var unlocked = achievement.unlocked;

      // Format rewards (match general achievements format)
      var rewardParts = [];
      if (achievement.reward.gems) rewardParts.push("".concat(achievement.reward.gems, " \uD83D\uDC8E"));
      if (achievement.reward.crystals) rewardParts.push("".concat(achievement.reward.crystals, " \uD83D\uDCA0"));
      if (achievement.reward.energy) rewardParts.push("".concat(_Formatters["default"].formatNumber(achievement.reward.energy), " \u26A1"));
      if (achievement.reward.timeShards) rewardParts.push("".concat(achievement.reward.timeShards, " \u23F0"));
      if (achievement.reward.guardian) rewardParts.push("\uD83D\uDEE1\uFE0F Guardian");
      return "\n      <div class=\"achievement-card ".concat(unlocked ? 'unlocked' : 'locked', "\">\n        <div class=\"achievement-tier-badge ").concat(achievement.tier, "\">\n          ").concat(tier.icon, "\n        </div>\n        \n        <div class=\"achievement-content\">\n          <span class=\"achievement-emoji\">").concat(achievement.icon, "</span>\n          <div class=\"achievement-info\">\n            <h4 class=\"achievement-name\">").concat(achievement.name, "</h4>\n            <p class=\"achievement-description\">").concat(achievement.description, "</p>\n          </div>\n        </div>\n        \n        <div class=\"achievement-reward\">\n          Reward: ").concat(rewardParts.join(', '), "\n        </div>\n        \n        ").concat(unlocked ? "\n          <div class=\"achievement-claimed\">\n            \u2713 Unlocked".concat(achievement.timestamp ? " - ".concat(this.formatDate(achievement.timestamp)) : '', "\n          </div>\n        ") : "\n          <div class=\"achievement-locked\">\n            \uD83D\uDD12 Locked\n          </div>\n        ", "\n      </div>\n    ");
    }

    /**
     * Format reward display (DEPRECATED - kept for backwards compatibility)
     */
  }, {
    key: "formatReward",
    value: function formatReward(reward) {
      var icons = {
        timeShards: '⏰',
        gems: '💎',
        energy: '⚡',
        crystals: '💠',
        guardian: '🛡️'
      };
      var parts = [];
      for (var _i = 0, _Object$entries = Object.entries(reward); _i < _Object$entries.length; _i++) {
        var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
          resource = _Object$entries$_i[0],
          amount = _Object$entries$_i[1];
        if (resource === 'guardian') {
          parts.push("<span class=\"reward-item\">".concat(icons[resource], " Guardian</span>"));
        } else {
          parts.push("<span class=\"reward-item\">".concat(_Formatters["default"].formatNumber(amount), " ").concat(icons[resource], "</span>"));
        }
      }
      return parts.join(' ');
    }

    /**
     * Format date
     */
  }, {
    key: "formatDate",
    value: function formatDate(timestamp) {
      var date = new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }

    /**
     * Render mini-game stats in Statistics UI
     */
  }, {
    key: "renderMiniGameStats",
    value: function renderMiniGameStats(container) {
      var overallStats = _MiniGameAchievementSystem["default"].getOverallStats();
      container.innerHTML = "\n      <div class=\"mini-game-stats-section\">\n        <h3>\uD83C\uDFAE Mini-Game Progress</h3>\n        \n        <div class=\"overall-progress\">\n          <div class=\"stat-card\">\n            <div class=\"stat-value\">".concat(overallStats.unlocked, "/").concat(overallStats.total, "</div>\n            <div class=\"stat-label\">Total Achievements</div>\n            <div class=\"progress-bar\">\n              <div class=\"progress-fill\" style=\"width: ").concat(overallStats.percentage, "%\"></div>\n            </div>\n          </div>\n        </div>\n        \n        <div class=\"game-stats-grid\">\n          ").concat(this.renderGameStatCard('dailySpin', '🎰 Daily Spin', overallStats.byGame.dailySpin), "\n          ").concat(this.renderGameStatCard('game2048', '🎮 2048', overallStats.byGame.game2048), "\n          ").concat(this.renderGameStatCard('match3', '🧩 Match-3', overallStats.byGame.match3), "\n        </div>\n      </div>\n    ");
    }

    /**
     * Render game stat card
     */
  }, {
    key: "renderGameStatCard",
    value: function renderGameStatCard(gameType, name, stats) {
      return "\n      <div class=\"game-stat-card\" data-game=\"".concat(gameType, "\">\n        <h4>").concat(name, "</h4>\n        <div class=\"stat-value\">").concat(stats.unlocked, "/").concat(stats.total, "</div>\n        <div class=\"progress-bar small\">\n          <div class=\"progress-fill\" style=\"width: ").concat(stats.percentage, "%\"></div>\n        </div>\n        <div class=\"stat-label\">").concat(stats.percentage, "% Complete</div>\n      </div>\n    ");
    }
  }]);
}();
var _default = exports["default"] = new MiniGameStatsUI();

},{"../data/miniGameAchievements.js":11,"../systems/MiniGameAchievementSystem.js":24,"../utils/Formatters.js":57}],41:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _EventBus = _interopRequireDefault(require("../utils/EventBus.js"));
var _Logger = _interopRequireDefault(require("../utils/Logger.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /**
 * ModalManager - Handles modal display and interaction
 */
var ModalManager = /*#__PURE__*/function () {
  function ModalManager() {
    _classCallCheck(this, ModalManager);
    this.modals = document.querySelectorAll('.modal');
    this.activeModal = null;
    this.init();
    _Logger["default"].info('ModalManager', 'Initialized');
  }
  return _createClass(ModalManager, [{
    key: "init",
    value: function init() {
      var _this = this;
      // Bind close buttons
      this.modals.forEach(function (modal) {
        var closeBtn = modal.querySelector('.modal-close');
        var overlay = modal.querySelector('.modal-overlay');
        if (closeBtn) {
          closeBtn.addEventListener('click', function () {
            _this.hide(modal.id);
          });
        }
        if (overlay) {
          overlay.addEventListener('click', function () {
            _this.hide(modal.id);
          });
        }
      });

      // Listen for modal events
      _EventBus["default"].on('modal:show', function (data) {
        _this.show(data.modalId);
      });
      _EventBus["default"].on('modal:hide', function (data) {
        _this.hide(data.modalId);
      });

      // ESC key to close
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && _this.activeModal) {
          _this.hide(_this.activeModal);
        }
      });
    }
  }, {
    key: "show",
    value: function show(modalId) {
      var modal = document.getElementById(modalId);
      if (!modal) {
        _Logger["default"].warn('ModalManager', "Modal ".concat(modalId, " not found"));
        return;
      }

      // Hide current modal if any
      if (this.activeModal && this.activeModal !== modalId) {
        this.hide(this.activeModal);
      }
      modal.classList.add('active');
      this.activeModal = modalId;

      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      _Logger["default"].debug('ModalManager', "Showing modal: ".concat(modalId));
      _EventBus["default"].emit('modal:shown', {
        modalId: modalId
      });
    }
  }, {
    key: "hide",
    value: function hide(modalId) {
      var modal = document.getElementById(modalId);
      if (!modal) return;
      modal.classList.remove('active');
      if (this.activeModal === modalId) {
        this.activeModal = null;
      }

      // Restore body scroll
      document.body.style.overflow = '';
      _Logger["default"].debug('ModalManager', "Hiding modal: ".concat(modalId));
      _EventBus["default"].emit('modal:hidden', {
        modalId: modalId
      });
    }
  }, {
    key: "hideAll",
    value: function hideAll() {
      this.modals.forEach(function (modal) {
        modal.classList.remove('active');
      });
      this.activeModal = null;
      document.body.style.overflow = '';
    }
  }, {
    key: "isActive",
    value: function isActive(modalId) {
      return this.activeModal === modalId;
    }
  }]);
}();
var _default = exports["default"] = ModalManager;

},{"../utils/EventBus.js":56,"../utils/Logger.js":58}],42:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _EventBus = _interopRequireDefault(require("../utils/EventBus.js"));
var _Logger = _interopRequireDefault(require("../utils/Logger.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /**
 * NotificationManager - Displays toast notifications
 */
var NotificationManager = /*#__PURE__*/function () {
  function NotificationManager() {
    _classCallCheck(this, NotificationManager);
    this.container = document.getElementById('notification-container');
    this.notifications = [];
    this.maxNotifications = 5;
    this.init();
    _Logger["default"].info('NotificationManager', 'Initialized');
  }
  return _createClass(NotificationManager, [{
    key: "init",
    value: function init() {
      var _this = this;
      if (!this.container) {
        _Logger["default"].error('NotificationManager', 'Notification container not found');
        return;
      }

      // Listen for notification events
      _EventBus["default"].on('notification:show', function (data) {
        _this.show(data);
      });
    }
  }, {
    key: "show",
    value: function show(data) {
      var _this2 = this;
      var _data$title = data.title,
        title = _data$title === void 0 ? '' : _data$title,
        _data$message = data.message,
        message = _data$message === void 0 ? '' : _data$message,
        _data$description = data.description,
        description = _data$description === void 0 ? '' : _data$description,
        _data$type = data.type,
        type = _data$type === void 0 ? 'info' : _data$type,
        _data$duration = data.duration,
        duration = _data$duration === void 0 ? 3000 : _data$duration;

      // Remove oldest if at max
      if (this.notifications.length >= this.maxNotifications) {
        this.remove(this.notifications[0]);
      }

      // Create notification element
      var notification = document.createElement('div');
      notification.className = "notification ".concat(type);
      notification.style.animationDuration = "".concat(duration, "ms");

      // Create content
      var content = '';
      if (title) {
        content += "\n        <div class=\"notification-header\">\n          <h4 class=\"notification-title\">".concat(title, "</h4>\n          <button class=\"notification-close\">&times;</button>\n        </div>\n      ");
      }
      if (message) {
        content += "<p class=\"notification-message\">".concat(message, "</p>");
      }
      if (description) {
        content += "<p class=\"notification-description\">".concat(description, "</p>");
      }
      notification.innerHTML = content;

      // Add to container
      this.container.appendChild(notification);
      this.notifications.push(notification);

      // Bind close button
      var closeBtn = notification.querySelector('.notification-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', function () {
          _this2.remove(notification);
        });
      }

      // Auto-remove after duration
      if (duration > 0) {
        setTimeout(function () {
          _this2.remove(notification);
        }, duration);
      }
      _Logger["default"].debug('NotificationManager', "Showing ".concat(type, " notification: ").concat(message));
    }
  }, {
    key: "remove",
    value: function remove(notification) {
      var _this3 = this;
      if (!notification || !notification.parentNode) return;
      notification.classList.add('closing');
      setTimeout(function () {
        notification.remove();
        var index = _this3.notifications.indexOf(notification);
        if (index > -1) {
          _this3.notifications.splice(index, 1);
        }
      }, 300);
    }
  }, {
    key: "clear",
    value: function clear() {
      this.notifications.forEach(function (notification) {
        notification.remove();
      });
      this.notifications = [];
    }
  }]);
}();
var _default = exports["default"] = NotificationManager;

},{"../utils/EventBus.js":56,"../utils/Logger.js":58}],43:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _EventBus = _interopRequireDefault(require("../utils/EventBus.js"));
var _Logger = _interopRequireDefault(require("../utils/Logger.js"));
var _Match3Game = _interopRequireDefault(require("./games/Match3Game.js"));
var _DailySpinGame = _interopRequireDefault(require("./games/DailySpinGame.js"));
var _Game = _interopRequireDefault(require("./games/Game2048.js"));
var _StateManager = _interopRequireDefault(require("../core/StateManager.js"));
var _Game2 = _interopRequireDefault(require("../core/Game.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /**
 * PuzzleUI - Manages puzzle tab and mini-games
 */
var PuzzleUI = /*#__PURE__*/function () {
  function PuzzleUI(containerId) {
    _classCallCheck(this, PuzzleUI);
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error("PuzzleUI: Container ".concat(containerId, " not found"));
      return;
    }
    this.currentGame = null;
    this.match3Game = null;
    this.dailySpinGame = _DailySpinGame["default"];
    this.game2048 = _Game["default"];
    this.countdownInterval = null;
    this.render();
    this.subscribe();
    this.startCountdownUpdate();
    _Logger["default"].info('PuzzleUI', 'Initialized');
  }
  return _createClass(PuzzleUI, [{
    key: "subscribe",
    value: function subscribe() {
      var _this = this;
      // Listen for boss battles requiring puzzle
      _EventBus["default"].on('boss:battle-started', function (data) {
        _this.startBossPuzzle(data);
      });

      // Re-render când se deblochează jocuri sau se fac purchases
      _EventBus["default"].on('quest:claimed', function () {
        return _this.render();
      });
      _EventBus["default"].on('structure:purchased', function () {
        return _this.render();
      });
      _EventBus["default"].on('ascension:completed', function () {
        return _this.render();
      });
      _EventBus["default"].on('puzzle:won', function () {
        return _this.render();
      });
      _EventBus["default"].on('daily-spin:purchased-spins', function () {
        return _this.render();
      });
    }

    /**
     * Start countdown update interval
     */
  }, {
    key: "startCountdownUpdate",
    value: function startCountdownUpdate() {
      var _this2 = this;
      // Update countdown every second
      this.countdownInterval = setInterval(function () {
        _this2.updateCountdown();
      }, 1000);
    }

    /**
     * Update countdown display
     */
  }, {
    key: "updateCountdown",
    value: function updateCountdown() {
      var countdownEl = document.getElementById('spin-countdown');
      if (countdownEl) {
        countdownEl.innerHTML = this.getCountdownText();
      }
      var statusEl = document.getElementById('spin-status');
      if (statusEl) {
        statusEl.innerHTML = this.getSpinStatus();
      }
    }
  }, {
    key: "render",
    value: function render() {
      // Mini-games sunt acum FREE TO PLAY!
      var dailySpinUnlocked = true; // FREE
      var game2048Unlocked = true; // FREE

      this.container.innerHTML = "\n      <div class=\"puzzle-games-grid\">\n        \n        <!-- Match-3 Game Card -->\n        <div class=\"puzzle-game-card\" id=\"match3-card\">\n          <div class=\"puzzle-game-header\">\n            <div class=\"puzzle-game-icon\">\uD83E\uDDE9</div>\n            <h3>Match-3 Puzzle</h3>\n          </div>\n          <div class=\"puzzle-game-description\">\n            <p>Match 3 or more gems to score points</p>\n            <p class=\"puzzle-game-use\">Used for: Boss Battles</p>\n          </div>\n          <div class=\"puzzle-game-stats\">\n            <div class=\"stat\">\n              <span class=\"label\">Best Score:</span>\n              <span class=\"value\" id=\"match3-best-score\">0</span>\n            </div>\n            <div class=\"stat\">\n              <span class=\"label\">Games Played:</span>\n              <span class=\"value\" id=\"match3-games-played\">0</span>\n            </div>\n          </div>\n          <button class=\"btn btn-primary btn-large\" id=\"play-match3-btn\">\n            \uD83C\uDFAE Play Practice Game\n          </button>\n        </div>\n        \n        <!-- 2048 Game Card -->\n        <div class=\"puzzle-game-card\" id=\"game2048-card\">\n          <div class=\"puzzle-game-header\">\n            <div class=\"puzzle-game-icon\">\uD83C\uDFB2</div>\n            <h3>2048 Puzzle</h3>\n          </div>\n          <div class=\"puzzle-game-description\">\n            <p>Merge tiles to reach 2048!</p>\n            <p class=\"puzzle-game-use\">Rewards: Gems, Crystals, Energy</p>\n          </div>\n          <div class=\"puzzle-game-stats\">\n            <div class=\"stat\">\n              <span class=\"label\">High Score:</span>\n              <span class=\"value\" id=\"2048-high-score\">".concat(this.game2048.getStats().highScore, "</span>\n            </div>\n            <div class=\"stat\">\n              <span class=\"label\">Games Played:</span>\n              <span class=\"value\" id=\"2048-games-played\">").concat(this.game2048.getStats().gamesPlayed, "</span>\n            </div>\n          </div>\n          <button class=\"btn btn-primary btn-large\" id=\"play-2048-btn\">\n            \uD83C\uDFAE Play 2048\n          </button>\n        </div>\n        \n        <!-- Daily Spin Card -->\n        <div class=\"puzzle-game-card\" id=\"daily-spin-card\">\n          <div class=\"puzzle-game-header\">\n            <div class=\"puzzle-game-icon\">\uD83C\uDFA1</div>\n            <h3>Daily Spin</h3>\n          </div>\n          <div class=\"puzzle-game-description\">\n            <p>Spin the wheel for rewards!</p>\n            <p class=\"puzzle-game-use\">FREE daily at midnight! \uD83D\uDD5B</p>\n          </div>\n          <div class=\"puzzle-game-stats\">\n            <div class=\"stat\">\n              <span class=\"label\">Free Spin:</span>\n              <span class=\"value\" id=\"spin-status\">\n                ").concat(this.getSpinStatus(), "\n              </span>\n            </div>\n            ").concat(this.getPurchasedSpinsDisplay(), "\n          </div>\n          <div class=\"spin-countdown\" id=\"spin-countdown\" style=\"\n            text-align: center;\n            margin: 10px 0;\n            padding: 8px;\n            background: var(--bg-tertiary);\n            border-radius: var(--radius-md);\n            font-size: 0.875rem;\n            color: var(--text-secondary);\n          \">\n            ").concat(this.getCountdownText(), "\n          </div>\n          <button class=\"btn btn-primary btn-large\" id=\"play-spin-btn\">\n            \uD83C\uDFA1 Spin the Wheel\n          </button>\n        </div>\n        \n      </div>\n      \n      <!-- Puzzle Game Container (hidden by default) -->\n      <div id=\"puzzle-game-active\" style=\"display: none;\">\n        <!-- Game will render here -->\n      </div>\n    ");

      // Bind events
      this.bindEvents();

      // Load stats
      this.updateStats();
    }
  }, {
    key: "bindEvents",
    value: function bindEvents() {
      var _this3 = this;
      // Match-3 button
      var playMatch3Btn = document.getElementById('play-match3-btn');
      if (playMatch3Btn) {
        playMatch3Btn.addEventListener('click', function () {
          _this3.startPracticeMatch3();
        });
      }

      // 2048 button
      var play2048Btn = document.getElementById('play-2048-btn');
      if (play2048Btn) {
        play2048Btn.addEventListener('click', function () {
          _this3.start2048Game();
        });
      }

      // Daily Spin button
      var playSpinBtn = document.getElementById('play-spin-btn');
      if (playSpinBtn) {
        playSpinBtn.addEventListener('click', function () {
          _this3.startDailySpin();
        });
      }
    }

    // ===== DAILY SPIN HELPERS =====
  }, {
    key: "getSpinStatus",
    value: function getSpinStatus() {
      var canSpinResult = this.dailySpinGame.canSpin();
      if (canSpinResult.type === 'free' && canSpinResult.can) {
        return '✅ Available';
      } else if (canSpinResult.type === 'purchased' && canSpinResult.can) {
        return "\uD83C\uDF9F\uFE0F ".concat(canSpinResult.spinsRemaining, " Extra");
      } else if (canSpinResult.reason === 'already_spun_today') {
        return '⏰ Tomorrow';
      }
      return '🔒 Locked';
    }
  }, {
    key: "getPurchasedSpinsDisplay",
    value: function getPurchasedSpinsDisplay() {
      var stats = this.dailySpinGame.getStats();
      var purchased = stats.purchasedSpins || 0;
      if (purchased > 0) {
        return "\n        <div class=\"stat\">\n          <span class=\"label\">Extra Spins:</span>\n          <span class=\"value\" style=\"color: var(--warning);\">\uD83C\uDF9F\uFE0F ".concat(purchased, "</span>\n        </div>\n      ");
      }
      return '';
    }
  }, {
    key: "getCountdownText",
    value: function getCountdownText() {
      var canSpinResult = this.dailySpinGame.canSpin();
      if (canSpinResult.nextFreeIn > 0) {
        var formatted = this.dailySpinGame.formatTimeRemaining(canSpinResult.nextFreeIn);
        return "\u23F0 Next free spin in: <strong>".concat(formatted, "</strong>");
      }
      if (canSpinResult.type === 'free' && canSpinResult.can) {
        return '🎉 <strong>Free spin available!</strong>';
      }
      return '';
    }

    // ===== STATS UPDATE =====
  }, {
    key: "updateStats",
    value: function updateStats() {
      var state = _StateManager["default"].getState();
      var stats = state.statistics || {};
      var bestScore = stats.puzzleHighScore || 0;
      var gamesPlayed = stats.puzzlesPlayed || 0;
      var bestScoreEl = document.getElementById('match3-best-score');
      var gamesPlayedEl = document.getElementById('match3-games-played');
      if (bestScoreEl) bestScoreEl.textContent = bestScore;
      if (gamesPlayedEl) gamesPlayedEl.textContent = gamesPlayed;
    }

    // ===== MATCH-3 GAME =====
  }, {
    key: "startPracticeMatch3",
    value: function startPracticeMatch3() {
      var _this4 = this;
      _Logger["default"].info('PuzzleUI', 'Starting practice Match-3');
      var grid = this.container.querySelector('.puzzle-games-grid');
      if (grid) grid.style.display = 'none';
      var gameContainer = document.getElementById('puzzle-game-active');
      if (gameContainer) {
        gameContainer.style.display = 'block';
        this.match3Game = new _Match3Game["default"](gameContainer, {
          mode: 'practice',
          maxMoves: 20,
          targetScore: 500,
          onComplete: function onComplete(result) {
            _this4.onPuzzleComplete(result);
          },
          onExit: function onExit() {
            _this4.exitPuzzle();
          }
        });
      }
    }
  }, {
    key: "startBossPuzzle",
    value: function startBossPuzzle(bossData) {
      var _this5 = this;
      var boss = bossData.boss,
        bossKey = bossData.bossKey;
      _Logger["default"].info('PuzzleUI', "Starting boss puzzle for ".concat(boss.name));
      var puzzleReq = boss.puzzleRequirement;
      var modalContent = document.getElementById('boss-battle-content');
      if (!modalContent) {
        _Logger["default"].error('PuzzleUI', 'Boss battle content container not found!');
        return;
      }
      modalContent.innerHTML = "\n      <div class=\"boss-battle-header\"></div>\n      <div id=\"boss-puzzle-container\"></div>\n    ";
      var puzzleContainer = document.getElementById('boss-puzzle-container');
      if (!puzzleContainer) {
        _Logger["default"].error('PuzzleUI', 'Puzzle container not found!');
        return;
      }
      this.match3Game = new _Match3Game["default"](puzzleContainer, {
        mode: 'boss',
        bossKey: bossKey,
        bossName: boss.name,
        maxMoves: puzzleReq.maxMoves,
        targetScore: puzzleReq.targetScore,
        difficulty: puzzleReq.difficulty,
        onComplete: function onComplete(result) {
          _this5.onBossPuzzleComplete(result, bossKey);
        },
        onExit: function onExit() {
          _this5.exitBossPuzzle();
        }
      });
    }
  }, {
    key: "onPuzzleComplete",
    value: function onPuzzleComplete(result) {
      _Logger["default"].info('PuzzleUI', 'Practice puzzle completed', result);
      _StateManager["default"].dispatch({
        type: 'INCREMENT_STATISTIC',
        payload: {
          key: 'puzzlesPlayed',
          amount: 1
        }
      });
      var currentHighScore = _StateManager["default"].getState().statistics.puzzleHighScore || 0;
      if (result.score > currentHighScore) {
        _StateManager["default"].dispatch({
          type: 'UPDATE_STATISTIC',
          payload: {
            key: 'puzzleHighScore',
            value: result.score
          }
        });
        _EventBus["default"].emit('notification:show', {
          message: '🏆 New High Score!',
          type: 'success',
          duration: 3000
        });
      }
      if (result.won) {
        _StateManager["default"].dispatch({
          type: 'INCREMENT_STATISTIC',
          payload: {
            key: 'puzzlesWon',
            amount: 1
          }
        });
      }
      this.showPuzzleResults(result);
      _EventBus["default"].emit('puzzle:practice-completed', result);
    }
  }, {
    key: "onBossPuzzleComplete",
    value: function onBossPuzzleComplete(result, bossKey) {
      _Logger["default"].info('PuzzleUI', 'Boss puzzle completed', result);
      _EventBus["default"].emit('puzzle:completed', {
        score: result.score,
        combo: result.bestCombo,
        moves: result.movesUsed,
        bossKey: bossKey
      });
      var damage = result.totalDamage || result.score;
      _EventBus["default"].emit('notification:show', {
        message: "\uD83D\uDCA5 ".concat(damage, " damage dealt! Combo: ").concat(result.bestCombo, "x"),
        type: 'success',
        duration: 3000
      });
    }

    // ===== 2048 GAME =====
  }, {
    key: "start2048Game",
    value: function start2048Game() {
      _Logger["default"].info('PuzzleUI', 'Starting 2048 game');
      var grid = this.container.querySelector('.puzzle-games-grid');
      if (grid) grid.style.display = 'none';
      var gameContainer = document.getElementById('puzzle-game-active');
      if (gameContainer) {
        gameContainer.style.display = 'block';
        var gameState = this.game2048.newGame();
        this.render2048UI(gameContainer, gameState);
      }
    }
  }, {
    key: "render2048UI",
    value: function render2048UI(container, gameState) {
      container.innerHTML = "\n      <div class=\"game-2048-container\">\n        <div class=\"game-2048-header\">\n          <div class=\"game-2048-score\">\n            <div class=\"score-label\">Score</div>\n            <div class=\"score-value\" id=\"game2048-score\">".concat(gameState.score, "</div>\n          </div>\n          <button class=\"btn btn-secondary\" id=\"game2048-new-game\">New Game</button>\n          <button class=\"btn btn-secondary\" id=\"game2048-exit\">Exit</button>\n        </div>\n        \n        <div class=\"game-2048-grid\" id=\"game2048-grid\">\n          ").concat(this.render2048Grid(gameState.grid), "\n        </div>\n        \n        <div class=\"game-2048-controls\">\n          <p class=\"swipe-hint\">Use arrow keys or swipe to move tiles</p>\n        </div>\n      </div>\n    ");
      this.bind2048Controls(container);
    }
  }, {
    key: "render2048Grid",
    value: function render2048Grid(grid) {
      var html = '';
      var _iterator = _createForOfIteratorHelper(grid),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var row = _step.value;
          var _iterator2 = _createForOfIteratorHelper(row),
            _step2;
          try {
            for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
              var cell = _step2.value;
              var value = cell || '';
              html += "<div class=\"grid-cell ".concat(cell ? '' : 'empty', "\" data-value=\"").concat(cell, "\">").concat(value, "</div>");
            }
          } catch (err) {
            _iterator2.e(err);
          } finally {
            _iterator2.f();
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      return html;
    }
  }, {
    key: "bind2048Controls",
    value: function bind2048Controls(container) {
      var _this6 = this,
        _document$getElementB,
        _document$getElementB2;
      var handleKeyPress = function handleKeyPress(e) {
        var keyMap = {
          'ArrowUp': 'up',
          'ArrowDown': 'down',
          'ArrowLeft': 'left',
          'ArrowRight': 'right',
          'w': 'up',
          'W': 'up',
          's': 'down',
          'S': 'down',
          'a': 'left',
          'A': 'left',
          'd': 'right',
          'D': 'right'
        };
        var direction = keyMap[e.key];
        if (direction) {
          e.preventDefault();
          _this6.move2048(direction);
        }
      };

      // Remove any old handlers first
      if (container._keyHandler) {
        document.removeEventListener('keydown', container._keyHandler);
      }
      document.addEventListener('keydown', handleKeyPress);
      container._keyHandler = handleKeyPress;

      // Touch controls
      var touchStartX = 0;
      var touchStartY = 0;
      var gridEl = container.querySelector('#game2048-grid');
      if (gridEl) {
        gridEl.addEventListener('touchstart', function (e) {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
        });
        gridEl.addEventListener('touchend', function (e) {
          var touchEndX = e.changedTouches[0].clientX;
          var touchEndY = e.changedTouches[0].clientY;
          var diffX = touchEndX - touchStartX;
          var diffY = touchEndY - touchStartY;
          if (Math.abs(diffX) > Math.abs(diffY)) {
            _this6.move2048(diffX > 0 ? 'right' : 'left');
          } else {
            _this6.move2048(diffY > 0 ? 'down' : 'up');
          }
        });
      }
      (_document$getElementB = document.getElementById('game2048-new-game')) === null || _document$getElementB === void 0 || _document$getElementB.addEventListener('click', function () {
        var newState = _this6.game2048.newGame();
        _this6.render2048UI(container, newState);
      });
      (_document$getElementB2 = document.getElementById('game2048-exit')) === null || _document$getElementB2 === void 0 || _document$getElementB2.addEventListener('click', function () {
        _this6.exit2048Game(container);
      });
    }
  }, {
    key: "move2048",
    value: function move2048(direction) {
      var _this7 = this;
      var result = this.game2048.move(direction);
      if (result) {
        var scoreEl = document.getElementById('game2048-score');
        if (scoreEl) scoreEl.textContent = result.score;
        var gridEl = document.getElementById('game2048-grid');
        if (gridEl) gridEl.innerHTML = this.render2048Grid(result.grid);
        if (result.gameOver) {
          setTimeout(function () {
            _this7.show2048GameOver(result);
          }, 500);
        }
      }
    }
  }, {
    key: "show2048GameOver",
    value: function show2048GameOver(result) {
      var _document$getElementB3,
        _this8 = this,
        _document$getElementB4;
      var container = document.getElementById('puzzle-game-active');
      if (!container) return;
      var isHighScore = result.score > (this.game2048.getStats().highScore || 0);
      container.innerHTML = "\n      <div class=\"puzzle-results\">\n        <h2>".concat(result.won ? '🎉 You Won!' : '😔 Game Over', "</h2>\n        <div class=\"puzzle-results-stats\">\n          <div class=\"result-stat\">\n            <span class=\"label\">Final Score:</span>\n            <span class=\"value\">").concat(result.score, "</span>\n          </div>\n          ").concat(isHighScore ? '<p class="high-score-badge">🏆 New High Score!</p>' : '', "\n        </div>\n        <div class=\"result-actions\">\n          <button class=\"btn btn-primary\" id=\"2048-play-again\">Play Again</button>\n          <button class=\"btn btn-secondary\" id=\"2048-results-exit\">Exit</button>\n        </div>\n      </div>\n    ");
      (_document$getElementB3 = document.getElementById('2048-play-again')) === null || _document$getElementB3 === void 0 || _document$getElementB3.addEventListener('click', function () {
        _this8.start2048Game();
      });
      (_document$getElementB4 = document.getElementById('2048-results-exit')) === null || _document$getElementB4 === void 0 || _document$getElementB4.addEventListener('click', function () {
        _this8.exitPuzzle();
      });
    }
  }, {
    key: "exit2048Game",
    value: function exit2048Game(container) {
      if (container._keyHandler) {
        document.removeEventListener('keydown', container._keyHandler);
      }
      this.exitPuzzle();
    }

    // ===== DAILY SPIN =====
  }, {
    key: "startDailySpin",
    value: function startDailySpin() {
      var canSpinResult = this.dailySpinGame.canSpin();
      if (!canSpinResult.can) {
        var formatted = this.dailySpinGame.formatTimeRemaining(canSpinResult.nextFreeIn);
        _EventBus["default"].emit('notification:show', {
          message: "\u23F0 Next free spin in ".concat(formatted),
          type: 'info',
          duration: 3000
        });
        return;
      }
      _Logger["default"].info('PuzzleUI', 'Starting Daily Spin');
      var grid = this.container.querySelector('.puzzle-games-grid');
      if (grid) grid.style.display = 'none';
      var gameContainer = document.getElementById('puzzle-game-active');
      if (gameContainer) {
        gameContainer.style.display = 'block';
        this.renderDailySpinUI(gameContainer);
      }
    }
  }, {
    key: "renderDailySpinUI",
    value: function renderDailySpinUI(container) {
      var _document$getElementB5,
        _this9 = this,
        _document$getElementB6;
      container.innerHTML = "\n      <div class=\"daily-spin-container\">\n        <h2>\uD83C\uDFA1 Daily Spin</h2>\n        <div class=\"spin-info\">\n          <p>Spin the wheel for amazing rewards!</p>\n        </div>\n        \n        <div class=\"wheel-container\">\n          <div class=\"wheel-pointer\"></div>\n          <div class=\"wheel\" id=\"spin-wheel\">\n            ".concat(this.renderWheelSegments(), "\n            <div class=\"wheel-center\">\uD83C\uDFA1</div>\n          </div>\n        </div>\n        \n        <div class=\"spin-controls\">\n          <button class=\"btn btn-primary btn-large\" id=\"spin-btn\">\n            \uD83C\uDFA1 SPIN!\n          </button>\n          <button class=\"btn btn-secondary\" id=\"spin-exit\">Exit</button>\n        </div>\n      </div>\n    ");
      (_document$getElementB5 = document.getElementById('spin-btn')) === null || _document$getElementB5 === void 0 || _document$getElementB5.addEventListener('click', function () {
        _this9.executeSpin();
      });
      (_document$getElementB6 = document.getElementById('spin-exit')) === null || _document$getElementB6 === void 0 || _document$getElementB6.addEventListener('click', function () {
        _this9.exitPuzzle();
      });
    }
  }, {
    key: "renderWheelSegments",
    value: function renderWheelSegments() {
      var segments = this.dailySpinGame.segments;
      var html = '';
      segments.forEach(function (segment, index) {
        var angle = 360 / segments.length * index;
        html += "\n        <div class=\"wheel-segment\" style=\"\n          transform: rotate(".concat(angle, "deg);\n          background: ").concat(segment.color, ";\n        \">\n          <span class=\"wheel-segment-label\">").concat(segment.label, "</span>\n        </div>\n      ");
      });
      return html;
    }
  }, {
    key: "executeSpin",
    value: function executeSpin() {
      var _this0 = this;
      var spinBtn = document.getElementById('spin-btn');
      if (spinBtn) spinBtn.disabled = true;
      var spinResult = this.dailySpinGame.useSpin();
      if (!spinResult) {
        if (spinBtn) spinBtn.disabled = false;
        _EventBus["default"].emit('notification:show', {
          message: '❌ No spins available!',
          type: 'error',
          duration: 3000
        });
        return;
      }
      var wheel = document.getElementById('spin-wheel');
      if (wheel) {
        wheel.style.transition = "transform ".concat(spinResult.duration, "ms cubic-bezier(0.17, 0.67, 0.12, 0.99)");
        wheel.style.transform = "rotate(".concat(spinResult.rotation, "deg)");
        setTimeout(function () {
          _this0.dailySpinGame.grantReward(spinResult.segment);
          _this0.showSpinResult(spinResult.segment);
        }, spinResult.duration);
      }
    }
  }, {
    key: "showSpinResult",
    value: function showSpinResult(segment) {
      var _document$getElementB7,
        _this1 = this;
      var container = document.getElementById('puzzle-game-active');
      if (!container) return;
      container.innerHTML = "\n      <div class=\"puzzle-results\">\n        <h2>\uD83C\uDF89 You Won!</h2>\n        <div class=\"spin-result-icon\">".concat(segment.label, "</div>\n        <div class=\"puzzle-results-stats\">\n          <p>Congratulations! You received:</p>\n          <div class=\"reward-display\">\n            ").concat(this.formatSpinReward(segment.reward), "\n          </div>\n        </div>\n        <button class=\"btn btn-primary btn-large\" id=\"spin-result-close\">\n          Collect\n        </button>\n      </div>\n    ");
      (_document$getElementB7 = document.getElementById('spin-result-close')) === null || _document$getElementB7 === void 0 || _document$getElementB7.addEventListener('click', function () {
        _this1.exitPuzzle();
      });
    }
  }, {
    key: "formatSpinReward",
    value: function formatSpinReward(reward) {
      var icons = {
        gems: '💎',
        energy: '⚡',
        crystals: '💠',
        guardian: '🛡️'
      };
      var html = '';
      for (var _i = 0, _Object$entries = Object.entries(reward); _i < _Object$entries.length; _i++) {
        var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
          resource = _Object$entries$_i[0],
          amount = _Object$entries$_i[1];
        if (resource === 'guardian') {
          html += "<div class=\"reward-item\">\uD83D\uDEE1\uFE0F Guardian Summon!</div>";
        } else {
          html += "<div class=\"reward-item\">".concat(amount, " ").concat(icons[resource], "</div>");
        }
      }
      return html;
    }

    // ===== SHARED =====
  }, {
    key: "showPuzzleResults",
    value: function showPuzzleResults(result) {
      var _document$getElementB8,
        _this10 = this;
      var gameContainer = document.getElementById('puzzle-game-active');
      if (!gameContainer) return;
      gameContainer.innerHTML = "\n      <div class=\"puzzle-results\">\n        <h2>\uD83C\uDF89 Game Complete!</h2>\n        <div class=\"puzzle-results-stats\">\n          <div class=\"result-stat\">\n            <span class=\"label\">Score:</span>\n            <span class=\"value\">".concat(result.score, "</span>\n          </div>\n          <div class=\"result-stat\">\n            <span class=\"label\">Moves Used:</span>\n            <span class=\"value\">").concat(result.movesUsed, " / ").concat(result.maxMoves, "</span>\n          </div>\n          <div class=\"result-stat\">\n            <span class=\"label\">Best Combo:</span>\n            <span class=\"value\">").concat(result.bestCombo, "x</span>\n          </div>\n        </div>\n        <button class=\"btn btn-primary btn-large\" id=\"puzzle-results-close\">\n          Continue\n        </button>\n      </div>\n    ");
      (_document$getElementB8 = document.getElementById('puzzle-results-close')) === null || _document$getElementB8 === void 0 || _document$getElementB8.addEventListener('click', function () {
        _this10.exitPuzzle();
      });
    }
  }, {
    key: "exitPuzzle",
    value: function exitPuzzle() {
      var gameContainer = document.getElementById('puzzle-game-active');
      if (gameContainer) {
        gameContainer.style.display = 'none';
        gameContainer.innerHTML = '';
      }
      var grid = this.container.querySelector('.puzzle-games-grid');
      if (grid) grid.style.display = 'grid';
      if (this.match3Game) {
        this.match3Game.destroy();
        this.match3Game = null;
      }
      this.render();
    }
  }, {
    key: "exitBossPuzzle",
    value: function exitBossPuzzle() {
      _EventBus["default"].emit('modal:hide', {
        modalId: 'boss-battle-modal'
      });
      if (this.match3Game) {
        this.match3Game.destroy();
        this.match3Game = null;
      }
    }

    /**
     * Cleanup on destroy
     */
  }, {
    key: "destroy",
    value: function destroy() {
      if (this.countdownInterval) {
        clearInterval(this.countdownInterval);
      }
    }
  }]);
}();
var _default = exports["default"] = PuzzleUI;

},{"../core/Game.js":3,"../core/StateManager.js":6,"../utils/EventBus.js":56,"../utils/Logger.js":58,"./games/DailySpinGame.js":53,"./games/Game2048.js":54,"./games/Match3Game.js":55}],44:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _QuestSystem = _interopRequireDefault(require("../systems/QuestSystem.js"));
var _StateManager = _interopRequireDefault(require("../core/StateManager.js"));
var _EventBus = _interopRequireDefault(require("../utils/EventBus.js"));
var _Formatters = _interopRequireDefault(require("../utils/Formatters.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /**
 * QuestsUI - Manages quests tab display
 */
var QuestsUI = /*#__PURE__*/function () {
  function QuestsUI(containerId) {
    _classCallCheck(this, QuestsUI);
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error("QuestsUI: Container ".concat(containerId, " not found"));
      return;
    }
    this.render();
    this.subscribe();
  }
  return _createClass(QuestsUI, [{
    key: "subscribe",
    value: function subscribe() {
      var _this = this;
      _EventBus["default"].on('quest:completed', function () {
        return _this.render();
      });
      _EventBus["default"].on('quest:claimed', function () {
        return _this.render();
      });
      _EventBus["default"].on('quests:generated', function () {
        return _this.render();
      });
      _EventBus["default"].on('state:UPDATE_QUEST_PROGRESS', function () {
        return _this.updateProgress();
      });
    }
  }, {
    key: "render",
    value: function render() {
      this.updateHeader();
      this.renderQuests();
    }
  }, {
    key: "updateHeader",
    value: function updateHeader() {
      var stats = _QuestSystem["default"].getStats();
      var completedEl = document.getElementById('quests-completed-today');
      var limitEl = document.getElementById('quests-daily-limit');
      if (completedEl) completedEl.textContent = stats.completedToday;
      if (limitEl) limitEl.textContent = stats.dailyLimit;
    }
  }, {
    key: "renderQuests",
    value: function renderQuests() {
      var _this2 = this;
      var quests = _QuestSystem["default"].getActiveQuests();
      if (quests.length === 0) {
        this.container.innerHTML = "\n        <div class=\"empty-state\">\n          <p style=\"font-size: 3rem; margin-bottom: 1rem;\">\uD83D\uDCDC</p>\n          <h3>No Active Quests</h3>\n          <p>Complete your current quests or wait for new ones to appear!</p>\n        </div>\n      ";
        return;
      }
      this.container.innerHTML = '';
      quests.forEach(function (quest) {
        var card = _this2.createQuestCard(quest);
        _this2.container.appendChild(card);
      });
    }
  }, {
    key: "createQuestCard",
    value: function createQuestCard(quest) {
      var card = document.createElement('div');
      card.className = 'quest-card';
      card.dataset.questId = quest.id;
      if (quest.completed) {
        card.classList.add('completed');
      }
      var progress = Math.min(quest.progress / quest.amount * 100, 100);
      card.innerHTML = "\n      <div class=\"quest-header\">\n        <span class=\"quest-emoji\">".concat(quest.emoji, "</span>\n        <div class=\"quest-info\">\n          <h4 class=\"quest-title\">").concat(quest.name, "</h4>\n          <p class=\"quest-description\">").concat(quest.description, "</p>\n        </div>\n      </div>\n      \n      <div class=\"quest-progress ").concat(quest.completed ? 'completed' : '', "\">\n        <div class=\"quest-progress-bar\">\n          <div class=\"quest-progress-fill\" style=\"width: ").concat(progress, "%\"></div>\n        </div>\n        <p class=\"quest-progress-text\">\n          ").concat(_Formatters["default"].formatNumber(quest.progress), " / ").concat(_Formatters["default"].formatNumber(quest.amount), "\n        </p>\n      </div>\n      \n      <div class=\"quest-rewards\">\n        ").concat(this.formatRewards(quest.rewards), "\n      </div>\n      \n      ").concat(quest.completed ? "\n        <button class=\"btn btn-success\" onclick=\"claimQuest('".concat(quest.id, "')\">\n          \u2705 Claim Rewards\n        </button>\n      ") : "\n        <button class=\"btn btn-secondary\" disabled>\n          In Progress...\n        </button>\n      ", "\n    ");
      return card;
    }
  }, {
    key: "updateProgress",
    value: function updateProgress() {
      var cards = this.container.querySelectorAll('.quest-card');
      cards.forEach(function (card) {
        var questId = card.dataset.questId;
        var quests = _QuestSystem["default"].getActiveQuests();
        var quest = quests.find(function (q) {
          return q.id === questId;
        });
        if (!quest) return;

        // Update progress bar
        var progressBar = card.querySelector('.quest-progress-fill');
        var progressText = card.querySelector('.quest-progress-text');
        if (progressBar) {
          var progress = Math.min(quest.progress / quest.amount * 100, 100);
          progressBar.style.width = "".concat(progress, "%");
        }
        if (progressText) {
          progressText.textContent = "".concat(_Formatters["default"].formatNumber(quest.progress), " / ").concat(_Formatters["default"].formatNumber(quest.amount));
        }

        // Update completed state
        if (quest.completed && !card.classList.contains('completed')) {
          card.classList.add('completed');

          // Update button
          var btn = card.querySelector('.btn');
          if (btn) {
            btn.className = 'btn btn-success';
            btn.disabled = false;
            btn.textContent = '✅ Claim Rewards';
            btn.onclick = function () {
              return claimQuest(quest.id);
            };
          }
        }
      });
    }
  }, {
    key: "formatRewards",
    value: function formatRewards(rewards) {
      var parts = [];
      for (var _i = 0, _Object$entries = Object.entries(rewards); _i < _Object$entries.length; _i++) {
        var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
          resource = _Object$entries$_i[0],
          amount = _Object$entries$_i[1];
        var icons = {
          energy: '⚡',
          mana: '✨',
          gems: '💎',
          crystals: '💠'
        };
        parts.push("\n        <span class=\"quest-reward\">\n          ".concat(_Formatters["default"].formatNumber(amount), " ").concat(icons[resource] || resource, "\n        </span>\n      "));
      }
      return parts.join('');
    }
  }]);
}(); // Global claim function
window.claimQuest = function (questId) {
  _QuestSystem["default"].claim(questId);
};
var _default = exports["default"] = QuestsUI;

},{"../core/StateManager.js":6,"../systems/QuestSystem.js":26,"../utils/EventBus.js":56,"../utils/Formatters.js":57}],45:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _ShopSystem = _interopRequireDefault(require("../systems/ShopSystem.js"));
var _EventBus = _interopRequireDefault(require("../utils/EventBus.js"));
var _Formatters = _interopRequireDefault(require("../utils/Formatters.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /**
 * ShopUI - Manages shop tab display
 */
var ShopUI = /*#__PURE__*/function () {
  function ShopUI(containerId) {
    _classCallCheck(this, ShopUI);
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error("ShopUI: Container ".concat(containerId, " not found"));
      return;
    }
    this.render();
    this.subscribe();
  }
  return _createClass(ShopUI, [{
    key: "subscribe",
    value: function subscribe() {
      var _this = this;
      _EventBus["default"].on('shop:purchase-completed', function () {
        return _this.render();
      });
      _EventBus["default"].on('shop:vip-activated', function () {
        return _this.render();
      });
      _EventBus["default"].on('daily-spin:purchased-spins', function () {
        return _this.render();
      });
    }
  }, {
    key: "render",
    value: function render() {
      this.container.innerHTML = "\n      ".concat(this.renderVIPSection(), "\n      ").concat(this.renderMiniGamesPackages(), "\n      ").concat(this.renderGemPackages(), "\n      ").concat(this.renderRewardedAds(), "\n    ");
    }
  }, {
    key: "renderVIPSection",
    value: function renderVIPSection() {
      var vip = _ShopSystem["default"].items.vip;
      var isActive = _ShopSystem["default"].isVIPActive();
      return "\n      <div class=\"shop-section vip-section\">\n        <h3>\uD83D\uDC51 VIP Membership</h3>\n        \n        ".concat(isActive ? "\n          <div class=\"vip-active\">\n            <p>\u2705 VIP Active</p>\n            <p>Expires: ".concat(new Date(_ShopSystem["default"].getStats().vipExpiry).toLocaleString(), "</p>\n          </div>\n        ") : "\n          <div class=\"vip-benefits\">\n            <p>".concat(vip.description, "</p>\n            <ul>\n              ").concat(vip.benefitsDisplay.map(function (benefit) {
        return "<li>\u2713 ".concat(benefit, "</li>");
      }).join(''), "\n            </ul>\n            <button class=\"btn btn-primary btn-large\" onclick=\"purchaseVIP()\">\n              Buy VIP - ").concat(vip.priceDisplay, "\n            </button>\n          </div>\n        "), "\n      </div>\n    ");
    }
  }, {
    key: "renderMiniGamesPackages",
    value: function renderMiniGamesPackages() {
      var packages = _ShopSystem["default"].items.miniGamesPackages;
      if (!packages) {
        console.warn('Mini-games packages not found in shop');
        return '';
      }
      var html = "\n      <div class=\"shop-section minigames-section\">\n        <h3>\uD83C\uDFA1 Daily Spin - Extra Spins</h3>\n        <p>Get more chances to win amazing rewards!</p>\n        <div class=\"shop-grid\">\n    ";
      for (var _i = 0, _Object$entries = Object.entries(packages); _i < _Object$entries.length; _i++) {
        var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
          id = _Object$entries$_i[0],
          pkg = _Object$entries$_i[1];
        html += "\n        <div class=\"shop-item minigame-item ".concat(pkg.popular ? 'popular' : '', " ").concat(pkg.special ? 'special' : '', "\">\n          ").concat(pkg.popular ? '<div class="popular-badge">BEST VALUE</div>' : '', "\n          ").concat(pkg.special ? '<div class="special-badge">⭐ SPECIAL</div>' : '', "\n          ").concat(pkg.bonusPercentage ? "<div class=\"bonus-badge\">+".concat(pkg.bonusPercentage, "% VALUE</div>") : '', "\n          \n          <div class=\"shop-item-icon\">").concat(pkg.emoji, "</div>\n          <h4>").concat(pkg.name, "</h4>\n          <p class=\"shop-item-description\">").concat(pkg.description, "</p>\n          \n          <div class=\"shop-item-content\">\n            ").concat(pkg.unlimited ? "\n              <div class=\"spin-amount unlimited\">\n                <span class=\"infinity\">\u221E</span>\n                <span>Unlimited Spins</span>\n                <small>for 24 hours</small>\n              </div>\n            " : "\n              <div class=\"spin-amount\">\n                <span class=\"spin-count\">".concat(pkg.spins, "</span>\n                <span>Extra Spins</span>\n              </div>\n            "), "\n            \n            ").concat(pkg.bonus ? "\n              <div class=\"bonus-items\">\n                ".concat(pkg.bonus.gems ? "<div>+".concat(_Formatters["default"].formatNumber(pkg.bonus.gems), " \uD83D\uDC8E</div>") : '', "\n                ").concat(pkg.bonus.energy ? "<div>+".concat(_Formatters["default"].formatNumber(pkg.bonus.energy), " \u26A1</div>") : '', "\n              </div>\n            ") : '', "\n          </div>\n          \n          <div class=\"shop-item-price\">").concat(pkg.priceDisplay, "</div>\n          <button class=\"btn btn-success\" onclick=\"purchaseSpinPackage('").concat(id, "')\">\n            Purchase\n          </button>\n        </div>\n      ");
      }
      html += '</div></div>';
      return html;
    }
  }, {
    key: "renderGemPackages",
    value: function renderGemPackages() {
      var packages = _ShopSystem["default"].items.gemPackages;
      var html = '<div class="shop-section"><h3>💎 Gem Packages</h3><div class="shop-grid">';
      for (var _i2 = 0, _Object$entries2 = Object.entries(packages); _i2 < _Object$entries2.length; _i2++) {
        var _Object$entries2$_i = _slicedToArray(_Object$entries2[_i2], 2),
          id = _Object$entries2$_i[0],
          pkg = _Object$entries2$_i[1];
        html += "\n        <div class=\"shop-item ".concat(pkg.popular ? 'popular' : '', "\">\n          ").concat(pkg.popular ? '<div class="popular-badge">POPULAR</div>' : '', "\n          ").concat(pkg.bonusPercentage ? "<div class=\"bonus-badge\">+".concat(pkg.bonusPercentage, "% BONUS</div>") : '', "\n          \n          <div class=\"shop-item-icon\">").concat(pkg.emoji, "</div>\n          <h4>").concat(pkg.name, "</h4>\n          <p class=\"shop-item-description\">").concat(pkg.description, "</p>\n          \n          <div class=\"shop-item-content\">\n            <div class=\"gem-amount\">").concat(pkg.gems, " \uD83D\uDC8E</div>\n            \n            ").concat(pkg.bonus ? "\n              <div class=\"bonus-items\">\n                ".concat(pkg.bonus.energy ? "<div>+".concat(_Formatters["default"].formatNumber(pkg.bonus.energy), " \u26A1</div>") : '', "\n                ").concat(pkg.bonus.mana ? "<div>+".concat(_Formatters["default"].formatNumber(pkg.bonus.mana), " \u2728</div>") : '', "\n                ").concat(pkg.bonus.crystals ? "<div>+".concat(pkg.bonus.crystals, " \uD83D\uDCA0</div>") : '', "\n                ").concat(pkg.bonus.guardian ? "<div>+".concat(pkg.bonus.guardian, " Guardian").concat(pkg.bonus.guardian > 1 ? 's' : '', "</div>") : '', "\n              </div>\n            ") : '', "\n          </div>\n          \n          <div class=\"shop-item-price\">").concat(pkg.priceDisplay, "</div>\n          <button class=\"btn btn-success\" onclick=\"purchasePackage('").concat(id, "')\">\n            Purchase\n          </button>\n        </div>\n      ");
      }
      html += '</div></div>';
      return html;
    }
  }, {
    key: "renderRewardedAds",
    value: function renderRewardedAds() {
      var ads = _ShopSystem["default"].items.rewardedAds;
      var stats = _ShopSystem["default"].getStats();
      var html = "\n      <div class=\"shop-section\">\n        <h3>\uD83D\uDCFA Rewarded Ads</h3>\n        <p>Watch ads to earn free rewards! (".concat(stats.adsWatchedToday, "/").concat(_ShopSystem["default"].maxAdsPerDay, " today)</p>\n        <div class=\"shop-grid\">\n    ");
      for (var _i3 = 0, _Object$entries3 = Object.entries(ads); _i3 < _Object$entries3.length; _i3++) {
        var _Object$entries3$_i = _slicedToArray(_Object$entries3[_i3], 2),
          id = _Object$entries3$_i[0],
          ad = _Object$entries3$_i[1];
        var canWatch = stats.adsRemaining > 0;
        var rewardText = '';
        if (ad.reward.energy) rewardText = "".concat(_Formatters["default"].formatNumber(ad.reward.energy), " \u26A1");
        if (ad.reward.gems) rewardText = "".concat(ad.reward.gems, " \uD83D\uDC8E");
        if (ad.reward.multiplier) rewardText = "".concat(ad.reward.multiplier, "x for ").concat(ad.reward.duration / 60000, " min");
        html += "\n        <div class=\"shop-item ad-item\">\n          <div class=\"shop-item-icon\">".concat(ad.emoji, "</div>\n          <h4>").concat(ad.name, "</h4>\n          <p>").concat(ad.description, "</p>\n          \n          <div class=\"ad-reward\">\n            Reward: ").concat(rewardText, "\n          </div>\n          \n          <button class=\"btn btn-primary\" \n                  onclick=\"watchAd('").concat(id, "')\" \n                  ").concat(!canWatch ? 'disabled' : '', ">\n            ").concat(canWatch ? '▶️ Watch Ad' : '✓ Watched', "\n          </button>\n        </div>\n      ");
      }
      html += '</div></div>';
      return html;
    }
  }]);
}(); // Global functions
window.purchaseVIP = function () {
  _ShopSystem["default"].purchaseVIP();
};
window.purchasePackage = function (packageId) {
  _ShopSystem["default"].purchasePackage(packageId);
};
window.purchaseSpinPackage = function (packageId) {
  _ShopSystem["default"].purchaseSpinPackage(packageId);
};
window.watchAd = function (adType) {
  _ShopSystem["default"].watchAd(adType);
};
var _default = exports["default"] = ShopUI;

},{"../systems/ShopSystem.js":28,"../utils/EventBus.js":56,"../utils/Formatters.js":57}],46:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _StatisticsSystem = _interopRequireDefault(require("../systems/StatisticsSystem.js"));
var _EventBus = _interopRequireDefault(require("../utils/EventBus.js"));
var _MiniGameStatsUI = _interopRequireDefault(require("./MiniGameStatsUI.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /**
 * StatisticsUI - Manages statistics tab display
 */
// ✅ ADĂUGAT
var StatisticsUI = /*#__PURE__*/function () {
  function StatisticsUI(containerId) {
    var _document$getElementB;
    _classCallCheck(this, StatisticsUI);
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error("StatisticsUI: Container ".concat(containerId, " not found"));
      return;
    }
    this.render();
    this.subscribe();

    // Bind export button
    (_document$getElementB = document.getElementById('export-stats-btn')) === null || _document$getElementB === void 0 || _document$getElementB.addEventListener('click', function () {
      _StatisticsSystem["default"].exportStats();
    });
  }
  return _createClass(StatisticsUI, [{
    key: "subscribe",
    value: function subscribe() {
      var _this = this;
      // Update stats periodically
      setInterval(function () {
        _this.render();
      }, 5000);
    }

    // ✅ MODIFICAT - render() cu mini-game stats
  }, {
    key: "render",
    value: function render() {
      var stats = _StatisticsSystem["default"].getAllStats();
      this.container.innerHTML = '';
      for (var _i = 0, _Object$entries = Object.entries(stats); _i < _Object$entries.length; _i++) {
        var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
          category = _Object$entries$_i[0],
          data = _Object$entries$_i[1];
        var section = this.createCategorySection(category, data);
        this.container.appendChild(section);
      }

      // Add milestones
      this.renderMilestones();

      // ✅ ADĂUGAT - Render mini-game statistics
      var miniGameContainer = document.createElement('div');
      miniGameContainer.id = 'mini-game-statistics';
      this.container.appendChild(miniGameContainer);
      _MiniGameStatsUI["default"].renderMiniGameStats(miniGameContainer);
    }
  }, {
    key: "createCategorySection",
    value: function createCategorySection(category, data) {
      var section = document.createElement('div');
      section.className = 'statistics-category';
      var categoryNames = {
        general: '📊 General',
        resources: '💎 Resources',
        structures: '🏗️ Structures',
        upgrades: '⬆️ Upgrades',
        guardians: '🐉 Guardians',
        quests: '📜 Quests',
        puzzles: '🧩 Puzzles',
        bosses: '⚔️ Bosses',
        achievements: '🏆 Achievements',
        shop: '💰 Shop'
      };
      section.innerHTML = "\n      <h3>".concat(categoryNames[category] || category, "</h3>\n      <div class=\"statistics-grid\">\n        ").concat(Object.entries(data).map(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
          key = _ref2[0],
          value = _ref2[1];
        return "\n          <div class=\"stat-card\">\n            <div class=\"stat-card-label\">".concat(key, "</div>\n            <div class=\"stat-card-value\">").concat(value, "</div>\n          </div>\n        ");
      }).join(''), "\n      </div>\n    ");
      return section;
    }
  }, {
    key: "renderMilestones",
    value: function renderMilestones() {
      var milestones = _StatisticsSystem["default"].getMilestones();
      if (milestones.length === 0) return;
      var section = document.createElement('div');
      section.className = 'statistics-category';
      section.innerHTML = "\n      <h3>\uD83C\uDF1F Milestones Reached</h3>\n      <div class=\"milestones-grid\">\n        ".concat(milestones.map(function (m) {
        return "\n          <div class=\"milestone-card\">\n            <span class=\"milestone-emoji\">".concat(m.emoji, "</span>\n            <span class=\"milestone-name\">").concat(m.name, "</span>\n          </div>\n        ");
      }).join(''), "\n      </div>\n    ");
      this.container.appendChild(section);
    }
  }]);
}();
var _default = exports["default"] = StatisticsUI;

},{"../systems/StatisticsSystem.js":29,"../utils/EventBus.js":56,"./MiniGameStatsUI.js":40}],47:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _StructureSystem = _interopRequireDefault(require("../systems/StructureSystem.js"));
var _StateManager = _interopRequireDefault(require("../core/StateManager.js"));
var _EventBus = _interopRequireDefault(require("../utils/EventBus.js"));
var _StructureCard = _interopRequireDefault(require("./components/StructureCard.js"));
var _Formatters = _interopRequireDefault(require("../utils/Formatters.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /**
 * StructuresUI - Manages the structures tab
 */
var StructuresUI = /*#__PURE__*/function () {
  function StructuresUI(containerId) {
    _classCallCheck(this, StructuresUI);
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error("StructuresUI: Container ".concat(containerId, " not found"));
      return;
    }
    this.cards = new Map();
    this.render();
    this.subscribe();
  }

  /**
   * Subscribe to events
   */
  return _createClass(StructuresUI, [{
    key: "subscribe",
    value: function subscribe() {
      var _this = this;
      // Re-render when realm changes
      _EventBus["default"].on('state:SWITCH_REALM', function () {
        _this.render();
      });

      // Update when structures unlocked
      _EventBus["default"].on('structure:purchased', function () {
        _this.checkNewUnlocks();
      });
    }

    /**
     * Render structures tab
     */
  }, {
    key: "render",
    value: function render() {
      // Clear existing
      this.container.innerHTML = '';
      this.cards.clear();

      // Get structures for current realm
      var state = _StateManager["default"].getState();
      var currentRealm = state.realms.current;
      var structures = _StructureSystem["default"].getStructuresForRealm(currentRealm);

      // Create header
      var header = document.createElement('div');
      header.className = 'structures-header';
      header.innerHTML = "\n      <h2>\uD83C\uDFD7\uFE0F Structures - ".concat(this.getRealmName(currentRealm), "</h2>\n      <p class=\"structures-subtitle\">Build and upgrade structures to increase production</p>\n    ");
      this.container.appendChild(header);

      // Create grid
      var grid = document.createElement('div');
      grid.className = 'structures-grid';
      grid.id = 'structures-grid';

      // Group by tier
      var tiers = {
        1: [],
        2: [],
        3: []
      };
      for (var _i = 0, _Object$entries = Object.entries(structures); _i < _Object$entries.length; _i++) {
        var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
          key = _Object$entries$_i[0],
          data = _Object$entries$_i[1];
        tiers[data.tier].push(key);
      }

      // Render by tier
      for (var _i2 = 0, _arr = [1, 2, 3]; _i2 < _arr.length; _i2++) {
        var tier = _arr[_i2];
        if (tiers[tier].length === 0) continue;
        var tierSection = document.createElement('div');
        tierSection.className = 'tier-section';
        tierSection.innerHTML = "<h3 class=\"tier-label\">Tier ".concat(tier, "</h3>");
        var tierGrid = document.createElement('div');
        tierGrid.className = 'tier-grid';
        var _iterator = _createForOfIteratorHelper(tiers[tier]),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var _key = _step.value;
            var card = new _StructureCard["default"](_key);
            this.cards.set(_key, card);
            tierGrid.appendChild(card.getElement());
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
        tierSection.appendChild(tierGrid);
        grid.appendChild(tierSection);
      }
      this.container.appendChild(grid);

      // Add summary
      this.renderSummary();
    }

    /**
     * Render production summary
     */
  }, {
    key: "renderSummary",
    value: function renderSummary() {
      var state = _StateManager["default"].getState();
      var summary = document.createElement('div');
      summary.className = 'structures-summary';
      summary.id = 'structures-summary';
      summary.innerHTML = "\n      <div class=\"summary-card\">\n        <h4>\u26A1 Energy Production</h4>\n        <p class=\"summary-value\">".concat(_Formatters["default"].formatNumber(state.production.energy), "/s</p>\n      </div>\n      \n      <div class=\"summary-card\">\n        <h4>\u2728 Mana Production</h4>\n        <p class=\"summary-value\">").concat(_Formatters["default"].formatNumber(state.production.mana), "/s</p>\n      </div>\n      \n      ").concat(state.realms.unlocked.includes('volcano') ? "\n        <div class=\"summary-card\">\n          <h4>\uD83C\uDF0B Volcanic Production</h4>\n          <p class=\"summary-value\">".concat(_Formatters["default"].formatNumber(state.production.volcanicEnergy), "/s</p>\n        </div>\n      ") : '', "\n      \n      <div class=\"summary-card\">\n        <h4>\uD83D\uDCCA Total Structures</h4>\n        <p class=\"summary-value\">").concat(_StructureSystem["default"].getStats().totalStructures, "</p>\n      </div>\n    ");
      this.container.appendChild(summary);
    }

    /**
     * Check for newly unlocked structures
     */
  }, {
    key: "checkNewUnlocks",
    value: function checkNewUnlocks() {
      // Re-render cards that might have unlocked
      var _iterator2 = _createForOfIteratorHelper(this.cards.entries()),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var _step2$value = _slicedToArray(_step2.value, 2),
            key = _step2$value[0],
            card = _step2$value[1];
          card.update();
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    }

    /**
     * Get realm display name
     */
  }, {
    key: "getRealmName",
    value: function getRealmName(realmId) {
      var names = {
        forest: 'Forest Realm',
        volcano: 'Volcanic Realm'
      };
      return names[realmId] || realmId;
    }

    /**
     * Destroy UI
     */
  }, {
    key: "destroy",
    value: function destroy() {
      var _iterator3 = _createForOfIteratorHelper(this.cards.values()),
        _step3;
      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var card = _step3.value;
          card.destroy();
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
      this.cards.clear();
    }
  }]);
}();
var _default = exports["default"] = StructuresUI;

},{"../core/StateManager.js":6,"../systems/StructureSystem.js":30,"../utils/EventBus.js":56,"../utils/Formatters.js":57,"./components/StructureCard.js":51}],48:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _EventBus = _interopRequireDefault(require("../utils/EventBus.js"));
var _Logger = _interopRequireDefault(require("../utils/Logger.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /**
 * TabManager - Handles tab switching
 */
var TabManager = /*#__PURE__*/function () {
  function TabManager() {
    _classCallCheck(this, TabManager);
    this.currentTab = 'structures';
    this.tabs = document.querySelectorAll('.tab-btn');
    this.panels = document.querySelectorAll('.tab-panel');
    this.init();
    _Logger["default"].info('TabManager', 'Initialized');
  }
  return _createClass(TabManager, [{
    key: "init",
    value: function init() {
      var _this = this;
      // Bind click events
      this.tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
          var tabName = tab.dataset.tab;
          _this.switchTab(tabName);
        });
      });

      // Listen for programmatic tab switches
      _EventBus["default"].on('tab:switch', function (data) {
        _this.switchTab(data.tabName);
      });
    }
  }, {
    key: "switchTab",
    value: function switchTab(tabName) {
      if (this.currentTab === tabName) return;

      // Update buttons
      this.tabs.forEach(function (tab) {
        if (tab.dataset.tab === tabName) {
          tab.classList.add('active');
        } else {
          tab.classList.remove('active');
        }
      });

      // Update panels
      this.panels.forEach(function (panel) {
        if (panel.id === "tab-".concat(tabName)) {
          panel.classList.add('active');
        } else {
          panel.classList.remove('active');
        }
      });
      this.currentTab = tabName;
      _Logger["default"].debug('TabManager', "Switched to tab: ".concat(tabName));
      _EventBus["default"].emit('tab:switched', {
        tabName: tabName
      });
    }
  }, {
    key: "getCurrentTab",
    value: function getCurrentTab() {
      return this.currentTab;
    }
  }, {
    key: "updateBadge",
    value: function updateBadge(tabName, count) {
      var tab = Array.from(this.tabs).find(function (t) {
        return t.dataset.tab === tabName;
      });
      if (!tab) return;
      var badge = tab.querySelector('.tab-badge');
      if (!badge) return;
      if (count > 0) {
        badge.textContent = count;
        badge.style.display = 'flex';
      } else {
        badge.style.display = 'none';
      }
    }
  }]);
}();
var _default = exports["default"] = TabManager;

},{"../utils/EventBus.js":56,"../utils/Logger.js":58}],49:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _UpgradeSystem = _interopRequireDefault(require("../systems/UpgradeSystem.js"));
var _UpgradeQueueSystem = _interopRequireDefault(require("../systems/UpgradeQueueSystem.js"));
var _StateManager = _interopRequireDefault(require("../core/StateManager.js"));
var _EventBus = _interopRequireDefault(require("../utils/EventBus.js"));
var _Formatters = _interopRequireDefault(require("../utils/Formatters.js"));
var _UpgradeQueueDisplay = _interopRequireDefault(require("./components/UpgradeQueueDisplay.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /**
 * UpgradesUI - Manages upgrades tab display
 */
var UpgradesUI = /*#__PURE__*/function () {
  function UpgradesUI(containerId) {
    _classCallCheck(this, UpgradesUI);
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error("UpgradesUI: Container ".concat(containerId, " not found"));
      return;
    }

    // Initialize queue display
    new _UpgradeQueueDisplay["default"]('upgrade-queue-display');
    this.render();
    this.subscribe();
  }
  return _createClass(UpgradesUI, [{
    key: "subscribe",
    value: function subscribe() {
      var _this = this;
      _EventBus["default"].on('upgrade:purchased', function () {
        return _this.update();
      });
      _EventBus["default"].on('upgrade:completed', function () {
        return _this.update();
      });
      _EventBus["default"].on('state:ADD_RESOURCE', function () {
        return _this.update();
      });
      _EventBus["default"].on('state:REMOVE_RESOURCE', function () {
        return _this.update();
      });
    }
  }, {
    key: "render",
    value: function render() {
      this.container.innerHTML = '';

      // Group by category
      var categories = {
        production: [],
        capacity: [],
        synergy: [],
        qol: [],
        unlock: [],
        special: []
      };
      var upgrades = _UpgradeSystem["default"].upgrades;
      for (var _i = 0, _Object$entries = Object.entries(upgrades); _i < _Object$entries.length; _i++) {
        var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
          key = _Object$entries$_i[0],
          upgrade = _Object$entries$_i[1];
        if (!categories[upgrade.category]) {
          categories[upgrade.category] = [];
        }
        categories[upgrade.category].push(key);
      }

      // Render each category
      for (var _i2 = 0, _Object$entries2 = Object.entries(categories); _i2 < _Object$entries2.length; _i2++) {
        var _Object$entries2$_i = _slicedToArray(_Object$entries2[_i2], 2),
          category = _Object$entries2$_i[0],
          upgradeKeys = _Object$entries2$_i[1];
        if (upgradeKeys.length === 0) continue;
        var section = document.createElement('div');
        section.className = 'upgrade-category';
        section.innerHTML = "\n        <h3 class=\"category-title\">".concat(this.getCategoryName(category), "</h3>\n        <div class=\"upgrades-grid\" data-category=\"").concat(category, "\"></div>\n      ");
        var grid = section.querySelector('.upgrades-grid');
        var _iterator = _createForOfIteratorHelper(upgradeKeys),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var _key = _step.value;
            var card = this.createUpgradeCard(_key);
            grid.appendChild(card);
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
        this.container.appendChild(section);
      }
    }
  }, {
    key: "createUpgradeCard",
    value: function createUpgradeCard(upgradeKey) {
      var upgrade = _UpgradeSystem["default"].getUpgrade(upgradeKey);
      var level = _UpgradeSystem["default"].getLevel(upgradeKey);
      var cost = _UpgradeSystem["default"].getCost(upgradeKey);
      var isUnlocked = _UpgradeSystem["default"].isUnlocked(upgradeKey);
      var isMaxed = _UpgradeSystem["default"].isMaxed(upgradeKey);
      var canAfford = _UpgradeSystem["default"].canAfford(upgradeKey);
      var effect = upgrade.getDescription(level);
      var upgradeTime = _UpgradeQueueSystem["default"].getUpgradeTimeFormatted(upgradeKey, level + 1);
      var card = document.createElement('div');
      card.className = 'upgrade-card';
      card.dataset.key = upgradeKey;
      if (!isUnlocked) card.classList.add('locked');
      if (isMaxed) card.classList.add('maxed');
      if (!canAfford && !isMaxed) card.classList.add('unaffordable');
      card.innerHTML = "\n      <div class=\"upgrade-header\">\n        <span class=\"upgrade-emoji\">".concat(upgrade.emoji, "</span>\n        <div class=\"upgrade-info\">\n          <h4 class=\"upgrade-name\">").concat(upgrade.name, "</h4>\n          <p class=\"upgrade-description\">").concat(upgrade.description, "</p>\n        </div>\n        <span class=\"upgrade-level\">Lv. ").concat(level, "/").concat(upgrade.maxLevel, "</span>\n      </div>\n      \n      ").concat(level > 0 ? "\n        <div class=\"upgrade-effect\">\n          ".concat(effect, "\n        </div>\n      ") : '', "\n      \n      ").concat(!isMaxed ? "\n        <div class=\"upgrade-cost\">\n          <span>Cost:</span>\n          <span>".concat(_Formatters["default"].formatNumber(cost), " ").concat(this.getResourceIcon(upgrade.costResource), "</span>\n        </div>\n        \n        <div class=\"upgrade-time\">\n          \u23F1\uFE0F ").concat(upgradeTime, "\n        </div>\n        \n        <button class=\"btn btn-primary\" \n                data-upgrade=\"").concat(upgradeKey, "\" \n                ").concat(!isUnlocked || !canAfford ? 'disabled' : '', ">\n          ").concat(level === 0 ? 'Unlock' : 'Upgrade', "\n        </button>\n      ") : "\n        <div class=\"upgrade-maxed\">\n          \u2705 MAXED OUT\n        </div>\n      ", "\n    ");

      // Bind buy button
      var buyBtn = card.querySelector('.btn');
      if (buyBtn) {
        buyBtn.addEventListener('click', function () {
          _UpgradeSystem["default"].buy(upgradeKey);
        });
      }
      return card;
    }
  }, {
    key: "update",
    value: function update() {
      var _this2 = this;
      var cards = this.container.querySelectorAll('.upgrade-card');
      cards.forEach(function (card) {
        var upgradeKey = card.dataset.key;
        var upgrade = _UpgradeSystem["default"].getUpgrade(upgradeKey);
        var level = _UpgradeSystem["default"].getLevel(upgradeKey);
        var isUnlocked = _UpgradeSystem["default"].isUnlocked(upgradeKey);
        var canAfford = _UpgradeSystem["default"].canAfford(upgradeKey);
        var isMaxed = _UpgradeSystem["default"].isMaxed(upgradeKey);
        var cost = _UpgradeSystem["default"].getCost(upgradeKey);

        // Update classes
        if (!isUnlocked) {
          card.classList.add('locked');
        } else {
          card.classList.remove('locked');
        }
        if (!canAfford && !isMaxed) {
          card.classList.add('unaffordable');
        } else {
          card.classList.remove('unaffordable');
        }
        if (isMaxed) {
          card.classList.add('maxed');
        } else {
          card.classList.remove('maxed');
        }

        // Update button state
        var btn = card.querySelector('.btn');
        if (btn) {
          btn.disabled = !isUnlocked || !canAfford;
          if (!isMaxed) {
            btn.textContent = level === 0 ? 'Unlock' : 'Upgrade';
          }
        }

        // Update cost display (dacă nu e maxed)
        var costSpan = card.querySelector('.upgrade-cost span:last-child');
        if (costSpan && !isMaxed) {
          costSpan.textContent = "".concat(_Formatters["default"].formatNumber(cost), " ").concat(_this2.getResourceIcon(upgrade.costResource));
        }

        // UPDATE LEVEL TEXT
        var levelSpan = card.querySelector('.upgrade-level');
        if (levelSpan) {
          levelSpan.textContent = "Lv. ".concat(level, "/").concat(upgrade.maxLevel);
        }

        // (Opțional) UPDATE EFFECT TEXT
        var effectContainer = card.querySelector('.upgrade-effect');
        if (effectContainer) {
          if (level > 0) {
            effectContainer.textContent = upgrade.getDescription(level);
          } else {
            // dacă vrei să dispară complet la level 0:
            // effectContainer.textContent = '';
            // sau un preview la level 1:
            // effectContainer.textContent = upgrade.getDescription(1);
          }
        } else if (level > 0) {
          // Dacă vrei să apară abia după ce trece de 0
          var newEffectDiv = document.createElement('div');
          newEffectDiv.className = 'upgrade-effect';
          newEffectDiv.textContent = upgrade.getDescription(level);
          var header = card.querySelector('.upgrade-header');
          if (header) {
            header.insertAdjacentElement('afterend', newEffectDiv);
          }
        }
      });
    }
  }, {
    key: "getCategoryName",
    value: function getCategoryName(category) {
      var names = {
        production: '⚡ Production Multipliers',
        capacity: '📦 Resource Capacity',
        synergy: '🔗 Structure Synergies',
        qol: '✨ Quality of Life',
        unlock: '🔓 Unlocks',
        special: '🌟 Special Upgrades'
      };
      return names[category] || category;
    }
  }, {
    key: "getResourceIcon",
    value: function getResourceIcon(resource) {
      var icons = {
        energy: '⚡',
        mana: '✨',
        gems: '💎',
        crystals: '💠'
      };
      return icons[resource] || '';
    }
  }]);
}();
var _default = exports["default"] = UpgradesUI;

},{"../core/StateManager.js":6,"../systems/UpgradeQueueSystem.js":32,"../systems/UpgradeSystem.js":33,"../utils/EventBus.js":56,"../utils/Formatters.js":57,"./components/UpgradeQueueDisplay.js":52}],50:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _StateManager = _interopRequireDefault(require("../../core/StateManager.js"));
var _EventBus = _interopRequireDefault(require("../../utils/EventBus.js"));
var _Formatters = _interopRequireDefault(require("../../utils/Formatters.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /**
 * ResourceDisplay - Shows resources at top of screen
 */
var ResourceDisplay = /*#__PURE__*/function () {
  function ResourceDisplay(containerId) {
    _classCallCheck(this, ResourceDisplay);
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error("ResourceDisplay: Container ".concat(containerId, " not found"));
      return;
    }
    this.render();
    this.subscribe();
  }

  /**
   * Subscribe to state changes
   */
  return _createClass(ResourceDisplay, [{
    key: "subscribe",
    value: function subscribe() {
      var _this = this;
      // Update on any resource change
      _EventBus["default"].on('state:ADD_RESOURCE', function () {
        return _this.update();
      });
      _EventBus["default"].on('state:REMOVE_RESOURCE', function () {
        return _this.update();
      });
      _EventBus["default"].on('state:SET_RESOURCE', function () {
        return _this.update();
      });
      _EventBus["default"].on('production:updated', function () {
        return _this.update();
      });
    }

    /**
     * Initial render
     */
  }, {
    key: "render",
    value: function render() {
      this.container.innerHTML = "\n      <div class=\"resource-display\">\n        <div class=\"resource-item\" id=\"energy-display\">\n          <span class=\"resource-icon\">\u26A1</span>\n          <div class=\"resource-info\">\n            <div class=\"resource-amount\" id=\"energy-amount\">0</div>\n            <div class=\"resource-rate\" id=\"energy-rate\">0/s</div>\n          </div>\n          <div class=\"resource-bar\">\n            <div class=\"resource-bar-fill\" id=\"energy-bar\"></div>\n          </div>\n        </div>\n        \n        <div class=\"resource-item\" id=\"mana-display\">\n          <span class=\"resource-icon\">\u2728</span>\n          <div class=\"resource-info\">\n            <div class=\"resource-amount\" id=\"mana-amount\">0</div>\n            <div class=\"resource-rate\" id=\"mana-rate\">0/s</div>\n          </div>\n          <div class=\"resource-bar\">\n            <div class=\"resource-bar-fill\" id=\"mana-bar\"></div>\n          </div>\n        </div>\n        \n        <div class=\"resource-item\" id=\"gems-display\">\n          <span class=\"resource-icon\">\uD83D\uDC8E</span>\n          <div class=\"resource-info\">\n            <div class=\"resource-amount\" id=\"gems-amount\">0</div>\n          </div>\n        </div>\n        \n        <div class=\"resource-item\" id=\"crystals-display\" style=\"display: none;\">\n          <span class=\"resource-icon\">\uD83D\uDCA0</span>\n          <div class=\"resource-info\">\n            <div class=\"resource-amount\" id=\"crystals-amount\">0</div>\n          </div>\n        </div>\n        \n        <div class=\"resource-item\" id=\"volcanic-display\" style=\"display: none;\">\n          <span class=\"resource-icon\">\uD83C\uDF0B</span>\n          <div class=\"resource-info\">\n            <div class=\"resource-amount\" id=\"volcanic-amount\">0</div>\n            <div class=\"resource-rate\" id=\"volcanic-rate\">0/s</div>\n          </div>\n          <div class=\"resource-bar\">\n            <div class=\"resource-bar-fill\" id=\"volcanic-bar\"></div>\n          </div>\n        </div>\n      </div>\n    ";
      this.update();
    }

    /**
     * Update display
     */
  }, {
    key: "update",
    value: function update() {
      var state = _StateManager["default"].getState();

      // Energy
      this.updateResource('energy', state.resources.energy, state.caps.energy, state.production.energy);

      // Mana
      this.updateResource('mana', state.resources.mana, state.caps.mana, state.production.mana);

      // Gems (no cap or rate)
      var gemsAmount = document.getElementById('gems-amount');
      if (gemsAmount) {
        gemsAmount.textContent = _Formatters["default"].formatNumber(state.resources.gems, 0);
      }

      // Crystals (show if player has any or has ascended)
      if (state.resources.crystals > 0 || state.ascension.level > 0) {
        var crystalsDisplay = document.getElementById('crystals-display');
        var crystalsAmount = document.getElementById('crystals-amount');
        if (crystalsDisplay) crystalsDisplay.style.display = 'flex';
        if (crystalsAmount) {
          crystalsAmount.textContent = _Formatters["default"].formatNumber(state.resources.crystals, 0);
        }
      }

      // Volcanic (show if volcano unlocked)
      if (state.realms.unlocked.includes('volcano')) {
        var volcanicDisplay = document.getElementById('volcanic-display');
        if (volcanicDisplay) volcanicDisplay.style.display = 'flex';
        this.updateResource('volcanic', state.resources.volcanicEnergy, state.caps.volcanicEnergy, state.production.volcanicEnergy);
      }
    }

    /**
     * Update individual resource
     */
  }, {
    key: "updateResource",
    value: function updateResource(resourceKey, amount, cap, rate) {
      // Amount
      var amountEl = document.getElementById("".concat(resourceKey, "-amount"));
      if (amountEl) {
        var currentText = _Formatters["default"].formatNumber(amount); // ex: 1.27K
        var capInt = Math.floor(cap || 0);
        var capText = capInt.toLocaleString(); // ex: 17,496

        amountEl.textContent = "".concat(currentText, " / ").concat(capText);
      }

      // Rate
      var rateEl = document.getElementById("".concat(resourceKey, "-rate"));
      if (rateEl && rate !== undefined) {
        rateEl.textContent = "".concat(_Formatters["default"].formatNumber(rate), "/s");
        if (rate > 0) {
          rateEl.style.color = '#10b981'; // Green
        } else {
          rateEl.style.color = '#6b7280'; // Gray
        }
      }

      // Progress bar (rămâne la fel)
      var barEl = document.getElementById("".concat(resourceKey, "-bar"));
      if (barEl && cap) {
        var percentage = Math.min(amount / cap * 100, 100);
        barEl.style.width = "".concat(percentage, "%");
        if (percentage >= 100) {
          barEl.style.backgroundColor = '#ef4444'; // Red (full)
        } else if (percentage >= 80) {
          barEl.style.backgroundColor = '#f59e0b'; // Orange
        } else {
          barEl.style.backgroundColor = '#10b981'; // Green
        }
      }
    }
  }]);
}();
var _default = exports["default"] = ResourceDisplay;

},{"../../core/StateManager.js":6,"../../utils/EventBus.js":56,"../../utils/Formatters.js":57}],51:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _StructureSystem = _interopRequireDefault(require("../../systems/StructureSystem.js"));
var _StateManager = _interopRequireDefault(require("../../core/StateManager.js"));
var _EventBus = _interopRequireDefault(require("../../utils/EventBus.js"));
var _Formatters = _interopRequireDefault(require("../../utils/Formatters.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /**
 * StructureCard - Individual structure display and purchase
 */
var StructureCard = /*#__PURE__*/function () {
  function StructureCard(structureKey) {
    _classCallCheck(this, StructureCard);
    this.structureKey = structureKey;
    this.structure = _StructureSystem["default"].getStructure(structureKey);
    this.element = null;
    this.render();
    this.subscribe();
  }

  /**
   * Subscribe to events
   */
  return _createClass(StructureCard, [{
    key: "subscribe",
    value: function subscribe() {
      var _this = this;
      _EventBus["default"].on('structure:purchased', function (data) {
        if (data.structureKey === _this.structureKey) {
          _this.update();
        }
      });
      _EventBus["default"].on('state:ADD_RESOURCE', function () {
        return _this.update();
      });
      _EventBus["default"].on('state:REMOVE_RESOURCE', function () {
        return _this.update();
      });
      _EventBus["default"].on('production:updated', function () {
        return _this.update();
      });
    }

    /**
     * Render card
     */
  }, {
    key: "render",
    value: function render() {
      var level = _StructureSystem["default"].getLevel(this.structureKey);
      var cost = _StructureSystem["default"].getCost(this.structureKey);
      var production = _StructureSystem["default"].getProduction(this.structureKey);
      var isUnlocked = _StructureSystem["default"].isUnlocked(this.structureKey);
      var canAfford = _StructureSystem["default"].canAfford(this.structureKey);
      this.element = document.createElement('div');
      this.element.className = 'structure-card';
      this.element.dataset.key = this.structureKey;
      this.element.dataset.tier = this.structure.tier;
      if (!isUnlocked) {
        this.element.classList.add('locked');
      }
      if (!canAfford) {
        this.element.classList.add('unaffordable');
      }
      this.element.innerHTML = "\n      <div class=\"structure-header\">\n        <span class=\"structure-emoji\">".concat(this.structure.emoji, "</span>\n        <div class=\"structure-title\">\n          <h3 class=\"structure-name\">").concat(this.structure.name, "</h3>\n          <p class=\"structure-description\">").concat(this.structure.description, "</p>\n        </div>\n        <span class=\"structure-level\">Lv. ").concat(level, "</span>\n      </div>\n      \n      <div class=\"structure-stats\">\n        <div class=\"stat\">\n          <span class=\"stat-label\">Production:</span>\n          <span class=\"stat-value\" id=\"production-").concat(this.structureKey, "\">\n            ").concat(_Formatters["default"].formatNumber(production), "/s\n          </span>\n        </div>\n        \n        <div class=\"stat\">\n          <span class=\"stat-label\">Cost:</span>\n          <span class=\"stat-value\" id=\"cost-").concat(this.structureKey, "\">\n            ").concat(_Formatters["default"].formatNumber(cost), " ").concat(this.getCostIcon(), "\n          </span>\n        </div>\n      </div>\n      \n      <div class=\"structure-actions\">\n        <button class=\"btn btn-primary buy-btn\" id=\"buy-").concat(this.structureKey, "\" ").concat(!isUnlocked || !canAfford ? 'disabled' : '', ">\n          ").concat(level === 0 ? 'Build' : 'Upgrade', "\n        </button>\n        \n        <button class=\"btn btn-secondary buy-max-btn\" id=\"buy-max-").concat(this.structureKey, "\" ").concat(!isUnlocked || level === 0 ? 'disabled' : '', ">\n          Buy Max\n        </button>\n      </div>\n      \n      ").concat(!isUnlocked ? this.renderUnlockCondition() : '', "\n    ");

      // Add event listeners
      this.attachListeners();
      return this.element;
    }

    /**
     * Attach event listeners
     */
  }, {
    key: "attachListeners",
    value: function attachListeners() {
      var _this2 = this;
      // Buy button
      var buyBtn = this.element.querySelector("#buy-".concat(this.structureKey));
      if (buyBtn) {
        buyBtn.addEventListener('click', function () {
          _StructureSystem["default"].buy(_this2.structureKey);
        });
      }

      // Buy max button
      var buyMaxBtn = this.element.querySelector("#buy-max-".concat(this.structureKey));
      if (buyMaxBtn) {
        buyMaxBtn.addEventListener('click', function () {
          _StructureSystem["default"].buyMax(_this2.structureKey);
        });
      }

      // Tooltip on hover
      this.element.addEventListener('mouseenter', function () {
        _this2.showTooltip();
      });
      this.element.addEventListener('mouseleave', function () {
        _this2.hideTooltip();
      });
    }

    /**
     * Update card
     */
  }, {
    key: "update",
    value: function update() {
      var level = _StructureSystem["default"].getLevel(this.structureKey);
      var cost = _StructureSystem["default"].getCost(this.structureKey);
      var production = _StructureSystem["default"].getProduction(this.structureKey);
      var isUnlocked = _StructureSystem["default"].isUnlocked(this.structureKey);
      var canAfford = _StructureSystem["default"].canAfford(this.structureKey);

      // Update level
      var levelEl = this.element.querySelector('.structure-level');
      if (levelEl) {
        levelEl.textContent = "Lv. ".concat(level);
      }

      // Update production
      var productionEl = document.getElementById("production-".concat(this.structureKey));
      if (productionEl) {
        productionEl.textContent = "".concat(_Formatters["default"].formatNumber(production), "/s");
      }

      // Update cost
      var costEl = document.getElementById("cost-".concat(this.structureKey));
      if (costEl) {
        costEl.textContent = "".concat(_Formatters["default"].formatNumber(cost), " ").concat(this.getCostIcon());
      }

      // Update button states
      var buyBtn = this.element.querySelector("#buy-".concat(this.structureKey));
      if (buyBtn) {
        buyBtn.disabled = !isUnlocked || !canAfford;
        buyBtn.textContent = level === 0 ? 'Build' : 'Upgrade';
      }
      var buyMaxBtn = this.element.querySelector("#buy-max-".concat(this.structureKey));
      if (buyMaxBtn) {
        buyMaxBtn.disabled = !isUnlocked || level === 0;
      }

      // Update classes
      if (isUnlocked) {
        this.element.classList.remove('locked');
      } else {
        this.element.classList.add('locked');
      }
      if (canAfford) {
        this.element.classList.remove('unaffordable');
      } else {
        this.element.classList.add('unaffordable');
      }
    }

    /**
     * Get cost resource icon
     */
  }, {
    key: "getCostIcon",
    value: function getCostIcon() {
      var icons = {
        energy: '⚡',
        mana: '✨',
        gems: '💎',
        crystals: '💠',
        volcanicEnergy: '🌋'
      };
      return icons[this.structure.costResource] || '';
    }

    /**
     * Render unlock condition
     */
  }, {
    key: "renderUnlockCondition",
    value: function renderUnlockCondition() {
      var condition = this.structure.unlockCondition;
      if (!condition) return '';
      var requirements = [];
      if (condition.resources) {
        for (var _i = 0, _Object$entries = Object.entries(condition.resources); _i < _Object$entries.length; _i++) {
          var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
            resource = _Object$entries$_i[0],
            amount = _Object$entries$_i[1];
          requirements.push("".concat(_Formatters["default"].formatNumber(amount), " ").concat(resource));
        }
      }
      if (condition.structures) {
        for (var _i2 = 0, _Object$entries2 = Object.entries(condition.structures); _i2 < _Object$entries2.length; _i2++) {
          var _Object$entries2$_i = _slicedToArray(_Object$entries2[_i2], 2),
            structure = _Object$entries2$_i[0],
            level = _Object$entries2$_i[1];
          var structureData = _StructureSystem["default"].getStructure(structure);
          requirements.push("".concat(structureData.name, " Lv.").concat(level));
        }
      }
      if (condition.upgrades) {
        for (var _i3 = 0, _Object$entries3 = Object.entries(condition.upgrades); _i3 < _Object$entries3.length; _i3++) {
          var _Object$entries3$_i = _slicedToArray(_Object$entries3[_i3], 2),
            upgrade = _Object$entries3$_i[0],
            _level = _Object$entries3$_i[1];
          requirements.push("Unlock: ".concat(upgrade));
        }
      }
      if (condition.ascension) {
        requirements.push("Ascension Lv.".concat(condition.ascension.level));
      }
      return "\n      <div class=\"unlock-condition\">\n        <span class=\"unlock-label\">\uD83D\uDD12 Requires:</span>\n        <ul class=\"unlock-requirements\">\n          ".concat(requirements.map(function (req) {
        return "<li>".concat(req, "</li>");
      }).join(''), "\n        </ul>\n      </div>\n    ");
    }

    /**
     * Show tooltip
     */
  }, {
    key: "showTooltip",
    value: function showTooltip() {
      // TODO: Implement tooltip with detailed info
      // - Total production contribution
      // - Multipliers breakdown
      // - Next level stats
    }

    /**
     * Hide tooltip
     */
  }, {
    key: "hideTooltip",
    value: function hideTooltip() {
      // TODO: Hide tooltip
    }

    /**
     * Get DOM element
     */
  }, {
    key: "getElement",
    value: function getElement() {
      return this.element;
    }

    /**
     * Destroy card
     */
  }, {
    key: "destroy",
    value: function destroy() {
      // Remove event listeners
      var buyBtn = this.element.querySelector("#buy-".concat(this.structureKey));
      if (buyBtn) {
        buyBtn.replaceWith(buyBtn.cloneNode(true));
      }
      var buyMaxBtn = this.element.querySelector("#buy-max-".concat(this.structureKey));
      if (buyMaxBtn) {
        buyMaxBtn.replaceWith(buyMaxBtn.cloneNode(true));
      }

      // Remove element
      if (this.element && this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
      }
    }
  }]);
}();
var _default = exports["default"] = StructureCard;

},{"../../core/StateManager.js":6,"../../systems/StructureSystem.js":30,"../../utils/EventBus.js":56,"../../utils/Formatters.js":57}],52:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _UpgradeQueueSystem = _interopRequireDefault(require("../../systems/UpgradeQueueSystem.js"));
var _UpgradeSystem = _interopRequireDefault(require("../../systems/UpgradeSystem.js"));
var _EventBus = _interopRequireDefault(require("../../utils/EventBus.js"));
var _Formatters = _interopRequireDefault(require("../../utils/Formatters.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /**
 * UpgradeQueueDisplay - Shows upgrade queue status
 */
var UpgradeQueueDisplay = /*#__PURE__*/function () {
  function UpgradeQueueDisplay(containerId) {
    _classCallCheck(this, UpgradeQueueDisplay);
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error("UpgradeQueueDisplay: Container ".concat(containerId, " not found"));
      return;
    }
    this.render();
    this.subscribe();
    this.startUpdateLoop();
  }
  return _createClass(UpgradeQueueDisplay, [{
    key: "subscribe",
    value: function subscribe() {
      var _this = this;
      _EventBus["default"].on('upgrade:started', function () {
        return _this.update();
      });
      _EventBus["default"].on('upgrade:completed', function () {
        return _this.update();
      });
      _EventBus["default"].on('upgrade:queued', function () {
        return _this.update();
      });
      _EventBus["default"].on('upgrade:cancelled', function () {
        return _this.update();
      });
      _EventBus["default"].on('upgrade:sped-up', function () {
        return _this.update();
      });
    }
  }, {
    key: "render",
    value: function render() {
      this.container.innerHTML = "\n      <div class=\"upgrade-queue-panel\">\n        <div class=\"queue-header\">\n          <h3>\uD83D\uDD2C Upgrade Queue</h3>\n          <button class=\"btn btn-small\" id=\"upgrade-queue-slots-btn\">\n            Upgrade Slots (1000 \uD83D\uDC8E)\n          </button>\n        </div>\n        \n        <div id=\"active-upgrade-section\">\n          <!-- Active upgrade will appear here -->\n        </div>\n        \n        <div id=\"queued-upgrades-section\">\n          <!-- Queued upgrades will appear here -->\n        </div>\n      </div>\n    ";
      this.update();

      // Attach listeners
      var slotsBtn = document.getElementById('upgrade-queue-slots-btn');
      if (slotsBtn) {
        slotsBtn.addEventListener('click', function () {
          _UpgradeQueueSystem["default"].upgradeQueueSlots();
        });
      }
    }
  }, {
    key: "update",
    value: function update() {
      var queueInfo = _UpgradeQueueSystem["default"].getQueueInfo();
      this.updateActiveUpgrade(queueInfo.active);
      this.updateQueue(queueInfo.queue, queueInfo.slots);
    }
  }, {
    key: "updateActiveUpgrade",
    value: function updateActiveUpgrade(activeUpgrade) {
      var section = document.getElementById('active-upgrade-section');
      if (!section) return;
      if (!activeUpgrade) {
        section.innerHTML = "\n        <div class=\"no-active-upgrade\">\n          <p>No upgrade in progress</p>\n          <p class=\"text-secondary\">Purchase an upgrade to start</p>\n        </div>\n      ";
        return;
      }
      var upgrade = _UpgradeSystem["default"].getUpgrade(activeUpgrade.upgradeKey);
      var remainingTime = _UpgradeQueueSystem["default"].getRemainingTime();
      var progress = _UpgradeQueueSystem["default"].getProgress();
      section.innerHTML = "\n      <div class=\"active-upgrade-card\">\n        <div class=\"upgrade-header\">\n          <span class=\"upgrade-emoji\">".concat(upgrade.emoji, "</span>\n          <div class=\"upgrade-info\">\n            <h4>").concat(upgrade.name, "</h4>\n            <p>Level ").concat(activeUpgrade.targetLevel - 1, " \u2192 ").concat(activeUpgrade.targetLevel, "</p>\n          </div>\n        </div>\n        \n        <div class=\"progress-section\">\n          <div class=\"progress-bar\">\n            <div class=\"progress-fill\" id=\"queue-progress-fill\" style=\"width: ").concat(progress, "%\"></div>\n          </div>\n          <p class=\"time-remaining\" id=\"queue-time-remaining\">\n            ").concat(_Formatters["default"].formatTime(remainingTime), " remaining\n          </p>\n        </div>\n        \n        <div class=\"upgrade-actions\">\n          <button class=\"btn btn-warning btn-speed-up\" id=\"speed-up-btn\">\n            \u26A1 Speed Up (").concat(this.calculateSpeedUpCost(remainingTime), " \uD83D\uDC8E)\n          </button>\n        </div>\n      </div>\n    ");

      // Attach speed up listener
      var speedUpBtn = document.getElementById('speed-up-btn');
      if (speedUpBtn) {
        speedUpBtn.addEventListener('click', function () {
          if (confirm('Speed up this upgrade with gems?')) {
            _UpgradeQueueSystem["default"].speedUp();
          }
        });
      }
    }
  }, {
    key: "updateQueue",
    value: function updateQueue(queue, slots) {
      var section = document.getElementById('queued-upgrades-section');
      if (!section) return;
      if (queue.length === 0) {
        section.innerHTML = "\n        <div class=\"queue-empty\">\n          <p>Queue: 0/".concat(slots, "</p>\n        </div>\n      ");
        return;
      }
      var html = "<div class=\"queue-header\"><h4>Queued (".concat(queue.length, "/").concat(slots, ")</h4></div>");
      queue.forEach(function (item, index) {
        var upgrade = _UpgradeSystem["default"].getUpgrade(item.upgradeKey);
        html += "\n        <div class=\"queued-upgrade-item\">\n          <span class=\"queue-position\">#".concat(index + 1, "</span>\n          <span class=\"upgrade-emoji\">").concat(upgrade.emoji, "</span>\n          <div class=\"upgrade-info\">\n            <p class=\"upgrade-name\">").concat(upgrade.name, "</p>\n            <p class=\"upgrade-duration\">\n              ").concat(_Formatters["default"].formatTime(item.duration), "\n            </p>\n          </div>\n          <button class=\"btn btn-small btn-danger\" onclick=\"cancelQueuedUpgrade('").concat(item.upgradeKey, "')\">\n            \u274C\n          </button>\n        </div>\n      ");
      });
      section.innerHTML = html;
    }
  }, {
    key: "calculateSpeedUpCost",
    value: function calculateSpeedUpCost(remainingTime) {
      var remainingMinutes = Math.ceil(remainingTime / 60000);
      return Math.max(10, remainingMinutes);
    }
  }, {
    key: "startUpdateLoop",
    value: function startUpdateLoop() {
      setInterval(function () {
        var timeEl = document.getElementById('queue-time-remaining');
        if (timeEl) {
          var remainingTime = _UpgradeQueueSystem["default"].getRemainingTime();
          timeEl.textContent = "".concat(_Formatters["default"].formatTime(remainingTime), " remaining");
        }
        var progressFill = document.getElementById('queue-progress-fill');
        if (progressFill) {
          var progress = _UpgradeQueueSystem["default"].getProgress();
          progressFill.style.width = "".concat(progress, "%");
        }
      }, 1000);
    }
  }]);
}(); // Global function for cancel button
window.cancelQueuedUpgrade = function (upgradeKey) {
  if (confirm('Cancel this upgrade? Resources will be refunded.')) {
    _UpgradeQueueSystem["default"].cancelQueuedUpgrade(upgradeKey);
  }
};
var _default = exports["default"] = UpgradeQueueDisplay;

},{"../../systems/UpgradeQueueSystem.js":32,"../../systems/UpgradeSystem.js":33,"../../utils/EventBus.js":56,"../../utils/Formatters.js":57}],53:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _StateManager = _interopRequireDefault(require("../../core/StateManager.js"));
var _EventBus = _interopRequireDefault(require("../../utils/EventBus.js"));
var _Logger = _interopRequireDefault(require("../../utils/Logger.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /**
 * DailySpinGame - Wheel of Fortune mini-game
 * Resets daily at midnight (00:00)
 */
var DailySpinGame = /*#__PURE__*/function () {
  function DailySpinGame() {
    _classCallCheck(this, DailySpinGame);
    this.spinning = false;
    this.rotation = 0;

    // Wheel segments (8 segments)
    this.segments = [{
      id: 1,
      reward: {
        gems: 50
      },
      label: '50💎',
      color: '#8B5CF6',
      weight: 20
    }, {
      id: 2,
      reward: {
        energy: 5000
      },
      label: '5K⚡',
      color: '#3B82F6',
      weight: 25
    }, {
      id: 3,
      reward: {
        gems: 100
      },
      label: '100💎',
      color: '#8B5CF6',
      weight: 15
    }, {
      id: 4,
      reward: {
        crystals: 5
      },
      label: '5💠',
      color: '#10B981',
      weight: 10
    }, {
      id: 5,
      reward: {
        gems: 200
      },
      label: '200💎',
      color: '#8B5CF6',
      weight: 10
    }, {
      id: 6,
      reward: {
        energy: 10000
      },
      label: '10K⚡',
      color: '#3B82F6',
      weight: 12
    }, {
      id: 7,
      reward: {
        guardian: 1
      },
      label: '🛡️Guardian',
      color: '#F59E0B',
      weight: 5
    }, {
      id: 8,
      reward: {
        gems: 500
      },
      label: '500💎',
      color: '#8B5CF6',
      weight: 3
    }];
    this.segmentAngle = 360 / this.segments.length;
  }

  /**
   * Get time until midnight reset
   */
  return _createClass(DailySpinGame, [{
    key: "getTimeUntilMidnight",
    value: function getTimeUntilMidnight() {
      var now = new Date();
      var midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0); // Next midnight

      return midnight.getTime() - now.getTime();
    }

    /**
     * Get today's date string for comparison
     */
  }, {
    key: "getTodayDateString",
    value: function getTodayDateString() {
      return new Date().toDateString(); // "Sat Nov 09 2025"
    }

    /**
     * Check if player can spin (FREE - resets at midnight)
     */
  }, {
    key: "canSpin",
    value: function canSpin() {
      var _state$miniGames, _state$miniGames2;
      var state = _StateManager["default"].getState();
      var lastSpinDate = ((_state$miniGames = state.miniGames) === null || _state$miniGames === void 0 || (_state$miniGames = _state$miniGames.dailySpin) === null || _state$miniGames === void 0 ? void 0 : _state$miniGames.lastSpinDate) || '';
      var today = this.getTodayDateString();

      // Check if already spun today (FREE spin)
      var hasSpunToday = lastSpinDate === today;

      // Check purchased spins
      var purchasedSpins = ((_state$miniGames2 = state.miniGames) === null || _state$miniGames2 === void 0 || (_state$miniGames2 = _state$miniGames2.dailySpin) === null || _state$miniGames2 === void 0 ? void 0 : _state$miniGames2.purchasedSpins) || 0;
      if (!hasSpunToday) {
        // Free spin available
        return {
          can: true,
          type: 'free',
          nextFreeIn: 0,
          purchasedSpins: purchasedSpins
        };
      }
      if (purchasedSpins > 0) {
        // Has purchased spins
        return {
          can: true,
          type: 'purchased',
          spinsRemaining: purchasedSpins,
          nextFreeIn: this.getTimeUntilMidnight()
        };
      }

      // No spins available
      return {
        can: false,
        type: 'none',
        nextFreeIn: this.getTimeUntilMidnight(),
        reason: 'already_spun_today'
      };
    }

    /**
     * Use a spin (free or purchased)
     */
  }, {
    key: "useSpin",
    value: function useSpin() {
      var canSpinResult = this.canSpin();
      if (!canSpinResult.can) {
        return null;
      }
      if (canSpinResult.type === 'free') {
        // Mark today as spun
        _StateManager["default"].dispatch({
          type: 'UPDATE_MINI_GAME',
          payload: {
            game: 'dailySpin',
            data: {
              lastSpinDate: this.getTodayDateString(),
              lastSpin: Date.now()
            }
          }
        });
        _Logger["default"].info('DailySpinGame', 'Used FREE spin');
      } else if (canSpinResult.type === 'purchased') {
        // Consume purchased spin
        _StateManager["default"].dispatch({
          type: 'DECREMENT_PURCHASED_SPINS',
          payload: {
            game: 'dailySpin'
          }
        });
        _Logger["default"].info('DailySpinGame', 'Used PURCHASED spin', {
          remaining: canSpinResult.spinsRemaining - 1
        });
      }
      return this.spin();
    }

    /**
     * Spin the wheel (internal logic)
     */
  }, {
    key: "spin",
    value: function spin() {
      // Select random reward based on weights
      var selectedSegment = this.selectRandomSegment();

      // Calculate final rotation
      var spins = 5; // Full rotations
      var targetAngle = this.segmentAngle * (selectedSegment.id - 1) + this.segmentAngle / 2;
      var finalRotation = 360 * spins + targetAngle + Math.random() * 20 - 10;
      _Logger["default"].info('DailySpinGame', 'Spinning wheel', {
        segment: selectedSegment.id,
        reward: selectedSegment.reward,
        rotation: finalRotation
      });
      return {
        segment: selectedSegment,
        rotation: finalRotation,
        duration: 4000 // 4 seconds animation
      };
    }

    /**
     * Select random segment based on weights
     */
  }, {
    key: "selectRandomSegment",
    value: function selectRandomSegment() {
      var totalWeight = this.segments.reduce(function (sum, seg) {
        return sum + seg.weight;
      }, 0);
      var random = Math.random() * totalWeight;
      var _iterator = _createForOfIteratorHelper(this.segments),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var segment = _step.value;
          random -= segment.weight;
          if (random <= 0) {
            return segment;
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      return this.segments[0]; // Fallback
    }

    /**
     * Grant reward after spin completes
     */
  }, {
    key: "grantReward",
    value: function grantReward(segment) {
      var reward = segment.reward;

      // Add rewards
      for (var _i = 0, _Object$entries = Object.entries(reward); _i < _Object$entries.length; _i++) {
        var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
          resource = _Object$entries$_i[0],
          amount = _Object$entries$_i[1];
        if (resource === 'guardian') {
          // Trigger guardian summon
          _EventBus["default"].emit('guardian:summon', {
            amount: amount,
            source: 'daily-spin',
            guaranteed: true
          });
        } else {
          _StateManager["default"].dispatch({
            type: 'ADD_RESOURCE',
            payload: {
              resource: resource,
              amount: amount
            }
          });
        }
      }

      // Track stats
      _StateManager["default"].dispatch({
        type: 'INCREMENT_MINI_GAME_STAT',
        payload: {
          game: 'dailySpin',
          stat: 'totalSpins'
        }
      });
      _Logger["default"].info('DailySpinGame', 'Reward granted', reward);

      // Track rewards for achievements
      var gemAmount = reward.gems || 0;
      var hasGuardian = reward.guardian ? true : false;
      _StateManager["default"].dispatch({
        type: 'TRACK_SPIN_REWARD',
        payload: {
          gemAmount: gemAmount,
          hasGuardian: hasGuardian
        }
      });
      _EventBus["default"].emit('daily-spin:reward-granted', {
        reward: reward,
        segment: segment
      });

      // Show notification
      this.showRewardNotification(reward);
      return reward;
    }

    /**
     * Show reward notification
     */
  }, {
    key: "showRewardNotification",
    value: function showRewardNotification(reward) {
      var parts = [];
      for (var _i2 = 0, _Object$entries2 = Object.entries(reward); _i2 < _Object$entries2.length; _i2++) {
        var _Object$entries2$_i = _slicedToArray(_Object$entries2[_i2], 2),
          resource = _Object$entries2$_i[0],
          amount = _Object$entries2$_i[1];
        var icons = {
          gems: '💎',
          energy: '⚡',
          crystals: '💠',
          guardian: '🛡️'
        };
        if (resource === 'guardian') {
          parts.push('Guardian!');
        } else {
          parts.push("".concat(amount, " ").concat(icons[resource]));
        }
      }
      _EventBus["default"].emit('notification:show', {
        type: 'reward',
        title: '🎡 Spin Reward!',
        message: parts.join(', '),
        duration: 5000
      });
    }

    /**
     * Add purchased spins (called from shop)
     */
  }, {
    key: "addPurchasedSpins",
    value: function addPurchasedSpins(count) {
      _StateManager["default"].dispatch({
        type: 'ADD_PURCHASED_SPINS',
        payload: {
          game: 'dailySpin',
          count: count
        }
      });
      _Logger["default"].info('DailySpinGame', "Added ".concat(count, " purchased spins"));
      _EventBus["default"].emit('notification:show', {
        type: 'purchase',
        title: 'Spins Added!',
        message: "+".concat(count, " Extra Spins! \uD83C\uDFA1"),
        duration: 3000
      });
    }

    /**
     * Get stats
     */
  }, {
    key: "getStats",
    value: function getStats() {
      var _state$miniGames3;
      var state = _StateManager["default"].getState();
      var spinData = ((_state$miniGames3 = state.miniGames) === null || _state$miniGames3 === void 0 ? void 0 : _state$miniGames3.dailySpin) || {};
      return {
        lastSpinDate: spinData.lastSpinDate || '',
        lastSpin: spinData.lastSpin || 0,
        totalSpins: spinData.totalSpins || 0,
        purchasedSpins: spinData.purchasedSpins || 0,
        canSpin: this.canSpin()
      };
    }

    /**
     * Format time remaining (for display)
     */
  }, {
    key: "formatTimeRemaining",
    value: function formatTimeRemaining(milliseconds) {
      var hours = Math.floor(milliseconds / 3600000);
      var minutes = Math.floor(milliseconds % 3600000 / 60000);
      var seconds = Math.floor(milliseconds % 60000 / 1000);
      if (hours > 0) {
        return "".concat(hours, "h ").concat(minutes, "m");
      } else if (minutes > 0) {
        return "".concat(minutes, "m ").concat(seconds, "s");
      } else {
        return "".concat(seconds, "s");
      }
    }
  }]);
}();
var _default = exports["default"] = new DailySpinGame();

},{"../../core/StateManager.js":6,"../../utils/EventBus.js":56,"../../utils/Logger.js":58}],54:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _StateManager = _interopRequireDefault(require("../../core/StateManager.js"));
var _EventBus = _interopRequireDefault(require("../../utils/EventBus.js"));
var _Logger = _interopRequireDefault(require("../../utils/Logger.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /**
 * Game2048 - Classic 2048 puzzle game
 */
var Game2048 = /*#__PURE__*/function () {
  function Game2048() {
    _classCallCheck(this, Game2048);
    this.size = 4;
    this.grid = [];
    this.score = 0;
    this.gameOver = false;
    this.won = false;
    this.milestones = {
      512: {
        gems: 50,
        crystals: 2,
        energy: 5000
      },
      1024: {
        gems: 100,
        crystals: 5,
        energy: 10000
      },
      2048: {
        gems: 250,
        crystals: 10,
        energy: 25000,
        guardian: 1
      }
    };
    this.claimedMilestones = new Set();
  }
  return _createClass(Game2048, [{
    key: "newGame",
    value: function newGame() {
      var _this = this;
      this.grid = Array(this.size).fill(null).map(function () {
        return Array(_this.size).fill(0);
      });
      this.score = 0;
      this.gameOver = false;
      this.won = false;
      this.claimedMilestones.clear();
      this.addRandomTile();
      this.addRandomTile();
      _Logger["default"].info('Game2048', 'New game started');
      return this.getGameState();
    }
  }, {
    key: "addRandomTile",
    value: function addRandomTile() {
      var emptyCells = [];
      for (var _row = 0; _row < this.size; _row++) {
        for (var _col = 0; _col < this.size; _col++) {
          if (this.grid[_row][_col] === 0) {
            emptyCells.push({
              row: _row,
              col: _col
            });
          }
        }
      }
      if (emptyCells.length === 0) return false;
      var _emptyCells$Math$floo = emptyCells[Math.floor(Math.random() * emptyCells.length)],
        row = _emptyCells$Math$floo.row,
        col = _emptyCells$Math$floo.col;
      this.grid[row][col] = Math.random() < 0.9 ? 2 : 4;
      return true;
    }
  }, {
    key: "move",
    value: function move(direction) {
      if (this.gameOver) return null;
      var oldGrid = JSON.stringify(this.grid);
      var oldScore = this.score;
      switch (direction) {
        case 'left':
          this.moveLeft();
          break;
        case 'right':
          this.moveRight();
          break;
        case 'up':
          this.moveUp();
          break;
        case 'down':
          this.moveDown();
          break;
      }
      if (oldGrid !== JSON.stringify(this.grid)) {
        this.addRandomTile();
        if (!this.canMove()) {
          this.gameOver = true;
          this.handleGameOver();
        }
        if (this.score > oldScore) {
          this.checkMilestones();
        }
        return this.getGameState();
      }
      return null;
    }
  }, {
    key: "moveLeft",
    value: function moveLeft() {
      for (var row = 0; row < this.size; row++) {
        var tiles = this.grid[row].filter(function (val) {
          return val !== 0;
        });
        for (var i = 0; i < tiles.length - 1; i++) {
          if (tiles[i] === tiles[i + 1]) {
            tiles[i] *= 2;
            tiles[i + 1] = 0;
            this.score += tiles[i];
            if (tiles[i] === 2048 && !this.won) {
              this.won = true;
            }
          }
        }
        tiles = tiles.filter(function (val) {
          return val !== 0;
        });
        while (tiles.length < this.size) {
          tiles.push(0);
        }
        this.grid[row] = tiles;
      }
    }
  }, {
    key: "moveRight",
    value: function moveRight() {
      this.grid = this.grid.map(function (row) {
        return row.reverse();
      });
      this.moveLeft();
      this.grid = this.grid.map(function (row) {
        return row.reverse();
      });
    }
  }, {
    key: "moveUp",
    value: function moveUp() {
      this.transpose();
      this.moveLeft();
      this.transpose();
    }
  }, {
    key: "moveDown",
    value: function moveDown() {
      this.transpose();
      this.moveRight();
      this.transpose();
    }
  }, {
    key: "transpose",
    value: function transpose() {
      var _this2 = this;
      var newGrid = Array(this.size).fill(null).map(function () {
        return Array(_this2.size).fill(0);
      });
      for (var row = 0; row < this.size; row++) {
        for (var col = 0; col < this.size; col++) {
          newGrid[col][row] = this.grid[row][col];
        }
      }
      this.grid = newGrid;
    }
  }, {
    key: "canMove",
    value: function canMove() {
      for (var row = 0; row < this.size; row++) {
        for (var col = 0; col < this.size; col++) {
          if (this.grid[row][col] === 0) return true;
          if (col < this.size - 1 && this.grid[row][col] === this.grid[row][col + 1]) return true;
          if (row < this.size - 1 && this.grid[row][col] === this.grid[row + 1][col]) return true;
        }
      }
      return false;
    }
  }, {
    key: "checkMilestones",
    value: function checkMilestones() {
      var maxTile = Math.max.apply(Math, _toConsumableArray(this.grid.flat()));
      for (var _i = 0, _Object$entries = Object.entries(this.milestones); _i < _Object$entries.length; _i++) {
        var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
          milestone = _Object$entries$_i[0],
          reward = _Object$entries$_i[1];
        var milestoneValue = parseInt(milestone);
        if (maxTile >= milestoneValue && !this.claimedMilestones.has(milestone)) {
          this.claimedMilestones.add(milestone);
          this.grantReward(milestoneValue, reward);
        }
      }
    }
  }, {
    key: "grantReward",
    value: function grantReward(milestone, reward) {
      for (var _i2 = 0, _Object$entries2 = Object.entries(reward); _i2 < _Object$entries2.length; _i2++) {
        var _Object$entries2$_i = _slicedToArray(_Object$entries2[_i2], 2),
          resource = _Object$entries2$_i[0],
          amount = _Object$entries2$_i[1];
        if (resource === 'guardian') {
          _EventBus["default"].emit('guardian:summon', {
            amount: amount,
            source: '2048-game',
            guaranteed: true
          });
        } else {
          _StateManager["default"].dispatch({
            type: 'ADD_RESOURCE',
            payload: {
              resource: resource,
              amount: amount
            }
          });
        }
      }
      _Logger["default"].info('Game2048', "Milestone ".concat(milestone, " reached!"), reward);
      _EventBus["default"].emit('notification:show', {
        type: 'reward',
        title: "\uD83C\uDF89 ".concat(milestone, " Milestone!"),
        message: this.formatReward(reward),
        duration: 5000
      });
    }
  }, {
    key: "handleGameOver",
    value: function handleGameOver() {
      var _state$miniGames;
      var state = _StateManager["default"].getState();
      var highScore = ((_state$miniGames = state.miniGames) === null || _state$miniGames === void 0 || (_state$miniGames = _state$miniGames.game2048) === null || _state$miniGames === void 0 ? void 0 : _state$miniGames.highScore) || 0;
      if (this.score > highScore) {
        _StateManager["default"].dispatch({
          type: 'UPDATE_MINI_GAME',
          payload: {
            game: 'game2048',
            data: {
              highScore: this.score
            }
          }
        });
        _Logger["default"].info('Game2048', 'New high score!', {
          score: this.score
        });
      }
      _StateManager["default"].dispatch({
        type: 'INCREMENT_MINI_GAME_STAT',
        payload: {
          game: 'game2048',
          stat: 'gamesPlayed'
        }
      });
      _EventBus["default"].emit('game-2048:game-over', {
        score: this.score,
        isHighScore: this.score > highScore
      });

      // Track stats for achievements
      var maxTile = Math.max.apply(Math, _toConsumableArray(this.grid.flat()));
      _StateManager["default"].dispatch({
        type: 'TRACK_2048_TILE',
        payload: {
          tile: maxTile,
          score: this.score
        }
      });
    }
  }, {
    key: "formatReward",
    value: function formatReward(reward) {
      var parts = [];
      for (var _i3 = 0, _Object$entries3 = Object.entries(reward); _i3 < _Object$entries3.length; _i3++) {
        var _Object$entries3$_i = _slicedToArray(_Object$entries3[_i3], 2),
          resource = _Object$entries3$_i[0],
          amount = _Object$entries3$_i[1];
        var icons = {
          gems: '💎',
          energy: '⚡',
          crystals: '💠',
          guardian: '🛡️'
        };
        if (resource === 'guardian') {
          parts.push('Guardian!');
        } else {
          parts.push("".concat(amount, " ").concat(icons[resource]));
        }
      }
      return parts.join(', ');
    }
  }, {
    key: "getGameState",
    value: function getGameState() {
      return {
        grid: this.grid,
        score: this.score,
        gameOver: this.gameOver,
        won: this.won,
        canMove: this.canMove()
      };
    }
  }, {
    key: "getStats",
    value: function getStats() {
      var _state$miniGames2;
      var state = _StateManager["default"].getState();
      var gameData = ((_state$miniGames2 = state.miniGames) === null || _state$miniGames2 === void 0 ? void 0 : _state$miniGames2.game2048) || {};
      return {
        highScore: gameData.highScore || 0,
        gamesPlayed: gameData.gamesPlayed || 0
      };
    }
  }]);
}();
var _default = exports["default"] = new Game2048();

},{"../../core/StateManager.js":6,"../../utils/EventBus.js":56,"../../utils/Logger.js":58}],55:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _EventBus = _interopRequireDefault(require("../../utils/EventBus.js"));
var _Logger = _interopRequireDefault(require("../../utils/Logger.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /**
 * Match3Game - Simple and working Match-3 implementation
 */
var Match3Game = /*#__PURE__*/function () {
  function Match3Game(container) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    _classCallCheck(this, Match3Game);
    this.container = container;
    this.options = {
      mode: options.mode || 'practice',
      bossKey: options.bossKey || null,
      bossName: options.bossName || null,
      maxMoves: options.maxMoves || 20,
      targetScore: options.targetScore || 500,
      difficulty: options.difficulty || 'normal',
      onComplete: options.onComplete || function () {},
      onExit: options.onExit || function () {}
    };
    this.specialGems = {
      bomb: '💣',
      // Match 4 in line
      lightning: '⚡',
      // Match 5 in line
      star: '🌟',
      // L or T shape
      rainbow: '🌈' // Match 5+ or special combos
    };

    // Drag & Drop state
    this.dragState = {
      isDragging: false,
      startCell: null,
      currentCell: null
    };
    this.specialGemTypes = new Map(); // Track special gem positions

    this.gridSize = 8;
    this.gems = ['🔴', '🔵', '🟢', '🟡', '🟣', '🟠'];
    this.grid = [];
    this.selectedCell = null;
    this.score = 0;
    this.moves = 0;
    this.combo = 0;
    this.bestCombo = 0;
    this.isProcessing = false;
    this.gameOverTriggered = false; // ✅ ADD THIS

    this.init();
  }
  return _createClass(Match3Game, [{
    key: "init",
    value: function () {
      var _init = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {
        return _regenerator().w(function (_context) {
          while (1) switch (_context.n) {
            case 0:
              console.log('🎮 Match3Game: Starting init...');
              this.generateGrid();
              _context.n = 1;
              return this.render();
            case 1:
              console.log('✅ Match3Game: Init complete!');
            case 2:
              return _context.a(2);
          }
        }, _callee, this);
      }));
      function init() {
        return _init.apply(this, arguments);
      }
      return init;
    }()
  }, {
    key: "generateGrid",
    value: function generateGrid() {
      this.grid = [];
      for (var row = 0; row < this.gridSize; row++) {
        this.grid[row] = [];
        for (var col = 0; col < this.gridSize; col++) {
          var gem = void 0;
          do {
            gem = this.gems[Math.floor(Math.random() * this.gems.length)];
          } while (this.wouldCreateMatch(row, col, gem));
          this.grid[row][col] = gem;
        }
      }
    }
  }, {
    key: "wouldCreateMatch",
    value: function wouldCreateMatch(row, col, gem) {
      if (col >= 2 && this.grid[row][col - 1] === gem && this.grid[row][col - 2] === gem) return true;
      if (row >= 2 && this.grid[row - 1][col] === gem && this.grid[row - 2][col] === gem) return true;
      return false;
    }
  }, {
    key: "render",
    value: function () {
      var _render = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2() {
        var _this = this;
        return _regenerator().w(function (_context2) {
          while (1) switch (_context2.n) {
            case 0:
              return _context2.a(2, new Promise(function (resolve) {
                var isBoss = _this.options.mode === 'boss';
                _this.container.innerHTML = "\n        <div class=\"match3-game\">\n          <div class=\"match3-header\">\n            <h3>".concat(isBoss ? "\u2694\uFE0F ".concat(_this.options.bossName) : '🧩 Match-3 Puzzle', "</h3>\n          </div>\n          \n          <div class=\"match3-stats\">\n            <div class=\"match3-stat\">\n              <span class=\"label\">Score</span>\n              <span class=\"value\" id=\"m3-score\">").concat(_this.score, "</span>\n            </div>\n            <div class=\"match3-stat\">\n              <span class=\"label\">Moves</span>\n              <span class=\"value\" id=\"m3-moves\">").concat(_this.moves, "/").concat(_this.options.maxMoves, "</span>\n            </div>\n            <div class=\"match3-stat\">\n              <span class=\"label\">Combo</span>\n              <span class=\"value\" id=\"m3-combo\">").concat(_this.combo, "x</span>\n            </div>\n          </div>\n          \n          <div class=\"match3-grid\" id=\"m3-grid\"></div>\n          \n          <div class=\"match3-controls\">\n            <button class=\"btn btn-secondary\" id=\"m3-exit\">Exit</button>\n          </div>\n        </div>\n      ");
                requestAnimationFrame(function () {
                  _this.renderGrid();
                  _this.bindEvents();
                  resolve();
                });
              }));
          }
        }, _callee2);
      }));
      function render() {
        return _render.apply(this, arguments);
      }
      return render;
    }()
    /**
    * Check for special gem patterns
    */
  }, {
    key: "checkForSpecialPattern",
    value: function checkForSpecialPattern(matches) {
      if (matches.length >= 5) {
        return {
          type: 'rainbow',
          emoji: this.specialGems.rainbow
        };
      }
      if (matches.length === 4) {
        // Check if it's a line (all same row or column)
        var sameRow = matches.every(function (m) {
          return m.row === matches[0].row;
        });
        var sameCol = matches.every(function (m) {
          return m.col === matches[0].col;
        });
        if (sameRow || sameCol) {
          return {
            type: 'lightning',
            emoji: this.specialGems.lightning
          };
        }
      }

      // Check for L or T shape (3 horizontal + 3 vertical intersecting)
      var rowCount = new Map();
      var colCount = new Map();
      matches.forEach(function (m) {
        rowCount.set(m.row, (rowCount.get(m.row) || 0) + 1);
        colCount.set(m.col, (colCount.get(m.col) || 0) + 1);
      });
      var hasIntersection = Array.from(rowCount.values()).some(function (c) {
        return c >= 3;
      }) && Array.from(colCount.values()).some(function (c) {
        return c >= 3;
      });
      if (hasIntersection && matches.length >= 5) {
        return {
          type: 'star',
          emoji: this.specialGems.star
        };
      }
      if (matches.length >= 4) {
        return {
          type: 'bomb',
          emoji: this.specialGems.bomb
        };
      }
      return null;
    }

    /**
     * Create special gem at position
     */
  }, {
    key: "createSpecialGem",
    value: function createSpecialGem(row, col, type) {
      var key = "".concat(row, ",").concat(col);
      this.specialGemTypes.set(key, type);
      this.grid[row][col] = this.specialGems[type];
      console.log("\u2728 Created ".concat(type, " special gem at ").concat(row, ",").concat(col));
      stateManager.dispatch({
        type: 'TRACK_SPECIAL_GEM_CREATED',
        payload: {
          game: 'match3',
          gemType: type
        }
      });
    }

    /**
     * Activate special gem effects
     */
  }, {
    key: "activateSpecialGem",
    value: function activateSpecialGem(row, col) {
      var key = "".concat(row, ",").concat(col);
      var type = this.specialGemTypes.get(key);
      if (!type) return [];
      console.log("\uD83D\uDCA5 Activating ".concat(type, " at ").concat(row, ",").concat(col));
      var toRemove = [];
      switch (type) {
        case 'bomb':
          // 3x3 explosion
          for (var r = Math.max(0, row - 1); r <= Math.min(this.gridSize - 1, row + 1); r++) {
            for (var c = Math.max(0, col - 1); c <= Math.min(this.gridSize - 1, col + 1); c++) {
              toRemove.push({
                row: r,
                col: c
              });
            }
          }
          break;
        case 'lightning':
          // Clear entire row and column
          for (var _c = 0; _c < this.gridSize; _c++) {
            toRemove.push({
              row: row,
              col: _c
            });
          }
          for (var _r = 0; _r < this.gridSize; _r++) {
            toRemove.push({
              row: _r,
              col: col
            });
          }
          break;
        case 'star':
          // 5x5 explosion
          for (var _r2 = Math.max(0, row - 2); _r2 <= Math.min(this.gridSize - 1, row + 2); _r2++) {
            for (var _c2 = Math.max(0, col - 2); _c2 <= Math.min(this.gridSize - 1, col + 2); _c2++) {
              toRemove.push({
                row: _r2,
                col: _c2
              });
            }
          }
          break;
        case 'rainbow':
          // Clear all gems of one random color
          var targetGem = this.gems[Math.floor(Math.random() * this.gems.length)];
          for (var _r3 = 0; _r3 < this.gridSize; _r3++) {
            for (var _c3 = 0; _c3 < this.gridSize; _c3++) {
              if (this.grid[_r3][_c3] === targetGem) {
                toRemove.push({
                  row: _r3,
                  col: _c3
                });
              }
            }
          }
          break;
      }
      this.specialGemTypes["delete"](key);

      // Show floating text
      this.showFloatingText(row, col, "".concat(type.toUpperCase(), "!"), 'special');
      return toRemove;
    }

    /**
     * Show floating text animation
     */
  }, {
    key: "showFloatingText",
    value: function showFloatingText(row, col, text) {
      var type = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'score';
      var gridEl = document.getElementById('m3-grid');
      if (!gridEl) return;
      var cell = gridEl.querySelector("[data-row=\"".concat(row, "\"][data-col=\"").concat(col, "\"]"));
      if (!cell) return;
      var rect = cell.getBoundingClientRect();
      var floatingText = document.createElement('div');
      floatingText.className = "floating-text ".concat(type);
      floatingText.textContent = text;
      floatingText.style.left = rect.left + rect.width / 2 + 'px';
      floatingText.style.top = rect.top + 'px';
      document.body.appendChild(floatingText);
      setTimeout(function () {
        return floatingText.remove();
      }, 1500);
    }
  }, {
    key: "renderGrid",
    value: function renderGrid() {
      var _this2 = this;
      var gridEl = document.getElementById('m3-grid');
      if (!gridEl) return;
      gridEl.innerHTML = '';
      gridEl.style.display = 'grid';
      gridEl.style.gridTemplateColumns = "repeat(".concat(this.gridSize, ", 1fr)");
      gridEl.style.gap = '4px';
      if (this.gameOverTriggered) {
        gridEl.style.pointerEvents = 'none';
        gridEl.style.opacity = '0.5';
      }
      var _loop = function _loop(row) {
        var _loop2 = function _loop2(col) {
          var cell = document.createElement('div');
          cell.className = 'match3-cell';
          cell.textContent = _this2.grid[row][col];
          cell.dataset.row = row;
          cell.dataset.col = col;
          var key = "".concat(row, ",").concat(col);
          if (_this2.specialGemTypes.has(key)) {
            cell.classList.add('special-gem');
            cell.classList.add(_this2.specialGemTypes.get(key));
          }
          if (!_this2.gameOverTriggered) {
            // Drag & Drop events
            cell.addEventListener('mousedown', function (e) {
              return _this2.handleDragStart(e, row, col);
            });
            cell.addEventListener('mousemove', function (e) {
              return _this2.handleDragMove(e, row, col);
            });
            cell.addEventListener('mouseup', function (e) {
              return _this2.handleDragEnd(e, row, col);
            });
            cell.addEventListener('mouseleave', function (e) {
              return _this2.handleDragLeave(e, row, col);
            });

            // Touch events for mobile
            cell.addEventListener('touchstart', function (e) {
              return _this2.handleDragStart(e, row, col);
            });
            cell.addEventListener('touchmove', function (e) {
              return _this2.handleTouchMove(e);
            });
            cell.addEventListener('touchend', function (e) {
              return _this2.handleDragEnd(e, row, col);
            });

            // Fallback: keep click for special gems
            cell.addEventListener('click', function (e) {
              if (!_this2.dragState.isDragging && _this2.specialGemTypes.has(key)) {
                _this2.handleCellClick(row, col);
              }
            });
          }
          gridEl.appendChild(cell);
        };
        for (var col = 0; col < _this2.gridSize; col++) {
          _loop2(col);
        }
      };
      for (var row = 0; row < this.gridSize; row++) {
        _loop(row);
      }
    }

    /**
     * Drag & Drop handlers
     */
  }, {
    key: "handleDragStart",
    value: function handleDragStart(e, row, col) {
      if (this.isProcessing || this.gameOverTriggered) return;
      e.preventDefault();
      this.dragState.isDragging = true;
      this.dragState.startCell = {
        row: row,
        col: col
      };
      var cell = e.target.closest('.match3-cell');
      if (cell) {
        cell.classList.add('selected');
      }
      console.log('🎯 Drag started:', row, col);
    }
  }, {
    key: "handleDragMove",
    value: function handleDragMove(e, row, col) {
      if (!this.dragState.isDragging) return;
      var startCell = this.dragState.startCell;
      if (!startCell) return;

      // Check if moved to adjacent cell
      var isAdjacent = Math.abs(row - startCell.row) === 1 && col === startCell.col || Math.abs(col - startCell.col) === 1 && row === startCell.row;
      if (isAdjacent) {
        this.dragState.currentCell = {
          row: row,
          col: col
        };

        // Highlight target
        var targetCell = document.querySelector("[data-row=\"".concat(row, "\"][data-col=\"").concat(col, "\"]"));
        if (targetCell && !targetCell.classList.contains('drag-target')) {
          document.querySelectorAll('.drag-target').forEach(function (c) {
            return c.classList.remove('drag-target');
          });
          targetCell.classList.add('drag-target');
        }
      }
    }
  }, {
    key: "handleDragLeave",
    value: function handleDragLeave(e, row, col) {
      if (!this.dragState.isDragging) return;
      var cell = e.target.closest('.match3-cell');
      if (cell) {
        cell.classList.remove('drag-target');
      }
    }
  }, {
    key: "handleDragEnd",
    value: function handleDragEnd(e, row, col) {
      if (!this.dragState.isDragging) return;
      e.preventDefault();
      var _this$dragState = this.dragState,
        startCell = _this$dragState.startCell,
        currentCell = _this$dragState.currentCell;

      // Clear highlights
      document.querySelectorAll('.match3-cell').forEach(function (c) {
        c.classList.remove('selected', 'drag-target');
      });
      if (startCell && currentCell) {
        var isAdjacent = Math.abs(currentCell.row - startCell.row) === 1 && currentCell.col === startCell.col || Math.abs(currentCell.col - startCell.col) === 1 && currentCell.row === startCell.row;
        if (isAdjacent) {
          console.log('🔄 Swapping via drag:', startCell, '←→', currentCell);
          this.swap(startCell.row, startCell.col, currentCell.row, currentCell.col);
        }
      }

      // Reset drag state
      this.dragState.isDragging = false;
      this.dragState.startCell = null;
      this.dragState.currentCell = null;
    }
  }, {
    key: "handleTouchMove",
    value: function handleTouchMove(e) {
      if (!this.dragState.isDragging) return;
      e.preventDefault();
      var touch = e.touches[0];
      var element = document.elementFromPoint(touch.clientX, touch.clientY);
      var cell = element === null || element === void 0 ? void 0 : element.closest('.match3-cell');
      if (cell) {
        var row = parseInt(cell.dataset.row);
        var col = parseInt(cell.dataset.col);
        this.handleDragMove(e, row, col);
      }
    }
  }, {
    key: "bindEvents",
    value: function bindEvents() {
      var _this3 = this;
      var exitBtn = document.getElementById('m3-exit');
      if (exitBtn) {
        exitBtn.addEventListener('click', function () {
          return _this3.options.onExit();
        });
      }
    }
  }, {
    key: "handleCellClick",
    value: function handleCellClick(row, col) {
      console.log('🎯 Cell clicked:', row, col);
      if (this.moves >= this.options.maxMoves) {
        if (!this.gameOverTriggered) {
          this.gameOverTriggered = true;
          this.gameOver();
        }
        return;
      }
      if (this.isProcessing) return;
      var cell = document.querySelector("[data-row=\"".concat(row, "\"][data-col=\"").concat(col, "\"]"));
      var key = "".concat(row, ",").concat(col);

      // Check if clicking a special gem
      if (this.specialGemTypes.has(key)) {
        console.log('⚡ Activating special gem!');
        this.moves++;
        this.isProcessing = true;
        var specialMatches = this.activateSpecialGem(row, col);
        this.processMatches(specialMatches, this.moves >= this.options.maxMoves);
        this.selectedCell = null;
        return;
      }
      if (!this.selectedCell) {
        this.selectedCell = {
          row: row,
          col: col,
          el: cell
        };
        cell.classList.add('selected');
        return;
      }
      var _this$selectedCell = this.selectedCell,
        r1 = _this$selectedCell.row,
        c1 = _this$selectedCell.col,
        el1 = _this$selectedCell.el;
      if (row === r1 && col === c1) {
        el1.classList.remove('selected');
        this.selectedCell = null;
        return;
      }
      var isAdjacent = Math.abs(row - r1) === 1 && col === c1 || Math.abs(col - c1) === 1 && row === r1;
      el1.classList.remove('selected');
      if (isAdjacent) {
        this.swap(r1, c1, row, col);
      } else {
        this.selectedCell = {
          row: row,
          col: col,
          el: cell
        };
        cell.classList.add('selected');
      }
    }
  }, {
    key: "swap",
    value: function swap(r1, c1, r2, c2) {
      var _this4 = this;
      // ✅ Check if we've already hit max moves
      if (this.moves >= this.options.maxMoves) {
        console.log('🛑 Already at max moves - aborting swap');
        this.selectedCell = null;
        if (!this.gameOverTriggered) {
          this.gameOverTriggered = true;
          this.gameOver();
        }
        return;
      }
      this.isProcessing = true;

      // Swap gems
      var temp = this.grid[r1][c1];
      this.grid[r1][c1] = this.grid[r2][c2];
      this.grid[r2][c2] = temp;
      console.log('✅ Swapped:', temp, '<->', this.grid[r1][c1]);
      this.renderGrid();
      setTimeout(function () {
        var matches = _this4.findMatches();
        console.log('Matches found:', matches.length);
        if (matches.length > 0) {
          // Valid move - increment AFTER checking
          _this4.moves++;
          console.log("\uD83D\uDCCA Move ".concat(_this4.moves, "/").concat(_this4.options.maxMoves));
          _this4.updateStats();

          // ✅ Check if this was the last move
          if (_this4.moves >= _this4.options.maxMoves) {
            console.log('⚠️ This was the last move!');
            // Process matches but trigger game over after
            _this4.processMatches(matches, true); // Pass flag to indicate last move
          } else {
            _this4.processMatches(matches, false);
          }
        } else {
          // Swap back
          var temp2 = _this4.grid[r1][c1];
          _this4.grid[r1][c1] = _this4.grid[r2][c2];
          _this4.grid[r2][c2] = temp2;
          _this4.renderGrid();
          _this4.isProcessing = false;
          console.log('❌ No matches - swapped back');
        }
        _this4.selectedCell = null;
      }, 300);
    }
  }, {
    key: "findMatches",
    value: function findMatches() {
      var matches = [];
      var found = new Set();

      // Horizontal
      for (var row = 0; row < this.gridSize; row++) {
        for (var col = 0; col < this.gridSize - 2; col++) {
          var gem = this.grid[row][col];
          if (this.grid[row][col + 1] === gem && this.grid[row][col + 2] === gem) {
            for (var i = 0; i < 3; i++) {
              var key = "".concat(row, ",").concat(col + i);
              if (!found.has(key)) {
                found.add(key);
                matches.push({
                  row: row,
                  col: col + i
                });
              }
            }
          }
        }
      }

      // Vertical
      for (var _col = 0; _col < this.gridSize; _col++) {
        for (var _row = 0; _row < this.gridSize - 2; _row++) {
          var _gem = this.grid[_row][_col];
          if (this.grid[_row + 1][_col] === _gem && this.grid[_row + 2][_col] === _gem) {
            for (var _i = 0; _i < 3; _i++) {
              var _key = "".concat(_row + _i, ",").concat(_col);
              if (!found.has(_key)) {
                found.add(_key);
                matches.push({
                  row: _row + _i,
                  col: _col
                });
              }
            }
          }
        }
      }
      return matches;
    }
  }, {
    key: "processMatches",
    value: function processMatches(matches) {
      var _this5 = this;
      var isLastMove = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      console.log('💥 Processing', matches.length, 'matches', isLastMove ? '(LAST MOVE)' : '');
      var specialPattern = this.checkForSpecialPattern(matches);
      var points = matches.length * 10;
      this.combo++;
      this.score += points * this.combo;
      this.bestCombo = Math.max(this.bestCombo, this.combo);

      // ✨ ADAUGĂ ASTA - Floating text pentru punctaj
      if (matches.length > 0) {
        var centerMatch = matches[Math.floor(matches.length / 2)];
        var totalPoints = points * this.combo;
        this.showFloatingText(centerMatch.row, centerMatch.col, "+".concat(totalPoints), 'score');

        // Extra feedback pentru combo mare
        if (this.combo >= 5) {
          setTimeout(function () {
            _this5.showFloatingText(centerMatch.row, centerMatch.col, "".concat(_this5.combo, "x COMBO!"), 'special');
          }, 200);
        }
      }

      // Create special gem if pattern found
      if (specialPattern && matches.length >= 4) {
        var _centerMatch = matches[Math.floor(matches.length / 2)];
        this.createSpecialGem(_centerMatch.row, _centerMatch.col, specialPattern.type);

        // Show notification - deja exista
        this.showFloatingText(_centerMatch.row, _centerMatch.col, "".concat(specialPattern.type.toUpperCase(), "!"), 'special');
      }

      // Remove matches
      matches.forEach(function (m) {
        _this5.grid[m.row][m.col] = null;
        var key = "".concat(m.row, ",").concat(m.col);
        _this5.specialGemTypes["delete"](key);
      });
      this.renderGrid();
      this.updateStats();
      setTimeout(function () {
        _this5.dropGems();
        _this5.fillEmpty();
        _this5.renderGrid();
        setTimeout(function () {
          var newMatches = _this5.findMatches();
          if (newMatches.length > 0) {
            _this5.processMatches(newMatches, isLastMove);
          } else {
            _this5.combo = 0;
            _this5.isProcessing = false;
            _this5.updateStats();
            if (isLastMove && !_this5.gameOverTriggered) {
              console.log('🏁 Last move cascade complete - triggering game over');
              _this5.gameOverTriggered = true;
              setTimeout(function () {
                _this5.gameOver();
              }, 500);
            }
          }
        }, 300);
      }, 300);
    }
  }, {
    key: "dropGems",
    value: function dropGems() {
      for (var col = 0; col < this.gridSize; col++) {
        for (var row = this.gridSize - 1; row >= 0; row--) {
          if (this.grid[row][col] === null) {
            for (var above = row - 1; above >= 0; above--) {
              if (this.grid[above][col] !== null) {
                this.grid[row][col] = this.grid[above][col];
                this.grid[above][col] = null;
                break;
              }
            }
          }
        }
      }
    }
  }, {
    key: "fillEmpty",
    value: function fillEmpty() {
      for (var row = 0; row < this.gridSize; row++) {
        for (var col = 0; col < this.gridSize; col++) {
          if (this.grid[row][col] === null) {
            this.grid[row][col] = this.gems[Math.floor(Math.random() * this.gems.length)];
          }
        }
      }
    }
  }, {
    key: "updateStats",
    value: function updateStats() {
      var scoreEl = document.getElementById('m3-score');
      var movesEl = document.getElementById('m3-moves');
      var comboEl = document.getElementById('m3-combo');
      if (scoreEl) scoreEl.textContent = this.score;
      if (movesEl) movesEl.textContent = "".concat(this.moves, "/").concat(this.options.maxMoves);
      if (comboEl) comboEl.textContent = "".concat(this.combo, "x");
    }
  }, {
    key: "gameOver",
    value: function gameOver() {
      var _this6 = this;
      console.log('🏁 ========= GAME OVER =========');
      console.log("Final Score: ".concat(this.score));
      console.log("Moves Used: ".concat(this.moves, "/").concat(this.options.maxMoves));
      console.log("Best Combo: ".concat(this.bestCombo, "x"));
      console.log('================================');

      // Prevent further moves
      this.isProcessing = true;
      this.gameOverTriggered = true;

      // Disable grid interactions
      var gridEl = document.getElementById('m3-grid');
      if (gridEl) {
        gridEl.style.pointerEvents = 'none';
        gridEl.style.opacity = '0.6';
      }
      var result = {
        score: this.score,
        moves: this.moves,
        movesUsed: this.moves,
        maxMoves: this.options.maxMoves,
        bestCombo: this.bestCombo,
        totalDamage: Math.floor(this.score / 5),
        success: this.score >= this.options.targetScore
      };

      // Track game completion for achievements
      var isPerfect = this.score >= 3000 && this.options.mode === 'boss';
      stateManager.dispatch({
        type: 'TRACK_MATCH3_GAME',
        payload: {
          score: this.score,
          combo: this.bestCombo,
          isPerfect: isPerfect
        }
      });

      // Emit stats update for achievement checking
      _EventBus["default"].emit('mini-game:stats-updated', {
        game: 'match3'
      });

      // Emit completion event (pentru boss battles)
      _EventBus["default"].emit('match3:game-complete', {
        result: result
      });
      console.log('📊 Final results:', result);

      // Show game over overlay
      var container = document.querySelector('.match3-game');
      if (container) {
        var _document$getElementB;
        var overlay = document.createElement('div');
        overlay.className = 'match3-game-over';
        overlay.innerHTML = "\n      <div class=\"game-over-content\">\n        <h2>".concat(result.success ? '🎉 Victory!' : '⏱️ Time\'s Up!', "</h2>\n        <div class=\"game-over-stats\">\n          <div class=\"stat\">\n            <span class=\"label\">Score</span>\n            <span class=\"value\">").concat(result.score, "</span>\n          </div>\n          <div class=\"stat\">\n            <span class=\"label\">Target</span>\n            <span class=\"value\">").concat(this.options.targetScore, "</span>\n          </div>\n          <div class=\"stat\">\n            <span class=\"label\">Best Combo</span>\n            <span class=\"value\">").concat(result.bestCombo, "x</span>\n          </div>\n          ").concat(this.options.mode === 'boss' ? "\n            <div class=\"stat\">\n              <span class=\"label\">Damage Dealt</span>\n              <span class=\"value\">".concat(result.totalDamage, "</span>\n            </div>\n          ") : '', "\n        </div>\n        <button class=\"btn btn-primary btn-large\" id=\"game-over-continue\">\n          Continue\n        </button>\n      </div>\n    ");
        container.appendChild(overlay);

        // Wait for button click
        (_document$getElementB = document.getElementById('game-over-continue')) === null || _document$getElementB === void 0 || _document$getElementB.addEventListener('click', function () {
          console.log('✅ Continue button clicked - calling onComplete callback');
          overlay.remove();
          _this6.options.onComplete(result);
        });
      } else {
        console.warn('⚠️ Container not found, calling onComplete directly');
        this.options.onComplete(result);
      }
    }
  }, {
    key: "destroy",
    value: function destroy() {
      this.container.innerHTML = '';
    }
  }]);
}();
var _default = exports["default"] = Match3Game;

},{"../../utils/EventBus.js":56,"../../utils/Logger.js":58}],56:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _config = _interopRequireDefault(require("../config.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /**
 * EventBus - Pub/Sub Pattern
 * Permite comunicare decuplată între componente
 * 
 * Usage:
 *   eventBus.on('structure:purchased', (data) => { ... });
 *   eventBus.emit('structure:purchased', { key: 'solarPanel', level: 5 });
 */
var EventBus = /*#__PURE__*/function () {
  function EventBus() {
    _classCallCheck(this, EventBus);
    this.events = new Map();
    this.eventHistory = [];
    this.maxHistorySize = 100;
  }

  /**
   * Subscribe to an event
   * @param {string} event - Event name
   * @param {function} callback - Handler function
   * @param {object} context - Optional context for 'this'
   * @returns {function} Unsubscribe function
   */
  return _createClass(EventBus, [{
    key: "on",
    value: function on(event, callback) {
      var _this = this;
      var context = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      // --- START FIX PERMANENT ---
      // BLOCĂM ORICE ALT LISTENER PENTRU 'notification:show' DUPĂ CE PRIMUL S-A ÎNREGISTRAT
      if (event === 'notification:show' && this.events.has('notification:show')) {
        console.warn("🛡️ BLOCAT! Am prevenit înregistrarea listener-ului duplicat/problematic pentru 'notification:show'.");
        // Pur și simplu nu înregistrăm acest al doilea listener și returnăm o funcție goală.
        return function () {};
      }
      // --- SFÂRȘIT FIX PERMANENT ---

      if (!this.events.has(event)) {
        this.events.set(event, []);
      }
      var handler = {
        callback: callback,
        context: context
      };
      this.events.get(event).push(handler);

      // Returnează o funcție de dezabonare
      return function () {
        _this.off(event, callback);
      };
    }

    /**
     * Unsubscribe from event
     */
  }, {
    key: "off",
    value: function off(event, callback) {
      if (!this.events.has(event)) return;
      var handlers = this.events.get(event);
      var index = handlers.findIndex(function (h) {
        return h.callback === callback;
      });
      if (index !== -1) {
        handlers.splice(index, 1);
      }

      // Cleanup empty event arrays
      if (handlers.length === 0) {
        this.events["delete"](event);
      }
    }

    /**
     * Emit an event
     */
  }, {
    key: "emit",
    value: function emit(event) {
      var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      // Log in debug mode
      if (_config["default"].DEBUG_MODE && _config["default"].LOG_LEVEL === 'debug') {
        console.log("[EventBus] ".concat(event), data);
      }

      // Store in history
      this.eventHistory.push({
        event: event,
        data: data,
        timestamp: Date.now()
      });

      // Maintain history size
      if (this.eventHistory.length > this.maxHistorySize) {
        this.eventHistory.shift();
      }

      // Call handlers
      if (!this.events.has(event)) return;
      var handlers = this.events.get(event);
      handlers.forEach(function (_ref) {
        var callback = _ref.callback,
          context = _ref.context;
        try {
          callback.call(context, data);
        } catch (error) {
          console.error("[EventBus] Error in handler for '".concat(event, "':"), error);
        }
      });
    }

    /**
     * Remove all listeners for an event
     */
  }, {
    key: "clear",
    value: function clear(event) {
      if (event) {
        this.events["delete"](event);
      } else {
        this.events.clear();
      }
    }

    /**
     * Get event history
     */
  }, {
    key: "getHistory",
    value: function getHistory() {
      var event = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      if (event) {
        return this.eventHistory.filter(function (e) {
          return e.event === event;
        });
      }
      return _toConsumableArray(this.eventHistory);
    }

    /**
     * Debug info
     */
  }, {
    key: "debug",
    value: function debug() {
      console.log('[EventBus] Registered events:', Array.from(this.events.keys()));
      console.log('[EventBus] Recent history:', this.eventHistory.slice(-10));
    }
  }]);
}(); // Singleton instance
var eventBus = new EventBus();
var _default = exports["default"] = eventBus;

},{"../config.js":1}],57:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * Formatters - Number and time formatting utilities
 */
var Formatters = /*#__PURE__*/function () {
  function Formatters() {
    _classCallCheck(this, Formatters);
  }
  return _createClass(Formatters, null, [{
    key: "formatNumber",
    value:
    /**
     * Format large numbers
     * @param {number} num - Number to format
     * @param {number} decimals - Decimal places
     * @returns {string} Formatted number
     */
    function formatNumber(num) {
      var decimals = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2;
      if (num === null || num === undefined || isNaN(num)) return '0';
      var absNum = Math.abs(num);
      if (absNum >= 1e12) {
        return (num / 1e12).toFixed(decimals) + 'T';
      }
      if (absNum >= 1e9) {
        return (num / 1e9).toFixed(decimals) + 'B';
      }
      if (absNum >= 1e6) {
        return (num / 1e6).toFixed(decimals) + 'M';
      }
      if (absNum >= 1e3) {
        return (num / 1e3).toFixed(decimals) + 'K';
      }

      // Small numbers
      if (absNum < 1 && absNum > 0) {
        return num.toFixed(decimals);
      }
      return Math.floor(num).toLocaleString();
    }

    /**
     * Format with suffix (for display)
     */
  }, {
    key: "formatWithSuffix",
    value: function formatWithSuffix(num) {
      var resource = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
      var formatted = this.formatNumber(num);
      var suffixes = {
        energy: '⚡',
        mana: '✨',
        gems: '💎',
        crystals: '💠',
        volcanic: '🌋'
      };
      var suffix = suffixes[resource] || '';
      return "".concat(formatted).concat(suffix ? ' ' + suffix : '');
    }

    /**
     * Format time duration
     * @param {number} ms - Milliseconds
     * @returns {string} Formatted time
     */
  }, {
    key: "formatTime",
    value: function formatTime(ms) {
      if (ms < 0) return '0s';
      var seconds = Math.floor(ms / 1000);
      var minutes = Math.floor(seconds / 60);
      var hours = Math.floor(minutes / 60);
      var days = Math.floor(hours / 24);
      if (days > 0) {
        return "".concat(days, "d ").concat(hours % 24, "h");
      }
      if (hours > 0) {
        return "".concat(hours, "h ").concat(minutes % 60, "m");
      }
      if (minutes > 0) {
        return "".concat(minutes, "m ").concat(seconds % 60, "s");
      }
      return "".concat(seconds, "s");
    }

    /**
     * Format time remaining (countdown)
     */
  }, {
    key: "formatTimeRemaining",
    value: function formatTimeRemaining(ms) {
      if (ms <= 0) return 'Ready!';
      var seconds = Math.floor(ms / 1000);
      var minutes = Math.floor(seconds / 60);
      var hours = Math.floor(minutes / 60);
      if (hours > 0) {
        return "".concat(hours, ":").concat(String(minutes % 60).padStart(2, '0'), ":").concat(String(seconds % 60).padStart(2, '0'));
      }
      if (minutes > 0) {
        return "".concat(minutes, ":").concat(String(seconds % 60).padStart(2, '0'));
      }
      return "".concat(seconds, "s");
    }

    /**
     * Format percentage
     */
  }, {
    key: "formatPercent",
    value: function formatPercent(value) {
      var decimals = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
      return "".concat((value * 100).toFixed(decimals), "%");
    }

    /**
     * Format rate (per second)
     */
  }, {
    key: "formatRate",
    value: function formatRate(value) {
      var resource = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
      return "".concat(this.formatWithSuffix(value, resource), "/s");
    }

    /**
     * Format date
     */
  }, {
    key: "formatDate",
    value: function formatDate(timestamp) {
      var date = new Date(timestamp);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }

    /**
     * Format relative time (ago)
     */
  }, {
    key: "formatRelativeTime",
    value: function formatRelativeTime(timestamp) {
      var now = Date.now();
      var diff = now - timestamp;
      var seconds = Math.floor(diff / 1000);
      var minutes = Math.floor(seconds / 60);
      var hours = Math.floor(minutes / 60);
      var days = Math.floor(hours / 24);
      if (days > 0) return "".concat(days, " day").concat(days > 1 ? 's' : '', " ago");
      if (hours > 0) return "".concat(hours, " hour").concat(hours > 1 ? 's' : '', " ago");
      if (minutes > 0) return "".concat(minutes, " minute").concat(minutes > 1 ? 's' : '', " ago");
      if (seconds > 0) return "".concat(seconds, " second").concat(seconds > 1 ? 's' : '', " ago");
      return 'just now';
    }

    /**
     * Parse formatted number back to value
     */
  }, {
    key: "parseNumber",
    value: function parseNumber(str) {
      if (typeof str === 'number') return str;
      var multipliers = {
        'K': 1e3,
        'M': 1e6,
        'B': 1e9,
        'T': 1e12
      };
      var match = str.match(/^([\d.]+)([KMBT])?$/);
      if (!match) return 0;
      var value = parseFloat(match[1]);
      var suffix = match[2];
      return suffix ? value * multipliers[suffix] : value;
    }
  }]);
}();
var _default = exports["default"] = Formatters;

},{}],58:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _config = _interopRequireDefault(require("../config.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /**
 * Logger - Centralized logging with categories and levels
 */
var Logger = /*#__PURE__*/function () {
  function Logger() {
    _classCallCheck(this, Logger);
    this.logs = [];
    this.maxLogs = 1000;
    this.categories = new Set();
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };
    this.currentLevel = this.levels[_config["default"].LOG_LEVEL] || this.levels.info;
  }

  /**
   * Log with category
   */
  return _createClass(Logger, [{
    key: "log",
    value: function log(category, message) {
      var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      var level = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'info';
      var levelValue = this.levels[level] || this.levels.info;

      // Check if should log
      if (levelValue > this.currentLevel) return;
      var logEntry = {
        category: category,
        message: message,
        data: data,
        level: level,
        timestamp: Date.now(),
        time: new Date().toLocaleTimeString()
      };

      // Store
      this.logs.push(logEntry);
      this.categories.add(category);

      // Maintain size
      if (this.logs.length > this.maxLogs) {
        this.logs.shift();
      }

      // Console output
      if (_config["default"].DEBUG_MODE) {
        var style = this.getStyle(level);
        var prefix = "[".concat(category, "]");
        if (data) {
          console.log("%c".concat(prefix, " ").concat(message), style, data);
        } else {
          console.log("%c".concat(prefix, " ").concat(message), style);
        }
      }
    }

    /**
     * Shorthand methods
     */
  }, {
    key: "error",
    value: function error(category, message, data) {
      this.log(category, message, data, 'error');
    }
  }, {
    key: "warn",
    value: function warn(category, message, data) {
      this.log(category, message, data, 'warn');
    }
  }, {
    key: "info",
    value: function info(category, message, data) {
      this.log(category, message, data, 'info');
    }
  }, {
    key: "debug",
    value: function debug(category, message, data) {
      this.log(category, message, data, 'debug');
    }

    /**
     * Get logs by category
     */
  }, {
    key: "getByCategory",
    value: function getByCategory(category) {
      return this.logs.filter(function (log) {
        return log.category === category;
      });
    }

    /**
     * Get logs by level
     */
  }, {
    key: "getByLevel",
    value: function getByLevel(level) {
      return this.logs.filter(function (log) {
        return log.level === level;
      });
    }

    /**
     * Get recent logs
     */
  }, {
    key: "getRecent",
    value: function getRecent() {
      var count = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 10;
      return this.logs.slice(-count);
    }

    /**
     * Export logs
     */
  }, {
    key: "export",
    value: function _export() {
      var data = {
        version: _config["default"].VERSION,
        exportedAt: new Date().toISOString(),
        categories: Array.from(this.categories),
        logs: this.logs
      };
      var json = JSON.stringify(data, null, 2);
      var blob = new Blob([json], {
        type: 'application/json'
      });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = "game_logs_".concat(Date.now(), ".json");
      a.click();
      URL.revokeObjectURL(url);
    }

    /**
     * Clear logs
     */
  }, {
    key: "clear",
    value: function clear() {
      this.logs = [];
      this.categories.clear();
    }

    /**
     * Console styles
     */
  }, {
    key: "getStyle",
    value: function getStyle(level) {
      var styles = {
        error: 'color: #ef4444; font-weight: bold;',
        warn: 'color: #f59e0b; font-weight: bold;',
        info: 'color: #3b82f6;',
        debug: 'color: #6b7280;'
      };
      return styles[level] || styles.info;
    }
  }]);
}(); // Singleton
var logger = new Logger();
var _default = exports["default"] = logger;

},{"../config.js":1}],59:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
exports.showNotification = showNotification;
var _NotificationManager = _interopRequireDefault(require("../systems/NotificationManager.js"));
var _NotificationConfig = require("../config/NotificationConfig.js");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
/**
 * Wrapper pentru notificări - folosește configurarea
 */

function showNotification(type, _ref) {
  var title = _ref.title,
    message = _ref.message,
    _ref$description = _ref.description,
    description = _ref$description === void 0 ? '' : _ref$description;
  // Verifică dacă ar trebui să apară
  if (!(0, _NotificationConfig.shouldShowNotification)(type)) {
    return;
  }
  var config = _NotificationConfig.NOTIFICATION_CONFIG[type];
  _NotificationManager["default"].show({
    type: config.priority >= 3 ? type : 'info',
    title: title,
    message: message,
    description: description,
    duration: config.duration
  });
}

// Export pentru compatibilitate
var _default = exports["default"] = {
  show: showNotification,
  clear: function clear() {
    return _NotificationManager["default"].clearAll();
  }
};

},{"../config/NotificationConfig.js":2,"../systems/NotificationManager.js":25}]},{},[17]);

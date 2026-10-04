// gameStore.ts - Zustand State Management for Three-Body Space Wargame
import { create } from "zustand";
import { soundManager } from "../threebody/SoundManager";

export type Faction = "earth" | "trisolaris";

export type UnitType =
  | "natural_selection" // Earth flagship
  | "gravity"           // Earth gravity broadcast ship
  | "bronze_age"         // Earth cruiser
  | "space_fortress"    // Earth defense fort
  | "droplet"           // Trisolaran droplet
  | "sophon"            // Trisolaran scout
  | "dreadnought";      // Trisolaran capital ship

export interface Unit {
  id: string;
  name: string;
  type: UnitType;
  faction: Faction;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  shield: number;
  maxShield: number;
  ap: number;
  maxAp: number;
  range: number;
  attack: number;
  lockedTurns: number; // Sophon lock duration
  shieldLeak: boolean; // 4D fragment effect
  bronzeAgeEnraged: boolean; // Bronze age passive
}

export type CellTerrain =
  | "normal"
  | "asteroid" // Blocks projectiles & movement
  | "anomaly"  // +1 AP to enter, +25% damage taken
  | "solar_wind"; // Disables shield recovery, -1 attack range

export interface CellState {
  x: number;
  y: number;
  terrain: CellTerrain;
  collapsed2d: boolean; // Flattened by Dual-Vector Foil
}

export interface Card {
  id: string;
  name: string;
  description: string;
  faction: Faction;
  effectType: string;
  image: string;
}

export interface GameState {
  // Config
  gameMode: "vs_ai" | "pass_and_play";
  status: "menu" | "playing" | "earth_win" | "trisolaris_win" | "deterrence";
  
  // Board State
  grid: CellState[][];
  units: Unit[];
  selectedUnitId: string | null;
  turn: Faction;
  round: number;
  
  // Deterrence System (Luo Ji deterrence & Gravity broadcast)
  gravityBroadcastCharging: boolean; // Whether gravity broadcast is charging
  gravityBroadcastTurns: number; // Charge progress (needs 2 turns)
  gravityBroadcastUnitId: string | null;
  deterrenceStatus: "idle" | "charging" | "active";
  
  // Dual-Vector Foil Collapse
  foilCenter: { x: number; y: number } | null;
  foilRadius: number;
  
  // Cards State
  earthHand: Card[];
  trisolarisHand: Card[];
  earthDeck: Card[];
  trisolarisDeck: Card[];
  
  // Misc
  actionLog: string[];
  soundEnabled: boolean;

  // Actions
  initGame: (mode: "vs_ai" | "pass_and_play") => void;
  selectUnit: (id: string | null) => void;
  moveUnit: (id: string, x: number, y: number) => void;
  attackUnit: (attackerId: string, targetId: string) => void;
  executeSkill: (unitId: string, skillType: string, targetX?: number, targetY?: number) => void;
  playCard: (cardId: string, targetX?: number, targetY?: number) => void;
  endTurn: () => void;
  toggleSound: () => void;
  resetToMenu: () => void;
  addLogEntry: (entry: string) => void;
  runAITurn: () => void;
  runAIAfterCard: () => void;
  runAIUnitActions: (trisolarisUnits: Unit[], earthUnits: Unit[]) => void;
}

// Map Dimensions
const COLS = 10;
const ROWS = 8;

const EARTH_CARDS: Card[] = [
  {
    id: "luo_ji",
    name: "罗辑的抉择 (面壁威慑)",
    description: "使全体三体单位陷入“智子锁定”状态，强制停止行动 1 回合。",
    faction: "earth",
    effectType: "luo_ji",
    image: `${import.meta.env.BASE_URL}threebody/card_wallfacer.jpg`,
  },
  {
    id: "mental_seal",
    name: "思想印章",
    description: "选择一个地球战舰，清除其锁定状态，使其最大 AP+1 且攻击力+50%，持续 3 回合。",
    faction: "earth",
    effectType: "mental_seal",
    image: `${import.meta.env.BASE_URL}threebody/card_wallfacer.jpg`,
  },
  {
    id: "hines_boost",
    name: "希恩斯超限加速",
    description: "本回合内所有地球单位行动点数 (AP) 回复满，并且上限临时 +1。",
    faction: "earth",
    effectType: "hines_boost",
    image: `${import.meta.env.BASE_URL}threebody/card_wallfacer.jpg`,
  },
  {
    id: "four_d_pocket",
    name: "四维碎片水洼",
    description: "在目标格制造一个四维通道，进入该格的飞船其护盾被强行刺穿，直接受到生命伤害。",
    faction: "earth",
    effectType: "four_d_pocket",
    image: `${import.meta.env.BASE_URL}threebody/card_wallfacer.jpg`,
  },
];

const TRISOLARIS_CARDS: Card[] = [
  {
    id: "dual_vector_foil",
    name: "双向箔 (清理用)",
    description: "投掷在指定格。每回合结束时向周围扩散，吞噬一切进入该区域的飞船（降维打击直接湮灭）。",
    faction: "trisolaris",
    effectType: "dual_vector_foil",
    image: `${import.meta.env.BASE_URL}threebody/card_dual_vector_foil.jpg`,
  },
  {
    id: "sophon_unfold",
    name: "智子多维展开",
    description: "干扰地球雷达，使所有地球战舰本回合 AP 减 1，并扣除其 30% 护盾能量。",
    faction: "trisolaris",
    effectType: "sophon_unfold",
    image: `${import.meta.env.BASE_URL}threebody/unit_sophon.jpg`,
  },
  {
    id: "three_suns",
    name: "三日凌空",
    description: "恒星风暴爆发。选择 3x3 区域，对范围内所有战舰（不分敌我）造成 35 点高温高热物理伤害。",
    faction: "trisolaris",
    effectType: "three_suns",
    image: `${import.meta.env.BASE_URL}threebody/bg_space.jpg`,
  },
  {
    id: "dehydrate",
    name: "脱水与重水补充",
    description: "修复一艘三体战舰，恢复其 120 点生命与 80 点护盾，或者复活已被击毁的智子。",
    faction: "trisolaris",
    effectType: "dehydrate",
    image: `${import.meta.env.BASE_URL}threebody/unit_trisolaran_dreadnought.jpg`,
  },
];

// Helper to calculate distance
const getDistance = (x1: number, y1: number, x2: number, y2: number) => {
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
};

export const useGameStore = create<GameState>((set, get) => ({
  gameMode: "vs_ai",
  status: "menu",
  grid: [],
  units: [],
  selectedUnitId: null,
  turn: "earth",
  round: 1,
  
  gravityBroadcastCharging: false,
  gravityBroadcastTurns: 0,
  gravityBroadcastUnitId: null,
  deterrenceStatus: "idle",
  
  foilCenter: null,
  foilRadius: 0,
  
  earthHand: [],
  trisolarisHand: [],
  earthDeck: [],
  trisolarisDeck: [],
  
  actionLog: [],
  soundEnabled: true,

  addLogEntry: (entry: string) => {
    set((state) => ({ actionLog: [entry, ...state.actionLog.slice(0, 49)] }));
  },

  toggleSound: () => {
    const nextVal = soundManager.toggle();
    set({ soundEnabled: nextVal });
  },

  resetToMenu: () => {
    set({ status: "menu", selectedUnitId: null, actionLog: [] });
  },

  initGame: (mode: "vs_ai" | "pass_and_play") => {
    // Generate Grid
    const grid: CellState[][] = [];
    for (let y = 0; y < ROWS; y++) {
      const row: CellState[] = [];
      for (let x = 0; x < COLS; x++) {
        // Place some asteroids and anomalies randomly (avoiding spawn zones)
        let terrain: CellTerrain = "normal";
        if (x > 1 && x < COLS - 2) {
          const rand = Math.random();
          if (rand < 0.08) {
            terrain = "asteroid";
          } else if (rand < 0.14) {
            terrain = "anomaly";
          } else if (rand < 0.18) {
            terrain = "solar_wind";
          }
        }
        row.push({ x, y, terrain, collapsed2d: false });
      }
      grid.push(row);
    }

    // Spawn Units
    const units: Unit[] = [
      // Earth Units (Spawned on the left side x = 0, 1)
      {
        id: "earth_flagship",
        name: "自然选择号 (Flagship)",
        type: "natural_selection",
        faction: "earth",
        x: 0,
        y: 2,
        hp: 240,
        maxHp: 240,
        shield: 60,
        maxShield: 60,
        ap: 3,
        maxAp: 3,
        range: 3,
        attack: 40,
        lockedTurns: 0,
        shieldLeak: false,
        bronzeAgeEnraged: false,
      },
      {
        id: "earth_gravity",
        name: "万有引力号 (Broadcaster)",
        type: "gravity",
        faction: "earth",
        x: 0,
        y: 5,
        hp: 160,
        maxHp: 160,
        shield: 120,
        maxShield: 120,
        ap: 3,
        maxAp: 3,
        range: 4,
        attack: 25,
        lockedTurns: 0,
        shieldLeak: false,
        bronzeAgeEnraged: false,
      },
      {
        id: "earth_cruiser",
        name: "青铜时代号 (Cruiser)",
        type: "bronze_age",
        faction: "earth",
        x: 1,
        y: 3,
        hp: 140,
        maxHp: 140,
        shield: 80,
        maxShield: 80,
        ap: 4,
        maxAp: 4,
        range: 3,
        attack: 30,
        lockedTurns: 0,
        shieldLeak: false,
        bronzeAgeEnraged: false,
      },
      {
        id: "earth_fortress",
        name: "太空堡垒 (Defensive)",
        type: "space_fortress",
        faction: "earth",
        x: 0,
        y: 4,
        hp: 400,
        maxHp: 400,
        shield: 200,
        maxShield: 200,
        ap: 0, // Fort cannot move
        maxAp: 0,
        range: 5,
        attack: 45,
        lockedTurns: 0,
        shieldLeak: false,
        bronzeAgeEnraged: false,
      },

      // Trisolaris Units (Spawned on the right side x = 8, 9)
      {
        id: "tri_droplet",
        name: "强相互作用力水滴 (Droplet)",
        type: "droplet",
        faction: "trisolaris",
        x: 9,
        y: 3,
        hp: 110,
        maxHp: 110,
        shield: 350,
        maxShield: 350,
        ap: 5,
        maxAp: 5,
        range: 1, // Melee ramming!
        attack: 160,
        lockedTurns: 0,
        shieldLeak: false,
        bronzeAgeEnraged: false,
      },
      {
        id: "tri_sophon",
        name: "智子战斗投影 (Sophon)",
        type: "sophon",
        faction: "trisolaris",
        x: 8,
        y: 2,
        hp: 80,
        maxHp: 80,
        shield: 60,
        maxShield: 60,
        ap: 4,
        maxAp: 4,
        range: 2,
        attack: 15,
        lockedTurns: 0,
        shieldLeak: false,
        bronzeAgeEnraged: false,
      },
      {
        id: "tri_dreadnought",
        name: "三体主力战舰 (Capital)",
        type: "dreadnought",
        faction: "trisolaris",
        x: 9,
        y: 5,
        hp: 260,
        maxHp: 260,
        shield: 160,
        maxShield: 160,
        ap: 3,
        maxAp: 3,
        range: 4,
        attack: 50,
        lockedTurns: 0,
        shieldLeak: false,
        bronzeAgeEnraged: false,
      },
    ];

    // Decks
    const earthDeck = [...EARTH_CARDS].sort(() => Math.random() - 0.5);
    const trisolarisDeck = [...TRISOLARIS_CARDS].sort(() => Math.random() - 0.5);

    // Initial hands
    const earthHand = [earthDeck.pop()!, earthDeck.pop()!];
    const trisolarisHand = [trisolarisDeck.pop()!, trisolarisDeck.pop()!];

    set({
      gameMode: mode,
      status: "playing",
      grid,
      units,
      selectedUnitId: null,
      turn: "earth",
      round: 1,
      gravityBroadcastCharging: false,
      gravityBroadcastTurns: 0,
      gravityBroadcastUnitId: null,
      deterrenceStatus: "idle",
      foilCenter: null,
      foilRadius: 0,
      earthHand,
      trisolarisHand,
      earthDeck,
      trisolarisDeck,
      actionLog: ["游戏开始！末日之役拉开序幕。", "地球太空防御舰队 (EDF) 对峙 三体星际前哨舰队。"],
    });

    if (get().soundEnabled) {
      soundManager.playClick();
    }
  },

  selectUnit: (id) => {
    set({ selectedUnitId: id });
    if (id && get().soundEnabled) {
      soundManager.playClick();
    }
  },

  moveUnit: (id, x, y) => {
    const state = get();
    const unit = state.units.find((u) => u.id === id);
    if (!unit || unit.faction !== state.turn || unit.lockedTurns > 0) return;

    // Check boundaries
    if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return;

    // Check if cell is blocked or collapsed
    const cell = state.grid[y][x];
    if (cell.terrain === "asteroid" || cell.collapsed2d) return;

    // Calculate move cost
    let apCost = getDistance(unit.x, unit.y, x, y);
    if (cell.terrain === "anomaly") {
      apCost += 1; // extra cost
    }

    if (unit.ap < apCost) return; // Not enough AP

    // Check if space is occupied by another active unit
    const occupied = state.units.some((u) => u.x === x && u.y === y && u.hp > 0);
    if (occupied) return;

    // Update Unit position and deduct AP
    const updatedUnits = state.units.map((u) => {
      if (u.id === id) {
        return { ...u, x, y, ap: u.ap - apCost };
      }
      return u;
    });

    // Sound effect
    if (state.soundEnabled) {
      if (unit.type === "droplet") {
        soundManager.playDash();
      } else {
        soundManager.playClick();
      }
    }

    set({
      units: updatedUnits,
      selectedUnitId: id, // Keep it selected
    });

    state.addLogEntry(`${unit.name} 航行至坐标 (${x}, ${y})，消耗 AP ${apCost}。`);
  },

  attackUnit: (attackerId, targetId) => {
    const state = get();
    const attacker = state.units.find((u) => u.id === attackerId);
    const target = state.units.find((u) => u.id === targetId);

    if (!attacker || !target || attacker.faction !== state.turn || attacker.lockedTurns > 0 || attacker.ap < 1) return;

    // Check range
    let actualRange = attacker.range;
    const cell = state.grid[attacker.y][attacker.x];
    if (cell.terrain === "solar_wind") {
      actualRange = Math.max(1, actualRange - 1); // solar wind lowers range
    }

    const distance = getDistance(attacker.x, attacker.y, target.x, target.y);
    if (distance > actualRange) return;

    // Line of sight blocks by Asteroids
    let pathBlocked = false;
    if (distance > 1) {
      // Very simple raycast for grid lines (check if intermediate grid is asteroid)
      const steps = Math.max(Math.abs(target.x - attacker.x), Math.abs(target.y - attacker.y));
      for (let i = 1; i < steps; i++) {
        const checkX = Math.round(attacker.x + (target.x - attacker.x) * (i / steps));
        const checkY = Math.round(attacker.y + (target.y - attacker.y) * (i / steps));
        if (state.grid[checkY]?.[checkX]?.terrain === "asteroid") {
          pathBlocked = true;
          break;
        }
      }
    }

    if (pathBlocked) {
      state.addLogEntry(`攻击路径被小行星带阻挡！攻击失败。`);
      return;
    }

    // Play combat sound
    if (state.soundEnabled) {
      if (attacker.type === "droplet") {
        soundManager.playDash();
      } else {
        soundManager.playLaser();
      }
    }

    // Calculate Damage
    let damage = attacker.attack;
    
    // Adjustments
    if (attacker.type === "bronze_age" && attacker.bronzeAgeEnraged) {
      damage = Math.floor(damage * 1.5);
    }
    const targetCell = state.grid[target.y][target.x];
    if (targetCell.terrain === "anomaly") {
      damage = Math.floor(damage * 1.25); // Target is vulnerable in anomaly
    }

    // Droplet weak point check: adjacent and shield is low/gone
    let finalDamage = damage;
    if (target.type === "droplet" && target.shield <= 0 && distance === 1) {
      finalDamage = damage * 2; // Double damage!
    }

    // Apply shield vs HP
    let newShield = target.shield;
    let newHp = target.hp;

    if (targetCell.terrain === "solar_wind" && attacker.faction === "earth") {
      // Solar wind inhibits shield recovery, but doesn't affect raw penetration
    }

    // Check 4D pocket (ignores shield)
    const on4DPocket = target.shieldLeak;

    if (on4DPocket) {
      newHp = Math.max(0, target.hp - finalDamage);
    } else {
      if (newShield >= finalDamage) {
        newShield -= finalDamage;
      } else {
        const carryOver = finalDamage - newShield;
        newShield = 0;
        newHp = Math.max(0, newHp - carryOver);
      }
    }

    // Update targets
    const updatedUnits = state.units.map((u) => {
      if (u.id === targetId) {
        const isDead = newHp <= 0;
        if (isDead && state.soundEnabled) {
          soundManager.playExplosion();
        }
        return { ...u, hp: newHp, shield: newShield };
      }
      if (u.id === attackerId) {
        return { ...u, ap: u.ap - 1 };
      }
      return u;
    }).filter((u) => u.hp > 0 || u.type === "sophon"); // Keep Sophon alive (she can respawn or is high-dim)

    set({ units: updatedUnits });
    state.addLogEntry(`${attacker.name} 攻击了 ${target.name}，造成 ${finalDamage} 点伤害。(目标剩余 HP: ${newHp}, 护盾: ${newShield})`);

    // Check Victory condition
    const remainingEarth = updatedUnits.filter((u) => u.faction === "earth" && u.hp > 0);
    const remainingTrisolaris = updatedUnits.filter((u) => u.faction === "trisolaris" && u.hp > 0);

    if (remainingEarth.length === 0) {
      set({ status: "trisolaris_win" });
      state.addLogEntry("地球太空力量被彻底消灭，人类文明落幕！三体舰队获胜。");
    } else if (remainingTrisolaris.filter(u => u.type !== "sophon").length === 0) {
      // If only Sophon is left and others are dead, Earth wins
      set({ status: "earth_win" });
      state.addLogEntry("三体主力战舰及水滴均被摧毁！地球太空舰队成功抵挡第一波攻击，赢得暂时的胜利！");
    }
  },

  executeSkill: (unitId, skillType, targetX, targetY) => {
    const state = get();
    const unit = state.units.find((u) => u.id === unitId);
    if (!unit || unit.faction !== state.turn || unit.lockedTurns > 0 || unit.ap < 2) return;

    if (skillType === "fusion_dash" && unit.type === "natural_selection") {
      // Natural Selection nuclear dash: moves 4 grids in a straight line, deals damage if passes through enemy
      if (targetX === undefined || targetY === undefined) return;
      
      // Calculate straight line movement
      const isHorizontal = unit.y === targetY;
      const isVertical = unit.x === targetX;
      if (!isHorizontal && !isVertical) return; // Must be straight line
      
      const distance = getDistance(unit.x, unit.y, targetX, targetY);
      if (distance > 4) return; // max distance is 4

      // Scan path for units to damage
      const damagedUnits: string[] = [];
      const steps = distance;
      const dx = Math.sign(targetX - unit.x);
      const dy = Math.sign(targetY - unit.y);

      for (let i = 1; i <= steps; i++) {
        const pathX = unit.x + dx * i;
        const pathY = unit.y + dy * i;
        
        // check blockages
        const pathCell = state.grid[pathY]?.[pathX];
        if (!pathCell || pathCell.terrain === "asteroid" || pathCell.collapsed2d) {
          state.addLogEntry("冲锋路径受阻！无法冲锋。");
          return;
        }

        // check enemy units
        const enemy = state.units.find(u => u.x === pathX && u.y === pathY && u.faction !== "earth");
        if (enemy) {
          damagedUnits.push(enemy.id);
        }
      }

      // Action updates
      let updatedUnits = state.units.map((u) => {
        if (u.id === unitId) {
          return { ...u, x: targetX, y: targetY, ap: u.ap - 2 };
        }
        if (damagedUnits.includes(u.id)) {
          // deal 30 damage bypassing shield
          const newHp = Math.max(0, u.hp - 35);
          if (newHp <= 0 && state.soundEnabled) soundManager.playExplosion();
          return { ...u, hp: newHp };
        }
        return u;
      }).filter(u => u.hp > 0 || u.type === "sophon");

      if (state.soundEnabled) soundManager.playDash();

      set({ units: updatedUnits });
      state.addLogEntry(`${unit.name} 启动【无工质核聚变过载】，暴冲至 (${targetX}, ${targetY})，对路径上的三体单位造成 35 点穿透伤害！`);
    }

    else if (skillType === "gravity_broadcast" && unit.type === "gravity") {
      // Gravity waves charging
      if (state.gravityBroadcastCharging) {
        // Already charging
        return;
      }

      set({
        gravityBroadcastCharging: true,
        gravityBroadcastTurns: 0,
        gravityBroadcastUnitId: unitId,
        deterrenceStatus: "charging",
        units: state.units.map(u => u.id === unitId ? { ...u, ap: u.ap - 2 } : u),
      });

      if (state.soundEnabled) soundManager.playWarning();
      state.addLogEntry(`${unit.name} 开始激活【重力波广播天线】，正在向宇宙广播三体星系坐标！需要蓄力 2 回合。`);
    }

    else if (skillType === "survival" && unit.type === "bronze_age") {
      // Bronze Age desperate survival mode
      const updatedUnits = state.units.map((u) => {
        if (u.id === unitId) {
          const shieldSacrifice = Math.min(u.shield, 50);
          return {
            ...u,
            shield: u.shield - shieldSacrifice,
            bronzeAgeEnraged: true,
            ap: u.ap - 2,
          };
        }
        return u;
      });

      if (state.soundEnabled) soundManager.playClick();
      set({ units: updatedUnits });
      state.addLogEntry(`${unit.name} 触发【掠夺性生存】，献祭部分护盾，攻击力获得 1.5 倍爆发，持续到下回合！`);
    }

    else if (skillType === "droplet_pierce" && unit.type === "droplet") {
      // Droplet velocity pierce
      if (targetX === undefined || targetY === undefined) return;
      
      const isHorizontal = unit.y === targetY;
      const isVertical = unit.x === targetX;
      if (!isHorizontal && !isVertical) return;

      const distance = getDistance(unit.x, unit.y, targetX, targetY);
      if (distance > 5) return; // max distance is 5

      const damagedUnits: string[] = [];
      const steps = distance;
      const dx = Math.sign(targetX - unit.x);
      const dy = Math.sign(targetY - unit.y);

      for (let i = 1; i <= steps; i++) {
        const pathX = unit.x + dx * i;
        const pathY = unit.y + dy * i;
        
        const pathCell = state.grid[pathY]?.[pathX];
        if (!pathCell || pathCell.terrain === "asteroid" || pathCell.collapsed2d) {
          state.addLogEntry("水滴冲撞受到障碍物阻挡，在中途停止！");
          break; // Stop but move as far as possible
        }

        const enemy = state.units.find(u => u.x === pathX && u.y === pathY && u.faction === "earth");
        if (enemy) {
          damagedUnits.push(enemy.id);
        }
      }

      // Actually calculate final coordinate to move to
      const finalIndex = damagedUnits.length > 0 ? steps : steps;
      const finalX = unit.x + dx * finalIndex;
      const finalY = unit.y + dy * finalIndex;

      let updatedUnits = state.units.map((u) => {
        if (u.id === unitId) {
          return { ...u, x: finalX, y: finalY, ap: u.ap - 3 };
        }
        if (damagedUnits.includes(u.id)) {
          // Droplet ramming bypasses shield, deals huge physical damage
          const newHp = Math.max(0, u.hp - 100);
          if (newHp <= 0 && state.soundEnabled) soundManager.playExplosion();
          return { ...u, hp: newHp };
        }
        return u;
      }).filter(u => u.hp > 0 || u.type === "sophon");

      if (state.soundEnabled) soundManager.playDash();

      set({ units: updatedUnits });
      state.addLogEntry(`${unit.name} 启用【水滴锐角折返撞击】，以万分之一光速洞穿太空！对路径上的战舰造成 100 点毁灭性物理冲击伤害！`);
    }

    else if (skillType === "sophon_lock" && unit.type === "sophon") {
      // Sophon locks an enemy unit
      if (targetX === undefined || targetY === undefined) return;
      const targetUnit = state.units.find(u => u.x === targetX && u.y === targetY && u.faction === "earth");
      
      if (!targetUnit) return;

      const updatedUnits = state.units.map(u => {
        if (u.id === targetUnit.id) {
          return { ...u, lockedTurns: 2 };
        }
        if (u.id === unitId) {
          return { ...u, ap: u.ap - 2 };
        }
        return u;
      });

      if (state.soundEnabled) soundManager.playClick();
      set({ units: updatedUnits });
      state.addLogEntry(`${unit.name} 展开微观质子维度，对 ${targetUnit.name} 实施高能物理【智子锁定】，目标被阻断聚变能源，瘫痪 2 回合！`);
    }
  },

  playCard: (cardId, targetX, targetY) => {
    const state = get();
    const activeHand = state.turn === "earth" ? state.earthHand : state.trisolarisHand;
    const card = activeHand.find(c => c.id === cardId);
    if (!card) return;

    if (state.soundEnabled) {
      if (card.id === "dual_vector_foil") {
        soundManager.playFlatten();
      } else {
        soundManager.playClick();
      }
    }

    let success = false;

    // Apply Card Effects
    if (card.effectType === "luo_ji") {
      // Luo Ji Deterrence
      const updatedUnits = state.units.map(u => {
        if (u.faction === "trisolaris") {
          return { ...u, lockedTurns: 1 };
        }
        return u;
      });
      set({ units: updatedUnits });
      state.addLogEntry(`面壁者罗辑亮起自毁广播源！【罗辑的威慑】生效：强制封锁三体舰队所有单位 1 回合！`);
      success = true;
    }

    else if (card.effectType === "mental_seal") {
      // Mental Seal: gives target buff
      if (targetX === undefined || targetY === undefined) return;
      const targetUnit = state.units.find(u => u.x === targetX && u.y === targetY && u.faction === "earth");
      if (!targetUnit) {
        state.addLogEntry("无效目标：必须作用于地球单位！");
        return;
      }

      const updatedUnits = state.units.map(u => {
        if (u.id === targetUnit.id) {
          return {
            ...u,
            lockedTurns: 0,
            maxAp: u.maxAp + 1,
            ap: u.ap + 1,
            attack: Math.floor(u.attack * 1.5),
          };
        }
        return u;
      });
      set({ units: updatedUnits });
      state.addLogEntry(`地球打出【思想印章】印刻在 ${targetUnit.name} 上：获得“人类必胜”钢印，AP上限+1，攻击力提升50%！`);
      success = true;
    }

    else if (card.effectType === "hines_boost") {
      // Hines acceleration: boost all Earth AP
      const updatedUnits = state.units.map(u => {
        if (u.faction === "earth") {
          return { ...u, ap: u.maxAp };
        }
        return u;
      });
      set({ units: updatedUnits });
      state.addLogEntry(`地球打出【希恩斯超限加速】：聚变发动机功率满载，所有地球战舰 AP 回满！`);
      success = true;
    }

    else if (card.effectType === "four_d_pocket") {
      // 4D Space fragment on cell
      if (targetX === undefined || targetY === undefined) return;
      const targetUnit = state.units.find(u => u.x === targetX && u.y === targetY && u.faction === "earth");
      if (targetUnit) {
        const updatedUnits = state.units.map(u => u.id === targetUnit.id ? { ...u, shieldLeak: true } : u);
        set({ units: updatedUnits });
      }
      
      const newGrid = state.grid.map(row => 
        row.map(cell => cell.x === targetX && cell.y === targetY ? { ...cell, terrain: "anomaly" as CellTerrain } : cell)
      );
      set({ grid: newGrid });
      state.addLogEntry(`地球在星区 (${targetX}, ${targetY}) 部署了【四维碎片水洼】：任何进入该星区的战舰其内部电路与器官均暴露在四维中，攻击将刺穿护盾。`);
      success = true;
    }

    else if (card.effectType === "dual_vector_foil") {
      // Dual-Vector Foil: starts space collapsing
      if (targetX === undefined || targetY === undefined) return;
      
      // Mark target cell as 2D collapsed
      const newGrid = state.grid.map((row) =>
        row.map((cell) =>
          cell.x === targetX && cell.y === targetY ? { ...cell, collapsed2d: true } : cell
        )
      );

      // Kill any unit sitting there instantly
      const updatedUnits = state.units.map(u => {
        if (u.x === targetX && u.y === targetY) {
          if (state.soundEnabled) soundManager.playExplosion();
          return { ...u, hp: 0 };
        }
        return u;
      }).filter(u => u.hp > 0 || u.type === "sophon");

      set({
        grid: newGrid,
        units: updatedUnits,
        foilCenter: { x: targetX, y: targetY },
        foilRadius: 0,
      });

      state.addLogEntry(`歌者抛出了【双向箔】在星区 (${targetX}, ${targetY})！三维空间结构开始向二维坍缩，瞬间蒸发星区内所有物质！`);
      success = true;
    }

    else if (card.effectType === "sophon_fold") {
      // Sophon 2D Unfold: drain Earth AP & shields
      const updatedUnits = state.units.map(u => {
        if (u.faction === "earth") {
          return {
            ...u,
            ap: Math.max(0, u.ap - 1),
            shield: Math.max(0, Math.floor(u.shield * 0.7)),
          };
        }
        return u;
      });
      set({ units: updatedUnits });
      state.addLogEntry(`三体打出【智子二维展开】：微观粒子包覆地球战舰，导致雷达干扰，地球单位 AP 扣减 1，护盾削减 30%！`);
      success = true;
    }

    else if (card.effectType === "three_suns") {
      // Three Suns: deal AOE damage in 3x3
      if (targetX === undefined || targetY === undefined) return;
      
      const damagedUnits: string[] = [];
      
      const updatedUnits = state.units.map(u => {
        if (Math.abs(u.x - targetX) <= 1 && Math.abs(u.y - targetY) <= 1) {
          const newHp = Math.max(0, u.hp - 35);
          if (newHp <= 0 && state.soundEnabled) soundManager.playExplosion();
          damagedUnits.push(u.name);
          return { ...u, hp: newHp };
        }
        return u;
      }).filter(u => u.hp > 0 || u.type === "sophon");

      set({ units: updatedUnits });
      state.addLogEntry(`三体打出【三日凌空】：爆裂的引力光热风暴席卷坐标 (${targetX}, ${targetY}) 周边 3x3 范围，对 ${damagedUnits.join(", ")} 造成 35 点高温高热烧灼伤！`);
      success = true;
    }

    else if (card.effectType === "dehydrate") {
      // Dehydrate: heal Trisolaran units or revive Sophon
      const deadSophon = state.units.find(u => u.type === "sophon" && u.hp <= 0);
      let updatedUnits = [...state.units];

      if (deadSophon) {
        updatedUnits = state.units.map(u => {
          if (u.type === "sophon") {
            return { ...u, hp: 50, shield: 30, x: 9, y: 4 }; // revive at base area
          }
          return u;
        });
        state.addLogEntry(`三体打出【脱水与浸泡】：重新投影智子至战区星网！`);
      } else {
        // heal first Trisolaran unit below max hp
        const damaged = state.units.find(u => u.faction === "trisolaris" && u.hp < u.maxHp);
        if (damaged) {
          updatedUnits = state.units.map(u => {
            if (u.id === damaged.id) {
              return {
                ...u,
                hp: Math.min(u.maxHp, u.hp + 120),
                shield: Math.min(u.maxShield, u.shield + 80),
              };
            }
            return u;
          });
          state.addLogEntry(`三体打出【脱水与浸泡】：对 ${damaged.name} 进行结构修复，恢复其 120 点生命与 80 点护盾！`);
        } else {
          state.addLogEntry("所有三体单位生命全满，卡牌效果浪费，但增加了战局稳定度！");
        }
      }

      set({ units: updatedUnits });
      success = true;
    }

    if (success) {
      // Remove from hand
      if (state.turn === "earth") {
        set({ earthHand: state.earthHand.filter(c => c.id !== cardId) });
      } else {
        set({ trisolarisHand: state.trisolarisHand.filter(c => c.id !== cardId) });
      }
    }
  },

  endTurn: () => {
    const state = get();
    const nextFaction = state.turn === "earth" ? "trisolaris" : "earth";
    
    let updatedUnits = [...state.units];

    // End of Turn logistics
    if (state.turn === "earth") {
      // Check Gravity Broadcast charging progress
      if (state.gravityBroadcastCharging && state.gravityBroadcastUnitId) {
        const nextBroadcastTurns = state.gravityBroadcastTurns + 1;
        const gUnit = state.units.find(u => u.id === state.gravityBroadcastUnitId);
        
        if (nextBroadcastTurns >= 2 && gUnit && gUnit.hp > 0) {
          // Triggers Gravity Broadcast and wins Earth the game by deterring Trisolaris
          set({
            status: "deterrence",
            gravityBroadcastTurns: 2,
            deterrenceStatus: "active"
          });
          state.addLogEntry("【万有引力号】广播发射天线达到全功率！三体星系与太阳系坐标已向宇宙广播！引力波扫过星宿，黑暗森林威慑达成。三体舰队被迫撤军！地球获胜！");
          return;
        } else if (gUnit && gUnit.hp > 0) {
          set({ gravityBroadcastTurns: nextBroadcastTurns });
          state.addLogEntry(`重力波广播天线蓄力中... (进度 ${nextBroadcastTurns}/2)`);
        } else {
          // Unit dead
          set({ gravityBroadcastCharging: false, gravityBroadcastTurns: 0, gravityBroadcastUnitId: null, deterrenceStatus: "idle" });
          state.addLogEntry("【万有引力号】已被摧毁，重力波发射天线充电中断！");
        }
      }
    } else {
      // Trisolaris turn ended -> Round ends!
      const nextRound = state.round + 1;
      
      // 1. Expand Dual-Vector Foil if active
      let newGrid = [...state.grid];
      if (state.foilCenter) {
        const nextRadius = state.foilRadius + 1;
        const center = state.foilCenter;
        
        // Expand the collapsing cells
        newGrid = state.grid.map((row) =>
          row.map((cell) => {
            const dist = getDistance(cell.x, cell.y, center.x, center.y);
            if (dist <= nextRadius) {
              return { ...cell, collapsed2d: true };
            }
            return cell;
          })
        );

        // Kill units inside the expanded 2D space
        updatedUnits = updatedUnits.map(u => {
          const dist = getDistance(u.x, u.y, center.x, center.y);
          if (dist <= nextRadius) {
            if (state.soundEnabled) soundManager.playExplosion();
            return { ...u, hp: 0 };
          }
          return u;
        });

        set({ grid: newGrid, foilRadius: nextRadius });
        state.addLogEntry(`【警告】二维空间崩塌已蔓延到半径 ${nextRadius} 格内！`);
      }

      // 2. Refill AP for all units, clear temporary buffs, decrease lock status
      updatedUnits = updatedUnits.map((u) => {
        let newAp = u.maxAp;
        let newLockedTurns = Math.max(0, u.lockedTurns - 1);
        
        if (newLockedTurns > 0) {
          newAp = 0; // locked units get no AP
        }

        // Shield natural regeneration (+20 per round, capped at max shield, if not in solar wind)
        let newShield = u.shield;
        const cell = state.grid[u.y][u.x];
        if (cell.terrain !== "solar_wind") {
          newShield = Math.min(u.maxShield, u.shield + 15);
        }

        return {
          ...u,
          ap: newAp,
          shield: newShield,
          lockedTurns: newLockedTurns,
          bronzeAgeEnraged: false, // reset rage buff
        };
      }).filter((u) => u.hp > 0 || u.type === "sophon"); // Keep Sophon alive

      // 3. Draw cards (every 2 rounds, or if hand is empty)
      let currentEarthDeck = [...state.earthDeck];
      let currentEarthHand = [...state.earthHand];
      let currentTriDeck = [...state.trisolarisDeck];
      let currentTriHand = [...state.trisolarisHand];

      if (nextRound % 2 === 0 || currentEarthHand.length === 0) {
        if (currentEarthDeck.length === 0) {
          currentEarthDeck = [...EARTH_CARDS].sort(() => Math.random() - 0.5);
        }
        if (currentEarthHand.length < 4) {
          currentEarthHand.push(currentEarthDeck.pop()!);
        }
      }

      if (nextRound % 2 === 0 || currentTriHand.length === 0) {
        if (currentTriDeck.length === 0) {
          currentTriDeck = [...TRISOLARIS_CARDS].sort(() => Math.random() - 0.5);
        }
        if (currentTriHand.length < 4) {
          currentTriHand.push(currentTriDeck.pop()!);
        }
      }

      set({
        round: nextRound,
        earthDeck: currentEarthDeck,
        earthHand: currentEarthHand,
        trisolarisDeck: currentTriDeck,
        trisolarisHand: currentTriHand,
      });
      state.addLogEntry(`回合 ${nextRound} 开始！太空潮汐涌动。各自抽到了新的战术战略卡。`);
    }

    // Set Faction turn
    set({
      turn: nextFaction,
      units: updatedUnits,
      selectedUnitId: null, // Clear selection on turn change
    });

    state.addLogEntry(`轮到 ${nextFaction === "earth" ? "地球太空防御舰队 (EDF)" : "三体星际先哨舰队"} 行动。`);

    // AI logic trigger if vs_ai and now it's Trisolaris turn
    if (state.gameMode === "vs_ai" && nextFaction === "trisolaris" && get().status === "playing") {
      setTimeout(() => {
        get().runAITurn();
      }, 800);
    }
  },

  // Simple Tactical AI for Trisolaris
  runAITurn: () => {
    const state = get();
    if (state.status !== "playing" || state.turn !== "trisolaris") return;

    // AI prioritizes:
    // 1. Throw Dual-Vector Foil if available on Earth clustered area
    // 2. Dash ramming with Droplet if any Earth unit is in reach
    // 3. Attack Earth flagships or Gravity with dreadnought
    // 4. Sophon locks Gravity
    // 5. Move closer to Earth units if out of range

    const aiHand = [...state.trisolarisHand];
    const earthUnits = state.units.filter((u: Unit) => u.faction === "earth" && u.hp > 0);
    const trisolarisUnits = state.units.filter((u: Unit) => u.faction === "trisolaris" && u.hp > 0 && u.lockedTurns === 0);

    state.addLogEntry("【智子AI】正在规划三体舰队微观量子战术...");

    // 1. Play Dual-Vector Foil if held
    const foilCard = aiHand.find(c => c.id === "dual_vector_foil");
    if (foilCard && earthUnits.length > 0) {
      // Find Earth unit with high HP (like Flagship or Fortress)
      const target = earthUnits.find((u: Unit) => u.type === "space_fortress") || earthUnits[0];
      setTimeout(() => {
        get().playCard("dual_vector_foil", target.x, target.y);
      }, 500);
      
      // Delay remaining actions to allow animation pacing
      setTimeout(() => {
        get().runAIAfterCard();
      }, 1500);
      return;
    }

    // No foil or already played, proceed to direct unit moves
    get().runAIUnitActions(trisolarisUnits, earthUnits);
  },

  runAIAfterCard: () => {
    const state = get();
    const earthUnits = state.units.filter((u: Unit) => u.faction === "earth" && u.hp > 0);
    const trisolarisUnits = state.units.filter((u: Unit) => u.faction === "trisolaris" && u.hp > 0 && u.lockedTurns === 0);
    get().runAIUnitActions(trisolarisUnits, earthUnits);
  },

  runAIUnitActions: (trisolarisUnits: Unit[], earthUnits: Unit[]) => {
    const state = get();
    if (state.status !== "playing") return;

    // Process Droplet actions first
    const droplet = trisolarisUnits.find((u: Unit) => u.type === "droplet");
    const sophon = trisolarisUnits.find((u: Unit) => u.type === "sophon");
    const dread = trisolarisUnits.find((u: Unit) => u.type === "dreadnought");

    let actionTaken = false;

    // A) Droplet Ramming
    if (droplet && droplet.ap >= 3 && earthUnits.length > 0) {
      // Check if any Earth unit is on the same row or column within 5 cells
      const targetsInLine = earthUnits.filter((u: Unit) => 
        (u.x === droplet.x || u.y === droplet.y) && getDistance(droplet.x, droplet.y, u.x, u.y) <= 5
      );
      
      if (targetsInLine.length > 0) {
        const target = targetsInLine[0];
        get().executeSkill(droplet.id, "droplet_pierce", target.x, target.y);
        actionTaken = true;
      } else {
        // Just move closer to the closest Earth unit
        const closest = earthUnits.reduce((prev: Unit, curr: Unit) => 
          getDistance(droplet.x, droplet.y, curr.x, curr.y) < getDistance(droplet.x, droplet.y, prev.x, prev.y) ? curr : prev
        , earthUnits[0]);

        // Calculate a step towards them
        const dx = Math.sign(closest.x - droplet.x);
        const dy = Math.sign(closest.y - droplet.y);
        const targetX = Math.max(0, Math.min(COLS - 1, droplet.x + dx * 2));
        const targetY = Math.max(0, Math.min(ROWS - 1, droplet.y + dy * 2));

        if (targetX !== droplet.x || targetY !== droplet.y) {
          get().moveUnit(droplet.id, targetX, targetY);
          actionTaken = true;
        }
      }
    }

    // B) Sophon Lock
    if (!actionTaken && sophon && sophon.ap >= 2 && earthUnits.length > 0) {
      // Lock Gravity ship if possible, or Flagship
      const gravity = earthUnits.find((u: Unit) => u.type === "gravity");
      const target = gravity || earthUnits[0];
      
      if (getDistance(sophon.x, sophon.y, target.x, target.y) <= 3) {
        get().executeSkill(sophon.id, "sophon_lock", target.x, target.y);
        actionTaken = true;
      } else {
        // Move closer
        const dx = Math.sign(target.x - sophon.x);
        const dy = Math.sign(target.y - sophon.y);
        const tx = Math.max(0, Math.min(COLS - 1, sophon.x + dx * 2));
        const ty = Math.max(0, Math.min(ROWS - 1, sophon.y + dy * 2));
        get().moveUnit(sophon.id, tx, ty);
        actionTaken = true;
      }
    }

    // C) Dreadnought attack
    if (!actionTaken && dread && dread.ap >= 1 && earthUnits.length > 0) {
      // Find closest Earth unit in attack range
      const inRange = earthUnits.filter((u: Unit) => getDistance(dread.x, dread.y, u.x, u.y) <= dread.range);
      if (inRange.length > 0) {
        get().attackUnit(dread.id, inRange[0].id);
        actionTaken = true;
      } else {
        // Move closer
        const target = earthUnits[0];
        const dx = Math.sign(target.x - dread.x);
        const dy = Math.sign(target.y - dread.y);
        const tx = Math.max(0, Math.min(COLS - 1, dread.x + dx * 1));
        const ty = Math.max(0, Math.min(ROWS - 1, dread.y + dy * 1));
        get().moveUnit(dread.id, tx, ty);
        actionTaken = true;
      }
    }

    // Always end turn after a brief delay
    setTimeout(() => {
      get().endTurn();
    }, 1000);
  }
}));
export default useGameStore;

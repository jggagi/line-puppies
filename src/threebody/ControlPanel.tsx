// ControlPanel.tsx - Stats panel, actions controller, and event log display
import React, { useState } from "react";
import useGameStore, { type Unit } from "../store/gameStore";
import { soundManager } from "./SoundManager";
import { Zap, Shield, Heart, Crosshair, ArrowRight, Home, Volume2, VolumeX } from "lucide-react";

export const ControlPanel: React.FC = () => {
  const {
    units,
    selectedUnitId,
    turn,
    round,
    actionLog,
    gravityBroadcastCharging,
    endTurn,
    resetToMenu,
    toggleSound,
    soundEnabled,
  } = useGameStore();

  const [activeSkillType, setActiveSkillType] = useState<string | null>(null);

  const selectedUnit = units.find((u) => u.id === selectedUnitId);

  const triggerSkillSelect = (skillType: string, needsTarget: boolean) => {
    if (!selectedUnit) return;

    if (soundEnabled) {
      soundManager.playClick();
    }

    if (!needsTarget) {
      // Execute immediately (e.g. charging or survival buff)
      useGameStore.getState().executeSkill(selectedUnit.id, skillType);
      setActiveSkillType(null);
    } else {
      // Select skill and wait for cell click on GameBoard
      if ((window as any)._activeSkillType === skillType) {
        (window as any)._activeSkillType = null;
        setActiveSkillType(null);
      } else {
        (window as any)._activeSkillType = skillType;
        setActiveSkillType(skillType);
      }
      document.dispatchEvent(new CustomEvent("skill-selected"));
    }
  };

  // Reset skill selection on outside events
  React.useEffect(() => {
    const clearSkill = () => {
      setActiveSkillType(null);
    };
    document.addEventListener("skill-used", clearSkill);
    return () => {
      document.removeEventListener("skill-used", clearSkill);
    };
  }, []);

  // Helper to render skills for a selected unit
  const renderUnitSkills = (unit: Unit) => {
    if (unit.faction !== turn || unit.lockedTurns > 0) {
      return (
        <p className="text-zinc-500 text-xs italic">
          {unit.lockedTurns > 0 ? "⚠️ 该单位正处于“智子锁定”状态，系统瘫痪！" : "⌛ 对方回合，只能查看详情。"}
        </p>
      );
    }

    if (unit.ap < 2) {
      return <p className="text-zinc-500 text-xs italic">AP 不足，无法使用战术技能 (需消耗 2+ AP)。</p>;
    }

    const buttonClass = (skillType: string) => `
      w-full flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-semibold tracking-wide transition-all
      ${
        activeSkillType === skillType
          ? "border-purple-400 bg-purple-950/40 text-purple-300 ring-1 ring-purple-500/30"
          : "border-zinc-700 bg-zinc-900/60 text-zinc-300 hover:border-purple-500 hover:text-white"
      }
    `;

    switch (unit.type) {
      case "natural_selection":
        return (
          <div className="flex flex-col gap-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">战术推进系统</h4>
            <button
              onClick={() => triggerSkillSelect("fusion_dash", true)}
              className={buttonClass("fusion_dash")}
            >
              <span>核聚变过载冲锋 (消耗 2 AP)</span>
              <Zap size={12} className="text-purple-400" />
            </button>
            <p className="text-[10px] text-zinc-400 leading-normal">
              沿直线推进最多 4 格，对路径上所有三体单位造成 35 点聚变过载穿透伤害。
            </p>
          </div>
        );

      case "gravity":
        return (
          <div className="flex flex-col gap-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">重力波天线系统</h4>
            <button
              disabled={gravityBroadcastCharging}
              onClick={() => triggerSkillSelect("gravity_broadcast", false)}
              className={`${buttonClass("gravity_broadcast")} disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              <span>{gravityBroadcastCharging ? "广播天线发射中..." : "启动引力波广播 (消耗 2 AP)"}</span>
              <Zap size={12} className="text-purple-400 animate-pulse" />
            </button>
            <p className="text-[10px] text-zinc-400 leading-normal">
              开启广播蓄力。2 回合后将广播三体星系坐标，触发黑暗森林打击威慑，直接获得对决胜利。
            </p>
          </div>
        );

      case "bronze_age":
        return (
          <div className="flex flex-col gap-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">生存模式系统</h4>
            <button
              onClick={() => triggerSkillSelect("survival", false)}
              className={buttonClass("survival")}
            >
              <span>掠夺生存状态 (消耗 2 AP)</span>
              <Zap size={12} className="text-purple-400" />
            </button>
            <p className="text-[10px] text-zinc-400 leading-normal">
              献祭最多 50 点护盾，使该飞船下一次攻击力获得 1.5 倍爆发。
            </p>
          </div>
        );

      case "droplet":
        return (
          <div className="flex flex-col gap-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">水滴撞击推进</h4>
            <button
              onClick={() => triggerSkillSelect("droplet_pierce", true)}
              className={buttonClass("droplet_pierce")}
            >
              <span>锐角折返物理撞击 (消耗 3 AP)</span>
              <Zap size={12} className="text-orange-400" />
            </button>
            <p className="text-[10px] text-zinc-400 leading-normal">
              以万分之一光速沿直线冲刺最多 5 格，对路径上全部地球飞船造成 100 点强相互作用物理重装穿透伤害。
            </p>
          </div>
        );

      case "sophon":
        return (
          <div className="flex flex-col gap-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">十一维高维锁死</h4>
            <button
              onClick={() => triggerSkillSelect("sophon_lock", true)}
              className={buttonClass("sophon_lock")}
            >
              <span>质子多维锁定 (消耗 2 AP)</span>
              <Zap size={12} className="text-orange-400" />
            </button>
            <p className="text-[10px] text-zinc-400 leading-normal">
              对 3 格内某艘地球战舰注入微观质子锁死，阻断其聚变发电核心，使其完全瘫痪 2 回合。
            </p>
          </div>
        );

      default:
        return <p className="text-zinc-500 text-xs italic">该单位无可用特殊战术技能。</p>;
    }
  };

  return (
    <div className="flex h-full flex-col justify-between border-l border-zinc-800 bg-zinc-950/80 p-4 text-zinc-300 backdrop-blur-md">
      {/* Upper Section: Turn State & Unit Details */}
      <div className="flex flex-col gap-4">
        {/* Turn Header */}
        <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 shadow-inner">
          <div>
            <p className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">Round {round}</p>
            <h3
              className={`text-sm font-bold tracking-wide ${
                turn === "earth" ? "text-cyan-400" : "text-orange-400"
              }`}
            >
              {turn === "earth" ? "EDF (地球太空防御舰队)" : "三体星际先哨舰队"}
            </h3>
          </div>

          <div className="flex gap-2">
            {/* Sound controls */}
            <button
              onClick={toggleSound}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-indigo-500 hover:text-white"
            >
              {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            </button>

            {/* End Turn Button */}
            <button
              onClick={() => {
                if (soundEnabled) soundManager.playClick();
                endTurn();
              }}
              className="flex h-8 items-center gap-1.5 rounded-lg border border-indigo-600 bg-indigo-950/60 px-3 text-xs font-bold text-white hover:border-indigo-400 hover:bg-indigo-900/60 cursor-pointer"
            >
              <span>结束回合</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>

        {/* Selected Unit Details */}
        <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/40 p-3">
          {selectedUnit ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    selectedUnit.faction === "earth" ? "bg-cyan-400 animate-pulse" : "bg-orange-400 animate-pulse"
                  }`}
                />
                <span className="font-bold text-white text-sm tracking-wide">{selectedUnit.name}</span>
                <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                  {selectedUnit.faction === "earth" ? "地球" : "三体"}
                </span>
              </div>

              {/* Grid attributes */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 rounded bg-zinc-900/35 p-1.5">
                  <Heart size={12} className="text-rose-500" />
                  <span>
                    生命: <strong className="text-white">{selectedUnit.hp}/{selectedUnit.maxHp}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2 rounded bg-zinc-900/35 p-1.5">
                  <Shield size={12} className="text-blue-400" />
                  <span>
                    护盾: <strong className="text-white">{selectedUnit.shield}/{selectedUnit.maxShield}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2 rounded bg-zinc-900/35 p-1.5">
                  <Zap size={12} className="text-yellow-400" />
                  <span>
                    行动点: <strong className="text-white">{selectedUnit.ap}/{selectedUnit.maxAp} AP</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2 rounded bg-zinc-900/35 p-1.5">
                  <Crosshair size={12} className="text-teal-400" />
                  <span>
                    射程/威力: <strong className="text-white">{selectedUnit.range}/{selectedUnit.attack}</strong>
                  </span>
                </div>
              </div>

              {/* Status Indicators */}
              <div className="flex flex-wrap gap-1.5 text-[9px] font-mono">
                {selectedUnit.lockedTurns > 0 && (
                  <span className="rounded bg-orange-950/40 text-orange-400 border border-orange-500/20 px-2 py-0.5 animate-pulse">
                    ⚠️ 智子锁定 ({selectedUnit.lockedTurns}回)
                  </span>
                )}
                {selectedUnit.shieldLeak && (
                  <span className="rounded bg-purple-950/40 text-purple-400 border border-purple-500/20 px-2 py-0.5">
                    ⚙️ 四维空间泄露 (盾穿透)
                  </span>
                )}
                {selectedUnit.bronzeAgeEnraged && (
                  <span className="rounded bg-rose-950/40 text-rose-400 border border-rose-500/20 px-2 py-0.5">
                    ⚔️ 绝望狂暴 (攻+50%)
                  </span>
                )}
                {selectedUnit.type === "droplet" && (
                  <span className="rounded bg-zinc-800 text-zinc-300 border border-zinc-700 px-2 py-0.5">
                    🛡️ 强相互作用力外壳 (强固)
                  </span>
                )}
              </div>

              <hr className="border-zinc-800/80 my-1" />

              {/* Skill Buttons */}
              {renderUnitSkills(selectedUnit)}
            </div>
          ) : (
            <p className="text-zinc-500 text-xs italic text-center py-6">
              💡 鼠标点击星图上的战舰以显示其属性并执行技能行动。
            </p>
          )}
        </div>
      </div>

      {/* Middle/Lower Section: Action Logs */}
      <div className="mt-4 flex flex-1 flex-col gap-2 overflow-hidden border-t border-zinc-800/80 pt-4">
        <h4 className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">宇宙战术记录</h4>
        <div className="flex-1 overflow-y-auto rounded-lg border border-zinc-900/60 bg-zinc-950/60 p-2 text-[11px] font-mono leading-relaxed text-zinc-400">
          {actionLog.map((log, index) => (
            <div
              key={index}
              className={`py-1 border-b border-zinc-900/40 last:border-none ${
                log.includes("【警告】") || log.includes("摧毁")
                  ? "text-rose-400"
                  : log.includes("打出") || log.includes("面壁者")
                  ? "text-orange-300"
                  : log.includes("引力号") || log.includes("自然选择")
                  ? "text-cyan-300"
                  : "text-zinc-400"
              }`}
            >
              {log}
            </div>
          ))}
        </div>
      </div>

      {/* Footer controls: Back to menu */}
      <div className="mt-4 border-t border-zinc-800/80 pt-3">
        <button
          onClick={() => {
            if (soundEnabled) soundManager.playClick();
            resetToMenu();
          }}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/40 py-2 text-xs font-bold text-zinc-400 hover:border-zinc-700 hover:text-white transition-colors cursor-pointer"
        >
          <Home size={12} />
          <span>返回主菜单</span>
        </button>
      </div>
    </div>
  );
};
export default ControlPanel;

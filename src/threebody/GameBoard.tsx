// GameBoard.tsx - Interactive Tactical Star Map (10x8 grid)
import React, { useState } from "react";
import useGameStore, { type CellTerrain, type Faction } from "../store/gameStore";
import { AlertCircle, Target } from "lucide-react";

export const GameBoard: React.FC = () => {
  const {
    grid,
    units,
    selectedUnitId,
    turn,
    selectUnit,
    moveUnit,
    attackUnit,
    executeSkill,
    playCard,
  } = useGameStore();

  const [activeSkill, setActiveSkill] = useState<{
    unitId: string;
    skillType: string;
  } | null>(null);

  const [activeCardPlay, setActiveCardPlay] = useState<{
    cardId: string;
    faction: Faction;
  } | null>(null);

  const selectedUnit = units.find((u) => u.id === selectedUnitId);

  // Helper: calculate distance
  const getDistance = (x1: number, y1: number, x2: number, y2: number) => {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
  };

  // Determine what states a cell can have relative to the selected unit
  const getCellStatus = (x: number, y: number) => {
    if (!selectedUnit || selectedUnit.faction !== turn || selectedUnit.lockedTurns > 0) {
      return { isWalkable: false, isAttackable: false, isSkillTarget: false };
    }

    const distance = getDistance(selectedUnit.x, selectedUnit.y, x, y);
    const targetCell = grid[y]?.[x];
    if (!targetCell || targetCell.terrain === "asteroid" || targetCell.collapsed2d) {
      return { isWalkable: false, isAttackable: false, isSkillTarget: false };
    }

    // Check if cell is occupied by any unit
    const occupant = units.find((u) => u.x === x && u.y === y && u.hp > 0);

    // Skill highlight
    if (activeSkill) {
      const { skillType } = activeSkill;
      if (skillType === "droplet_pierce" || skillType === "fusion_dash") {
        // Must be in a straight line, distance limit
        const isLine = selectedUnit.x === x || selectedUnit.y === y;
        const maxDist = skillType === "droplet_pierce" ? 5 : 4;
        const isSkillTarget = isLine && distance > 0 && distance <= maxDist;
        return { isWalkable: false, isAttackable: false, isSkillTarget };
      }
      if (skillType === "sophon_lock") {
        // Can target earth unit within distance 3
        const isEarth = occupant && occupant.faction === "earth";
        const isSkillTarget = isEarth && distance <= 3;
        return { isWalkable: false, isAttackable: false, isSkillTarget };
      }
    }

    // Card play highlight
    if (activeCardPlay) {
      // Sophon unfold / Hines boost / Luo ji choice affect everyone, no target needed or target is anything
      if (activeCardPlay.cardId === "dual_vector_foil") {
        return { isWalkable: false, isAttackable: false, isCardTarget: true };
      }
      if (activeCardPlay.cardId === "four_d_pocket") {
        return { isWalkable: false, isAttackable: false, isCardTarget: true };
      }
      if (activeCardPlay.cardId === "mental_seal") {
        const isEarth = occupant && occupant.faction === "earth";
        return { isWalkable: false, isAttackable: false, isCardTarget: !!isEarth };
      }
      if (activeCardPlay.cardId === "three_suns") {
        return { isWalkable: false, isAttackable: false, isCardTarget: true };
      }
    }

    // Standard Movement
    // Cost calculation: anomaly takes +1 AP
    let apCost = distance;
    if (targetCell.terrain === "anomaly") {
      apCost += 1;
    }
    const isWalkable = !occupant && selectedUnit.ap >= apCost && distance > 0;

    // Standard Attack Range (incorporate solar wind range debuff)
    let actualRange = selectedUnit.range;
    const currentCell = grid[selectedUnit.y][selectedUnit.x];
    if (currentCell.terrain === "solar_wind") {
      actualRange = Math.max(1, actualRange - 1);
    }
    const isAttackable = occupant && occupant.faction !== turn && distance <= actualRange;

    return { isWalkable, isAttackable, isSkillTarget: false };
  };

  const handleCellClick = (x: number, y: number) => {
    const occupant = units.find((u) => u.x === x && u.y === y && u.hp > 0);

    // Card targets
    const activeCardId = (window as any)._activeCardId;
    if (activeCardId) {
      playCard(activeCardId, x, y);
      (window as any)._activeCardId = null;
      document.dispatchEvent(new CustomEvent("card-played"));
      return;
    }

    // Skill targets
    const activeSkillType = (window as any)._activeSkillType;
    if (selectedUnit && activeSkillType) {
      executeSkill(selectedUnit.id, activeSkillType, x, y);
      (window as any)._activeSkillType = null;
      document.dispatchEvent(new CustomEvent("skill-used"));
      return;
    }

    if (occupant) {
      if (occupant.faction === turn) {
        // Select own unit
        selectUnit(occupant.id);
      } else if (selectedUnit && selectedUnit.faction === turn && selectedUnit.lockedTurns === 0) {
        // Try to attack enemy
        const { isAttackable } = getCellStatus(x, y);
        if (isAttackable) {
          attackUnit(selectedUnit.id, occupant.id);
        } else {
          selectUnit(occupant.id); // View details instead
        }
      } else {
        selectUnit(occupant.id); // View details
      }
    } else if (selectedUnit && selectedUnit.faction === turn && selectedUnit.lockedTurns === 0) {
      // Try to move
      const { isWalkable } = getCellStatus(x, y);
      if (isWalkable) {
        moveUnit(selectedUnit.id, x, y);
      } else {
        selectUnit(null); // Deselect
      }
    } else {
      selectUnit(null);
    }
  };

  // Terrain Info helper
  const getTerrainStyle = (terrain: CellTerrain, collapsed2d: boolean) => {
    if (collapsed2d) {
      return "bg-white shadow-[0_0_15px_rgba(255,255,255,0.85)] border-white border-2 scale-[0.98] transition-all animate-pulse";
    }
    switch (terrain) {
      case "asteroid":
        return "bg-zinc-800 border-zinc-700/60 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-700 via-zinc-900 to-black";
      case "anomaly":
        return "bg-purple-950/20 border-purple-500/30 shadow-[inset_0_0_8px_rgba(167,139,250,0.15)]";
      case "solar_wind":
        return "bg-cyan-950/15 border-cyan-500/20 shadow-[inset_0_0_8px_rgba(34,211,238,0.15)]";
      default:
        return "bg-black/40 border-zinc-800/80 hover:bg-zinc-900/20";
    }
  };

  // Listen to skill / card events to refresh local visual states
  React.useEffect(() => {
    const handleSkillEvent = () => {
      if (selectedUnit) {
        setActiveSkill({
          unitId: selectedUnit.id,
          skillType: (window as any)._activeSkillType,
        });
      } else {
        setActiveSkill(null);
      }
    };

    const handleCardEvent = () => {
      const activeCardId = (window as any)._activeCardId;
      if (activeCardId) {
        setActiveCardPlay({
          cardId: activeCardId,
          faction: turn,
        });
      } else {
        setActiveCardPlay(null);
      }
    };

    document.addEventListener("skill-selected", handleSkillEvent);
    document.addEventListener("skill-used", () => {
      setActiveSkill(null);
      handleSkillEvent();
    });
    document.addEventListener("card-selected", handleCardEvent);
    document.addEventListener("card-played", () => {
      setActiveCardPlay(null);
      handleCardEvent();
    });

    return () => {
      document.removeEventListener("skill-selected", handleSkillEvent);
      document.removeEventListener("skill-used", handleSkillEvent);
      document.removeEventListener("card-selected", handleCardEvent);
      document.removeEventListener("card-played", handleCardEvent);
    };
  }, [selectedUnit, turn]);

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {/* Grid Canvas */}
      <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/70 p-3 shadow-2xl backdrop-blur-md">
        {/* Star Grid Overlay */}
        <div className="grid grid-cols-10 gap-1.5 md:gap-2 select-none">
          {grid.map((row, y) =>
            row.map((cell, x) => {
              const occupant = units.find((u) => u.x === x && u.y === y && u.hp > 0);
              const cellStatus = getCellStatus(x, y);
              
              // Custom active card highlight
              const isCardTarget = activeCardPlay && (
                (activeCardPlay.cardId === "dual_vector_foil" || activeCardPlay.cardId === "four_d_pocket" || activeCardPlay.cardId === "three_suns") ||
                (activeCardPlay.cardId === "mental_seal" && occupant && occupant.faction === "earth")
              );

              // Grid border highlights based on action range
              let overlayBorder = "";
              let cursorStyle = "cursor-default";

              if (cellStatus.isWalkable) {
                overlayBorder = "border-cyan-500/50 bg-cyan-900/10 hover:border-cyan-400";
                cursorStyle = "cursor-pointer";
              } else if (cellStatus.isAttackable) {
                overlayBorder = "border-red-500/60 bg-red-950/15 hover:border-red-400 animate-pulse";
                cursorStyle = "cursor-pointer";
              } else if (cellStatus.isSkillTarget) {
                overlayBorder = "border-purple-500/60 bg-purple-950/15 hover:border-purple-400 animate-pulse";
                cursorStyle = "cursor-pointer";
              } else if (isCardTarget) {
                overlayBorder = "border-orange-500/60 bg-orange-950/15 hover:border-orange-400 animate-pulse";
                cursorStyle = "cursor-pointer";
              }

              return (
                <div
                  key={`${x}-${y}`}
                  onClick={() => handleCellClick(x, y)}
                  className={`relative flex h-16 w-16 items-center justify-center rounded-lg border transition-all duration-200 md:h-20 md:w-20 ${getTerrainStyle(
                    cell.terrain,
                    cell.collapsed2d
                  )} ${overlayBorder} ${cursorStyle}`}
                >
                  {/* Terrain Indicators */}
                  {!cell.collapsed2d && cell.terrain === "asteroid" && (
                    <span className="absolute text-[10px] uppercase font-mono tracking-tighter text-zinc-500 bottom-1">
                      Asteroid
                    </span>
                  )}
                  {!cell.collapsed2d && cell.terrain === "anomaly" && (
                    <span className="absolute text-[9px] uppercase font-mono tracking-tighter text-purple-400/70 bottom-1">
                      引力异常
                    </span>
                  )}
                  {!cell.collapsed2d && cell.terrain === "solar_wind" && (
                    <span className="absolute text-[9px] uppercase font-mono tracking-tighter text-cyan-400/70 bottom-1">
                      恒星风暴
                    </span>
                  )}
                  {cell.collapsed2d && (
                    <span className="absolute text-[10px] uppercase font-extrabold tracking-widest text-zinc-950 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin">
                      2D
                    </span>
                  )}

                  {/* Coordinates overlay (very tiny in corners) */}
                  <span className="absolute top-1 left-1 text-[7px] font-mono text-zinc-600">
                    {x},{y}
                  </span>

                  {/* Highlight indicators inside grid */}
                  {cellStatus.isAttackable && (
                    <Target className="absolute text-red-500/60 animate-ping" size={24} />
                  )}

                  {/* Render Occupant Unit */}
                  {occupant && (
                    <div
                      className={`relative z-10 flex flex-col items-center justify-center p-1 w-full h-full transition-transform duration-300 ${
                        selectedUnitId === occupant.id
                          ? "ring-2 ring-indigo-500 rounded-md scale-105"
                          : ""
                      }`}
                    >
                      {/* Faction dot */}
                      <span
                        className={`absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full ${
                          occupant.faction === "earth" ? "bg-cyan-400" : "bg-orange-400"
                        }`}
                      />

                      {/* Sophon lock state indicator */}
                      {occupant.lockedTurns > 0 && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-lg bg-black/50 backdrop-blur-[0.5px]">
                          <AlertCircle className="text-orange-500 animate-bounce" size={20} />
                        </div>
                      )}

                      {/* Unit image mock or display */}
                      <img
                        src={
                          occupant.type === "droplet"
                            ? `${import.meta.env.BASE_URL}threebody/unit_droplet.jpg`
                            : occupant.type === "natural_selection"
                            ? `${import.meta.env.BASE_URL}threebody/unit_earth_battleship.jpg`
                            : occupant.type === "sophon"
                            ? `${import.meta.env.BASE_URL}threebody/unit_sophon.jpg`
                            : occupant.type === "dreadnought"
                            ? `${import.meta.env.BASE_URL}threebody/unit_trisolaran_dreadnought.jpg`
                            : `${import.meta.env.BASE_URL}threebody/unit_earth_battleship.jpg` // fallback for gravity and bronze age
                        }
                        alt={occupant.name}
                        className="h-10 w-10 md:h-12 md:w-12 rounded bg-zinc-950/40 border border-zinc-800 object-cover"
                      />

                      {/* Tiny unit type text */}
                      <span className="mt-1 text-[8px] text-center font-bold tracking-tighter text-zinc-300 truncate max-w-full">
                        {occupant.name.split(" ")[0]}
                      </span>

                      {/* HP/Shield bars at the bottom */}
                      <div className="absolute bottom-0.5 left-1 right-1 flex flex-col gap-[1px]">
                        {/* HP bar (green/red) */}
                        <div className="h-[2px] w-full bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500"
                            style={{ width: `${(occupant.hp / occupant.maxHp) * 100}%` }}
                          />
                        </div>
                        {/* Shield bar (blue) */}
                        {occupant.maxShield > 0 && (
                          <div className="h-[2px] w-full bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-400"
                              style={{ width: `${(occupant.shield / occupant.maxShield) * 100}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Quick guide under board */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-zinc-400 font-mono">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-zinc-800 border border-zinc-700" />
          <span>小行星 (阻挡弹道)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-purple-950/30 border border-purple-500/30" />
          <span>引力异常 (进入额外消耗 1 AP，受到伤害 +25%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-cyan-950/30 border border-cyan-500/20" />
          <span>恒星风暴 (-1射程，锁盾)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-white border border-zinc-400" />
          <span>二维坍缩格 (触碰即死)</span>
        </div>
      </div>
    </div>
  );
};
export default GameBoard;

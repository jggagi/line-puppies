// CardTray.tsx - Tactical Strategic Cards container
import React, { useState } from "react";
import useGameStore, { type Card } from "../store/gameStore";
import { soundManager } from "./SoundManager";

export const CardTray: React.FC = () => {
  const { turn, earthHand, trisolarisHand, playCard, soundEnabled } = useGameStore();

  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const activeHand = turn === "earth" ? earthHand : trisolarisHand;

  const handleCardClick = (card: Card) => {
    if (soundEnabled) {
      soundManager.playClick();
    }

    // Determine if card needs coordinate targeting
    const targetRequired =
      card.effectType === "dual_vector_foil" ||
      card.effectType === "four_d_pocket" ||
      card.effectType === "mental_seal" ||
      card.effectType === "three_suns";

    if (!targetRequired) {
      // Direct execute
      playCard(card.id);
      setSelectedCardId(null);
      (window as any)._activeCardId = null;
    } else {
      // Toggle selection and wait for GameBoard grid interaction
      if (selectedCardId === card.id) {
        setSelectedCardId(null);
        (window as any)._activeCardId = null;
      } else {
        setSelectedCardId(card.id);
        (window as any)._activeCardId = card.id;
      }
      document.dispatchEvent(new CustomEvent("card-selected"));
    }
  };

  // Reset local state when a card is played successfully
  React.useEffect(() => {
    const handlePlay = () => {
      setSelectedCardId(null);
    };
    document.addEventListener("card-played", handlePlay);
    return () => {
      document.removeEventListener("card-played", handlePlay);
    };
  }, []);

  return (
    <div className="border-t border-zinc-800 bg-zinc-950/90 px-6 py-4 backdrop-blur-md">
      <div className="flex flex-col gap-2.5">
        {/* Title */}
        <div className="flex items-center justify-between">
          <h4 className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">
            {turn === "earth" ? "面壁计划战略决策卡" : "三体高维降维决策卡"} (当前手牌: {activeHand.length}张)
          </h4>
          {selectedCardId && (
            <span className="text-[10px] font-bold text-orange-400 animate-pulse">
              🎯 请在星图上选择一个网格目标来打出该卡牌...
            </span>
          )}
        </div>

        {/* Cards list */}
        <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-zinc-800">
          {activeHand.length > 0 ? (
            activeHand.map((card) => {
              const isSelected = selectedCardId === card.id;
              return (
                <div
                  key={card.id}
                  onClick={() => handleCardClick(card)}
                  className={`
                    relative flex w-64 flex-shrink-0 cursor-pointer flex-col rounded-lg border p-2.5 transition-all duration-300 hover:-translate-y-1.5
                    ${
                      isSelected
                        ? "border-orange-500 bg-orange-950/15 shadow-[0_0_15px_rgba(249,115,22,0.25)] ring-1 ring-orange-500/20"
                        : "border-zinc-850 bg-zinc-900/40 hover:border-indigo-500/50 hover:bg-zinc-900/60"
                    }
                  `}
                >
                  {/* Card Art (Gemini Omni Generated) */}
                  <div className="relative mb-2 h-20 w-full overflow-hidden rounded border border-zinc-800/80 bg-black/50">
                    <img
                      src={card.image}
                      alt={card.name}
                      className="h-full w-full object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
                  </div>

                  {/* Card Info */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white tracking-wide truncate max-w-[150px]">
                        {card.name.split(" ")[0]}
                      </span>
                      <span
                        className={`text-[8px] font-mono font-bold px-1 rounded uppercase ${
                          card.faction === "earth"
                            ? "bg-cyan-950/60 text-cyan-400 border border-cyan-800/30"
                            : "bg-orange-950/60 text-orange-400 border border-orange-850/30"
                        }`}
                      >
                        {card.faction === "earth" ? "面壁者" : "三体科技"}
                      </span>
                    </div>
                    <p className="text-[10px] leading-relaxed text-zinc-400 mt-1 min-h-[30px] line-clamp-3">
                      {card.description}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-zinc-600 text-xs italic py-4">战略卡牌消耗殆尽，下个双数回合将自动补充新牌。</p>
          )}
        </div>
      </div>
    </div>
  );
};
export default CardTray;

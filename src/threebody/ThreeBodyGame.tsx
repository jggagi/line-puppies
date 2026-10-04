// ThreeBodyGame.tsx - Game entry assembly and victory overlay renderer
import React from "react";
import useGameStore from "../store/gameStore";
import IntroScreen from "./IntroScreen";
import GameBoard from "./GameBoard";
import ControlPanel from "./ControlPanel";
import CardTray from "./CardTray";
import soundManager from "./SoundManager";
import { Swords, RotateCcw, AlertTriangle, ShieldCheck, Zap } from "lucide-react";

export const ThreeBodyGame: React.FC = () => {
  const { status, initGame, resetToMenu, soundEnabled } = useGameStore();

  const handleRestart = () => {
    if (soundEnabled) soundManager.playClick();
    initGame(useGameStore.getState().gameMode);
  };

  const handleMenu = () => {
    if (soundEnabled) soundManager.playClick();
    resetToMenu();
  };

  // Render main game interface
  if (status === "menu") {
    return <IntroScreen />;
  }

  return (
    <div
      className="relative flex h-screen w-screen flex-col overflow-hidden bg-cover bg-center text-white"
      style={{ backgroundImage: `url('${import.meta.env.BASE_URL}threebody/bg_space.jpg')` }}
    >
      {/* Space darkness overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Main Layout container */}
      <div className="relative z-10 flex h-full w-full flex-col">
        {/* Top Header */}
        <header className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950/80 px-6 py-3 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <Swords size={20} className="text-indigo-400" />
            <h1 className="bg-gradient-to-r from-cyan-400 to-indigo-300 bg-clip-text text-lg font-black tracking-widest text-transparent uppercase">
              三体：末日之役
            </h1>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-4 text-xs font-mono">
            {useGameStore.getState().gravityBroadcastCharging && (
              <div className="flex items-center gap-1.5 rounded-full bg-red-950/40 text-red-400 border border-red-500/20 px-3 py-0.5 animate-pulse">
                <AlertTriangle size={12} />
                <span>重力波天线广播充能中 ({useGameStore.getState().gravityBroadcastTurns}/2)</span>
              </div>
            )}
            {useGameStore.getState().foilCenter && (
              <div className="flex items-center gap-1.5 rounded-full bg-orange-950/40 text-orange-400 border border-orange-500/20 px-3 py-0.5 animate-pulse">
                <AlertTriangle size={12} />
                <span>双向箔空间崩坍蔓延中 (半径 {useGameStore.getState().foilRadius})</span>
              </div>
            )}
          </div>
        </header>

        {/* Central Wargame Arena */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Area: map board */}
          <main className="flex flex-[3] flex-col items-center justify-center overflow-y-auto bg-zinc-950/30">
            <GameBoard />
          </main>

          {/* Right Area: stats panel, action log */}
          <aside className="w-80 flex-shrink-0">
            <ControlPanel />
          </aside>
        </div>

        {/* Bottom Area: active cards tray */}
        <footer>
          <CardTray />
        </footer>
      </div>

      {/* Overlays for Game Over states */}
      {status !== "playing" && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-6">
          <div className="max-w-md rounded-xl border border-zinc-800 bg-zinc-950/90 p-8 text-center shadow-2xl">
            {/* Victory state */}
            {status === "earth_win" && (
              <div className="flex flex-col items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                  <ShieldCheck size={36} />
                </div>
                <h2 className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-2xl font-black text-transparent tracking-wide">
                  地球防线胜利！
                </h2>
                <div className="my-2 h-36 w-full rounded border border-zinc-800 overflow-hidden bg-black/40">
                  <img
                    src={`${import.meta.env.BASE_URL}threebody/unit_earth_battleship.jpg`}
                    alt="Earth Victory"
                    className="h-full w-full object-cover opacity-80"
                  />
                </div>
                <p className="text-sm leading-relaxed text-zinc-400 font-mono">
                  “给岁月以文明，而不是给文明以岁月。”
                  <br />
                  人类太空舰队坚决抵御了三体前哨舰队的饱和式物理打击！水滴和主力战舰均被摧毁，地球赢得了喘息之机。
                </p>
              </div>
            )}

            {/* Defeat state */}
            {status === "trisolaris_win" && (
              <div className="flex flex-col items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-950/60 text-rose-400 border border-rose-500/30">
                  <AlertTriangle size={36} className="animate-pulse" />
                </div>
                <h2 className="bg-gradient-to-r from-rose-500 to-orange-400 bg-clip-text text-2xl font-black text-transparent tracking-wide">
                  地球舰队全军覆没！
                </h2>
                <div className="my-2 h-36 w-full rounded border border-zinc-800 overflow-hidden bg-black/40">
                  <img
                    src={`${import.meta.env.BASE_URL}threebody/unit_droplet.jpg`}
                    alt="Trisolaris Victory"
                    className="h-full w-full object-cover opacity-80"
                  />
                </div>
                <p className="text-sm leading-relaxed text-zinc-400 font-mono">
                  “毁灭你，与你何干？”
                  <br />
                  三体水滴的尖锐实体贯穿了地球每一艘战舰的反应堆。太空防御体系彻底瓦解，智子锁定全面就位，三体第二舰队正在驶入太阳系。
                </p>
              </div>
            )}

            {/* Deterrence state */}
            {status === "deterrence" && (
              <div className="flex flex-col items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-950/60 text-amber-400 border border-amber-500/30">
                  <Zap size={36} className="animate-bounce" />
                </div>
                <h2 className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-2xl font-black text-transparent tracking-wide">
                  重力波宇宙广播发射！
                </h2>
                <div className="my-2 h-36 w-full rounded border border-zinc-800 overflow-hidden bg-black/40">
                  <img
                    src={`${import.meta.env.BASE_URL}threebody/card_wallfacer.jpg`}
                    alt="Dark Forest Deterrence"
                    className="h-full w-full object-cover opacity-80"
                  />
                </div>
                <p className="text-sm leading-relaxed text-zinc-400 font-mono">
                  “如果我毁灭你，那我们就同归于尽。”
                  <br />
                  万有引力号成功发出引力波广播！太阳系和三体星系的绝对宇宙星图坐标已传向冰冷虚空。黑暗森林的终极猎手将被引来。三体主力舰队撤退，威慑和平达成，但两个文明的末日也已敲响。
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="mt-8 flex gap-4">
              <button
                onClick={handleRestart}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-600 py-3 text-sm font-bold text-white shadow-lg hover:bg-indigo-500 transition-colors cursor-pointer"
              >
                <RotateCcw size={16} />
                <span>再次挑战</span>
              </button>
              <button
                onClick={handleMenu}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 py-3 text-sm font-bold text-zinc-400 hover:border-zinc-500 hover:text-white transition-colors cursor-pointer"
              >
                <span>主菜单</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ThreeBodyGame;

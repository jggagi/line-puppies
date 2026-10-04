// IntroScreen.tsx - Landing Screen for the Three-Body Wargame
import React, { useState } from "react";
import useGameStore from "../store/gameStore";
import { Volume2, VolumeX, ShieldAlert, Cpu, Swords, BookOpen, X } from "lucide-react";

export const IntroScreen: React.FC = () => {
  const initGame = useGameStore((s) => s.initGame);
  const soundEnabled = useGameStore((s) => s.soundEnabled);
  const toggleSound = useGameStore((s) => s.toggleSound);

  const [showTutorial, setShowTutorial] = useState(false);

  const handleStart = (mode: "vs_ai" | "pass_and_play") => {
    initGame(mode);
  };

  return (
    <div
      className="relative flex h-screen w-screen flex-col items-center justify-center overflow-hidden bg-cover bg-center text-white"
      style={{ backgroundImage: `url('${import.meta.env.BASE_URL}threebody/bg_space.jpg')` }}
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px]" />

      {/* sound toggle top right */}
      <button
        onClick={toggleSound}
        className="absolute top-6 right-6 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900/80 text-zinc-300 hover:border-indigo-500 hover:text-white transition-colors"
      >
        {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
      </button>

      {/* Main Container */}
      <div className="relative z-10 flex max-w-4xl flex-col items-center px-6 text-center">
        {/* Subtitle / Universe context */}
        <p className="mb-3 text-xs tracking-[0.4em] text-indigo-400 font-bold uppercase">
          - Three-Body: Doomsday Battleground -
        </p>

        {/* Title */}
        <h1 className="mb-6 bg-gradient-to-r from-cyan-400 via-indigo-300 to-orange-400 bg-clip-text text-5xl font-black tracking-wider text-transparent md:text-7xl drop-shadow-[0_5px_15px_rgba(99,102,241,0.2)]">
          三体：末日之役
        </h1>

        <p className="mb-8 max-w-xl text-sm leading-relaxed text-zinc-400 md:text-base">
          “给岁月以文明，而不是给文明以岁月。”
          <br />
          水滴正以不可思议的强相互作用力刺穿地球战线。作为指挥官，你将抉择人类存亡，或是以无情的三体科技锁死太阳系。
        </p>

        {/* Factions side-by-side display */}
        <div className="mb-10 grid w-full grid-cols-1 gap-6 md:grid-cols-2">
          {/* Earth Faction info */}
          <div className="flex flex-col rounded-xl border border-cyan-500/25 bg-cyan-950/15 p-6 text-left backdrop-blur-md">
            <div className="mb-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              <h3 className="font-bold text-cyan-400 tracking-wide">地球太空防御舰队 (EDF)</h3>
            </div>
            <p className="text-xs leading-relaxed text-zinc-400">
              拥有恒星级战舰、引力号重力波发射源与太空堡垒。擅长利用中远距离电磁炮射击、核聚变冲锋，以及使用面壁者计划（罗辑威慑、思想印章等战略卡）反制敌人。
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-[10px] text-cyan-300/80">
              <span className="rounded bg-cyan-950/40 px-2 py-0.5 border border-cyan-500/20">自然选择号</span>
              <span className="rounded bg-cyan-950/40 px-2 py-0.5 border border-cyan-500/20">引力号</span>
              <span className="rounded bg-cyan-950/40 px-2 py-0.5 border border-cyan-500/20">面壁卡牌</span>
            </div>
          </div>

          {/* Trisolaris Faction info */}
          <div className="flex flex-col rounded-xl border border-orange-500/25 bg-orange-950/15 p-6 text-left backdrop-blur-md">
            <div className="mb-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-orange-400 animate-pulse" />
              <h3 className="font-bold text-orange-400 tracking-wide">三体星际前哨舰队</h3>
            </div>
            <p className="text-xs leading-relaxed text-zinc-400">
              凭借强相互作用力“水滴”、多维“智子”和主力战舰，以绝对科技压制对手。水滴拥有无可比拟的物理穿透撞击力，亦可使用毁灭性的“双向箔”执行降维打击。
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-[10px] text-orange-300/80">
              <span className="rounded bg-orange-950/40 px-2 py-0.5 border border-orange-500/20">强相互作用水滴</span>
              <span className="rounded bg-orange-950/40 px-2 py-0.5 border border-orange-500/20">智子锁定</span>
              <span className="rounded bg-orange-950/40 px-2 py-0.5 border border-orange-500/20">双向箔</span>
            </div>
          </div>
        </div>

        {/* Buttons / Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-xl">
          {/* Mode 1 */}
          <button
            onClick={() => handleStart("vs_ai")}
            className="group flex flex-1 items-center justify-center gap-3 rounded-lg border border-indigo-500/50 bg-gradient-to-r from-indigo-950 to-indigo-900 px-5 py-3.5 font-bold text-white shadow-[0_0_15px_rgba(99,102,241,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-400 hover:shadow-[0_0_25px_rgba(99,102,241,0.4)] cursor-pointer text-sm"
          >
            <Cpu size={16} className="text-indigo-400 group-hover:scale-110 transition-transform" />
            <span className="tracking-wide">单人对战 (VS 智子AI)</span>
          </button>

          {/* Mode 2 */}
          <button
            onClick={() => handleStart("pass_and_play")}
            className="group flex flex-1 items-center justify-center gap-3 rounded-lg border border-zinc-700 bg-zinc-900/80 px-5 py-3.5 font-bold text-zinc-300 transition-all duration-300 hover:-translate-y-0.5 hover:border-zinc-500 hover:text-white cursor-pointer text-sm"
          >
            <Swords size={16} className="text-zinc-400 group-hover:scale-110 transition-transform" />
            <span className="tracking-wide">双人同屏 (热席对战)</span>
          </button>

          {/* Tutorial Button */}
          <button
            onClick={() => setShowTutorial(true)}
            className="group flex items-center justify-center gap-2 rounded-lg border border-cyan-700/50 bg-cyan-950/30 px-5 py-3.5 font-bold text-cyan-300 hover:border-cyan-500 hover:text-white hover:bg-cyan-950/60 cursor-pointer text-sm transition-all duration-300"
          >
            <BookOpen size={16} className="text-cyan-400 group-hover:scale-115 transition-transform" />
            <span>新手指南</span>
          </button>
        </div>

        <p className="mt-4 max-w-xl text-center text-[11px] text-zinc-500">
          对局为临时状态，刷新或返回主菜单后会重新开局。
        </p>

        {/* Footer info */}
        <div className="mt-12 flex items-center justify-center gap-2 text-xs text-zinc-500">
          <ShieldAlert size={14} className="text-indigo-500/60" />
          <span>战略威慑提示：黑暗森林威慑随时可能被重力波广播触发。</span>
        </div>
      </div>

      {/* Tutorial Modal */}
      {showTutorial && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="relative flex h-[85vh] w-full max-w-3xl flex-col rounded-xl border border-zinc-800 bg-zinc-950/95 p-6 text-zinc-300 shadow-2xl">
            {/* Close button */}
            <button
              onClick={() => setShowTutorial(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white hover:bg-zinc-900 p-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="mb-4 flex items-center gap-2 border-b border-zinc-800 pb-3">
              <BookOpen className="text-cyan-400" />
              <h2 className="text-xl font-bold text-white tracking-wide">《三体：末日之役》新手战术指南</h2>
            </div>

            {/* Scrollable body content */}
            <div className="flex-1 overflow-y-auto pr-2 text-sm leading-relaxed text-zinc-400 space-y-5 font-mono select-text">
              <section>
                <h3 className="text-sm font-bold text-cyan-400 mb-1 border-l-2 border-cyan-500 pl-2">1. 基础机制 (Round & AP)</h3>
                <p className="text-xs">
                  - 游戏以**回合制**进行。每回合开始时，你将获得 **AP (行动点数)**。
                  <br />
                  - 行动花费：**移动** 消耗距离 AP (进入引力异常格额外消耗 1 AP)；**普通射击** 消耗 1 AP；**特色技能** 消耗 2 到 3 AP。
                  <br />
                  - **护盾防御**：护盾优先承受伤害。若在没有星风暴的地格上结束回合，飞船将自动恢复部分护盾。
                </p>
              </section>

              <section>
                <h3 className="text-sm font-bold text-cyan-400 mb-1 border-l-2 border-cyan-500 pl-2">2. 星区天体地形</h3>
                <div className="grid grid-cols-2 gap-3 text-xs bg-zinc-900/40 p-3 rounded-lg border border-zinc-900">
                  <div>
                    <strong className="text-zinc-300">☄️ 小行星带 (Asteroids)</strong>
                    <p className="text-zinc-500">不可穿越，且阻挡远程炮火射线，是理想的防护掩体。</p>
                  </div>
                  <div>
                    <strong className="text-purple-400">🌌 引力异常区 (Anomaly)</strong>
                    <p className="text-zinc-500">进入时额外消耗 1 AP，且处于其中的飞船所受伤害增加 25%。</p>
                  </div>
                  <div>
                    <strong className="text-cyan-400">💨 恒星风暴 (Solar Wind)</strong>
                    <p className="text-zinc-500">粒子风暴干扰射控，使飞船攻击射程减少 1 格，并锁死护盾恢复。</p>
                  </div>
                  <div>
                    <strong className="text-white animate-pulse">⏹️ 二维坍缩格 (2D Space)</strong>
                    <p className="text-zinc-500">由双向箔引发的不可逆降维，触碰到的任何飞船瞬间被消灭。</p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-sm font-bold text-cyan-400 mb-1 border-l-2 border-cyan-500 pl-2">3. 地球防线 (EDF) 特色技能与战术</h3>
                <ul className="list-disc pl-4 text-xs space-y-1.5">
                  <li><strong className="text-zinc-300">自然选择号 (旗舰)</strong>：可开启 `无工质核聚变过载`，直线突进4格对路径上敌机造成 35 点无视护盾的物理穿透伤害。</li>
                  <li><strong className="text-zinc-300">万有引力号 (广播源)</strong>：可充电开启 `引力波宇宙广播`，保护该机存活 2 回合，将自动达成黑暗森林坐标威慑，强制地球方获胜。</li>
                  <li><strong className="text-zinc-300">青铜时代号 (巡洋舰)</strong>：可启动 `掠夺生存` 扣减护盾以爆发出 1.5 倍的极限攻击威力。</li>
                  <li><strong className="text-zinc-300">太空堡垒 (移动要塞)</strong>：不可移动，但射程高达 5，血量极厚，是后方最稳固的支撑。</li>
                  <li><strong className="text-zinc-300">面壁卡牌</strong>：如【罗辑的威慑】可强行让三体军团本回合完全瘫痪；【思想印章】可大幅提升单体攻击和AP上限。</li>
                </ul>
              </section>

              <section>
                <h3 className="text-sm font-bold text-orange-400 mb-1 border-l-2 border-orange-500 pl-2">4. 三体舰队 特色科技与战术</h3>
                <ul className="list-disc pl-4 text-xs space-y-1.5">
                  <li><strong className="text-zinc-300">强相互作用水滴 (Melee)</strong>：只有 1 格攻击范围（近身撞击），但其 `锐角折返物理撞击` 技能可在直线上突防 5 格，对路径上全部人类战舰造成 100 点毁灭性物理冲击。弱点是破盾后近距离受击伤害翻倍。</li>
                  <li><strong className="text-zinc-300">智子 (Scout)</strong>：可进行 `质子多维锁定` 瘫痪敌舰 2 回合。</li>
                  <li><strong className="text-zinc-300">三体主力战舰</strong>：搭载超远反物质射线炮。</li>
                  <li><strong className="text-zinc-300">三体降维卡牌</strong>：【双向箔】将在棋盘扔下一个降维斑块，并会在每回合结束自动扩散1格，碾碎一切在场飞船；【三日凌空】可选择 3x3 进行无差别大面积核热风暴打击。</li>
                </ul>
              </section>
            </div>

            <div className="mt-4 border-t border-zinc-800 pt-3 text-center">
              <button
                onClick={() => setShowTutorial(false)}
                className="rounded-lg bg-indigo-600 px-6 py-2 text-xs font-bold text-white hover:bg-indigo-500 cursor-pointer"
              >
                已了解，准备威慑
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default IntroScreen;

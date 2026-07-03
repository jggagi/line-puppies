import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { AppHeader } from "./components/layout/AppHeader";
import { ThreePaneLayout } from "./components/layout/ThreePaneLayout";
import { ChangeTray } from "./components/layout/ChangeTray";
import { AppTree } from "./components/tree/AppTree";
import { AppGraphCanvas } from "./components/graph/AppGraphCanvas";
import { Inspector } from "./components/inspector/Inspector";
import { TrajectoryPlayer } from "./components/trajectory/TrajectoryPlayer";
import { useAppStore } from "./store/useAppStore";

function App() {
  const [resetSignal, setResetSignal] = useState(0);
  const trajectoryId = useAppStore((s) => s.trajectoryPlayer.trajectoryId);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden">
      <AppHeader onResetLayout={() => setResetSignal((n) => n + 1)} />
      <ThreePaneLayout
        left={<AppTree />}
        center={
          <>
            <AppGraphCanvas resetSignal={resetSignal} />
            <AnimatePresence>
              {trajectoryId && <TrajectoryPlayer />}
            </AnimatePresence>
          </>
        }
        right={<Inspector />}
        bottom={<ChangeTray />}
      />
    </div>
  );
}

export default App;

import { create } from "zustand";
import { baselineGraph } from "../data/baselineGraph";
import { batteryHealthPatch } from "../data/batteryHealthPatch";
import { applyGraphPatch } from "../graph/applyGraphPatch";

export type Branch = "main" | "feature/battery-health";
export type ViewMode = "product" | "runtime" | "change";

interface TrajectoryPlayerState {
  trajectoryId?: string;
  currentStepIndex: number;
  playing: boolean;
}

interface AppStore {
  branch: Branch;
  viewMode: ViewMode;
  changeTrayOpen: boolean;

  selectedNodeId?: string;
  selectedEdgeId?: string;
  selectedFlowId?: string;

  expandedTreeNodeIds: Set<string>;

  searchQuery: string;

  trajectoryPlayer: TrajectoryPlayerState;

  setBranch: (branch: Branch) => void;
  setViewMode: (mode: ViewMode) => void;
  setChangeTrayOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;

  selectNode: (nodeId: string) => void;
  selectEdge: (edgeId: string) => void;
  selectFlow: (flowId: string | undefined) => void;
  clearSelection: () => void;

  toggleTreeNode: (nodeId: string) => void;
  setTreeExpanded: (ids: string[]) => void;

  startTrajectory: (trajectoryId: string) => void;
  closeTrajectory: () => void;
  pauseTrajectory: () => void;
  togglePlay: () => void;
  setTrajectoryStep: (index: number) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  branch: "main",
  viewMode: "product",
  changeTrayOpen: false,
  selectedNodeId: "settings",
  selectedEdgeId: undefined,
  selectedFlowId: undefined,
  expandedTreeNodeIds: new Set(["settings"]),

  searchQuery: "",

  trajectoryPlayer: { currentStepIndex: 0, playing: false },

  setBranch: (branch) =>
    set(() => {
      if (branch === "feature/battery-health") {
        const active = applyGraphPatch(baselineGraph, batteryHealthPatch);
        const target = active.nodes.find((n) => n.id === "battery-health");
        const battery = active.nodes.find((n) => n.id === "battery");
        const expanded = new Set<string>(["settings", "battery"]);
        if (battery) expanded.add("battery");
        return {
          branch,
          viewMode: "change",
          changeTrayOpen: true,
          selectedNodeId: target?.id ?? "battery-health",
          selectedEdgeId: "battery->battery-health",
          selectedFlowId: "flow-battery-health",
          expandedTreeNodeIds: expanded,
        };
      }
      return {
        branch,
        viewMode: "product",
        changeTrayOpen: false,
        selectedNodeId: "settings",
        selectedEdgeId: undefined,
        selectedFlowId: undefined,
      };
    }),

  setViewMode: (viewMode) => set({ viewMode }),
  setChangeTrayOpen: (changeTrayOpen) => set({ changeTrayOpen }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  selectNode: (nodeId) =>
    set({ selectedNodeId: nodeId, selectedEdgeId: undefined }),
  selectEdge: (edgeId) => set({ selectedEdgeId: edgeId }),
  selectFlow: (flowId) =>
    set({ selectedFlowId: flowId, selectedNodeId: undefined, selectedEdgeId: undefined }),
  clearSelection: () =>
    set({ selectedNodeId: undefined, selectedEdgeId: undefined, selectedFlowId: undefined }),

  toggleTreeNode: (nodeId) =>
    set((state) => {
      const next = new Set(state.expandedTreeNodeIds);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return { expandedTreeNodeIds: next };
    }),
  setTreeExpanded: (ids) =>
    set(() => ({ expandedTreeNodeIds: new Set(ids) })),

  startTrajectory: (trajectoryId) =>
    set(() => ({
      trajectoryPlayer: {
        trajectoryId,
        currentStepIndex: 0,
        playing: true,
      },
      viewMode: "runtime",
    })),
  closeTrajectory: () =>
    set(() => ({
      trajectoryPlayer: { currentStepIndex: 0, playing: false },
    })),
  pauseTrajectory: () =>
    set((state) => ({
      trajectoryPlayer: { ...state.trajectoryPlayer, playing: false },
    })),
  togglePlay: () =>
    set((state) => ({
      trajectoryPlayer: {
        ...state.trajectoryPlayer,
        playing: !state.trajectoryPlayer.playing,
      },
    })),
  setTrajectoryStep: (index) =>
    set((state) => ({
      trajectoryPlayer: { ...state.trajectoryPlayer, currentStepIndex: index },
    })),
}));

export type NodeType = "app" | "screen" | "state" | "dialog" | "system";

export type VerificationStatus =
  | "source-only"
  | "observed"
  | "verified"
  | "failed";

export type ChangeType = "unchanged" | "added" | "modified" | "removed";

export type ActionType =
  | "tap"
  | "back"
  | "toggle"
  | "system"
  | "deeplink"
  | "automatic";

export interface SourceRef {
  file: string;
  symbol?: string;
  line?: number;
}

export interface RuntimeRef {
  trajectoryId: string;
  stepId: string;
  device: string;
  androidVersion: string;
}

export interface ScreenshotRef {
  id: string;
  /** Key into the screenshot registry, rendered as an SVG scene. */
  sceneKey: string;
  label: string;
}

export interface AppNode {
  id: string;
  parentId?: string;
  type: NodeType;
  name: string;
  description?: string;
  sourceRefs: SourceRef[];
  runtimeRefs: RuntimeRef[];
  screenshots: ScreenshotRef[];
  stateCondition?: string;
  verificationStatus: VerificationStatus;
  changeType: ChangeType;
  metadata?: Record<string, string | number | boolean>;
}

export interface AppEdge {
  id: string;
  from: string;
  to: string;
  action: string;
  actionType: ActionType;
  selector?: string;
  sourceRefs: SourceRef[];
  observed: boolean;
  verified: boolean;
  changeType: ChangeType;
}

export interface AppFlow {
  id: string;
  name: string;
  nodeIds: string[];
  edgeIds: string[];
}

export interface AppGraph {
  appId: string;
  name: string;
  branch: string;
  nodes: AppNode[];
  edges: AppEdge[];
  flows: AppFlow[];
}

export interface TrajectoryStep {
  id: string;
  timestampMs: number;
  screenshotId: string;
  nodeId: string;
  edgeId?: string;
  action?: {
    type: "tap" | "swipe" | "back" | "wait";
    x?: number;
    y?: number;
    label?: string;
  };
}

export interface Trajectory {
  id: string;
  name: string;
  device: string;
  androidVersion: string;
  durationMs: number;
  steps: TrajectoryStep[];
}

export interface GraphPatch {
  id: string;
  name: string;
  branch: string;
  description: string;
  addedNodes: AppNode[];
  modifiedNodes: Array<{ nodeId: string; changes: Partial<AppNode> }>;
  removedNodeIds: string[];
  addedEdges: AppEdge[];
  modifiedEdges: Array<{ edgeId: string; changes: Partial<AppEdge> }>;
  removedEdgeIds: string[];
  changedFiles: SourceRef[];
}

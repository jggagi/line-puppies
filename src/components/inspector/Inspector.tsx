import { useMemo } from "react";
import { CircleSlash } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { baselineGraph } from "../../data/baselineGraph";
import { batteryHealthPatch } from "../../data/batteryHealthPatch";
import { applyGraphPatch } from "../../graph/applyGraphPatch";
import { getNode, getEdge } from "../../graph/graphSelectors";
import { EmptyState } from "../common/EmptyState";
import { InspectorNodeView } from "./NodeInspector";
import { InspectorEdgeView } from "./EdgeInspector";

export function Inspector() {
  const branch = useAppStore((s) => s.branch);
  const selectedNodeId = useAppStore((s) => s.selectedNodeId);
  const selectedEdgeId = useAppStore((s) => s.selectedEdgeId);

  const graph = useMemo(
    () =>
      branch === "feature/battery-health"
        ? applyGraphPatch(baselineGraph, batteryHealthPatch)
        : baselineGraph,
    [branch],
  );

  const node = getNode(graph, selectedNodeId);
  const edge = getEdge(graph, selectedEdgeId);

  if (edge && !node) {
    return <InspectorEdgeView edge={edge} graph={graph} />;
  }

  if (!node) {
    return (
      <EmptyState
        icon={<CircleSlash size={28} />}
        title="Nothing selected"
        description="Pick a screen, state, or transition to inspect its source mapping and runtime evidence."
      />
    );
  }

  return <InspectorNodeView node={node} graph={graph} />;
}

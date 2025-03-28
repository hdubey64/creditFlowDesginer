import { create } from "zustand";
import { Node, Edge } from "@xyflow/react";

interface WorkflowState {
   nodes: Node[];
   edges: Edge[];
   selectedNode: Node | null;
   validationErrors: Record<string, string[]>;
   history: { nodes: Node[]; edges: Edge[] }[];
   historyIndex: number;
   setNodes: (nodes: Node[]) => void;
   setEdges: (edges: Edge[]) => void;
   setSelectedNode: (node: Node | null) => void;
   addHistoryEntry: (nodes: Node[], edges: Edge[]) => void;
   undo: () => void;
   redo: () => void;
   validateWorkflow: () => boolean;
   exportWorkflow: () => string;
   importWorkflow: (data: string) => void;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
   nodes: [],
   edges: [],
   selectedNode: null,
   validationErrors: {},
   history: [],
   historyIndex: -1,

   setNodes: (nodes) => set({ nodes }),
   setEdges: (edges) => set({ edges }),
   setSelectedNode: (node) => set({ selectedNode: node }),

   addHistoryEntry: (nodes, edges) => {
      const { history, historyIndex } = get();
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push({ nodes, edges });
      set({
         history: newHistory,
         historyIndex: newHistory.length - 1,
      });
   },

   undo: () => {
      const { history, historyIndex } = get();
      if (historyIndex > 0) {
         const newIndex = historyIndex - 1;
         const { nodes, edges } = history[newIndex];
         set({
            nodes,
            edges,
            historyIndex: newIndex,
         });
      }
   },

   redo: () => {
      const { history, historyIndex } = get();
      if (historyIndex < history.length - 1) {
         const newIndex = historyIndex + 1;
         const { nodes, edges } = history[newIndex];
         set({
            nodes,
            edges,
            historyIndex: newIndex,
         });
      }
   },

   validateWorkflow: () => {
      const { nodes, edges } = get();
      const errors: Record<string, string[]> = {};

      // Validate start node
      if (
         !nodes.some(
            (node) => node.type === "userInput" || node.type === "apiInput"
         )
      ) {
         errors["workflow"] = ["Workflow must start with an input node"];
      }

      // Validate end nodes
      if (
         !nodes.some((node) =>
            ["approval", "rejection", "review"].includes(node.type || "")
         )
      ) {
         errors["workflow"] = [
            ...(errors["workflow"] || []),
            "Workflow must have at least one end node",
         ];
      }

      // Validate connections
      nodes.forEach((node) => {
         const nodeEdges = edges.filter(
            (edge) => edge.source === node.id || edge.target === node.id
         );
         if (nodeEdges.length === 0) {
            errors[node.id] = ["Node must be connected"];
         }
      });

      set({ validationErrors: errors });
      return Object.keys(errors).length === 0;
   },

   exportWorkflow: () => {
      const { nodes, edges } = get();
      return JSON.stringify({ nodes, edges }, null, 2);
   },

   importWorkflow: (data) => {
      try {
         const { nodes, edges } = JSON.parse(data);
         set({ nodes, edges });
         get().addHistoryEntry(nodes, edges);
      } catch (error) {
         console.error("Failed to import workflow:", error);
      }
   },
}));

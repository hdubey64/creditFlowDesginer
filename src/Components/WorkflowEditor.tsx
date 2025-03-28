import { useCallback, useState, useRef } from "react";
import {
   ReactFlow,
   Background,
   Controls,
   MiniMap,
   useNodesState,
   useEdgesState,
   addEdge,
   Connection,
   Edge,
   Node,
   NodeChange,
   EdgeChange,
   XYPosition,
   useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import CreditNode from "./Node/CreditNote";
import { useWorkflowStore } from "../store/workflowStore";
import NodeConfiguration from "./NodeConfiguration";
import TestPanel from "./TestPanel";

const nodeTypes = {
   userInput: CreditNode,
   apiInput: CreditNode,
   creditCheck: CreditNode,
   scoreCalculation: CreditNode,
   condition: CreditNode,
   approval: CreditNode,
   rejection: CreditNode,
   review: CreditNode,
};

function WorkflowEditor() {
   const reactFlowWrapper = useRef<HTMLDivElement>(null);
   const { screenToFlowPosition } = useReactFlow();
   const store = useWorkflowStore();
   const [isTestMode, setIsTestMode] = useState(false);
   const [testData, setTestData] = useState<Record<string, any>>({});

   const onConnect = useCallback(
      (params: Connection | Edge) => {
         const newEdge = addEdge(params, store.edges);
         store.setEdges(newEdge);
         store.addHistoryEntry(store.nodes, newEdge);
      },
      [store]
   );

   const onDragOver = useCallback((event: React.DragEvent) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
   }, []);

   const onDrop = useCallback(
      (event: React.DragEvent) => {
         event.preventDefault();

         const type = event.dataTransfer.getData("application/reactflow");

         if (!type) return;

         // Get the position relative to the flow container
         const position = screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
         });

         const newNode: Node = {
            id: `${type}-${Date.now()}`,
            type,
            position,
            data: {
               label: type.charAt(0).toUpperCase() + type.slice(1),
               description: `New ${type} node`,
            },
         };

         store.setNodes([...store.nodes, newNode]);
         store.addHistoryEntry([...store.nodes, newNode], store.edges);
      },
      [screenToFlowPosition, store]
   );

   const handleTestWorkflow = useCallback(() => {
      if (!store.validateWorkflow()) {
         alert("Please fix validation errors before testing");
         return;
      }

      setIsTestMode(true);
      setTestData({});
   }, [store]);

   const handleTestNodeSubmit = useCallback(
      (nodeId: string, data: any) => {
         setTestData((prev) => ({
            ...prev,
            [nodeId]: data,
         }));

         // Find next nodes to process
         const outgoingEdges = store.edges.filter(
            (edge) => edge.source === nodeId
         );
         const nextNodes = outgoingEdges
            .map((edge) => store.nodes.find((node) => node.id === edge.target))
            .filter(Boolean);

         // Process next nodes based on conditions and test data
         nextNodes.forEach((node) => {
            if (node?.type === "condition") {
               // Evaluate condition based on test data
               const conditionResult = evaluateCondition(node, testData);
               // Update test data with condition result
               setTestData((prev) => ({
                  ...prev,
                  [node.id]: conditionResult,
               }));
            }
         });
      },
      [store.edges, store.nodes, testData]
   );

   const evaluateCondition = (node: Node, testData: Record<string, any>) => {
      const { condition, value } = node.data;
      const inputValue = testData[node.id];

      switch (condition) {
         case "equals":
            return inputValue === value;
         case "greater":
            return Number(inputValue) > Number(value);
         case "less":
            return Number(inputValue) < Number(value);
         default:
            return false;
      }
   };

   const onNodesChange = useCallback(
      (changes: NodeChange[]) => {
         const updatedNodes = changes.reduce(
            (acc: Node[], change: NodeChange) => {
               if (change.type === "position" && change.position) {
                  return acc.map((node) =>
                     node.id === change.id
                        ? { ...node, position: change.position as XYPosition }
                        : node
                  );
               }
               return acc;
            },
            [...store.nodes]
         );
         store.setNodes(updatedNodes);
         store.addHistoryEntry(updatedNodes, store.edges);
      },
      [store]
   );

   const onEdgesChange = useCallback(
      (changes: EdgeChange[]) => {
         const updatedEdges = changes.reduce(
            (acc: Edge[], change: EdgeChange) => {
               if (change.type === "remove") {
                  return acc.filter((edge) => edge.id !== change.id);
               }
               return acc;
            },
            [...store.edges]
         );
         store.setEdges(updatedEdges);
         store.addHistoryEntry(store.nodes, updatedEdges);
      },
      [store]
   );

   return (
      <div className="flex flex-1">
         <div className="flex-1" ref={reactFlowWrapper}>
            <ReactFlow
               nodes={store.nodes}
               edges={store.edges}
               onNodesChange={onNodesChange}
               onEdgesChange={onEdgesChange}
               onConnect={onConnect}
               onDragOver={onDragOver}
               onDrop={onDrop}
               onNodeClick={(_: React.MouseEvent, node: Node) =>
                  store.setSelectedNode(node)
               }
               nodeTypes={nodeTypes}
               fitView
            >
               <Background />
               <Controls />
               <MiniMap />
            </ReactFlow>
         </div>
         {store.selectedNode && <NodeConfiguration node={store.selectedNode} />}
         {isTestMode && (
            <TestPanel
               nodes={store.nodes}
               testData={testData}
               onNodeSubmit={handleTestNodeSubmit}
               onClose={() => setIsTestMode(false)}
            />
         )}
      </div>
   );
}

export default WorkflowEditor;

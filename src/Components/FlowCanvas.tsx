import React, { useCallback, useRef, useState } from "react";
import {
   ReactFlow,
   addEdge,
   useNodesState,
   useEdgesState,
   Controls,
   Background,
   MiniMap,
   Handle,
   Position,
   useReactFlow,
   Connection,
   Edge,
   Node,
   NodeChange,
   EdgeChange,
   XYPosition,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import BpmnModdle from "bpmn-moddle";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import Sidebar from "./Sidebar";

let nodeIdCounter = 0;
function getId() {
   return `node_${nodeIdCounter++}`;
}

interface NodeData extends Record<string, unknown> {
   label?: string;
   inputVars?: string[];
}

const DefaultNode = ({ data }: { data: NodeData }) => (
   <div
      style={{
         padding: 10,
         border: "1px solid #ccc",
         borderRadius: 6,
         background: "#fff",
      }}
   >
      <Handle
         type="target"
         position={Position.Top}
         style={{ background: "#555" }}
      />
      <strong>{data.label}</strong>
      <Handle
         type="source"
         position={Position.Bottom}
         style={{ background: "#555" }}
      />
   </div>
);

const nodeTypes = {
   decision: DefaultNode,
   human: DefaultNode,
   validate: DefaultNode,
};

const FlowCanvas = () => {
   const reactFlowWrapper = useRef<HTMLDivElement>(null);
   const [nodes, setNodes, onNodesChange] = useNodesState<Node<NodeData>>([]);
   const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
   const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
   const [selectedNode, setSelectedNode] = useState<Node<NodeData> | null>(
      null
   );
   const { screenToFlowPosition } = useReactFlow();

   const onConnect = useCallback(
      (params: Connection) => {
         setEdges((eds) => addEdge({ ...params, animated: true }, eds));
      },
      [setEdges]
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

         const position = screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
         });

         const labelMap: Record<string, string> = {
            decision: "Decisión de Crédito",
            human: "Tarea Humana",
            validate: "Validación",
         };

         const newNode: Node<NodeData> = {
            id: getId(),
            type,
            position,
            data: {
               label: labelMap[type] || type,
               inputVars: [],
            },
         };

         setNodes((nds) => [...nds, newNode]);
      },
      [screenToFlowPosition, setNodes]
   );

   const onNodeClick = useCallback(
      (_: React.MouseEvent, node: Node<NodeData>) => {
         setSelectedNode(node);
      },
      []
   );

   const updateSelectedNodeData = useCallback(
      (key: keyof NodeData, value: any) => {
         if (!selectedNode) return;
         setNodes((nds) =>
            nds.map((n) =>
               n.id === selectedNode.id
                  ? { ...n, data: { ...n.data, [key]: value } }
                  : n
            )
         );
         setSelectedNode((prev) => {
            if (!prev) return null;
            return {
               ...prev,
               data: { ...prev.data, [key]: value },
            };
         });
      },
      [selectedNode, setNodes]
   );

   const addInputVar = useCallback(() => {
      if (!selectedNode) return;
      const newVars = [...(selectedNode.data.inputVars || []), ""];
      updateSelectedNodeData("inputVars", newVars);
   }, [selectedNode, updateSelectedNodeData]);

   const updateInputVar = useCallback(
      (index: number, value: string) => {
         if (!selectedNode) return;
         const newVars = [...(selectedNode.data.inputVars || [])];
         newVars[index] = value;
         updateSelectedNodeData("inputVars", newVars);
      },
      [selectedNode, updateSelectedNodeData]
   );

   const removeInputVar = useCallback(
      (index: number) => {
         if (!selectedNode) return;
         const newVars = [...(selectedNode.data.inputVars || [])];
         newVars.splice(index, 1);
         updateSelectedNodeData("inputVars", newVars);
      },
      [selectedNode, updateSelectedNodeData]
   );

   const exportToBpmn = async () => {
      const moddle = new BpmnModdle();
      const process = moddle.create("bpmn:Process", {
         id: "Process_1",
         isExecutable: true,
         flowElements: [],
      }) as any;

      nodes.forEach((node) => {
         const type =
            node.type === "decision"
               ? "bpmn:BusinessRuleTask"
               : node.type === "human"
               ? "bpmn:UserTask"
               : node.type === "validate"
               ? "bpmn:Task"
               : "bpmn:Task";

         const element = moddle.create(type, {
            id: node.id,
            name: node.data.label || node.type,
         });

         process.get("flowElements").push(element);
      });

      edges.forEach((edge) => {
         const sequenceFlow = moddle.create("bpmn:SequenceFlow", {
            id: edge.id,
            sourceRef: edge.source,
            targetRef: edge.target,
         });
         process.get("flowElements").push(sequenceFlow);
      });

      const definitions = moddle.create("bpmn:Definitions", {
         id: "Definitions_1",
         targetNamespace: "http://bpmn.io/schema/bpmn",
         rootElements: [process],
      }) as any;

      try {
         const { xml } = await (moddle as any).toXML(definitions);
         const blob = new Blob([xml], { type: "application/xml" });
         const url = URL.createObjectURL(blob);
         const a = document.createElement("a");
         a.href = url;
         a.download = "flujo.bpmn";
         document.body.appendChild(a);
         a.click();
         a.remove();
         URL.revokeObjectURL(url);
      } catch (err) {
         console.error("Error al exportar BPMN:", err);
      }
   };

   return (
      <div className="flex h-[100dvh]">
         <Sidebar />
         <div className="flex-1 relative " ref={reactFlowWrapper}>
            <ReactFlow
               nodes={nodes}
               edges={edges}
               onNodesChange={onNodesChange}
               onEdgesChange={onEdgesChange}
               onConnect={onConnect}
               onDrop={onDrop}
               onDragOver={onDragOver}
               onInit={setReactFlowInstance}
               onNodeClick={onNodeClick}
               nodeTypes={nodeTypes}
               fitView
            >
               <Controls />
               <MiniMap />
               <Background />
            </ReactFlow>

            {selectedNode && (
               <div className=" absolute top-0 right-0 w-[18.75rem] primaryBackground p-5 border-x primaryBorder h-full overflow-y-auto">
                  <div className="flex justify-between border-b primaryBorder">
                     <h3>Editar Nodo</h3>
                     <p>
                        <strong>ID:</strong> {selectedNode.id}
                     </p>
                  </div>
                  <div className="flex flex-col mt-5 mb-2">
                     <label className="font-semibold text-sm">Label</label>
                     <input
                        type="text "
                        value={selectedNode.data.label || ""}
                        onChange={(e) =>
                           updateSelectedNodeData("label", e.target.value)
                        }
                        className="inputStyle border  rounded-md "
                     />
                  </div>

                  {(selectedNode.data.inputVars || []).map((v, i) => (
                     <div>
                        <label className="labelStyle">
                           Variables de entrada
                        </label>
                        <div
                           key={i}
                           className="flex mt-1 mb-5"
                           // style={{ display: "flex", gap: 5, marginBottom: 5 }}
                        >
                           <input
                              type="text"
                              value={v}
                              onChange={(e) =>
                                 updateInputVar(i, e.target.value)
                              }
                              className="inputStyle flex-1 rounded-s-md border"
                           />
                           <Button
                              isIconOnly
                              size="sm"
                              onPress={() => removeInputVar(i)}
                              className="bg-[var(--color-red-550)] border border-[var(--color-red-550) text-[var(--color-white] rounded-e-md border-none  px-1.5"
                           >
                              <Icon
                                 icon="line-md:close-small"
                                 width="24"
                                 height="24"
                                 className="btnText"
                              />
                           </Button>
                        </div>
                     </div>
                  ))}
                  <div className="flex mt-5 items-center justify-center gap-1 ">
                     <Button
                        onPress={addInputVar}
                        className=" text-[var(--color-white)]  bg-[var(--color-green-550)] rounded py-2 px-4 mb-2.5 flex gap-1 items-center justify-center"
                     >
                        <Icon icon="line-md:plus" width="20" height="20" />
                        Añadir variable
                     </Button>
                     <Button
                        onPress={() => setSelectedNode(null)}
                        className="  text-[var(--color-white)] bg-[var(--color-red-550)] py-2 px-4 mb-2.5 rounded"
                     >
                        Cerrar
                     </Button>
                  </div>
               </div>
            )}
         </div>
         <div className="w-[13.75rem] flex flex-col p-2.5 primaryBackground">
            {labels.map(({ type, label, color }) => (
               <div
                  key={type}
                  onDragStart={(e) => {
                     e.dataTransfer.setData("application/reactflow", type);
                     e.dataTransfer.effectAllowed = "move";
                  }}
                  draggable
                  className={twMerge(
                     clsx("mb-2.5 p-2.5 rounded cursor-grab", color)
                  )}
               >
                  + {label}
               </div>
            ))}

            <Button
               onPress={exportToBpmn}
               className=" ml-auto w-fit justify-self-end py-2 px-6 bg-[var(--color-green-550)]  text-[var(--color-white)] rounded overflow-hidden"
            >
               Exportar BPMN
            </Button>
         </div>
      </div>
   );
};

export default FlowCanvas;

const labels = [
   {
      type: "decision",
      label: "Decisión de Crédito",
      color: "bg-[#b2ebf2]",
   },
   { type: "human", label: "Tarea Humana", color: "bg-[#ce93d8]" },
   { type: "validate", label: "Validación", color: "bg-[#ffcc80]" },
];

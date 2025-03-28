import { useCallback } from "react";
import { Node } from "@xyflow/react";
import { useWorkflowStore } from "../store/workflowStore";

interface NodeData extends Record<string, unknown> {
   fieldName?: string;
   required?: boolean;
   minimumScore?: number;
   condition?: string;
   value?: string;
   label?: string;
   description?: string;
}

interface NodeConfigurationProps {
   node: Node<NodeData>;
}

const NodeConfiguration = ({ node }: NodeConfigurationProps) => {
   const setNodes = useWorkflowStore((state) => state.setNodes);
   const addHistoryEntry = useWorkflowStore((state) => state.addHistoryEntry);
   const nodes = useWorkflowStore((state) => state.nodes);
   const edges = useWorkflowStore((state) => state.edges);

   const updateNodeData = useCallback(
      (key: string, value: any) => {
         const updatedNodes = nodes.map((n) => {
            if (n.id === node.id) {
               return {
                  ...n,
                  data: {
                     ...n.data,
                     [key]: value,
                  },
               };
            }
            return n;
         });
         setNodes(updatedNodes);
         addHistoryEntry(updatedNodes, edges);
      },
      [node, nodes, edges, setNodes, addHistoryEntry]
   );

   const renderConfigFields = () => {
      switch (node.type) {
         case "userInput":
            return (
               <>
                  <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700">
                           Field Name
                        </label>
                        <input
                           type="text"
                           value={node.data.fieldName || ""}
                           onChange={(e) =>
                              updateNodeData("fieldName", e.target.value)
                           }
                           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">
                           Required
                        </label>
                        <input
                           type="checkbox"
                           checked={node.data.required || false}
                           onChange={(e) =>
                              updateNodeData("required", e.target.checked)
                           }
                           className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                     </div>
                  </div>
               </>
            );

         case "creditCheck":
            return (
               <div className="space-y-4">
                  <div>
                     <label className="block text-sm font-medium text-gray-700">
                        Minimum Score
                     </label>
                     <input
                        type="number"
                        value={node.data.minimumScore || 0}
                        onChange={(e) =>
                           updateNodeData(
                              "minimumScore",
                              parseInt(e.target.value)
                           )
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                     />
                  </div>
               </div>
            );

         case "condition":
            return (
               <div className="space-y-4">
                  <div>
                     <label className="block text-sm font-medium text-gray-700">
                        Condition
                     </label>
                     <select
                        value={node.data.condition || "equals"}
                        onChange={(e) =>
                           updateNodeData("condition", e.target.value)
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                     >
                        <option value="equals">Equals</option>
                        <option value="greater">Greater Than</option>
                        <option value="less">Less Than</option>
                     </select>
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700">
                        Value
                     </label>
                     <input
                        type="text"
                        value={node.data.value || ""}
                        onChange={(e) =>
                           updateNodeData("value", e.target.value)
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                     />
                  </div>
               </div>
            );

         default:
            return (
               <div className="space-y-4">
                  <div>
                     <label className="block text-sm font-medium text-gray-700">
                        Label
                     </label>
                     <input
                        type="text"
                        value={node.data.label || ""}
                        onChange={(e) =>
                           updateNodeData("label", e.target.value)
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700">
                        Description
                     </label>
                     <textarea
                        value={node.data.description || ""}
                        onChange={(e) =>
                           updateNodeData("description", e.target.value)
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        rows={3}
                     />
                  </div>
               </div>
            );
      }
   };

   return (
      <div className="p-4 bg-white border-l border-gray-200 w-80">
         <h3 className="text-lg font-medium text-gray-900 mb-4">
            Node Configuration
         </h3>
         {renderConfigFields()}
      </div>
   );
};

export default NodeConfiguration;

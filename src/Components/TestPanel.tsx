import { Node } from "@xyflow/react";

interface NodeData extends Record<string, unknown> {
   label?: string;
   description?: string;
}

interface TestPanelProps {
   nodes: Node<NodeData>[];
   testData: Record<string, any>;
   onNodeSubmit: (nodeId: string, data: any) => void;
   onClose: () => void;
}

const TestPanel = ({
   nodes,
   testData,
   onNodeSubmit,
   onClose,
}: TestPanelProps) => {
   return (
      <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-lg p-4 overflow-y-auto">
         <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Workflow Test</h3>
            <button
               onClick={onClose}
               className="text-gray-500 hover:text-gray-700"
            >
               ✕
            </button>
         </div>
         <div className="space-y-4">
            {nodes.map((node) => (
               <div key={node.id} className="border rounded p-4">
                  <h4 className="font-medium mb-2">{node.data.label}</h4>
                  {node.type === "userInput" && (
                     <div>
                        <input
                           type="text"
                           value={testData[node.id] || ""}
                           onChange={(e) =>
                              onNodeSubmit(node.id, e.target.value)
                           }
                           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                     </div>
                  )}
                  {node.type === "creditCheck" && (
                     <div className="text-sm">
                        {testData[node.id]
                           ? `Credit Score: ${testData[node.id]}`
                           : "Waiting for input..."}
                     </div>
                  )}
                  {node.type === "condition" && (
                     <div className="text-sm">
                        {testData[node.id] !== undefined
                           ? `Condition Result: ${testData[node.id]}`
                           : "Waiting for evaluation..."}
                     </div>
                  )}
               </div>
            ))}
         </div>
      </div>
   );
};

export default TestPanel;

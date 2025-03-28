import React, { useCallback } from "react";

const nodeTypes = [
   {
      category: "Input",
      nodes: [
         { type: "userInput", label: "User Input", icon: "📝" },
         { type: "apiInput", label: "API Input", icon: "🔌" },
      ],
   },
   {
      category: "Logic",
      nodes: [
         { type: "creditCheck", label: "Credit Check", icon: "✓" },
         { type: "scoreCalculation", label: "Score Calculation", icon: "📊" },
         { type: "condition", label: "Condition", icon: "⚡" },
      ],
   },
   {
      category: "Output",
      nodes: [
         { type: "approval", label: "Approval", icon: "✅" },
         { type: "rejection", label: "Rejection", icon: "❌" },
         { type: "review", label: "Manual Review", icon: "👥" },
      ],
   },
];

function Sidebar() {
   const onDragStart = useCallback(
      (event: React.DragEvent, nodeType: string) => {
         event.dataTransfer.setData("application/reactflow", nodeType);
         event.dataTransfer.effectAllowed = "move";
      },
      []
   );

   return (
      <div className="w-64 bg-gray-50 border-r border-gray-200 overflow-y-auto">
         <div className="p-4">
            <h2 className="text-sm font-medium text-gray-500 mb-4">
               Components
            </h2>
            {nodeTypes.map((category) => (
               <div key={category.category} className="mb-6">
                  <h3 className="text-xs font-semibold text-gray-400 mb-2">
                     {category.category}
                  </h3>
                  <div className="space-y-2">
                     {category.nodes.map((node) => (
                        <div
                           key={node.type}
                           className="flex items-center p-2 bg-white rounded-lg shadow-sm border border-gray-200 cursor-move hover:border-blue-500"
                           draggable
                           onDragStart={(e) => onDragStart(e, node.type)}
                        >
                           <span className="mr-2">{node.icon}</span>
                           <span className="text-sm">{node.label}</span>
                        </div>
                     ))}
                  </div>
               </div>
            ))}
         </div>
      </div>
   );
}

export default Sidebar;

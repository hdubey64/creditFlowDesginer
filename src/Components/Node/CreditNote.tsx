import { Handle, Position } from "@xyflow/react";
import { memo } from "react";

interface NodeData {
   label?: string;
   description?: string;
}

interface CreditNodeProps {
   data: NodeData;
   type: string;
}

const nodeStyles = {
   userInput: "bg-blue-50 border-blue-200",
   apiInput: "bg-purple-50 border-purple-200",
   creditCheck: "bg-green-50 border-green-200",
   scoreCalculation: "bg-yellow-50 border-yellow-200",
   condition: "bg-orange-50 border-orange-200",
   approval: "bg-emerald-50 border-emerald-200",
   rejection: "bg-red-50 border-red-200",
   review: "bg-gray-50 border-gray-200",
} as const;

const CreditNode = ({ data, type }: CreditNodeProps) => {
   return (
      <div
         className={`px-4 py-2 rounded-lg border-2 ${
            nodeStyles[type as keyof typeof nodeStyles] ||
            "bg-white border-gray-200"
         }`}
      >
         <Handle type="target" position={Position.Top} className="w-3 h-3" />
         <div className="font-medium text-sm">{data.label}</div>
         {data.description && (
            <div className="text-xs text-gray-500 mt-1">{data.description}</div>
         )}
         <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
      </div>
   );
};

export default memo(CreditNode);

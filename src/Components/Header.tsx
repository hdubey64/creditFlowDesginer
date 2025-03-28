import React from "react";
function Header() {
   return (
      <header className="bg-white border-b border-gray-200 px-4 py-2">
         <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
               <h1 className="text-xl font-semibold">
                  Credit Workflow Designer
               </h1>
               <div className="flex space-x-2">
                  <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
                     Save
                  </button>
                  <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                     Preview
                  </button>
               </div>
            </div>
            <div className="flex items-center space-x-2">
               <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                  Share
               </button>
               <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                  Settings
               </button>
            </div>
         </div>
      </header>
   );
}

export default Header;

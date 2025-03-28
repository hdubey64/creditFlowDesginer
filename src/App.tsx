import { ReactFlowProvider } from "@xyflow/react";
import { HeroUIProvider } from "@heroui/react";
import FlowCanvas from "./Components/FlowCanvas";
import Header from "./Components/Header";
import TestPanel from "./Components/TestPanel";

const App = () => {
   return (
      <HeroUIProvider>
         <ReactFlowProvider>
            <Header />
            <FlowCanvas />
         </ReactFlowProvider>
      </HeroUIProvider>
   );
};

export default App;

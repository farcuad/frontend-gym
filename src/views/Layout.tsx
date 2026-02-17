import { Routes, Route } from "react-router-dom";
import Header from "../components/Header";
import Aside from "../components/Aside";
import Clients from "./Clients";
import Plans from "./Plans"
import Memberships from "./Memberships";
import ChatIA from "./ChatAi";
import Home from "./Home";
import HistoryPagos from "./HistoryPagos";
import { useState } from "react";
import PlansGym from "./PlansGym";
import { PlanRoute } from "../context/PlanRoute";


function App() {
  const [asideOpen, setAsideOpen] = useState<boolean>(false);

  const toggleAside = () => {
    setAsideOpen(!asideOpen);
  };

  return (
    <div className="flex min-h-screen">
      <Aside isOpen={asideOpen} onClose={() => setAsideOpen(false)} />

      <div className="flex flex-col flex-1">
        <Header onToggleAside={toggleAside} />
        <main className="flex-1 p-4 bg-gray-50">
          <Routes>
            
             <Route path="/" element={<Home />} />
             <Route path="clients" element={<Clients />} />
             <Route path="plans" element={<Plans />} />
             <Route path="memberships" element={<Memberships />} />
             <Route path="history-pagos" element={<HistoryPagos />} />

             <Route path="chat" element={
              <PlanRoute minPlan="Medium"><ChatIA /></PlanRoute>
             } />
             <Route path="plans-gym" element={<PlansGym />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
import { Routes, Route } from "react-router-dom";
import Header from "../components/Header";
import Aside from "../components/Aside";
import Clients from "./Clients";
import Plans from "./Plans"
import Memberships from "./Memberships";
import ChatIA from "./ChatAi";
import HistoryPagos from "./HistoryPagos";
import { useState } from "react";
import PlansGym from "./PlansGym";
import Metrics from "./Metrics";
import Bots from "./Bots";
import Exercises from "./Exercises";
import Routines from "./Routines";
import RoutineDetail from "./RoutineDetail";
import Users from "./Users";
import MyRoutines from "./MyRoutines";
import AssignRoutines from "./AssignRoutines";
import { PlanRoute } from "../context/PlanRoute";


function App() {
  const [asideOpen, setAsideOpen] = useState<boolean>(false);

  const toggleAside = () => {
    setAsideOpen(!asideOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Aside isOpen={asideOpen} onClose={() => setAsideOpen(false)} />

      <div className="flex flex-col flex-1 h-full relative">
        <Header onToggleAside={toggleAside} />
        <main className="flex-1 p-4 bg-gray-50 overflow-y-auto">
          <Routes>
            {/* Estas rutas requieren que el plan NO esté vencido */}
            <Route path="metrics" element={<PlanRoute minPlan="trial"><Metrics /></PlanRoute>} />
            <Route path="clients" element={<PlanRoute minPlan="trial"><Clients /></PlanRoute>} />
            <Route path="plans" element={<PlanRoute minPlan="trial"><Plans /></PlanRoute>} />
            <Route path="memberships" element={<PlanRoute minPlan="trial"><Memberships /></PlanRoute>} />
            <Route path="history-pagos" element={<PlanRoute minPlan="trial"><HistoryPagos /></PlanRoute>} />
            <Route path="bots" element={<PlanRoute minPlan="trial"><Bots /></PlanRoute>} />

            {/* Nuevas Rutas de Entrenamiento y Administración */}
            <Route path="exercises" element={<PlanRoute minPlan="trial"><Exercises /></PlanRoute>} />
            <Route path="routines" element={<PlanRoute minPlan="trial"><Routines /></PlanRoute>} />
            <Route path="routines/:id" element={<PlanRoute minPlan="trial"><RoutineDetail /></PlanRoute>} />
            <Route path="users" element={<PlanRoute minPlan="trial"><Users /></PlanRoute>} />
            <Route path="assign-routines" element={<PlanRoute minPlan="trial"><AssignRoutines /></PlanRoute>} />
            
            {/* Ruta para Clientes */}
            <Route path="my-routines" element={<MyRoutines />} />

            {/* Chat IA requiere Medium */}
            <Route path="chat" element={
              <PlanRoute minPlan="Medium"><ChatIA /></PlanRoute>
            } />

            {/* Esta ruta es LIBRE para que el usuario pueda pagar */}
            <Route path="plans-gym" element={<PlansGym />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
import { Routes, Route } from "react-router-dom";
import Header from "../components/Header";
import Aside from "../components/Aside";
import Clients from "./Clients";
import Plans from "./Plans"
import Memberships from "./Memberships";
import ChatIA from "./ChatAi";
import { useState } from "react";

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
             <Route path="clients" element={<Clients />} />
             <Route path="plans" element={<Plans />} />
             <Route path="memberships" element={<Memberships />} />
             <Route path="chat" element={<ChatIA />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
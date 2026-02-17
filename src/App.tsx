import { Routes, Route, BrowserRouter as Router} from "react-router-dom";
import Login from "./views/Login";
import Register from "./views/Register";
import Layout from "./views/Layout"
import RecoverPassword from "./views/RecoverPassword";
import UpdatePassword from "./views/UpdatePassword";
import { SubscriptionProvider } from "./context/SubscriptionContext";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/recover-password" element={<RecoverPassword />} />
        <Route path="/update-password" element={<UpdatePassword />} />
        <Route path="/home/*" element={
          <SubscriptionProvider><Layout /></SubscriptionProvider>
        } />
      </Routes>
    </Router>
  );
}

export default App;
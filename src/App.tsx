import { Routes, Route, BrowserRouter as Router} from "react-router-dom";
import Login from "./views/Login";
import Register from "./views/Register";
import Home from "./views/Home";
import Layout from "./views/Layout"
import RecoverPassword from "./views/RecoverPassword";
import UpdatePassword from "./views/UpdatePassword";
import VerifyMembership from "./views/VerifyMembership";
import { SubscriptionProvider } from "./context/SubscriptionContext";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/recover-password" element={<RecoverPassword />} />
        <Route path="/update-password" element={<UpdatePassword />} />
        <Route path="/verify/:id" element={<VerifyMembership />} />
        <Route path="/home/*" element={
          <SubscriptionProvider><Layout /></SubscriptionProvider>
        } />
      </Routes>
    </Router>
  );
}

export default App;
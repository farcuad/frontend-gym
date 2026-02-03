import { Routes, Route, BrowserRouter as Router} from "react-router-dom";
import Login from "./views/Login";
import Register from "./views/Register";
import Layout from "./views/Layout"
import RecoverPassword from "./views/RecoverPassword";
import UpdatePassword from "./views/UpdatePassword";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/recover-password" element={<RecoverPassword />} />
        <Route path="/update-password" element={<UpdatePassword />} />
        <Route path="/home/*" element={<Layout />} />
      </Routes>
    </Router>
  );
}

export default App;
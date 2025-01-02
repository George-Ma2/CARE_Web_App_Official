import react from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login"
import Register from "./pages/Register"
import NotFound from "./pages/NotFound"
import Calendar from "./pages/Calendar"
import BoxInfo from "./pages/BoxInformation"
import StudentInfo from "./pages/StudentInfo"
import Inventory from "./pages/Inventory"
import ProtectedRoute from "./components/ProtectedRoute"
import 'bootstrap/dist/css/bootstrap.min.css';
import PasswordResetRequest from "./components/PasswordResetRequest"
import PasswordReset from "./components/PasswordReset"

function Logout() {
  localStorage.clear()
  return <Navigate to="/login" />
}

function RegisterAndLogout() {
  localStorage.clear()
  return <Register />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/register" element={<RegisterAndLogout />} />
        <Route path="/request/reset_password" element={<PasswordResetRequest />} />
        <Route path="/password_reset/:token" element={<PasswordReset />} />
        <Route path="*" element={<NotFound />}></Route>
        <Route path="/userdash/calendar" element={<ProtectedRoute> <Calendar /> </ProtectedRoute>}/>
        <Route path="/userdash/boxinfo" element={<ProtectedRoute> <BoxInfo /> </ProtectedRoute>}/>
        <Route path="/userdash/studentinfo" element={<ProtectedRoute> <StudentInfo /> </ProtectedRoute>}/>
        <Route path="admin/inventory" element={<ProtectedRoute> <Inventory /> </ProtectedRoute>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App

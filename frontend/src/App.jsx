import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login"
import Register from "./pages/Register"
import NotFound from "./pages/NotFound"
import Calendar from "./pages/Calendar"
import BoxInfo from "./pages/BoxInformation"
import StudentInfo from "./pages/StudentInfo"
import Cart from "./pages/Cart"
import Inventory from "./pages/Inventory"
import ProtectedRoute from "./components/ProtectedRoute"
import 'bootstrap/dist/css/bootstrap.min.css';
import PasswordResetRequest from "./components/PasswordResetRequest"
import PasswordReset from "./components/PasswordReset"
import CarePackage from "./pages/CarePackage";
import CarePackagePage from "./pages/CarePackage";
import { AppProvider } from './AppContext';
import OrderConfirmation from "./pages/OrderConfirmation";

function Logout() {
  localStorage.clear()
  return <Navigate to="/login" />
}

function RegisterAndLogout() {
  localStorage.clear()
  return <Register />
}

function App() {
  // Shared state for selected package
  const [selectedPackage, setSelectedPackage] = useState(null);

  return (
    <AppProvider>
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
        <Route path="/userdash/ordercart" element={<ProtectedRoute> <Cart /> </ProtectedRoute>}/>
        <Route path="/orderconfirmation" element={<ProtectedRoute> <OrderConfirmation /> </ProtectedRoute>}/>
        <Route path="admin/inventory" element={<ProtectedRoute> <Inventory /> </ProtectedRoute>}/>
        <Route path="/admin/care-package" element={<ProtectedRoute> <CarePackage /> </ProtectedRoute>}/>
      </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}

export default App

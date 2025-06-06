import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../contexts/AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import Dashboard from "../pages/Dashboard.jsx";
import LoginPage from "../pages/LoginPage.jsx";

export default function AppRouter() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Öffentliche Route */}
                    <Route path="/login" element={<LoginPage />} />

                    {/* Geschützte Routen */}
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </Router>
        </AuthProvider>
    );
}
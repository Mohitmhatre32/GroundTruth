
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Simulation from './pages/Simulation';
import Login from './pages/Login';
import Policy from './pages/Policy'; // Import Policy page
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Landing from './pages/Landing';
import Reports from './pages/Reports';
import RealTimeCenter from './pages/RealTimeCenter';


function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<Login />} />

                    <Route element={<ProtectedRoute />}>
                        <Route element={<AppLayout />}>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/real-time" element={<RealTimeCenter />} />
                            <Route path="/reports" element={<Reports />} />
                            <Route path="/analytics" element={<Analytics />} />
                            <Route path="/policy" element={<Policy />} /> {/* Add Policy route */}
                            <Route path="/simulation" element={<Simulation />} />
                        </Route>
                    </Route>

                </Routes>
                <Toaster position="top-right" richColors />
            </Router>
        </AuthProvider>
    );
}

export default App;

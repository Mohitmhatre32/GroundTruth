import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Simulation from './pages/Simulation';
import Login from './pages/Login';
import { Toaster } from 'sonner';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />

                <Route element={<AppLayout />}>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/analytics/:stationId" element={<Analytics />} />
                    <Route path="/simulation" element={<Simulation />} />
                </Route>
            </Routes>
            <Toaster position="top-right" richColors />
        </Router>
    );
}

export default App;

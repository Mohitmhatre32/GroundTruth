import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Simulation from './pages/Simulation';
import Login from './pages/Login';
import { Toaster } from 'sonner';

import Landing from './pages/Landing';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />

                <Route element={<AppLayout />}>
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

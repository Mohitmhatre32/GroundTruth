import React from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-100">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-primary mb-2">GroundTruth</h1>
                    <p className="text-textMuted">Secure Access for Officials</p>
                </div>
                <form className="space-y-4" onSubmit={handleLogin}>
                    <div>
                        <label className="block text-sm font-medium text-textMain mb-1">Government ID</label>
                        <input type="text" className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" autoFocus placeholder="GOV-ID-XXXX" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-textMain mb-1">Password</label>
                        <input type="password" className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" placeholder="••••••••" />
                    </div>
                    <button type="submit" className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-md">
                        Login to Dashboard
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;

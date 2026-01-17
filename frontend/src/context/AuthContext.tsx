import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
    id: string;
    name: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: () => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        // Check local storage on mount
        const storedUser = localStorage.getItem('groundtruth_user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
                setIsAuthenticated(true);
            } catch (e) {
                console.error("Failed to parse stored user", e);
                localStorage.removeItem('groundtruth_user');
            }
        }
        setIsLoading(false);
    }, []);

    const login = () => {
        // Dummy login logic
        const dummyUser: User = {
            id: 'usr_12345',
            name: 'Jane Smith',
            role: 'Policy Maker'
        };

        localStorage.setItem('groundtruth_user', JSON.stringify(dummyUser));
        setUser(dummyUser);
        setIsAuthenticated(true);
    };

    const logout = () => {
        localStorage.removeItem('groundtruth_user');
        setUser(null);
        setIsAuthenticated(false);
    };

    if (isLoading) {
        // Optional: Render a loading spinner or nothing while checking auth
        return null;
    }

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

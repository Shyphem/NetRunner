import { Navigate, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

const ProtectedRoute = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('netrunner_token');
        if (!token) {
            setIsAuthenticated(false);
            return;
        }

        try {
            const decoded: any = jwtDecode(token);
            const currentTime = Date.now() / 1000;

            if (decoded.exp < currentTime) {
                // Expired
                localStorage.removeItem('netrunner_token');
                setIsAuthenticated(false);
            } else {
                setIsAuthenticated(true);
            }
        } catch (error) {
            // Invalid token
            localStorage.removeItem('netrunner_token');
            setIsAuthenticated(false);
        }
    }, []);

    if (isAuthenticated === null) {
        // Loading state, maybe showing a spinner?
        return <div className="h-screen w-full bg-slate-950 flex items-center justify-center text-green-500 font-mono">Verifying credentials...</div>;
    }

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;

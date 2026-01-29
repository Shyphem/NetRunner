import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Lock, Terminal, User } from 'lucide-react';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const res = await fetch('http://localhost:3001/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (res.ok && data.token) {
                localStorage.setItem('netrunner_token', data.token);
                localStorage.removeItem('netrunner_api_key'); // Cleanup old method
                navigate('/');
            } else {
                setError(data.error || 'Login failed');
            }
        } catch (err) {
            setError('Connection refused. Is backend running?');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-screen w-full bg-slate-950 flex items-center justify-center relative overflow-hidden">
            {/* Background Grid Animation */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
            <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[bottom_1px_center] pointer-events-none" style={{ backgroundSize: '40px 40px' }}></div>

            <div className="relative z-10 w-full max-w-md p-8 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-lg shadow-2xl">
                <div className="flex flex-col items-center mb-8">
                    <div className="h-12 w-12 bg-green-500/10 rounded-full flex items-center justify-center mb-4 border border-green-500/20">
                        <Terminal className="text-green-500 w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-100 tracking-tight">NetRunner Access</h1>
                    <p className="text-slate-500 text-sm mt-2">Secure Gateway</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-4">
                        <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                            <Input
                                type="text"
                                placeholder="Username"
                                className="pl-10 bg-slate-950 border-slate-700 text-slate-100 placeholder:text-slate-600 focus-visible:ring-green-500/50"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                            <Input
                                type="password"
                                placeholder="Password"
                                className="pl-10 bg-slate-950 border-slate-700 text-slate-100 placeholder:text-slate-600 focus-visible:ring-green-500/50"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-500 text-xs text-center font-mono bg-red-500/10 p-2 rounded border border-red-500/20">
                            &gt; Error: {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Authenticating...' : 'Initialize Session'}
                    </Button>
                </form>

                <div className="mt-6 text-center text-xs text-slate-600 font-mono">
                    System Version v1.0.2
                </div>
            </div>
        </div>
    );
};

export default LoginPage;

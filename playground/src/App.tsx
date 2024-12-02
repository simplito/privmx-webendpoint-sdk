import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useLocation } from 'react-router';
import { Home } from './pages/home/HomePage';
import { CryptoPage } from './features/crypto/CryptoPage';

const NavLink: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <li className="mb-2">
            <Link
                to={to}
                className={`block px-4 py-2 rounded-md transition-colors duration-200 ${
                    isActive
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-700 hover:bg-blue-100 hover:text-blue-500'
                }`}>
                {children}
            </Link>
        </li>
    );
};

const App: React.FC = () => {
    return (
        <Router>
            <div className="flex h-screen bg-gray-100">
                <nav className="w-64 bg-white shadow-lg">
                    <div className="p-5">
                        <h1 className="text-2xl font-bold mb-8 text-gray-800">Playground</h1>
                        <ul>
                            <NavLink to="/">Home</NavLink>
                            <NavLink to="/crypto">Crypto</NavLink>
                        </ul>
                    </div>
                </nav>

                <main className="flex-1 p-8 overflow-y-auto w-full bg-gray-50 bg-opacity-50 bg-grid-pattern">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/crypto" element={<CryptoPage />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
};

export default App;

import React from 'react';
import { Link, useLocation } from 'react-router';

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
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
}

function Sidebar() {
    return (
        <nav className="w-64 bg-white shadow-lg">
            <div className="p-5">
                <h1 className="text-2xl font-bold mb-8 text-gray-800">Playground</h1>
                <ul>
                    <NavLink to="/">Home</NavLink>
                    <NavLink to="/crypto">Crypto</NavLink>
                </ul>
            </div>
        </nav>
    );
}

export default Sidebar;

import { BrowserRouter as Router, Route, Routes } from 'react-router';
import { Home } from './pages/home/HomePage';
import { CryptoPage } from './features/crypto/CryptoPage';
import Sidebar from './components/Sidebar';

function App() {
    return (
        <Router>
            <div className="flex h-screen bg-gray-100">
                <Sidebar />
                <main className="flex-1 p-8 overflow-y-auto w-full bg-gray-50 bg-opacity-50 bg-grid-pattern">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/crypto" element={<CryptoPage />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;

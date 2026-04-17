import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import PrivateSection from './pages/PrivateSection';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('access_token');
  return token ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('access_token');
  return token ? <Navigate to="/chat" replace /> : children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/chat" replace />} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
        <Route path="/chat" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/private" element={<PrivateRoute><PrivateSection /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

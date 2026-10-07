// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useUser } from '../UserContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loadingAuth } = useUser();
   console.log('ProtectedRoute check:', { isAuthenticated, loadingAuth });

  if (loadingAuth) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  return children;
};

export default ProtectedRoute;
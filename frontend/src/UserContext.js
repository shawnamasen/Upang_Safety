// src/UserContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import jwtDecode from 'jwt-decode';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('userEmail') || '');
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('token'));
  const [userType, setUserType] = useState(() => localStorage.getItem('userType') || '');
  const [userData, setUserData] = useState(() => {
    const data = localStorage.getItem('userData');
    return data ? JSON.parse(data) : null;
  });
  const [loadingAuth, setLoadingAuth] = useState(true);

  const isProfessor = userType === 'professor';

  useEffect(() => {
    const validateSession = async () => {
      const token = localStorage.getItem('token');
      const storedUserType = localStorage.getItem('userType');
      const storedUserData = localStorage.getItem('userData');
      
      console.log('Validating session:', { token, storedUserType });
      
      if (!token) {
        console.log('No token found');
        clearAuthData();
        setLoadingAuth(false);
        return;
      }

      try {
        // Decode token to check expiration
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        
        if (decodedToken.exp < currentTime) {
          console.log('Token expired');
          clearAuthData();
          setLoadingAuth(false);
          return;
        }

        // Try to use stored data first
        if (storedUserData) {
          const parsedUserData = JSON.parse(storedUserData);
          console.log('Using stored user data:', parsedUserData);
          updateAuthData(parsedUserData);
          setLoadingAuth(false);
          
          // Validate in background
          validateWithBackend(token);
          return;
        }

        // If no stored data, validate with backend
        await validateWithBackend(token);
        
      } catch (error) {
        console.error('Session validation error:', error);
        clearAuthData();
      } finally {
        setLoadingAuth(false);
      }
    };

    const validateWithBackend = async (token) => {
      try {
        console.log('Validating with backend...');
        const response = await fetch('http://localhost:5000/user/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const profile = await response.json();
          const userData = {
            ...profile,
            token,
            userType: localStorage.getItem('userType') || 'student'
          };
          console.log('Backend validation successful:', userData);
          updateAuthData(userData);
        } else {
          console.log('Backend validation failed');
          clearAuthData();
        }
      } catch (error) {
        console.error('Backend validation error:', error);
        // Don't clear auth data on network errors if we have valid stored data
        if (!localStorage.getItem('userData')) {
          clearAuthData();
        }
      }
    };

    validateSession();
  }, []);

  const updateAuthData = (user) => {
    // Don't update if we don't have the minimum required data
    if (!user || !user.email) {
      console.warn('Attempted to update auth data with invalid user data:', user);
      return;
    }

    console.log('Updating auth data:', user);
    
    setUserEmail(user.email);
    setUserType(user.userType || 'student');
    setUserData(user);
    setIsAuthenticated(true);
    
    // Ensure we have a token before storing
    const token = user.token || localStorage.getItem('token');
    if (!token) {
      console.warn('No token available when updating auth data');
      return;
    }
    
    // Store everything in localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('userEmail', user.email);
    localStorage.setItem('userType', user.userType || 'student');
    localStorage.setItem('userData', JSON.stringify({
      ...user,
      token // Ensure token is included in userData
    }));
  };

  const clearAuthData = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userType');
    localStorage.removeItem('userData');
    
    setUserEmail('');
    setUserType('');
    setUserData(null);
    setIsAuthenticated(false);
  };

  const login = (loginData) => {
    updateAuthData(loginData);
  };

  const logout = async () => {
    try {
      // Clear all auth data first to ensure immediate UI update
      clearAuthData();
      
      // Then make the logout request to backend
      const response = await fetch('http://localhost:5000/user/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        console.error('Logout request failed:', await response.text());
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
    // State is already cleared, no need for finally block
  };

  return (
    <UserContext.Provider value={{ 
      userEmail,
      isAuthenticated,
      userType,
      userData,
      isProfessor,
      loadingAuth,
      login,
      logout
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
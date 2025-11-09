import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Homepage from './pages/Homepage';
import Login from './pages/Login';
import Register from './pages/Register';
import DonorDashboard from './pages/DonorDashboard';
import ReceiverDashboard from './pages/ReceiverDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import RequestApproval from './pages/RequestApproval';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase"; // adjust path if needed
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

function App() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Always fetch user profile from Firestore
        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            setUser(userData);
            setIsAuthenticated(true);
            localStorage.setItem('user', JSON.stringify(userData));
          } else {
            // Fallback if user doc not found
            const fallbackUser = {
              email: firebaseUser.email,
              uid: firebaseUser.uid,
              role: 'donor'
            };
            setUser(fallbackUser);
            setIsAuthenticated(true);
            localStorage.setItem('user', JSON.stringify(fallbackUser));
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
      }
    });
    return () => unsubscribe();
  }, []);
  

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    signOut(auth).then(() => {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('user');
    });
  };
  

  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }
    
    if (allowedRoles && !allowedRoles.includes(user?.role)) {
      return <Navigate to="/" />;
    }
    
    return children;
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<Login login={login} />} />
          <Route path="/register" element={<Register login={login} />} />
          <Route 
            path="/donor-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['donor']}>
                <DonorDashboard user={user} logout={logout} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/receiver-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['receiver']}>
                <ReceiverDashboard user={user} logout={logout} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard user={user} logout={logout} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile user={user} logout={logout} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/request-approval" 
            element={
              <ProtectedRoute allowedRoles={['donor']}>
                <RequestApproval user={user} logout={logout} />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 
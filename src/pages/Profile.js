import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';
import { doc, updateDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { updateEmail, updatePassword } from 'firebase/auth';

const Profile = ({ user, logout }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [donors, setDonors] = useState([]);
  const [receivers, setReceivers] = useState([]);

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';
    if (formData.password && formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
    if (formData.password && formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    if (!validateForm()) return;

    try {
      // Update Firestore user document
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        name: formData.name,
        email: formData.email
      });

      // Update email in Firebase Auth if changed
      if (formData.email !== user.email && user.email) {
        await updateEmail(user, formData.email);
      }
      // Update password in Firebase Auth if provided
      if (formData.password) {
        await updatePassword(user, formData.password);
      }

      setSuccessMsg('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      setErrorMsg('Failed to update profile: ' + error.message);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const users = usersSnapshot.docs.map(doc => doc.data());
        setDonors(users.filter(user => user.role === 'donor'));
        setReceivers(users.filter(user => user.role === 'receiver'));
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h3>No Waste Food Network</h3>
          <p>Profile</p>
        </div>
        <ul className="sidebar-nav">
          {user?.role === 'donor' && <li><Link to="/donor-dashboard">Dashboard</Link></li>}
          {user?.role === 'receiver' && <li><Link to="/receiver-dashboard">Dashboard</Link></li>}
          {user?.role === 'admin' && <li><Link to="/admin-dashboard">Dashboard</Link></li>}
          <li><Link to="/profile" className="active">Profile</Link></li>
          <li><button onClick={logout} className="sidebar-logout">Logout</button></li>
        </ul>
      </div>
      {/* Main Content */}
      <div className="main-content">
        <div className="dashboard-header">
          <h1>Profile</h1>
          <p>View and edit your personal information</p>
        </div>
        <div className="card" style={{maxWidth:'500px',margin:'0 auto'}}>
          {successMsg && <div className="status-badge status-confirmed mb-20 text-center">{successMsg}</div>}
          {errorMsg && <div className="status-badge status-declined mb-20 text-center">{errorMsg}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className={`form-input ${formErrors.name ? 'error' : ''}`} disabled={!isEditing} />
              {formErrors.name && <span className="error-text">{formErrors.name}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className={`form-input ${formErrors.email ? 'error' : ''}`} disabled={!isEditing} />
              {formErrors.email && <span className="error-text">{formErrors.email}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} className={`form-input ${formErrors.password ? 'error' : ''}`} disabled={!isEditing} placeholder="Leave blank to keep current password" />
              {formErrors.password && <span className="error-text">{formErrors.password}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className={`form-input ${formErrors.confirmPassword ? 'error' : ''}`} disabled={!isEditing} placeholder="Confirm new password" />
              {formErrors.confirmPassword && <span className="error-text">{formErrors.confirmPassword}</span>}
            </div>
            <div className="modal-actions">
              {isEditing ? (
                <>
                  <button type="button" className="btn btn-outline" onClick={()=>{setIsEditing(false);setFormErrors({});setSuccessMsg('');setErrorMsg('')}}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Changes</button>
                </>
              ) : (
                <button type="button" className="btn btn-primary" onClick={()=>setIsEditing(true)}>Edit Profile</button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile; 
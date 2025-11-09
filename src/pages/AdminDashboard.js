import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const AdminDashboard = ({ user, logout }) => {
  const [tab, setTab] = useState('donors');
  const [donors, setDonors] = useState([]);
  const [receivers, setReceivers] = useState([]);
  const [donations, setDonations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        console.log('Fetching donations from API...');
        const response = await fetch('https://f0b871qege.execute-api.us-east-1.amazonaws.com/Reciever_function');
        console.log('API Response status:', response.status);
        
        const data = await response.json();
        console.log('API Response data:', data);
        
        if (response.ok) {
          const formattedDonations = data.map(item => ({
            id: item.donationId,
            donor: item.donorName,
            foodType: item.foodType,
            category: item.category,
            quantity: item.quantity,
            date: new Date(item.requestDate || Date.now()).toISOString().split('T')[0],
            status: 'Confirmed'
          }));
          console.log('Formatted donations:', formattedDonations);
          setDonations(formattedDonations);
        } else {
          console.error('Error fetching donations:', data.error);
          setDonations([]);
        }
      } catch (error) {
        console.error('Error fetching donations:', error);
        setDonations([]);
      }
    };

    const fetchRequests = async () => {
      try {
        // Fetch requests from localStorage (as used in RequestApproval)
        const storedRequests = JSON.parse(localStorage.getItem('foodRequests') || '[]');
        const formattedRequests = storedRequests.map(req => ({
          id: req.id,
          receiver: req.receiverName,
          food: req.foodRequested,
          quantity: req.quantity,
          pickupTime: req.pickupTime,
          status: req.status,
          donor: req.donorName
        }));
        setRequests(formattedRequests);
      } catch (error) {
        console.error('Error fetching requests:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDonations();
    fetchRequests();
  }, []);

  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'pickup confirmed':
        return 'status-confirmed';
      case 'declined':
      case 'request declined':
        return 'status-declined';
      default:
        return 'status-pending';
    }
  };

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h3>No Waste Food Network</h3>
          <p>Admin Dashboard</p>
        </div>
        <ul className="sidebar-nav">
          <li><a href="#" className="active">Dashboard</a></li>
          <li><Link to="/profile">Profile</Link></li>
          <li><button onClick={logout} className="sidebar-logout">Logout</button></li>
        </ul>
      </div>
      {/* Main Content */}
      <div className="main-content">
        <div className="dashboard-header">
          <h1>Welcome, {user?.name}!</h1>
          <p>Monitor all activity on No Waste Food Network</p>
        </div>
        <div className="card">
          <div className="admin-tabs flex flex-between mb-20">
            <button className={`btn ${tab==='donors' ? 'btn-primary' : 'btn-outline'}`} onClick={()=>setTab('donors')}>Donors</button>
            <button className={`btn ${tab==='receivers' ? 'btn-primary' : 'btn-outline'}`} onClick={()=>setTab('receivers')}>Receivers</button>
            <button className={`btn ${tab==='donations' ? 'btn-primary' : 'btn-outline'}`} onClick={()=>setTab('donations')}>Donations</button>
            <button className={`btn ${tab==='requests' ? 'btn-primary' : 'btn-outline'}`} onClick={()=>setTab('requests')}>Pickup Requests</button>
          </div>
          {tab === 'donors' && (
            <div className="table-container">
              <h2>All Donors</h2>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                  </tr>
                </thead>
                <tbody>
                  {donors.map(donor => (
                    <tr key={donor.uid || donor.email}>
                      <td>{donor.name}</td>
                      <td>{donor.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {tab === 'receivers' && (
            <div className="table-container">
              <h2>All Receivers</h2>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                  </tr>
                </thead>
                <tbody>
                  {receivers.map(receiver => (
                    <tr key={receiver.uid || receiver.email}>
                      <td>{receiver.name}</td>
                      <td>{receiver.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {tab === 'donations' && (
            <div className="table-container">
              <h2>All Donations</h2>
              {isLoading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <p>Loading donations...</p>
                </div>
              ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Donor</th>
                    <th>Food Type</th>
                    <th>Category</th>
                    <th>Quantity</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                    {donations.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                          No donations found.
                        </td>
                      </tr>
                    ) : (
                      donations.map(donation => (
                    <tr key={donation.id}>
                      <td>{donation.donor}</td>
                      <td>{donation.foodType}</td>
                      <td>{donation.category}</td>
                      <td>{donation.quantity}</td>
                      <td>{donation.date}</td>
                      <td><span className={`status-badge ${getStatusBadgeClass(donation.status)}`}>{donation.status}</span></td>
                    </tr>
                      ))
                    )}
                </tbody>
              </table>
              )}
            </div>
          )}
          {tab === 'requests' && (
            <div className="table-container">
              <h2>All Pickup Requests</h2>
              {isLoading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <p>Loading requests...</p>
                </div>
              ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Receiver</th>
                    <th>Food</th>
                    <th>Quantity</th>
                    <th>Pickup Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                    {requests.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                          No requests found.
                        </td>
                      </tr>
                    ) : (
                      requests.map(req => (
                    <tr key={req.id}>
                      <td>{req.receiver}</td>
                      <td>{req.food}</td>
                      <td>{req.quantity}</td>
                      <td>{new Date(req.pickupTime).toLocaleString()}</td>
                      <td><span className={`status-badge ${getStatusBadgeClass(req.status)}`}>{req.status}</span></td>
                    </tr>
                      ))
                    )}
                </tbody>
              </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 
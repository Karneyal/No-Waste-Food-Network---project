import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const RequestApproval = ({ user, logout }) => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch requests from API or use mock data
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        // Option 1: Try to fetch from API first
        // const response = await fetch('YOUR_API_ENDPOINT_FOR_REQUESTS');
        // const data = await response.json();
        
        // Option 2: Read from localStorage (temporary solution)
        const storedRequests = JSON.parse(localStorage.getItem('foodRequests') || '[]');
        
        // Filter requests for the current donor
        const donorRequests = storedRequests.filter(req => 
          req.donorName === user?.name || req.donorId === user?.uid
        );
        
        setRequests(donorRequests);
      } catch (error) {
        console.error('Error fetching requests:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, [user?.name, user?.uid]);

  const handleAction = async (id, action) => {
    try {
      const newStatus = action === 'accept' ? 'Pickup Confirmed' : 'Request Declined';
      
      // Update localStorage (current behavior)
      const storedRequests = JSON.parse(localStorage.getItem('foodRequests') || '[]');
      const updatedRequests = storedRequests.map(req =>
        req.id === id ? { ...req, status: newStatus } : req
      );
      localStorage.setItem('foodRequests', JSON.stringify(updatedRequests));
      
      // If accepting, also delete from DynamoDB
      if (action === 'accept') {
        const request = storedRequests.find(req => req.id === id);
        if (request?.donationId) {
          // Call your API to delete the donation
          await fetch('YOUR_API_ENDPOINT/deleteDonation', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ donationId: request.donationId })
          });
        }
      }
      
      // Update UI
      setRequests(prev => prev.map(req =>
        req.id === id ? { ...req, status: newStatus } : req
      ));
      
    } catch (error) {
      console.error('Error updating request:', error);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'pickup confirmed':
        return 'status-confirmed';
      case 'request declined':
        return 'status-declined';
      default:
        return 'status-pending';
    }
  };

  if (isLoading) {
    return (
      <div className="dashboard">
        <div className="sidebar">
          <div className="sidebar-header">
            <h3>No Waste Food Network</h3>
            <p>Donor Dashboard</p>
          </div>
          <ul className="sidebar-nav">
            <li><Link to="/donor-dashboard">Dashboard</Link></li>
            <li><Link to="/request-approval" className="active">Request Approval</Link></li>
            <li><Link to="/profile">Profile</Link></li>
            <li><button onClick={logout} className="sidebar-logout">Logout</button></li>
          </ul>
        </div>
        <div className="main-content">
          <div className="dashboard-header">
            <h1>Pickup Requests</h1>
            <p>Loading requests...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h3>No Waste Food Network</h3>
          <p>Donor Dashboard</p>
        </div>
        <ul className="sidebar-nav">
          <li><Link to="/donor-dashboard">Dashboard</Link></li>
          <li><Link to="/request-approval" className="active">Request Approval</Link></li>
          <li><Link to="/profile">Profile</Link></li>
          <li><button onClick={logout} className="sidebar-logout">Logout</button></li>
        </ul>
      </div>
      {/* Main Content */}
      <div className="main-content">
        <div className="dashboard-header">
          <h1>Pickup Requests</h1>
          <p>Review and manage incoming food pickup requests</p>
        </div>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Requests ({requests.length})</h2>
            <button 
              className="btn btn-outline" 
              onClick={() => {
                setIsLoading(true);
                setTimeout(() => {
                  const storedRequests = JSON.parse(localStorage.getItem('foodRequests') || '[]');
                  const donorRequests = storedRequests.filter(req => 
                    req.donorName === user?.name || req.donorId === user?.uid
                  );
                  setRequests(donorRequests.length > 0 ? donorRequests : requests);
                  setIsLoading(false);
                }, 500);
              }}
            >
              Refresh
            </button>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Receiver Name</th>
                  <th>Food Requested</th>
                  <th>Quantity</th>
                  <th>Pickup Time</th>
                  <th>Location</th>
                  <th>Request Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 && (
                  <tr><td colSpan="8">No requests at this time.</td></tr>
                )}
                {requests.map(req => (
                  <tr key={req.id}>
                    <td>
                      <div>
                        <strong>{req.receiverName}</strong>
                        <br />
                        <small>{req.receiverEmail}</small>
                      </div>
                    </td>
                    <td>{req.foodRequested}</td>
                    <td>{req.quantity} servings</td>
                    <td>{new Date(req.pickupTime).toLocaleString()}</td>
                    <td>{req.location}</td>
                    <td>{new Date(req.requestDate).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge ${getStatusBadgeClass(req.status)}`}>{req.status}</span>
                    </td>
                    <td>
                      {req.status === 'Pending' ? (
                        <>
                          <button 
                            className="btn btn-primary" 
                            style={{marginRight:'8px', fontSize: '12px', padding: '6px 12px'}} 
                            onClick={() => handleAction(req.id, 'accept')}
                          >
                            Accept
                          </button>
                          <button 
                            className="btn btn-secondary" 
                            style={{fontSize: '12px', padding: '6px 12px'}}
                            onClick={() => handleAction(req.id, 'decline')}
                          >
                            Decline
                          </button>
                        </>
                      ) : (
                        <span style={{color:'#444', fontSize: '12px'}}>No action</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestApproval; 
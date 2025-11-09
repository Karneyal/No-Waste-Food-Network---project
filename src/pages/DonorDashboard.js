import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const DonorDashboard = ({ user, logout }) => {
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [donations, setDonations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user's donations from API
  useEffect(() => {
    const fetchDonations = async () => {
      try {
        // Fetch donations from your API
        const response = await fetch('https://f0b871qege.execute-api.us-east-1.amazonaws.com/Reciever_function');
        const data = await response.json();

        if (response.ok) {
          // Filter donations for the current user
          const userDonations = data.filter(item => 
            item.donorName === user?.name || item.donorEmail === user?.email
          ).map(item => ({
            id: item.donationId,
            date: new Date(item.requestDate || Date.now()).toISOString().split('T')[0],
            foodType: item.foodType,
            quantity: item.quantity,
            status: 'Confirmed', // You might want to add status to your API response
            category: item.category
          }));
          
          setDonations(userDonations);
        } else {
          console.error('Error fetching donations:', data.error);
          // Fallback to empty array if API fails
          setDonations([]);
        }
      } catch (error) {
        console.error('Error fetching donations:', error);
        // Fallback to empty array if API fails
        setDonations([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.name || user?.email) {
      fetchDonations();
    }
  }, [user?.name, user?.email]);

  const [donationForm, setDonationForm] = useState({
    contact: '',
    foodCategory: 'Veg',
    foodType: '',
    estimatedCount: '',
    quantity: '',
    expiryDate: '',
    pickupTime: '',
    location: ''
  });

  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    
    if (!donationForm.contact.trim()) errors.contact = 'Contact is required';
    if (!donationForm.foodType.trim()) errors.foodType = 'Food type is required';
    if (!donationForm.estimatedCount) errors.estimatedCount = 'Estimated count is required';
    if (!donationForm.quantity.trim()) errors.quantity = 'Quantity is required';
    if (!donationForm.expiryDate) errors.expiryDate = 'Expiry date is required';
    if (!donationForm.pickupTime) errors.pickupTime = 'Pickup time is required';
    if (!donationForm.location.trim()) errors.location = 'Location is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitDonation = async (e) => {
    e.preventDefault();
  
    if (!validateForm()) return;
  
    const apiUrl = 'https://p1f13md2ec.execute-api.us-east-1.amazonaws.com/ZWC_function';
  
    const payload = {
      donorName: user?.name || '',
      contact: donationForm.contact,
      category: donationForm.foodCategory,
      foodType: donationForm.foodType,
      count: parseInt(donationForm.estimatedCount),
      quantity: donationForm.quantity,
      expiryDate: donationForm.expiryDate,
      pickupTime: donationForm.pickupTime,
      location: donationForm.location
    };
  
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
  
      const data = await response.json();
  
      if (response.ok) {
        alert('Donation submitted successfully.');
  
        // Add to local list for immediate UI feedback
        const newDonation = {
          id: Date.now(),
          date: new Date().toISOString().split('T')[0],
          foodType: donationForm.foodType,
          quantity: donationForm.quantity,
          status: 'Pending',
          category: donationForm.foodCategory
        };
  
        setDonations(prev => [newDonation, ...prev]);
  
        // Reset form and close modal
        setDonationForm({
          contact: '',
          foodCategory: 'Veg',
          foodType: '',
          estimatedCount: '',
          quantity: '',
          expiryDate: '',
          pickupTime: '',
          location: ''
        });
        setShowDonationForm(false);
      } else {
        alert(data.error || 'Failed to submit donation.');
      }
    } catch (err) {
      console.error('API error:', err.message);
      console.error('Full error:', err);
      alert('Something went wrong while submitting donation.');
    }
  };
  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDonationForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'status-confirmed';
      case 'declined':
        return 'status-declined';
      default:
        return 'status-pending';
    }
  };

  // Utility to strip 'Donor' from the user name
  const getDisplayName = (name) => {
    if (!name) return '';
    return name.replace(/\s*Donor\s*$/i, '').trim();
  };

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h3>No Waste Food Network</h3>
          <p>Donor Dashboard</p>
        </div>
        
        <ul className="sidebar-nav">
          <li><Link to="/donor-dashboard" className="active">Dashboard</Link></li>
          <li><Link to="/request-approval">Request Approval</Link></li>
          <li><Link to="/profile">Profile</Link></li>
          <li><button onClick={logout} className="sidebar-logout">Logout</button></li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="dashboard-header">
          <h1>Welcome, {user?.name || 'Donor'}</h1>
          <p>Manage your food donations and help reduce waste</p>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <div className="action-card" style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}} onClick={() => setShowDonationForm(true)}>
            <div>
            <h3>Donate Food</h3>
            <p>List your surplus food items</p>
            </div>
            <button className="btn btn-primary" style={{ marginTop: 'auto', width: '100%' }}>+ New Donation</button>
          </div>
          
          <div className="action-card" style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
            <div>
            <h3>Pending Requests</h3>
            <p>Review pickup requests</p>
            </div>
            <Link to="/request-approval" className="btn btn-secondary" style={{ marginTop: 'auto', width: '100%', display: 'block' }}>View Requests</Link>
          </div>
        </div>

        {/* Donation History */}
        <div className="card">
          <h2>Recent Donations</h2>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <p>Loading your donations...</p>
            </div>
          ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Food Type</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                  {donations.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                        No donations found. Start by creating your first donation!
                      </td>
                    </tr>
                  ) : (
                    donations.map(donation => (
                  <tr key={donation.id}>
                    <td>{donation.date}</td>
                    <td>{donation.foodType}</td>
                    <td>{donation.category}</td>
                    <td>{donation.quantity}</td>
                    <td>
                      <span className={`status-badge ${getStatusBadgeClass(donation.status)}`}>
                        {donation.status}
                      </span>
                    </td>
                  </tr>
                    ))
                  )}
              </tbody>
            </table>
          </div>
          )}
        </div>

        {/* Donation Form Modal */}
        {showDonationForm && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h2>Donate Food</h2>
                <button 
                  className="modal-close"
                  onClick={() => setShowDonationForm(false)}
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleSubmitDonation} className="modal-form">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Name</label>
                    <div className="form-static">{getDisplayName(user?.name) || ''}</div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Contact</label>
                    <input
                      type="text"
                      name="contact"
                      value={donationForm.contact}
                      onChange={e => {
                        // Only allow up to 10 digits
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        handleInputChange({ target: { name: 'contact', value: val } });
                      }}
                      className={`form-input ${formErrors.contact ? 'error' : ''}`}
                      placeholder="Contact number (10 digits)"
                      maxLength={10}
                    />
                    {formErrors.contact && <span className="error-text">{formErrors.contact}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Food Category</label>
                    <select
                      name="foodCategory"
                      value={donationForm.foodCategory}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="Veg">Vegetarian</option>
                      <option value="Non-Veg">Non-Vegetarian</option>
                      <option value="Snacks">Snacks</option>
                      <option value="Beverages">Beverages</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Food Type</label>
                    <input
                      type="text"
                      name="foodType"
                      value={donationForm.foodType}
                      onChange={handleInputChange}
                      className={`form-input ${formErrors.foodType ? 'error' : ''}`}
                      placeholder="e.g., Biryani, Fried Rice"
                    />
                    {formErrors.foodType && <span className="error-text">{formErrors.foodType}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Estimated Count to Serve</label>
                    <input
                      type="number"
                      name="estimatedCount"
                      value={donationForm.estimatedCount}
                      onChange={e => {
                        // Only allow positive integers
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        if (val === '' || parseInt(val) > 0) {
                          handleInputChange({ target: { name: 'estimatedCount', value: val } });
                        }
                      }}
                      className={`form-input ${formErrors.estimatedCount ? 'error' : ''}`}
                      placeholder="Number of people"
                      min="1"
                      inputMode="numeric"
                      pattern="[0-9]*"
                    />
                    {formErrors.estimatedCount && <span className="error-text">{formErrors.estimatedCount}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Quantity</label>
                    <input
                      type="text"
                      name="quantity"
                      value={donationForm.quantity}
                      onChange={e => {
                        // Only allow positive integers
                        const val = e.target.value.replace(/\D/g, '');
                        handleInputChange({ target: { name: 'quantity', value: val } });
                      }}
                      className={`form-input ${formErrors.quantity ? 'error' : ''}`}
                      placeholder="e.g., 50"
                    />
                    {formErrors.quantity && <span className="error-text">{formErrors.quantity}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Expiry Date</label>
                    <input
                      type="date"
                      name="expiryDate"
                      value={donationForm.expiryDate}
                      onChange={e => {
                        // Only allow years up to 2100 and exactly 4 digits
                        const val = e.target.value;
                        const year = parseInt(val.split('-')[0]);
                        if (year <= 2100 && val.split('-')[0].length === 4) {
                          handleInputChange(e);
                        }
                      }}
                      className={`form-input ${formErrors.expiryDate ? 'error' : ''}`}
                    />
                    {formErrors.expiryDate && <span className="error-text">{formErrors.expiryDate}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Pickup Time</label>
                    <input
                      type="datetime-local"
                      name="pickupTime"
                      value={donationForm.pickupTime}
                      onChange={handleInputChange}
                      className={`form-input ${formErrors.pickupTime ? 'error' : ''}`}
                    />
                    {formErrors.pickupTime && <span className="error-text">{formErrors.pickupTime}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={donationForm.location}
                    onChange={handleInputChange}
                    className={`form-input ${formErrors.location ? 'error' : ''}`}
                    placeholder="Pickup address"
                  />
                  {formErrors.location && <span className="error-text">{formErrors.location}</span>}
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn btn-outline" onClick={() => setShowDonationForm(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Submit Donation
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonorDashboard; 


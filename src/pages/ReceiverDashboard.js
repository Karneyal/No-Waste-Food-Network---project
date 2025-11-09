import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';
import { useEffect } from 'react';

const mockFoodList = [
  {
    id: 1,
    donorName: 'John Donor',
    contact: '9876543210',
    foodCategory: 'Veg',
    foodType: 'Fried Rice',
    estimatedCount: 30,
    quantity: 30,
    expiryDate: '2024-06-30',
    pickupTime: '2024-06-25T18:00',
    location: 'Green Street, City Center',
    available: 30
  },
  {
    id: 2,
    donorName: 'Jane Donor',
    contact: '9123456780',
    foodCategory: 'Snacks',
    foodType: 'Samosa',
    estimatedCount: 50,
    quantity: 50,
    expiryDate: '2024-06-28',
    pickupTime: '2024-06-25T15:00',
    location: 'Orange Avenue, Downtown',
    available: 50
  }
];

const ReceiverDashboard = ({ user, logout }) => {
  const [filters, setFilters] = useState({
    location: '',
    foodCategory: '',
    foodType: '',
    quantity: '',
    count: ''
  });
  const [foodList, setFoodList] = useState([]);
  const [requestHistory, setRequestHistory] = useState([]);

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const response = await fetch('https://f0b871qege.execute-api.us-east-1.amazonaws.com/Reciever_function');
        const data = await response.json();
  
        if (response.ok) {
          const formatted = data.map(item => ({
            id: item.donationId,
            donorName: item.donorName,
            contact: item.contact,
            foodCategory: item.category,
            foodType: item.foodType,
            estimatedCount: item.count,
            quantity: item.quantity,
            expiryDate: item.expiryDate,
            pickupTime: item.pickupTime,
            location: item.location,
            available: item.count
          }));
          setFoodList(formatted);
        } else {
          console.error('Error fetching donations:', data.error);
        }
      } catch (err) {
        console.error('Fetch error:', err);
      }
    };
  
    fetchDonations();
  }, []);

  // Check for status updates from localStorage
  useEffect(() => {
    const checkStatusUpdates = () => {
      const storedRequests = JSON.parse(localStorage.getItem('foodRequests') || '[]');
      const userRequests = storedRequests.filter(req => 
        req.receiverId === user?.uid || req.receiverEmail === user?.email
      );
      
      if (userRequests.length > 0) {
        setRequestHistory(userRequests);
      }
    };

    // Check immediately
    checkStatusUpdates();

    // Check every 5 seconds for updates
    const interval = setInterval(checkStatusUpdates, 5000);

    return () => clearInterval(interval);
  }, [user?.uid, user?.email]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const filteredFood = foodList.filter(food => {
    return (
      (!filters.location || food.location.toLowerCase().includes(filters.location.toLowerCase())) &&
      (!filters.foodCategory || food.foodCategory === filters.foodCategory) &&
      (!filters.foodType || food.foodType.toLowerCase().includes(filters.foodType.toLowerCase())) &&
      (!filters.quantity || food.quantity >= Number(filters.quantity)) &&
      (!filters.count || food.estimatedCount >= Number(filters.count))
    );
  });

  const handleRequestPickup = async (food) => {
    try {
      // Create a direct request without a form
      const requestData = {
        id: Date.now(),
        receiverName: user?.name || 'Unknown Receiver',
        receiverEmail: user?.email || '',
        receiverId: user?.uid || '',
        foodRequested: food.foodType,
        quantity: Math.min(10, food.available), // Default to 10 or available amount
        pickupTime: food.pickupTime,
        donorName: food.donorName,
        donorContact: food.contact,
        donorId: food.donorId || 'unknown', // You might need to add this to your food data
        location: food.location,
        status: 'Pending',
        requestDate: new Date().toISOString(),
        donationId: food.id
      };

      // Add to local request history for immediate feedback
      setRequestHistory(prev => [requestData, ...prev]);

      // Store in localStorage for donor access (temporary solution)
      const existingRequests = JSON.parse(localStorage.getItem('foodRequests') || '[]');
      existingRequests.push(requestData);
      localStorage.setItem('foodRequests', JSON.stringify(existingRequests));

      // Option 1: Send to API if you have one
      try {
        // Uncomment and modify this when you have an API endpoint
        // const response = await fetch('YOUR_API_ENDPOINT/requests', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(requestData)
        // });
        // if (!response.ok) throw new Error('Failed to send request to server');
      } catch (apiError) {
        console.log('API not available, using localStorage only');
      }

      // Show success message
      alert(`Request sent to ${food.donorName} for ${food.foodType}! You will be notified when they respond.`);

    } catch (error) {
      console.error('Error creating request:', error);
      alert('Failed to create request. Please try again.');
    }
  };

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
          <p>Receiver Dashboard</p>
        </div>
        <ul className="sidebar-nav">
          <li><Link to="/receiver-dashboard" className="active">Dashboard</Link></li>
          <li><a href="#available-food">Available Food</a></li>
          <li><a href="#history">History</a></li>
          <li><Link to="/profile">Profile</Link></li>
          <li><button onClick={logout} className="sidebar-logout">Logout</button></li>
        </ul>
      </div>
      {/* Main Content */}
      <div className="main-content">
        <div className="dashboard-header">
          <h1>Welcome, {user?.name}!</h1>
          <p>Find and request surplus food from local donors</p>
        </div>
        {/* Filters */}
        <div className="card mb-20">
          <h2>Filter Available Food</h2>
          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Location</label>
              <input type="text" name="location" value={filters.location} onChange={handleFilterChange} className="form-input" placeholder="Enter location" />
            </div>
            <div className="form-group">
              <label className="form-label">Food Category</label>
              <select name="foodCategory" value={filters.foodCategory} onChange={handleFilterChange} className="form-select">
                <option value="">All</option>
                <option value="Veg">Vegetarian</option>
                <option value="Non-Veg">Non-Vegetarian</option>
                <option value="Snacks">Snacks</option>
                <option value="Beverages">Beverages</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Food Type</label>
              <input type="text" name="foodType" value={filters.foodType} onChange={handleFilterChange} className="form-input" placeholder="e.g., Biryani" />
            </div>
            <div className="form-group">
              <label className="form-label">Min Quantity</label>
              <input type="number" name="quantity" value={filters.quantity} onChange={e => {
                const val = e.target.value;
                if (val === '' || parseInt(val) >= 0) {
                  handleFilterChange(e);
                }
              }} className="form-input" placeholder="e.g., 10" min="0" />
            </div>
            <div className="form-group">
              <label className="form-label">Min Count to Serve</label>
              <input type="number" name="count" value={filters.count} onChange={e => {
                const val = e.target.value;
                if (val === '' || parseInt(val) >= 0) {
                  handleFilterChange(e);
                }
              }} className="form-input" placeholder="e.g., 5" min="0" />
            </div>
          </div>
        </div>
        {/* Food Listing */}
        <section id="available-food">
          <h2>Available Food</h2>
          <div className="grid grid-2">
            {filteredFood.length === 0 && <div>No food available matching your filters.</div>}
            {filteredFood.map(food => (
              <div className="card" key={food.id}>
                <h3>{food.foodType} <span className="status-badge status-confirmed" style={{fontSize:'10px',marginLeft:'8px'}}>{food.foodCategory}</span></h3>
                <p><strong>Donor:</strong> {food.donorName}</p>
                <p><strong>Location:</strong> {food.location}</p>
                <p><strong>Available:</strong> {food.available} servings</p>
                <p><strong>Pickup Time:</strong> {new Date(food.pickupTime).toLocaleString()}</p>
                <button 
                  className="btn btn-primary mt-20" 
                  onClick={() => handleRequestPickup(food)}
                >
                  Request Pickup
                </button>
              </div>
            ))}
          </div>
        </section>
        {/* Request History */}
        <section id="history" className="mt-20">
          <h2>Request History</h2>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Food Type</th>
                  <th>Donor</th>
                  <th>Quantity</th>
                  <th>Pickup Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {requestHistory.length === 0 && (
                  <tr><td colSpan="5">No requests yet.</td></tr>
                )}
                {requestHistory.map(req => (
                  <tr key={req.id}>
                    <td>{req.foodRequested}</td>
                    <td>{req.donorName}</td>
                    <td>{req.quantity}</td>
                    <td>{req.pickupTime ? new Date(req.pickupTime).toLocaleString() : ''}</td>
                    <td><span className={`status-badge ${getStatusBadgeClass(req.status)}`}>{req.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ReceiverDashboard; 
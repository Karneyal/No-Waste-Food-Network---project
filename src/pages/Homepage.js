import React from 'react';
import { Link } from 'react-router-dom';
import './Homepage.css';

const Homepage = () => {
  return (
    <div className="homepage">
      {/* Navigation */}
      <nav className="navbar">
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
          <div className="nav-brand" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <img src={process.env.PUBLIC_URL + '/ZeroWasteConnect_Logo.png'} alt="No Waste Food Network Logo" style={{ height: '100px', width: '160px', objectFit: 'contain' }} />
            <h1 style={{ fontSize: '2.7rem', fontWeight: 800, letterSpacing: '1px', margin: 0, color: '#FFA500' }}>No Waste Food Network</h1>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Connecting Excess to Need, One Meal at a Time</h1>
            <p>Join our community to reduce food waste and help those in need. Donate surplus food or request food assistance through our secure platform.</p>
            <div className="hero-buttons">
              <Link to="/register" className="btn btn-primary">Register Now</Link>
              <Link to="/login" className="btn btn-secondary">Existing User? Login</Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-icon">1</div>
              <h3>Register</h3>
              <p>Create an account and choose your role as a donor, receiver, or admin to get started with the platform.</p>
            </div>
            <div className="step-card">
              <div className="step-icon">2</div>
              <h3>Connect</h3>
              <p>Donors list surplus food items while receivers browse and request available donations through the platform.</p>
            </div>
            <div className="step-card">
              <div className="step-icon">3</div>
              <h3>Distribute</h3>
              <p>Coordinate pickup times and locations to ensure smooth food distribution and reduce waste effectively.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Why Choose No Waste Food Network?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>🌱 Reduce Food Waste</h3>
              <p>Help prevent perfectly good food from going to waste by connecting with those who need it.</p>
            </div>
            <div className="feature-card">
              <h3>🤝 Community Support</h3>
              <p>Build stronger communities by supporting local food banks and individuals in need.</p>
            </div>
            <div className="feature-card">
              <h3>🔒 Secure Platform</h3>
              <p>Safe and verified user system ensuring trustworthy connections between donors and receivers.</p>
            </div>
            <div className="feature-card">
              <h3>📱 Easy to Use</h3>
              <p>Simple and intuitive interface making it easy to donate or request food assistance.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>&copy; 2024 No Waste Food Network. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Homepage; 
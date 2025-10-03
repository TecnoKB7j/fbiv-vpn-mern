import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const NavbarComponent = ({ onLogin, onRegister }) => {
  const { isLoggedIn, user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
  };

  return (
    <Navbar expand="lg" style={{ background: '#00264d' }} variant="dark">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold">
          FBIV <span className="text-info">VPN</span>
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" className={isActive('/') ? 'active' : ''}>
              🏠 Home
            </Nav.Link>
            <Nav.Link as={Link} to="/servers" className={isActive('/servers') ? 'active' : ''}>
              🌍 Servers
            </Nav.Link>
            {isLoggedIn && (
              <Nav.Link as={Link} to="/dashboard" className={isActive('/dashboard') ? 'active' : ''}>
                📊 Dashboard
              </Nav.Link>
            )}
            <Nav.Link as={Link} to="/speedtest" className={isActive('/speedtest') ? 'active' : ''}>
              ⚡ Speed Test
            </Nav.Link>
            <Nav.Link as={Link} to="/security" className={isActive('/security') ? 'active' : ''}>
              🛡️ Security
            </Nav.Link>
            <Nav.Link as={Link} to="/pricing" className={isActive('/pricing') ? 'active' : ''}>
              💎 Pricing
            </Nav.Link>
            {isLoggedIn && (
              <Nav.Link as={Link} to="/account" className={isActive('/account') ? 'active' : ''}>
                👤 Account
              </Nav.Link>
            )}
          </Nav>
          
          <div className="d-flex">
            {!isLoggedIn ? (
              <>
                <Button variant="outline-light" className="me-2" onClick={onLogin}>
                  Login
                </Button>
                <Button variant="info" onClick={onRegister}>
                  Join FBIV
                </Button>
              </>
            ) : (
              <div className="d-flex align-items-center">
                <span className="text-light me-3">
                  Welcome, {user?.name}
                </span>
                <Button variant="danger" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            )}
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavbarComponent;
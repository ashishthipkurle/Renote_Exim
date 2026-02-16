import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo3.png';

const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <header>
            <div className="header-container">
                <div className="logo">
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src={logo} alt="GlobalTrade Exports Logo" style={{ height: '50px', width: 'auto' }} />
                        <div className="logo-text">
                            <h1>Ranote Exim</h1>
                            <p>Exporting Excellence, Importing Trust</p>
                        </div>
                    </Link>
                </div>

                <nav className={isMenuOpen ? 'active' : ''}>
                    <ul>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/about">About Us</Link></li>
                        <li><Link to="/products">Products</Link></li>
                        <li><Link to="/contact">Contact</Link></li>
                    </ul>
                </nav>

                <button className="mobile-menu-toggle" onClick={toggleMenu}>
                    <i className="fas fa-bars"></i>
                </button>
            </div>
        </header>
    );
};

export default Header;

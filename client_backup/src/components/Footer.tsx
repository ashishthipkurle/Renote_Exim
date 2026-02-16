import React from 'react';
import { Link } from 'react-router-dom';
import logoFooter from '../assets/logo4-transparent.png';

const Footer: React.FC = () => {
    return (
        <footer>
            <div className="container">
                <div className="footer-content">
                    <div className="footer-section">
                        <div style={{ marginBottom: '15px' }}>
                            <img src={logoFooter} alt="GlobalTrade Exports" style={{ height: '60px', width: 'auto' }} />
                        </div>
                        <p>We are a leading export company specializing in high-quality products across multiple industries. Our commitment to excellence and customer satisfaction has made us a trusted partner in international trade.</p>
                        <div className="social-links">
                            <a href="#"><i className="fab fa-facebook-f"></i></a>
                            <a href="#"><i className="fab fa-twitter"></i></a>
                            <a href="#"><i className="fab fa-linkedin-in"></i></a>
                            <a href="#"><i className="fab fa-instagram"></i></a>
                        </div>
                    </div>

                    <div className="footer-section">
                        <h3>Quick Links</h3>
                        <Link to="/">Home</Link>
                        <Link to="/about">About Us</Link>
                        <Link to="/products">Products</Link>
                        <Link to="/contact">Contact Us</Link>
                    </div>

                    <div className="footer-section">
                        <h3>Product Categories</h3>
                        <Link to="/products/chemicals">Chemicals Industry</Link>
                        <Link to="/products/machines">Machines & Devices</Link>
                        <Link to="/products/textiles">Home Textiles</Link>
                        <Link to="/products/medical">Medical Equipment</Link>
                        <Link to="/products/handicraft">Handicrafts</Link>
                    </div>

                    <div className="footer-section">
                        <h3>Contact Information</h3>
                        <p><i className="fas fa-map-marker-alt"></i> Business Plaza, International Trade Center<br />Mumbai, India</p>
                        <p><i className="fas fa-phone"></i> +91 98765 43210</p>
                        <p><i className="fas fa-envelope"></i> info@ranoteexim.com</p>
                        <p><i className="fas fa-clock"></i> Monday to Saturday<br />10:00 AM to 7:00 PM</p>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; <span className="current-year">{new Date().getFullYear()}</span> Ranote Exim. All Rights Reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

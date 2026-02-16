import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
    return (
        <>
            <section className="hero">
                <div className="hero-content">
                    <h1>Connecting Global Markets with Quality Products</h1>
                    <p>Your trusted partner in international trade, delivering excellence across continents</p>
                    <div className="hero-buttons">
                        <Link to="/products" className="btn btn-primary">Explore Products</Link>
                        <Link to="/contact" className="btn btn-white">Get In Touch</Link>
                    </div>
                </div>
            </section>

            <section className="stats">
                <div className="container">
                    <div className="stats-grid">
                        <div className="stat-card">
                            <i className="fas fa-calendar-alt"></i>
                            <h3>15+</h3>
                            <p>Years of Experience</p>
                        </div>
                        <div className="stat-card">
                            <i className="fas fa-globe-americas"></i>
                            <h3>50+</h3>
                            <p>Countries Served</p>
                        </div>
                        <div className="stat-card">
                            <i className="fas fa-smile"></i>
                            <h3>500+</h3>
                            <p>Happy Clients</p>
                        </div>
                        <div className="stat-card">
                            <i className="fas fa-box"></i>
                            <h3>1000+</h3>
                            <p>Products Exported</p>
                        </div>
                    </div>
                </div>
            </section>

            <section>
                <div className="container">
                    <div className="section-title">
                        <h2>Welcome to Ranote Exim</h2>
                        <p>Your Trusted Export Partner for Quality Products Worldwide</p>
                    </div>
                    <div className="about-content">
                        <div className="about-text">
                            <h3>Leading the Way in International Trade</h3>
                            <p>With over 15 years of experience in global trade, Ranote Exim has established itself as a reliable partner for businesses worldwide. We specialize in exporting high-quality products across multiple industries, ensuring seamless transactions and timely delivery.</p>
                            <p>Our commitment to excellence, combined with our deep understanding of international markets, makes us the preferred choice for businesses looking to expand their global reach. We take pride in building long-term relationships based on trust, quality, and reliability.</p>
                            <Link to="/about" className="btn btn-primary">Learn More About Us</Link>
                        </div>
                        <div className="about-image">
                            <img src="https://images.unsplash.com/photo-1553413077-190dd305871c?w=800" alt="Global Trade" />
                        </div>
                    </div>
                </div>
            </section>

            <section style={{ background: 'var(--bg-light)' }}>
                <div className="container">
                    <div className="section-title">
                        <h2>Our Product Categories</h2>
                        <p>Diverse Range of Quality Products for Global Markets</p>
                    </div>
                    <div className="products-grid">
                        <div className="product-card">
                            <div className="product-card-img">
                                <img src="https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800" alt="Chemicals Industry" />
                                <div className="product-card-overlay">
                                    <i className="fas fa-flask"></i>
                                </div>
                            </div>
                            <div className="product-card-content">
                                <h3>Chemicals Industry</h3>
                                <p>High-grade industrial chemicals, laboratory reagents, and specialty compounds for diverse applications.</p>
                                <Link to="/products/chemicals" className="btn btn-outline">Learn More</Link>
                            </div>
                        </div>

                        <div className="product-card">
                            <div className="product-card-img">
                                <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800" alt="Machines & Devices" />
                                <div className="product-card-overlay">
                                    <i className="fas fa-cogs"></i>
                                </div>
                            </div>
                            <div className="product-card-content">
                                <h3>Machines & Devices</h3>
                                <p>Advanced machinery, industrial equipment, and automation devices for modern manufacturing needs.</p>
                                <Link to="/products/machines" className="btn btn-outline">Learn More</Link>
                            </div>
                        </div>

                        <div className="product-card">
                            <div className="product-card-img">
                                <img src="https://images.unsplash.com/photo-1522199710521-72d69614c702?w=800" alt="Home Textiles" />
                                <div className="product-card-overlay">
                                    <i className="fas fa-tshirt"></i>
                                </div>
                            </div>
                            <div className="product-card-content">
                                <h3>Home Textiles</h3>
                                <p>Premium quality fabrics, bed linens, curtains, and textile products for homes and hospitality.</p>
                                <Link to="/products/textiles" className="btn btn-outline">Learn More</Link>
                            </div>
                        </div>

                        <div className="product-card">
                            <div className="product-card-img">
                                <img src="https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=800" alt="Medical Equipment" />
                                <div className="product-card-overlay">
                                    <i className="fas fa-heartbeat"></i>
                                </div>
                            </div>
                            <div className="product-card-content">
                                <h3>Medical & Surgical Equipment</h3>
                                <p>State-of-the-art medical devices, surgical instruments, and healthcare equipment.</p>
                                <Link to="/products/medical" className="btn btn-outline">Learn More</Link>
                            </div>
                        </div>

                        <div className="product-card">
                            <div className="product-card-img">
                                <img src="https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800" alt="Handicrafts" />
                                <div className="product-card-overlay">
                                    <i className="fas fa-palette"></i>
                                </div>
                            </div>
                            <div className="product-card-content">
                                <h3>Handicraft Industry</h3>
                                <p>Exquisite handcrafted items, traditional art pieces, and unique decorative products.</p>
                                <Link to="/products/handicraft" className="btn btn-outline">Learn More</Link>
                            </div>
                        </div>

                        <div className="product-card">
                            <div className="product-card-img">
                                <img src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800" alt="More Products" />
                                <div className="product-card-overlay">
                                    <i className="fas fa-plus-circle"></i>
                                </div>
                            </div>
                            <div className="product-card-content">
                                <h3>And Much More</h3>
                                <p>Explore our complete range of products tailored to meet your specific business needs.</p>
                                <Link to="/products" className="btn btn-outline">View All Products</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section>
                <div className="container">
                    <div className="section-title">
                        <h2>Why Choose Ranote Exim?</h2>
                        <p>Excellence in Every Aspect of International Trade</p>
                    </div>
                    <div className="features-grid">
                        <div className="feature-card">
                            <i className="fas fa-certificate"></i>
                            <h3>Quality Assurance</h3>
                            <p>All our products meet international quality standards and undergo rigorous testing before export.</p>
                        </div>
                        <div className="feature-card">
                            <i className="fas fa-shipping-fast"></i>
                            <h3>Timely Delivery</h3>
                            <p>We ensure prompt and reliable delivery to all corners of the world with efficient logistics.</p>
                        </div>
                        <div className="feature-card">
                            <i className="fas fa-handshake"></i>
                            <h3>Trusted Partner</h3>
                            <p>15+ years of building strong relationships with clients and suppliers across the globe.</p>
                        </div>
                        <div className="feature-card">
                            <i className="fas fa-dollar-sign"></i>
                            <h3>Competitive Pricing</h3>
                            <p>Get the best value for your investment with our competitive pricing and flexible payment terms.</p>
                        </div>
                        <div className="feature-card">
                            <i className="fas fa-headset"></i>
                            <h3>24/7 Support</h3>
                            <p>Our dedicated team is always available to assist you with your queries and requirements.</p>
                        </div>
                        <div className="feature-card">
                            <i className="fas fa-globe"></i>
                            <h3>Global Network</h3>
                            <p>With presence in 50+ countries, we facilitate seamless international trade operations.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="cta">
                <div className="container">
                    <div className="cta-content">
                        <h2>Ready to Expand Your Business Globally?</h2>
                        <p>Let's discuss how Ranote Exim can help you reach new markets and grow your business</p>
                        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link to="/contact" className="btn btn-primary">Request a Quote</Link>
                            <Link to="/products" className="btn btn-white">Browse Products</Link>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Home;

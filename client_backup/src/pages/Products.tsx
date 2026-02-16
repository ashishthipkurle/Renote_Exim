import React from 'react';
import { Link } from 'react-router-dom';

const Products: React.FC = () => {
    return (
        <>
            {/* Page Hero */}
            <section className="product-hero">
                <div className="product-hero-content">
                    <h1>Our Product Portfolio</h1>
                    <p>Quality Products Across Multiple Industries for Global Markets</p>
                </div>
            </section>

            {/* Products Introduction */}
            <section>
                <div className="container">
                    <div className="section-title">
                        <h2>Comprehensive Product Range</h2>
                        <p>We offer a diverse selection of high-quality products tailored to meet the demands of international markets</p>
                    </div>
                    <div className="product-intro">
                        <p>Ranote Exim takes pride in offering an extensive range of products across various industries. Each product category is carefully curated to meet international quality standards and cater to the specific needs of our global clientele. Our commitment to excellence ensures that every product we export represents the best in its category.</p>
                    </div>
                </div>
            </section>

            {/* Products Grid */}
            <section style={{ background: 'var(--bg-light)', paddingTop: 0 }}>
                <div className="container">
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
                                <p>Premium industrial chemicals, laboratory reagents, specialty compounds, and chemical raw materials for various applications. Sourced from certified manufacturers with strict quality control.</p>
                                <ul style={{ listStyle: 'none', padding: 0, margin: '15px 0', color: 'var(--text-light)', fontSize: '14px' }}>
                                    <li><i className="fas fa-check" style={{ color: 'var(--secondary-color)', marginRight: '8px' }}></i> Industrial Chemicals</li>
                                    <li><i className="fas fa-check" style={{ color: 'var(--secondary-color)', marginRight: '8px' }}></i> Laboratory Reagents</li>
                                    <li><i className="fas fa-check" style={{ color: 'var(--secondary-color)', marginRight: '8px' }}></i> Specialty Compounds</li>
                                </ul>
                                <Link to="/products/chemicals" className="btn btn-primary">View Details</Link>
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
                                <p>State-of-the-art machinery, industrial equipment, automation devices, and precision instruments designed for modern manufacturing and production facilities worldwide.</p>
                                <ul style={{ listStyle: 'none', padding: 0, margin: '15px 0', color: 'var(--text-light)', fontSize: '14px' }}>
                                    <li><i className="fas fa-check" style={{ color: 'var(--secondary-color)', marginRight: '8px' }}></i> Industrial Machinery</li>
                                    <li><i className="fas fa-check" style={{ color: 'var(--secondary-color)', marginRight: '8px' }}></i> Automation Equipment</li>
                                    <li><i className="fas fa-check" style={{ color: 'var(--secondary-color)', marginRight: '8px' }}></i> Precision Instruments</li>
                                </ul>
                                <Link to="/products/machines" className="btn btn-primary">View Details</Link>
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
                                <p>Luxurious fabrics, premium bed linens, elegant curtains, decorative cushions, and high-quality textile products for residential and commercial hospitality sectors.</p>
                                <ul style={{ listStyle: 'none', padding: 0, margin: '15px 0', color: 'var(--text-light)', fontSize: '14px' }}>
                                    <li><i className="fas fa-check" style={{ color: 'var(--secondary-color)', marginRight: '8px' }}></i> Bed Linens & Sheets</li>
                                    <li><i className="fas fa-check" style={{ color: 'var(--secondary-color)', marginRight: '8px' }}></i> Curtains & Drapes</li>
                                    <li><i className="fas fa-check" style={{ color: 'var(--secondary-color)', marginRight: '8px' }}></i> Towels & Bathrobes</li>
                                </ul>
                                <Link to="/products/textiles" className="btn btn-primary">View Details</Link>
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
                                <p>Advanced medical devices, surgical instruments, diagnostic equipment, and healthcare products meeting international medical standards and certifications.</p>
                                <ul style={{ listStyle: 'none', padding: 0, margin: '15px 0', color: 'var(--text-light)', fontSize: '14px' }}>
                                    <li><i className="fas fa-check" style={{ color: 'var(--secondary-color)', marginRight: '8px' }}></i> Surgical Instruments</li>
                                    <li><i className="fas fa-check" style={{ color: 'var(--secondary-color)', marginRight: '8px' }}></i> Diagnostic Equipment</li>
                                    <li><i className="fas fa-check" style={{ color: 'var(--secondary-color)', marginRight: '8px' }}></i> Hospital Furniture</li>
                                </ul>
                                <Link to="/products/medical" className="btn btn-primary">View Details</Link>
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
                                <p>Exquisite handcrafted items, traditional art pieces, decorative products, and unique cultural artifacts that showcase craftsmanship and artistic heritage.</p>
                                <ul style={{ listStyle: 'none', padding: 0, margin: '15px 0', color: 'var(--text-light)', fontSize: '14px' }}>
                                    <li><i className="fas fa-check" style={{ color: 'var(--secondary-color)', marginRight: '8px' }}></i> Decorative Items</li>
                                    <li><i className="fas fa-check" style={{ color: 'var(--secondary-color)', marginRight: '8px' }}></i> Traditional Crafts</li>
                                    <li><i className="fas fa-check" style={{ color: 'var(--secondary-color)', marginRight: '8px' }}></i> Artistic Artifacts</li>
                                </ul>
                                <Link to="/products/handicraft" className="btn btn-primary">View Details</Link>
                            </div>
                        </div>

                        <div className="product-card">
                            <div className="product-card-img">
                                <img src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800" alt="Custom Solutions" />
                                <div className="product-card-overlay">
                                    <i className="fas fa-handshake"></i>
                                </div>
                            </div>
                            <div className="product-card-content">
                                <h3>Custom Export Solutions</h3>
                                <p>Don't see what you're looking for? We specialize in sourcing custom products tailored to your specific requirements. Contact us to discuss your unique needs.</p>
                                <ul style={{ listStyle: 'none', padding: 0, margin: '15px 0', color: 'var(--text-light)', fontSize: '14px' }}>
                                    <li><i className="fas fa-check" style={{ color: 'var(--secondary-color)', marginRight: '8px' }}></i> Custom Sourcing</li>
                                    <li><i className="fas fa-check" style={{ color: 'var(--secondary-color)', marginRight: '8px' }}></i> Tailored Solutions</li>
                                    <li><i className="fas fa-check" style={{ color: 'var(--secondary-color)', marginRight: '8px' }}></i> Flexible Orders</li>
                                </ul>
                                <Link to="/contact" className="btn btn-primary">Contact Us</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Our Products */}
            <section>
                <div className="container">
                    <div className="section-title">
                        <h2>Why Choose Our Products?</h2>
                        <p>Quality, Reliability, and Excellence in Every Export</p>
                    </div>
                    <div className="features-grid">
                        <div className="feature-card">
                            <i className="fas fa-certificate"></i>
                            <h3>Certified Quality</h3>
                            <p>All products are sourced from certified manufacturers and undergo rigorous quality checks before export.</p>
                        </div>
                        <div className="feature-card">
                            <i className="fas fa-check-circle"></i>
                            <h3>International Standards</h3>
                            <p>Products comply with international quality and safety standards including ISO, CE, FDA where applicable.</p>
                        </div>
                        <div className="feature-card">
                            <i className="fas fa-shield-alt"></i>
                            <h3>Quality Assurance</h3>
                            <p>Comprehensive quality assurance program with multiple checkpoints throughout the supply chain.</p>
                        </div>
                        <div className="feature-card">
                            <i className="fas fa-dollar-sign"></i>
                            <h3>Competitive Pricing</h3>
                            <p>Direct sourcing relationships enable us to offer competitive pricing without compromising quality.</p>
                        </div>
                        <div className="feature-card">
                            <i className="fas fa-truck"></i>
                            <h3>Reliable Logistics</h3>
                            <p>Efficient supply chain management ensures timely delivery to any destination worldwide.</p>
                        </div>
                        <div className="feature-card">
                            <i className="fas fa-file-alt"></i>
                            <h3>Complete Documentation</h3>
                            <p>Full compliance with export documentation, certificates, and regulatory requirements.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="cta">
                <div className="container">
                    <div className="cta-content">
                        <h2>Ready to Explore Our Product Range?</h2>
                        <p>Contact us today to discuss your requirements and get a customized quote</p>
                        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link to="/contact" className="btn btn-primary">Request a Quote</Link>
                            <Link to="/about" className="btn btn-white">Learn About Us</Link>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Products;

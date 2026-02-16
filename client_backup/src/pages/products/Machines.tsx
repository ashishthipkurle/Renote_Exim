import React from 'react';
import { Link } from 'react-router-dom';

const ProductsMachines: React.FC = () => {
    return (
        <>
            {/* Product Hero */}
            <section className="product-hero" style={{ backgroundImage: 'linear-gradient(135deg, #1a3a52 0%, #2c5f7f 100%)' }}>
                <div className="product-hero-content">
                    <i className="fas fa-cogs" style={{ fontSize: '60px', marginBottom: '20px', opacity: 0.9 }}></i>
                    <h1>Machines & Devices Industry</h1>
                    <p>Advanced Machinery and Automation Solutions for Modern Manufacturing</p>
                </div>
            </section>

            {/* Product Introduction */}
            <section className="product-content-section">
                <div className="container">
                    <div className="product-intro">
                        <h2 style={{ textAlign: 'center', marginBottom: '25px', fontSize: '32px' }}>Cutting-Edge Industrial Equipment</h2>
                        <p>Ranote Exim offers a comprehensive range of industrial machinery, precision equipment, and automation devices designed to enhance productivity and efficiency in modern manufacturing facilities. Our machine portfolio includes equipment from leading manufacturers, ensuring reliability, durability, and optimal performance.</p>
                        <p>Whether you need CNC machines, packaging equipment, textile machinery, or specialized industrial devices, we provide end-to-end solutions including equipment sourcing, technical specifications consultation, installation support, and after-sales service coordination.</p>
                    </div>
                </div>
            </section>

            {/* Product Categories */}
            <section style={{ background: 'var(--bg-light)', paddingTop: '60px' }}>
                <div className="container">
                    <div className="section-title">
                        <h2>Our Machinery & Equipment Range</h2>
                        <p>Comprehensive Solutions Across Multiple Industrial Sectors</p>
                    </div>

                    <div className="product-features-list">
                        <div className="product-feature-item">
                            <i className="fas fa-robot"></i>
                            <div>
                                <h4>CNC Machines & Tools</h4>
                                <p>Computer-controlled machining centers, lathes, mills, and precision cutting equipment</p>
                            </div>
                        </div>

                        <div className="product-feature-item">
                            <i className="fas fa-box"></i>
                            <div>
                                <h4>Packaging Machinery</h4>
                                <p>Automated packing systems, labeling machines, and sealing equipment</p>
                            </div>
                        </div>

                        <div className="product-feature-item">
                            <i className="fas fa-tshirt"></i>
                            <div>
                                <h4>Textile Machinery</h4>
                                <p>Weaving looms, spinning machines, dyeing equipment, and garment manufacturing tools</p>
                            </div>
                        </div>

                        <div className="product-feature-item">
                            <i className="fas fa-bread-slice"></i>
                            <div>
                                <h4>Food Processing Equipment</h4>
                                <p>Industrial mixers, processing lines, and food manufacturing machinery</p>
                            </div>
                        </div>

                        <div className="product-feature-item">
                            <i className="fas fa-print"></i>
                            <div>
                                <h4>Printing Machines</h4>
                                <p>Digital and offset printing equipment, flexographic presses, and finishing machines</p>
                            </div>
                        </div>

                        <div className="product-feature-item">
                            <i className="fas fa-bolt"></i>
                            <div>
                                <h4>Power Generation Equipment</h4>
                                <p>Generators, transformers, and electrical power distribution systems</p>
                            </div>
                        </div>

                        <div className="product-feature-item">
                            <i className="fas fa-industry"></i>
                            <div>
                                <h4>Material Handling Equipment</h4>
                                <p>Conveyors, forklifts, cranes, and automated storage systems</p>
                            </div>
                        </div>

                        <div className="product-feature-item">
                            <i className="fas fa-microchip"></i>
                            <div>
                                <h4>Automation & Control Systems</h4>
                                <p>PLCs, sensors, SCADA systems, and industrial automation controllers</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Product Features */}
            <section>
                <div className="container">
                    <div className="section-title">
                        <h2>Why Choose Our Machinery?</h2>
                        <p>Quality Equipment Backed by Expertise and Support</p>
                    </div>

                    <div className="features-grid">
                        <div className="feature-card">
                            <i className="fas fa-award"></i>
                            <h3>Premium Brands</h3>
                            <p>Equipment sourced from reputable manufacturers with proven track records</p>
                        </div>

                        <div className="feature-card">
                            <i className="fas fa-tools"></i>
                            <h3>Technical Specifications</h3>
                            <p>Detailed technical documentation and specifications for all equipment</p>
                        </div>

                        <div className="feature-card">
                            <i className="fas fa-shield-virus"></i>
                            <h3>Warranty Coverage</h3>
                            <p>Manufacturer warranties and extended support options available</p>
                        </div>

                        <div className="feature-card">
                            <i className="fas fa-wrench"></i>
                            <h3>Installation Support</h3>
                            <p>Coordination with technical teams for proper installation and commissioning</p>
                        </div>

                        <div className="feature-card">
                            <i className="fas fa-graduation-cap"></i>
                            <h3>Training Services</h3>
                            <p>Operator training and technical documentation in multiple languages</p>
                        </div>

                        <div className="feature-card">
                            <i className="fas fa-cog"></i>
                            <h3>Spare Parts Supply</h3>
                            <p>Easy access to genuine spare parts and maintenance components</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Product Gallery */}
            <section style={{ background: 'var(--bg-light)' }}>
                <div className="container">
                    <div className="section-title">
                        <h2>Machinery & Equipment Gallery</h2>
                        <p>Explore Our Range of Industrial Equipment</p>
                    </div>

                    <div className="product-gallery">
                        <div className="product-gallery-item">
                            <img src="https://images.unsplash.com/photo-1565191999001-551c187427bb?w=600" alt="CNC Machinery" />
                        </div>
                        <div className="product-gallery-item">
                            <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600" alt="Industrial Equipment" />
                        </div>
                        <div className="product-gallery-item">
                            <img src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600" alt="Manufacturing Tools" />
                        </div>
                        <div className="product-gallery-item">
                            <img src="https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=600" alt="Automation Systems" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Applications Section */}
            <section>
                <div className="container">
                    <div className="section-title">
                        <h2>Industries We Serve</h2>
                        <p>Machinery Solutions for Diverse Manufacturing Sectors</p>
                    </div>

                    <div className="features-grid">
                        <div className="feature-card">
                            <i className="fas fa-car"></i>
                            <h3>Automotive</h3>
                            <p>Manufacturing equipment for automotive parts and assembly</p>
                        </div>

                        <div className="feature-card">
                            <i className="fas fa-tshirt"></i>
                            <h3>Textile & Garment</h3>
                            <p>Complete textile manufacturing and garment production lines</p>
                        </div>

                        <div className="feature-card">
                            <i className="fas fa-apple-alt"></i>
                            <h3>Food & Beverage</h3>
                            <p>Food processing and packaging machinery</p>
                        </div>

                        <div className="feature-card">
                            <i className="fas fa-prescription-bottle"></i>
                            <h3>Pharmaceutical</h3>
                            <p>Pharmaceutical manufacturing and packaging equipment</p>
                        </div>

                        <div className="feature-card">
                            <i className="fas fa-newspaper"></i>
                            <h3>Printing & Packaging</h3>
                            <p>Printing presses and packaging production systems</p>
                        </div>

                        <div className="feature-card">
                            <i className="fas fa-hammer"></i>
                            <h3>Metal Fabrication</h3>
                            <p>Metal working machines and fabrication equipment</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Technical Support */}
            <section style={{ background: 'var(--bg-light)' }}>
                <div className="container">
                    <div className="section-title">
                        <h2>Comprehensive Support Services</h2>
                        <p>Beyond Equipment Supply - Your Success Partner</p>
                    </div>

                    <div className="about-content">
                        <div className="about-text">
                            <h3>End-to-End Equipment Solutions</h3>
                            <p><strong><i className="fas fa-check-circle" style={{ color: 'var(--secondary-color)' }}></i> Pre-Purchase Consultation:</strong> Expert guidance on selecting the right equipment for your specific requirements and production capacity.</p>
                            <p><strong><i className="fas fa-check-circle" style={{ color: 'var(--secondary-color)' }}></i> Technical Specifications:</strong> Detailed technical documentation, capacity sheets, and equipment performance data.</p>
                            <p><strong><i className="fas fa-check-circle" style={{ color: 'var(--secondary-color)' }}></i> Installation Coordination:</strong> We facilitate connection with technical teams for proper installation and commissioning.</p>
                            <p><strong><i className="fas fa-check-circle" style={{ color: 'var(--secondary-color)' }}></i> Operator Training:</strong> Coordinate training programs to ensure your team can operate equipment efficiently.</p>
                            <p><strong><i className="fas fa-check-circle" style={{ color: 'var(--secondary-color)' }}></i> After-Sales Support:</strong> Ongoing support for maintenance, troubleshooting, and spare parts supply.</p>
                        </div>
                        <div className="about-image">
                            <img src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800" alt="Technical Support" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Key Features */}
            <section>
                <div className="container">
                    <div className="section-title">
                        <h2>Equipment Quality Standards</h2>
                        <p>Ensuring Reliability and Performance</p>
                    </div>

                    <div className="values-grid">
                        <div className="value-card">
                            <i className="fas fa-certificate"></i>
                            <h3>CE Certification</h3>
                            <p>Equipment complies with European safety and quality standards</p>
                        </div>

                        <div className="value-card">
                            <i className="fas fa-check-double"></i>
                            <h3>ISO Compliance</h3>
                            <p>Manufactured in ISO-certified facilities with quality management systems</p>
                        </div>

                        <div className="value-card">
                            <i className="fas fa-clipboard-check"></i>
                            <h3>Factory Testing</h3>
                            <p>All equipment undergoes factory acceptance tests before shipment</p>
                        </div>

                        <div className="value-card">
                            <i className="fas fa-book"></i>
                            <h3>Documentation</h3>
                            <p>Complete technical manuals, wiring diagrams, and maintenance guides</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta">
                <div className="container">
                    <div className="cta-content">
                        <h2>Ready to Upgrade Your Manufacturing Facility?</h2>
                        <p>Contact us for detailed equipment specifications, pricing, and custom machinery solutions</p>
                        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link to="/contact" className="btn btn-primary">Request Equipment Quote</Link>
                            <Link to="/products" className="btn btn-white">View All Products</Link>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default ProductsMachines;

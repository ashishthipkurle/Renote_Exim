import React from 'react';
import { Link } from 'react-router-dom';

const ProductsChemicals: React.FC = () => {
    return (
        <>
            {/* Product Hero */}
            <section className="product-hero" style={{ backgroundImage: 'linear-gradient(135deg, #1a3a52 0%, #2c5f7f 100%)' }}>
                <div className="product-hero-content">
                    <i className="fas fa-flask" style={{ fontSize: '60px', marginBottom: '20px', opacity: 0.9 }}></i>
                    <h1>Chemicals Industry</h1>
                    <p>Premium Industrial Chemicals & Laboratory Reagents for Global Markets</p>
                </div>
            </section>

            {/* Product Introduction */}
            <section className="product-content-section">
                <div className="container">
                    <div className="product-intro">
                        <h2 style={{ textAlign: 'center', marginBottom: '25px', fontSize: '32px' }}>Quality Chemicals for Diverse Applications</h2>
                        <p>Ranote Exim is your trusted partner for sourcing high-quality industrial chemicals, laboratory reagents, and specialty compounds. We work with certified manufacturers who adhere to strict quality control standards, ensuring that every chemical product meets international specifications and safety requirements.</p>
                        <p>Our chemical product range serves diverse industries including pharmaceuticals, manufacturing, research laboratories, agriculture, water treatment, and more. With our extensive network and quality assurance processes, we guarantee reliable supply of chemicals that meet your exact requirements.</p>
                    </div>
                </div>
            </section>

            {/* Product Categories */}
            <section style={{ background: 'var(--bg-light)', paddingTop: '60px' }}>
                <div className="container">
                    <div className="section-title">
                        <h2>Our Chemical Product Range</h2>
                        <p>Comprehensive Selection Across Multiple Chemical Categories</p>
                    </div>

                    <div className="product-features-list">
                        <div className="product-feature-item">
                            <i className="fas fa-industry"></i>
                            <div>
                                <h4>Industrial Chemicals</h4>
                                <p>Acids, alkalis, solvents, and industrial-grade chemicals for manufacturing processes</p>
                            </div>
                        </div>

                        <div className="product-feature-item">
                            <i className="fas fa-vial"></i>
                            <div>
                                <h4>Laboratory Reagents</h4>
                                <p>Analytical grade chemicals for research, testing, and laboratory applications</p>
                            </div>
                        </div>

                        <div className="product-feature-item">
                            <i className="fas fa-prescription-bottle"></i>
                            <div>
                                <h4>Pharmaceutical Chemicals</h4>
                                <p>API intermediates, excipients, and pharmaceutical-grade raw materials</p>
                            </div>
                        </div>

                        <div className="product-feature-item">
                            <i className="fas fa-seedling"></i>
                            <div>
                                <h4>Agricultural Chemicals</h4>
                                <p>Fertilizers, pesticides, and agro-chemical products for crop protection</p>
                            </div>
                        </div>

                        <div className="product-feature-item">
                            <i className="fas fa-paint-brush"></i>
                            <div>
                                <h4>Specialty Chemicals</h4>
                                <p>Dyes, pigments, additives, and specialty compounds for specific applications</p>
                            </div>
                        </div>

                        <div className="product-feature-item">
                            <i className="fas fa-tint"></i>
                            <div>
                                <h4>Water Treatment Chemicals</h4>
                                <p>Coagulants, flocculants, and chemicals for water purification systems</p>
                            </div>
                        </div>

                        <div className="product-feature-item">
                            <i className="fas fa-oil-can"></i>
                            <div>
                                <h4>Petrochemicals</h4>
                                <p>Derivatives and petroleum-based chemical products for industrial use</p>
                            </div>
                        </div>

                        <div className="product-feature-item">
                            <i className="fas fa-fire"></i>
                            <div>
                                <h4>Fine Chemicals</h4>
                                <p>High-purity chemicals for specialized industrial and research applications</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Product Features */}
            <section>
                <div className="container">
                    <div className="section-title">
                        <h2>Why Choose Our Chemical Products?</h2>
                        <p>Quality, Safety, and Compliance Guaranteed</p>
                    </div>

                    <div className="features-grid">
                        <div className="feature-card">
                            <i className="fas fa-certificate"></i>
                            <h3>Certified Quality</h3>
                            <p>All chemicals sourced from ISO-certified manufacturers with proper quality certifications</p>
                        </div>

                        <div className="feature-card">
                            <i className="fas fa-shield-alt"></i>
                            <h3>Safety Standards</h3>
                            <p>Full compliance with international safety standards including MSDS documentation</p>
                        </div>

                        <div className="feature-card">
                            <i className="fas fa-microscope"></i>
                            <h3>Lab Tested</h3>
                            <p>Each batch undergoes rigorous laboratory testing for purity and composition</p>
                        </div>

                        <div className="feature-card">
                            <i className="fas fa-shipping-fast"></i>
                            <h3>Proper Packaging</h3>
                            <p>Secure packaging compliant with hazmat regulations for safe transportation</p>
                        </div>

                        <div className="feature-card">
                            <i className="fas fa-file-alt"></i>
                            <h3>Complete Documentation</h3>
                            <p>COA, MSDS, and all required export documentation provided</p>
                        </div>

                        <div className="feature-card">
                            <i className="fas fa-headset"></i>
                            <h3>Technical Support</h3>
                            <p>Expert guidance on chemical specifications and applications</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Product Gallery */}
            <section style={{ background: 'var(--bg-light)' }}>
                <div className="container">
                    <div className="section-title">
                        <h2>Chemical Products Gallery</h2>
                        <p>Visual Overview of Our Chemical Product Categories</p>
                    </div>

                    <div className="product-gallery">
                        <div className="product-gallery-item">
                            <img src="https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600" alt="Industrial Chemicals" />
                        </div>
                        <div className="product-gallery-item">
                            <img src="https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=600" alt="Laboratory Reagents" />
                        </div>
                        <div className="product-gallery-item">
                            <img src="https://images.unsplash.com/photo-1583911860205-72f8ac8ddcbe?w=600" alt="Chemical Processing" />
                        </div>
                        <div className="product-gallery-item">
                            <img src="https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=600" alt="Quality Testing" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Applications Section */}
            <section>
                <div className="container">
                    <div className="section-title">
                        <h2>Industries We Serve</h2>
                        <p>Chemical Solutions for Diverse Industrial Applications</p>
                    </div>

                    <div className="features-grid">
                        <div className="feature-card">
                            <i className="fas fa-pills"></i>
                            <h3>Pharmaceutical</h3>
                            <p>API intermediates and pharmaceutical raw materials</p>
                        </div>

                        <div className="feature-card">
                            <i className="fas fa-industry"></i>
                            <h3>Manufacturing</h3>
                            <p>Industrial chemicals for production processes</p>
                        </div>

                        <div className="feature-card">
                            <i className="fas fa-flask"></i>
                            <h3>Research & Development</h3>
                            <p>Laboratory-grade chemicals for research projects</p>
                        </div>

                        <div className="feature-card">
                            <i className="fas fa-leaf"></i>
                            <h3>Agriculture</h3>
                            <p>Fertilizers and crop protection chemicals</p>
                        </div>

                        <div className="feature-card">
                            <i className="fas fa-tint"></i>
                            <h3>Water Treatment</h3>
                            <p>Chemicals for purification and treatment systems</p>
                        </div>

                        <div className="feature-card">
                            <i className="fas fa-paint-roller"></i>
                            <h3>Paints & Coatings</h3>
                            <p>Pigments, resins, and specialty additives</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quality Assurance */}
            <section style={{ background: 'var(--bg-light)' }}>
                <div className="container">
                    <div className="section-title">
                        <h2>Our Quality Assurance Process</h2>
                        <p>Ensuring Excellence at Every Step</p>
                    </div>

                    <div className="about-content">
                        <div className="about-text">
                            <h3>Comprehensive Quality Control</h3>
                            <p><strong><i className="fas fa-check-circle" style={{ color: 'var(--secondary-color)' }}></i> Supplier Verification:</strong> We partner only with certified manufacturers who maintain strict quality management systems.</p>
                            <p><strong><i className="fas fa-check-circle" style={{ color: 'var(--secondary-color)' }}></i> Pre-Shipment Inspection:</strong> Every batch undergoes thorough testing and inspection before dispatch.</p>
                            <p><strong><i className="fas fa-check-circle" style={{ color: 'var(--secondary-color)' }}></i> Documentation:</strong> Complete traceability with COA, MSDS, and batch records for every shipment.</p>
                            <p><strong><i className="fas fa-check-circle" style={{ color: 'var(--secondary-color)' }}></i> Packaging Standards:</strong> Chemicals packed according to international hazmat regulations and safety guidelines.</p>
                            <p><strong><i className="fas fa-check-circle" style={{ color: 'var(--secondary-color)' }}></i> Regulatory Compliance:</strong> Full compliance with export regulations and international chemical safety standards.</p>
                        </div>
                        <div className="about-image">
                            <img src="https://images.unsplash.com/photo-1581093450021-4a7360e9a6b5?w=800" alt="Quality Control" />
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta">
                <div className="container">
                    <div className="cta-content">
                        <h2>Need Chemical Products for Your Business?</h2>
                        <p>Contact us today for detailed specifications, pricing, and custom sourcing solutions</p>
                        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link to="/contact" className="btn btn-primary">Request a Quote</Link>
                            <Link to="/products" className="btn btn-white">View All Products</Link>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default ProductsChemicals;

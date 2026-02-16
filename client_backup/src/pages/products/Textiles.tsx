import React from 'react';
import { Link } from 'react-router-dom';

const ProductsTextiles: React.FC = () => {
    return (
        <>
            {/* Product Hero */}
            <section className="product-hero" style={{ backgroundImage: 'linear-gradient(135deg, #1a3a52 0%, #2c5f7f 100%)' }}>
                <div className="product-hero-content">
                    <i className="fas fa-tshirt" style={{ fontSize: '60px', marginBottom: '20px', opacity: 0.9 }}></i>
                    <h1>Home Textiles Industry</h1>
                    <p>Premium Quality Fabrics and Textile Products for Global Markets</p>
                </div>
            </section>

            {/* Product Introduction */}
            <section className="product-content-section">
                <div className="container">
                    <div className="product-intro">
                        <h2 style={{ textAlign: 'center', marginBottom: '25px', fontSize: '32px' }}>Luxurious Textiles for Every Need</h2>
                        <p>Ranote Exim offers an exquisite collection of home textiles that combine superior quality, elegant designs, and exceptional comfort. Our textile products are sourced from renowned manufacturers who use premium fabrics and maintain strict quality standards throughout the production process.</p>
                        <p>From luxury hotel linens to residential home furnishings, our diverse range caters to both commercial hospitality sectors and retail markets. Each product is carefully selected to meet international quality standards and customer expectations for durability, comfort, and aesthetic appeal.</p>
                    </div>
                </div>
            </section>

            {/* Product Categories */}
            <section style={{ background: 'var(--bg-light)', paddingTop: '60px' }}>
                <div className="container">
                    <div className="section-title">
                        <h2>Our Home Textile Collection</h2>
                        <p>Comprehensive Range of Quality Textile Products</p>
                    </div>

                    <div className="product-features-list">
                        <div className="product-feature-item">
                            <i className="fas fa-bed"></i>
                            <div>
                                <h4>Bed Linens & Sheets</h4>
                                <p>Premium cotton, linen, and silk bedsheets, duvet covers, and pillowcases in various thread counts</p>
                            </div>
                        </div>

                        <div className="product-feature-item">
                            <i className="fas fa-window-maximize"></i>
                            <div>
                                <h4>Curtains & Drapes</h4>
                                <p>Elegant window treatments including blackout curtains, sheer drapes, and decorative valances</p>
                            </div>
                        </div>

                        <div className="product-feature-item">
                            <i className="fas fa-bath"></i>
                            <div>
                                <h4>Bath Towels & Bathrobes</h4>
                                <p>Absorbent terry towels, luxury bathrobes, and spa-quality bathroom linens</p>
                            </div>
                        </div>

                        <div className="product-feature-item">
                            <i className="fas fa-couch"></i>
                            <div>
                                <h4>Cushions & Pillows</h4>
                                <p>Decorative cushion covers, throw pillows, and ergonomic pillow inserts</p>
                            </div>
                        </div>

                        <div className="product-feature-item">
                            <i className="fas fa-utensils"></i>
                            <div>
                                <h4>Table Linens</h4>
                                <p>Tablecloths, napkins, placemats, and table runners for dining elegance</p>
                            </div>
                        </div>

                        <div className="product-feature-item">
                            <i className="fas fa-blanket"></i>
                            <div>
                                <h4>Blankets & Throws</h4>
                                <p>Warm fleece blankets, decorative throws, and quilted comforters</p>
                            </div>
                        </div>

                        <div className="product-feature-item">
                            <i className="fas fa-door-open"></i>
                            <div>
                                <h4>Upholstery Fabrics</h4>
                                <p>Durable furniture fabrics in various textures, patterns, and colors</p>
                            </div>
                        </div>

                        <div className="product-feature-item">
                            <i className="fas fa-shopping-bag"></i>
                            <div>
                                <h4>Custom Textile Solutions</h4>
                                <p>Customized textile products with private labeling and bespoke designs</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Product Features */}
            <section>
                <div className="container">
                    <div className="section-title">
                        <h2>Why Choose Our Home Textiles?</h2>
                        <p>Superior Quality and Craftsmanship</p>
                    </div>

                    <div className="features-grid">
                        <div className="feature-card">
                            <i className="fas fa-leaf"></i>
                            <h3>Premium Materials</h3>
                            <p>100% natural fibers including Egyptian cotton, linen, silk, and bamboo fabrics</p>
                        </div>

                        <div className="feature-card">
                            <i className="fas fa-palette"></i>
                            <h3>Designer Collections</h3>
                            <p>Contemporary designs, classic patterns, and custom color options</p>
                        </div>

                        <div className="feature-card">
                            <i className="fas fa-recycle"></i>
                            <h3>Eco-Friendly Options</h3>
                            <p>Sustainable and organic textile products with eco-certifications</p>
                        </div>

                        <div className="feature-card">
                            <i className="fas fa-tint"></i>
                            <h3>Colorfast Dyeing</h3>
                            <p>Advanced dyeing techniques ensuring vibrant, long-lasting colors</p>
                        </div>

                        <div className="feature-card">
                            <i className="fas fa-certificate"></i>
                            <h3>Quality Certified</h3>
                            <p>OEKO-TEX and other international textile quality certifications</p>
                        </div>

                        <div className="feature-card">
                            <i className="fas fa-tags"></i>
                            <h3>Bulk & Retail</h3>
                            <p>Flexible order quantities for both wholesale and retail requirements</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Product Gallery */}
            <section style={{ background: 'var(--bg-light)' }}>
                <div className="container">
                    <div className="section-title">
                        <h2>Home Textiles Gallery</h2>
                        <p>Explore Our Beautiful Textile Collections</p>
                    </div>

                    <div className="product-gallery">
                        <div className="product-gallery-item">
                            <img src="https://images.unsplash.com/photo-1631889993959-41b4e9c6e3c5?w=600" alt="Bed Linens" />
                        </div>
                        <div className="product-gallery-item">
                            <img src="https://images.unsplash.com/photo-1522199710521-72d69614c702?w=600" alt="Decorative Textiles" />
                        </div>
                        <div className="product-gallery-item">
                            <img src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600" alt="Bath Towels" />
                        </div>
                        <div className="product-gallery-item">
                            <img src="https://images.unsplash.com/photo-1615875221248-d5de5c3da86f?w=600" alt="Curtains" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Applications Section */}
            <section>
                <div className="container">
                    <div className="section-title">
                        <h2>Markets We Serve</h2>
                        <p>Textile Solutions for Diverse Sectors</p>
                    </div>

                    <div className="features-grid">
                        <div className="feature-card">
                            <i className="fas fa-hotel"></i>
                            <h3>Hotels & Resorts</h3>
                            <p>Luxury linens and textiles for hospitality industry</p>
                        </div>

                        <div className="feature-card">
                            <i className="fas fa-home"></i>
                            <h3>Residential</h3>
                            <p>Home furnishing textiles for retail and direct consumers</p>
                        </div>

                        <div className="feature-card">
                            <i className="fas fa-hospital"></i>
                            <h3>Healthcare Facilities</h3>
                            <p>Hospital-grade linens and patient comfort textiles</p>
                        </div>

                        <div className="feature-card">
                            <i className="fas fa-spa"></i>
                            <h3>Spas & Wellness</h3>
                            <p>Spa-quality towels, robes, and comfort linens</p>
                        </div>

                        <div className="feature-card">
                            <i className="fas fa-store"></i>
                            <h3>Retail Chains</h3>
                            <p>Bulk supply for home furnishing retail stores</p>
                        </div>

                        <div className="feature-card">
                            <i className="fas fa-building"></i>
                            <h3>Corporate Housing</h3>
                            <p>Complete textile solutions for corporate accommodations</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quality Standards */}
            <section style={{ background: 'var(--bg-light)' }}>
                <div className="container">
                    <div className="section-title">
                        <h2>Quality & Sustainability</h2>
                        <p>Commitment to Excellence and Environment</p>
                    </div>

                    <div className="about-content">
                        <div className="about-text">
                            <h3>Our Quality Promise</h3>
                            <p><strong><i className="fas fa-check-circle" style={{ color: 'var(--secondary-color)' }}></i> Material Selection:</strong> Only premium quality natural and sustainable fibers from certified suppliers.</p>
                            <p><strong><i className="fas fa-check-circle" style={{ color: 'var(--secondary-color)' }}></i> Manufacturing Standards:</strong> Produced in facilities with OEKO-TEX, GOTS, or equivalent certifications.</p>
                            <p><strong><i className="fas fa-check-circle" style={{ color: 'var(--secondary-color)' }}></i> Quality Testing:</strong> Rigorous testing for colorfastness, shrinkage, durability, and texture quality.</p>
                            <p><strong><i className="fas fa-check-circle" style={{ color: 'var(--secondary-color)' }}></i> Sustainable Practices:</strong> Eco-friendly dyeing processes and responsible production methods.</p>
                            <p><strong><i className="fas fa-check-circle" style={{ color: 'var(--secondary-color)' }}></i> Customization:</strong> Private labeling, custom sizing, and bespoke design services available.</p>
                        </div>
                        <div className="about-image">
                            <img src="https://images.unsplash.com/photo-1615874694520-474822394e73?w=800" alt="Quality Textiles" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Fabric Specifications */}
            <section>
                <div className="container">
                    <div className="section-title">
                        <h2>Fabric Types & Specifications</h2>
                        <p>Wide Range of High-Quality Materials</p>
                    </div>

                    <div className="values-grid">
                        <div className="value-card">
                            <i className="fas fa-seedling"></i>
                            <h3>100% Cotton</h3>
                            <p>Thread counts ranging from 200 to 1000 TC for various applications</p>
                        </div>

                        <div className="value-card">
                            <i className="fas fa-crown"></i>
                            <h3>Egyptian Cotton</h3>
                            <p>Premium long-staple cotton known for softness and durability</p>
                        </div>

                        <div className="value-card">
                            <i className="fas fa-feather"></i>
                            <h3>Linen</h3>
                            <p>Natural breathable fabric perfect for warm climates</p>
                        </div>

                        <div className="value-card">
                            <i className="fas fa-gem"></i>
                            <h3>Silk Blend</h3>
                            <p>Luxurious silk-cotton blends for premium collections</p>
                        </div>

                        <div className="value-card">
                            <i className="fas fa-bamboo"></i>
                            <h3>Bamboo Fabric</h3>
                            <p>Sustainable, antimicrobial, and ultra-soft bamboo textiles</p>
                        </div>

                        <div className="value-card">
                            <i className="fas fa-cloud"></i>
                            <h3>Microfiber</h3>
                            <p>Soft, durable, and easy-care synthetic fiber options</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta">
                <div className="container">
                    <div className="cta-content">
                        <h2>Looking for Premium Home Textiles?</h2>
                        <p>Contact us for product catalogs, fabric samples, and bulk order pricing</p>
                        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link to="/contact" className="btn btn-primary">Request Samples</Link>
                            <Link to="/products" className="btn btn-white">View All Products</Link>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default ProductsTextiles;

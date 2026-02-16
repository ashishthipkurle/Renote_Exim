import React from 'react';
import { Link } from 'react-router-dom';

const ProductsHandicrafts: React.FC = () => {
    return (
        <>
            {/* Product Hero */}
            <section className="product-hero" style={{ backgroundImage: 'linear-gradient(135deg, #1a3a52 0%, #2c5f7f 100%)' }}>
                <div className="product-hero-content">
                    <i className="fas fa-palette" style={{ fontSize: '60px', marginBottom: '20px', opacity: 0.9 }}></i>
                    <h1>Handicraft Industry</h1>
                    <p>Exquisite Handcrafted Items Showcasing Artistic Heritage and Craftsmanship</p>
                </div>
            </section>

            {/* Product Introduction */}
            <section className="product-content-section">
                <div className="container">
                    <div className="product-intro">
                        <h2 style={{ textAlign: 'center', marginBottom: '25px', fontSize: '32px' }}>Art That Speaks Tradition</h2>
                        <p>Ranote Exim brings you an exclusive collection of handcrafted items that celebrate artistic traditions and cultural heritage. Our handicraft products are created by skilled artisans who have mastered their crafts through generations, combining traditional techniques with contemporary designs.</p>
                        <p>Each piece in our collection tells a unique story, reflecting the rich cultural diversity and artistic excellence of its origin. From decorative home accents to functional art pieces, our handicrafts are perfect for retail stores, interior designers, gift shops, and collectors seeking authentic, handmade products.</p>
                    </div>
                </div>
            </section>

            {/* Product Categories */}
            <section style={{ background: 'var(--bg-light)', paddingTop: '60px' }}>
                <div className="container">
                    <div className="section-title">
                        <h2>Our Handicraft Collection</h2>
                        <p>Diverse Range of Handcrafted Treasures</p>
                    </div>

                    <div className="product-features-list">
                        <div className="product-feature-item">
                            <i className="fas fa-home"></i>
                            <div>
                                <h4>Home Décor Items</h4>
                                <p>Wall hangings, sculptures, decorative bowls, vases, and artistic home accents</p>
                            </div>
                        </div>

                        <div className="product-feature-item">
                            <i className="fas fa-gem"></i>
                            <div>
                                <h4>Jewelry & Accessories</h4>
                                <p>Handcrafted jewelry, fashion accessories, beaded items, and ornamental pieces</p>
                            </div>
                        </div>

                        <div className="product-feature-item">
                            <i className="fas fa-paint-brush"></i>
                            <div>
                                <h4>Traditional Art</h4>
                                <p>Hand-painted items, traditional paintings, art prints, and cultural artwork</p>
                            </div>
                        </div>

                        <div className="product-feature-item">
                            <i className="fas fa-table"></i>
                            <div>
                                <h4>Wooden Crafts</h4>
                                <p>Carved wooden items, furniture accents, decorative boxes, and wooden artifacts</p>
                            </div>
                        </div>

                        <div className="product-feature-item">
                            <i className="fas fa-wine-glass-alt"></i>
                            <div>
                                <h4>Pottery & Ceramics</h4>
                                <p>Handmade pottery, ceramic vases, decorative plates, and terracotta items</p>
                            </div>
                        </div>

                        <div className="product-feature-item">
                            <i className="fas fa-cut"></i>
                            <div>
                                <h4>Textile Crafts</h4>
                                <p>Embroidered items, woven textiles, tapestries, and fabric art pieces</p>
                            </div>
                        </div>

                        <div className="product-feature-item">
                            <i className="fas fa-ring"></i>
                            <div>
                                <h4>Metal Crafts</h4>
                                <p>Brass items, copper crafts, metal sculptures, and decorative metalwork</p>
                            </div>
                        </div>

                        <div className="product-feature-item">
                            <i className="fas fa-gift"></i>
                            <div>
                                <h4>Gift & Souvenir Items</h4>
                                <p>Unique gift items, cultural souvenirs, and collectible handicrafts</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Product Features */}
            <section>
                <div className="container">
                    <div className="section-title">
                        <h2>Why Choose Our Handicrafts?</h2>
                        <p>Authentic Artistry with Global Appeal</p>
                    </div>

                    <div className="features-grid">
                        <div className="feature-card">
                            <i className="fas fa-hands"></i>
                            <h3>100% Handmade</h3>
                            <p>Every piece is carefully handcrafted by skilled artisans using traditional techniques</p>
                        </div>

                        <div className="feature-card">
                            <i className="fas fa-star"></i>
                            <h3>Unique Designs</h3>
                            <p>One-of-a-kind pieces that showcase authentic artistic traditions and styles</p>
                        </div>

                        <div className="feature-card">
                            <i className="fas fa-leaf"></i>
                            <h3>Sustainable Materials</h3>
                            <p>Made with eco-friendly, natural, and sustainable raw materials</p>
                        </div>

                        <div className="feature-card">
                            <i className="fas fa-award"></i>
                            <h3>Quality Craftsmanship</h3>
                            <p>Superior quality with attention to detail in every handcrafted item</p>
                        </div>

                        <div className="feature-card">
                            <i className="fas fa-globe-asia"></i>
                            <h3>Cultural Authenticity</h3>
                            <p>Genuine traditional designs reflecting rich cultural heritage</p>
                        </div>

                        <div className="feature-card">
                            <i className="fas fa-users"></i>
                            <h3>Artisan Support</h3>
                            <p>Directly supporting artisan communities and traditional crafts</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Product Gallery */}
            <section style={{ background: 'var(--bg-light)' }}>
                <div className="container">
                    <div className="section-title">
                        <h2>Handicraft Gallery</h2>
                        <p>Explore Our Beautiful Handcrafted Collections</p>
                    </div>

                    <div className="product-gallery">
                        <div className="product-gallery-item">
                            <img src="https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600" alt="Traditional Crafts" />
                        </div>
                        <div className="product-gallery-item">
                            <img src="https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=600" alt="Decorative Items" />
                        </div>
                        <div className="product-gallery-item">
                            <img src="https://images.unsplash.com/photo-1608881598232-4d3e72b8d6d1?w=600" alt="Artistic Crafts" />
                        </div>
                        <div className="product-gallery-item">
                            <img src="https://images.unsplash.com/photo-1590736969955-71cc94901144?w=600" alt="Handmade Art" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Craft Categories */}
            <section>
                <div className="container">
                    <div className="section-title">
                        <h2>Craft Specialties</h2>
                        <p>Traditional Techniques Passed Through Generations</p>
                    </div>

                    <div className="features-grid">
                        <div className="feature-card">
                            <i className="fas fa-hammer"></i>
                            <h3>Wood Carving</h3>
                            <p>Intricate hand-carved wooden items and sculptures</p>
                        </div>

                        <div className="feature-card">
                            <i className="fas fa-fire-alt"></i>
                            <h3>Pottery Making</h3>
                            <p>Traditional pottery crafted using ancient techniques</p>
                        </div>

                        <div className="feature-card">
                            <i className="fas fa-hands-helping"></i>
                            <h3>Textile Weaving</h3>
                            <p>Hand-woven textiles with traditional patterns</p>
                        </div>

                        <div className="feature-card">
                            <i className="fas fa-paint-roller"></i>
                            <h3>Hand Painting</h3>
                            <p>Miniature paintings and traditional art forms</p>
                        </div>

                        <div className="feature-card">
                            <i className="fas fa-tools"></i>
                            <h3>Metal Crafting</h3>
                            <p>Brass, copper, and silver metalwork items</p>
                        </div>

                        <div className="feature-card">
                            <i className="fas fa-gem"></i>
                            <h3>Stone Carving</h3>
                            <p>Marble and stone sculptures and decorative pieces</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Markets Served */}
            <section style={{ background: 'var(--bg-light)' }}>
                <div className="container">
                    <div className="section-title">
                        <h2>Markets We Serve</h2>
                        <p>Handicrafts for Various Business Sectors</p>
                    </div>

                    <div className="about-content">
                        <div className="about-text">
                            <h3>Perfect for Multiple Markets</h3>
                            <p><strong><i className="fas fa-check-circle" style={{ color: 'var(--secondary-color)' }}></i> Retail Stores:</strong> Unique handicrafts for home décor and gift shops seeking authentic artisan products.</p>
                            <p><strong><i className="fas fa-check-circle" style={{ color: 'var(--secondary-color)' }}></i> Interior Designers:</strong> Distinctive decorative pieces to add character and cultural elements to spaces.</p>
                            <p><strong><i className="fas fa-check-circle" style={{ color: 'var(--secondary-color)' }}></i> Hotels & Resorts:</strong> Cultural décor items to enhance ambiance and showcase local heritage.</p>
                            <p><strong><i className="fas fa-check-circle" style={{ color: 'var(--secondary-color)' }}></i> Export Retailers:</strong> Bulk orders of handcrafted items for international retail markets.</p>
                            <p><strong><i className="fas fa-check-circle" style={{ color: 'var(--secondary-color)' }}></i> Museums & Galleries:</strong> Authentic cultural artifacts and traditional art pieces for exhibitions.</p>
                        </div>
                        <div className="about-image">
                            <img src="https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=800" alt="Handicraft Display" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Product Benefits */}
            <section>
                <div className="container">
                    <div className="section-title">
                        <h2>The Value of Handcrafted Products</h2>
                        <p>Benefits Beyond Beauty</p>
                    </div>

                    <div className="values-grid">
                        <div className="value-card">
                            <i className="fas fa-fingerprint"></i>
                            <h3>Unique Character</h3>
                            <p>Each piece is unique with its own character and story</p>
                        </div>

                        <div className="value-card">
                            <i className="fas fa-history"></i>
                            <h3>Cultural Heritage</h3>
                            <p>Preserves and promotes traditional artistic techniques</p>
                        </div>

                        <div className="value-card">
                            <i className="fas fa-hand-holding-heart"></i>
                            <h3>Ethical Sourcing</h3>
                            <p>Fair trade practices supporting artisan communities</p>
                        </div>

                        <div className="value-card">
                            <i className="fas fa-recycle"></i>
                            <h3>Eco-Friendly</h3>
                            <p>Sustainable production with minimal environmental impact</p>
                        </div>

                        <div className="value-card">
                            <i className="fas fa-heart"></i>
                            <h3>Human Touch</h3>
                            <p>Personal connection through handmade craftsmanship</p>
                        </div>

                        <div className="value-card">
                            <i className="fas fa-chart-line"></i>
                            <h3>Investment Value</h3>
                            <p>Authentic handcrafts often appreciate in value over time</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Customization Options */}
            <section style={{ background: 'var(--bg-light)' }}>
                <div className="container">
                    <div className="section-title">
                        <h2>Customization Services</h2>
                        <p>Tailored Handicrafts for Your Needs</p>
                    </div>

                    <div className="features-grid">
                        <div className="feature-card">
                            <i className="fas fa-palette"></i>
                            <h3>Custom Designs</h3>
                            <p>Work with artisans to create bespoke pieces based on your specifications</p>
                        </div>

                        <div className="feature-card">
                            <i className="fas fa-ruler-combined"></i>
                            <h3>Size Variations</h3>
                            <p>Custom sizing options to meet your specific requirements</p>
                        </div>

                        <div className="feature-card">
                            <i className="fas fa-fill-drip"></i>
                            <h3>Color Options</h3>
                            <p>Choose from various color schemes and finishes</p>
                        </div>

                        <div className="feature-card">
                            <i className="fas fa-box-open"></i>
                            <h3>Bulk Orders</h3>
                            <p>Volume discounts and special pricing for large orders</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta">
                <div className="container">
                    <div className="cta-content">
                        <h2>Discover Authentic Handcrafted Treasures</h2>
                        <p>Contact us to explore our complete handicraft collection and discuss custom requirements</p>
                        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link to="/contact" className="btn btn-primary">Request Catalog</Link>
                            <Link to="/products" className="btn btn-white">View All Products</Link>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default ProductsHandicrafts;

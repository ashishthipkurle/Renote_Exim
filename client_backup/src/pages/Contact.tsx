import React from 'react';
import { Link } from 'react-router-dom';

const Contact: React.FC = () => {
    return (
        <>
            <section className="product-hero">
                <div className="product-hero-content">
                    <h1>Contact Us</h1>
                    <p>Get in Touch - We're Here to Help You Succeed</p>
                </div>
            </section>

            <section>
                <div className="container">
                    <div className="section-title">
                        <h2>Let's Start a Conversation</h2>
                        <p>Whether you have questions about our products, need a quote, or want to discuss a partnership opportunity, we're here to help</p>
                    </div>
                </div>
            </section>

            <section style={{ paddingTop: 0 }}>
                <div className="container">
                    <div className="contact-container">
                        <div className="contact-form">
                            <h3 style={{ marginBottom: '25px', color: 'var(--primary-color)' }}>Send Us a Message</h3>
                            <form id="contactForm">
                                <div className="form-group">
                                    <label htmlFor="name">Full Name *</label>
                                    <input type="text" id="name" name="name" placeholder="Enter your full name" required />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email">Email Address *</label>
                                    <input type="email" id="email" name="email" placeholder="your.email@example.com" required />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="phone">Phone Number *</label>
                                    <input type="tel" id="phone" name="phone" placeholder="+1 234 567 8900" required />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="company">Company Name</label>
                                    <input type="text" id="company" name="company" placeholder="Your company name" />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="product">Product Interest *</label>
                                    <select id="product" name="product" required>
                                        <option value="">Select a category</option>
                                        <option value="chemicals">Chemicals Industry</option>
                                        <option value="machines">Machines & Devices</option>
                                        <option value="textiles">Home Textiles</option>
                                        <option value="medical">Medical & Surgical Equipment</option>
                                        <option value="handicraft">Handicraft Industry</option>
                                        <option value="other">Other / General Inquiry</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="message">Your Message *</label>
                                    <textarea id="message" name="message" placeholder="Tell us about your requirements, questions, or how we can help you..." required></textarea>
                                </div>

                                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                                    <i className="fas fa-paper-plane" style={{ marginRight: '8px' }}></i>
                                    Send Message
                                </button>
                            </form>
                        </div>

                        <div className="contact-info-cards">
                            <div className="contact-info-card">
                                <i className="fas fa-map-marker-alt"></i>
                                <div>
                                    <h4>Our Office</h4>
                                    <p>Business Plaza, International Trade Center<br />Mumbai, Maharashtra<br />India</p>
                                </div>
                            </div>

                            <div className="contact-info-card">
                                <i className="fas fa-phone"></i>
                                <div>
                                    <h4>Phone</h4>
                                    <p>+91 98765 43210<br />+91 98765 43211</p>
                                </div>
                            </div>

                            <div className="contact-info-card">
                                <i className="fas fa-envelope"></i>
                                <div>
                                    <h4>Email</h4>
                                    <p>info@ranoteexim.com<br />sales@ranoteexim.com</p>
                                </div>
                            </div>

                            <div className="contact-info-card">
                                <i className="fas fa-clock"></i>
                                <div>
                                    <h4>Business Hours</h4>
                                    <p>Monday to Saturday<br />10:00 AM to 7:00 PM IST<br /><em style={{ fontSize: '13px', color: 'var(--text-light)' }}>Closed on Sundays & Public Holidays</em></p>
                                </div>
                            </div>

                            <div className="contact-info-card">
                                <i className="fas fa-globe"></i>
                                <div>
                                    <h4>Follow Us</h4>
                                    <div className="social-links" style={{ marginTop: '10px' }}>
                                        <a href="#"><i className="fab fa-facebook-f"></i></a>
                                        <a href="#"><i className="fab fa-twitter"></i></a>
                                        <a href="#"><i className="fab fa-linkedin-in"></i></a>
                                        <a href="#"><i className="fab fa-instagram"></i></a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section style={{ background: 'var(--bg-light)' }}>
                <div className="container">
                    <div className="section-title">
                        <h2>Find Us on the Map</h2>
                        <p>Located in the Heart of Mumbai's Business District</p>
                    </div>

                    <div className="map-container">
                        <div className="map-placeholder">
                            <i className="fas fa-map-marked-alt"></i>
                            <h3>Mumbai, India</h3>
                            <p>Business Plaza, International Trade Center</p>
                            <p style={{ marginTop: '15px', color: 'var(--text-light)' }}>
                                <small>Easily accessible via metro, bus, and major highways</small>
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section>
                <div className="container">
                    <div className="section-title">
                        <h2>How We Can Help You</h2>
                        <p>Multiple Ways to Support Your Business Needs</p>
                    </div>

                    <div className="features-grid">
                        <div className="feature-card">
                            <i className="fas fa-clipboard-list"></i>
                            <h3>Product Inquiries</h3>
                            <p>Get detailed information about specifications, certifications, and availability</p>
                        </div>

                        <div className="feature-card">
                            <i className="fas fa-file-invoice-dollar"></i>
                            <h3>Request Quotations</h3>
                            <p>Receive competitive pricing for bulk orders and customized requirements</p>
                        </div>

                        <div className="feature-card">
                            <i className="fas fa-box-open"></i>
                            <h3>Sample Requests</h3>
                            <p>Order product samples to evaluate quality before placing bulk orders</p>
                        </div>

                        <div className="feature-card">
                            <i className="fas fa-handshake"></i>
                            <h3>Partnership Opportunities</h3>
                            <p>Explore distribution partnerships and long-term collaboration</p>
                        </div>

                        <div className="feature-card">
                            <i className="fas fa-shipping-fast"></i>
                            <h3>Shipping & Logistics</h3>
                            <p>Discuss shipping options, delivery timelines, and logistics solutions</p>
                        </div>

                        <div className="feature-card">
                            <i className="fas fa-headset"></i>
                            <h3>Customer Support</h3>
                            <p>Get assistance with existing orders, documentation, and technical queries</p>
                        </div>
                    </div>
                </div>
            </section>

            <section style={{ background: 'var(--bg-light)' }}>
                <div className="container">
                    <div className="section-title">
                        <h2>Frequently Asked Questions</h2>
                        <p>Quick Answers to Common Questions</p>
                    </div>

                    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                        {[
                            {
                                question: "What is the minimum order quantity?",
                                answer: "Minimum order quantities vary by product category. Contact us with your specific requirements, and we'll provide detailed information and flexible options."
                            },
                            {
                                question: "Do you provide product samples?",
                                answer: "Yes, we offer samples for most products. Sample charges and shipping costs apply, which can be adjusted against future bulk orders."
                            },
                            {
                                question: "What are your payment terms?",
                                answer: "We offer flexible payment terms including LC, TT, and other internationally accepted payment methods. Terms can be discussed based on order value and customer relationship."
                            },
                            {
                                question: "How long does shipping take?",
                                answer: "Delivery timelines depend on destination, product type, and shipping method. Typically, sea freight takes 3-6 weeks, while air freight is 5-10 days. We provide detailed timelines with quotations."
                            },
                            {
                                question: "Can you source custom products?",
                                answer: "Absolutely! We specialize in custom sourcing based on your specifications. Share your requirements, and we'll work to find the perfect solution for your needs."
                            }
                        ].map((faq, index) => (
                            <div key={index} style={{ background: 'var(--white)', padding: '25px', marginBottom: '20px', borderRadius: '10px', boxShadow: 'var(--shadow)' }}>
                                <h4 style={{ color: 'var(--primary-color)', marginBottom: '12px' }}>
                                    <i className="fas fa-question-circle" style={{ color: 'var(--secondary-color)', marginRight: '10px' }}></i>
                                    {faq.question}
                                </h4>
                                <p style={{ color: 'var(--text-light)', margin: '0' }}>{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="cta">
                <div className="container">
                    <div className="cta-content">
                        <h2>Ready to Start Your Export Journey?</h2>
                        <p>Contact us today and discover how we can help grow your business globally</p>
                        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <a href="#contactForm" className="btn btn-primary">Send Inquiry</a>
                            <Link to="/products" className="btn btn-white">View Products</Link>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Contact;

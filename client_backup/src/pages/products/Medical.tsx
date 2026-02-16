import React from 'react';
import { Link } from 'react-router-dom';

const ProductsMedical: React.FC = () => {
    return (
        <>
            {/* Product Hero */}
            <section className="product-hero" style={{ backgroundImage: 'linear-gradient(135deg, #1a3a52 0%, #2c5f7f 100%)' }}>
                <div className="product-hero-content">
                    <i className="fas fa-heartbeat" style={{ fontSize: '60px', marginBottom: '20px', opacity: 0.9 }}></i>
                    <h1>Medical & Surgical Equipment</h1>
                    <p>Advanced Healthcare Solutions Meeting International Medical Standards</p>
                </div>
            </section>

            {/* Product Introduction */}
            <section className="product-content-section">
                <div className="container">
                    <div className="product-intro">
                        <h2 style={{ textAlign: 'center', marginBottom: '25px', fontSize: '32px' }}>Healthcare Equipment You Can Trust</h2>
                        <p>Ranote Exim is committed to supplying high-quality medical and surgical equipment that meets stringent international healthcare standards. Our medical equipment range is sourced from certified manufacturers who comply with FDA, CE, and ISO certifications, ensuring reliability, precision, and patient safety.</p>
                        <p>We serve hospitals, clinics, diagnostic centers, surgical facilities, and healthcare institutions worldwide with a comprehensive range of medical devices, surgical instruments, diagnostic equipment, and patient care products. Every product undergoes rigorous quality checks and comes with complete documentation and certifications.</p>
                    </div>
                </div>
            </section>

            {/* Product Categories */}
            <section style={{ background: 'var(--bg-light)', paddingTop: '60px' }}>
                <div className="container">
                    <div className="section-title">
                        <h2>Our Medical Equipment Range</h2>
                        <p>Comprehensive Healthcare Solutions Across All Departments</p>
                    </div>

                    <div className="product-features-list">
                        <div className="product-feature-item">
                            <i className="fas fa-cut"></i>
                            <div>
                                <h4>Surgical Instruments</h4>
                                <p>Precision surgical tools including scalpels, forceps, scissors, clamps, and specialty instruments</p>
                            </div>
                        </div>

                        <div className="product-feature-item">
                            <i className="fas fa-x-ray"></i>
                            <div>
                                <h4>Diagnostic Equipment</h4>
                                <p>Imaging systems, ultrasound machines, ECG monitors, and laboratory diagnostic devices</p>
                            </div>
                        </div>

                        <div className="product-feature-item">
                            <i className="fas fa-procedures"></i>
                            <div>
                                <h4>Patient Monitoring Systems</h4>
                                <p>Vital signs monitors, pulse oximeters, blood pressure monitors, and telemetry systems</p>
                            </div>
                        </div>

                        <div className="product-feature-item">
                            <i className="fas fa-bed"></i>
                            <div>
                                <h4>Hospital Furniture</h4>
                                <p>Medical beds, examination tables, surgical tables, wheelchairs, and patient trolleys</p>
                            </div>
                        </div>

                        <div className="product-feature-item">
                            <i className="fas fa-syringe"></i>
                            <div>
                                <h4>Disposable Medical Supplies</h4>
                                <p>Syringes, needles, catheters, gloves, masks, and other single-use medical products</p>
                            </div>
                        </div>

                        <div className="product-feature-item">
                            <i className="fas fa-tooth"></i>
                            <div>
                                <h4>Dental Equipment</h4>
                                <p>Dental chairs, handpieces, sterilization equipment, and dental instruments</p>
                            </div>
                        </div>

                        <div className="product-feature-item">
                            <i className="fas fa-microscope"></i>
                            <div>
                                <h4>Laboratory Equipment</h4>
                                <p>Microscopes, centrifuges, incubators, analyzers, and lab consumables</p>
                            </div>
                        </div>

                        <div className="product-feature-item">
                            <i className="fas fa-lungs"></i>
                            <div>
                                <h4>Respiratory Equipment</h4>
                                <p>Ventilators, oxygen concentrators, nebulizers, and respiratory therapy devices</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Product Features */}
            <section>
                <div className="container">
                    <div className="section-title">
                        <h2>Why Choose Our Medical Equipment?</h2>
                        <p>Safety, Quality, and Compliance Guaranteed</p>
                    </div>

                    <div className="features-grid">
                        <div className="feature-card">
                            <i className="fas fa-certificate"></i>
                            <h3>FDA & CE Certified</h3>
                            <p>All equipment meets FDA, CE, and international medical device standards</p>
                        </div>

                        <div className="feature-card">
                            <i className="fas fa-check-double"></i>
                            <h3>ISO Compliance</h3>
                            <p>ISO 13485 certified manufacturers ensuring consistent quality</p>
                        </div>

                        <div className="feature-card">
                            <i className="fas fa-clipboard-check"></i>
                            <h3>Quality Assurance</h3>
                            <p>Rigorous testing and quality control at every stage of production</p>
                        </div>

                        <div className="feature-card">
                            <i className="fas fa-file-medical"></i>
                            <h3>Complete Documentation</h3>
                            <p>Full regulatory documentation, manuals, and certificates provided</p>
                        </div>

                        <div className="feature-card">
                            <i className="fas fa-shield-alt"></i>
                            <h3>Warranty Support</h3>
                            <p>Manufacturer warranties and comprehensive after-sales support</p>
                        </div>

                        <div className="feature-card">
                            <i className="fas fa-graduation-cap"></i>
                            <h3>Training Available</h3>
                            <p>Equipment operation training and technical documentation</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Product Gallery */}
            <section style={{ background: 'var(--bg-light)' }}>
                <div className="container">
                    <div className="section-title">
                        <h2>Medical Equipment Gallery</h2>
                        <p>Advanced Healthcare Technology</p>
                    </div>

                    <div className="product-gallery">
                        <div className="product-gallery-item">
                            <img src="https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=600" alt="Medical Equipment" />
                        </div>
                        <div className="product-gallery-item">
                            <img src="https://images.unsplash.com/photo-1579154204601-01588f351e67?w=600" alt="Surgical Instruments" />
                        </div>
                        <div className="product-gallery-item">
                            <img src="https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?w=600" alt="Diagnostic Equipment" />
                        </div>
                        <div className="product-gallery-item">
                            <img src="https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600" alt="Hospital Equipment" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Applications Section */}
            <section>
                <div className="container">
                    <div className="section-title">
                        <h2>Healthcare Facilities We Serve</h2>
                        <p>Medical Equipment for Every Healthcare Setting</p>
                    </div>

                    <div className="features-grid">
                        <div className="feature-card">
                            <i className="fas fa-hospital"></i>
                            <h3>Hospitals</h3>
                            <p>Complete equipment solutions for multi-specialty hospitals</p>
                        </div>

                        <div className="feature-card">
                            <i className="fas fa-clinic-medical"></i>
                            <h3>Clinics & Polyclinics</h3>
                            <p>Essential medical equipment for outpatient facilities</p>
                        </div>

                        <div className="feature-card">
                            <i className="fas fa-procedures"></i>
                            <h3>Surgical Centers</h3>
                            <p>Advanced surgical instruments and operating room equipment</p>
                        </div>

                        <div className="feature-card">
                            <i className="fas fa-vial"></i>
                            <h3>Diagnostic Labs</h3>
                            <p>Laboratory equipment and diagnostic testing devices</p>
                        </div>

                        <div className="feature-card">
                            <i className="fas fa-tooth"></i>
                            <h3>Dental Practices</h3>
                            <p>Complete dental equipment and instrument sets</p>
                        </div>

                        <div className="feature-card">
                            <i className="fas fa-home"></i>
                            <h3>Home Healthcare</h3>
                            <p>Medical devices for home care and patient monitoring</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Certifications & Standards */}
            <section style={{ background: 'var(--bg-light)' }}>
                <div className="container">
                    <div className="section-title">
                        <h2>Medical Standards & Compliance</h2>
                        <p>Meeting Global Healthcare Regulations</p>
                    </div>

                    <div className="about-content">
                        <div className="about-text">
                            <h3>Our Compliance Framework</h3>
                            <p><strong><i className="fas fa-check-circle" style={{ color: 'var(--secondary-color)' }}></i> Regulatory Compliance:</strong> All equipment complies with FDA, CE Mark, ISO 13485, and regional medical device regulations.</p>
                            <p><strong><i className="fas fa-check-circle" style={{ color: 'var(--secondary-color)' }}></i> Quality Management:</strong> Sourced from manufacturers with certified quality management systems.</p>
                            <p><strong><i className="fas fa-check-circle" style={{ color: 'var(--secondary-color)' }}></i> Safety Testing:</strong> Comprehensive biocompatibility and safety testing for all medical devices.</p>
                            <p><strong><i className="fas fa-check-circle" style={{ color: 'var(--secondary-color)' }}></i> Documentation:</strong> Complete technical files, certificates of conformity, and user manuals.</p>
                            <p><strong><i className="fas fa-check-circle" style={{ color: 'var(--secondary-color)' }}></i> Traceability:</strong> Full product traceability with batch numbers and manufacturing records.</p>
                        </div>
                        <div className="about-image">
                            <img src="https://images.unsplash.com/photo-1551076805-e1869033e561?w=800" alt="Medical Standards" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Product Categories Detail */}
            <section>
                <div className="container">
                    <div className="section-title">
                        <h2>Equipment Categories</h2>
                        <p>Specialized Medical Devices for Every Department</p>
                    </div>

                    <div className="values-grid">
                        <div className="value-card">
                            <i className="fas fa-heartbeat"></i>
                            <h3>Cardiology</h3>
                            <p>ECG machines, cardiac monitors, defibrillators, and holter monitors</p>
                        </div>

                        <div className="value-card">
                            <i className="fas fa-baby"></i>
                            <h3>Obstetrics & Gynecology</h3>
                            <p>Fetal monitors, ultrasound machines, examination tables</p>
                        </div>

                        <div className="value-card">
                            <i className="fas fa-bone"></i>
                            <h3>Orthopedics</h3>
                            <p>Orthopedic instruments, implants, and surgical power tools</p>
                        </div>

                        <div className="value-card">
                            <i className="fas fa-eye"></i>
                            <h3>Ophthalmology</h3>
                            <p>Slit lamps, auto refractometers, surgical microscopes</p>
                        </div>

                        <div className="value-card">
                            <i className="fas fa-brain"></i>
                            <h3>Neurology</h3>
                            <p>EEG systems, neurosurgical instruments, monitoring devices</p>
                        </div>

                        <div className="value-card">
                            <i className="fas fa-first-aid"></i>
                            <h3>Emergency Medicine</h3>
                            <p>Crash carts, resuscitation equipment, emergency supplies</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Support Services */}
            <section style={{ background: 'var(--bg-light)' }}>
                <div className="container">
                    <div className="section-title">
                        <h2>Our Support Services</h2>
                        <p>Comprehensive Support Beyond Equipment Supply</p>
                    </div>

                    <div className="features-grid">
                        <div className="feature-card">
                            <i className="fas fa-clipboard-list"></i>
                            <h3>Equipment Consultation</h3>
                            <p>Expert guidance on equipment selection based on your facility needs</p>
                        </div>

                        <div className="feature-card">
                            <i className="fas fa-tools"></i>
                            <h3>Installation Support</h3>
                            <p>Coordination with technical teams for proper installation</p>
                        </div>

                        <div className="feature-card">
                            <i className="fas fa-user-md"></i>
                            <h3>Clinical Training</h3>
                            <p>Operator training for medical and clinical staff</p>
                        </div>

                        <div className="feature-card">
                            <i className="fas fa-phone-volume"></i>
                            <h3>Technical Support</h3>
                            <p>Ongoing technical assistance and troubleshooting</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta">
                <div className="container">
                    <div className="cta-content">
                        <h2>Need Medical Equipment for Your Healthcare Facility?</h2>
                        <p>Contact us for detailed specifications, certifications, and customized solutions</p>
                        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link to="/contact" className="btn btn-primary">Request Quote</Link>
                            <Link to="/products" className="btn btn-white">View All Products</Link>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default ProductsMedical;

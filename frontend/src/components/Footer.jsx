import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.scss';

const Footer = () => {
    return (
        <footer>
            <div className="container">
                <div className="grid">
                    <div>
                        <h3>NV Academy</h3>
                        <p>
                            Empowering learners worldwide with quality education and practical skills for the digital age.
                        </p>
                    </div>
                    <div>
                        <h4>Quick Links</h4>
                        <ul>
                            <li>
                                <Link to="/courses">
                                    All Courses
                                </Link>
                            </li>
                            <li>
                                <Link to="/categories">
                                    Categories
                                </Link>
                            </li>
                            <li>
                                <Link to="/my-courses">
                                    My Learning
                                </Link>
                            </li>
                            <li>
                                <Link to="/instructors">
                                    Instructors
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h4>Support</h4>
                        <ul>
                            <li>
                                <a href="#">
                                    <i className="fas fa-question-circle"></i>
                                    Help Center
                                </a>
                            </li>
                            <li>
                                <a href="#">
                                    <i className="fas fa-file-contract"></i>
                                    Terms of Service
                                </a>
                            </li>
                            <li>
                                <a href="#">
                                    <i className="fas fa-shield-alt"></i>
                                    Privacy Policy
                                </a>
                            </li>
                            <li>
                                <a href="#">
                                    <i className="fas fa-headset"></i>
                                    Contact Support
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h4>Contact Us</h4>
                        <ul>
                            <li>
                                <span><i className="fas fa-envelope"></i>support@nvacademy.com</span>
                            </li>
                            <li>
                                <span><i className="fas fa-phone"></i>+1 (555) 123-4567</span>
                            </li>
                            <li>
                                <span><i className="fas fa-map-marker-alt"></i>123 Education St, Learning City</span>
                            </li>
                        </ul>
                        <div className="social-links">
                            <a href="#" aria-label="Facebook">
                                <i className="fab fa-facebook-f"></i>
                            </a>
                            <a href="#" aria-label="Twitter">
                                <i className="fab fa-twitter"></i>
                            </a>
                            <a href="#" aria-label="Instagram">
                                <i className="fab fa-instagram"></i>
                            </a>
                            <a href="#" aria-label="LinkedIn">
                                <i className="fab fa-linkedin-in"></i>
                            </a>
                            <a href="#" aria-label="YouTube">
                                <i className="fab fa-youtube"></i>
                            </a>
                        </div>
                    </div>
                </div>
                <div className="copyright">
                    <p>&copy; {new Date().getFullYear()} NV Academy. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
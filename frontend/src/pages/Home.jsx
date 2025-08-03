import React from 'react';
import styles from './pages.module.css';

function Home() {
    return (
        <div className={styles.homePage}>
            <div className={styles.welcomeSection}>
                <h1 className={styles.title}>Welcome to Our E-Commerce Platform</h1>
                <p className={styles.subtitle}>
                    A modern web application for product management and user authentication, 
                    built with React frontend and Node.js backend.
                </p>
            </div>
            
            <div className={styles.projectDescription}>
                <h2 className={styles.sectionTitle}>About This Project</h2>
                <p className={styles.description}>
                    This is a full-stack e-commerce platform that demonstrates modern web development practices. 
                    The application features user authentication, product management with CRUD operations, 
                    responsive design, and secure API endpoints. Built with React for the frontend and 
                    Express.js with Node.js for the backend, it showcases best practices in web development 
                    including form validation, error handling, and user experience design.
                </p>
            </div>
            
            <div className={styles.features}>
                <div className={styles.featureCard}>
                    <h3 className={styles.featureTitle}>User Authentication</h3>
                    <p className={styles.featureDescription}>
                        Secure login and registration system with role-based access control. 
                        Users can register as administrators and manage the platform.
                    </p>
                </div>
                
                <div className={styles.featureCard}>
                    <h3 className={styles.featureTitle}>Product Management</h3>
                    <p className={styles.featureDescription}>
                        Complete CRUD operations for products including add, edit, delete, 
                        and view functionality with image support and sorting options.
                    </p>
                </div>
                
                <div className={styles.featureCard}>
                    <h3 className={styles.featureTitle}>Modern UI/UX</h3>
                    <p className={styles.featureDescription}>
                        Responsive design with modern styling, smooth animations, 
                        and intuitive user interface for optimal user experience.
                    </p>
                </div>
            </div>
            
            <div className={styles.developersSection}>
                <h2 className={styles.sectionTitle}>Developed By</h2>
                <div className={styles.developers}>
                    <div className={styles.developerCard}>
                        <h3 className={styles.developerName}>Rani Tobassy</h3>
                        <p className={styles.developerRole}>Full-Stack Developer</p>
                        <p className={styles.developerDescription}>
                            Specialized in React development, UI/UX design, and frontend architecture. 
                            Passionate about creating intuitive and responsive user interfaces.
                        </p>
                    </div>
                    
                    <div className={styles.developerCard}>
                        <h3 className={styles.developerName}>Shady Ghadban</h3>
                        <p className={styles.developerRole}>Backend Developer</p>
                        <p className={styles.developerDescription}>
                            Expert in Node.js, Express.js, and database design. 
                            Focused on building robust APIs and secure authentication systems.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;
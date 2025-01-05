import React, { useState } from 'react';
import api from '../api';
import "../styles/PasswordResetRequestForm.css"
import careLogo from "../assets/care.png";




const PasswordResetRequest = () => {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
   
    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };

    const handleUsernameChange = (e) => {
        setUsername(e.target.value);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        
        if (!email) {
            setErrorMessage('Please enter your email address.');
            return;
        }

        if (!username) {
            setErrorMessage('Please enter your username.');
            return;
        }

        setErrorMessage('');
        setSuccessMessage('');

        try {
            const response = await api.post('api/password_reset/', { email });
            
            console.log("Email:", response.data);
            if (response.status === 200) {
                setSuccessMessage('Password reset email sent successfully. Please check your inbox.');
            }
        } catch (error) {
            setErrorMessage('An error occurred while sending the password reset email. Please try again later.');
        }

        setEmail('');
        setUsername('');
    };

    return (
        <div className="form-container">
            <img src={careLogo} alt="Logo" className="form-logo" />
            <h2>Password Reset Request</h2>
            <form onSubmit={handleFormSubmit}>
                <div className="form-input-container">
                    <label htmlFor="email">Enter your email address:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={email}
                        onChange={handleEmailChange}
                        className="form-input"
                        placeholder="Your email address"
                        required
                    />
                </div>

                <div className="form-input-container">
                    <label htmlFor="username">Enter your username:</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={username}
                        onChange={handleUsernameChange}
                        className="form-input"
                        placeholder="Your username"
                        required
                    />
                </div>

                {errorMessage && <p className="error-message">{errorMessage}</p>}
                
                {successMessage && <p className="success-message">{successMessage}</p>}

                <button type="submit" className="form-button">Reset Password</button>
            </form>
            <div className="form-footer">
                <p>Remembered your password? <a href="/login">Login here</a></p>
            </div>
        </div>
    );
};

export default PasswordResetRequest;

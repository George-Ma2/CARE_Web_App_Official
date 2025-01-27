import React, { useState } from 'react';
import api from '../api';
import '../styles/PasswordResetForm.css';
import { useNavigate, useParams } from 'react-router-dom';

const PasswordReset = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const { token } = useParams();
    console.log(token);
    const navigate = useNavigate();

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    const handleConfirmPasswordChange = (e) => {
        setConfirmPassword(e.target.value);
    };

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?"_:{}|<>]).{8,}$/; 
    // password must contain at least 1 lower and upper case letter, 1 symbol and a minimum of 8 characters

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        
        if (!password || !confirmPassword) {
            setErrorMessage('Please enter both password');
            return;
        }

        if (password !== confirmPassword) {
            setErrorMessage('Passwords do not match.');
            return;
        }

        setErrorMessage('');
        setSuccessMessage('');

        if (!passwordRegex.test(password)) {
            setErrorMessage("Password must contain at least one uppercase letter, one lowercase letter, one special character and a minimum of 8 characters.");
            return;
        }

        setErrorMessage('');

        try {
            const response = await api.post('api/password_reset/confirm/', 
                {
                    "password": password,
                    "token": token
                }
            );

            
            if (response.status === 200) {
                setSuccessMessage('Your Password was resetted successfully. Redirecting to Login.');
                setTimeout(() => {
                    navigate('/login')
                }, 3000 )
            }
        } catch (error) {
            setErrorMessage('An error occurred while sending the password reset password. Please try again later.');
            
        }

        setPassword('');
        setConfirmPassword('');
    };

    return (
        <div className="form-container">
            <h2>Password Reset</h2>
            <form onSubmit={handleFormSubmit}>
                <div className="form-input-container">
                    <label htmlFor="password">Enter your password:</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={password}
                        onChange={handlePasswordChange}
                        className="form-input"
                        placeholder="password"
                        required
                    />
                    <label htmlFor="confirmPassword">Confirm your password:</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={confirmPassword}
                        onChange={handleConfirmPasswordChange}
                        className="form-input"
                        placeholder="Confirm password"
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

export default PasswordReset;

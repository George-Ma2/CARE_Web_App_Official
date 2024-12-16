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

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        
        if (!password || !confirmPassword) {
            setErrorMessage('Please enter password address.');
            return;
        }

        if (password !== confirmPassword) {
            setErrorMessage('Password do not match.');
            return;
        }

        setErrorMessage('');
        setSuccessMessage('');

        try {
            const response = await api.post('/password_reset/confirm', 
                { password },
                { token },
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

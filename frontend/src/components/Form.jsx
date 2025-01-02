import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import "../styles/Form.css"
import reactLogo from "../assets/react.svg"

function Form({ route, method }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [photoId, setPhotoId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const name = method === "login" ? "Login" : "Register";

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/; // password must contain at least 1 lower and upper case letter, 1 symbol and a minimum of 8 characters

    const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();

        if (!passwordRegex.test(password)) {
            setError("Password must contain at least one uppercase letter, one lowercase letter, one special character and a minimum of 8 characters.");
            setLoading(false);
            return;
        }

        setError("");

        const formData = new FormData();
        formData.append("username", username);
        formData.append("password", password);
        if (method === "register") {
            formData.append("first_name", firstName);
            formData.append("last_name", lastName);
            formData.append("email", email);
            if (photoId) {
                formData.append("photo_id", photoId);
            }
        }

        try {
            const res = await api.post(route, formData);
            if (method === "login") {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
                navigate("/userdash/calendar")
            } else {
                navigate("/login")
            }
        } catch (error) {
            if (method === "login") {
                if (error.response && error.response.status === 401) {
                    alert("User not found. Please check your username or register.");
                } else {
                    alert("An error occurred. Please try again")
                }
            } else {
                alert("An error occurred. Please try again")
            }
        } finally {
            setLoading(false)
        }
    };

    const handlePasswordClick = () => {
        setError(""); // Reset error when the password field is clicked
    };

    return (
        <form onSubmit={handleSubmit} className="form-container">

            <div className="form-logo">
                <img src={reactLogo} alt="Logo" className="logo-img" />
            </div>


            <h1>{name}</h1>

            <input
                className="form-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                required
            />
            <input
                className="form-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onClick={handlePasswordClick}
                placeholder="Password"
                required
            />

            {error && <p className="error-message">{error}</p>} {/* Show password error */}

            {method === "register" && (
                <>
                    <input
                        className="form-input"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First Name"
                        required
                    />
                    <input
                        className="form-input"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Last Name"
                        required
                    />
                    <input
                        className="form-input"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        required
                    />
                    <div className="form-file-upload">
                        <label htmlFor="photo-id">Upload Student ID (optional):</label>
                        <input
                            id="photo-id"
                            type="file"
                            onChange={(e) => setPhotoId(e.target.files[0])}
                        />
                    </div>

                </>
            )}

            <button className="form-button" type="submit">
                {name}
            </button>

            {method === "login" && (
                <div className="form-footer">
                    <a href="/request/reset_password">Forgot Password?</a>
                    <br></br>
                    <p>Don't have an account? </p>
                    <a href="/register">Register</a>
                </div>
            )}

            {method === "register" && (
                <div className="form-footer">
                    <p>Already have an account? </p>
                    <a href="/login">Login</a>
                </div>
            )}
        </form>
    );
}

export default Form
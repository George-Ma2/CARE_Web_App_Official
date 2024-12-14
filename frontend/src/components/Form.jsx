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
    const navigate = useNavigate();

    const name = method === "login" ? "Login" : "Register";

    const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();

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
            alert(error)
        } finally {
            setLoading(false)
        }
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
                placeholder="Password"
                required
            />

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
                    <a href="/reset-password">Forgot Password?</a>
                    <br></br>
                    <p>Already have an account? </p>
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
import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import "../styles/Form.css";
import careLogo from "../assets/care.png";

function Form({ route, method }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [photoId, setPhotoId] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const name = method === "login" ? "Login" : "Register";

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&(),.?":_{}|<>]).{8,}$/;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!passwordRegex.test(password)) {
            setError("Password must contain at least one uppercase letter, one lowercase letter, one special character and a minimum of 8 characters.");
            setLoading(false);
            return;
        }

        setError("");

        const normalizedEmail = email.toLowerCase();

        const formData = new FormData();
        formData.append("username", normalizedEmail);
        formData.append("password", password);
    
        if (method === "register") {
            formData.append("first_name", firstName);
            formData.append("last_name", lastName);
            formData.append("email", normalizedEmail);
            formData.append("photo_id", photoId); 

        }
        try {
            const res = await api.post(route, formData);
            console.log(formData)
        
            if (method === "login") {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
                localStorage.setItem("is_staff", res.data.is_staff);
                console.log('is staff:', res.data.is_staff)

                if (res.data.is_staff) {
                    navigate("/admin/dashboard");
                } else {
                    navigate("/userdash/calendar");
                }

            } else if (method === "register") {
                alert("Registration successful. Please log in.");
                navigate("/login");
            }
        } catch (error) {
            console.error("API Error:", error);
            
            if (error.response) {
                console.error("Server Response Data:", error.response.data);
                console.error("HTTP Status Code:", error.response.status);
                alert(`Error: ${JSON.stringify(error.response.data)}`);
            } else {
                alert("Form submission error: " + error.message || error);
            }
        
        } finally {
            setLoading(false);
        }
    };
    

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhotoId(file);
            setPreview(URL.createObjectURL(file));
            console.log("photo_id", file);
            
        }
    };

    const handlePasswordClick = () => {
        setError(""); 
    };

    return (
        
        
        <form onSubmit={handleSubmit} className="form-container">
            
            <img src={careLogo} alt="Logo" className="form-logo" />
            <h2>{name}</h2>

            <input
                className="form-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
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

            {error && <p className="error-message">{error}</p>} 

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

                    {/* Photo Upload Component */}
                    <div className="form-file-upload">
                        <label htmlFor="photo_id">Upload Student ID (optional):</label>
                        <input
                            id="photo_id"
                            type="file"
                            onChange={handlePhotoUpload}
                        />
                    </div>

                    {preview && (
                        <div className="photo-preview">
                            <img
                                src={preview}
                                
                                alt="Uploaded Photo Preview"
                                style={{ width: "200px", height: "auto", marginTop: "10px" }}
                            />
                            
                        </div>
                    )}
                </>
            )}

            <button className="form-button" type="submit">
                {name}
            </button>

            {method === "login" && (
                <div className="form-footer">
                    <a href="/request/reset_password">Forgot Password?</a>
                    <br />
                    <p>Don't have an account?</p>
                    <a href="/register">Register</a>
                </div>
            )}
            {method === "register" && (
                <div className="form-footer">
                    <p>Already have an account?</p>
                    <a href="/login">Go back to Login</a>
                </div>
            )}
        </form>
    );
}

export default Form;

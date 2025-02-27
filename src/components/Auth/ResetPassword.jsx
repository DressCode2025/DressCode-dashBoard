import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import "bootstrap-icons/font/bootstrap-icons.css";
import Logo from "../Images/Logo.svg";

function ResetPassword() {

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [token, setToken] = useState();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        setToken(token);
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        // Check if passwords match
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            setLoading(false);
            return; // Prevent form submission
        }

        try {
            const response = await api.post("/dashboard/reset-password", {
                token,
                newPassword
            });

            if (response.status === 201) {
                navigate("/login");
            } else {
                setError(response.data.message || "Reset failed");
            }
        } catch (error) {
            setError("An error occurred during reset.");
            console.error("An error occurred during reset:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-body">
                            <div className="d-flex justify-content-center align-items-center">
                                <img src={Logo} alt="Logo" />
                            </div>

                            <h3 className="fs-4">Set a new password</h3>

                            <form onSubmit={handleSubmit}>

                                <div className="mb-3">
                                    <label htmlFor="password" className="form-label">
                                        New Password
                                    </label>
                                    <div className="input-group">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            id="password"
                                            className="form-control"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            <i
                                                className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"
                                                    }`}
                                            ></i>
                                        </button>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="password" className="form-label">
                                        Confirm Password
                                    </label>
                                    <div className="input-group">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            id="password"
                                            className="form-control"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            <i
                                                className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"
                                                    }`}
                                            ></i>
                                        </button>
                                    </div>
                                </div>

                                {error && (
                                    <div className="alert alert-danger" role="alert">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={loading}
                                >
                                    {loading ? "Updating..." : "Update"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ResetPassword
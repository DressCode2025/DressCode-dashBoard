import React, { useState } from "react";
import api from "../api";
import "bootstrap-icons/font/bootstrap-icons.css";
import Logo from "../Images/Logo.svg";
import { Link } from "react-router-dom";


function ForgotPassword() {

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [notification, setNotification] = useState(""); // State for notification message

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await api.post("/dashboard/forgot-password", {
                email,
            });

            if (response.status === 200) {
                setNotification("We've sent a password reset link to your email! Please check your inbox.");
                setEmail("");
            } else {
                setError(response.data.message || "Forgot password request failed");
            }
        } catch (error) {
            setError("An error occurred during forgot request.");
            console.error("An error occurred during forgot request:", error);
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

                            <Link
                                to="/login"
                                type="btn"
                                className="mt-2 btn btn-primary rounded-circle"
                            >
                                <i className="bi bi-chevron-left"></i>
                            </Link>

                            <h3 className="fs-4">Forgot Password</h3>
                            <p className="">Please enter your email to reset the password</p>

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        className="form-control"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                {error && (
                                    <div className="alert alert-danger" role="alert">
                                        {error}
                                    </div>
                                )}

                                {notification && (
                                    <div className="alert alert-success" role="alert">
                                        {notification}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={loading}
                                >
                                    {loading ? "Submitting..." : "Submit"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ForgotPassword
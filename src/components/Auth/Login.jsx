import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import "bootstrap-icons/font/bootstrap-icons.css";
import Logo from "../Images/Logo.svg";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login, UserInfo } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/dashboard/dashboardLogin", {
        email,
        password,
      });

      if (response.status === 200) {
        const { accessToken, roleType, name, role } = response.data.data;

        // Perform login actions
        login(roleType, accessToken);

        // Set user information
        UserInfo(name, roleType, role);

        // Navigate to the overview page
        navigate("/overview");
      } else {
        setError(response.data?.message || "Login failed");
      }
    } catch (error) {
      // Access the error message directly from the response
      const errorMessage =
        error.response?.data?.message || // Display the message from the server
        "An error occurred during login"; // Fallback message

      setError(errorMessage);
      console.error("An error occurred during login:", error);
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

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <div className="input-group">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      className="form-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <i
                        className={`bi ${
                          showPassword ? "bi-eye-slash" : "bi-eye"
                        }`}
                      ></i>
                    </button>
                  </div>
                </div>

                <div className="mb-3 text-end">
                  <Link
                    to="/forgot-password"
                    style={{ textDecoration: "none" }}
                  >
                    Forgot Password?
                  </Link>
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
                  {loading ? "Logging in..." : "Login"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

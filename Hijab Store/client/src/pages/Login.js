import React, { useState } from "react"
import Cookies from "js-cookie"
import { Link, useNavigate } from "react-router-dom"

function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false) // Updated for remember me functionality
  const [loading, setLoading] = useState(false) // Loading state
  const [errorMessage, setErrorMessage] = useState("") // Error message state

  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage("") // Reset error message
    setLoading(true) // Start loading

    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setErrorMessage(errorData.error || "Login failed") // Set error message
        setLoading(false) // Stop loading
        return
      }

      const data = await response.json()

      // Set the cookie with the token returned from the server
      if (rememberMe) {
        Cookies.set("token", data.token, { expires: 1 })
        Cookies.set("email", data.email, { expires: 1 }) // Expires in 1 day
      } else {
        localStorage.setItem("token", data.token)
      }

      alert("Logged in successfully!")
      window.location.replace("/")
    } catch (error) {
      console.error("Login error:", error)
      setErrorMessage("An error occurred while logging in.") // Set generic error message
    } finally {
      setLoading(false) // Stop loading
    }
  }

  return (
    <div className="login-container">
      <h2>Login</h2>
      {errorMessage && <p className="error-message">{errorMessage}</p>}{" "}
      {/* Error message display */}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)} // Toggle remember me
            />
            Remember Me
          </label>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      <p>
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
      <p>
        Forget <Link to="/forget-password">password</Link>
      </p>
    </div>
  )
}

export default Login

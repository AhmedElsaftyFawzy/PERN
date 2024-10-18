// Login.js:
import React, { useState } from "react"
import Cookies from "js-cookie"
import { useNavigate } from "react-router-dom"
function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [cookies, setCookie] = useState(false)

  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        // Handle response errors (e.g., invalid email or password)
        const errorData = await response.json()
        alert(errorData.error || "Login failed") // Display the error message
        return
      }

      const data = await response.json()

      // Set the cookie with the token returned from the server
      if (cookies) {
        Cookies.set("token", data.token, { expires: 1 }) // Expires in 1 day
      } else {
        localStorage.setItem("token", data.token)
      }

      // Optionally redirect or update state to indicate successful login
      alert("Logged in successfully!")
      // Redirect or update state here (e.g., navigate to dashboard)
      navigate("/dashboard")
    } catch (error) {
      console.error("Login error:", error)
      alert("An error occurred while logging in.") // Display a generic error message
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3>Sign In</h3>

      <div className="mb-3">
        <label>Email address</label>
        <input
          type="email"
          className="form-control"
          placeholder="Enter email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
          }}
        />
      </div>
      <div className="mb-3">
        <label>Password</label>
        <input
          type="password"
          className="form-control"
          placeholder="Enter password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
          }}
        />
      </div>
      <div className="mb-3">
        <div className="custom-control custom-checkbox">
          <input
            type="checkbox"
            className="custom-control-input"
            id="customCheck1"
            onChange={(e) => setCookie(e.target.checked)}
          />
          <label className="custom-control-label" htmlFor="customCheck1">
            Remember me
          </label>
        </div>
      </div>
      <div className="d-grid">
        <button type="submit" className="btn btn-primary">
          Submit
        </button>
      </div>
      <p className="forgot-password text-right">
        Forgot <a href="#">password?</a>
      </p>
    </form>
  )
}

export default Login

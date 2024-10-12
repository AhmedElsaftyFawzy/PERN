import React, { useState } from "react"
import { useNavigate } from "react-router-dom"

const SignUp = () => {
  const [first_name, setFirstName] = useState()
  const [last_name, setLastName] = useState()
  const [email, setEmail] = useState()
  const [password, setPassword] = useState()

  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch("http://localhost:3000/registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ first_name, last_name, email, password }),
      })
      if (!response.ok) {
        // Handle response errors (e.g., invalid email or password)
        const errorData = await response.json()
        alert(errorData.error || "Registration failed") // Display the error message
        return
      }
      navigate("/")
    } catch (error) {
      console.error("Registration error:", error)
      alert("An error occurred while Registration.")
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3>Sign Up</h3>

      <div className="mb-3">
        <label>First name</label>
        <input
          type="text"
          className="form-control"
          placeholder="First name"
          value={first_name}
          onChange={(e) => {
            setFirstName(e.target.value)
          }}
        />
      </div>
      <div className="mb-3">
        <label>Last name</label>
        <input
          type="text"
          className="form-control"
          placeholder="Last name"
          value={last_name}
          onChange={(e) => setLastName(e.target.value)}
        />
      </div>
      <div className="mb-3">
        <label>Email address</label>
        <input
          type="email"
          className="form-control"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="mb-3">
        <label>Password</label>
        <input
          type="password"
          className="form-control"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div className="d-grid">
        <button type="submit" className="btn btn-primary">
          Sign Up
        </button>
      </div>
      <p className="forgot-password text-right">
        Already registered <a href="/">sign in?</a>
      </p>
    </form>
  )
}

export default SignUp

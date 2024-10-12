import React, { useState } from "react"

const ForgetPassword = () => {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    // Here you would usually make an API call to send the password reset email
    console.log(`Password reset link sent to ${email}`)
    setMessage("A password reset link has been sent to your email.")
  }

  return (
    <div className="forget-password">
      <h2>Forget Password</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit">Send Reset Link</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  )
}

export default ForgetPassword

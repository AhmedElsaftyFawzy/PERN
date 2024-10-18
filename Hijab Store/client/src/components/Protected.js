import React from "react"
import { Navigate } from "react-router-dom"
import Cookies from "js-cookie"

const ProtectedRoute = ({ children }) => {
  const token = Cookies.get("token")
  const localToken = localStorage.getItem("token")
  // If the token does not exist, redirect to the login page
  if (!token && !localToken) {
    return <Navigate to="/" />
  }

  // If the token exists, render the children components (protected content)
  return children
}

export default ProtectedRoute

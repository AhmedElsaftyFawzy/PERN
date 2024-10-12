import React from "react"
import { Navigate } from "react-router-dom"
import Cookies from "js-cookie"

const Admin = ({ children }) => {
  const token = Cookies.get("email")

  if (!token) {
    return <Navigate to="/login" />
  } else {
    return children
  }
}

export default Admin

import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import Cookies from "js-cookie"

const Header = () => {
  const [login, setLogin] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("token")
    const tokenCookie = Cookies.get("token")
    if (token) setLogin(true)
    else if (tokenCookie) {
      localStorage.setItem("token", tokenCookie)
      setLogin(true)
    } else setLogin(false)
  }, [])
  return (
    <div className="navbar">
      <Link to="/">
        <h1>Hijab Store</h1>
      </Link>
      <Link to="/products">Products</Link>
      {login && <Link to="/cart">Cart</Link>}
      <Link to="/about">About</Link>
      <Link to="/contact">Contact</Link>
      {login ? null : <Link to="/login">Login</Link>}
      {login ? null : <Link to="/register">Registration</Link>}
      {login && (
        <Link
          to="/"
          onClick={() => {
            localStorage.removeItem("token")
            Cookies.remove("token")
            setLogin(false)
          }}
        >
          Logout
        </Link>
      )}
    </div>
  )
}

export default Header

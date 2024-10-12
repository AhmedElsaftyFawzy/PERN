import React from "react"
import { Link } from "react-router-dom"

const NotFound = () => {
  return (
    <div className="not-found-container">
      <h1 className>404 - Page Doesn't Exist --</h1>
      <Link to="/">
        <h2>Home</h2>
      </Link>
    </div>
  )
}

export default NotFound

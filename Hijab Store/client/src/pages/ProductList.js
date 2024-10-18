import React, { useEffect, useState } from "react"
import Cookies from "js-cookie"
import { useDispatch } from "react-redux"
import { addToCart } from "../features/cart/cartSlice"
import { useNavigate } from "react-router"

const ProductList = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const email = Cookies.get("email")
  const isAdmin = email === "ahmedelsafty@gmail.com" // Simplified check
  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchProducts = async () => {
      setError("") // Reset error state before fetching
      try {
        const response = await fetch("http://localhost:5000/products", {
          headers: {
            accept: "application/json",
            "User-agent": "learning app",
          },
        })

        if (response.ok) {
          const data = await response.json()
          setProducts(data.products)
        } else {
          const errorData = await response.json()
          setError(errorData.message || "Failed to fetch products.")
        }
      } catch (err) {
        console.error("Error fetching products:", err)
        setError("An error occurred while fetching products.")
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const handleDeleteProduct = async (productId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/products/${productId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      if (response.ok) {
        setProducts(products.filter((product) => product.id !== productId))
      } else {
        setError("Failed to delete product.")
      }
    } catch (error) {
      console.error("Error deleting product:", error)
      setError("An error occurred while deleting product.")
    }
  }

  const handleBuyProduct = (event, product) => {
    event.preventDefault()
    dispatch(
      addToCart({
        name: product.name,
        price: product.price,
        quantity: 1,
        image_url: product.image_url,
        id: product.id,
      })
    )
    navigate("/cart")
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div className="product-list">
      {products.map((product) => (
        <div key={product.id} className="product-card">
          <img
            crossorigin="anonymous"
            src={product.image_url}
            alt={product.name}
            className="product-image"
          />
          <h3>{product.name}</h3>
          <p>{product.description}</p>
          <p>
            <strong>Price:</strong> ${product.price}
          </p>
          <form onSubmit={(event) => handleBuyProduct(event, product)}>
            <button type="submit" className="btn btn-primary">
              Buy
            </button>
          </form>
          {isAdmin && (
            <button onClick={() => handleDeleteProduct(product.id)}>
              Delete
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

export default ProductList

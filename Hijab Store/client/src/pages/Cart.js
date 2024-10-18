import React from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  addToCart,
  decreaseQuantity,
  removeFromCart,
} from "../features/cart/cartSlice"

const Cart = () => {
  const purchases = useSelector((state) => state.cart.items)
  const dispatch = useDispatch()
  return (
    <div className="product-list">
      {purchases.map((product) => (
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
          <p>
            <strong>Quantity:</strong> {product.quantity}
          </p>
          <button
            type="submit"
            className="btn btn-primary"
            onClick={() => dispatch(addToCart(product))}
          >
            increase Quantity
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            onClick={() => dispatch(decreaseQuantity(product.id))}
          >
            decrease Quantity
          </button>

          <button onClick={() => dispatch(removeFromCart(product.id))}>
            Delete
          </button>
        </div>
      ))}
    </div>
  )
}

export default Cart

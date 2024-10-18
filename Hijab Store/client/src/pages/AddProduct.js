import React, { useState } from "react"

const AddProduct = () => {
  const [file, setFile] = useState(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [quantity, setQuantity] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState("")

  const handleNameChange = (event) => {
    setName(event.target.value)
  }

  const handleDescriptionChange = (event) => {
    setDescription(event.target.value)
  }

  const handlePriceChange = (event) => {
    setPrice(event.target.value)
  }

  const handleQuantityChange = (event) => {
    setQuantity(event.target.value)
  }

  const handleFileChange = (event) => {
    setFile(event.target.files[0])
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    // Basic validation
    if (!name || !description || !price || !quantity || !file) {
      setMessage("Please fill in all fields.")
      setMessageType("error")
      return
    }

    setIsSubmitting(true)
    setMessage("Uploading...")
    setMessageType("")

    const formData = new FormData()
    formData.append("image", file) // Ensure field name matches backend
    formData.append("name", name)
    formData.append("description", description)
    formData.append("price", price)
    formData.append("quantity", quantity)

    try {
      const response = await fetch("http://localhost:5000/products", {
        // Ensure the URL matches backend
        method: "POST",
        body: formData,
      })

      // Check if response is OK
      if (response.ok) {
        const data = await response.json()
        setMessage("Product added successfully!")
        setMessageType("success")
        // Reset form fields
        setName("")
        setDescription("")
        setPrice("")
        setQuantity("")
        setFile(null)
        // Reset file input value
        document.getElementById("image-input").value = ""
      } else {
        // Attempt to parse JSON error message
        let errorData
        try {
          errorData = await response.json()
          setMessage(`Error: ${errorData.message || "Unknown error."}`)
        } catch (parseError) {
          // If response isn't JSON, display generic error
          setMessage(`Error: ${response.statusText}`)
        }
        setMessageType("error")
      }
    } catch (error) {
      console.error("Error uploading product:", error)
      setMessage("An error occurred while uploading the product.")
      setMessageType("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      encType="multipart/form-data"
      className="add-product-form"
    >
      <div className="form-group">
        <label>Product Name:</label>
        <input
          type="text"
          name="name"
          required
          value={name}
          onChange={handleNameChange}
        />
      </div>
      <div className="form-group">
        <label>Product Description:</label>
        <textarea
          name="description"
          required
          value={description}
          onChange={handleDescriptionChange}
        />
      </div>
      <div className="form-group">
        <label>Product Price:</label>
        <input
          type="number"
          name="price"
          required
          value={price}
          onChange={handlePriceChange}
          min="0"
          step="0.01"
        />
      </div>
      <div className="form-group">
        <label>Product Quantity:</label>
        <input
          type="number"
          name="quantity"
          required
          value={quantity}
          onChange={handleQuantityChange}
          min="0"
          step="1"
        />
      </div>
      <div className="form-group">
        <label>Product Image:</label>
        <input
          type="file"
          name="image"
          id="image-input"
          required
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Add Product"}
      </button>
      {message && <p>{message}</p>}
    </form>
  )
}

export default AddProduct

import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  items: [],
}
const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload
      const existingItem = state.items.find((x) => x.id === item.id)
      if (existingItem) {
        existingItem.quantity += 1
      } else {
        state.items.push(item)
      }
    },
    removeFromCart: (state, action) => {
      const itemId = action.payload
      const index = state.items.findIndex((x) => x.id === itemId)
      if (index >= 0) {
        state.items.splice(index, 1)
      }
    },
    decreaseQuantity: (state, action) => {
      const itemId = action.payload
      const item = state.items.find((x) => x.id === itemId)
      if (item && item.quantity > 1) {
        item.quantity -= 1
      }
    },
  },
})

export const { addToCart, removeFromCart, decreaseQuantity } = cartSlice.actions

export default cartSlice.reducer

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"

const initialState = {
  loading: false,
  tasks: [{ todo_id: 2, description: "I need to wash my car" }],
  error: null,
}

export const addTask = createAsyncThunk(
  "tasks/addTask",
  async (description) => {
    try {
      const response = await fetch("http://localhost:5000/todos", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description }),
      })
      const data = await response.json()
      return data
    } catch (error) {
      throw error
    }
  }
)

export const getTasks = createAsyncThunk("tasks/getTasks", async () => {
  try {
    const response = await fetch("http://localhost:5000/todos")
    const data = await response.json()
    return data
  } catch (error) {
    throw error
  }
})

export const getTask = createAsyncThunk("tasks/getTask", async (id) => {
  try {
    const response = await fetch(`http://localhost:5000/todos/${id}`)
    const data = await response.json()
    return data
  } catch (error) {
    throw error
  }
})

export const updateTask = createAsyncThunk(
  "tasks/updateTask",
  async (task, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `http://localhost:5000/todos/${task.todo_id}`,
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(task),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        return rejectWithValue(errorData)
      }

      const data = await response.json()
      return data
    } catch (error) {
      return rejectWithValue({ message: error.message })
    }
  }
)

export const deleteTask = createAsyncThunk("tasks/deleteTask", async (id) => {
  try {
    await fetch(`http://localhost:5000/todos/${id}`, {
      method: "DELETE",
    })
    return id
  } catch (error) {
    throw error
  }
})

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(getTask.pending, (state, action) => {
        state.loading = true
      })
      .addCase(getTask.fulfilled, (state, action) => {
        state.loading = false
        state.tasks = [action.payload]
      })
      .addCase(getTasks.fulfilled, (state, action) => {
        state.tasks = action.payload
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const updatedTask = action.payload
        const index = state.tasks.findIndex(
          (task) => task.id === updatedTask.id
        )
        if (index !== -1) {
          state.tasks[index] = updatedTask // Update the task in the state
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.error = action.payload.message || "Failed to update task" // Set error message
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter(
          (task) => task.todo_id !== action.payload
        )
      })
  },
})

export default tasksSlice.reducer

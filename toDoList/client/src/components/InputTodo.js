import React, { useState } from "react"
import { useDispatch } from "react-redux"
import { addTask } from "../features/tasks/tasksSlice"

const InputTodo = () => {
  const dispatch = useDispatch()
  const [description, setDescription] = useState("")
  const addHandler = (e) => {
    e.preventDefault()
    dispatch(addTask(description))
    setDescription("") // Clear the input field after adding the task
    setTimeout(() => (window.location = "/"), 1000)
  }

  return (
    <div className="inputContainer">
      <h2>Add A New Task</h2>

      {/* TODO: Add form to add new task */}
      <form className="d-flex mt-5" onSubmit={addHandler}>
        <input
          type="text"
          placeholder="Add a new task..."
          name="task"
          className="form-control"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value)
          }}
        />
        <button type="submit" className="btn btn-primary p-3">
          Add
        </button>
      </form>
    </div>
  )
}

export default InputTodo

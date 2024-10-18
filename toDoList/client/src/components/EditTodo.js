import React, { useState } from "react"
import { useDispatch } from "react-redux"
import { updateTask } from "../features/tasks/tasksSlice"

const EditTodo = ({ todo }) => {
  const [description, setDescription] = useState(todo.description)
  const [isModalOpen, setModalOpen] = useState(false)
  const dispatch = useDispatch()

  const updateDescription = async (e) => {
    e.preventDefault()
    dispatch(updateTask({ ...todo, description }))
    setModalOpen(false)
    setTimeout(() => {
      window.location = "/"
    }, 1000)
  }

  return (
    <>
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => setModalOpen(true)}
      >
        Edit
      </button>

      {isModalOpen && (
        <div
          className="modal fade show"
          style={{ display: "block" }}
          tabIndex="-1"
          role="dialog"
          aria-labelledby="editTodoModalLabel"
          aria-hidden="false"
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="editTodoModalLabel">
                  Edit Task
                </h5>
                <button
                  type="button"
                  className="close"
                  onClick={() => setModalOpen(false)}
                  aria-label="Close"
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <form onSubmit={updateDescription}>
                <div className="modal-body">
                  <input
                    type="text"
                    className="form-control"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setModalOpen(false)}
                  >
                    Close
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default EditTodo

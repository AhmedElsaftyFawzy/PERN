import React, { useEffect } from "react"
import EditTodo from "./EditTodo"
import { useDispatch, useSelector } from "react-redux"
import { deleteTask, getTasks } from "../features/tasks/tasksSlice"

const ListTodo = () => {
  const dispatch = useDispatch()
  const allTasks = useSelector((state) => state.tasks)
  const [todos, setTodos] = React.useState([])

  useEffect(() => {
    dispatch(getTasks())
  }, [dispatch])

  useEffect(() => {
    setTodos(allTasks.tasks) // Directly set the state to allTasks
  }, [allTasks])

  const deleteTodo = (id) => {
    // Implement the delete functionality
    dispatch(deleteTask(id))
    // You might want to dispatch a delete action here
  }

  return (
    <div>
      <table className="table mt-5 text-center">
        <thead>
          <tr>
            <th>Description</th>
            <th>Edit</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {todos.length > 0
            ? todos.map((todo) => (
                <tr key={todo.todo_id}>
                  <td>{todo.description}</td>
                  <td>
                    <EditTodo todo={todo} />
                  </td>
                  <td>
                    <button
                      className="btn btn-danger"
                      onClick={() => deleteTodo(todo.todo_id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            : null}
        </tbody>
      </table>
    </div>
  )
}

export default ListTodo

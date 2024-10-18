import "./App.css"
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap/dist/js/bootstrap.bundle.min"
import "bootstrap/dist/js/bootstrap"
import InputTodo from "./components/InputTodo"
import ListTodo from "./components/ListTodo"

function App() {
  return (
    <div className="App">
      <InputTodo />
      <div>
        <ListTodo />
      </div>
    </div>
  )
}

export default App

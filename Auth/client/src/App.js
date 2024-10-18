import "./App.css"
import "bootstrap/dist/css/bootstrap.css"
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap/dist/js/bootstrap.bundle.min"
import Login from "./components/Login.js"
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom"
import ProtectedRoute from "./components/ProtactedRoute.js"
import Dashboard from "./components/Dashboard.js"
import Error from "./components/Error.js"
import SignUp from "./components/SignUp.js"

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route index element={<Login />} />
      <Route path="/signup" exact element={<SignUp />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Error />} />
    </Route>
  )
)
function App() {
  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  )
}

export default App

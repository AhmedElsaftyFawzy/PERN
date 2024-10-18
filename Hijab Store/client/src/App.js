import "bootstrap/dist/css/bootstrap.css"
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom"
import "./App.css"
import { Provider } from "react-redux"
import { store } from "./app/store"
import Layout from "./pages/Layout"
import Error from "./pages/NotFound"
import Home from "./pages/Home"
import NotFound from "./pages/NotFound"
import Login from "./pages/Login"
import Registration from "./pages/Registration"
import ForgetPassword from "./pages/ForgetPassword"
import AddProduct from "./pages/AddProduct"
import ProductList from "./pages/ProductList"
import About from "./pages/About"
import Contact from "./pages/Contact"
import Cart from "./pages/Cart"
import Protected from "./components/Protected"
import Admin from "./components/Admin"

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<Layout />} errorElement={<Error />}>
      <Route index element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Registration />} />
      <Route path="/forget-password" element={<ForgetPassword />} />
      <Route
        path="/add-product"
        element={
          <Admin>
            <AddProduct />
          </Admin>
        }
      />
      <Route path="/products" element={<ProductList />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route
        path="/cart"
        element={
          <Protected>
            <Cart />
          </Protected>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Route>
  )
)
function App() {
  return (
    <Provider store={store}>
      <div className="App">
        <RouterProvider router={router} />
      </div>
    </Provider>
  )
}

export default App

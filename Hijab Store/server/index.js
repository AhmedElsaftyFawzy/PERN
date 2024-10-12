// server.js
import express from "express"
import cors from "cors"
import pg from "pg"
import dotenv from "dotenv"
import jsonwebtoken from "jsonwebtoken"
import bcrypt from "bcrypt"
import Joi from "joi"
import nodemailer from "nodemailer"
import fs from "fs"
import path from "path"
import multer from "multer"
import { fileURLToPath } from "url"
import morgan from "morgan"
import helmet from "helmet"
import rateLimit from "express-rate-limit"

// Load environment variables from .env file
dotenv.config()

const app = express()

// Middleware Setup
app.use(
  cors({
    origin: "http://localhost:3000", // Replace with your frontend's origin
    optionsSuccessStatus: 200,
  })
)
app.use(express.json())
app.use(morgan("combined"))
app.use(helmet())

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
})
app.use(limiter)

// PostgreSQL Pool Setup
const db = new pg.Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
})

db.on("error", (err) => {
  console.error("Unexpected error on idle client", err)
  process.exit(-1)
})

// Define Schemas with Joi
const registerSchema = Joi.object({
  first_name: Joi.string().min(1).required(),
  last_name: Joi.string().min(1).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
})

// Constants
const saltRounds = 10

// Routes

// Login Route
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body
    const existingUser = await db.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    )
    if (!existingUser.rows[0]) {
      return res.status(404).json({ message: "User not found" })
    }
    const isMatch = await bcrypt.compare(
      password,
      existingUser.rows[0].password
    )
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" })
    }
    const token = jsonwebtoken.sign(
      { id: existingUser.rows[0].id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    )
    res.json({ token, email })
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: "Server error" })
  }
})

// Register Route
app.post("/register", async (req, res) => {
  const { error } = registerSchema.validate(req.body)
  if (error) return res.status(400).json({ error: error.details[0].message })

  const { first_name, last_name, email, password } = req.body
  try {
    const existingUser = await db.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    )
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "Email already exists" })
    }
    const hashPassword = await bcrypt.hash(password, saltRounds)
    await db.query(
      "INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4)",
      [first_name, last_name, email, hashPassword]
    )
    res.status(201).json({ message: "Registration Succeeded" })
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: "Server error during registration" })
  }
})

// Forgot Password Route
app.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body
    const existingUser = await db.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    )
    if (existingUser.rows.length === 0) {
      return res.status(404).json({ message: "User not found" })
    }
    const token = jsonwebtoken.sign(
      { id: existingUser.rows[0].id },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    )
    const expiration = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    await db.query(
      "UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE email = $3",
      [token, expiration, email]
    )
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    })
    const mailOptions = {
      from: "noreply@example.com",
      to: email,
      subject: "Reset Password",
      text: `Click on the following link to reset your password: http://localhost:3000/reset-password/${token}`,
    }
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email: ", error)
        return res.status(500).json({ message: "Failed to send email" })
      }
      console.log("Email sent: ", info.response)
      res.status(200).json({ message: "Reset password email sent" })
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: "Failed to reset password" })
  }
})

// Reset Password Route
app.put("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params
    const { password } = req.body
    const decodedToken = jsonwebtoken.verify(token, process.env.JWT_SECRET)
    const userId = decodedToken.id

    // Correct the date comparison by using a proper Date object
    const user = await db.query(
      "SELECT * FROM users WHERE reset_password_token = $1 AND reset_password_expires > NOW()",
      [token]
    )

    if (user.rows.length === 0) {
      return res
        .status(400)
        .json({ error: "Password reset token is invalid or has expired" })
    }
    const hashPassword = await bcrypt.hash(password, saltRounds)
    await db.query(
      "UPDATE users SET password = $1, reset_password_token = NULL, reset_password_expires = NULL WHERE id = $2",
      [hashPassword, userId]
    )
    res.status(200).json({ message: "Password reset successful" })
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: "Server error" })
  }
})

// Setup for File Uploads
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const uploadDir = path.join(__dirname, process.env.UPLOAD_DIR || "uploads")

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// Multer Configuration
const storageMulter = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  },
})

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  )
  const mimetype = allowedTypes.test(file.mimetype)

  if (mimetype && extname) {
    return cb(null, true)
  } else {
    cb(new Error("Only images are allowed (jpeg, jpg, png, gif)"))
  }
}

// Initialize Multer
const upload = multer({
  storage: storageMulter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter: fileFilter,
})

// POST /products Route with File Upload
app.post("/products", upload.single("image"), async (req, res) => {
  try {
    const { name, description, price, quantity } = req.body
    const file = req.file

    if (!name || !description || !price || !quantity || !file) {
      return res.status(400).json({ message: "All fields are required." })
    }

    const imageUrl = `${req.protocol}://${req.get("host")}/${
      process.env.UPLOAD_DIR
    }/${file.filename}`

    const insertQuery = `
      INSERT INTO product (name, description, price, quantity, image_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `
    const values = [name, description, price, quantity, imageUrl]

    const result = await db.query(insertQuery, values)
    const newProduct = result.rows[0]

    res.status(201).json({ product: newProduct })
  } catch (error) {
    console.error("Error adding product:", error)

    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ message: "File size exceeds 5MB limit." })
      }
      return res.status(400).json({ message: error.message })
    }

    res.status(500).json({ message: "Server error. Please try again later." })
  }
})

// Serve Uploaded Images
app.use(`/${process.env.UPLOAD_DIR}`, express.static(uploadDir))

// GET /products Route
app.get("/products", async (req, res) => {
  try {
    const selectQuery = "SELECT * FROM product ORDER BY created_at DESC"
    const result = await db.query(selectQuery)
    res.status(200).json({ products: result.rows })
  } catch (error) {
    console.error("Error fetching products:", error)
    res.status(500).json({ message: "Server error. Please try again later." })
  }
})

// DELETE /products/:id Route
app.delete("/products/:id", async (req, res) => {
  try {
    const productId = req.params.id

    const deleteQuery = "DELETE FROM product WHERE id = $1"
    await db.query(deleteQuery, [productId])

    res.status(200).json({ message: "Product deleted successfully." })
  } catch (error) {
    console.error("Error deleting product:", error)
    res.status(500).json({ message: "Server error. Please try again later." })
  }
})

// Start the Server
app.listen(5000, () => {
  console.log("server listening on port 5000")
})

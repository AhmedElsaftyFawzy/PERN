import express from "express"
import cors from "cors"
import pg from "pg"
import env from "dotenv"
import jsonwebtoken from "jsonwebtoken"
import bcrypt from "bcrypt"
import Joi from "joi"
import nodemailer from "nodemailer"

const app = express()
env.config()
app.use(cors())
app.use(express.json())

const db = new pg.Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
})

const saltRounds = 10
const registrationSchema = Joi.object({
  first_name: Joi.string().min(1).required(),
  last_name: Joi.string().min(1).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
})

app.post("/registration", async (req, res) => {
  try {
    const { error } = registrationSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }
    const { first_name, last_name, email, password } = req.body
    const existingUser = await db.query(
      "SELECT * FROM app_user WHERE email = $1",
      [email]
    )
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "Email already in use" })
    }
    const hash = await bcrypt.hash(password, saltRounds)
    const sql =
      "INSERT INTO app_user (first_name, last_name, email, password) VALUES ($1, $2, $3, $4)"
    const values = [first_name, last_name, email, hash]

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error("Database error:", err) // Log the detailed error
        return res
          .status(500)
          .json({ error: "Database error", details: err.message })
      }
      res.status(201).json({ message: "User registered successfully" })
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message || "Internal server error" })
  }
})

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    // Query to find the user by email
    const existingUser = await db.query(
      "SELECT * FROM app_user WHERE email = $1",
      [email]
    )

    // Check if the user exists
    if (existingUser.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" })
    }

    // Compare the provided password with the stored hash
    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.rows[0].password
    )
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" })
    }

    // Generate a JWT token
    const token = jsonwebtoken.sign(
      { email: existingUser.rows[0].email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    )

    // Respond with the token
    res.json({ message: "Logged in successfully", token })
  } catch (err) {
    console.error("Login error:", err) // Log the error
    res.status(500).json({ error: err.message || "Internal server error" })
  }
})

// Endpoint to request password reset
app.post("/forgot-password", async (req, res) => {
  const { email } = req.body
  try {
    const user = await db.query("SELECT * FROM app_user WHERE email = $1", [
      email,
    ])
    if (user.rows.length === 0) {
      return res.status(404).json({ error: "User not found" })
    }

    const token = crypto.randomBytes(20).toString("hex")
    const expiration = Date.now() + 1000 * 60 * 5 // 5 minutes

    await db.query(
      "UPDATE app_user SET reset_password_token = $1, reset_password_expires = $2 WHERE email = $3",
      [token, expiration, email]
    )

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    const mailOptions = {
      to: email,
      from: process.env.EMAIL_USER,
      subject: "Password Reset",
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
             Please click on the following link, or paste this into your browser to complete the process:\n\n
             http://localhost:3000/reset/${token}\n\n
             If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    }

    transporter.sendMail(mailOptions, (err, response) => {
      if (err) {
        console.error("There was an error: ", err)
        return res.status(500).json({ error: "Error sending email" })
      }
      res.status(200).json({ message: "Recovery email sent" })
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Endpoint to reset password
app.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params
  const { password } = req.body

  try {
    const user = await db.query(
      "SELECT * FROM app_user WHERE reset_password_token = $1 AND reset_password_expires > $2",
      [token, Date.now()]
    )

    if (user.rows.length === 0) {
      return res
        .status(400)
        .json({ error: "Password reset token is invalid or has expired" })
    }

    const hash = await bcrypt.hash(password, saltRounds)

    await db.query(
      "UPDATE app_user SET password = $1, reset_password_token = NULL, reset_password_expires = NULL WHERE email = $2",
      [hash, user.rows[0].email]
    )

    res.status(200).json({ message: "Password has been reset" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
})

app.listen(5000, () => {
  console.log("Server started on port 5000")
})

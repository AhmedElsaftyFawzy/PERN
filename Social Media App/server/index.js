import cors from "cors"
import express from "express"
import pg from "pg"
import env from "dotenv"
import Joi from "joi"
import jsonwebtoken from "jsonwebtoken"
import bcrypt from "bcrypt"
import nodemailer from "nodemailer"

const app = express()
env.config()
app.use(cors())
app.use(express.json())

const db = new pg.Pool({
  user: PG_USER,
  host: PG_HOST,
  database: PG_DATABASE,
  password: PG_PASSWORD,
  port: PG_PORT,
})

const schema = Joi.object({
  first_name: Joi.string().min(1).required(),
  Last_name: Joi.string().min(1).required(),
  email: Joi.email().required(),
  password: Joi.string().min(8).required(),
})

const saltRounds = 10

// registration

app.post("/registration", async (req, res) => {
  try {
    const { error } = schema.valid(req.body)
    if (error) {
      return res.status(400).json({ error: error.detail[0].message })
    }
    const { first_name, last_name, email, password } = req.body
    const existingUser = await db.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    )
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "User Already Exist" })
    }
    const hash = bcrypt.hash(password, saltRounds)
    db.query(
      "INSERT INTO users (first_name,last_name,email,password) VALUES ($1,$2,$3,$4)",
      [first_name, last_name, email, password],
      (error) => {
        if (error) {
          console.error(error)
          return res.status(500).json({
            error: error.message,
          })
        }
        return res
          .status(200)
          .json({ message: "User Registrated Successfully" })
      }
    )
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: err.message || "Internal server error" })
  }
})

// login

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body
    const existingUser = await db.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    )
    if (existingUser.rows.length === 0) {
      return res.status(401).json({
        error: "Invalid email or password",
      })
    }
    if (!bcrypt.compare(password, existingUser.rows[0].password)) {
      res.status(401).json({
        error: "Invalid email or password",
      })
    }
    // token

    const token = jsonwebtoken.sign(
      {
        email: existingUser.rows[0].password,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    )
    res.status(200).json({ message: "login successfully", token })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message || "Internal server error" })
  }
})

// forgetpassword
app.post("/forget-password", async (req, res) => {
  try {
    const { email } = req.body
    const existingUser = await db.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    )
    if (existingUser.rows.length === 0) {
      return res.status(404).json({ error: "User not found" })
    }
    const token = jsonwebtoken.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "5m",
    })
    const expiration = Date.now() + 1000 * 60 * 5

    await db.query(
      "UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE email = $3",
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
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// reset password

app.put("/reset-password/:token", async (req, res) => {
  const { token } = req.params
  const { password } = req.body

  try {
    const user = await db.query(
      "SELECT * FROM users WHERE reset_password_token = $1 AND reset_password_expires > $2",
      [token, Date.now()]
    )

    if (user.rows.length === 0) {
      return res
        .status(400)
        .json({ error: "Password reset token is invalid or has expired" })
    }

    const hash = await bcrypt.hash(password, saltRounds)

    await db.query(
      "UPDATE users SET password = $1, reset_password_token = NULL, reset_password_expires = NULL WHERE email = $2",
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

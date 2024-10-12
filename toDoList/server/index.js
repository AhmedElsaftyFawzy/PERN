import express from "express"
import cors from "cors"
import pg from "pg"
import env from "dotenv"

const app = express()
env.config()
app.use(cors())
app.use(express.json())

const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
})
db.connect()

//create a todo
app.post("/todos", async (req, res) => {
  try {
    const { description } = req.body
    const result = await db.query(
      "INSERT INTO todo (description) VALUES ($1) RETURNING *",
      [description]
    )
    res.json(result.rows[0])
  } catch (error) {
    console.error(error.message)
  }
})

//get all todos
app.get("/todos", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM todo")
    res.json(result.rows)
  } catch (error) {
    console.error(error.message)
  }
})
//get a todo by id
app.get("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params
    const result = await db.query("SELECT * FROM todo WHERE todo_id = $1", [id])
    if (result.rows.length === 0) return res.status(404).send("Todo not found")
    res.json(result.rows[0])
  } catch (error) {
    console.error(error.message)
  }
})
//update a todo
app.put("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params
    const { description } = req.body
    const result = await db.query(
      "UPDATE todo SET description = $1 WHERE todo_id = $2 RETURNING *",
      [description, id]
    )
    if (result.rows.length === 0) return res.status(404).send("Todo not found")
    res.json(result.rows[0])
  } catch (error) {
    console.error(error.message)
  }
})

//delete a todo
app.delete("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params
    const result = await db.query("DELETE FROM todo WHERE todo_id = $1", [id])
    if (result.rowCount === 0) return res.status(404).send("Todo not found")
    res.status(204).send()
  } catch (error) {
    console.error(error.message)
  }
})

app.listen(5000, () => {
  console.log("Server started on port 5000")
})

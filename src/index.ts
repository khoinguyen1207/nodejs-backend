import express, { NextFunction, Request, Response } from "express"
import { defaultErrorHandler } from "~/middlewares/error.middlewares"
const app = express()
const port = 4000
import usersRouter from "~/routes/users.routes"
import databaseService from "~/services/database.services"

databaseService.connect()
app.use(express.json())
app.use("/users", usersRouter)

app.use(defaultErrorHandler)

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})

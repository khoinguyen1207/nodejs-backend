import express, { NextFunction, Request, Response } from "express"
const app = express()
const port = 4000
import usersRouter from "~/routes/users.routes"
import databaseService from "~/services/database.services"

databaseService.connect()
app.use(express.json())
app.use("/users", usersRouter)

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.log("Loi: ", err)
  res.status(404).json({ error: err.message })
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})

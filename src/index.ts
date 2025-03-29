import express from "express"
import cors from "cors"
import { defaultErrorHandler } from "~/middlewares/error.middlewares"
import { envConfig } from "~/constants/config"
import { initUploadsFolder } from "~/utils/file"

import usersRouter from "~/routes/users.routes"
import authRouter from "~/routes/auth.routes"
import mediasRouter from "~/routes/medias.routes"
import databaseService from "~/services/database.services"

const app = express()
const port = envConfig.PORT

initUploadsFolder()
databaseService.connect()
app.use(express.json())
app.use(cors())

// Routes
app.use("/users", usersRouter)
app.use("/auth", authRouter)
app.use("/medias", mediasRouter)

app.use(defaultErrorHandler)

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})

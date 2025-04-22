import express from "express"
import cors from "cors"
import { defaultErrorHandler } from "~/middlewares/error.middlewares"
import { envConfig } from "~/constants/config"
import { initUploadsFolder } from "~/utils/file"
// import { UPLOAD_DIR } from "~/constants/dir"

import usersRouter from "~/routes/users.routes"
import authsRouter from "~/routes/auths.routes"
import mediasRouter from "~/routes/medias.routes"
import databaseService from "~/services/database.services"
import staticsRouter from "~/routes/statics.routes"
import { initLogging } from "~/constants/logging"

const app = express()
const port = envConfig.PORT

initLogging()
initUploadsFolder()
databaseService.connect().then(() => {
  databaseService.indexUser()
  databaseService.indexRefreshToken()
  databaseService.indexFollower()
})
app.use(express.json())
app.use(cors())

// Routes
app.use("/users", usersRouter)
app.use("/auths", authsRouter)
app.use("/medias", mediasRouter)
app.use("/statics", staticsRouter)
// app.use("/statics/videos", express.static(UPLOAD_VIDEO_DIR))

app.use(defaultErrorHandler)

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})

import express from "express"
import helmet from "helmet"
import cors from "cors"
import { defaultErrorHandler } from "~/middlewares/error.middlewares"
import { envConfig } from "~/constants/config"
import { initUploadsFolder } from "~/utils/file"
import { initLogging } from "~/constants/logging"

import usersRouter from "~/routes/users.routes"
import authsRouter from "~/routes/auths.routes"
import mediasRouter from "~/routes/medias.routes"
import bookmarksRouter from "~/routes/bookmarks.routes"
import staticsRouter from "~/routes/statics.routes"
import tweetsRouter from "~/routes/tweets.routes"
import searchRouter from "~/routes/searchs.routes"

import databaseService from "~/services/database.services"
import logRequest from "~/middlewares/logging.middlewares"

const app = express()
const port = envConfig.PORT

initLogging()
initUploadsFolder()

databaseService.connect().then(() => {
  databaseService.indexUser()
  databaseService.indexRefreshToken()
  databaseService.indexFollower()
  databaseService.indexTweet()
})
app.use(express.json())
app.use(helmet())
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  }),
)
app.use(logRequest)

// Routes
app.use("/users", usersRouter)
app.use("/auths", authsRouter)
app.use("/medias", mediasRouter)
app.use("/statics", staticsRouter)
app.use("/tweets", tweetsRouter)
app.use("/bookmarks", bookmarksRouter)
app.use("/searchs", searchRouter)
// app.use("/statics/videos", express.static(UPLOAD_VIDEO_DIR))

app.use(defaultErrorHandler)

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})

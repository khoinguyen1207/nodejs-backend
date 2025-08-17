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
import rateLimit from "express-rate-limit"

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
app.use(logRequest)
app.use(helmet())
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  }),
)
app.use(
  rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: "draft-8", // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
  }),
)
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

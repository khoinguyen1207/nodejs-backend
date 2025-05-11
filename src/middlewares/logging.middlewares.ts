import { NextFunction, Request, Response } from "express"
import { logger } from "~/constants/logging"

const logRequest = (req: Request, res: Response, next: NextFunction) => {
  logger.info({
    message: `${req.method} | ${req.originalUrl} | IP: ${req.ip} | User-Agent: ${req.headers["user-agent"]}`,
  })
  next()
}

export default logRequest

import { NextFunction, Request, Response } from "express"

export const createTweetController = async (req: Request, res: Response, next: NextFunction) => {
  res.json({
    message: "Create tweet controller",
  })
}

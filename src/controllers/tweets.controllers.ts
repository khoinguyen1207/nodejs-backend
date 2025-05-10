import { NextFunction, Request, Response } from "express"
import tweetService from "~/services/tweets.services"
import { TokenPayload } from "~/types/jwt"

export const createTweetController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await tweetService.createTweet(user_id, req.body)
  res.json({
    message: "Create tweet controller",
    data: result,
  })
}

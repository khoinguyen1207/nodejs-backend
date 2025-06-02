import { NextFunction, Request, Response } from "express"
import tweetService from "~/services/tweets.services"
import { TokenPayload } from "~/types/jwt"

export const createTweetController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await tweetService.createTweet(user_id, req.body)
  res.json({
    message: "Create tweet successfully",
    data: result,
  })
}

export const getTweetDetailController = async (req: Request, res: Response, next: NextFunction) => {
  res.json({
    message: "Get tweet detail successfully",
    data: true,
  })
}

export const likeTweetController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await tweetService.likeTweet(user_id, req.body.tweet_id)
  res.json({
    message: "Like tweet successfully",
    data: result,
  })
}

export const unLikeTweetController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  await tweetService.unLikeTweet(user_id, req.params.tweet_id)
  res.json({
    message: "Unlike tweet successfully",
    data: true,
  })
}

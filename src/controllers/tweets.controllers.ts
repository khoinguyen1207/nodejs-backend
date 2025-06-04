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
  await tweetService.increaseViews(req.params.tweet_id, req.decoded_authorization?.user_id)
  const result = await tweetService.getTweetDetail(req.params.tweet_id)
  res.json({
    message: "Get tweet detail successfully",
    data: result,
  })
}

export const getTweetChildrenController = async (req: Request, res: Response, next: NextFunction) => {
  const queryString = {
    tweet_type: Number(req.query.tweet_type),
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 5,
  }

  const { tweets, totalTweets } = await tweetService.getTweetChildren({
    tweet_id: req.params.tweet_id,
    ...queryString,
  })

  res.json({
    message: "Get tweets successfully",
    data: {
      tweets: tweets,
      page: queryString.page,
      limit: queryString.limit,
      total_page: Math.ceil(totalTweets / queryString.limit),
    },
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

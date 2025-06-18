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
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await tweetService.getTweetDetail(req.params.tweet_id, user_id)
  res.json({
    message: "Get tweet detail successfully",
    data: result,
  })
}

export const getTweetChildrenController = async (req: Request, res: Response, next: NextFunction) => {
  const tweet_type = Number(req.query.tweet_type)
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 10
  const user_id = req.decoded_authorization?.user_id

  const { tweets, totalTweets } = await tweetService.getTweetChildren({
    tweet_id: req.params.tweet_id,
    tweet_type,
    page,
    limit,
    user_id,
  })

  res.json({
    message: "Get tweets successfully",
    data: {
      tweets: tweets,
      page: page,
      limit: limit,
      total_page: Math.ceil(totalTweets / limit),
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

export const getNewFeedsController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 10

  const { tweets, total_tweets } = await tweetService.getNewFeeds(user_id, page, limit)

  res.json({
    message: "Get new feeds successfully",
    data: {
      tweets: tweets,
      page: page,
      limit: limit,
      total_page: Math.ceil(total_tweets / limit),
    },
  })
}

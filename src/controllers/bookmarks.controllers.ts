import { NextFunction, Request, Response } from "express"
import bookmarkService from "~/services/bookmarks.services"
import { TokenPayload } from "~/types/jwt"

export const bookmarksTweetController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await bookmarkService.bookmarkTweet(user_id, req.body.tweet_id)
  res.json({
    message: "Create tweet controller",
    data: result,
  })
}

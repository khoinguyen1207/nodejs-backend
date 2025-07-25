import { NextFunction, Request, Response } from "express"
import searchService from "~/services/searchs.services"
import { MediaTypeQuery } from "~/types/enums"
import { TokenPayload } from "~/types/jwt"

export const searchController = async (req: Request, res: Response, next: NextFunction) => {
  const page = Number(req.query.page)
  const limit = Number(req.query.limit)
  const content = req.query.content as string
  const { user_id } = req.decoded_authorization as TokenPayload
  const media_type = req.query.media_type as MediaTypeQuery
  const people_follow = Boolean(req.query.people_follow === "on")

  const { tweets, total_tweets } = await searchService.search({ content, page, limit, user_id, media_type, people_follow })

  res.json({
    message: "Search successfully",
    data: {
      tweets: tweets,
      page: page,
      limit: limit,
      total_page: Math.ceil(total_tweets / limit),
    },
  })
}

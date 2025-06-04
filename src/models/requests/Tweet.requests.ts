import { TweetAudience, TweetType } from "~/types/enums"
import { Media } from "~/types/medias"

export interface CreateTweetReqBody {
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | string
  hashtags: string[]
  mentions: string[]
  medias: Media[]
}

export interface GetTweetChildrenPayload {
  tweet_id: string
  tweet_type: TweetType
  page: number
  limit: number
}

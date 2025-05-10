import { ObjectId } from "mongodb"
import { CreateTweetReqBody } from "~/models/requests/Tweet.requests"
import Tweet from "~/models/schemas/Tweet.schema"
import databaseService from "~/services/database.services"

class TweetService {
  async createTweet(user_id: string, body: CreateTweetReqBody) {
    const result = await databaseService.tweets.insertOne(
      new Tweet({
        audience: body.audience,
        content: body.content,
        hashtags: [],
        medias: body.medias,
        mentions: body.mentions,
        user_id: new ObjectId(user_id),
        parent_id: body.parent_id,
        type: body.type,
      }),
    )
    const tweet = await databaseService.tweets.findOne({
      _id: result.insertedId,
    })
    return tweet
  }
}

const tweetService = new TweetService()
export default tweetService

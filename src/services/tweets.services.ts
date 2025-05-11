import { ObjectId, WithId } from "mongodb"
import { CreateTweetReqBody } from "~/models/requests/Tweet.requests"
import Hashtag from "~/models/schemas/Hashtag.schema"
import Tweet from "~/models/schemas/Tweet.schema"
import databaseService from "~/services/database.services"

class TweetService {
  async checkAndCreateHashtags(hashtags: string[]) {
    const hashtagDocuments = await Promise.all(
      hashtags.map((hashtag) => {
        return databaseService.hashtags.findOneAndUpdate(
          {
            name: hashtag,
          },
          {
            $setOnInsert: new Hashtag({
              name: hashtag,
            }),
          },
          {
            upsert: true,
            returnDocument: "after",
          },
        )
      }),
    )
    return hashtagDocuments.map((hashtagDoc) => (hashtagDoc as WithId<Hashtag>)._id)
  }

  async createTweet(user_id: string, body: CreateTweetReqBody) {
    const hashtags = await this.checkAndCreateHashtags(body.hashtags)
    const result = await databaseService.tweets.insertOne(
      new Tweet({
        audience: body.audience,
        content: body.content,
        hashtags: hashtags,
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

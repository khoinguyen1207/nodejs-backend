import { ObjectId, WithId } from "mongodb"
import { CreateTweetReqBody } from "~/models/requests/Tweet.requests"
import Hashtag from "~/models/schemas/Hashtag.schema"
import Like from "~/models/schemas/Like.schema"
import Tweet from "~/models/schemas/Tweet.schema"
import databaseService from "~/services/database.services"
import { NotFoundError } from "~/utils/error-handler"

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

  async likeTweet(user_id: string, tweet_id: string) {
    const result = await databaseService.likes.findOneAndUpdate(
      {
        user_id: new ObjectId(user_id),
        tweet_id: new ObjectId(tweet_id),
      },
      {
        $setOnInsert: new Like({
          user_id: new ObjectId(user_id),
          tweet_id: new ObjectId(tweet_id),
        }),
      },
      {
        upsert: true,
        returnDocument: "after",
      },
    )
    return result
  }

  async unLikeTweet(user_id: string, tweet_id: string) {
    const result = await databaseService.likes.findOneAndDelete({
      user_id: new ObjectId(user_id),
      tweet_id: new ObjectId(tweet_id),
    })

    if (!result) {
      throw new NotFoundError("Like not found")
    }

    return true
  }
}

const tweetService = new TweetService()
export default tweetService

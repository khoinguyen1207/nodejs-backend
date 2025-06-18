import { ObjectId, WithId } from "mongodb"
import { CreateTweetReqBody, GetTweetChildrenPayload } from "~/models/requests/Tweet.requests"
import Hashtag from "~/models/schemas/Hashtag.schema"
import Like from "~/models/schemas/Like.schema"
import Tweet from "~/models/schemas/Tweet.schema"
import databaseService from "~/services/database.services"
import { TweetAudience, TweetType } from "~/types/enums"
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

  async increaseViews(tweet_id: string, user_id?: string) {
    const inc = user_id ? { user_views: 1 } : { guest_views: 1 }
    await databaseService.tweets.updateOne(
      {
        _id: new ObjectId(tweet_id),
      },
      {
        $inc: inc,
        $currentDate: {
          updated_at: true,
        },
      },
    )
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

  async getTweetDetail(tweet_id: string) {
    const tweets = await databaseService.tweets
      .aggregate<Tweet>([
        {
          $match: {
            _id: new ObjectId(tweet_id),
          },
        },
        {
          $lookup: {
            from: "hashtags",
            localField: "hashtags",
            foreignField: "_id",
            as: "hashtags",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "mentions",
            foreignField: "_id",
            as: "mentions",
          },
        },
        {
          $lookup: {
            from: "bookmarks",
            localField: "_id",
            foreignField: "tweet_id",
            as: "bookmarks",
          },
        },
        {
          $lookup: {
            from: "likes",
            localField: "_id",
            foreignField: "tweet_id",
            as: "likes",
          },
        },
        {
          $lookup: {
            from: "tweets",
            localField: "_id",
            foreignField: "parent_id",
            as: "tweet_children",
          },
        },
        {
          $addFields: {
            bookmarks: {
              $size: "$bookmarks",
            },
            likes: {
              $size: "$likes",
            },
            mentions: {
              $map: {
                input: "$mentions",
                as: "mention",
                in: {
                  _id: "$$mention._id",
                  name: "$$mention.name",
                  email: "$$mention.email",
                  username: "$$mention.username",
                },
              },
            },
            retweet_count: {
              $size: {
                $filter: {
                  input: "$tweet_children",
                  as: "item",
                  cond: {
                    $eq: ["$$item.type", TweetType.Retweet],
                  },
                },
              },
            },
            comment_count: {
              $size: {
                $filter: {
                  input: "$tweet_children",
                  as: "item",
                  cond: {
                    $eq: ["$$item.type", TweetType.Comment],
                  },
                },
              },
            },
            quote_count: {
              $size: {
                $filter: {
                  input: "$tweet_children",
                  as: "item",
                  cond: {
                    $eq: ["$$item.type", TweetType.QuoteTweet],
                  },
                },
              },
            },
          },
        },
        {
          $project: {
            tweet_children: 0,
          },
        },
      ])
      .toArray()

    return tweets[0]
  }

  async getTweetChildren({ tweet_id, tweet_type, page, limit, user_id }: GetTweetChildrenPayload) {
    const tweets = await databaseService.tweets
      .aggregate<Tweet>([
        {
          $match: {
            parent_id: new ObjectId(tweet_id),
            type: tweet_type,
          },
        },
        {
          $lookup: {
            from: "hashtags",
            localField: "hashtags",
            foreignField: "_id",
            as: "hashtags",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "mentions",
            foreignField: "_id",
            as: "mentions",
          },
        },
        {
          $lookup: {
            from: "bookmarks",
            localField: "_id",
            foreignField: "tweet_id",
            as: "bookmarks",
          },
        },
        {
          $lookup: {
            from: "likes",
            localField: "_id",
            foreignField: "tweet_id",
            as: "likes",
          },
        },
        {
          $lookup: {
            from: "tweets",
            localField: "_id",
            foreignField: "parent_id",
            as: "tweet_children",
          },
        },
        {
          $addFields: {
            bookmarks: {
              $size: "$bookmarks",
            },
            likes: {
              $size: "$likes",
            },
            mentions: {
              $map: {
                input: "$mentions",
                as: "mention",
                in: {
                  _id: "$$mention._id",
                  name: "$$mention.name",
                  email: "$$mention.email",
                  username: "$$mention.username",
                },
              },
            },
            retweet_count: {
              $size: {
                $filter: {
                  input: "$tweet_children",
                  as: "item",
                  cond: {
                    $eq: ["$$item.type", TweetType.Retweet],
                  },
                },
              },
            },
            comment_count: {
              $size: {
                $filter: {
                  input: "$tweet_children",
                  as: "item",
                  cond: {
                    $eq: ["$$item.type", TweetType.Comment],
                  },
                },
              },
            },
            quote_count: {
              $size: {
                $filter: {
                  input: "$tweet_children",
                  as: "item",
                  cond: {
                    $eq: ["$$item.type", TweetType.QuoteTweet],
                  },
                },
              },
            },
          },
        },
        {
          $project: {
            tweet_children: 0,
          },
        },
        {
          $skip: limit * (page - 1),
        },
        {
          $limit: limit,
        },
      ])
      .toArray()

    const tweet_ids = tweets.map((item) => item._id as ObjectId)
    const [_, totalTweets] = await Promise.all([
      databaseService.tweets.updateMany(
        {
          _id: {
            $in: tweet_ids,
          },
        },
        {
          $inc: user_id ? { user_views: 1 } : { guest_views: 1 },
        },
      ),
      databaseService.tweets.countDocuments({
        parent_id: new ObjectId(tweet_id),
        type: tweet_type,
      }),
    ])
    tweets.forEach((item) => {
      if (user_id) {
        item.user_views += 1
      } else {
        item.guest_views += 1
      }
    })

    return { tweets, totalTweets }
  }

  async getNewFeeds(user_id: string, page: number, limit: number) {
    const userObjectId = new ObjectId(user_id)
    const followed_user_ids = await databaseService.followers
      .find(
        {
          user_id: userObjectId,
        },
        {
          projection: {
            followed_user_id: 1,
            _id: 0,
          },
        },
      )
      .toArray()

    const followed_user_ids_array = followed_user_ids.map((item) => item.followed_user_id)
    followed_user_ids_array.push(userObjectId) // Include the user themselves

    const tweets = await databaseService.tweets
      .aggregate([
        {
          $match: {
            user_id: {
              $in: followed_user_ids_array,
            },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "user_id",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: {
            path: "$user",
          },
        },
        {
          $match: {
            $or: [
              {
                audience: TweetAudience.Everyone,
              },
              {
                $and: [
                  {
                    audience: TweetAudience.TwitterCircle,
                  },
                  {
                    "user.twitter_circle": {
                      $in: [userObjectId],
                    },
                  },
                ],
              },
            ],
          },
        },
        {
          $skip: limit * (page - 1),
        },
        {
          $limit: limit,
        },
        {
          $lookup: {
            from: "hashtags",
            localField: "hashtags",
            foreignField: "_id",
            as: "hashtags",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "mentions",
            foreignField: "_id",
            as: "mentions",
          },
        },
        {
          $lookup: {
            from: "bookmarks",
            localField: "_id",
            foreignField: "tweet_id",
            as: "bookmarks",
          },
        },
        {
          $lookup: {
            from: "likes",
            localField: "_id",
            foreignField: "tweet_id",
            as: "likes",
          },
        },
        {
          $lookup: {
            from: "tweets",
            localField: "_id",
            foreignField: "parent_id",
            as: "tweet_children",
          },
        },
        {
          $addFields: {
            bookmarks: {
              $size: "$bookmarks",
            },
            likes: {
              $size: "$likes",
            },
            mentions: {
              $map: {
                input: "$mentions",
                as: "mention",
                in: {
                  _id: "$$mention._id",
                  name: "$$mention.name",
                  email: "$$mention.email",
                  username: "$$mention.username",
                },
              },
            },
            retweet_count: {
              $size: {
                $filter: {
                  input: "$tweet_children",
                  as: "item",
                  cond: {
                    $eq: ["$$item.type", TweetType.Retweet],
                  },
                },
              },
            },
            comment_count: {
              $size: {
                $filter: {
                  input: "$tweet_children",
                  as: "item",
                  cond: {
                    $eq: ["$$item.type", TweetType.Comment],
                  },
                },
              },
            },
            quote_count: {
              $size: {
                $filter: {
                  input: "$tweet_children",
                  as: "item",
                  cond: {
                    $eq: ["$$item.type", TweetType.QuoteTweet],
                  },
                },
              },
            },
          },
        },
        {
          $project: {
            tweet_children: 0,
            user: {
              password: 0,
              forgot_password_token: 0,
              email_verify_token: 0,
              twitter_circle: 0,
              date_of_birth: 0,
            },
          },
        },
      ])
      .toArray()
    return tweets
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

import { ObjectId } from "mongodb"
import { SearchQuery } from "~/models/requests/Search.requests"
import databaseService from "~/services/database.services"
import tweetService from "~/services/tweets.services"
import { MediaType, MediaTypeQuery, TweetAudience, TweetType } from "~/types/enums"

class SearchService {
  async search(query: SearchQuery) {
    const { content = "", page, limit, user_id, media_type } = query
    const userObjectId = new ObjectId(user_id)

    const filter = {
      $text: {
        $search: content,
      },
    } as any

    if (media_type) {
      if (media_type === MediaTypeQuery.IMAGE) {
        filter["medias.type"] = MediaType.IMAGE
      } else if (media_type === MediaTypeQuery.VIDEO) {
        filter["medias.type"] = MediaType.VIDEO
      }
    }

    const [tweets, total_tweets] = await Promise.all([
      databaseService.tweets
        .aggregate([
          {
            $match: filter,
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
        .toArray(),
      databaseService.tweets
        .aggregate([
          {
            $match: filter,
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
            $count: "total_tweets",
          },
        ])
        .toArray(),
    ])

    // Get the tweet IDs
    const tweet_ids = tweets.map((item) => item._id as ObjectId)

    // Increase views for the tweets
    await tweetService.increaseViews(tweet_ids, user_id)
    tweets.forEach((item) => {
      item.user_views += 1
    })

    return { tweets, total_tweets: total_tweets.length > 0 ? total_tweets[0].total_tweets : 0 }
  }
}

const searchService = new SearchService()
export default searchService

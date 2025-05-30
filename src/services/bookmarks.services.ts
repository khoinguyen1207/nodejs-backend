import { ObjectId } from "mongodb"
import Bookmark from "~/models/schemas/Bookmark.schema"
import databaseService from "~/services/database.services"
import { NotFoundError, UnprocessableEntityError } from "~/utils/error-handler"

class BookmarkService {
  async bookmarkTweet(user_id: string, tweet_id: string) {
    const result = await databaseService.bookmarks.findOneAndUpdate(
      {
        user_id: new ObjectId(user_id),
        tweet_id: new ObjectId(tweet_id),
      },
      {
        $setOnInsert: new Bookmark({
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

  async unBookmarkTweet(user_id: string, tweet_id: string) {
    const result = await databaseService.bookmarks.findOneAndDelete({
      user_id: new ObjectId(user_id),
      tweet_id: new ObjectId(tweet_id),
    })

    if (!result) {
      throw new NotFoundError("Bookmark not found")
    }

    return true
  }
}

const bookmarkService = new BookmarkService()
export default bookmarkService

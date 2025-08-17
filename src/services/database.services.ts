import { MongoClient, Db, Collection } from "mongodb"
import User from "~/models/schemas/User.schema"
import { envConfig } from "~/constants/config"
import RefreshToken from "~/models/schemas/RefreshToken.schema"
import Follower from "~/models/schemas/Follower.schema"
import Tweet from "~/models/schemas/Tweet.schema"
import Hashtag from "~/models/schemas/Hashtag.schema"
import Bookmark from "~/models/schemas/Bookmark.schema"
import Like from "~/models/schemas/Like.schema"
import { logger } from "~/constants/logging"

const uri = `mongodb+srv://${envConfig.DB_USERNAME}:${envConfig.DB_PASSWORD}@twitter.rguyisz.mongodb.net/?retryWrites=true&w=majority&appName=Twitter`

class DatabaseService {
  private client: MongoClient
  private db: Db

  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(envConfig.DB_NAME)
  }

  async connect() {
    try {
      // Connect the client to the server	(optional starting in v4.7)
      await this.client.connect()
      // Send a ping to confirm a successful connection
      await this.db.command({ ping: 1 })
      logger.info("✅ Pinged your deployment. You successfully connected to MongoDB!")
    } catch (error) {
      logger.error("❌ Failed to connect to MongoDB:", error)
      await this.client.close()
    }
  }

  async indexUser() {
    const indexesExist = await this.users.indexExists(["email_1_password_1", "email_1", "username_1"])
    if (!indexesExist) {
      this.users.createIndex({ email: 1, password: 1 })
      this.users.createIndex({ email: 1 }, { unique: true })
      this.users.createIndex({ username: 1 }, { unique: true })
    }
  }

  async indexRefreshToken() {
    const indexesExist = await this.refresh_tokens.indexExists(["token_1"])
    if (!indexesExist) {
      this.refresh_tokens.createIndex({ token: 1 })
    }
  }

  async indexFollower() {
    const indexesExist = await this.followers.indexExists(["user_id_1_followed_user_id_1"])
    if (!indexesExist) {
      this.followers.createIndex({ user_id: 1, followed_user_id: 1 })
    }
  }

  async indexTweet() {
    const indexesExist = await this.tweets.indexExists(["content_text"])
    if (!indexesExist) {
      this.tweets.createIndex({ content: "text" })
    }
  }

  get users(): Collection<User> {
    return this.db.collection("users")
  }

  get refresh_tokens(): Collection<RefreshToken> {
    return this.db.collection("refresh_tokens")
  }

  get followers(): Collection<Follower> {
    return this.db.collection("followers")
  }

  get tweets(): Collection<Tweet> {
    return this.db.collection("tweets")
  }

  get hashtags(): Collection<Hashtag> {
    return this.db.collection("hashtags")
  }

  get bookmarks(): Collection<Bookmark> {
    return this.db.collection("bookmarks")
  }

  get likes(): Collection<Like> {
    return this.db.collection("likes")
  }
}

const databaseService = new DatabaseService()
export default databaseService

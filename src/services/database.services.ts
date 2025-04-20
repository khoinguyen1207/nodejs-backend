import { MongoClient, Db, Collection } from "mongodb"
import User from "~/models/schemas/User.schema"
import { envConfig } from "~/constants/config"
import RefreshToken from "~/models/schemas/RefreshToken.schema"
import Follower from "~/models/schemas/Follower.schema"

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
      console.log("Pinged your deployment. You successfully connected to MongoDB!")
    } catch (error) {
      console.log(error)
      await this.client.close()
    }
  }

  indexUser() {
    this.users.createIndex({ email: 1, password: 1 })
    this.users.createIndex({ email: 1 }, { unique: true })
    this.users.createIndex({ username: 1 }, { unique: true })
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
}

const databaseService = new DatabaseService()
export default databaseService

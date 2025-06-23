import { Pagination } from "~/models/requests/Util.requests"
import { MediaTypeQuery } from "~/types/enums"

export interface SearchQuery extends Pagination {
  user_id: string
  content?: string
  media_type?: MediaTypeQuery
  people_follow?: boolean
}

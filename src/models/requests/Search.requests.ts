import { Pagination } from "~/models/requests/Util.requests"

export interface SearchQuery extends Pagination {
  content: string
  user_id: string
}

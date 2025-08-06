export interface Paginated<T> {
  currentPage?: number
  data: T[]
  total?: number
  next?: number
  prev?: number
  lastPage?: number
  firstPageUrl?: string
  lastPageUrl?: string
  nextPageUrl?: string
  perPage?: number
  nextCursor?: string
  prevCursor?: string
  prevPageUrl?: string
}
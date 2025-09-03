export type BlogSort = 'latest' | 'oldest'
export type BlogType = 'all' | 'moic' | 'risk' | 'insight'

export interface BlogsParams {
  page: number
  sort: BlogSort
  type?: BlogType
  search?: string
}

type ParamRecord = Record<string, string | string[] | undefined>
type Gettable = { get: (key: string) => string | null }
type SearchParamsLike = URLSearchParams | Gettable | ParamRecord

function isGettable(x: unknown): x is Gettable {
  return !!x && typeof (x as Gettable).get === 'function'
}

function getParam(input: SearchParamsLike, key: string): string | undefined {
  if (input instanceof URLSearchParams) return input.get(key) ?? undefined
  if (isGettable(input)) return input.get(key) ?? undefined
  const rec = input as ParamRecord
  const v = rec[key]
  return Array.isArray(v) ? v[0] : v
}

export function parseBlogsParams(input: SearchParamsLike): BlogsParams {
  const page = Math.max(1, parseInt(getParam(input, 'page') || '1', 10))
  const sort = (getParam(input, 'sort') as BlogSort) || 'latest'
  const type = (getParam(input, 'type') as BlogType) || undefined
  const search = getParam(input, 'search') || undefined
  return { page, sort, type, search }
}

export function blogsParamsToQuery(params: Partial<BlogsParams>): string {
  const sp = new URLSearchParams()
  if (params.page && params.page > 1) sp.set('page', String(params.page))
  if (params.sort && params.sort !== 'latest') sp.set('sort', params.sort)
  if (params.type && params.type !== 'all') sp.set('type', params.type)
  if (params.search && params.search.trim()) sp.set('search', params.search.trim())
  return sp.toString()
}

export type Hold = 3 | 5 | 10

export interface AnalysisParams {
  experts?: string[]
  ticker?: string
  hold?: Hold
}

export function parseAnalysisParams(input: SearchParamsLike): AnalysisParams {
  const expertsStr = getParam(input, 'experts')
  const experts = expertsStr ? expertsStr.split(',').filter(Boolean) : undefined
  const ticker = getParam(input, 'ticker') || undefined
  const holdRaw = parseInt(getParam(input, 'hold') || '', 10)
  const hold = ([3, 5, 10] as number[]).includes(holdRaw) ? (holdRaw as Hold) : undefined
  return { experts, ticker, hold }
}

export function analysisParamsToQuery(params: AnalysisParams): string {
  const sp = new URLSearchParams()
  if (params.experts && params.experts.length > 0) sp.set('experts', params.experts.join(','))
  if (params.ticker && params.ticker.trim()) sp.set('ticker', params.ticker.trim().toUpperCase())
  if (params.hold) sp.set('hold', String(params.hold))
  return sp.toString()
}


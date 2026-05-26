export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS'

// Postman API response types
export interface PostmanCollectionSummary {
  id: string
  name: string
  uid: string
  updatedAt?: string
  fork?: { label: string }
}

export interface PostmanCollectionsResponse {
  collections: PostmanCollectionSummary[]
}

export interface PostmanCollectionDetail {
  collection: {
    info: {
      name: string
      description?: string
      schema: string
      _postman_id?: string
    }
    item: CollectionItem[]
    variable?: CollectionVariable[]
  }
}

export interface CollectionItem {
  id?: string
  name: string
  item?: CollectionItem[]     // folder
  request?: PostmanRequest    // leaf request
  _postman_id?: string
  description?: string
}

export interface PostmanRequest {
  method: string
  url: PostmanUrl | string
  header?: PostmanHeader[]
  body?: PostmanBody
  description?: string
  auth?: PostmanAuth
}

export interface PostmanUrl {
  raw: string
  protocol?: string
  host?: string[]
  path?: string[]
  port?: string
  query?: PostmanQueryParam[]
  variable?: PostmanVariable[]
}

export interface PostmanHeader {
  key: string
  value: string
  disabled?: boolean
  description?: string
}

export interface PostmanQueryParam {
  key: string
  value: string
  disabled?: boolean
  description?: string
}

export interface PostmanVariable {
  key: string
  value: string
  type?: string
  disabled?: boolean
}

export interface CollectionVariable {
  key: string
  value: string
  type?: string
}

export interface PostmanKeyValue {
  key?: string
  value?: string
  disabled?: boolean
  description?: string
}

export interface PostmanBody {
  mode: 'raw' | 'urlencoded' | 'formdata' | 'file' | 'graphql'
  raw?: string
  options?: {
    raw?: {
      language?: 'json' | 'text' | 'html' | 'xml' | 'javascript'
    }
  }
  urlencoded?: PostmanKeyValue[]
  formdata?: FormDataItem[]
}

export interface PostmanAuth {
  type: string
  bearer?: { key: string; value: string }[]
  basic?: { key: string; value: string }[]
  apikey?: { key: string; value: string }[]
}

export interface PostmanEnvironment {
  id: string
  name: string
  uid: string
}

export interface PostmanEnvironmentDetail {
  environment: {
    id: string
    name: string
    values: {
      key: string
      value: string
      enabled: boolean
      type?: string
    }[]
  }
}

// App-internal types
export interface KeyValuePair {
  id: string
  key: string
  value: string
  enabled: boolean
}

export interface FormDataItem extends KeyValuePair {
  type: 'text' | 'file'
}

export interface RequestState {
  collectionItemId?: string
  collectionItemName?: string
  method: HttpMethod
  url: string
  headers: KeyValuePair[]
  params: KeyValuePair[]
  bodyMode: 'none' | 'raw' | 'urlencoded' | 'formdata'
  bodyRaw: string
  bodyLanguage: 'json' | 'text' | 'html' | 'xml'
  bodyUrlEncoded: KeyValuePair[]
}

export interface ResponseState {
  status: number
  statusText: string
  headers: Record<string, string>
  body: string
  bodyJson?: unknown
  time: number
  size: number
}

export interface HistoryEntry {
  id: string
  request: RequestState
  response: ResponseState
  timestamp: number
}

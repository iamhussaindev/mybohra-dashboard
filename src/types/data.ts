export interface Data {
  id: number
  key: string
  value: string | null
  created_at: string
  updated_at: string
}

export interface CreateDataRequest {
  key: string
  value?: string | null
}

export interface UpdateDataRequest {
  key?: string
  value?: string | null
}

export interface DataFilters {
  key?: string
  value?: string
}

export enum DataKeyEnum {
  QIYAM = 'current_qiyam',
  MIQAAT = 'miqaat_version',
  LOCATION = 'location_version',
  TASBEEH = 'tasbeeh_version',
  DUA_LIST = 'dua_version',
}

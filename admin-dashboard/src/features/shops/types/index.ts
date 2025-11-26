export interface Shop {
  id: string
  shopName: string
  shopDescription: string
  shopLogo: string
  shopAddress: string
  shopPersonalIdentifyId: string
  shopEmail: string
  shopPhone: string
  shopStatus: boolean
  walletAmount: number
  followerCount: number
  isFollowing: boolean
  createdDate: string
  banners?: string[]
  taxInfo: TaxInfo | null
}

export interface TaxInfo {
  id: string
  taxCode: string
  taxNationalName: string
  taxShortName: string
  taxPresentName: string
  taxActiveDate: string
  taxBusinessType: string
  taxActiveStatus: boolean
}

export interface PendingShop {
  shopId: string
  shopName: string
  shopEmail: string
  shopPhone: string
  shopStatus: boolean
  pendingProductCount: number
  createdDate: string
}

export interface ShopSearchParams {
  pagenumber?: number
  pagesize?: number
  searchterm?: string
  status?: boolean
}

export interface ShopsResponse {
  extra: {
    currentPage: number
    totalPages: number
    totalElements: number
    pageSize: number
    hasPreviousPage: boolean
    hasNextPage: boolean
  }
  result: Shop[]
  succeeded: boolean
  code: number
}

export interface PendingShopsResponse {
  extra: {
    currentPage: number
    totalPages: number
    totalElements: number
    pageSize: number
    hasPreviousPage: boolean
    hasNextPage: boolean
  }
  result: PendingShop[]
  succeeded: boolean
  code: number
}

export interface ShopDetailResponse {
  result: Shop
  messages: string[]
  succeeded: boolean
  code: number
}

export interface ShopApprovalRequest {
  IsApproved: boolean
  Feedback?: string
}

export interface ShopApprovalResponse {
  result: boolean
  messages: string[]
  succeeded: boolean
  code: number
}
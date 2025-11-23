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
  taxInfo: TaxInfo | null
  shopStatus: boolean
  pendingProductCount: number
  createdDate: string
}

export interface ShopSearchParams {
  PageNumber?: number
  PageSize?: number
  SearchTerm?: string
  Status?: boolean
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

export interface ShopApprovalRequest {
  isApproved: boolean
  feedback?: string
}

export interface Shop {
  id: string
  shopName: string
  shopDescription?: string
  shopLogo?: string
  shopBanner?: string
  shopEmail: string
  shopPhone: string
  shopAddressId: string
  shopAddress: string

  shopPersonalIdentifyId?: string
  shopTaxId?: string
  // Tax Information

  status: "pending" | "approved" | "rejected"
  feedback?: string
  createdAt: string
  createdDate: string
  tax:Tax,

  updatedAt: string
}
export interface Tax{
    taxCode: string
  taxNationalName: string
  taxShortName?: string
  taxPresentName?: string
  taxActiveDate: string
  taxBusinessType: string
  taxActiveStatus: boolean
}

export interface ShopData {
  id: string;
  shopName: string;
  shopDescription: string;
  shopLogo: string;
  shopEmail: string;
  shopPhone: string;
  shopStatus: boolean;
  walletAmount: number;
  followerCount: number;
  isFollowing: boolean;
  createdDate: string;
}

export interface CreateShopWithTaxRequest {
  shopName: string
  shopDescription?: string
  shopLogo?: string
  shopEmail: string
  shopPhone: string
  shopAddressId: string
  taxCode: string
  taxNationalName: string
  taxShortName?: string
  taxPresentName?: string
  taxActiveDate: string
  taxBusinessType: string
  taxActiveStatus?: boolean
}

export interface ApproveShopRequest {
  isApproved: boolean
  feedback?: string
}

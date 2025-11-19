export interface Shop {
  id: string;
  shopName: string;
  shopDescription: string;
  shopLogo?: string | File | null;
  shopBanner?: string | File | null;
  shopAddress: string;
  shopPersonalIdentifyId?: string;
  shopEmail: string;
  shopPhone: string;
  shopStatus: boolean; // true = active/approved
  walletAmount: number;
  followerCount: number;
  isFollowing: boolean;
  createdDate: string;
  taxInfo?: TaxInfo;
  banners?: any[];
}
export interface Tax {
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
  shopBanner: string;

  shopEmail: string;
  shopPhone: string;
  shopStatus: boolean;
  walletAmount: number;
  followerCount: number;
  isFollowing: boolean;
  createdDate: string;
  modifiedDate: string;


}

export interface CreateShopWithTaxRequest {
  shopName: string;
  shopDescription?: string;
  shopLogo?: string;
  shopEmail: string;
  shopPhone: string;
  shopAddress: string; // Full address string, matching API
  shopPersonalIdentifyId?: string;
  shopAddressId?: string; // Optional ID if needed
  taxCode: string;
  taxNationalName: string;
  taxShortName?: string;
  taxPresentName?: string;
  taxActiveDate: string;
  taxBusinessType: string;
  taxActiveStatus?: boolean;
  shopBanner?: string; // Optional for future use

  // Banner fields
  bannerType?: string; // --- NEW: HOME, CATEGORY, PROMOTION
}

export interface ApproveShopRequest {
  isApproved: boolean
  feedback?: string
}


// types/shop.ts
// Updated types to match API responses and requests more closely.
// - Shop now reflects the actual response structure from APIs.
// - taxInfo is nested under Shop (renamed from tax for accuracy).
// - Added shopBanner as optional (assuming it might be added in future updates; not in current API responses).
// - ShopStatus is boolean (true = active/approved), not string enum.
// - Removed unused fields like status string, feedback (not in responses).
// - CreateShopWithTaxRequest updated to include ShopAddress (string) instead of ShopAddressId (ID); matches payload.
// - ShopFormData for form aligns with CreateShopWithTaxRequest, with shopBanner optional.
// - Removed ApproveShopRequest as it's not used in the provided components.

export interface TaxInfo {
  id: string;
  taxCode: string;
  taxNationalName: string;
  taxShortName: string;
  taxPresentName: string;
  taxActiveDate: string;
  taxBusinessType: string;
  taxActiveStatus: boolean;
}



export interface ShopData extends Shop { } // Alias for consistency; same as Shop

export interface CreateShopWithTaxRequest {
  shopName: string;
  shopDescription?: string;
  shopLogo?: string;
  shopEmail: string;
  shopPhone: string;
  shopAddress: string; // Changed to string (full address) to match API payload
  shopPersonalIdentifyId?: string;
  taxCode: string;
  taxNationalName: string;
  taxShortName?: string;
  taxPresentName?: string;
  taxActiveDate: string;
  taxBusinessType: string;
  taxActiveStatus?: boolean;
  shopBanner?: string; // Optional for future use


}
// types/shop.ts

// ... các interface cũ ...



export interface UpdateShopRequest {
  shopName: string;
  shopDescription: string;
  shopLogo?: string | File; // Có thể là URL cũ hoặc File mới
  shopBanner?: string | File;
  bannerType?: string; // HOME, CATEGORY, PROMOTION
  shopEmail: string;
  shopPhone: string;
  shopAddress: string;
  shopPersonalIdentifyId: string;
  shopStatus: boolean;
}

// Form data type for the registration component
export type ShopFormData = Omit<CreateShopWithTaxRequest, 'taxCode' | 'taxNationalName' | 'taxShortName' | 'taxPresentName' | 'taxActiveDate' | 'taxBusinessType' | 'taxActiveStatus'> & {
  shopTaxId: string; // Maps to taxCode in submission
  shopLogo?: File | string; // Allow file upload
  shopBanner?: File | string; // Allow file upload

  bannerType: string; // --- NEW: Thêm loại banner

};
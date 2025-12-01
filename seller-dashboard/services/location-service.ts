import axios from "axios";

const PROVINCE_API_URL = "https://provinces.open-api.vn/api";

export interface Province {
  code: number;
  name: string;
  districts: District[];
}

export interface District {
  code: number;
  name: string;
  wards: Ward[];
}

export interface Ward {
  code: number;
  name: string;
}

export const locationService = {
  // Lấy danh sách Tỉnh/Thành phố
  getProvinces: async () => {
    const response = await axios.get(`${PROVINCE_API_URL}/?depth=1`);
    return response.data as Province[];
  },

  // Lấy Quận/Huyện theo code Tỉnh (kèm Phường/Xã nếu depth=3, nhưng tốt nhất lấy theo cấp để nhẹ data)
  getDistricts: async (provinceCode: number) => {
    const response = await axios.get(
      `${PROVINCE_API_URL}/p/${provinceCode}?depth=2`
    );
    return response.data.districts as District[];
  },

  // Lấy Phường/Xã theo code Quận
  getWards: async (districtCode: number) => {
    const response = await axios.get(
      `${PROVINCE_API_URL}/d/${districtCode}?depth=2`
    );
    return response.data.wards as Ward[];
  },
};
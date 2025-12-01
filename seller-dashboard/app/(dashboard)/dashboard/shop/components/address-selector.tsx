"use client";

import { useEffect, useState, useRef } from "react"; // Thêm useRef
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  locationService,
  Province,
  District,
  Ward,
} from "@/services/location-service";

interface AddressSelectorProps {
  onChange: (fullAddress: string) => void;
  initialValue?: string;
  hasError?: boolean;
}

export function AddressSelector({
  onChange,
  initialValue,
  hasError,
}: AddressSelectorProps) {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  const [selectedProvince, setSelectedProvince] = useState<Province | null>(
    null
  );
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(
    null
  );
  const [selectedWard, setSelectedWard] = useState<Ward | null>(null);
  const [specificAddress, setSpecificAddress] = useState<string>("");

  const [loadingProvinces, setLoadingProvinces] = useState(true);

  // Dùng useRef để lưu giá trị địa chỉ trước đó nhằm so sánh
  const prevAddressRef = useRef("");

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const data = await locationService.getProvinces();
        setProvinces(data);
      } catch (error) {
        console.error("Failed to fetch provinces", error);
      } finally {
        setLoadingProvinces(false);
      }
    };
    fetchProvinces();
  }, []);

  // Logic ghép chuỗi địa chỉ
  useEffect(() => {
    let fullAddress = "";

    // Chỉ tạo địa chỉ khi có dữ liệu
    if (selectedProvince && selectedDistrict && selectedWard) {
      const parts = [
        specificAddress,
        selectedWard.name,
        selectedDistrict.name,
        selectedProvince.name,
      ].filter((part) => part && part.trim() !== ""); // Lọc bỏ phần rỗng

      fullAddress = parts.join(", ");
    }

    // QUAN TRỌNG: Chỉ gọi onChange nếu địa chỉ THỰC SỰ khác với lần trước
    // Điều này ngăn chặn vòng lặp vô tận do hàm onChange thay đổi
    if (fullAddress && fullAddress !== prevAddressRef.current) {
      prevAddressRef.current = fullAddress;
      onChange(fullAddress);
    }
  }, [
    selectedProvince,
    selectedDistrict,
    selectedWard,
    specificAddress,
    onChange,
  ]);

  // ... (Phần Handlers giữ nguyên như cũ)
  const handleProvinceChange = async (valueStr: string) => {
    const code = Number(valueStr);
    const province = provinces.find((p) => p.code === code) || null;
    setSelectedProvince(province);
    setDistricts([]);
    setWards([]);
    setSelectedDistrict(null);
    setSelectedWard(null);
    if (province) {
      const data = await locationService.getDistricts(province.code);
      setDistricts(data);
    }
  };

  const handleDistrictChange = async (valueStr: string) => {
    const code = Number(valueStr);
    const district = districts.find((d) => d.code === code) || null;
    setSelectedDistrict(district);
    setWards([]);
    setSelectedWard(null);
    if (district) {
      const data = await locationService.getWards(district.code);
      setWards(data);
    }
  };

  const handleWardChange = (valueStr: string) => {
    const code = Number(valueStr);
    const ward = wards.find((w) => w.code === code) || null;
    setSelectedWard(ward);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tỉnh / Thành */}
        <div className="space-y-2">
          <Label className="text-xs text-gray-500">Tỉnh / Thành phố</Label>
          <Select
            onValueChange={handleProvinceChange}
            disabled={loadingProvinces}
          >
            <SelectTrigger className={hasError ? "border-red-500" : ""}>
              <SelectValue placeholder="Chọn Tỉnh/Thành" />
            </SelectTrigger>
            <SelectContent>
              {provinces.map((p) => (
                <SelectItem key={p.code} value={p.code.toString()}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Quận / Huyện */}
        <div className="space-y-2">
          <Label className="text-xs text-gray-500">Quận / Huyện</Label>
          <Select
            onValueChange={handleDistrictChange}
            disabled={!selectedProvince || districts.length === 0}
          >
            <SelectTrigger className={hasError ? "border-red-500" : ""}>
              <SelectValue placeholder="Chọn Quận/Huyện" />
            </SelectTrigger>
            <SelectContent>
              {districts.map((d) => (
                <SelectItem key={d.code} value={d.code.toString()}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Phường / Xã */}
        <div className="space-y-2">
          <Label className="text-xs text-gray-500">Phường / Xã</Label>
          <Select
            onValueChange={handleWardChange}
            disabled={!selectedDistrict || wards.length === 0}
          >
            <SelectTrigger className={hasError ? "border-red-500" : ""}>
              <SelectValue placeholder="Chọn Phường/Xã" />
            </SelectTrigger>
            <SelectContent>
              {wards.map((w) => (
                <SelectItem key={w.code} value={w.code.toString()}>
                  {w.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Số nhà */}
      <div className="space-y-2">
        <Label htmlFor="specificAddress" className="text-xs text-gray-500">
          Số nhà, tên đường
        </Label>
        <Input
          id="specificAddress"
          value={specificAddress}
          onChange={(e) => setSpecificAddress(e.target.value)}
          placeholder="VD: Số 123 đường ABC"
          className={
            hasError
              ? "border-red-500 focus:ring-red-500"
              : "focus:ring-[#FF6A00]"
          }
        />
      </div>
    </div>
  );
}

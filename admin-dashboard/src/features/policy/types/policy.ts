export type PolicyType = "TERMS" | "PRIVACY" | "RETURN" | "WARRANTY" | "SHIPPING";

export const POLICY_TYPES: { value: PolicyType; label: string; color: string }[] = [
  { value: "TERMS", label: "Điều khoản sử dụng", color: "bg-blue-500" },
  { value: "PRIVACY", label: "Chính sách bảo mật", color: "bg-purple-500" },
  { value: "RETURN", label: "Đổi trả & Hoàn tiền", color: "bg-orange-500" },
  { value: "WARRANTY", label: "Chính sách bảo hành", color: "bg-green-500" },
  { value: "SHIPPING", label: "Vận chuyển & Giao nhận", color: "bg-cyan-500" },
];

export interface Policy {
  id: string;
  policyName: string;
  policyContent: string;
  policyType: PolicyType;
  isActive: boolean;
  version: number;
  effectiveDate: string | null;
  shopId: string | null;
  createdDate: string;
  modifiedDate: string | null;
}

export interface PolicySummary {
  id: string;
  policyName: string;
  policyType: PolicyType;
  isActive: boolean;
  version: number;
  effectiveDate: string | null;
}

export interface GetPoliciesQuery {
  pageNumber: number;
  pageSize: number;
  policyType?: string;
  isActive?: boolean;
  shopId?: string;
}

export interface CreatePolicyRequest {
  policyName: string;
  policyContent: string;
  policyType: PolicyType;
  effectiveDate?: string; // Backend cho phép null nhưng form nên có
  shopId?: string;
}

export interface UpdatePolicyRequest {
  policyName: string;
  policyContent: string;
  isActive?: boolean;
  effectiveDate?: string;
}

export interface PublishPolicyRequest {
  effectiveDate: string;
}
export interface LogisticsUnit {
  id: string;
  name: string; // Tên đơn vị (text, required)
  shortName: string; // Tên viết tắt
  avatarUrl: string; // Avatar (URL hình ảnh)
  address: string; // Địa chỉ (textarea)
  phone: string; // Số điện thoại (tel)
  gmail: string; // Gmail
  isHidden?: boolean; // Trạng thái ẩn
  createdAt: string;
  updatedAt: string;
}

export interface CreateLogisticsUnitPayload {
  name: string;
  shortName?: string;
  avatarUrl?: string;
  address?: string;
  phone?: string;
  gmail?: string;
  isHidden?: boolean;
}

export type UpdateLogisticsUnitPayload = Partial<CreateLogisticsUnitPayload>;

export interface LogisticsListResponse {
  data: LogisticsUnit[];
  totalCount: number; // Cục tổng đơn vị logistics
  filteredCount: number;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

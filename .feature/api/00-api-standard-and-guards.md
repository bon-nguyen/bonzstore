# Chuẩn Thiết Kế API & Hệ Thống Guards — Backend (`apps/api`)

> **Thư mục code**: `apps/api` (NestJS + Prisma + PostgreSQL)
> **Base URL**: `http://localhost:4000/api`
> **Swagger UI**: `http://localhost:4000/api/docs`

---

## 1. Chuẩn Cấu Trúc API (Tham Chiếu TikTok Shop / Shopee Open API)

Để đảm bảo tính nhất quán khi giao tiếp giữa **Admin Dashboard (`apps/dashboard`)**, **Web Storefront (`apps/web`)**, và các module đồng bộ sàn sau này:

### 1.1 Định dạng Phản hồi Danh sách có Phân trang (`Paginated Response`)
```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### 1.2 Định dạng Phản hồi Lỗi (`AllExceptionsFilter`)
File: [`all-exceptions.filter.ts`](file:///c:/Users/Admin/Desktop/bonzstore/apps/api/src/common/filters/all-exceptions.filter.ts)
```json
{
  "success": false,
  "statusCode": 403,
  "timestamp": "2026-10-28T00:00:00.000Z",
  "path": "/api/users",
  "message": "Thiếu quyền hạn bắt buộc: users.create"
}
```

---

## 2. Chuỗi 3 Guards Bảo Vệ Toàn Cục (`APP_GUARD` trong `AppModule`)

Mọi request gửi tới `apps/api` đều đi qua 3 lớp Guard theo đúng thứ tự:

1. **[`JwtAuthGuard`](file:///c:/Users/Admin/Desktop/bonzstore/apps/api/src/common/guards/jwt-auth.guard.ts)**:
   - Bỏ qua nếu endpoint gắn decorator [`@Public()`](file:///c:/Users/Admin/Desktop/bonzstore/apps/api/src/common/decorators/public.decorator.ts).
   - Giải mã Bearer Token qua [`JwtStrategy`](file:///c:/Users/Admin/Desktop/bonzstore/apps/api/src/modules/auth/strategies/jwt.strategy.ts), kiểm tra user còn tồn tại và `status === 'ACTIVE'`, sau đó gắn `request.user` (gồm `role` và mảng `permissions[]`).
2. **[`RolesGuard`](file:///c:/Users/Admin/Desktop/bonzstore/apps/api/src/common/guards/roles.guard.ts)**:
   - Kiểm tra decorator [`@Roles(...)`](file:///c:/Users/Admin/Desktop/bonzstore/apps/api/src/common/decorators/roles.decorator.ts).
   - `SUPER_ADMIN` luôn được phép đi qua.
3. **[`PermissionsGuard`](file:///c:/Users/Admin/Desktop/bonzstore/apps/api/src/common/guards/permissions.guard.ts)**:
   - Kiểm tra decorator [`@RequirePermissions(...)`](file:///c:/Users/Admin/Desktop/bonzstore/apps/api/src/common/decorators/permissions.decorator.ts).
   - Đối chiếu từng mã quyền yêu cầu với mảng `user.permissions` được nạp từ bảng `role_permissions`. Nếu thiếu bất kỳ quyền nào sẽ trả về `403 Forbidden`.


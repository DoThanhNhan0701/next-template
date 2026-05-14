# Security Classification: Confidential

# Asset Management System

Hệ thống quản lý tài sản toàn diện được xây dựng với Next.js 16, hỗ trợ theo dõi tài sản, cho thuê, bảo trì, kiểm kê và quản lý quy trình phê duyệt.

## 📋 Mục Lục

- [Tính Năng](#-tính-năng)
- [Công Nghệ Sử Dụng](#-công-nghệ-sử-dụng)
- [Cấu Trúc Dự Án](#-cấu-trúc-dự-án)
- [Cài Đặt](#-cài-đặt)
- [Cấu Hình](#-cấu-hình)
- [Kiến Trúc Hệ Thống](#-kiến-trúc-hệ-thống)
- [API Documentation](#-api-documentation)
- [Hướng Dẫn Phát Triển](#-hướng-dẫn-phát-triển)
- [Deployment](#-deployment)

---

## 🚀 Tính Năng

### Module Chính

#### 1. **Quản Lý Tài Sản (Assets)**

- Theo dõi chi tiết thông tin tài sản vật lý
- Quản lý vòng đời tài sản (lifecycle tracking)
- Lịch sử người giữ tài sản (asset holders)
- Tạo mã QR cho từng tài sản
- Xem thông tin tồn kho theo tài sản

#### 2. **Quản Lý Tồn Kho (Inventory)**

- Theo dõi số lượng tồn kho theo địa điểm
- Nhập/Xuất kho (Stock In/Out)
- Điều chỉnh tồn kho (Stock Adjustments)
- Báo cáo tồn kho theo thời gian thực

#### 3. **Cho Thuê Tài Sản (Rentals)**

- Tạo đơn cho thuê tài sản
- Quản lý quy trình trả tài sản
- Theo dõi trạng thái cho thuê
- Quy trình phê duyệt cho thuê

#### 4. **Bảo Trì (Maintenance)**

- Lập kế hoạch bảo trì định kỳ
- Theo dõi lịch sử bảo trì
- Quản lý chi phí bảo trì
- Thông báo bảo trì sắp tới

#### 5. **Kiểm Kê (Audits)**

- Tạo phiên kiểm kê (audit sessions)
- Kiểm kê hàng loạt (batch audit)
- So sánh số liệu thực tế với hệ thống
- Phê duyệt/Từ chối kết quả kiểm kê

#### 6. **Điều Chuyển (Transfers)**

- Điều chuyển tài sản giữa các địa điểm
- Theo dõi trạng thái điều chuyển
- Đính kèm tài liệu điều chuyển
- Quy trình phê duyệt điều chuyển

#### 7. **Thanh Lý (Liquidations)**

- Quản lý quy trình thanh lý tài sản
- Theo dõi giá trị thanh lý
- Lịch sử thanh lý

#### 8. **Cấp Phát & Thu Hồi (Allocation & Recovery)**

- Cấp phát tài sản cho nhân viên
- Thu hồi tài sản
- Theo dõi người đang giữ tài sản

#### 9. **Công Việc Của Tôi (My Tasks)**

- Danh sách công việc cần xử lý
- Thông báo công việc mới (badge counter)
- Phê duyệt/Từ chối công việc
- Theo dõi tiến độ công việc

#### 10. **Dashboard**

- Tổng quan hệ thống
- Thống kê theo module
- Biểu đồ trạng thái tài sản
- Hoạt động gần đây

### Module Quản Trị (Admin)

#### 1. **Quản Lý Người Dùng (Users)**

- Tạo/Sửa/Xóa người dùng
- Kích hoạt/Vô hiệu hóa tài khoản
- Đổi mật khẩu
- Phân quyền người dùng

#### 2. **Quản Lý Nhân Viên (Staff)**

- Thông tin nhân viên
- Liên kết với tài khoản người dùng
- Theo dõi tài sản đang giữ

#### 3. **Quản Lý Vai Trò (Roles)**

- Tạo vai trò tùy chỉnh
- Phân quyền chi tiết (permissions)
- RBAC (Role-Based Access Control)

#### 4. **Tổ Chức (Organization)**

- Cấu trúc tổ chức dạng cây
- Quản lý đơn vị tổ chức
- Phân cấp quản lý

#### 5. **Địa Điểm (Locations)**

- Quản lý các địa điểm lưu trữ
- Theo dõi tồn kho theo địa điểm

#### 6. **Nhóm Tài Sản (Asset Groups)**

- Phân loại tài sản theo nhóm
- Cấu hình thuộc tính nhóm

#### 7. **Loại Danh Mục (Catalog Types)**

- Định nghĩa loại tài sản
- Nhóm danh mục (Catalog Groups)

#### 8. **Trạng Thái Tài Sản (Asset Statuses)**

- Quản lý các trạng thái tài sản
- Cấu hình workflow chuyển trạng thái

#### 9. **Chế Độ Sử Dụng (Usage Modes)**

- Định nghĩa cách sử dụng tài sản

#### 10. **Nhà Cung Cấp (Suppliers)**

- Quản lý thông tin nhà cung cấp
- Lịch sử mua hàng

#### 11. **Khách Hàng (Customers)**

- Quản lý thông tin khách hàng
- Lịch sử cho thuê

#### 12. **Quy Trình Phê Duyệt (Workflow Templates)**

- Tạo template quy trình phê duyệt
- Cấu hình nhiều cấp phê duyệt
- Áp dụng cho các module khác nhau

### Tính Năng Bổ Sung

- ✅ **Đa Ngôn Ngữ**: Hỗ trợ Tiếng Việt và English
- ✅ **Dark/Light Theme**: Chuyển đổi giao diện sáng/tối
- ✅ **QR Code**: Tạo và quét mã QR cho tài sản
- ✅ **File Attachments**: Đính kèm tài liệu, hình ảnh
- ✅ **Real-time Notifications**: Thông báo công việc mới
- ✅ **Responsive Design**: Tương thích mobile, tablet, desktop
- ✅ **Permission-based UI**: Hiển thị theo quyền người dùng

---

## 🛠 Công Nghệ Sử Dụng

### Core Technologies

| Công Nghệ        | Version | Mô Tả                          |
| ---------------- | ------- | ------------------------------ |
| **Next.js**      | 16.2.2  | React framework với App Router |
| **React**        | 19.2.1  | UI library                     |
| **TypeScript**   | 5.9.3   | Type-safe JavaScript           |
| **Tailwind CSS** | 4.2.2   | Utility-first CSS framework    |

### State Management

| Library             | Mục Đích                |
| ------------------- | ----------------------- |
| **Redux Toolkit**   | Client state management |
| **TanStack Query**  | Server state & caching  |
| **React Hook Form** | Form state management   |

### UI Components

| Library              | Mục Đích               |
| -------------------- | ---------------------- |
| **Radix UI**         | Headless UI components |
| **Lucide React**     | Icon library           |
| **Sonner**           | Toast notifications    |
| **react-day-picker** | Date picker            |
| **qrcode.react**     | QR code generation     |

### Utilities

| Library         | Mục Đích             |
| --------------- | -------------------- |
| **Axios**       | HTTP client          |
| **Zod**         | Schema validation    |
| **date-fns**    | Date manipulation    |
| **next-intl**   | Internationalization |
| **next-themes** | Theme management     |
| **js-cookie**   | Cookie management    |

### Development Tools

| Tool                                      | Mục Đích        |
| ----------------------------------------- | --------------- |
| **ESLint**                                | Code linting    |
| **Prettier**                              | Code formatting |
| **@trivago/prettier-plugin-sort-imports** | Import sorting  |

---

## 📁 Cấu Trúc Dự Án

```
asset-management/
├── public/                          # Static assets
│   ├── icons/                      # App icons
│   │   └── logo.png
│   └── images/                     # Images
│
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── (public)/              # Public routes (no auth)
│   │   │   └── auth/
│   │   │       └── login/         # Login page
│   │   │
│   │   ├── (private)/             # Private routes (auth required)
│   │   │   ├── dashboard/         # Dashboard
│   │   │   ├── my-tasks/          # Task management
│   │   │   ├── assets/            # Asset management
│   │   │   ├── rentals/           # Rental management
│   │   │   ├── inventory/         # Inventory
│   │   │   ├── transfers/         # Transfer management
│   │   │   ├── stock-in-out/      # Stock adjustments
│   │   │   ├── allocation-recovery/ # Allocation & Recovery
│   │   │   ├── audits/            # Audit management
│   │   │   ├── maintenance/       # Maintenance
│   │   │   ├── liquidations/      # Liquidation
│   │   │   └── layout.tsx         # Private layout with sidebar
│   │   │
│   │   ├── (admin)/               # Admin routes (admin only)
│   │   │   └── admin/
│   │   │       ├── users/         # User management
│   │   │       ├── staff/         # Staff management
│   │   │       ├── roles/         # Role management
│   │   │       ├── organization/  # Organization structure
│   │   │       ├── locations/     # Location management
│   │   │       ├── asset-groups/  # Asset group config
│   │   │       ├── catalog-types/ # Catalog type config
│   │   │       ├── asset-statuses/ # Status config
│   │   │       ├── usage-modes/   # Usage mode config
│   │   │       ├── suppliers/     # Supplier management
│   │   │       ├── customers/     # Customer management
│   │   │       └── workflow-templates/ # Workflow config
│   │   │
│   │   ├── layout.tsx             # Root layout
│   │   ├── page.tsx               # Home page
│   │   ├── loading.tsx            # Loading UI
│   │   ├── not-found.tsx          # 404 page
│   │   └── globals.css            # Global styles
│   │
│   ├── components/
│   │   ├── common/                # Shared components
│   │   │   ├── ApprovalProcessSection.tsx
│   │   │   ├── ApproverSelect.tsx
│   │   │   ├── BackButton.tsx
│   │   │   ├── ConfirmDeleteModal.tsx
│   │   │   ├── DatePickerField.tsx
│   │   │   ├── DevelopmentFeature.tsx
│   │   │   ├── FormAttachmentsSection.tsx
│   │   │   ├── FormattedNumberInput.tsx
│   │   │   ├── LanguageSwitcher.tsx
│   │   │   ├── Loading.tsx
│   │   │   ├── MultiAttachmentUpload.tsx
│   │   │   ├── RecordAttachmentsCard.tsx
│   │   │   └── TableStateDisplay.tsx
│   │   │
│   │   ├── layouts/               # Layout components
│   │   │   ├── header.tsx         # App header
│   │   │   └── sidebar.tsx        # Navigation sidebar
│   │   │
│   │   ├── libs/                  # Provider components
│   │   │   ├── app-bootstrap.tsx  # App initialization
│   │   │   ├── query-provider.tsx # TanStack Query provider
│   │   │   ├── store-provider.tsx # Redux provider
│   │   │   └── theme-provider.tsx # Theme provider
│   │   │
│   │   ├── pages/                 # Page-specific components
│   │   │   ├── admin/            # Admin page components
│   │   │   └── user/             # User page components
│   │   │
│   │   ├── schemas/               # Zod validation schemas
│   │   │
│   │   └── ui/                    # UI component library
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── calendar.tsx
│   │       ├── card.tsx
│   │       ├── checkbox.tsx
│   │       ├── dialog.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── field.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── pagination.tsx
│   │       ├── popover.tsx
│   │       ├── select.tsx
│   │       ├── separator.tsx
│   │       ├── sheet.tsx
│   │       ├── sidebar.tsx
│   │       ├── skeleton.tsx
│   │       ├── sonner.tsx
│   │       ├── spinner.tsx
│   │       ├── table.tsx
│   │       ├── tabs.tsx
│   │       ├── textarea.tsx
│   │       ├── tooltip.tsx
│   │       └── tree.tsx
│   │
│   ├── config/                    # Configuration files
│   │   ├── constants.ts           # App constants
│   │   └── endpoints.ts           # API endpoints
│   │
│   ├── hooks/                     # Custom React hooks
│   │   ├── use-mobile.ts          # Mobile detection
│   │   ├── useFaviconBadge.ts    # Favicon badge for notifications
│   │   ├── useGet.ts             # GET request hook
│   │   ├── useHasHydrated.ts     # Hydration check
│   │   ├── useModal.ts           # Modal state management
│   │   ├── useMutation.ts        # Mutation hook
│   │   └── usePermissions.ts     # Permission checking
│   │
│   ├── i18n/                      # Internationalization
│   │   ├── config.ts             # i18n configuration
│   │   ├── locale.ts             # Locale utilities
│   │   ├── navigation.ts         # i18n navigation
│   │   ├── request.ts            # i18n request handler
│   │   └── routing.ts            # i18n routing
│   │
│   ├── lib/                       # Utility libraries
│   │   └── utils.ts              # Helper functions
│   │
│   ├── messages/                  # Translation files
│   │   ├── en.json               # English translations
│   │   └── vi.json               # Vietnamese translations
│   │
│   ├── redux/                     # Redux store
│   │   ├── slices/               # Redux slices
│   │   │   ├── auth.ts           # Authentication state
│   │   │   ├── stockAdjustment.ts # Stock adjustment state
│   │   │   ├── allocation.ts     # Allocation state
│   │   │   ├── recovery.ts       # Recovery state
│   │   │   ├── rental.ts         # Rental state
│   │   │   └── task.ts           # Task state
│   │   └── index.ts              # Store configuration
│   │
│   ├── types/                     # TypeScript type definitions
│   │   ├── auth/                 # Auth types
│   │   ├── task/                 # Task types
│   │   ├── allocation.ts
│   │   ├── asset-group.ts
│   │   ├── audit.ts
│   │   ├── auth.ts
│   │   ├── catalog-group.ts
│   │   ├── catalog-type.ts
│   │   ├── customer.ts
│   │   ├── dashboard.ts
│   │   ├── liquidation.ts
│   │   ├── location.ts
│   │   ├── maintenance.ts
│   │   ├── org.ts
│   │   ├── physical-asset.ts
│   │   ├── rbac.ts
│   │   ├── recovery.ts
│   │   ├── rental.ts
│   │   ├── staff.ts
│   │   ├── status.ts
│   │   ├── stock-adjustment.ts
│   │   ├── stock.ts
│   │   ├── supplier.ts
│   │   ├── template.ts
│   │   ├── transfer.ts
│   │   ├── unit.ts
│   │   ├── usage-mode.ts
│   │   └── workflow-template.ts
│   │
│   ├── utils/                     # Utility functions
│   │   ├── api-error.ts          # API error handling
│   │   ├── api-success.ts        # API success handling
│   │   ├── axiosInstance.ts      # Axios configuration
│   │   ├── cookiesStore.ts       # Cookie utilities
│   │   ├── date.ts               # Date utilities
│   │   ├── form.ts               # Form utilities
│   │   ├── number.ts             # Number utilities
│   │   ├── storage.ts            # Storage utilities
│   │   └── url.ts                # URL utilities
│   │
│   └── proxy.ts                   # API proxy configuration
│
├── .editorconfig                  # Editor configuration
├── .env.local                     # Environment variables
├── .gitignore                     # Git ignore rules
├── .prettierrc                    # Prettier configuration
├── components.json                # shadcn/ui configuration
├── eslint.config.mjs              # ESLint configuration
├── next.config.ts                 # Next.js configuration
├── next-env.d.ts                  # Next.js TypeScript declarations
├── package.json                   # Dependencies
├── pnpm-lock.yaml                 # pnpm lock file
├── pnpm-workspace.yaml            # pnpm workspace config
├── postcss.config.mjs             # PostCSS configuration
└── README.md                      # This file
```

---

## 🔧 Cài Đặt

### Yêu Cầu Hệ Thống

- **Node.js**: >= 20.x
- **pnpm**: >= 8.x (recommended)
- **npm** hoặc **yarn** cũng có thể sử dụng

### Các Bước Cài Đặt

1. **Clone repository**

```bash
git clone <repository-url>
cd asset-management
```

2. **Cài đặt dependencies**

```bash
pnpm install
```

3. **Cấu hình environment variables**

```bash
cp .env.local.example .env.local
```

Chỉnh sửa file `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://your-api-url:8000
```

4. **Chạy development server**

```bash
pnpm dev
```

Mở trình duyệt tại [http://localhost:3000](http://localhost:3000)

### Scripts Có Sẵn

```bash
# Development
pnpm dev              # Chạy dev server

# Production
pnpm build            # Build production (bao gồm lint)
pnpm start            # Chạy production server

# Code Quality
pnpm lint             # Chạy ESLint
```

---

## 🐳 Docker Deployment

Hệ thống hỗ trợ đóng gói và triển khai bằng Docker để đảm bảo môi trường đồng nhất.

### 1. Build và Chạy với Docker Compose

Đây là cách đơn giản nhất để chạy ứng dụng trong môi trường production locally hoặc trên server:

```bash
# Build và chạy container ở chế độ background
docker compose up -d --build
```

Sau khi chạy, ứng dụng sẽ có sẵn tại: [http://localhost:3003](http://localhost:3003)

### 2. Cập nhật Code (Update Code)

Khi bạn có thay đổi code mới và muốn cập nhật ứng dụng đang chạy trong Docker, hãy chạy lệnh sau:

```bash
# Tự động build lại image mới và khởi động lại container
docker compose up -d --build
```

Lệnh `--build` sẽ quét các thay đổi trong source code của bạn và xây dựng lại các lớp (layers) cần thiết trong Docker image trước khi khởi động lại dịch vụ.

### 3. Các lệnh Docker hữu ích

```bash
# Xem logs của ứng dụng
docker compose logs -f

# Dừng ứng dụng
docker compose down

# Kiểm tra trạng thái container
docker compose ps
```

---

## ⚙️ Cấu Hình

### Environment Variables

Tạo file `.env.local` với các biến sau:

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Next.js Configuration

File `next.config.ts`:

```typescript
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig = {
  allowedDevOrigins: ["****"],
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "****",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
```

### Internationalization (i18n)

Hệ thống hỗ trợ 2 ngôn ngữ:

- **vi** (Tiếng Việt) - Default
- **en** (English)

Cấu hình trong `src/i18n/config.ts`:

```typescript
export const locales = ["en", "vi"] as const;
export const defaultLocale = "vi";
```

Translation files:

- `src/messages/vi.json`
- `src/messages/en.json`

---

## 🏗 Kiến Trúc Hệ Thống

### Routing Architecture

Hệ thống sử dụng **Next.js App Router** với route groups:

#### 1. Public Routes `(public)`

- Không yêu cầu authentication
- Routes: `/auth/login`
- Layout: Minimal layout

#### 2. Private Routes `(private)`

- Yêu cầu authentication
- Permission-based access control
- Routes: dashboard, assets, rentals, inventory, transfers, etc.
- Layout: Full layout với header + sidebar

#### 3. Admin Routes `(admin)`

- Yêu cầu admin permissions
- Routes: users, roles, organization, locations, etc.
- Layout: Admin layout với admin sidebar

### Authentication Flow

```
┌─────────────┐
│   Login     │
│   Page      │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  API: /auth/login│
│  POST credentials│
└──────┬──────────┘
       │
       ▼
┌──────────────────────┐
│ Response:            │
│ - access_token       │
│ - refresh_token      │
│ - user info          │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Store tokens in      │
│ cookies              │
│ Update Redux state   │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Redirect to          │
│ /dashboard           │
└──────────────────────┘
```

### State Management Architecture

#### Redux Slices

1. **auth** - Authentication & user state
   - User info
   - Permissions
   - Login/Logout actions

2. **task** - Task management
   - Pending task count
   - Task list

3. **stockAdjustment** - Stock adjustment state
4. **allocation** - Allocation state
5. **recovery** - Recovery state
6. **rental** - Rental state

#### TanStack Query

Sử dụng cho:

- Server data fetching
- Caching
- Automatic refetching
- Optimistic updates

Custom hooks:

- `useGet` - GET requests với caching
- `useMutation` - POST/PUT/PATCH/DELETE requests

### API Integration

#### Axios Instance Configuration

File: `src/utils/axiosInstance.ts`

**Features:**

- Automatic token injection
- Token refresh on 401
- Request/Response interceptors
- Error handling

```typescript
// Request Interceptor
- Thêm Bearer token vào header
- Lấy token từ cookies

// Response Interceptor
- Xử lý 401 Unauthorized
- Tự động refresh token
- Retry request với token mới
- Logout nếu refresh thất bại
```

#### API Endpoints

File: `src/config/endpoints.ts`

**Static Endpoints:**

```typescript
endpoints.ME; // GET user info
endpoints.LOGIN; // POST login
endpoints.LOGOUT; // POST logout
endpoints.REFRESH; // POST refresh token
endpoints.USERS; // User management
endpoints.PHYSICAL_ASSETS; // Asset management
endpoints.RENTALS; // Rental management
endpoints.TRANSFERS; // Transfer management
endpoints.AUDIT_SESSIONS; // Audit management
endpoints.MAINTENANCES; // Maintenance management
endpoints.LIQUIDATIONS; // Liquidation management
// ... và nhiều endpoints khác
```

**Dynamic Endpoints:**

```typescript
dynamicEndpoints.USER_DETAIL(id);
dynamicEndpoints.PHYSICAL_ASSET_DETAIL(id);
dynamicEndpoints.RENTAL_DETAIL(id);
dynamicEndpoints.TRANSFER_DETAIL(id);
dynamicEndpoints.WORKFLOW_TASK_COMPLETE(id);
dynamicEndpoints.AUDIT_APPROVE(id);
// ... và nhiều dynamic endpoints khác
```

### Permission System (RBAC)

#### Permission Hook

File: `src/hooks/usePermissions.ts`

```typescript
const {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  isSuperAdmin,
  permissions,
  userRole,
} = usePermissions();

// Kiểm tra permission
if (hasPermission("assets:view")) {
  // Show assets menu
}

// Kiểm tra nhiều permissions
if (hasAnyPermission(["assets:create", "assets:edit"])) {
  // Show create/edit button
}
```

#### Permission-based Routing

Sidebar items tự động ẩn/hiện dựa trên permissions:

```typescript
const sidebarItems = [
  {
    title: "Assets",
    url: "/assets",
    icon: Laptop,
    permission: "assets:view", // Chỉ hiện nếu có permission
  },
  {
    title: "Rentals",
    url: "/rentals",
    icon: Key,
    permission: "rentals:manage",
  },
  // ...
];
```

### Component Patterns

#### 1. Page Components

```typescript
// src/app/(private)/assets/page.tsx
import PhysicalAssetsPage from "@/components/pages/user/physical-assets";

export const metadata = {
  title: "Assets | Asset Management System",
};

export default function Page() {
  return <PhysicalAssetsPage />;
}
```

#### 2. Data Fetching Pattern

```typescript
// Using useGet hook
const { response, pending, error, reFetch } = useGet({
  url: endpoints.PHYSICAL_ASSETS,
  config: { params: { page: 1, limit: 10 } }
});

// Using useMutation hook
const { mutate, pending } = useMutation();

const handleCreate = async (data) => {
  const { response, error } = await mutate({
    url: endpoints.PHYSICAL_ASSETS,
    method: 'post',
    body: data
  });

  if (response) {
    toast.success('Created successfully');
    reFetch();
  }
};
```

#### 3. Form Pattern

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  quantity: z.number().min(0),
});

const MyForm = () => {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', quantity: 0 }
  });

  const onSubmit = (data) => {
    // Handle submit
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
};
```

#### 4. Modal Pattern

```typescript
import { useModal } from '@/hooks/useModal';

const MyComponent = () => {
  const { isOpen, open, close } = useModal();

  return (
    <>
      <Button onClick={open}>Open Modal</Button>

      <Dialog open={isOpen} onOpenChange={close}>
        {/* Modal content */}
      </Dialog>
    </>
  );
};
```

---

## 📡 API Documentation

### Authentication APIs

#### POST `/api/v1/auth/login`

Login vào hệ thống

**Request:**

```json
{
  "username": "",
  "password": ""
}
```

**Response:**

```json
{
  "data": {
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "role": "admin",
      "permissions": ["assets:view", "assets:create", ...]
    }
  }
}
```

#### GET `/api/v1/auth/me`

Lấy thông tin user hiện tại

**Headers:**

```
Authorization: Bearer {access_token}
```

**Response:**

```json
{
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "role": "admin",
    "permissions": [...]
  }
}
```

#### POST `/api/v1/auth/refresh`

Refresh access token

**Request:**

```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**

```json
{
  "data": {
    "access": "new_access_token",
    "refresh": "new_refresh_token"
  }
}
```

### Asset APIs

#### GET `/api/v1/physical-assets`

Lấy danh sách tài sản

**Query Parameters:**

- `page` - Số trang (default: 1)
- `limit` - Số items per page (default: 10)
- `search` - Tìm kiếm theo tên
- `status` - Lọc theo trạng thái
- `location` - Lọc theo địa điểm

**Response:**

```json
{
  "data": {
    "items": [
      {
        "id": 1,
        "name": "Laptop Dell XPS 15",
        "code": "ASSET-001",
        "status": "available",
        "location": "Office A",
        "quantity": 5
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 10
  }
}
```

#### GET `/api/v1/physical-assets/{id}`

Lấy chi tiết tài sản

**Response:**

```json
{
  "data": {
    "id": 1,
    "name": "Laptop Dell XPS 15",
    "code": "ASSET-001",
    "description": "High-performance laptop",
    "status": "available",
    "location": {
      "id": 1,
      "name": "Office A"
    },
    "catalog_type": {
      "id": 1,
      "name": "Electronics"
    },
    "quantity": 5,
    "unit_price": 1500.0,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### POST `/api/v1/physical-assets`

Tạo tài sản mới

**Request:**

```json
{
  "name": "Laptop Dell XPS 15",
  "code": "ASSET-001",
  "description": "High-performance laptop",
  "catalog_type_id": 1,
  "location_id": 1,
  "quantity": 5,
  "unit_price": 1500.0
}
```

#### PUT `/api/v1/physical-assets/{id}`

Cập nhật tài sản

#### DELETE `/api/v1/physical-assets/{id}`

Xóa tài sản

#### GET `/api/v1/physical-assets/{id}/lifecycle`

Lấy lịch sử vòng đời tài sản

#### GET `/api/v1/physical-assets/{id}/holders`

Lấy danh sách người đang giữ tài sản

#### GET `/api/v1/physical-assets/{id}/stock`

Lấy thông tin tồn kho của tài sản

### Rental APIs

#### GET `/api/v1/rentals`

Lấy danh sách cho thuê

#### GET `/api/v1/rentals/{id}`

Chi tiết đơn cho thuê

#### POST `/api/v1/rentals`

Tạo đơn cho thuê mới

**Request:**

```json
{
  "customer_id": 1,
  "items": [
    {
      "asset_id": 1,
      "quantity": 2,
      "rental_price": 100.0
    }
  ],
  "start_date": "2024-01-01",
  "end_date": "2024-01-31",
  "notes": "Monthly rental"
}
```

#### POST `/api/v1/rentals/{id}/return`

Trả tài sản cho thuê

### Transfer APIs

#### GET `/api/v1/transfers`

Danh sách điều chuyển

#### GET `/api/v1/transfers/{id}`

Chi tiết điều chuyển

#### POST `/api/v1/transfers`

Tạo điều chuyển mới

**Request:**

```json
{
  "from_location_id": 1,
  "to_location_id": 2,
  "items": [
    {
      "asset_id": 1,
      "quantity": 5
    }
  ],
  "transfer_date": "2024-01-01",
  "notes": "Transfer to new office"
}
```

#### POST `/api/v1/transfers/{id}/attachments`

Upload tài liệu đính kèm

### Audit APIs

#### GET `/api/v1/audit/sessions`

Danh sách phiên kiểm kê

#### GET `/api/v1/audit/sessions/{id}`

Chi tiết phiên kiểm kê

#### POST `/api/v1/audit/sessions`

Tạo phiên kiểm kê mới

#### POST `/api/v1/audit/batch-start`

Bắt đầu kiểm kê hàng loạt

#### POST `/api/v1/audit/{id}/complete`

Hoàn thành kiểm kê

#### POST `/api/v1/audit/{id}/approve`

Phê duyệt kết quả kiểm kê

#### POST `/api/v1/audit/{id}/reject`

Từ chối kết quả kiểm kê

### Workflow APIs

#### GET `/api/v1/workflows/tasks`

Danh sách công việc

**Query Parameters:**

- `status` - PENDING, APPROVED, REJECTED
- `assigned_to` - User ID

#### POST `/api/v1/workflows/tasks/{id}/complete`

Hoàn thành công việc (Approve/Reject)

**Request:**

```json
{
  "action": "approve", // or "reject"
  "comment": "Approved"
}
```

#### GET `/api/v1/workflows/history/{type}/{id}`

Lịch sử workflow

**Parameters:**

- `type` - rental, transfer, allocation, etc.
- `id` - Document ID

### Dashboard APIs

#### GET `/api/v1/dashboard/summary`

Tổng quan dashboard

**Response:**

```json
{
  "data": {
    "total_assets": 1000,
    "available_assets": 750,
    "rented_assets": 150,
    "maintenance_assets": 100,
    "pending_tasks": 25
  }
}
```

#### GET `/api/v1/dashboard/recent-activities`

Hoạt động gần đây

#### GET `/api/v1/dashboard/module-stats`

Thống kê theo module

#### GET `/api/v1/dashboard/status-chart`

Dữ liệu biểu đồ trạng thái

---

## 🎨 Hướng Dẫn Phát Triển

### Code Style Guidelines

#### 1. TypeScript

```typescript
// ✅ Good - Explicit types
interface User {
  id: number;
  username: string;
  email: string;
}

const getUser = (id: number): Promise<User> => {
  return axiosInstance.get(`/users/${id}`);
};

// ❌ Bad - Implicit any
const getUser = (id) => {
  return axiosInstance.get(`/users/${id}`);
};
```

#### 2. Component Structure

```typescript
// ✅ Good - Organized structure
import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface Props {
  title: string;
  onSubmit: (data: FormData) => void;
}

export default function MyComponent({ title, onSubmit }: Props) {
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = () => {
    // Logic here
  };

  return (
    <div>
      {/* JSX here */}
    </div>
  );
}
```

#### 3. Import Organization

```typescript
// 1. React imports
import { useEffect, useState } from "react";

// 2. Third-party imports
import { useTranslations } from "next-intl";

import { useForm } from "react-hook-form";

// 3. Internal imports - absolute paths
import { Button } from "@/components/ui/button";
import { endpoints } from "@/config/endpoints";
import { useGet } from "@/hooks/useGet";
// 4. Types
import type { User } from "@/types/auth";
```

#### 4. Naming Conventions

```typescript
// Components - PascalCase
export default function UserProfile() {}

// Functions - camelCase
const handleSubmit = () => {};
const fetchUserData = async () => {};

// Constants - UPPER_SNAKE_CASE
const API_URL = process.env.NEXT_PUBLIC_API_URL;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Types/Interfaces - PascalCase
interface UserData {}
type ResponseType = {};

// Files
// - Components: PascalCase (UserProfile.tsx)
// - Utilities: camelCase (dateUtils.ts)
// - Hooks: camelCase with 'use' prefix (usePermissions.ts)
```

### Custom Hooks Development

#### Creating a Custom Hook

```typescript
// src/hooks/useMyHook.ts
import { useEffect, useState } from "react";

export const useMyHook = (initialValue: string) => {
  const [value, setValue] = useState(initialValue);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Effect logic
  }, [value]);

  const updateValue = (newValue: string) => {
    setLoading(true);
    setValue(newValue);
    setLoading(false);
  };

  return {
    value,
    loading,
    updateValue,
  };
};
```

### Adding New Features

#### 1. Tạo Type Definitions

```typescript
// src/types/my-feature.ts
export interface MyFeature {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

export interface MyFeatureFormData {
  name: string;
  description: string;
}
```

#### 2. Thêm API Endpoints

```typescript
// src/config/endpoints.ts
export const endpoints = {
  // ... existing endpoints
  MY_FEATURES: "my-features",
};

export const dynamicEndpoints = {
  // ... existing endpoints
  MY_FEATURE_DETAIL: (id: number) => `/api/v1/my-features/${id}`,
};
```

#### 3. Tạo Validation Schema

```typescript
// src/components/schemas/my-feature.ts
import { z } from "zod";

export const myFeatureSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});
```

#### 4. Tạo Page Component

```typescript
// src/components/pages/user/my-features/index.tsx
'use client';

import { useGet } from '@/hooks/useGet';
import { endpoints } from '@/config/endpoints';

export default function MyFeaturesPage() {
  const { response, pending } = useGet({
    url: endpoints.MY_FEATURES
  });

  return (
    <div>
      {/* Component content */}
    </div>
  );
}
```

#### 5. Tạo Route

```typescript
// src/app/(private)/my-features/page.tsx
import MyFeaturesPage from '@/components/pages/user/my-features';

export const metadata = {
  title: 'My Features | Asset Management',
};

export default function Page() {
  return <MyFeaturesPage />;
}
```

#### 6. Thêm vào Sidebar

```typescript
// src/app/(private)/layout.tsx
const sidebarItems = [
  // ... existing items
  {
    title: t("my_features"),
    url: "/my-features",
    icon: Star,
    permission: "my_features:view",
  },
];
```

#### 7. Thêm Translations

```json
// src/messages/vi.json
{
  "layout_user": {
    "my_features": "Tính năng của tôi"
  },
  "page_my_features": {
    "title": "Tính năng của tôi",
    "description": "Quản lý tính năng",
    "add_new": "Thêm mới"
  }
}
```

### Testing Guidelines

#### Manual Testing Checklist

- [ ] Kiểm tra responsive (mobile, tablet, desktop)
- [ ] Kiểm tra dark/light theme
- [ ] Kiểm tra permissions (user có quyền / không có quyền)
- [ ] Kiểm tra form validation
- [ ] Kiểm tra error handling
- [ ] Kiểm tra loading states
- [ ] Kiểm tra i18n (EN/VI)

### Performance Optimization

#### 1. Image Optimization

```typescript
import Image from 'next/image';

<Image
  src="/images/logo.png"
  alt="Logo"
  width={200}
  height={100}
  priority // For above-the-fold images
/>
```

#### 2. Code Splitting

```typescript
// Dynamic imports for heavy components
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(
  () => import('@/components/HeavyComponent'),
  { loading: () => <Spinner /> }
);
```

#### 3. React Query Optimization

```typescript
// Stale time để giảm refetch
const { response } = useGet(
  { url: endpoints.USERS },
  { staleTime: 5 * 60 * 1000 }, // 5 minutes
);
```

---

## 🚀 Deployment

### Build Production

```bash
# Lint và build
pnpm build

# Output sẽ ở folder .next/
```

### Deploy to Vercel

1. **Push code lên Git repository**

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. **Import vào Vercel**

- Truy cập [vercel.com](https://vercel.com)
- Click "New Project"
- Import repository
- Configure environment variables
- Deploy

3. **Environment Variables trên Vercel**

```
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
```

### Deploy to VPS/Server

#### 1. Build Application

```bash
pnpm build
```

#### 2. Start Production Server

```bash
pnpm start
```

#### 3. Using PM2 (Process Manager)

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start npm --name "asset-management" -- start

# Save PM2 configuration
pm2 save

# Setup auto-start on reboot
pm2 startup
```

#### 4. Nginx Configuration

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Docker Deployment

#### Dockerfile

```dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN corepack enable pnpm && pnpm build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

#### docker-compose.yml

```yaml
version: "3.8"

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_BASE_URL=http://api:8000
    depends_on:
      - api
    restart: unless-stopped

  api:
    image: your-api-image
    ports:
      - "8000:8000"
    restart: unless-stopped
```

#### Build và Run

```bash
# Build image
docker build -t asset-management .

# Run container
docker run -p 3000:3000 asset-management

# Hoặc sử dụng docker-compose
docker-compose up -d
```

---

## 🔒 Security Best Practices

### 1. Environment Variables

- Không commit `.env.local` vào Git
- Sử dụng `.env.example` làm template
- Sensitive data chỉ lưu trên server

### 2. Authentication

- Access token lưu trong httpOnly cookies
- Refresh token rotation
- Token expiration handling

### 3. API Security

- CORS configuration
- Rate limiting
- Input validation với Zod

### 4. XSS Protection

- Next.js tự động escape output
- Sanitize user input
- Content Security Policy headers

---

## 📝 Troubleshooting

### Common Issues

#### 1. Build Errors

```bash
# Clear cache và rebuild
rm -rf .next
pnpm install
pnpm build
```

#### 2. Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Hoặc sử dụng port khác
PORT=3001 pnpm dev
```

#### 3. Module Not Found

```bash
# Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

#### 4. TypeScript Errors

```bash
# Check TypeScript
pnpm tsc --noEmit
```

---

## 📚 Additional Resources

### Documentation Links

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/docs/primitives/overview/introduction)
- [TanStack Query](https://tanstack.com/query/latest/docs/react/overview)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)

### Learning Resources

- [Next.js Learn Course](https://nextjs.org/learn)
- [TypeScript for React Developers](https://www.typescriptlang.org/docs/handbook/react.html)
- [Tailwind CSS Tutorial](https://tailwindcss.com/docs/utility-first)

---

## 👥 Team & Contributing

### Development Team

- **Frontend Team**: Next.js, React, TypeScript
- **Backend Team**: API Development
- **DevOps Team**: Deployment & Infrastructure

### Contributing Guidelines

1. **Fork repository**
2. **Create feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **Push to branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open Pull Request**

### Commit Message Convention

```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Format code
refactor: Refactor code
test: Add tests
chore: Update dependencies
```

---

## 📄 License

This project is **private and proprietary**.

© 2026 Asset Management System. All rights reserved.

---

## 📞 Support & Contact

Để được hỗ trợ hoặc báo cáo lỗi, vui lòng liên hệ:

- **Email**: support@assetmanagement.com
- **Issue Tracker**: [GitHub Issues](https://github.com/your-repo/issues)
- **Documentation**: [Wiki](https://github.com/your-repo/wiki)

---

**Last Updated**: 2026
**Version**: 1.0.0

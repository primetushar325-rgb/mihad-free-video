// ============================================================
// Core domain types shared across the whole app.
// ============================================================

export interface Admin {
  id: number;
  username: string;
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  orderNumber: number;
  isVisible: boolean;
  createdAt: string;
}

export interface Video {
  id: number;
  title: string;
  description: string;
  thumbnailUrl: string;
  googleDriveUrl: string;
  tags: string[];
  uploadTime: string;
  categoryId: number | null;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Video joined with its category (used for cards & lists). */
export interface VideoWithCategory extends Video {
  categoryName: string | null;
  categorySlug: string | null;
}

export interface Slide {
  id: number;
  imageUrl: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  orderNumber: number;
  active: boolean;
  createdAt: string;
}

export interface Settings {
  id: number;
  websiteName: string;
  logoUrl: string;
  faviconUrl: string;
  footerText: string;
  primaryColor: string;
  secondaryColor: string;
  enablePwa: boolean;
  enableAds: boolean;
  adsenseHeader: string;
  adsenseBetweenCards: string;
  adsenseDetails: string;
  adsenseFooter: string;
  adsenseClient: string;
}

export interface DownloadStat {
  videoId: number;
  videoTitle: string;
  count: number;
}

export interface DashboardStats {
  totalVideos: number;
  totalCategories: number;
  totalFeatured: number;
  totalSlides: number;
  totalAdmins: number;
  recentVideos: VideoWithCategory[];
  // Analytics
  totalVisits: number;
  uniqueVisitors: number;
  todayVisits: number;
  totalDownloads: number;
  topDownloads: DownloadStat[];
}

// ------------------------------------------------------------
// API contracts
// ------------------------------------------------------------
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string>;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ------------------------------------------------------------
// Input / DTO types (validated by the API)
// ------------------------------------------------------------
export interface VideoInput {
  title: string;
  description: string;
  thumbnailUrl: string;
  googleDriveUrl: string;
  tags: string;
  uploadTime: string;
  categoryId: number | null;
  featured: boolean;
}

export interface CategoryInput {
  name: string;
  slug?: string;
  icon?: string;
  orderNumber?: number;
  isVisible?: boolean;
}

export interface SlideInput {
  imageUrl: string;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  orderNumber?: number;
  active?: boolean;
}

export interface SettingsInput {
  websiteName?: string;
  logoUrl?: string;
  faviconUrl?: string;
  footerText?: string;
  primaryColor?: string;
  secondaryColor?: string;
  enablePwa?: boolean;
  enableAds?: boolean;
  adsenseHeader?: string;
  adsenseBetweenCards?: string;
  adsenseDetails?: string;
  adsenseFooter?: string;
  adsenseClient?: string;
}

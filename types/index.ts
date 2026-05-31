export interface Platform {
  id: string;
  name: string;
  group: string;
}

export interface System {
  id: string;
  name: string;
  manufacturer?: string | null;
  type: string;
}

export interface Hardware {
  id: string;
  name: string;
  manufacturer?: string | null;
  type: string;
}

export interface Tag {
  id: string;
  name: string;
}

export interface SoftwareListing {
  id: string;
  name: string;
  description: string | null;
  category: string;
  status: string;
  websiteUrl: string | null;
  downloadUrl?: string | null;
  sourceUrl?: string | null;
  platforms: Platform[];
  systems: System[];
  hardware: Hardware[];
  tags: Tag[];
  avgQuality: number | null;
  avgPerformance: number | null;
  ratingCount: number;
  createdAt?: string;
  updatedAt?: string | null;
}

export interface Rating {
  id: string;
  qualityScore: number | null;
  performanceScore: number | null;
  comment: string | null;
  createdAt: string;
  hardware: { id: string; name: string } | null;
  user: { id: string; username: string | null };
}

export interface SoftwareDetail extends SoftwareListing {
  ratings: Rating[];
}

export interface FiltersData {
  platforms: Platform[];
  systems: System[];
  hardware: Hardware[];
  tags: Tag[];
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

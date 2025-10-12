const API_BASE = '';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface MenuItem {
  id: number;
  name_en: string;
  name_am: string;
  name_or: string;
  description_en: string;
  description_am: string;
  description_or: string;
  price: number;
  category_id: number;
  category_name?: string;
  image: string;
  is_available: boolean;
  is_special: boolean;
  discount: number;
  created_at?: string;
  updated_at?: string;
}

export interface Promotion {
  food_id: number;
  food_name?: string;
  discount: number;
  start_date: string;
  end_date: string;
}

export interface DashboardStats {
  totalItems: number;
  activePromotions: number;
  unavailableItems: number;
  specialItems: number;
}

class ApiService {
  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/admin/login';
      throw new Error('Unauthorized');
    }

    const data = await response.json();

    if (!data.success && data.message) {
      throw new Error(data.message);
    }

    return data;
  }

  private async publicRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!data.success && data.message) {
      throw new Error(data.message);
    }

    return data;
  }

  // Auth
  async login(credentials: LoginCredentials) {
    const data = await this.request<{ success: boolean; token: string; admin: any }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    
    return data;
  }

  logout() {
    localStorage.removeItem('token');
    window.location.href = '/admin/login';
  }

  // Menu
  async getMenuItems(lang: string = 'en') {
    return this.request<{ success: boolean; menu: MenuItem[] }>(`/api/menu?lang=${lang}`);
  }

  async getMenuItem(id: number, lang: string = 'en') {
    return this.request<{ success: boolean; menuItem: MenuItem }>(`/api/menu/${id}?lang=${lang}`);
  }

  async createMenuItem(item: Partial<MenuItem>) {
    return this.request<{ success: boolean; result: any }>('/api/menu', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }

  async updateMenuItem(id: number, item: Partial<MenuItem>) {
    return this.request<{ success: boolean; result: any }>(`/api/menu/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    });
  }

  async deleteMenuItem(id: number) {
    return this.request<{ success: boolean; result: any }>(`/api/menu/${id}`, {
      method: 'DELETE',
    });
  }

  // Promotions
  async getPromotions(lang: string = 'en') {
    return this.request<{ success: boolean; promotions: Promotion[] }>(`/api/promotions?lang=${lang}`);
  }

  async createPromotion(promotion: { menu_id: number; discount: number; start_date: string; end_date: string }) {
    return this.request<{ success: boolean; result: any }>('/api/promotions', {
      method: 'POST',
      body: JSON.stringify(promotion),
    });
  }

  async updatePromotion(menuId: number, promotion: { discount: number; start_date: string; end_date: string }) {
    return this.request<{ success: boolean; result: any }>(`/api/promotions/${menuId}`, {
      method: 'PUT',
      body: JSON.stringify(promotion),
    });
  }

  async deletePromotion(menuId: number) {
    return this.request<{ success: boolean; result: any }>(`/api/promotions/${menuId}`, {
      method: 'DELETE',
    });
  }

  // Public API (no auth required)
  async getPublicMenuItems(lang: string = 'en') {
    return this.publicRequest<{ success: boolean; menu: MenuItem[] }>(`/api/menu?lang=${lang}`);
  }

  async getPublicPromotions(lang: string = 'en') {
    return this.publicRequest<{ success: boolean; promotions: Promotion[] }>(`/api/promotions?lang=${lang}`);
  }
}

export const api = new ApiService();

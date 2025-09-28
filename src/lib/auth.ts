interface LoginRequest {
  username: string;
  password: string;
}

interface User {
  username: string;
  firstName: string;
  lastName: string;
  role: number;
}

interface LoginResponse {
  status: string;
  statusCode: number;
  message?: string;
  accessToken?: string;
  role?: number;
  user?: User;
  error?: string;
}

export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  try {
    const response = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data: LoginResponse = await response.json();

    if (response.ok) {
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
    }

    return data;
  } catch {
    return {
      status: 'error',
      statusCode: 500,
      error: 'Network error occurred',
    };
  }
};

export const logout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
};

export const getStoredUser = (): User | null => {
  if (typeof window === 'undefined') return null;

  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;

  return localStorage.getItem('accessToken');
};

export const isAuthenticated = (): boolean => {
  return !!getAccessToken();
};
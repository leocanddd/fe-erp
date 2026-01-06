interface Palet {
  id?: string;
  name: string;
  location: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Stock {
  id?: string;
  paletId?: string;
  brand: string;
  name: string;
  code: string;
  stock: number;
  price: number;
  entryDate: string;
  createdAt?: string;
  updatedAt?: string;
}

interface PaletCreateRequest {
  name: string;
  location: string;
}

interface StockCreateRequest {
  brand: string;
  name: string;
  code: string;
  stock: number;
  price: number;
  entryDate: string;
}

interface IncomingStockRequest {
  productCode: string;
  incomingStock: number;
}

interface OutgoingStockRequest {
  productCode: string;
  outgoingStock: number;
}

interface ApiResponse<T> {
  status: string;
  statusCode: number;
  message?: string;
  data?: T;
  error?: string;
}

interface PaginatedResponse<T> {
  status: string;
  statusCode: number;
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  error?: string;
}

const getApiUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
};

const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// Palet APIs
export const createPalet = async (palet: PaletCreateRequest): Promise<ApiResponse<Palet>> => {
  try {
    const response = await fetch(`${getApiUrl()}/api/palets`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(palet),
    });

    const data: ApiResponse<Palet> = await response.json();
    return data;
  } catch {
    return {
      status: 'error',
      statusCode: 500,
      error: 'Network error occurred',
    };
  }
};

export const getPalets = async (
  page: number = 1,
  limit: number = 10,
  search: string = ''
): Promise<PaginatedResponse<Palet>> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
    });

    const response = await fetch(`${getApiUrl()}/api/palets?${params}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data: PaginatedResponse<Palet> = await response.json();
    // Ensure data is always an array
    return {
      ...data,
      data: data.data || [],
    };
  } catch {
    return {
      status: 'error',
      statusCode: 500,
      data: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: limit,
      },
      error: 'Network error occurred',
    };
  }
};

export const getPalet = async (id: string): Promise<ApiResponse<Palet>> => {
  try {
    const response = await fetch(`${getApiUrl()}/api/palets/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data: ApiResponse<Palet> = await response.json();
    return data;
  } catch {
    return {
      status: 'error',
      statusCode: 500,
      error: 'Network error occurred',
    };
  }
};

export const updatePalet = async (id: string, palet: Partial<PaletCreateRequest>): Promise<ApiResponse<Palet>> => {
  try {
    const response = await fetch(`${getApiUrl()}/api/palets/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(palet),
    });

    const data: ApiResponse<Palet> = await response.json();
    return data;
  } catch {
    return {
      status: 'error',
      statusCode: 500,
      error: 'Network error occurred',
    };
  }
};

export const deletePalet = async (id: string): Promise<ApiResponse<Palet>> => {
  try {
    const response = await fetch(`${getApiUrl()}/api/palets/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    const data: ApiResponse<Palet> = await response.json();
    return data;
  } catch {
    return {
      status: 'error',
      statusCode: 500,
      error: 'Network error occurred',
    };
  }
};

// Stock APIs (nested under Palet)
export const createStock = async (paletId: string, stock: StockCreateRequest): Promise<ApiResponse<Stock>> => {
  try {
    const response = await fetch(`${getApiUrl()}/api/palets/${paletId}/stocks`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(stock),
    });

    const data: ApiResponse<Stock> = await response.json();
    return data;
  } catch {
    return {
      status: 'error',
      statusCode: 500,
      error: 'Network error occurred',
    };
  }
};

export const getStocks = async (
  paletId: string,
  page: number = 1,
  limit: number = 10,
  search: string = ''
): Promise<PaginatedResponse<Stock>> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
    });

    const response = await fetch(`${getApiUrl()}/api/palets/${paletId}/stocks?${params}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data: PaginatedResponse<Stock> = await response.json();
    // Ensure data is always an array
    return {
      ...data,
      data: data.data || [],
    };
  } catch {
    return {
      status: 'error',
      statusCode: 500,
      data: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: limit,
      },
      error: 'Network error occurred',
    };
  }
};

export const getStock = async (paletId: string, stockId: string): Promise<ApiResponse<Stock>> => {
  try {
    const response = await fetch(`${getApiUrl()}/api/palets/${paletId}/stocks/${stockId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data: ApiResponse<Stock> = await response.json();
    return data;
  } catch {
    return {
      status: 'error',
      statusCode: 500,
      error: 'Network error occurred',
    };
  }
};

export const updateStock = async (paletId: string, stockId: string, stock: Partial<StockCreateRequest>): Promise<ApiResponse<Stock>> => {
  try {
    const response = await fetch(`${getApiUrl()}/api/palets/${paletId}/stocks/${stockId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(stock),
    });

    const data: ApiResponse<Stock> = await response.json();
    return data;
  } catch {
    return {
      status: 'error',
      statusCode: 500,
      error: 'Network error occurred',
    };
  }
};

export const deleteStock = async (paletId: string, stockId: string): Promise<ApiResponse<Stock>> => {
  try {
    const response = await fetch(`${getApiUrl()}/api/palets/${paletId}/stocks/${stockId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    const data: ApiResponse<Stock> = await response.json();
    return data;
  } catch {
    return {
      status: 'error',
      statusCode: 500,
      error: 'Network error occurred',
    };
  }
};

export const addIncomingStock = async (paletId: string, incomingStock: IncomingStockRequest): Promise<ApiResponse<Stock>> => {
  try {
    const response = await fetch(`${getApiUrl()}/api/palets/${paletId}/stocks/incoming-stock`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(incomingStock),
    });

    const data: ApiResponse<Stock> = await response.json();
    return data;
  } catch {
    return {
      status: 'error',
      statusCode: 500,
      error: 'Network error occurred',
    };
  }
};

export const addOutgoingStock = async (paletId: string, outgoingStock: OutgoingStockRequest): Promise<ApiResponse<Stock>> => {
  try {
    const response = await fetch(`${getApiUrl()}/api/palets/${paletId}/stocks/outgoing-stock`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(outgoingStock),
    });

    const data: ApiResponse<Stock> = await response.json();
    return data;
  } catch {
    return {
      status: 'error',
      statusCode: 500,
      error: 'Network error occurred',
    };
  }
};

export type {
  Palet,
  Stock,
  PaletCreateRequest,
  StockCreateRequest,
  IncomingStockRequest,
  OutgoingStockRequest,
  ApiResponse,
  PaginatedResponse
};

interface OrderProduct {
  product: string;
  quantity: number;
  value: number;
}

interface Order {
  id?: string;
  customer: string;
  contact: string;
  products: OrderProduct[];
  orderDate: string;
  totalValue: number;
  isProcessed: boolean;
  isFinished: boolean;
  isCancelled: boolean;
  shipmentTime: string;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}

interface OrderCreateRequest {
  customer: string;
  contact: string;
  products: OrderProduct[];
  orderDate: string;
  shipmentTime: string;
  createdBy: string;
}

interface OrderResponse {
  status: string;
  statusCode: number;
  message?: string;
  data?: Order;
  error?: string;
}

interface OrdersListResponse {
  status: string;
  statusCode: number;
  data: Order[];
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

export const createOrder = async (order: OrderCreateRequest): Promise<OrderResponse> => {
  try {
    const response = await fetch(`${getApiUrl()}/api/orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(order),
    });

    const data: OrderResponse = await response.json();
    return data;
  } catch (error) {
    return {
      status: 'error',
      statusCode: 500,
      error: 'Network error occurred',
    };
  }
};

export const getOrders = async (
  page: number = 1,
  limit: number = 10,
  customer: string = ''
): Promise<OrdersListResponse> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(customer && { customer }),
    });

    const response = await fetch(`${getApiUrl()}/api/orders?${params}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data: OrdersListResponse = await response.json();
    return data;
  } catch (error) {
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

export const getOrder = async (id: string): Promise<OrderResponse> => {
  try {
    const response = await fetch(`${getApiUrl()}/api/orders/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data: OrderResponse = await response.json();
    return data;
  } catch (error) {
    return {
      status: 'error',
      statusCode: 500,
      error: 'Network error occurred',
    };
  }
};

export const updateOrder = async (id: string, order: Partial<OrderCreateRequest & {
  isProcessed?: boolean;
  isFinished?: boolean;
  isCancelled?: boolean;
}>): Promise<OrderResponse> => {
  try {
    const response = await fetch(`${getApiUrl()}/api/orders/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(order),
    });

    const data: OrderResponse = await response.json();
    return data;
  } catch (error) {
    return {
      status: 'error',
      statusCode: 500,
      error: 'Network error occurred',
    };
  }
};

export const deleteOrder = async (id: string): Promise<OrderResponse> => {
  try {
    const response = await fetch(`${getApiUrl()}/api/orders/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    const data: OrderResponse = await response.json();
    return data;
  } catch (error) {
    return {
      status: 'error',
      statusCode: 500,
      error: 'Network error occurred',
    };
  }
};

export type { Order, OrderProduct, OrderCreateRequest, OrderResponse, OrdersListResponse };
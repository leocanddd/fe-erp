interface OrderProduct {
	product: string;
	quantity: number;
	value: number;
}

interface OrderStatus {
	isActive: boolean;
	description: string;
	actionBy: string;
	actionAt?: string;
}

interface Order {
	id?: string;
	orderId?: string;
	customer: string;
	contact: string;
	products: OrderProduct[];
	orderDate: string;
	totalValue: number;
	processed: OrderStatus;
	finished: OrderStatus;
	cancelled: OrderStatus;
	approved: OrderStatus;
	rejected: OrderStatus;
	shipment: OrderStatus;
	priceApproved: OrderStatus;
	shipmentTime: string;
	createdBy: string;
	username?: string;
	createdAt?: string;
	updatedAt?: string;
	collector?: string;
	paymentDueDate?: string;
	// Legacy fields for backward compatibility
	isProcessed?: boolean;
	isFinished?: boolean;
	isCancelled?: boolean;
	isApproved?: boolean;
	isRejected?: boolean;
	isShipment?: boolean;
	description?: string;
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

interface AssignCollectorRequest {
	collector: string;
	sp: string;
}

interface AR {
	id: string;
	arItemId: string;
	orderId: string;
	source: string;
	client: string;
	contact: string;
	status: string;
	collector: string;
}

interface AssignCollectorResponse {
	status: string;
	statusCode: number;
	message: string;
	data: {
		order: Order;
		arCreated: boolean;
		ar?: AR;
	};
}

const getApiUrl = () => {
	return (
		process.env.NEXT_PUBLIC_API_URL ||
		'http://localhost:8080'
	);
};

const getAuthHeaders = () => {
	const token = localStorage.getItem(
		'accessToken'
	);
	return {
		'Content-Type': 'application/json',
		...(token && {
			Authorization: `Bearer ${token}`,
		}),
	};
};

export const createOrder = async (
	order: OrderCreateRequest
): Promise<OrderResponse> => {
	try {
		const response = await fetch(
			`${getApiUrl()}/api/orders`,
			{
				method: 'POST',
				headers: getAuthHeaders(),
				body: JSON.stringify(order),
			}
		);

		const data: OrderResponse =
			await response.json();
		return data;
	} catch {
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
	customer: string = '',
	type?: string
): Promise<OrdersListResponse> => {
	try {
		const params = new URLSearchParams({
			page: page.toString(),
			limit: limit.toString(),
			...(customer && { customer }),
			...(type && { type }),
		});

		const response = await fetch(
			`${getApiUrl()}/api/orders?${params}`,
			{
				method: 'GET',
				headers: getAuthHeaders(),
			}
		);

		const data: OrdersListResponse =
			await response.json();
		return data;
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

export const getOrder = async (
	id: string
): Promise<OrderResponse> => {
	try {
		const response = await fetch(
			`${getApiUrl()}/api/orders/${id}`,
			{
				method: 'GET',
				headers: getAuthHeaders(),
			}
		);

		const data: OrderResponse =
			await response.json();
		return data;
	} catch {
		return {
			status: 'error',
			statusCode: 500,
			error: 'Network error occurred',
		};
	}
};

export const getOrderByOrderId = async (
	orderId: string
): Promise<OrderResponse> => {
	try {
		const response = await fetch(
			`${getApiUrl()}/api/orders/by-order-id/${orderId}`,
			{
				method: 'GET',
				headers: getAuthHeaders(),
			}
		);

		const data = await response.json();

		// The API now returns the order directly in data, not as an array
		if (
			data.status === 'success' &&
			data.data
		) {
			return {
				status: data.status,
				statusCode: data.statusCode,
				data: data.data, // Get the order directly
			};
		} else {
			return {
				status: 'error',
				statusCode: 404,
				error: 'Order not found',
			};
		}
	} catch {
		return {
			status: 'error',
			statusCode: 500,
			error: 'Network error occurred',
		};
	}
};

export const updateOrder = async (
	id: string,
	order: Partial<
		OrderCreateRequest & {
			processed?: OrderStatus;
			finished?: OrderStatus;
			cancelled?: OrderStatus;
			approved?: OrderStatus;
			rejected?: OrderStatus;
			shipment?: OrderStatus;
			priceApproved?: OrderStatus;
			paymentDueDate?: string;
		}
	>
): Promise<OrderResponse> => {
	try {
		const response = await fetch(
			`${getApiUrl()}/api/orders/${id}`,
			{
				method: 'PUT',
				headers: getAuthHeaders(),
				body: JSON.stringify(order),
			}
		);

		const data: OrderResponse =
			await response.json();
		return data;
	} catch {
		return {
			status: 'error',
			statusCode: 500,
			error: 'Network error occurred',
		};
	}
};

export const deleteOrder = async (
	id: string
): Promise<OrderResponse> => {
	try {
		const response = await fetch(
			`${getApiUrl()}/api/orders/${id}`,
			{
				method: 'DELETE',
				headers: getAuthHeaders(),
			}
		);

		const data: OrderResponse =
			await response.json();
		return data;
	} catch {
		return {
			status: 'error',
			statusCode: 500,
			error: 'Network error occurred',
		};
	}
};

export const assignCollectorToOrder = async (
	orderId: string,
	collector: string,
	sp: string
): Promise<AssignCollectorResponse> => {
	try {
		const response = await fetch(
			`${getApiUrl()}/api/orders/${orderId}/assign-collector`,
			{
				method: 'PUT',
				headers: getAuthHeaders(),
				body: JSON.stringify({
					collector,
					sp,
				}),
			}
		);

		if (!response.ok) {
			const error = await response.json();
			throw new Error(
				error.error ||
					'Failed to assign collector'
			);
		}

		return await response.json();
	} catch (error) {
		throw error;
	}
};

export type {
	Order,
	OrderCreateRequest,
	OrderProduct,
	OrderResponse,
	OrdersListResponse,
	AssignCollectorRequest,
	AssignCollectorResponse,
	AR,
};

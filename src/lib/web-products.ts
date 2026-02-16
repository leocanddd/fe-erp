export interface WebProductVariant {
	name: string;
	description: string;
	image: string;
}

export interface WebProduct {
	id: string;
	productId: string;
	name: string;
	displayName: string;
	brand: string;
	subtitle: string;
	category: string;
	image: string;
	description: string;
	price: number;
	variants: WebProductVariant[];
	createdAt?: string;
	updatedAt?: string;
}

export interface WebProductUpdateRequest {
	displayName?: string;
	brand?: string;
	subtitle?: string;
	category?: string;
	image?: string;
	description?: string;
	price?: number;
	variants?: WebProductVariant[];
}

export interface WebProductCreateRequest {
	name?: string;
	displayName?: string;
	brand?: string;
	subtitle?: string;
	category?: string;
	image?: string;
	description?: string;
	price?: number;
	variants?: WebProductVariant[];
}

export interface WebProductResponse {
	status: string;
	statusCode: number;
	message?: string;
	data?: WebProduct;
	error?: string;
}

export interface WebProductsListResponse {
	status: string;
	statusCode: number;
	data: WebProduct[];
	pagination: {
		currentPage: number;
		totalPages: number;
		totalItems: number;
		itemsPerPage: number;
	};
	error?: string;
}

const getApiUrl = () =>
	process.env.NEXT_PUBLIC_API_URL ||
	'http://localhost:8080';

const getAuthHeaders = () => {
	const token =
		typeof window !== 'undefined'
			? localStorage.getItem(
					'accessToken',
				)
			: null;
	return {
		'Content-Type': 'application/json',
		...(token && {
			Authorization: `Bearer ${token}`,
		}),
	};
};

export const getWebProducts = async (
	page: number = 1,
	limit: number = 10,
	search: string = '',
	category: string = '',
	brand: string = '',
): Promise<WebProductsListResponse> => {
	try {
		const params = new URLSearchParams({
			page: page.toString(),
			limit: limit.toString(),
			...(search && { search }),
			...(category && { category }),
			...(brand && { brand }),
		});

		const response = await fetch(
			`${getApiUrl()}/api/web-products?${params}`,
			{
				method: 'GET',
				headers: getAuthHeaders(),
			},
		);

		const data: WebProductsListResponse =
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

export const getWebProduct = async (
	id: string,
): Promise<WebProductResponse> => {
	try {
		const response = await fetch(
			`${getApiUrl()}/api/web-products/${id}`,
			{
				method: 'GET',
				headers: getAuthHeaders(),
			},
		);
		return await response.json();
	} catch {
		return {
			status: 'error',
			statusCode: 500,
			error: 'Network error occurred',
		};
	}
};

export const updateWebProduct = async (
	id: string,
	payload: WebProductUpdateRequest,
): Promise<WebProductResponse> => {
	try {
		const response = await fetch(
			`${getApiUrl()}/api/web-products/${id}`,
			{
				method: 'PUT',
				headers: getAuthHeaders(),
				body: JSON.stringify(payload),
			},
		);
		return await response.json();
	} catch {
		return {
			status: 'error',
			statusCode: 500,
			error: 'Network error occurred',
		};
	}
};

export const deleteWebProduct = async (
	id: string,
): Promise<WebProductResponse> => {
	try {
		const response = await fetch(
			`${getApiUrl()}/api/web-products/${id}`,
			{
				method: 'DELETE',
				headers: getAuthHeaders(),
			},
		);
		return await response.json();
	} catch {
		return {
			status: 'error',
			statusCode: 500,
			error: 'Network error occurred',
		};
	}
};

export const createWebProduct = async (
	payload: WebProductCreateRequest,
): Promise<WebProductResponse> => {
	try {
		const response = await fetch(
			`${getApiUrl()}/api/web-products`,
			{
				method: 'POST',
				headers: getAuthHeaders(),
				body: JSON.stringify(payload),
			},
		);
		return await response.json();
	} catch {
		return {
			status: 'error',
			statusCode: 500,
			error: 'Network error occurred',
		};
	}
};

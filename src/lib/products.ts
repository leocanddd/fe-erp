interface Product {
	id?: string;
	brand: string;
	name: string;
	code: string;
	stock: number;
	price: number;
	holdingStock?: number;
	entryDate: string;
	image?: string;
	createdAt?: string;
	updatedAt?: string;
	displayWeb?: boolean;
}

interface ProductCreateRequest {
	brand: string;
	name: string;
	code: string;
	stock: number;
	price: number;
	entryDate: string;
	image?: string;
}

interface ProductResponse {
	status: string;
	statusCode: number;
	message?: string;
	data?: Product;
	error?: string;
}

interface ProductsListResponse {
	status: string;
	statusCode: number;
	data: Product[];
	pagination: {
		currentPage: number;
		totalPages: number;
		totalItems: number;
		itemsPerPage: number;
	};
	error?: string;
}

const getApiUrl = () => {
	return (
		process.env.NEXT_PUBLIC_API_URL ||
		'http://localhost:8080'
	);
};

const getAuthHeaders = () => {
	const token = localStorage.getItem(
		'accessToken',
	);
	return {
		'Content-Type': 'application/json',
		...(token && {
			Authorization: `Bearer ${token}`,
		}),
	};
};

export const createProduct = async (
	product: ProductCreateRequest,
): Promise<ProductResponse> => {
	try {
		const response = await fetch(
			`${getApiUrl()}/api/products`,
			{
				method: 'POST',
				headers: getAuthHeaders(),
				body: JSON.stringify(product),
			},
		);

		const data: ProductResponse =
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

export const getProducts = async (
	page: number = 1,
	limit: number = 10,
	search: string = '',
): Promise<ProductsListResponse> => {
	try {
		const params = new URLSearchParams({
			page: page.toString(),
			limit: limit.toString(),
			...(search && { search }),
		});

		const response = await fetch(
			`${getApiUrl()}/api/products?${params}`,
			{
				method: 'GET',
				headers: getAuthHeaders(),
			},
		);

		const data: ProductsListResponse =
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

export const getProduct = async (
	id: string,
): Promise<ProductResponse> => {
	try {
		const response = await fetch(
			`${getApiUrl()}/api/products/${id}`,
			{
				method: 'GET',
				headers: getAuthHeaders(),
			},
		);

		const data: ProductResponse =
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

export const updateProduct = async (
	id: string,
	product: Partial<ProductCreateRequest>,
): Promise<ProductResponse> => {
	try {
		const response = await fetch(
			`${getApiUrl()}/api/products/${id}`,
			{
				method: 'PUT',
				headers: getAuthHeaders(),
				body: JSON.stringify(product),
			},
		);

		const data: ProductResponse =
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

export const deleteProduct = async (
	id: string,
): Promise<ProductResponse> => {
	try {
		const response = await fetch(
			`${getApiUrl()}/api/products/${id}`,
			{
				method: 'DELETE',
				headers: getAuthHeaders(),
			},
		);

		const data: ProductResponse =
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

interface ProductHistoryRequest {
	name: string;
	type: string;
	message: string;
}

interface ProductHistoryResponse {
	status: string;
	statusCode: number;
	message?: string;
	error?: string;
}

export const createProductHistory =
	async (
		history: ProductHistoryRequest,
	): Promise<ProductHistoryResponse> => {
		try {
			const response = await fetch(
				`${getApiUrl()}/api/product-history`,
				{
					method: 'POST',
					headers: getAuthHeaders(),
					body: JSON.stringify(history),
				},
			);

			const data: ProductHistoryResponse =
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

export type {
	Product,
	ProductCreateRequest,
	ProductResponse,
	ProductsListResponse,
};

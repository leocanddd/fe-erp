interface QuotationProduct {
	name: string;
	harga?: number;
	quantity?: number;
}

interface Quotation {
	id?: string;
	customerName: string;
	salesName: string;
	date: string;
	products: QuotationProduct[];
	discount?: number;
	isApproved?: boolean;
	createdAt?: string;
	updatedAt?: string;
}

interface QuotationCreateRequest {
	customerName: string;
	salesName: string;
	date: string;
	products: QuotationProduct[];
	discount?: number;
	isApproved?: boolean;
}

interface QuotationResponse {
	status: string;
	statusCode: number;
	message?: string;
	data?: Quotation;
	error?: string;
}

interface QuotationsListResponse {
	status: string;
	statusCode: number;
	data: Quotation[];
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

export const createQuotation = async (
	quotation: QuotationCreateRequest,
): Promise<QuotationResponse> => {
	try {
		const response = await fetch(
			`${getApiUrl()}/api/quotations`,
			{
				method: 'POST',
				headers: getAuthHeaders(),
				body: JSON.stringify(quotation),
			},
		);

		const data: QuotationResponse =
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

export const getQuotations = async (
	page: number = 1,
	limit: number = 10,
	customerName?: string,
	salesName?: string,
): Promise<QuotationsListResponse> => {
	try {
		const params = new URLSearchParams({
			page: page.toString(),
			limit: limit.toString(),
			...(customerName && { customerName }),
			...(salesName && { salesName }),
		});

		const response = await fetch(
			`${getApiUrl()}/api/quotations?${params}`,
			{
				method: 'GET',
				headers: getAuthHeaders(),
			},
		);

		const data: QuotationsListResponse =
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

export const getQuotationsBySales = async (
	salesName: string,
	page: number = 1,
	limit: number = 10,
): Promise<QuotationsListResponse> => {
	try {
		const params = new URLSearchParams({
			page: page.toString(),
			limit: limit.toString(),
		});

		const response = await fetch(
			`${getApiUrl()}/api/quotations/by-sales/${encodeURIComponent(salesName)}?${params}`,
			{
				method: 'GET',
				headers: getAuthHeaders(),
			},
		);

		const data: QuotationsListResponse =
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

export const getQuotation = async (
	id: string,
): Promise<QuotationResponse> => {
	try {
		const response = await fetch(
			`${getApiUrl()}/api/quotations/${id}`,
			{
				method: 'GET',
				headers: getAuthHeaders(),
			},
		);

		const data: QuotationResponse =
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

export const updateQuotation = async (
	id: string,
	quotation: Partial<QuotationCreateRequest>,
): Promise<QuotationResponse> => {
	try {
		const response = await fetch(
			`${getApiUrl()}/api/quotations/${id}`,
			{
				method: 'PUT',
				headers: getAuthHeaders(),
				body: JSON.stringify(quotation),
			},
		);

		const data: QuotationResponse =
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

export const deleteQuotation = async (
	id: string,
): Promise<QuotationResponse> => {
	try {
		const response = await fetch(
			`${getApiUrl()}/api/quotations/${id}`,
			{
				method: 'DELETE',
				headers: getAuthHeaders(),
			},
		);

		const data: QuotationResponse =
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
	Quotation,
	QuotationProduct,
	QuotationCreateRequest,
	QuotationResponse,
	QuotationsListResponse,
};

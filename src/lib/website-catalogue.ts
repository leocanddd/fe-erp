export interface WebsiteCatalogue {
	_id?: string;
	id?: string;
	images: string[];
	descText: string;
	createdAt?: string;
	updatedAt?: string;
}

export interface WebsiteCatalogueCreateRequest {
	images: string[];
	descText: string;
}

export interface WebsiteCatalogueUpdateRequest {
	images?: string[];
	descText?: string;
}

export interface WebsiteCatalogueResponse {
	status: string;
	statusCode: number;
	message?: string;
	data?: WebsiteCatalogue;
	error?: string;
}

export interface WebsiteCatalogueListResponse {
	status: string;
	statusCode: number;
	data: WebsiteCatalogue[];
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

export const getWebsiteCatalogues = async (): Promise<WebsiteCatalogueListResponse> => {
	try {
		const response = await fetch(
			`${getApiUrl()}/api/website-catalogue`,
			{
				method: 'GET',
				headers: getAuthHeaders(),
			},
		);

		const data: WebsiteCatalogueListResponse =
			await response.json();
		return data;
	} catch {
		return {
			status: 'error',
			statusCode: 500,
			data: [],
			error: 'Network error occurred',
		};
	}
};

export const getWebsiteCatalogue = async (
	id: string,
): Promise<WebsiteCatalogueResponse> => {
	try {
		const response = await fetch(
			`${getApiUrl()}/api/website-catalogue/${id}`,
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

export const createWebsiteCatalogue = async (
	payload: WebsiteCatalogueCreateRequest,
): Promise<WebsiteCatalogueResponse> => {
	try {
		const response = await fetch(
			`${getApiUrl()}/api/website-catalogue`,
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

export const updateWebsiteCatalogue = async (
	id: string,
	payload: WebsiteCatalogueUpdateRequest,
): Promise<WebsiteCatalogueResponse> => {
	try {
		const response = await fetch(
			`${getApiUrl()}/api/website-catalogue/${id}`,
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

export const deleteWebsiteCatalogue = async (
	id: string,
): Promise<WebsiteCatalogueResponse> => {
	try {
		const response = await fetch(
			`${getApiUrl()}/api/website-catalogue/${id}`,
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

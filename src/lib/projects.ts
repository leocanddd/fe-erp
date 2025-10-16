const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_URL ||
	'http://localhost:3001';

export interface Project {
	id: string;
	projectName: string;
	location: string;
	pic: string;
	contact: string;
	createdAt?: string;
	updatedAt?: string;
}

export interface ProjectFilters {
	page?: number;
	limit?: number;
	projectName?: string;
}

export interface PaginationMeta {
	currentPage: number;
	totalPages: number;
	totalItems: number;
	itemsPerPage: number;
}

export interface ProjectsResponse {
	projects: Project[];
	pagination: PaginationMeta;
}

interface ApiResponse<T> {
	statusCode: number;
	data?: T;
	error?: string;
}

export const getProjects = async (
	filters: ProjectFilters = {}
): Promise<ApiResponse<ProjectsResponse>> => {
	try {
		const params = new URLSearchParams();

		// Add filters to query parameters
		if (filters.page)
			params.append(
				'page',
				filters.page.toString()
			);
		if (filters.limit)
			params.append(
				'limit',
				filters.limit.toString()
			);
		if (filters.projectName)
			params.append(
				'projectName',
				filters.projectName
			);

		const queryString = params.toString();
		const url = `${API_BASE_URL}/api/projects${
			queryString ? `?${queryString}` : ''
		}`;

		const response = await fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type':
					'application/json',
			},
		});

		const data = await response.json();

		if (
			data.status === 'success' &&
			data.statusCode === 200
		) {
			return {
				statusCode: 200,
				data: {
					projects: data.data || [],
					pagination:
						data.pagination || {
							currentPage: 1,
							totalPages: 1,
							totalItems: 0,
							itemsPerPage: 10,
						},
				},
			};
		} else {
			return {
				statusCode:
					data.statusCode ||
					response.status,
				error:
					data.message ||
					`HTTP error! status: ${response.status}`,
			};
		}
	} catch {
		return {
			statusCode: 500,
			error: 'Failed to fetch projects',
		};
	}
};

export const getProjectById = async (
	id: string
): Promise<ApiResponse<Project>> => {
	try {
		const url = `${API_BASE_URL}/api/projects/${id}`;

		const response = await fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type':
					'application/json',
			},
		});

		const data = await response.json();

		if (
			data.status === 'success' &&
			data.statusCode === 200
		) {
			return {
				statusCode: 200,
				data: data.data,
			};
		} else {
			return {
				statusCode:
					data.statusCode ||
					response.status,
				error:
					data.message ||
					`HTTP error! status: ${response.status}`,
			};
		}
	} catch {
		return {
			statusCode: 500,
			error: 'Failed to fetch project details',
		};
	}
};

export const formatDate = (
	dateString: string
): string => {
	const date = new Date(dateString);
	return date.toLocaleDateString('id-ID', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});
};

export const formatDateShort = (
	dateString: string
): string => {
	const date = new Date(dateString);
	return date.toLocaleDateString('id-ID', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	});
};

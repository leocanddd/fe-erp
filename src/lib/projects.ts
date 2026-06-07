const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_URL ||
	'http://localhost:3001';

export interface Project {
	id: string;
	projectName: string;
	location: string;
	pic: string;
	contact: string;
	status?: string;
	username?: string;
	createdBy?: string;
	updatedBy?: string;
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

// Project Summary interfaces
export interface StatusCount {
	_id: string;
	count: number;
}

export interface SalesCount {
	_id: string;
	count: number;
}

export interface ProjectSummary {
	totalProjects: number;
	totalVisits: number;
	newProjects: number;
	projectsByStatus: StatusCount[];
	projectsBySales: SalesCount[];
	visitsBySales: SalesCount[];
}

export interface SummaryFilters {
	start_date?: string;
	end_date?: string;
	username?: string;
}

export const getProjectsSummary = async (
	filters: SummaryFilters = {}
): Promise<ApiResponse<ProjectSummary>> => {
	try {
		const params = new URLSearchParams();

		if (filters.start_date)
			params.append(
				'start_date',
				filters.start_date
			);
		if (filters.end_date)
			params.append(
				'end_date',
				filters.end_date
			);
		if (filters.username)
			params.append(
				'username',
				filters.username
			);

		const queryString = params.toString();
		const url = `${API_BASE_URL}/api/projects/summary${
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
			error: 'Failed to fetch project summary',
		};
	}
};

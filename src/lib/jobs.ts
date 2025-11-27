const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_URL ||
	'http://localhost:3001';

export interface Job {
	id: string;
	title: string;
	description: string;
	createdAt: string;
	updatedAt: string;
}

export interface CreateJobData {
	title: string;
	description: string;
}

export interface UpdateJobData {
	title?: string;
	description?: string;
}

interface ApiResponse<T> {
	status: string;
	statusCode: number;
	data?: T;
	error?: string;
	message?: string;
	pagination?: {
		currentPage: number;
		totalPages: number;
		totalItems: number;
		itemsPerPage: number;
	};
}

export const getJobs = async (
	page: number = 1,
	limit: number = 10,
	title?: string
): Promise<ApiResponse<Job[]>> => {
	try {
		const params = new URLSearchParams();
		params.append('page', page.toString());
		params.append('limit', limit.toString());
		if (title) params.append('title', title);

		const queryString = params.toString();
		const url = `${API_BASE_URL}/api/jobs?${queryString}`;

		const response = await fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		const data = await response.json();

		if (data.status === 'success' && data.statusCode === 200) {
			return {
				status: 'success',
				statusCode: 200,
				data: data.data,
				pagination: data.pagination,
			};
		} else {
			return {
				status: 'error',
				statusCode: data.statusCode || response.status,
				error: data.error || `HTTP error! status: ${response.status}`,
			};
		}
	} catch (error) {
		return {
			status: 'error',
			statusCode: 500,
			error: 'Failed to fetch jobs',
		};
	}
};

export const getJobById = async (id: string): Promise<ApiResponse<Job>> => {
	try {
		const response = await fetch(`${API_BASE_URL}/api/jobs/${id}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		const data = await response.json();

		if (data.status === 'success' && data.statusCode === 200) {
			return {
				status: 'success',
				statusCode: 200,
				data: data.data,
			};
		} else {
			return {
				status: 'error',
				statusCode: data.statusCode || response.status,
				error: data.error || 'Failed to fetch job',
			};
		}
	} catch (error) {
		return {
			status: 'error',
			statusCode: 500,
			error: 'Failed to fetch job',
		};
	}
};

export const createJob = async (
	jobData: CreateJobData
): Promise<ApiResponse<Job>> => {
	try {
		const response = await fetch(`${API_BASE_URL}/api/jobs`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(jobData),
		});

		const data = await response.json();

		if (data.status === 'success' && data.statusCode === 201) {
			return {
				status: 'success',
				statusCode: 201,
				data: data.data,
				message: data.message,
			};
		} else {
			return {
				status: 'error',
				statusCode: data.statusCode || response.status,
				error: data.error || 'Failed to create job',
			};
		}
	} catch (error) {
		return {
			status: 'error',
			statusCode: 500,
			error: 'Failed to create job',
		};
	}
};

export const updateJob = async (
	id: string,
	jobData: UpdateJobData
): Promise<ApiResponse<Job>> => {
	try {
		const response = await fetch(`${API_BASE_URL}/api/jobs/${id}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(jobData),
		});

		const data = await response.json();

		if (data.status === 'success' && data.statusCode === 200) {
			return {
				status: 'success',
				statusCode: 200,
				data: data.data,
				message: data.message,
			};
		} else {
			return {
				status: 'error',
				statusCode: data.statusCode || response.status,
				error: data.error || 'Failed to update job',
			};
		}
	} catch (error) {
		return {
			status: 'error',
			statusCode: 500,
			error: 'Failed to update job',
		};
	}
};

export const deleteJob = async (id: string): Promise<ApiResponse<null>> => {
	try {
		const response = await fetch(`${API_BASE_URL}/api/jobs/${id}`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		const data = await response.json();

		if (data.status === 'success' && data.statusCode === 200) {
			return {
				status: 'success',
				statusCode: 200,
				message: data.message,
			};
		} else {
			return {
				status: 'error',
				statusCode: data.statusCode || response.status,
				error: data.error || 'Failed to delete job',
			};
		}
	} catch (error) {
		return {
			status: 'error',
			statusCode: 500,
			error: 'Failed to delete job',
		};
	}
};

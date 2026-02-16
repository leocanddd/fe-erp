// Actual BE response shape: { key: string, url: string }
// Wrapped in a normalized shape for internal use
interface UploadResponse {
	key?: string;
	url?: string;
	error?: string;
}

const getApiUrl = () => {
	return (
		process.env.NEXT_PUBLIC_API_URL ||
		'http://localhost:8080'
	);
};

const getAuthToken = (): string | null => {
	if (typeof window === 'undefined') return null;
	return localStorage.getItem('accessToken');
};

/**
 * Upload a single file to /api/upload.
 * The backend expects multipart/form-data with a field named "file".
 *
 * @param file - The File object to upload
 * @returns UploadResponse with data.url on success
 */
export const uploadFile = async (
	file: File,
): Promise<UploadResponse> => {
	try {
		const formData = new FormData();
		formData.append('file', file);

		const token = getAuthToken();
		const headers: HeadersInit = {};
		if (token) {
			headers['Authorization'] = `Bearer ${token}`;
		}
		// NOTE: Do NOT set Content-Type manually — browser sets it automatically
		// with the correct multipart boundary when using FormData.

		const response = await fetch(
			`${getApiUrl()}/api/upload`,
			{
				method: 'POST',
				headers,
				body: formData,
			},
		);

		const data: UploadResponse =
			await response.json();
		return data;
	} catch {
		return {
			error: 'Network error occurred during upload',
		};
	}
};

export type { UploadResponse };

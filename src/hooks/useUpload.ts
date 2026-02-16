import { useState, useCallback } from 'react';
import { uploadFile, UploadResponse } from '@/lib/upload';

interface UseUploadState {
	uploading: boolean;
	uploadedUrl: string | null;
	uploadError: string | null;
}

interface UseUploadReturn extends UseUploadState {
	upload: (file: File) => Promise<string | null>;
	reset: () => void;
}

/**
 * Reusable hook for uploading files to /api/upload.
 *
 * Usage:
 *   const { upload, uploading, uploadedUrl, uploadError, reset } = useUpload();
 *
 *   // In an onChange handler:
 *   const url = await upload(file);   // returns the uploaded URL or null on failure
 */
export const useUpload = (): UseUploadReturn => {
	const [uploading, setUploading] =
		useState(false);
	const [uploadedUrl, setUploadedUrl] =
		useState<string | null>(null);
	const [uploadError, setUploadError] =
		useState<string | null>(null);

	const upload = useCallback(
		async (file: File): Promise<string | null> => {
			setUploading(true);
			setUploadError(null);

			const response: UploadResponse =
				await uploadFile(file);

			setUploading(false);

			// BE returns { key, url } directly on success
			if (response.url) {
				setUploadedUrl(response.url);
				return response.url;
			}

			const errorMsg =
				response.error || 'Upload gagal';
			setUploadError(errorMsg);
			return null;
		},
		[],
	);

	const reset = useCallback(() => {
		setUploading(false);
		setUploadedUrl(null);
		setUploadError(null);
	}, []);

	return {
		upload,
		uploading,
		uploadedUrl,
		uploadError,
		reset,
	};
};

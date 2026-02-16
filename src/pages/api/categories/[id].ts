import type { NextApiRequest, NextApiResponse } from 'next';

const BACKEND_URL = process.env.API_URL || 'http://localhost:8080';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const { id } = req.query;
	const token = req.headers.authorization;

	try {
		if (req.method === 'GET') {
			const response = await fetch(`${BACKEND_URL}/api/categories/${id}`, {
				headers: {
					Authorization: token || '',
				},
			});

			if (!response.ok) {
				const error = await response.json();
				return res.status(response.status).json(error);
			}

			const data = await response.json();
			return res.status(200).json(data);
		} else if (req.method === 'PUT') {
			const response = await fetch(`${BACKEND_URL}/api/categories/${id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: token || '',
				},
				body: JSON.stringify(req.body),
			});

			if (!response.ok) {
				const error = await response.json();
				return res.status(response.status).json(error);
			}

			const data = await response.json();
			return res.status(200).json(data);
		} else if (req.method === 'DELETE') {
			const response = await fetch(`${BACKEND_URL}/api/categories/${id}`, {
				method: 'DELETE',
				headers: {
					Authorization: token || '',
				},
			});

			if (!response.ok) {
				const error = await response.json();
				return res.status(response.status).json(error);
			}

			const data = await response.json();
			return res.status(200).json(data);
		} else {
			return res.status(405).json({ message: 'Method not allowed' });
		}
	} catch (error) {
		console.error('Category API error:', error);
		return res.status(500).json({ message: 'Internal server error' });
	}
}

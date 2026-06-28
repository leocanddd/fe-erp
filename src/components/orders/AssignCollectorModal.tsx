import React, { useState, useEffect } from 'react';
import { assignCollectorToOrder } from '@/lib/orders';
import type { Order } from '@/lib/orders';
import { getCollectors, type Assignee } from '@/lib/kolektor';

interface AssignCollectorModalProps {
	order: Order;
	isOpen: boolean;
	onClose: () => void;
	onSuccess: (arCreated: boolean, arId?: string) => void;
}

interface User {
	id: string;
	firstName: string;
	lastName: string;
}

const getApiUrl = () => {
	return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
};

const getAuthHeaders = () => {
	const token = localStorage.getItem('accessToken');
	return {
		'Content-Type': 'application/json',
		...(token && { Authorization: `Bearer ${token}` }),
	};
};

export const AssignCollectorModal: React.FC<AssignCollectorModalProps> = ({
	order,
	isOpen,
	onClose,
	onSuccess,
}) => {
	const [collector, setCollector] = useState('');
	const [selectedSP, setSelectedSP] = useState('');
	const [collectors, setCollectors] = useState<Assignee[]>([]);
	const [salespeople, setSalespeople] = useState<
		Array<{ id: string; name: string }>
	>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	useEffect(() => {
		const fetchData = async () => {
			try {
				// Fetch collectors
				const collectorsResponse = await getCollectors();
				if (collectorsResponse.status === 'success' && collectorsResponse.data) {
					setCollectors(collectorsResponse.data);
				}

				// Fetch salespeople
				const response = await fetch(
					`${getApiUrl()}/api/users?role=2`,
					{
						method: 'GET',
						headers: getAuthHeaders(),
					}
				);
				const data = await response.json();
				if (data.status === 'success' && data.data) {
					setSalespeople(
						data.data.map((user: User) => ({
							id: user.id,
							name: `${user.firstName} ${user.lastName}`,
						}))
					);
				}
			} catch (err) {
				console.error('Failed to fetch data:', err);
			}
		};

		if (isOpen) {
			fetchData();
		}
	}, [isOpen]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError('');

		try {
			const response = await assignCollectorToOrder(
				order.id!,
				collector,
				selectedSP
			);

			if (response.data.arCreated) {
				onSuccess(true, response.data.ar?.id);
			} else {
				onSuccess(false);
			}

			onClose();
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to assign collector');
		} finally {
			setLoading(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
			<div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
				<div className="p-6">
					<h2 className="text-xl font-semibold mb-4">
						Assign Collector to Order {order.orderId}
					</h2>

					<form onSubmit={handleSubmit}>
						<div className="mb-4">
							<label
								htmlFor="collector"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								Collector *
							</label>
							<select
								id="collector"
								value={collector}
								onChange={(e) => setCollector(e.target.value)}
								required
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							>
								<option value="">Select collector</option>
								{collectors.map((col) => (
									<option key={col.name} value={col.name}>
										{col.name}
									</option>
								))}
							</select>
						</div>

						<div className="mb-4">
							<label
								htmlFor="salesperson"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								Salesperson *
							</label>
							<select
								id="salesperson"
								value={selectedSP}
								onChange={(e) => setSelectedSP(e.target.value)}
								required
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							>
								<option value="">Select salesperson</option>
								{salespeople.map((sp) => (
									<option key={sp.id} value={sp.id}>
										{sp.name}
									</option>
								))}
							</select>
						</div>

						{error && (
							<div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
								{error}
							</div>
						)}

						<div className="flex justify-end gap-3">
							<button
								type="button"
								onClick={onClose}
								disabled={loading}
								className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
							>
								Cancel
							</button>
							<button
								type="submit"
								disabled={loading}
								className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
							>
								{loading ? 'Assigning...' : 'Assign Collector'}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

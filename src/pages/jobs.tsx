import MainLayout from '@/components/MainLayout';
import {
	createJob,
	CreateJobData,
	deleteJob,
	getJobs,
	Job,
	updateJob,
	UpdateJobData,
} from '@/lib/jobs';
import { useCallback, useEffect, useState } from 'react';

export default function Jobs() {
	const [jobs, setJobs] = useState<Job[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [titleFilter, setTitleFilter] = useState('');
	const [showModal, setShowModal] = useState(false);
	const [editingJob, setEditingJob] = useState<Job | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [totalItems, setTotalItems] = useState(0);
	const [itemsPerPage, setItemsPerPage] = useState(10);

	const [jobData, setJobData] = useState<CreateJobData>({
		title: '',
		department: '',
		location: '',
		locations: [],
		type: 'Full Time',
		salaryRange: '',
		probationPeriod: '',
		intro: '',
		responsibilities: [],
		qualifications: [],
		outro: '',
		isActive: true,
	});

	const fetchJobs = useCallback(async () => {
		setLoading(true);
		try {
			const response = await getJobs(currentPage, itemsPerPage, titleFilter || undefined);
			if (response.status === 'success' && response.statusCode === 200) {
				setJobs(response.data || []);
				if (response.pagination) {
					setTotalPages(response.pagination.totalPages);
					setTotalItems(response.pagination.totalItems);
				}
				setError('');
			} else {
				setError(response.error || 'Failed to fetch jobs');
				setJobs([]);
			}
		} catch {
			setError('Failed to fetch jobs');
			setJobs([]);
		} finally {
			setLoading(false);
		}
	}, [currentPage, itemsPerPage, titleFilter]);

	useEffect(() => {
		fetchJobs();
	}, [fetchJobs]);

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		setCurrentPage(1);
		fetchJobs();
	};

	const clearFilters = () => {
		setTitleFilter('');
		setCurrentPage(1);
	};

	const handleCreateJob = async (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitting(true);

		try {
			const result = await createJob(jobData);
			if (result.status === 'success' && result.statusCode === 201) {
				setShowModal(false);
				setJobData({
					title: '',
					department: '',
					location: '',
					locations: [],
					type: 'Full Time',
					salaryRange: '',
					probationPeriod: '',
					intro: '',
					responsibilities: [],
					qualifications: [],
					outro: '',
					isActive: true,
				});
				fetchJobs();
				setError('');
			} else {
				setError(result.error || 'Failed to create job');
			}
		} catch {
			setError('Failed to create job');
		} finally {
			setSubmitting(false);
		}
	};

	const handleEditJob = (job: Job) => {
		setEditingJob(job);
		setJobData({
			title: job.title,
			department: job.department,
			location: job.location,
			locations: job.locations,
			type: job.type,
			salaryRange: job.salaryRange,
			probationPeriod: job.probationPeriod,
			intro: job.intro,
			responsibilities: job.responsibilities,
			qualifications: job.qualifications,
			outro: job.outro,
			isActive: job.isActive,
		});
		setShowModal(true);
	};

	const handleUpdateJob = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!editingJob) return;

		setSubmitting(true);

		try {
			const updateData: UpdateJobData = {
				title: jobData.title,
				department: jobData.department,
				location: jobData.location,
				locations: jobData.locations,
				type: jobData.type,
				salaryRange: jobData.salaryRange,
				probationPeriod: jobData.probationPeriod,
				intro: jobData.intro,
				responsibilities: jobData.responsibilities,
				qualifications: jobData.qualifications,
				outro: jobData.outro,
				isActive: jobData.isActive,
			};

			const result = await updateJob(editingJob._id, updateData);
			if (result.status === 'success' && result.statusCode === 200) {
				setShowModal(false);
				setEditingJob(null);
				setJobData({
					title: '',
					department: '',
					location: '',
					locations: [],
					type: 'Full Time',
					salaryRange: '',
					probationPeriod: '',
					intro: '',
					responsibilities: [],
					qualifications: [],
					outro: '',
					isActive: true,
				});
				fetchJobs();
				setError('');
			} else {
				setError(result.error || 'Failed to update job');
			}
		} catch {
			setError('Failed to update job');
		} finally {
			setSubmitting(false);
		}
	};

	const handleDeleteJob = async (id: string) => {
		setSubmitting(true);
		try {
			const result = await deleteJob(id);
			if (result.status === 'success' && result.statusCode === 200) {
				setDeleteConfirm(null);
				fetchJobs();
				setError('');
			} else {
				setError(result.error || 'Failed to delete job');
			}
		} catch {
			setError('Failed to delete job');
		} finally {
			setSubmitting(false);
		}
	};

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
	};

	return (
		<>
			<MainLayout title="Jobs">
				<div className="max-w-7xl mx-auto">
					{/* Header */}
					<div className="mb-8 flex justify-between items-center">
						<div>
							<h2 className="text-2xl font-bold text-gray-900 mb-2">
								Jobs
							</h2>
							<p className="text-gray-600">Kelola daftar lowongan pekerjaan</p>
						</div>
						<button
							onClick={() => {
								setEditingJob(null);
								setJobData({
									title: '',
									department: '',
									location: '',
									locations: [],
									type: 'Full Time',
									salaryRange: '',
									probationPeriod: '',
									intro: '',
									responsibilities: [],
									qualifications: [],
									outro: '',
									isActive: true,
								});
								setShowModal(true);
							}}
							className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
						>
							+ Tambah Job
						</button>
					</div>

					{/* Filters */}
					<div className="mb-6 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
						<form onSubmit={handleSearch} className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div className="md:col-span-2">
									<label
										htmlFor="title"
										className="block text-sm font-medium text-gray-700 mb-2"
									>
										Judul Pekerjaan
									</label>
									<input
										type="text"
										id="title"
										value={titleFilter}
										onChange={(e) => setTitleFilter(e.target.value)}
										placeholder="Cari berdasarkan judul..."
										className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
									/>
								</div>
								<div className="flex items-end space-x-2">
									<button
										type="submit"
										className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
									>
										Filter
									</button>
									<button
										type="button"
										onClick={clearFilters}
										className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors duration-200"
									>
										Clear
									</button>
								</div>
							</div>
						</form>
					</div>

					{error && (
						<div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
							<div className="text-sm text-red-600 font-medium">{error}</div>
						</div>
					)}

					{/* Jobs table */}
					<div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
						{loading ? (
							<div className="p-8 text-center">
								<div className="inline-flex items-center space-x-3">
									<div className="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
									<span className="text-gray-600">Memuat jobs...</span>
								</div>
							</div>
						) : jobs.length === 0 ? (
							<div className="p-8 text-center text-gray-500">
								Tidak ada job yang ditemukan
							</div>
						) : (
							<div className="overflow-x-auto">
								<table className="min-w-full divide-y divide-gray-200">
									<thead className="bg-gray-50">
										<tr>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Judul
											</th>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Department
											</th>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Lokasi
											</th>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Type
											</th>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Salary Range
											</th>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Status
											</th>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Actions
											</th>
										</tr>
									</thead>
									<tbody className="bg-white divide-y divide-gray-200">
										{jobs.map((job) => (
											<tr key={job._id} className="hover:bg-gray-50">
												<td className="px-6 py-4 whitespace-nowrap">
													<div className="text-sm font-medium text-gray-900">
														{job.title}
													</div>
												</td>
												<td className="px-6 py-4 whitespace-nowrap">
													<div className="text-sm text-gray-900">
														{job.department}
													</div>
												</td>
												<td className="px-6 py-4 whitespace-nowrap">
													<div className="text-sm text-gray-900">
														{job.location}
													</div>
												</td>
												<td className="px-6 py-4 whitespace-nowrap">
													<div className="text-sm text-gray-900">
														{job.type}
													</div>
												</td>
												<td className="px-6 py-4 whitespace-nowrap">
													<div className="text-sm text-gray-900">
														{job.salaryRange}
													</div>
												</td>
												<td className="px-6 py-4 whitespace-nowrap">
													<span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
														job.isActive
															? 'bg-green-100 text-green-800'
															: 'bg-gray-100 text-gray-800'
													}`}>
														{job.isActive ? 'Active' : 'Inactive'}
													</span>
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
													<div className="flex space-x-2">
														<button
															onClick={() => handleEditJob(job)}
															className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200"
															title="Edit job"
														>
															<svg
																className="w-5 h-5"
																fill="none"
																stroke="currentColor"
																viewBox="0 0 24 24"
															>
																<path
																	strokeLinecap="round"
																	strokeLinejoin="round"
																	strokeWidth={2}
																	d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
																/>
															</svg>
														</button>
														<button
															onClick={() => setDeleteConfirm(job._id)}
															className="text-red-600 hover:text-red-900 transition-colors duration-200"
															title="Delete job"
														>
															<svg
																className="w-5 h-5"
																fill="none"
																stroke="currentColor"
																viewBox="0 0 24 24"
															>
																<path
																	strokeLinecap="round"
																	strokeLinejoin="round"
																	strokeWidth={2}
																	d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
																/>
															</svg>
														</button>
													</div>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</div>

					{/* Pagination */}
					{!loading && totalPages > 1 && (
						<div className="mt-6 bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20">
							<div className="flex items-center justify-between">
								<div className="text-sm text-gray-600">
									Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
									{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}{' '}
									results
								</div>
								<div className="flex space-x-2">
									<button
										onClick={() => handlePageChange(currentPage - 1)}
										disabled={currentPage === 1}
										className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
									>
										Previous
									</button>
									{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
										<button
											key={page}
											onClick={() => handlePageChange(page)}
											className={`px-3 py-1 rounded-lg ${
												currentPage === page
													? 'bg-blue-600 text-white'
													: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
											}`}
										>
											{page}
										</button>
									))}
									<button
										onClick={() => handlePageChange(currentPage + 1)}
										disabled={currentPage === totalPages}
										className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
									>
										Next
									</button>
								</div>
							</div>
						</div>
					)}

					{/* Summary */}
					{!loading && jobs.length > 0 && (
						<div className="mt-6 bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20">
							<div className="text-sm text-gray-600">
								Total jobs ditemukan:{' '}
								<span className="font-semibold text-gray-900">{totalItems}</span>
							</div>
						</div>
					)}
				</div>
			</MainLayout>

			{/* Create/Edit Job Modal */}
			{showModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
						<div className="flex justify-between items-center mb-6">
							<h3 className="text-lg font-semibold text-gray-900">
								{editingJob ? 'Edit Job' : 'Tambah Job Baru'}
							</h3>
							<button
								onClick={() => {
									setShowModal(false);
									setEditingJob(null);
									setJobData({
										title: '',
										department: '',
										location: '',
										locations: [],
										type: 'Full Time',
										salaryRange: '',
										probationPeriod: '',
										intro: '',
										responsibilities: [],
										qualifications: [],
										outro: '',
										isActive: true,
									});
								}}
								className="text-gray-400 hover:text-gray-600 transition-colors"
							>
								<svg
									className="w-6 h-6"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</button>
						</div>
						<form
							onSubmit={editingJob ? handleUpdateJob : handleCreateJob}
							className="space-y-4"
						>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Judul Pekerjaan *
									</label>
									<input
										type="text"
										required
										value={jobData.title}
										onChange={(e) =>
											setJobData((prev) => ({ ...prev, title: e.target.value }))
										}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Department *
									</label>
									<input
										type="text"
										required
										value={jobData.department}
										onChange={(e) =>
											setJobData((prev) => ({ ...prev, department: e.target.value }))
										}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
									/>
								</div>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Type *
									</label>
									<select
										required
										value={jobData.type}
										onChange={(e) =>
											setJobData((prev) => ({ ...prev, type: e.target.value }))
										}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
									>
										<option value="Full Time">Full Time</option>
										<option value="Part Time">Part Time</option>
										<option value="Contract">Contract</option>
										<option value="Internship">Internship</option>
									</select>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Probation Period *
									</label>
									<input
										type="text"
										required
										placeholder="e.g., 3 Months"
										value={jobData.probationPeriod}
										onChange={(e) =>
											setJobData((prev) => ({ ...prev, probationPeriod: e.target.value }))
										}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
									/>
								</div>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Primary Location *
									</label>
									<input
										type="text"
										required
										value={jobData.location}
										onChange={(e) =>
											setJobData((prev) => ({ ...prev, location: e.target.value }))
										}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Salary Range *
									</label>
									<input
										type="text"
										required
										placeholder="e.g., Rp 5,000,000 - Rp 7,000,000"
										value={jobData.salaryRange}
										onChange={(e) =>
											setJobData((prev) => ({ ...prev, salaryRange: e.target.value }))
										}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
									/>
								</div>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Additional Locations (comma-separated)
								</label>
								<input
									type="text"
									placeholder="e.g., Jakarta Barat, Tangerang Kota"
									value={jobData.locations.join(', ')}
									onChange={(e) =>
										setJobData((prev) => ({
											...prev,
											locations: e.target.value.split(',').map(s => s.trim()).filter(s => s),
										}))
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Introduction *
								</label>
								<textarea
									required
									rows={3}
									value={jobData.intro}
									onChange={(e) =>
										setJobData((prev) => ({
											...prev,
											intro: e.target.value,
										}))
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Responsibilities (one per line) *
								</label>
								<textarea
									required
									rows={5}
									placeholder="Enter each responsibility on a new line"
									value={jobData.responsibilities.join('\n')}
									onChange={(e) =>
										setJobData((prev) => ({
											...prev,
											responsibilities: e.target.value.split('\n').filter(s => s.trim()),
										}))
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Qualifications (one per line) *
								</label>
								<textarea
									required
									rows={5}
									placeholder="Enter each qualification on a new line"
									value={jobData.qualifications.join('\n')}
									onChange={(e) =>
										setJobData((prev) => ({
											...prev,
											qualifications: e.target.value.split('\n').filter(s => s.trim()),
										}))
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Closing Statement *
								</label>
								<textarea
									required
									rows={3}
									value={jobData.outro}
									onChange={(e) =>
										setJobData((prev) => ({
											...prev,
											outro: e.target.value,
										}))
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
								/>
							</div>

							<div className="flex items-center">
								<input
									type="checkbox"
									id="isActive"
									checked={jobData.isActive}
									onChange={(e) =>
										setJobData((prev) => ({ ...prev, isActive: e.target.checked }))
									}
									className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
								/>
								<label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
									Active Job Posting
								</label>
							</div>

							<div className="flex space-x-3 pt-4">
								<button
									type="button"
									onClick={() => {
										setShowModal(false);
										setEditingJob(null);
										setJobData({
											title: '',
											department: '',
											location: '',
											locations: [],
											type: 'Full Time',
											salaryRange: '',
											probationPeriod: '',
											intro: '',
											responsibilities: [],
											qualifications: [],
											outro: '',
											isActive: true,
										});
									}}
									className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
								>
									Cancel
								</button>
								<button
									type="submit"
									disabled={submitting}
									className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
								>
									{submitting
										? editingJob
											? 'Updating...'
											: 'Creating...'
										: editingJob
										? 'Update Job'
										: 'Create Job'}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Delete Confirmation Modal */}
			{deleteConfirm && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
						<div className="mb-4">
							<h3 className="text-lg font-semibold text-gray-900 mb-2">
								Konfirmasi Hapus
							</h3>
							<p className="text-gray-600">
								Apakah Anda yakin ingin menghapus job ini? Tindakan ini tidak dapat
								dibatalkan.
							</p>
						</div>
						<div className="flex space-x-3">
							<button
								onClick={() => setDeleteConfirm(null)}
								disabled={submitting}
								className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
							>
								Cancel
							</button>
							<button
								onClick={() => handleDeleteJob(deleteConfirm)}
								disabled={submitting}
								className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
							>
								{submitting ? 'Deleting...' : 'Delete'}
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}

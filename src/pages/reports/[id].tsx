import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import MainLayout from '@/components/MainLayout';
import { getVisitById, Visit, formatVisitDateOnly, formatVisitTimeOnly } from '@/lib/visits';

export default function VisitDetail() {
	const router = useRouter();
	const { id } = router.query;
	const [visit, setVisit] = useState<Visit | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		if (id && typeof id === 'string') {
			fetchVisitDetail(id);
		}
	}, [id]);

	const fetchVisitDetail = async (visitId: string) => {
		setLoading(true);
		try {
			const response = await getVisitById(visitId);
			if (response.statusCode === 200 && response.data) {
				setVisit(response.data);
				setError('');
			} else {
				setError(response.error || 'Failed to fetch visit details');
				setVisit(null);
			}
		} catch {
			setError('Failed to fetch visit details');
			setVisit(null);
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<MainLayout title="Detail Kunjungan">
				<style jsx>{`
					.loading-container {
						padding: 80px 32px;
						text-align: center;
					}
					.loading-spinner {
						display: inline-block;
						width: 32px;
						height: 32px;
						border: 3px solid #e0e0e0;
						border-top-color: #1ca7ec;
						border-radius: 50%;
						animation: spin 0.8s linear infinite;
					}
					@keyframes spin {
						to {
							transform: rotate(360deg);
						}
					}
					.loading-text {
						margin-top: 16px;
						font-weight: 500;
						font-size: 14px;
						color: #9a9a9a;
					}
				`}</style>
				<div className="loading-container">
					<div className="loading-spinner"></div>
					<div className="loading-text">Loading visit details...</div>
				</div>
			</MainLayout>
		);
	}

	if (error || !visit) {
		return (
			<MainLayout title="Detail Kunjungan">
				<style jsx>{`
					.back-link {
						display: inline-flex;
						align-items: center;
						gap: 6px;
						font-weight: 600;
						font-size: 13px;
						text-decoration: none;
						margin-bottom: 20px;
						transition: color 0.2s ease;
					}
					:global(.back-link) {
						color: #1ca7ec !important;
					}
					:global(.back-link:hover) {
						color: #1590cd !important;
					}
					.back-icon {
						width: 16px;
						height: 16px;
					}
					.error-card {
						background: #fff5f5;
						border: 1px solid #feb2b2;
						border-radius: 12px;
						padding: 24px;
						text-align: center;
					}
					.error-text {
						font-weight: 600;
						font-size: 14px;
						color: #c53030;
					}
				`}</style>
				<div>
					<Link href="/reports" className="back-link">
						<svg className="back-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
						</svg>
						Back to Reports
					</Link>
					<div className="error-card">
						<div className="error-text">
							{error || 'Visit not found'}
						</div>
					</div>
				</div>
			</MainLayout>
		);
	}

	return (
		<MainLayout title="Detail Kunjungan">
			<style jsx>{`
				.back-link {
					display: inline-flex;
					align-items: center;
					gap: 6px;
					font-weight: 600;
					font-size: 13px;
					text-decoration: none;
					margin-bottom: 20px;
					transition: color 0.2s ease;
				}
				:global(.back-link) {
					color: #1ca7ec !important;
				}
				:global(.back-link:hover) {
					color: #1590cd !important;
				}
				.back-icon {
					width: 16px;
					height: 16px;
				}
				.detail-card {
					background: #ffffff;
					border: 1px solid #e0e0e0;
					border-radius: 12px;
					box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
					overflow: hidden;
				}
				.card-header {
					background: linear-gradient(90deg, #61bedf 0%, #1ca7ec 50%, #1590cd 100%);
					padding: 24px 28px;
					display: flex;
					align-items: center;
					gap: 16px;
				}
				.avatar-large {
					flex: 0 0 72px;
					width: 72px;
					height: 72px;
					border-radius: 50%;
					background: #ffffff;
					display: flex;
					align-items: center;
					justify-content: center;
					font-weight: 700;
					font-size: 28px;
					color: #1ca7ec;
					box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
				}
				.header-info {
					flex: 1;
				}
				.sales-name {
					font-weight: 700;
					font-size: 24px;
					color: #ffffff;
					margin: 0 0 4px 0;
				}
				.sales-username {
					font-weight: 500;
					font-size: 14px;
					color: rgba(255, 255, 255, 0.9);
				}
				.card-body {
					padding: 24px 28px;
				}
				.info-grid {
					display: grid;
					grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
					gap: 20px;
				}
				.info-item {
					padding-bottom: 16px;
					border-bottom: 1px solid #f4f6f9;
				}
				.info-label {
					font-weight: 600;
					font-size: 11px;
					text-transform: uppercase;
					letter-spacing: 0.04em;
					color: #9a9a9a;
					margin-bottom: 8px;
				}
				.info-value {
					font-weight: 500;
					font-size: 15px;
					color: #111111;
					line-height: 1.5;
				}
				.info-value.large {
					font-weight: 600;
					font-size: 16px;
				}
				.meta-section {
					margin-top: 24px;
					padding-top: 20px;
					border-top: 1px solid #e0e0e0;
				}
				.meta-title {
					font-weight: 700;
					font-size: 13px;
					color: #111111;
					margin-bottom: 12px;
				}
				.meta-item {
					display: flex;
					justify-content: space-between;
					padding: 8px 0;
					font-size: 13px;
				}
				.meta-label {
					font-weight: 500;
					color: #9a9a9a;
				}
				.meta-value {
					font-weight: 600;
					color: #111111;
				}
			`}</style>
			<div>
				<Link href="/reports" className="back-link">
					<svg className="back-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
					</svg>
					Back to Reports
				</Link>

				<div className="detail-card">
					{/* Header with gradient */}
					<div className="card-header">
						<div className="avatar-large">
							{visit.username.charAt(0).toUpperCase()}
						</div>
						<div className="header-info">
							<h1 className="sales-name">{visit.name}</h1>
							<div className="sales-username">@{visit.username}</div>
						</div>
					</div>

					{/* Body */}
					<div className="card-body">
						<div className="info-grid">
							<div className="info-item">
								<div className="info-label">Store</div>
								<div className="info-value large">{visit.store}</div>
							</div>

							<div className="info-item">
								<div className="info-label">Location</div>
								<div className="info-value">{visit.location}</div>
							</div>

							<div className="info-item">
								<div className="info-label">Date</div>
								<div className="info-value">{formatVisitDateOnly(visit)}</div>
							</div>

							<div className="info-item">
								<div className="info-label">Time</div>
								<div className="info-value">{formatVisitTimeOnly(visit)}</div>
							</div>

							<div className="info-item">
								<div className="info-label">Description</div>
								<div className="info-value">{visit.description}</div>
							</div>

							<div className="info-item">
								<div className="info-label">Result</div>
								<div className="info-value">{visit.result}</div>
							</div>

							<div className="info-item">
								<div className="info-label">Notes</div>
								<div className="info-value">{visit.notes}</div>
							</div>

							{visit.orderId && (
								<div className="info-item">
									<div className="info-label">Order ID</div>
									<div className="info-value">{visit.orderId}</div>
								</div>
							)}
						</div>

						{/* Meta Section */}
						<div className="meta-section">
							<div className="meta-title">Visit Metadata</div>
							<div className="meta-item">
								<span className="meta-label">Created</span>
								<span className="meta-value">
									{new Date(visit.createdAt).toLocaleDateString('id-ID', {
										year: 'numeric',
										month: 'short',
										day: 'numeric',
										hour: '2-digit',
										minute: '2-digit',
									})}
								</span>
							</div>
							<div className="meta-item">
								<span className="meta-label">Last Updated</span>
								<span className="meta-value">
									{new Date(visit.updatedAt).toLocaleDateString('id-ID', {
										year: 'numeric',
										month: 'short',
										day: 'numeric',
										hour: '2-digit',
										minute: '2-digit',
									})}
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</MainLayout>
	);
}
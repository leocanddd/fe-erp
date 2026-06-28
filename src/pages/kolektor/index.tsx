import MainLayout from '@/components/MainLayout';
import {
	assignCollector,
	formatCurrency as formatCurrencyUtil,
	getCollectors,
	getFunnelMetrics,
	getPerformanceMetrics,
	getReceivables,
	getVisitMetrics,
	type Assignee,
	type FunnelMetrics,
	type PerformanceMetrics,
	type Period,
	type ReceivableItem,
	type VisitMetrics,
} from '@/lib/kolektor';
import {
	useEffect,
	useState,
} from 'react';
import {
	Cell,
	Legend,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
} from 'recharts';

// Color palette for collectors
const COLLECTOR_COLORS = ['#121567', '#1590CD', '#1CA7EC', '#61BEDF', '#A9DCF0', '#7DD3FC', '#38BDF8'];

export default function KolektorDashboard() {
	const [activeCards, setActiveCards] =
		useState({
			overdue: true,
			due2w: true,
			sales: true,
			visits: true,
			visits2: true,
		});

	const [
		activeCollectors,
		setActiveCollectors,
	] = useState<number[]>([]);
	const [viewMode, setViewMode] =
		useState<Period>('monthly');
	const [currentDate] = useState(
		new Date(),
	);

	// API Data States
	const [overdueData, setOverdueData] =
		useState<ReceivableItem[]>([]);
	const [
		overdueSummary,
		setOverdueSummary,
	] = useState({
		totalAmount: 0,
		assignedCount: 0,
		unassignedCount: 0,
	});
	const [due2wData, setDue2wData] =
		useState<ReceivableItem[]>([]);
	const [
		due2wSummary,
		setDue2wSummary,
	] = useState({
		totalAmount: 0,
		assignedCount: 0,
		unassignedCount: 0,
	});
	const [
		performanceData,
		setPerformanceData,
	] =
		useState<PerformanceMetrics | null>(
			null,
		);
	const [visitData, setVisitData] =
		useState<VisitMetrics | null>(null);
	const [funnelData, setFunnelData] =
		useState<FunnelMetrics | null>(
			null,
		);
	const [
		collectorsList,
		setCollectorsList,
	] = useState<Assignee[]>([]);
	const [loading, setLoading] =
		useState(true);

	const toggleCard = (
		cardKey: keyof typeof activeCards,
	) => {
		setActiveCards((prev) => ({
			...prev,
			[cardKey]: !prev[cardKey],
		}));
	};

	const toggleCollector = (
		id: number,
	) => {
		setActiveCollectors((prev) =>
			prev.includes(id)
				? prev.filter(
						(cid) => cid !== id,
					)
				: [...prev, id],
		);
	};

	const formatCurrency = (
		value: number,
	): string => {
		return formatCurrencyUtil(value);
	};

	const formatDate = (
		date: Date,
	): string => {
		return date.toLocaleDateString(
			'id-ID',
			{
				day: '2-digit',
				month: 'short',
				year: 'numeric',
			},
		);
	};

	// Fetch all data
	useEffect(() => {
		const fetchAllData = async () => {
			setLoading(true);
			try {
				// Fetch receivables
				const [overdueRes, due2wRes] =
					await Promise.all([
						getReceivables('overdue'),
						getReceivables('due2w'),
					]);

				if (
					overdueRes.statusCode ===
						200 &&
					overdueRes.data
				) {
					setOverdueData(
						overdueRes.data.items,
					);
					setOverdueSummary(
						overdueRes.data.summary,
					);
				}

				if (
					due2wRes.statusCode === 200 &&
					due2wRes.data
				) {
					setDue2wData(
						due2wRes.data.items,
					);
					setDue2wSummary(
						due2wRes.data.summary,
					);
				}

				// Fetch collectors list
				const collectorsRes =
					await getCollectors();
				if (
					collectorsRes.statusCode ===
						200 &&
					collectorsRes.data
				) {
					setCollectorsList(
						collectorsRes.data,
					);
				}
			} catch (error) {
				console.error(
					'Error fetching data:',
					error,
				);
			} finally {
				setLoading(false);
			}
		};

		fetchAllData();
	}, []);

	// Set all collectors as active when performance data loads
	useEffect(() => {
		if (performanceData && performanceData.byCollector.length > 0) {
			const allCollectorIds = performanceData.byCollector.map(c => c.id);
			setActiveCollectors(allCollectorIds);
		}
	}, [performanceData]);

	// Fetch performance data when viewMode changes
	useEffect(() => {
		const fetchPerformance =
			async () => {
				const res =
					await getPerformanceMetrics(
						viewMode,
					);
				if (
					res.statusCode === 200 &&
					res.data
				) {
					setPerformanceData(res.data);
				}
			};
		fetchPerformance();
	}, [viewMode]);

	// Fetch visit data when viewMode changes
	useEffect(() => {
		const fetchVisits = async () => {
			const res =
				await getVisitMetrics(viewMode);
			if (
				res.statusCode === 200 &&
				res.data
			) {
				setVisitData(res.data);
			}
		};
		fetchVisits();
	}, [viewMode]);

	// Fetch funnel data when viewMode or activeCollectors changes
	useEffect(() => {
		const fetchFunnel = async () => {
			const res =
				await getFunnelMetrics(
					viewMode,
					activeCollectors,
				);
			if (
				res.statusCode === 200 &&
				res.data
			) {
				setFunnelData(res.data);
			}
		};
		fetchFunnel();
	}, [viewMode, activeCollectors]);

	// Handle assign collector
	const handleAssignCollector = async (
		receivableId: string,
		collectorUsername: string,
	) => {
		try {
			const res = await assignCollector(
				receivableId,
				collectorUsername,
			);
			if (res.statusCode === 200) {
				// Refresh receivables data
				const overdueRes =
					await getReceivables(
						'overdue',
					);
				const due2wRes =
					await getReceivables('due2w');

				if (
					overdueRes.statusCode ===
						200 &&
					overdueRes.data
				) {
					setOverdueData(
						overdueRes.data.items,
					);
					setOverdueSummary(
						overdueRes.data.summary,
					);
				}

				if (
					due2wRes.statusCode === 200 &&
					due2wRes.data
				) {
					setDue2wData(
						due2wRes.data.items,
					);
					setDue2wSummary(
						due2wRes.data.summary,
					);
				}

				alert(
					'Collector assigned successfully!',
				);
			} else {
				alert(`Error: ${res.error}`);
			}
		} catch (error) {
			alert(
				'Failed to assign collector',
			);
			console.error(error);
		}
	};

	return (
		<MainLayout>
			<div className="kolektor-dashboard">
				{/* Welcome Section */}
				<div className="welcome">
					<div>
						<h1>Dashboard</h1>
						<div className="date">
							{formatDate(currentDate)}
						</div>
					</div>
					<div className="role">
						Superadmin
					</div>
				</div>

				{/* Filter Pills */}
				<div className="filter-row">
					<button
						className={`fpill ${activeCards.overdue ? 'active' : ''}`}
						onClick={() =>
							toggleCard('overdue')
						}
					>
						<span className="dot"></span>
						Overdue
					</button>
					<button
						className={`fpill ${activeCards.due2w ? 'active' : ''}`}
						onClick={() =>
							toggleCard('due2w')
						}
					>
						<span className="dot"></span>
						Due 2 Weeks
					</button>
					<button
						className={`fpill ${activeCards.sales ? 'active' : ''}`}
						onClick={() =>
							toggleCard('sales')
						}
					>
						<span className="dot"></span>
						Collection
					</button>
					<button
						className={`fpill ${activeCards.visits ? 'active' : ''}`}
						onClick={() =>
							toggleCard('visits')
						}
					>
						<span className="dot"></span>
						Visits
					</button>
					<button
						className={`fpill ${activeCards.visits2 ? 'active' : ''}`}
						onClick={() =>
							toggleCard('visits2')
						}
					>
						<span className="dot"></span>
						Funnel
					</button>
				</div>

				{/* Cards Stack */}
				<div className="cards-stack">
					{/* Overdue Card */}
					{activeCards.overdue && (
						<section
							className="scard"
							data-card="overdue"
						>
							<div className="scard-head">
								<div className="scard-titlewrap">
									<h2 className="scard-title">
										Overdue
									</h2>
									<span className="scard-period red-period">
										Past due date
									</span>
								</div>
							</div>

							{/* Summary */}
							<div className="rc-summary">
								<div className="rc-total">
									<div className="rc-total-lbl">
										Total Overdue
									</div>
									<div className="rc-total-amt red">
										{formatCurrency(
											overdueSummary.totalAmount,
										)}
									</div>
								</div>
								<div className="rc-counts">
									<div className="rc-count assigned">
										<div className="rc-clbl">
											Assigned
										</div>
										<div className="rc-cnum">
											{
												overdueSummary.assignedCount
											}
										</div>
									</div>
									<div className="rc-count unassigned">
										<div className="rc-clbl">
											Unassigned
										</div>
										<div className="rc-cnum">
											{
												overdueSummary.unassignedCount
											}
										</div>
									</div>
								</div>
							</div>

							{/* List */}
							<div className="rc-list">
								<div className="rc-row-head">
									<span>Invoice</span>
									<span>Client</span>
									<span>Overdue</span>
									<span>Value</span>
									<span>Collector</span>
								</div>
								{loading ? (
									<div
										style={{
											textAlign:
												'center',
											padding: '40px',
											color: '#9a9a9a',
											fontSize: '14px',
										}}
									>
										Loading...
									</div>
								) : overdueData.length ===
								  0 ? (
									<div
										style={{
											textAlign:
												'center',
											padding: '40px',
											color: '#9a9a9a',
											fontSize: '14px',
										}}
									>
										No overdue
										receivables
									</div>
								) : (
									overdueData.map(
										(item) => (
											<div
												key={item.id}
												className="rc-row"
											>
												<div className="rc-id">
													{item.id}
													<span
														className={`rc-src ${item.src.toLowerCase()}`}
													>
														{item.src}
													</span>
												</div>
												<div className="rc-client">
													<div className="rc-co">
														{
															item.client
														}
													</div>
													{item.subject && (
														<div className="rc-subj">
															{
																item.subject
															}
														</div>
													)}
												</div>
												<div
													className={`rc-days ${item.days > 30 ? 'red' : 'amber'}`}
												>
													{item.days}{' '}
													days
												</div>
												<div className="rc-val">
													{formatCurrency(
														item.value,
													)}
												</div>
												<div className="rc-coll">
													{item.assignee ? (
														<span className="rc-assign assigned">
															{
																item
																	.assignee
																	.name
															}
														</span>
													) : (
														<select
															className="rc-assign"
															onChange={(
																e,
															) => {
																if (
																	e
																		.target
																		.value
																) {
																	handleAssignCollector(
																		item.id,
																		e
																			.target
																			.value,
																	);
																}
															}}
															defaultValue=""
														>
															<option value="">
																+ Assign
															</option>
															{collectorsList.map(
																(c) => (
																	<option
																		key={
																			c.username
																		}
																		value={
																			c.username
																		}
																	>
																		{
																			c.name
																		}
																	</option>
																),
															)}
														</select>
													)}
												</div>
											</div>
										),
									)
								)}
							</div>
						</section>
					)}

					{/* Due in 2 Weeks Card */}
					{activeCards.due2w && (
						<section
							className="scard"
							data-card="due2w"
						>
							<div className="scard-head">
								<div className="scard-titlewrap">
									<h2 className="scard-title">
										Due in 2 Weeks
									</h2>
									<span className="scard-period amber-period">
										Approaching due date
									</span>
								</div>
							</div>

							{/* Summary */}
							<div className="rc-summary">
								<div className="rc-total">
									<div className="rc-total-lbl">
										Total Due Soon
									</div>
									<div className="rc-total-amt amber">
										{formatCurrency(
											due2wSummary.totalAmount,
										)}
									</div>
								</div>
								<div className="rc-counts">
									<div className="rc-count assigned">
										<div className="rc-clbl">
											Assigned
										</div>
										<div className="rc-cnum">
											{
												due2wSummary.assignedCount
											}
										</div>
									</div>
									<div className="rc-count unassigned">
										<div className="rc-clbl">
											Unassigned
										</div>
										<div className="rc-cnum">
											{
												due2wSummary.unassignedCount
											}
										</div>
									</div>
								</div>
							</div>

							{/* List */}
							<div className="rc-list">
								<div className="rc-row-head">
									<span>Invoice</span>
									<span>Client</span>
									<span>Due In</span>
									<span>Value</span>
									<span>Collector</span>
								</div>
								{loading ? (
									<div
										style={{
											textAlign:
												'center',
											padding: '40px',
											color: '#9a9a9a',
											fontSize: '14px',
										}}
									>
										Loading...
									</div>
								) : due2wData.length ===
								  0 ? (
									<div
										style={{
											textAlign:
												'center',
											padding: '40px',
											color: '#9a9a9a',
											fontSize: '14px',
										}}
									>
										No due receivables
										in 2 weeks
									</div>
								) : (
									due2wData.map(
										(item) => (
											<div
												key={item.id}
												className="rc-row"
											>
												<div className="rc-id">
													{item.id}
													<span
														className={`rc-src ${item.src.toLowerCase()}`}
													>
														{item.src}
													</span>
												</div>
												<div className="rc-client">
													<div className="rc-co">
														{
															item.client
														}
													</div>
													{item.subject && (
														<div className="rc-subj">
															{
																item.subject
															}
														</div>
													)}
												</div>
												<div
													className={`rc-days ${item.days <= 7 ? 'amber' : ''}`}
												>
													{item.days}{' '}
													days
												</div>
												<div className="rc-val">
													{formatCurrency(
														item.value,
													)}
												</div>
												<div className="rc-coll">
													{item.assignee ? (
														<span className="rc-assign assigned">
															{
																item
																	.assignee
																	.name
															}
														</span>
													) : (
														<select
															className="rc-assign"
															onChange={(
																e,
															) => {
																if (
																	e
																		.target
																		.value
																) {
																	handleAssignCollector(
																		item.id,
																		e
																			.target
																			.value,
																	);
																}
															}}
															defaultValue=""
														>
															<option value="">
																+ Assign
															</option>
															{collectorsList.map(
																(c) => (
																	<option
																		key={
																			c.username
																		}
																		value={
																			c.username
																		}
																	>
																		{
																			c.name
																		}
																	</option>
																),
															)}
														</select>
													)}
												</div>
											</div>
										),
									)
								)}
							</div>
						</section>
					)}

					{/* Collection Performance Card */}
					{activeCards.sales && (
						<section
							className="scard"
							data-card="sales"
						>
							<div className="scard-head">
								<div className="scard-titlewrap">
									<h2 className="scard-title">
										Collection
										Performance
									</h2>
									<span className="scard-period">
										{performanceData?.periodLabel ||
											'Loading...'}
									</span>
								</div>
							</div>

							{/* Progress Bars */}
							{performanceData ? (
								<div className="pbars">
									<div className="pbar-row">
										<div className="pbar-label">
											To be Collected
										</div>
										<div className="pbar-track">
											<div
												className="pbar-fill grad"
												style={{
													width: `${Math.min(performanceData.toBeCollected.percentage, 100)}%`,
												}}
											></div>
										</div>
										<div className="pbar-val">
											{formatCurrency(
												performanceData
													.toBeCollected
													.actual,
											)}{' '}
											/{' '}
											{formatCurrency(
												performanceData
													.toBeCollected
													.target,
											)}
										</div>
									</div>
									<div className="pbar-row">
										<div className="pbar-label">
											Collected
										</div>
										<div className="pbar-track">
											<div
												className="pbar-fill red"
												style={{
													width: `${Math.min(performanceData.collected.percentage, 100)}%`,
												}}
											></div>
										</div>
										<div className="pbar-val">
											{formatCurrency(
												performanceData
													.collected
													.actual,
											)}{' '}
											/{' '}
											{formatCurrency(
												performanceData
													.collected
													.target,
											)}
										</div>
									</div>
								</div>
							) : (
								<div
									style={{
										textAlign: 'center',
										padding: '20px',
									}}
								>
									Loading...
								</div>
							)}

							{/* Collector Pills */}
							{performanceData && performanceData.byCollector.length > 0 && (
								<div className="sp-pills">
									{performanceData.byCollector.map((collector, index) => (
										<button
											key={collector.id}
											className={`sp-pill ${activeCollectors.includes(collector.id) ? 'active' : ''}`}
											onClick={() => toggleCollector(collector.id)}
										>
											<span
												className="dot"
												style={{
													background: COLLECTOR_COLORS[index % COLLECTOR_COLORS.length],
												}}
											></span>
											{collector.name}
										</button>
									))}
								</div>
							)}

							{/* Donut Chart */}
							{performanceData &&
							performanceData
								.byCollector.length >
								0 ? (
								<div
									style={{
										width: '100%',
										height: '400px',
										marginTop: '20px',
									}}
								>
									<ResponsiveContainer
										width="100%"
										height="100%"
									>
										<PieChart>
											<Pie
												data={performanceData.byCollector
													.filter(c => activeCollectors.includes(c.id))
													.map((c) => ({
														name: c.name,
														value: c.value,
														percentage: c.percentage,
													}))}
												cx="50%"
												cy="50%"
												innerRadius={80}
												outerRadius={140}
												paddingAngle={2}
												dataKey="value"
												label={(props: { payload?: { name?: string; percentage?: number } }) => {
													const { name, percentage } = props.payload || {};
													return `${name}: ${percentage?.toFixed(1)}%`;
												}}
											>
												{performanceData.byCollector
													.filter(c => activeCollectors.includes(c.id))
													.map((entry) => {
														const originalIndex = performanceData.byCollector.findIndex(c => c.id === entry.id);
														return (
															<Cell
																key={`cell-${entry.id}`}
																fill={COLLECTOR_COLORS[originalIndex % COLLECTOR_COLORS.length]}
															/>
														);
													})}
											</Pie>
											<Tooltip
												formatter={(value) =>
													value ? formatCurrency(Number(value)) : ''
												}
											/>
											<Legend />
										</PieChart>
									</ResponsiveContainer>
								</div>
							) : (
								<div className="chart-placeholder">
									<p
										style={{
											textAlign:
												'center',
											color: '#9a9a9a',
											padding: '40px',
										}}
									>
										No collection data
										available
									</p>
								</div>
							)}
						</section>
					)}

					{/* Collector Visits Card */}
					{activeCards.visits && (
						<section
							className="scard"
							data-card="visits"
						>
							<div className="scard-head">
								<div className="scard-titlewrap">
									<h2 className="scard-title">
										Collector Visits
									</h2>
								</div>
								<div className="mw-toggle">
									<button
										className={
											viewMode ===
											'monthly'
												? 'active'
												: ''
										}
										onClick={() =>
											setViewMode(
												'monthly',
											)
										}
									>
										Monthly
									</button>
									<button
										className={
											viewMode ===
											'weekly'
												? 'active'
												: ''
										}
										onClick={() =>
											setViewMode(
												'weekly',
											)
										}
									>
										Weekly
									</button>
								</div>
							</div>

							{/* Progress Bars */}
							{visitData ? (
								<div className="pbars">
									<div className="pbar-row">
										<div className="pbar-label">
											Target
										</div>
										<div className="pbar-track">
											<div
												className="pbar-fill grad"
												style={{
													width: '100%',
												}}
											></div>
										</div>
										<div className="pbar-val">
											{visitData.target}{' '}
											visits
										</div>
									</div>
									<div className="pbar-row">
										<div className="pbar-label">
											Actual
										</div>
										<div className="pbar-track">
											<div
												className="pbar-fill red"
												style={{
													width: `${visitData.percentage}%`,
												}}
											></div>
										</div>
										<div className="pbar-val">
											{visitData.actual}{' '}
											visits (
											{visitData.percentage.toFixed(
												1,
											)}
											%)
										</div>
									</div>
								</div>
							) : (
								<div
									style={{
										textAlign: 'center',
										padding: '20px',
									}}
								>
									Loading...
								</div>
							)}

							{/* Line Chart: Visits & Collection Trend */}
							{visitData && visitData.timeSeries ? (
								<div style={{ width: '100%', height: '350px', marginTop: '20px' }}>
									<ResponsiveContainer width="100%" height="100%">
										<LineChart
											data={visitData.timeSeries.dates.map((date, index) => ({
												date,
												visitsActual: visitData.timeSeries.visits.actual[index],
												visitsTarget: visitData.timeSeries.visits.target[index],
												collectedActual: visitData.timeSeries.collected.actual[index],
												collectedTarget: visitData.timeSeries.collected.target[index],
											}))}
											margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
										>
											<CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
											<XAxis dataKey="date" stroke="#9a9a9a" style={{ fontSize: '12px' }} />
											<YAxis yAxisId="left" stroke="#1CA7EC" style={{ fontSize: '12px' }} />
											<YAxis yAxisId="right" orientation="right" stroke="#FE2C23" style={{ fontSize: '12px' }} />
											<Tooltip
												contentStyle={{
													backgroundColor: '#fff',
													border: '1px solid #e0e0e0',
													borderRadius: '8px',
													fontSize: '13px'
												}}
											/>
											<Legend />
											<Line
												yAxisId="left"
												type="monotone"
												dataKey="visitsActual"
												stroke="#1CA7EC"
												strokeWidth={2}
												name="Visits (Actual)"
												dot={{ fill: '#1CA7EC', r: 3 }}
											/>
											<Line
												yAxisId="left"
												type="monotone"
												dataKey="visitsTarget"
												stroke="#61BEDF"
												strokeWidth={2}
												strokeDasharray="5 5"
												name="Visits (Target)"
												dot={false}
											/>
											<Line
												yAxisId="right"
												type="monotone"
												dataKey="collectedActual"
												stroke="#FE2C23"
												strokeWidth={2}
												name="Collected (Actual, jt)"
												dot={{ fill: '#FE2C23', r: 3 }}
											/>
											<Line
												yAxisId="right"
												type="monotone"
												dataKey="collectedTarget"
												stroke="#FFA07A"
												strokeWidth={2}
												strokeDasharray="5 5"
												name="Collected (Target, jt)"
												dot={false}
											/>
										</LineChart>
									</ResponsiveContainer>
								</div>
							) : (
								<div className="chart-placeholder">
									<p style={{ textAlign: 'center', color: '#9a9a9a', padding: '40px' }}>
										No visit data available
									</p>
								</div>
							)}

							{/* Collector Stats Table */}
							{visitData && visitData.byCollector.length > 0 && (
								<div style={{ marginTop: '24px', overflowX: 'auto' }}>
									<table style={{ width: '100%', borderCollapse: 'collapse' }}>
										<thead>
											<tr style={{ borderBottom: '2px solid #e0e0e0' }}>
												<th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#9a9a9a', textTransform: 'uppercase' }}>Collector</th>
												<th style={{ padding: '12px', textAlign: 'right', fontSize: '11px', fontWeight: 600, color: '#9a9a9a', textTransform: 'uppercase' }}>Total Visits</th>
												<th style={{ padding: '12px', textAlign: 'right', fontSize: '11px', fontWeight: 600, color: '#9a9a9a', textTransform: 'uppercase' }}>Daily Average</th>
											</tr>
										</thead>
										<tbody>
											{visitData.byCollector.map((collector, index) => (
												<tr key={collector.id} style={{ borderBottom: '1px solid #f4f6f9' }}>
													<td style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
														<span
															style={{
																width: '8px',
																height: '8px',
																borderRadius: '50%',
																background: COLLECTOR_COLORS[index % COLLECTOR_COLORS.length],
															}}
														></span>
														<span style={{ fontWeight: 600, fontSize: '13px', color: '#111' }}>
															{collector.name}
														</span>
													</td>
													<td style={{ padding: '12px', textAlign: 'right', fontWeight: 700, fontSize: '14px', color: '#121567' }}>
														{collector.visits}
													</td>
													<td style={{ padding: '12px', textAlign: 'right', fontSize: '13px', color: '#9a9a9a' }}>
														{collector.dailyAverage.toFixed(1)} visits/day
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							)}
						</section>
					)}

					{/* Collection Funnel Card */}
					{activeCards.visits2 && (
						<section
							className="scard"
							data-card="visits2"
						>
							<div className="scard-head">
								<div className="scard-titlewrap">
									<h2 className="scard-title">
										Collection Funnel
									</h2>
									<span className="scard-period">
										{funnelData?.periodLabel ||
											'Loading...'}
									</span>
								</div>
							</div>

							{/* Funnel Stages */}
							{funnelData ? (
								<div className="funnel-wrap">
									<div className="funnel">
										{funnelData.stages.map(
											(
												stage,
												index,
											) => {
												const colors = [
													'#61BEDF',
													'#1CA7EC',
													'#1590CD',
												];
												const maxValue =
													funnelData
														.stages[0]
														.value;
												const widthPercent =
													stage.isMoney
														? stage.target
															? (stage.value /
																	stage.target) *
																100
															: 0
														: (stage.value /
																maxValue) *
															100;

												return (
													<div
														key={
															stage.key
														}
														className="fn-stage"
													>
														<div className="fn-label">
															{
																stage.key
															}
														</div>
														<div className="fn-track">
															<div
																className="fn-fill"
																style={{
																	width: `${widthPercent}%`,
																	background:
																		stage.isMoney
																			? 'linear-gradient(90deg, #1590CD, #61BEDF)'
																			: colors[
																					index
																				],
																}}
															></div>
														</div>
														<div className="fn-val">
															{stage.isMoney
																? formatCurrency(
																		stage.value *
																			1000000,
																	)
																: stage.value}
														</div>
													</div>
												);
											},
										)}
									</div>
								</div>
							) : (
								<div
									style={{
										textAlign: 'center',
										padding: '20px',
									}}
								>
									Loading...
								</div>
							)}

							{/* Line Chart: Funnel Stage Trends */}
							{funnelData && funnelData.timeSeries ? (
								<div style={{ width: '100%', height: '400px', marginTop: '20px' }}>
									<ResponsiveContainer width="100%" height="100%">
										<LineChart
											data={funnelData.timeSeries.dates.map((date, index) => ({
												date,
												outstanding: funnelData.timeSeries.outstanding.actual[index],
												reminded: funnelData.timeSeries.reminded.actual[index],
												promised: funnelData.timeSeries.promised.actual[index],
												collected: funnelData.timeSeries.collected.actual[index],
											}))}
											margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
										>
											<CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
											<XAxis dataKey="date" stroke="#9a9a9a" style={{ fontSize: '12px' }} />
											<YAxis stroke="#9a9a9a" style={{ fontSize: '12px' }} />
											<Tooltip
												contentStyle={{
													backgroundColor: '#fff',
													border: '1px solid #e0e0e0',
													borderRadius: '8px',
													fontSize: '13px'
												}}
											/>
											<Legend />
											<Line
												type="monotone"
												dataKey="outstanding"
												stroke="#61BEDF"
												strokeWidth={2}
												name="Outstanding"
												dot={{ fill: '#61BEDF', r: 3 }}
											/>
											<Line
												type="monotone"
												dataKey="reminded"
												stroke="#1CA7EC"
												strokeWidth={2}
												name="Reminded"
												dot={{ fill: '#1CA7EC', r: 3 }}
											/>
											<Line
												type="monotone"
												dataKey="promised"
												stroke="#1590CD"
												strokeWidth={2}
												name="Promised"
												dot={{ fill: '#1590CD', r: 3 }}
											/>
											<Line
												type="monotone"
												dataKey="collected"
												stroke="#FE2C23"
												strokeWidth={2}
												name="Collected (jt)"
												dot={{ fill: '#FE2C23', r: 3 }}
											/>
										</LineChart>
									</ResponsiveContainer>
								</div>
							) : (
								<div className="chart-placeholder">
									<p style={{ textAlign: 'center', color: '#9a9a9a', padding: '40px' }}>
										No funnel data available
									</p>
								</div>
							)}

							{/* Collector Pills */}
							{performanceData && performanceData.byCollector.length > 0 && (
								<div className="sp-pills">
									{performanceData.byCollector.map((collector, index) => (
										<button
											key={collector.id}
											className={`sp-pill ${activeCollectors.includes(collector.id) ? 'active' : ''}`}
											onClick={() => toggleCollector(collector.id)}
										>
											<span
												className="dot"
												style={{
													background: COLLECTOR_COLORS[index % COLLECTOR_COLORS.length],
												}}
											></span>
											{collector.name}
										</button>
									))}
								</div>
							)}
						</section>
					)}
				</div>
			</div>
		</MainLayout>
	);
}

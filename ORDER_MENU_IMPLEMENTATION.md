# Frontend Integration Guide - Order Collector Assignment & Auto AR Creation

## Overview

This guide covers the frontend changes needed to support:

1. Assigning a collector to an order
2. Automatic AR (Accounts Receivable) creation when collector is assigned to approved & shipped orders

---

## 1. Update Order Type/Interface

Add the `collector` field to your Order model:

```typescript
interface Order {
	id: string;
	orderId: string;
	customer: string;
	contact: string;
	products: OrderItem[];
	orderDate: string;
	totalValue: number;
	description: string;
	processed: StatusObject;
	finished: StatusObject;
	cancelled: StatusObject;
	approved: StatusObject;
	rejected: StatusObject;
	shipment: StatusObject;
	priceApproved: StatusObject;
	shipmentTime: string;
	createdBy: string;
	username: string;
	store: string;
	points: number;
	collector?: string; // ✨ NEW FIELD - Optional collector name
	createdAt: string;
	updatedAt: string;
}

interface StatusObject {
	isActive: boolean;
	description: string;
	actionBy: string;
	actionAt?: string;
}

interface OrderItem {
	product: string;
	quantity: number;
	value: number;
}
```

---

## 2. API Function - Assign Collector

Create a new API function to assign a collector to an order:

```typescript
// api/orders.ts

interface AssignCollectorRequest {
	collector: string; // Collector name
	sp: string; // Salesperson ObjectID (must be user with role=2)
}

interface AssignCollectorResponse {
	status: string;
	statusCode: number;
	message: string;
	data: {
		order: Order;
		arCreated: boolean;
		ar?: AR; // Only present if arCreated is true
	};
}

/**
 * Assign a collector to an order
 * Auto-creates AR if order is approved and shipped
 *
 * @param orderId - MongoDB ObjectID of the order
 * @param collector - Name of the collector to assign
 * @param sp - Salesperson user ObjectID (role=2)
 */
export const assignCollectorToOrder =
	async (
		orderId: string,
		collector: string,
		sp: string,
	): Promise<AssignCollectorResponse> => {
		const response = await fetch(
			`${API_BASE_URL}/api/orders/${orderId}/assign-collector`,
			{
				method: 'PUT',
				headers: {
					'Content-Type':
						'application/json',
					// Add authorization header if needed
					// 'Authorization': `Bearer ${token}`,
				},
				body: JSON.stringify({
					collector,
					sp,
				}),
			},
		);

		if (!response.ok) {
			const error =
				await response.json();
			throw new Error(
				error.error ||
					'Failed to assign collector',
			);
		}

		return await response.json();
	};
```

---

## 3. UI Component - Assign Collector Modal/Form

### Example React Component:

```tsx
// components/AssignCollectorModal.tsx

import React, {
	useState,
	useEffect,
} from 'react';
import { assignCollectorToOrder } from '../api/orders';

interface AssignCollectorModalProps {
	order: Order;
	isOpen: boolean;
	onClose: () => void;
	onSuccess: (
		arCreated: boolean,
		arId?: string,
	) => void;
}

export const AssignCollectorModal: React.FC<
	AssignCollectorModalProps
> = ({
	order,
	isOpen,
	onClose,
	onSuccess,
}) => {
	const [collector, setCollector] =
		useState('');
	const [selectedSP, setSelectedSP] =
		useState('');
	const [salespeople, setSalespeople] =
		useState<
			Array<{
				id: string;
				name: string;
			}>
		>([]);
	const [loading, setLoading] =
		useState(false);
	const [error, setError] =
		useState('');

	// Fetch salespeople with role=2
	useEffect(() => {
		const fetchSalespeople =
			async () => {
				try {
					const response = await fetch(
						`${API_BASE_URL}/api/users?role=2`,
					);
					const data =
						await response.json();
					setSalespeople(
						data.data.map(
							(user: any) => ({
								id: user.id,
								name: `${user.firstName} ${user.lastName}`,
							}),
						),
					);
				} catch (err) {
					console.error(
						'Failed to fetch salespeople:',
						err,
					);
				}
			};

		if (isOpen) {
			fetchSalespeople();
		}
	}, [isOpen]);

	const handleSubmit = async (
		e: React.FormEvent,
	) => {
		e.preventDefault();
		setLoading(true);
		setError('');

		try {
			const response =
				await assignCollectorToOrder(
					order.id,
					collector,
					selectedSP,
				);

			// Success notification
			if (response.data.arCreated) {
				onSuccess(
					true,
					response.data.ar?.id,
				);
			} else {
				onSuccess(false);
			}

			onClose();
		} catch (err: any) {
			setError(
				err.message ||
					'Failed to assign collector',
			);
		} finally {
			setLoading(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="modal-overlay">
			<div className="modal-content">
				<h2>
					Assign Collector to Order{' '}
					{order.orderId}
				</h2>

				<form onSubmit={handleSubmit}>
					<div className="form-group">
						<label htmlFor="collector">
							Collector Name *
						</label>
						<input
							id="collector"
							type="text"
							value={collector}
							onChange={(e) =>
								setCollector(
									e.target.value,
								)
							}
							placeholder="Enter collector name"
							required
						/>
					</div>

					<div className="form-group">
						<label htmlFor="salesperson">
							Salesperson *
						</label>
						<select
							id="salesperson"
							value={selectedSP}
							onChange={(e) =>
								setSelectedSP(
									e.target.value,
								)
							}
							required
						>
							<option value="">
								Select salesperson
							</option>
							{salespeople.map((sp) => (
								<option
									key={sp.id}
									value={sp.id}
								>
									{sp.name}
								</option>
							))}
						</select>
					</div>

					{error && (
						<div className="error-message">
							{error}
						</div>
					)}

					<div className="modal-actions">
						<button
							type="button"
							onClick={onClose}
							disabled={loading}
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={loading}
						>
							{loading
								? 'Assigning...'
								: 'Assign Collector'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};
```

---

## 4. Order List/Detail Page Updates

### Show "Assign Collector" Button:

```tsx
// components/OrderItem.tsx or OrderDetail.tsx

const canAssignCollector = (
	order: Order,
): boolean => {
	return (
		order.approved.isActive &&
		order.shipment.isActive &&
		!order.cancelled.isActive &&
		!order.collector // Only show if no collector assigned yet
	);
};

const OrderActions = ({
	order,
}: {
	order: Order;
}) => {
	const [showModal, setShowModal] =
		useState(false);

	const handleSuccess = (
		arCreated: boolean,
		arId?: string,
	) => {
		if (arCreated) {
			toast.success(
				`Collector assigned successfully! AR created automatically.`,
				{
					action: arId
						? {
								label: 'View AR',
								onClick: () =>
									navigate(
										`/collection/ar/${arId}`,
									),
							}
						: undefined,
				},
			);
		} else {
			toast.success(
				'Collector assigned successfully!',
			);
		}

		// Refresh order data
		refreshOrder();
	};

	return (
		<>
			{canAssignCollector(order) && (
				<button
					onClick={() =>
						setShowModal(true)
					}
					className="btn-primary"
				>
					Assign Collector
				</button>
			)}

			{order.collector && (
				<div className="collector-badge">
					👤 Collector:{' '}
					{order.collector}
				</div>
			)}

			<AssignCollectorModal
				order={order}
				isOpen={showModal}
				onClose={() =>
					setShowModal(false)
				}
				onSuccess={handleSuccess}
			/>
		</>
	);
};
```

---

## 5. Display Collector in Order List

```tsx
// components/OrdersTable.tsx

const OrdersTable = ({
	orders,
}: {
	orders: Order[];
}) => {
	return (
		<table>
			<thead>
				<tr>
					<th>Order ID</th>
					<th>Customer</th>
					<th>Total Value</th>
					<th>Status</th>
					<th>Collector</th>{' '}
					{/* NEW COLUMN */}
					<th>Actions</th>
				</tr>
			</thead>
			<tbody>
				{orders.map((order) => (
					<tr key={order.id}>
						<td>{order.orderId}</td>
						<td>{order.customer}</td>
						<td>
							{formatCurrency(
								order.totalValue,
							)}
						</td>
						<td>
							{order.approved
								.isActive && (
								<span className="badge badge-success">
									Approved
								</span>
							)}
							{order.shipment
								.isActive && (
								<span className="badge badge-info">
									Shipped
								</span>
							)}
						</td>
						<td>
							{order.collector ? (
								<span className="collector-name">
									👤 {order.collector}
								</span>
							) : (
								<span className="text-muted">
									-
								</span>
							)}
						</td>
						<td>{/* Actions */}</td>
					</tr>
				))}
			</tbody>
		</table>
	);
};
```

---

## 6. Success Notification with AR Link

```tsx
// utils/notifications.ts

export const showAssignCollectorSuccess =
	(
		arCreated: boolean,
		arData?: AR,
		navigate?: (path: string) => void,
	) => {
		if (arCreated && arData) {
			toast.success(
				<div>
					<strong>
						Collector assigned
						successfully!
					</strong>
					<p>
						AR {arData.arItemId} has
						been created automatically.
					</p>
					{navigate && (
						<button
							onClick={() =>
								navigate(
									`/collection/ar/${arData.id}`,
								)
							}
							className="toast-link"
						>
							View AR →
						</button>
					)}
				</div>,
				{ duration: 5000 },
			);
		} else {
			toast.info(
				'Collector assigned! Order must be approved and shipped to auto-create AR.',
				{ duration: 4000 },
			);
		}
	};
```

---

## 7. Workflow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     ORDER WORKFLOW                          │
└─────────────────────────────────────────────────────────────┘

1. Create Order
   └─> Order created with status objects (all inactive)

2. Approve Order
   └─> approved.isActive = true

3. Ship Order
   └─> shipment.isActive = true

4. Assign Collector (NEW STEP)
   └─> Frontend calls: PUT /api/orders/:id/assign-collector
       ├─> Backend checks: approved ✓ && shipped ✓ && !cancelled ✓
       ├─> Updates order.collector
       └─> Auto-creates AR:
           ├─> arItemId: "AR{orderId}"
           ├─> source: "Order"
           ├─> Links: orderId, customer, contact, products, etc.
           └─> Status calculated based on delivery date
               ├─> "overdue" if past due
               ├─> "due2w" if due within 14 days
               └─> "outstanding" if due > 14 days

5. AR Created ✓
   └─> Collector can now track payment in AR system
```

---

## 8. Validation Rules

### When to Show "Assign Collector" Button:

```typescript
const canAssignCollector = (
	order: Order,
): boolean => {
	return (
		order.approved.isActive === true &&
		order.shipment.isActive === true &&
		order.cancelled.isActive ===
			false &&
		!order.collector // Not already assigned
	);
};
```

### Form Validation:

- **Collector Name**: Required, minimum 2 characters
- **Salesperson**: Required, must select from dropdown

---

## 9. API Response Examples

### Success - AR Created:

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Collector assigned successfully",
  "data": {
    "order": {
      "id": "507f1f77bcf86cd799439011",
      "orderId": "DKI21162",
      "customer": "PT ABC Corporation",
      "collector": "Andi Wijaya",
      ...
    },
    "arCreated": true,
    "ar": {
      "id": "6a3d3bf47859c6ddf8f4a182",
      "arItemId": "ARDKI21162",
      "orderId": "DKI21162",
      "source": "Order",
      "client": "PT ABC Corporation",
      "contact": "0896-2611-1998",
      "status": "outstanding",
      "collector": "Andi Wijaya",
      ...
    }
  }
}
```

### Success - No AR Created (order not approved/shipped):

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Collector assigned successfully",
  "data": {
    "order": {
      "id": "507f1f77bcf86cd799439011",
      "collector": "Andi Wijaya",
      ...
    },
    "arCreated": false
  }
}
```

### Error Response:

```json
{
	"status": "error",
	"statusCode": 400,
	"error": "Collector name is required"
}
```

---

## 10. Testing Checklist

- [ ] Order model includes `collector` field
- [ ] API function `assignCollectorToOrder()` created
- [ ] Fetch salespeople (role=2) for dropdown
- [ ] "Assign Collector" button shows only for approved+shipped orders
- [ ] Modal/form validates collector name and salesperson selection
- [ ] Success notification shows different messages based on `arCreated`
- [ ] If AR created, show link to view AR
- [ ] Collector name displays in order list/details
- [ ] Error handling for API failures
- [ ] Loading states during API calls
- [ ] Order data refreshes after assignment

---

## 11. Related Documentation

- [AR API Documentation](./AR_API_DOCUMENTATION.md)
- [Order API Documentation](./CLAUDE.md#orders)

---

## 12. Common Issues & Solutions

### Issue: Salespeople not appearing in dropdown

**Solution**: Make sure you're filtering users by `role=2`:

```typescript
const response = await fetch(
	'/api/users?role=2',
);
```

### Issue: AR not being created automatically

**Check**:

1. Order must have `approved.isActive = true`
2. Order must have `shipment.isActive = true`
3. Order must have `cancelled.isActive = false`
4. Salesperson ID must be valid ObjectID

### Issue: "Invalid order ID" error

**Solution**: Make sure you're passing the MongoDB ObjectID (`order.id`), not the order number (`order.orderId`)

---

## Questions?

If you encounter any issues, check:

1. Network tab for API request/response details
2. Console for JavaScript errors
3. Backend logs for server-side errors

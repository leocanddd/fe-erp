import { Order } from '@/lib/orders';

interface OrderTableProps {
  orders: Order[];
  loading: boolean;
  onEdit: (order: Order) => void;
  onDelete: (order: Order) => void;
  onToggleStatus: (order: Order, field: 'isProcessed' | 'isFinished' | 'isCancelled') => void;
}

export default function OrderTable({ orders, loading, onEdit, onDelete, onToggleStatus }: OrderTableProps) {
  const getStatusBadge = (order: Order) => {
    if (order.isCancelled) {
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
          Dibatalkan
        </span>
      );
    }
    if (order.isFinished) {
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
          Selesai
        </span>
      );
    }
    if (order.isProcessed) {
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
          Diproses
        </span>
      );
    }
    return (
      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
        Pending
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-flex items-center space-x-3">
          <div className="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="text-gray-600">Memuat pesanan...</span>
        </div>
      </div>
    );
  }

  if (orders?.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        Tidak ada pesanan yang ditemukan
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Customer
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tanggal
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Produk
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Nilai
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {orders?.map((order) => (
            <tr key={order.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {order.customer}
                  </div>
                  <div className="text-sm text-gray-500">{order.contact}</div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {new Date(order.orderDate).toLocaleDateString('id-ID')}
                </div>
                <div className="text-xs text-gray-500">
                  Kirim: {order.shipmentTime}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {order?.products?.length} item(s)
                </div>
                <div className="text-xs text-gray-500 truncate max-w-xs">
                  {order?.products?.map((p) => p.product).join(', ') ?? ''}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                Rp {order?.totalValue.toLocaleString('id-ID')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(order)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-2">
                  {!order?.isCancelled && !order?.isFinished && (
                    <button
                      onClick={() => onToggleStatus(order, 'isProcessed')}
                      className={`p-1 rounded text-xs px-2 py-1 ${
                        order.isProcessed
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                      title={order.isProcessed ? 'Batalkan proses' : 'Proses pesanan'}
                    >
                      {order.isProcessed ? 'Diproses' : 'Proses'}
                    </button>
                  )}
                  {order.isProcessed && !order.isCancelled && (
                    <button
                      onClick={() => onToggleStatus(order, 'isFinished')}
                      className={`p-1 rounded text-xs px-2 py-1 ${
                        order.isFinished
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                      title={order.isFinished ? 'Batalkan selesai' : 'Selesaikan pesanan'}
                    >
                      {order.isFinished ? 'Selesai' : 'Selesaikan'}
                    </button>
                  )}
                  {!order.isFinished && (
                    <button
                      onClick={() => onToggleStatus(order, 'isCancelled')}
                      className={`p-1 rounded text-xs px-2 py-1 ${
                        order.isCancelled
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                      title={order.isCancelled ? 'Batalkan pembatalan' : 'Batalkan pesanan'}
                    >
                      {order.isCancelled ? 'Dibatalkan' : 'Batalkan'}
                    </button>
                  )}
                  <button
                    onClick={() => onEdit(order)}
                    className="text-indigo-600 hover:text-indigo-900 p-1 rounded"
                    title="Edit pesanan"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onDelete(order)}
                    className="text-red-600 hover:text-red-900 p-1 rounded"
                    title="Hapus pesanan"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
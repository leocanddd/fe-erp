import { useEffect, useState, useCallback } from 'react';
import { getStores, deleteStore, createStore, updateStore, Store } from '@/lib/stores';
import MainLayout from '@/components/MainLayout';

export default function Stores() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [storeToDelete, setStoreToDelete] = useState<Store | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    pic: '',
    contact: '',
    limit: '',
    description: '',
    totalVisit: ''
  });

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getStores(currentPage, 10, search);
      if (response.statusCode === 200) {
        setStores(response.data);
        setTotalPages(response.pagination.totalPages);
        setTotalItems(response.pagination.totalItems);
        setError('');
      } else {
        setError(response.error || 'Failed to fetch stores');
      }
    } catch {
      setError('Failed to fetch stores');
    } finally {
      setLoading(false);
    }
  }, [currentPage, search]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchStores();
  };

  const handleDelete = async (store: Store) => {
    setStoreToDelete(store);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!storeToDelete) return;

    try {
      const response = await deleteStore(storeToDelete.id!);
      if (response.statusCode === 200) {
        fetchStores();
        setShowDeleteModal(false);
        setStoreToDelete(null);
      } else {
        setError(response.error || 'Failed to delete store');
      }
    } catch {
      setError('Failed to delete store');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      pic: '',
      contact: '',
      limit: '',
      description: '',
      totalVisit: ''
    });
  };

  const handleAddStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const storeData = {
        name: formData.name.trim(),
        location: formData.location.trim(),
        pic: formData.pic.trim(),
        contact: formData.contact.trim(),
        limit: parseInt(formData.limit),
        description: formData.description.trim(),
        totalVisit: parseInt(formData.totalVisit) || 0
      };

      const response = await createStore(storeData);
      if (response.statusCode === 201) {
        fetchStores();
        setShowAddModal(false);
        resetForm();
      } else {
        setError(response.error || 'Gagal menambah toko');
      }
    } catch {
      setError('Gagal menambah toko');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (store: Store) => {
    setEditingStore(store);
    setFormData({
      name: store.name,
      location: store.location,
      pic: store.pic,
      contact: store.contact,
      limit: store.limit.toString(),
      description: store.description,
      totalVisit: store.totalVisit.toString()
    });
    setShowEditModal(true);
  };

  const handleUpdateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStore) return;

    setIsSubmitting(true);
    setError('');

    try {
      const storeData = {
        name: formData.name.trim(),
        location: formData.location.trim(),
        pic: formData.pic.trim(),
        contact: formData.contact.trim(),
        limit: parseInt(formData.limit),
        description: formData.description.trim(),
        totalVisit: parseInt(formData.totalVisit) || 0
      };

      const response = await updateStore(editingStore.id!, storeData);
      if (response.statusCode === 200) {
        fetchStores();
        setShowEditModal(false);
        setEditingStore(null);
        resetForm();
      } else {
        setError(response.error || 'Gagal mengubah toko');
      }
    } catch {
      setError('Gagal mengubah toko');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout title="Toko">
      <div className="max-w-7xl mx-auto">
        {/* Header with search and add button */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Toko</h2>
            <p className="text-gray-600">Kelola data toko dan cabang Anda</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Tambah Toko
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari toko berdasarkan nama atau lokasi..."
                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors duration-200"
            >
              Cari
            </button>
          </form>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="text-sm text-red-600 font-medium">{error}</div>
          </div>
        )}

        {/* Stores table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-flex items-center space-x-3">
                <div className="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <span className="text-gray-600">Memuat toko...</span>
              </div>
            </div>
          ) : stores.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Tidak ada toko yang ditemukan
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Toko
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Lokasi
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        PIC
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kontak
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Limit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kunjungan
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stores.map((store) => (
                      <tr key={store.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {store.name}
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {store.description}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {store.location}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {store.pic}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {store.contact}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {store.limit}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {store.totalVisit}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleEdit(store)}
                              className="text-indigo-600 hover:text-indigo-900 p-1 rounded"
                              title="Edit toko"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(store)}
                              className="text-red-600 hover:text-red-900 p-1 rounded"
                              title="Hapus toko"
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

              {/* Pagination */}
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Sebelumnya
                      </button>
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Berikutnya
                      </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Menampilkan{' '}
                          <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> sampai{' '}
                          <span className="font-medium">
                            {Math.min(currentPage * 10, totalItems)}
                          </span>{' '}
                          dari <span className="font-medium">{totalItems}</span> hasil
                        </p>
                      </div>
                      <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                          <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Sebelumnya
                          </button>
                          <button
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Berikutnya
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

      {/* Add Store Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => {
              setShowAddModal(false);
              resetForm();
              setError('');
            }}></div>
            <div className="relative inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <form onSubmit={handleAddStore}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="w-full">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-gray-900">
                          Tambah Toko Baru
                        </h3>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddModal(false);
                            resetForm();
                            setError('');
                          }}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4">
                          <div className="text-sm text-red-600 font-medium">{error}</div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                            Nama Toko *
                          </label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
                            placeholder="Masukkan nama toko"
                          />
                        </div>

                        <div>
                          <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-2">
                            Lokasi *
                          </label>
                          <input
                            type="text"
                            id="location"
                            name="location"
                            required
                            value={formData.location}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
                            placeholder="Masukkan lokasi toko"
                          />
                        </div>

                        <div>
                          <label htmlFor="pic" className="block text-sm font-semibold text-gray-700 mb-2">
                            PIC (Penanggung Jawab) *
                          </label>
                          <input
                            type="text"
                            id="pic"
                            name="pic"
                            required
                            value={formData.pic}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
                            placeholder="Masukkan nama PIC"
                          />
                        </div>

                        <div>
                          <label htmlFor="contact" className="block text-sm font-semibold text-gray-700 mb-2">
                            Kontak *
                          </label>
                          <input
                            type="text"
                            id="contact"
                            name="contact"
                            required
                            value={formData.contact}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
                            placeholder="Masukkan nomor telepon/email"
                          />
                        </div>

                        <div>
                          <label htmlFor="limit" className="block text-sm font-semibold text-gray-700 mb-2">
                            Limit *
                          </label>
                          <input
                            type="number"
                            id="limit"
                            name="limit"
                            required
                            min="0"
                            value={formData.limit}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
                            placeholder="Masukkan limit"
                          />
                        </div>

                        <div>
                          <label htmlFor="totalVisit" className="block text-sm font-semibold text-gray-700 mb-2">
                            Total Kunjungan
                          </label>
                          <input
                            type="number"
                            id="totalVisit"
                            name="totalVisit"
                            min="0"
                            value={formData.totalVisit}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
                            placeholder="Masukkan total kunjungan"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                            Deskripsi *
                          </label>
                          <textarea
                            id="description"
                            name="description"
                            required
                            rows={3}
                            value={formData.description}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
                            placeholder="Masukkan deskripsi toko"
                          />
                        </div>

                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-3xl">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex justify-center rounded-2xl border border-transparent shadow-sm px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-base font-semibold text-white hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                        Menyimpan...
                      </div>
                    ) : (
                      'Simpan Toko'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                      setError('');
                    }}
                    className="mt-3 w-full inline-flex justify-center rounded-2xl border border-gray-300 shadow-sm px-6 py-3 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Store Modal */}
      {showEditModal && editingStore && (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => {
              setShowEditModal(false);
              setEditingStore(null);
              resetForm();
              setError('');
            }}></div>
            <div className="relative inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <form onSubmit={handleUpdateStore}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="w-full">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-gray-900">
                          Edit Toko
                        </h3>
                        <button
                          type="button"
                          onClick={() => {
                            setShowEditModal(false);
                            setEditingStore(null);
                            resetForm();
                            setError('');
                          }}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4">
                          <div className="text-sm text-red-600 font-medium">{error}</div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="edit-name" className="block text-sm font-semibold text-gray-700 mb-2">
                            Nama Toko *
                          </label>
                          <input
                            type="text"
                            id="edit-name"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
                            placeholder="Masukkan nama toko"
                          />
                        </div>

                        <div>
                          <label htmlFor="edit-location" className="block text-sm font-semibold text-gray-700 mb-2">
                            Lokasi *
                          </label>
                          <input
                            type="text"
                            id="edit-location"
                            name="location"
                            required
                            value={formData.location}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
                            placeholder="Masukkan lokasi toko"
                          />
                        </div>

                        <div>
                          <label htmlFor="edit-pic" className="block text-sm font-semibold text-gray-700 mb-2">
                            PIC (Penanggung Jawab) *
                          </label>
                          <input
                            type="text"
                            id="edit-pic"
                            name="pic"
                            required
                            value={formData.pic}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
                            placeholder="Masukkan nama PIC"
                          />
                        </div>

                        <div>
                          <label htmlFor="edit-contact" className="block text-sm font-semibold text-gray-700 mb-2">
                            Kontak *
                          </label>
                          <input
                            type="text"
                            id="edit-contact"
                            name="contact"
                            required
                            value={formData.contact}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
                            placeholder="Masukkan nomor telepon/email"
                          />
                        </div>

                        <div>
                          <label htmlFor="edit-limit" className="block text-sm font-semibold text-gray-700 mb-2">
                            Limit *
                          </label>
                          <input
                            type="number"
                            id="edit-limit"
                            name="limit"
                            required
                            min="0"
                            value={formData.limit}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
                            placeholder="Masukkan limit"
                          />
                        </div>

                        <div>
                          <label htmlFor="edit-totalVisit" className="block text-sm font-semibold text-gray-700 mb-2">
                            Total Kunjungan
                          </label>
                          <input
                            type="number"
                            id="edit-totalVisit"
                            name="totalVisit"
                            min="0"
                            value={formData.totalVisit}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
                            placeholder="Masukkan total kunjungan"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label htmlFor="edit-description" className="block text-sm font-semibold text-gray-700 mb-2">
                            Deskripsi *
                          </label>
                          <textarea
                            id="edit-description"
                            name="description"
                            required
                            rows={3}
                            value={formData.description}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
                            placeholder="Masukkan deskripsi toko"
                          />
                        </div>

                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-3xl">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex justify-center rounded-2xl border border-transparent shadow-sm px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-base font-semibold text-white hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                        Menyimpan...
                      </div>
                    ) : (
                      'Simpan Perubahan'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingStore(null);
                      resetForm();
                      setError('');
                    }}
                    className="mt-3 w-full inline-flex justify-center rounded-2xl border border-gray-300 shadow-sm px-6 py-3 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => {
              setShowDeleteModal(false);
              setStoreToDelete(null);
            }}></div>
            <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Hapus Toko
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Apakah Anda yakin ingin menghapus toko &quot;{storeToDelete?.name}&quot;? Tindakan ini tidak dapat dibatalkan.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={confirmDelete}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Hapus
                </button>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setStoreToDelete(null);
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
import React, { useState } from 'react';
import { Plus, Pencil, Trash2, X, Search, ChevronUp, ChevronDown } from 'lucide-react';
import { useOrderContext } from '../context/OrderContext';
import { STORAGE_URL } from '../sevices/api';

// ─── Status stok ──────────────────────────────────────────────────────────────
const getStatus = (stok) => {
  const n = parseInt(stok) || 0;
  if (n === 0)  return 'Habis';
  if (n <= 5)   return 'Hampir Habis';
  if (n <= 20)  return 'Menipis';
  return 'Tersedia';
};

const STATUS_LIST   = ['Semua Status', 'Tersedia', 'Hampir Habis', 'Menipis', 'Habis'];
const PER_PAGE      = 10;

const statusColor = {
  Tersedia:       'text-green-600',
  'Hampir Habis': 'text-orange-500',
  Menipis:        'text-yellow-600',
  Habis:          'text-red-500',
};

// ─── Dropdown ─────────────────────────────────────────────────────────────────
const Dropdown = ({ value, onChange, options }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative" onBlur={() => setOpen(false)} tabIndex={0}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 pl-4 pr-3 py-2 rounded-lg border border-[#B34949] bg-red-50 text-sm font-medium text-gray-700 min-w-[150px] justify-between"
      >
        {value}
        {open
          ? <ChevronUp   className="w-4 h-4 text-[#B34949]" />
          : <ChevronDown className="w-4 h-4 text-[#B34949]" />
        }
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-30 min-w-[160px] overflow-hidden">
          {options.map(opt => (
            <div
              key={opt}
              onMouseDown={() => { onChange(opt); setOpen(false); }}
              className={`px-4 py-2.5 text-sm cursor-pointer transition-colors border-b border-gray-200 last:border-b-0 ${
                opt === value ? 'bg-red-50 text-[#B34949] font-bold' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const BLANK_FORM = { nama_menu: '', id_kategori: '', stok: '' };
const ALLOWED_TYPES = ['image/jpeg', 'image/png'];
const ALLOWED_EXTS  = ['.jpg', '.jpeg', '.png'];
const MAX_SIZE_MB   = 2;


const Modal = ({ open, onClose, onSave, editData, categories }) => {
  const [form, setForm]         = useState(BLANK_FORM);
  const [preview, setPreview]   = useState(null);
  const [file, setFile]         = useState(null);
  const [fileError, setFileError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileRef = React.useRef();

  React.useEffect(() => {
    if (open) {
      setForm(editData
        ? { 
            nama_menu: editData.nama, 
            id_kategori: String(editData.id_kategori || ''), 
            stok: String(editData.stok ?? '')
          }
        : { ...BLANK_FORM }
      );
      setPreview(editData?.image ? `${STORAGE_URL}${editData.image}` : null);
      setFile(null);
      setFileError('');
    } else {
      setForm({ ...BLANK_FORM });
      setPreview(null);
      setFile(null);
      setFileError('');
      if (fileRef.current) fileRef.current.value = '';
    }
  }, [open, editData]);

  if (!open) return null;

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;

    // Validasi ekstensi & MIME type
    const ext = '.' + f.name.split('.').pop().toLowerCase();
    if (!ALLOWED_TYPES.includes(f.type) || !ALLOWED_EXTS.includes(ext)) {
      setFileError('❌ Format tidak didukung! Hanya PNG, JPG, JPEG yang diizinkan.');
      setFile(null);
      setPreview(editData?.image ? `${STORAGE_URL}${editData.image}` : null);
      if (fileRef.current) fileRef.current.value = '';
      return;
    }

    // Validasi ukuran file (maks 2MB)
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      setFileError(`❌ Ukuran file terlalu besar! Maksimal ${MAX_SIZE_MB}MB. File Anda: ${(f.size / 1024 / 1024).toFixed(1)}MB`);
      setFile(null);
      setPreview(editData?.image ? `${STORAGE_URL}${editData.image}` : null);
      if (fileRef.current) fileRef.current.value = '';
      return;
    }

    setFileError('');
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleRemove = () => {
    setPreview(null);
    setFile(null);
    setFileError('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSave = async () => {
    if (!form.nama_menu.trim()) {
      alert('Nama menu harus diisi!');
      return;
    }
    if (!form.id_kategori) {
      alert('Kategori harus dipilih!');
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('nama_menu', form.nama_menu);
    formData.append('id_kategori', form.id_kategori);
    formData.append('stok', form.stok);
    if (file) {
      formData.append('gambar', file);
    }

    const result = await onSave(formData);
    setIsSubmitting(false);
    
    if (result && !result.success) {
      alert(result.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
        <button onClick={onClose} className="absolute right-6 top-6 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-gray-900 mb-1">
          {editData ? 'Edit Menu' : 'Tambah Menu'}
        </h2>
        <p className="text-xs text-gray-400 mb-6 italic">Pastikan data menu sudah benar</p>

        <div className="space-y-4">

          {/* Upload Foto */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Foto Menu</label>
            <div
              onClick={() => !preview && fileRef.current.click()}
              className="relative mt-1 w-full h-40 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden cursor-pointer border-2 border-dashed border-gray-300 hover:border-red-300 transition-all"
            >
              {preview ? (
                <>
                  <img src={preview} alt="preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); fileRef.current.click(); }}
                      className="bg-white text-gray-700 rounded-full p-2 shadow hover:bg-gray-100"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); handleRemove(); }}
                      className="bg-white text-red-500 rounded-full p-2 shadow hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-400">
                  <div className="text-3xl mb-1">📷</div>
                  <p className="text-xs">Klik untuk unggah foto</p>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,.jpg,.jpeg,.png"
              onChange={handleFile}
              className="hidden"
            />
            {/* Pesan Error Format File */}
            {fileError && (
              <div className="mt-2 p-2.5 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs text-red-600 font-medium">{fileError}</p>
              </div>
            )}
            {/* Info format yang didukung */}
            {!fileError && (
              <p className="mt-1.5 text-[10px] text-gray-400 text-center">
                PNG, JPG, JPEG • Maks. 2MB
              </p>
            )}
          </div>

          {/* Nama Menu */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Nama Menu</label>
            <input
              type="text"
              value={form.nama_menu}
              onChange={e => setForm({ ...form, nama_menu: e.target.value })}
              placeholder="Masukkan nama menu"
              className="w-full mt-1 p-3 bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-red-200 text-sm"
            />
          </div>

          {/* Kategori & Stok */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Kategori</label>
              <select
                value={form.id_kategori}
                onChange={e => setForm({ ...form, id_kategori: e.target.value })}
                className="w-full mt-1 p-3 bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-red-200 text-sm cursor-pointer border border-transparent hover:border-red-100 transition-all"
              >
                <option value="">Pilih Kategori</option>
                {categories.map(k => (
                  <option key={k.id_kategori} value={k.id_kategori}>{k.nama_kategori}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Stok</label>
              <input
                type="number"
                value={form.stok}
                onChange={e => setForm({ ...form, stok: e.target.value })}
                placeholder="0"
                min={0}
                className="w-full mt-1 p-3 bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-red-200 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Tombol */}
        <div className="mt-8 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 text-sm font-bold text-gray-400 hover:bg-gray-50 rounded-full border border-gray-200 transition-all"
            disabled={isSubmitting}
          >
            BATAL
          </button>
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className={`flex-1 py-3 bg-[#B34949] hover:bg-[#8B2323] text-white text-sm font-bold rounded-full shadow-lg shadow-red-100 transition-all active:scale-95 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? 'MENYIMPAN...' : 'SIMPAN MENU'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Halaman Utama ─────────────────────────────────────────────────────────────
const Menu = () => {
  const { menuItems, categories, tambahMenu, editMenu, hapusMenu, loading, refreshData } = useOrderContext();

  const [search,       setSearch]   = useState('');
  const [kategoriName, setKategoriName] = useState('Semua Kategori');
  const [statusFilter, setStatus]   = useState('Semua Status');
  const [page,         setPage]     = useState(1);
  const [modal,        setModal]    = useState(false);
  const [editData,     setEditData] = useState(null);
  const [deleteId,     setDeleteId] = useState(null);

  // ── Auto-refresh data jika kosong ──────────────────────────────────────────
  // React.useEffect(() => {
  //   if ((!categories || categories.length === 0) && !loading) {
  //     if (refreshData) refreshData();
  //   }
  // }, [categories, loading]);

  // ── Filter & Pagination ───────────────────────────────────────────────────────
  const filtered = menuItems.filter(m =>
    (m.nama?.toLowerCase().includes(search.toLowerCase()) || m.nama_menu?.toLowerCase().includes(search.toLowerCase())) &&
    (kategoriName === 'Semua Kategori' || m.kategori === kategoriName || m.category === kategoriName) &&
    (statusFilter === 'Semua Status'   || getStatus(m.stok) === statusFilter)
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const curPage    = Math.min(page, totalPages);
  const paginated  = filtered.slice((curPage - 1) * PER_PAGE, curPage * PER_PAGE);

  // ── CRUD ─────────────────────────────────────────────────────────────────────
  const handleSave = async (formData) => {
    let result;
    if (editData) {
      result = await editMenu(editData.id, formData);
    } else {
      result = await tambahMenu(formData);
    }
    
    if (result && result.success) {
      setModal(false);
      setEditData(null);
    }
    return result;
  };

  const handleDelete = async () => {
    const result = await hapusMenu(deleteId);
    if (result && result.success) {
      setDeleteId(null);
    } else {
      alert(result?.message || 'Gagal menghapus menu');
    }
  };

  if (loading && menuItems.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B34949]"></div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Kelola Menu</h1>
          <p className="text-sm text-gray-400 mt-0.5">Atur menu restoran dan stok</p>
        </div>
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="cari menu..."
            className="pl-8 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-sm outline-none focus:border-red-300 w-80 text-gray-600 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Filter & Tambah */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <Dropdown
          value={kategoriName}
          onChange={v => { setKategoriName(v); setPage(1); }}
          options={['Semua Kategori', ...categories.map(k => k.nama_kategori)]}
        />
        <Dropdown
          value={statusFilter}
          onChange={v => { setStatus(v); setPage(1); }}
          options={STATUS_LIST}
        />
        <div className="flex-1" />
        <button
          onClick={() => { setEditData(null); setModal(true); }}
          className="flex items-center gap-1.5 px-5 py-2 bg-[#B34949] hover:bg-[#8B2323] text-white text-sm font-bold rounded-lg shadow-md shadow-red-200 transition-all"
        >
          <Plus className="w-4 h-4" /> Tambah Menu
        </button>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full">
          <thead>
            <tr className="bg-[#C0392B]">
              {['No', 'Gambar', 'Nama Menu', 'Kategori', 'Stok', 'Status', 'Aksi'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-bold text-white tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-400 text-sm">
                  Tidak ada menu ditemukan
                </td>
              </tr>
            )}
            {paginated.map((item, i) => {
              const status = getStatus(item.stok);
              return (
                <tr key={item.id} className="border-b-4 border-gray-50 transition-colors bg-red-50/50">
                  <td className="px-5 py-3 text-sm text-gray-700">{(curPage - 1) * PER_PAGE + i + 1}</td>
                  <td className="px-5 py-3">
                    {item.image
                      ? <img src={`${STORAGE_URL}${item.image}`} alt={item.nama} className="w-10 h-10 rounded object-cover" />
                      : <div className="w-10 h-10 rounded bg-gray-200 flex-shrink-0" />
                    }
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-800">{item.nama || item.nama_menu}</td>
                  <td className="px-5 py-3 text-sm text-gray-700">{item.kategori || item.category}</td>
                  <td className="px-5 py-3 text-sm text-gray-700">{item.stok}</td>
                  <td className={`px-5 py-3 text-sm font-semibold ${statusColor[status]}`}>{status}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setEditData(item); setModal(true); }}
                        className="text-orange-400 hover:text-orange-600 transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(item.id)}
                        className="text-[#B34949] hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-end items-center gap-1.5 mt-4">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={curPage === 1}
          className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-40 text-sm"
        >‹</button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
          <button
            key={p}
            onClick={() => setPage(p)}
            className={`w-8 h-8 rounded text-sm font-semibold transition-all ${
              p === curPage ? 'bg-[#B34949] text-white' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
            }`}
          >{p}</button>
        ))}
        <button
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={curPage === totalPages}
          className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-40 text-sm"
        >›</button>
      </div>

      {/* Modal Tambah / Edit */}
      <Modal
        key={editData ? `edit-${editData.id}` : 'new'}
        open={modal}
        categories={categories}
        onClose={() => { setModal(false); setEditData(null); }}
        onSave={handleSave}
        editData={editData}
      />

      {/* Modal Hapus */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center">
            <div className="text-5xl mb-3">🗑️</div>
            <h3 className="text-lg font-extrabold text-gray-900 mb-2">Hapus Menu?</h3>
            <p className="text-sm text-gray-400 mb-6">Menu ini akan dihapus permanen.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-3 text-sm font-bold text-gray-400 border border-gray-200 rounded-full hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-3 bg-[#B34949] hover:bg-[#8B2323] text-white text-sm font-bold rounded-full shadow-lg shadow-red-100"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Menu;

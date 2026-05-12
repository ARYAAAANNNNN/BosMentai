import React, { useState, useEffect, useRef } from 'react';
import { Plus, Pencil, Trash2, X, Search, ChevronUp, ChevronDown } from 'lucide-react';
import { useOrderContext } from '../context/OrderContext';
import { STORAGE_URL, getImageUrl } from '../services/api';

// ─── Mapping Kategori (PASTIKAN ID INI SAMA DENGAN DI DATABASE SUPABASE LU) ──────────────
const categoryMap = {
  'Makanan': 1,
  'Minuman': 2,
  'Snack': 3,
};

const idToCategory = {
  1: 'Makanan',
  2: 'Minuman',
  3: 'Snack',
};

// List untuk filter dropdown agar statis sesuai permintaan lu
const KATEGORI_LIST_FIXED = ['Semua Kategori', 'Makanan', 'Minuman', 'Snack'];

// ─── Status stok ──────────────────────────────────────────────────────────────
const getStatus = (stok) => {
  const n = parseInt(stok) || 0;
  if (n === 0)  return 'Habis';
  if (n <= 5)   return 'Hampir Habis';
  if (n <= 20)  return 'Menipis';
  return 'Tersedia';
};

const STATUS_LIST   = ['Semua Status', 'Tersedia', 'Hampir Habis', 'Menipis', 'Habis'];

const statusColor = {
  Tersedia:     'text-green-600',
  'Hampir Habis': 'text-orange-500',
  Menipis:          'text-yellow-600',
  Habis:           'text-red-500',
};

// ─── Dropdown Component ───────────────────────────────────────────────────────
const Dropdown = ({ value, onChange, options }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative" onBlur={() => setTimeout(() => setOpen(false), 200)} tabIndex={0}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 pl-4 pr-3 py-2 rounded-lg border border-[#B34949] bg-red-50 text-sm font-medium text-gray-700 min-w-[150px] justify-between"
      >
        {value}
        {open ? <ChevronUp className="w-4 h-4 text-[#B34949]" /> : <ChevronDown className="w-4 h-4 text-[#B34949]" />}
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

const BLANK_FORM = { nama_menu: '', stok: '0', id_kategori: 1, harga: '' };
const ALLOWED_TYPES = ['image/jpeg', 'image/png'];
const ALLOWED_EXTS  = ['.jpg', '.jpeg', '.png'];
const MAX_SIZE_MB   = 2;

// ─── Modal Component ─────────────────────────────────────────────────────────
const Modal = ({ open, onClose, onSave, editData }) => {
  const [form, setForm] = useState(BLANK_FORM);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCatOpen, setIsCatOpen] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    if (open) {
      if (editData) {
        setForm({
          nama_menu: editData.nama || editData.nama_menu || '',
          stok: String(editData.stok ?? '0'),
          id_kategori: editData.id_kategori || editData.kategori_id || 1,
          harga: String(editData.harga ?? '')
        });
        setPreview(editData.image ? getImageUrl(editData.image) : null);
      } else {
        setForm({ ...BLANK_FORM });
        setPreview(null);
      }
      setFile(null);
      setFileError('');
    }
  }, [open, editData]);

  if (!open) return null;

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;

    const ext = '.' + f.name.split('.').pop().toLowerCase();
    if (!ALLOWED_TYPES.includes(f.type) || !ALLOWED_EXTS.includes(ext)) {
      setFileError('❌ Format tidak didukung! Gunakan PNG/JPG.');
      return;
    }

    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      setFileError(`❌ Maksimal ${MAX_SIZE_MB}MB.`);
      return;
    }

    setFileError('');
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSave = async () => {
    if (!form.nama_menu.trim()) return alert('Nama menu harus diisi!');
    if (!form.harga || isNaN(form.harga)) return alert('Harga tidak valid!');

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('nama_menu', form.nama_menu);
    formData.append('stok', form.stok);
    formData.append('id_kategori', form.id_kategori);
    formData.append('harga', form.harga);
    if (file) formData.append('gambar', file);

    const result = await onSave(formData);
    setIsSubmitting(false);
    
    if (result && !result.success) alert(result.message);
  };

  // Mengambil kategori dari categoryMap yang sudah kita tentukan
  const categories = Object.entries(categoryMap).map(([name, id]) => ({ name, id }));

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute right-6 top-6 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">{editData ? 'Edit Menu' : 'Tambah Menu'}</h2>
        <p className="text-sm text-gray-400 mb-6">Lengkapi detail informasi menu di bawah ini.</p>

        <div className="space-y-4">
          {/* Upload Foto */}
          <div onClick={() => !preview && fileRef.current.click()} className="relative w-full h-48 rounded-2xl bg-gray-50 flex items-center justify-center overflow-hidden cursor-pointer border-2 border-dashed border-gray-200">
            {preview ? (
              <>
                <img src={preview} alt="preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button type="button" onClick={(e) => { e.stopPropagation(); fileRef.current.click(); }} className="bg-white p-2 rounded-full"><Pencil className="w-5 h-5 text-orange-500" /></button>
                  <button type="button" onClick={(e) => { e.stopPropagation(); setPreview(null); setFile(null); }} className="bg-white p-2 rounded-full"><Trash2 className="w-5 h-5 text-red-500" /></button>
                </div>
              </>
            ) : (
              <div className="text-center">
                <Plus className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">Unggah Foto Menu</p>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
          {fileError && <p className="text-xs text-red-500 text-center">{fileError}</p>}

          <input
            type="text"
            value={form.nama_menu}
            onChange={e => setForm({ ...form, nama_menu: e.target.value })}
            placeholder="Nama Menu"
            className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:border-[#B34949] text-sm"
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              value={form.harga}
              onChange={e => setForm({ ...form, harga: e.target.value })}
              placeholder="Harga (Rp)"
              className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:border-[#B34949] text-sm"
            />
            <input
              type="number"
              value={form.stok}
              onChange={e => setForm({ ...form, stok: e.target.value })}
              placeholder="Stok"
              className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:border-[#B34949] text-sm"
            />
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsCatOpen(!isCatOpen)}
              className="w-full p-4 border border-gray-200 rounded-xl flex items-center justify-between text-sm text-gray-700"
            >
              {idToCategory[form.id_kategori] || 'Pilih Kategori'}
              <ChevronDown className={`w-4 h-4 transition-transform ${isCatOpen ? 'rotate-180' : ''}`} />
            </button>
            {isCatOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50">
                {categories.map(cat => (
                  <div
                    key={cat.id}
                    onClick={() => { setForm({ ...form, id_kategori: cat.id }); setIsCatOpen(false); }}
                    className="px-4 py-3 text-sm hover:bg-gray-50 cursor-pointer"
                  >
                    {cat.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          <button onClick={onClose} className="flex-1 py-3 text-sm font-bold text-gray-500 bg-gray-100 rounded-xl">Batal</button>
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className={`flex-1 py-3 bg-[#B34949] text-white text-sm font-bold rounded-xl ${isSubmitting ? 'opacity-50' : ''}`}
          >
            {isSubmitting ? 'Proses...' : 'Simpan Menu'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const Menu = () => {
  const { menuItems, tambahMenu, editMenu, hapusMenu, loading } = useOrderContext();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatus] = useState('Semua Status');
  const [kategoriFilter, setKategori] = useState('Semua Kategori');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const PER_PAGE = 10;

  // PERBAIKAN: Gunakan KATEGORI_LIST_FIXED yang sudah kita buat di atas
  // supaya kategori lama (Goreng/Dimsum) tidak muncul lagi di dropdown filter.
  const filtered = menuItems.filter(m => {
    const nama = (m.nama || m.nama_menu || '').toLowerCase();
    const matchesSearch = nama.includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'Semua Status' || getStatus(m.stok) === statusFilter;
    
    // Logika filter kategori: 
    // Kita cek m.category (string) atau konversi m.id_kategori ke nama kategori
    const currentItemCategory = m.category || idToCategory[m.id_kategori];
    const matchesKategori = kategoriFilter === 'Semua Kategori' || currentItemCategory === kategoriFilter;
    
    return matchesSearch && matchesStatus && matchesKategori;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE) || 1;
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleSave = async (formData) => {
    const result = editData ? await editMenu(editData.id, formData) : await tambahMenu(formData);
    if (result?.success) {
      setModal(false);
      setEditData(null);
    }
    return result;
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
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Kelola Menu</h1>
          <p className="text-sm text-gray-400">Manajemen inventaris dan harga menu.</p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari menu..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 outline-none w-64 text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 mb-5">
        <Dropdown value={statusFilter} onChange={setStatus} options={STATUS_LIST} />
        {/* Gunakan KATEGORI_LIST_FIXED di sini */}
        <Dropdown value={kategoriFilter} onChange={setKategori} options={KATEGORI_LIST_FIXED} />
        <button
          onClick={() => { setEditData(null); setModal(true); }}
          className="ml-auto flex items-center gap-2 px-5 py-2 bg-[#B34949] text-white rounded-lg text-sm font-bold"
        >
          <Plus className="w-4 h-4" /> Tambah Menu
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <table className="min-w-full">
          <thead>
            <tr className="bg-[#B34949] text-white">
              {['No', 'Gambar', 'Nama Menu', 'Kategori', 'Harga', 'Stok', 'Status', 'Aksi'].map(h => (
                <th key={h} className="px-6 py-4 text-left text-xs font-bold uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginated.map((item, i) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-600">{(page - 1) * PER_PAGE + i + 1}</td>
                <td className="px-6 py-4">
                  <img src={getImageUrl(item.image)} alt="" className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-800">{item.nama || item.nama_menu}</td>
                {/* Menampilkan nama kategori berdasarkan ID jika item.category kosong */}
                <td className="px-6 py-4 text-sm text-gray-500">{item.category || idToCategory[item.id_kategori] || '-'}</td>
                <td className="px-6 py-4 text-sm font-bold text-gray-900">Rp {Number(item.harga).toLocaleString('id-ID')}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{item.stok}</td>
                <td className={`px-6 py-4 text-sm font-bold ${statusColor[getStatus(item.stok)]}`}>{getStatus(item.stok)}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-3">
                    <button onClick={() => { setEditData(item); setModal(true); }} className="text-orange-500"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteId(item.id)} className="text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-end gap-2 mt-6">
        <button 
            disabled={page === 1} 
            onClick={() => setPage(p => p - 1)}
            className="px-3 py-1 border rounded bg-white disabled:opacity-50"
        >
            Prev
        </button>
        <span className="px-3 py-1 text-sm font-medium">Halaman {page} dari {totalPages}</span>
        <button 
            disabled={page === totalPages} 
            onClick={() => setPage(p => p + 1)}
            className="px-3 py-1 border rounded bg-white disabled:opacity-50"
        >
            Next
        </button>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} onSave={handleSave} editData={editData} />

      {deleteId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[60]">
          <div className="bg-white p-8 rounded-2xl max-w-sm w-full text-center">
            <h3 className="text-xl font-bold mb-2">Hapus Menu?</h3>
            <p className="text-gray-500 text-sm mb-6">Data tidak dapat dikembalikan setelah dihapus.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2 bg-gray-100 rounded-lg font-bold">Batal</button>
              <button onClick={async () => { await hapusMenu(deleteId); setDeleteId(null); }} className="flex-1 py-2 bg-red-600 text-white rounded-lg font-bold">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Menu;
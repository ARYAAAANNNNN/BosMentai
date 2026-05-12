import React, { useState, useEffect, useRef } from 'react';
import { Plus, Pencil, Trash2, X, Search, ChevronUp, ChevronDown } from 'lucide-react';
import { useOrderContext } from '../context/OrderContext';
import { getImageUrl } from '../services/api';

// ─── Mapping Kategori ────────────────────────────────────────────────────────
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
  Tersedia:      'text-green-600',
  'Hampir Habis': 'text-orange-500',
  Menipis:       'text-yellow-600',
  Habis:         'text-red-500',
};

// ─── Dropdown Component ───────────────────────────────────────────────────────
const Dropdown = ({ value, onChange, options }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative" onBlur={() => setTimeout(() => setOpen(false), 200)} tabIndex={0}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 pl-4 pr-3 py-2 rounded-lg border border-[#E13E3E] bg-red-50 text-sm font-medium text-gray-700 min-w-[150px] justify-between"
      >
        {value}
        {open ? <ChevronUp className="w-4 h-4 text-[#E13E3E]" /> : <ChevronDown className="w-4 h-4 text-[#E13E3E]" />}
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-30 min-w-[160px] overflow-hidden">
          {options.map(opt => (
            <div
              key={opt}
              onMouseDown={() => { onChange(opt); setOpen(false); }}
              className={`px-4 py-2.5 text-sm cursor-pointer transition-colors border-b border-gray-200 last:border-b-0 ${
                opt === value ? 'bg-red-50 text-[#E13E3E] font-bold' : 'text-gray-700 hover:bg-gray-50'
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

  const categories = Object.entries(categoryMap).map(([name, id]) => ({ name, id }));

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 text-sans">
      <div className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute right-6 top-6 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">{editData ? 'Edit Menu' : 'Tambah Menu'}</h2>
        <p className="text-sm text-gray-400 mb-6">Lengkapi detail informasi menu di bawah ini.</p>

        <div className="space-y-4">
          <div onClick={() => !preview && fileRef.current.click()} className="relative w-full h-48 rounded-2xl bg-gray-50 flex items-center justify-center overflow-hidden cursor-pointer border-2 border-dashed border-gray-200">
            {preview ? (
              <>
                <img src={preview} alt="preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button type="button" onClick={(e) => { e.stopPropagation(); fileRef.current.click(); }} className="bg-white p-2 rounded-full shadow-sm"><Pencil className="w-5 h-5 text-orange-500" /></button>
                  <button type="button" onClick={(e) => { e.stopPropagation(); setPreview(null); setFile(null); }} className="bg-white p-2 rounded-full shadow-sm"><Trash2 className="w-5 h-5 text-red-500" /></button>
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
            className="w-full p-4 border border-gray-100 rounded-2xl outline-none focus:border-[#E13E3E] text-sm bg-gray-50/50"
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              value={form.harga}
              onChange={e => setForm({ ...form, harga: e.target.value })}
              placeholder="Harga (Rp)"
              className="w-full p-4 border border-gray-100 rounded-2xl outline-none focus:border-[#E13E3E] text-sm bg-gray-50/50"
            />
            <input
              type="number"
              value={form.stok}
              onChange={e => setForm({ ...form, stok: e.target.value })}
              placeholder="Stok"
              className="w-full p-4 border border-gray-100 rounded-2xl outline-none focus:border-[#E13E3E] text-sm bg-gray-50/50"
            />
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsCatOpen(!isCatOpen)}
              className="w-full p-4 border border-gray-100 rounded-2xl flex items-center justify-between text-sm text-gray-700 bg-gray-50/50"
            >
              {idToCategory[form.id_kategori] || 'Pilih Kategori'}
              <ChevronDown className={`w-4 h-4 transition-transform ${isCatOpen ? 'rotate-180' : ''}`} />
            </button>
            {isCatOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-xl z-50">
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
          <button onClick={onClose} className="flex-1 py-4 text-sm font-bold text-gray-400 bg-gray-100 rounded-2xl transition-all active:scale-95">Batal</button>
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className={`flex-1 py-4 bg-[#E13E3E] text-white text-sm font-bold rounded-2xl transition-all active:scale-95 shadow-lg shadow-red-100 ${isSubmitting ? 'opacity-50' : 'hover:bg-red-700'}`}
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

  const filtered = menuItems.filter(m => {
    const nama = (m.nama || m.nama_menu || '').toLowerCase();
    const matchesSearch = nama.includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'Semua Status' || getStatus(m.stok) === statusFilter;
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E13E3E]"></div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-[#F9FAFB] min-h-screen font-sans">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Menu</h1>
          <p className="text-sm text-gray-500">Manajemen inventaris dan harga menu.</p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari menu..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-10 pr-4 py-2 rounded-xl border border-gray-100 outline-none w-64 text-sm shadow-sm bg-white"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <Dropdown value={statusFilter} onChange={setStatus} options={STATUS_LIST} />
        <Dropdown value={kategoriFilter} onChange={setKategori} options={KATEGORI_LIST_FIXED} />
        <button
          onClick={() => { setEditData(null); setModal(true); }}
          className="ml-auto flex items-center gap-2 px-6 py-2.5 bg-[#E13E3E] hover:bg-red-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-100 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" /> Tambah Menu
        </button>
      </div>

      <div className="bg-white rounded-[24px] shadow-sm overflow-hidden border border-gray-100">
        <table className="min-w-full">
          <thead>
            {/* WARNA MERAH DISAMAKAN DENGAN SIDEBAR SESUAI image_d116d2.png */}
            <tr className="bg-[#E13E3E] text-white">
              {['No', 'Gambar', 'Nama Menu', 'Kategori', 'Harga', 'Stok', 'Status', 'Aksi'].map(h => (
                <th key={h} className={`px-6 py-5 text-left text-xs font-bold uppercase ${h === 'No' || h === 'Aksi' ? 'text-center' : ''}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {paginated.map((item, i) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-400 text-center font-medium">{(page - 1) * PER_PAGE + i + 1}</td>
                <td className="px-6 py-4">
                  <img src={getImageUrl(item.image)} alt="" className="w-12 h-12 rounded-xl object-cover bg-gray-50 border border-gray-100 shadow-sm" />
                </td>
                <td className="px-6 py-4 text-sm font-bold text-gray-800">{item.nama || item.nama_menu}</td>
                <td className="px-6 py-4">
                   <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-[11px] font-bold">
                    {item.category || idToCategory[item.id_kategori] || '-'}
                   </span>
                </td>
                <td className="px-6 py-4 text-sm font-black text-gray-900">Rp {Number(item.harga).toLocaleString('id-ID')}</td>
                <td className="px-6 py-4 text-sm text-gray-600 font-bold">{item.stok}</td>
                <td className={`px-6 py-4 text-xs font-black ${statusColor[getStatus(item.stok)]}`}>{getStatus(item.stok).toUpperCase()}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2 justify-center">
                    <button onClick={() => { setEditData(item); setModal(true); }} className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition-all"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteId(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-end items-center gap-4 mt-8">
        <span className="text-sm text-gray-400 font-medium">Halaman {page} dari {totalPages}</span>
        <div className="flex gap-2">
          <button 
              disabled={page === 1} 
              onClick={() => setPage(p => p - 1)}
              className="p-2 border border-gray-100 rounded-xl bg-white disabled:opacity-30 shadow-sm transition-all active:scale-90"
          >
              <ChevronUp className="-rotate-90 w-5 h-5 text-gray-600" />
          </button>
          <button 
              disabled={page === totalPages} 
              onClick={() => setPage(p => p + 1)}
              className="p-2 border border-gray-100 rounded-xl bg-white disabled:opacity-30 shadow-sm transition-all active:scale-90"
          >
              <ChevronDown className="-rotate-90 w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} onSave={handleSave} editData={editData} />

      {deleteId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white p-8 rounded-[32px] max-w-sm w-full text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-[#E13E3E]">
               <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">Hapus Menu?</h3>
            <p className="text-gray-500 text-sm mb-6">Data tidak dapat dikembalikan setelah dihapus.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-3 bg-gray-100 rounded-2xl font-bold text-gray-400">Batal</button>
              <button onClick={async () => { await hapusMenu(deleteId); setDeleteId(null); }} className="flex-1 py-3 bg-[#E13E3E] text-white rounded-2xl font-bold shadow-lg shadow-red-100">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Menu;
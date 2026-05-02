import React from 'react';
import { Store, Settings as SettingsIcon, Bell, Globe, Save, RotateCcw } from 'lucide-react';
import Button from '../components/Button';

const Settings = () => {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Settings</h1>
        <p className="text-sm text-gray-500 font-medium">Konfigurasi toko dan preferensi sistem</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Restaurant Info */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-50 rounded-lg text-[#B34949]">
              <Store className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Info Restoran</h2>
          </div>
          
          <div className="space-y-5">
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase ml-1 mb-2">Nama Restoran</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-red-200 transition-all outline-none font-medium" 
                defaultValue="Bos Mentai & Dimsum" 
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase ml-1 mb-2">Alamat</label>
              <textarea 
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-red-200 transition-all outline-none font-medium" 
                rows="3" 
                defaultValue="Jl. Mentai Raya No. 45, Jakarta Selatan" 
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase ml-1 mb-2">Nomor Telepon</label>
              <input 
                type="tel" 
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-red-200 transition-all outline-none font-medium" 
                defaultValue="0812-9988-7766" 
              />
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-50 rounded-lg text-[#B34949]">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Pengaturan Sistem</h2>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl transition-all hover:bg-red-50/30 group">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-gray-400 group-hover:text-[#B34949]" />
                <label htmlFor="auto-order" className="text-sm font-bold text-gray-700 cursor-pointer">Notifikasi Dapur Otomatis</label>
              </div>
              <input 
                type="checkbox" 
                id="auto-order" 
                className="w-5 h-5 rounded-md border-gray-300 text-[#B34949] focus:ring-[#B34949] cursor-pointer" 
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl transition-all hover:bg-red-50/30 group">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-gray-400 group-hover:text-[#B34949]" />
                <label htmlFor="online-order" className="text-sm font-bold text-gray-700 cursor-pointer">Terima Pesanan Online</label>
              </div>
              <input 
                type="checkbox" 
                id="online-order" 
                className="w-5 h-5 rounded-md border-gray-300 text-[#B34949] focus:ring-[#B34949] cursor-pointer" 
                defaultChecked 
              />
            </div>

            <div className="pt-2">
              <label className="block text-[11px] font-bold text-gray-400 uppercase ml-1 mb-2">Pajak Restoran (%)</label>
              <input 
                type="number" 
                step="0.01" 
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-red-200 transition-all outline-none font-medium" 
                defaultValue="10" 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-10 flex flex-wrap gap-4">
        <Button className="px-10 py-3 rounded-full flex items-center gap-2 shadow-lg shadow-red-100 font-bold">
          <Save className="w-4 h-4" />
          SIMPAN PERUBAHAN
        </Button>
        <button className="px-10 py-3 rounded-full flex items-center gap-2 font-bold text-gray-400 hover:text-gray-600 transition-all border border-gray-200">
          <RotateCcw className="w-4 h-4" />
          RESET DEFAULT
        </button>
      </div>
    </div>
  );
};

export default Settings;

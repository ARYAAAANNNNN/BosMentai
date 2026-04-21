import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Home, ClipboardList, UtensilsCrossed, BarChart3, ArrowLeftRight, LogOut } from "lucide-react";

const Sidebar = () => {
  const baseStyle = "flex items-center px-2 py-2.5 cursor-pointer transition-all text-[13px] rounded-lg";
  const location = useLocation();
  const isHome = location.pathname === "/admin";

  const activeStyle = "bg-[#E53E3E] text-white shadow-md shadow-red-100 font-semibold";
  const inactiveStyle = "text-[#718096] hover:bg-gray-50 font-medium";

  return (
    <div className="sidebar w-full h-full bg-white flex flex-col pt-8 pb-8 shadow-sm border-r border-gray-200 justify-between print:hidden">
      
      <div>
        <div className="px-6 mb-10 flex justify-center">
          <h1 className="text-xl font-black text-[#1A202C] tracking-tight">
            BosMentai<span className="text-[#E53E3E]">.</span>
          </h1>
        </div>

        <nav className="px-3 space-y-1">
          <NavLink
            to="/admin"
            className={`${baseStyle} mx-3 ${isHome ? activeStyle : inactiveStyle}`}
          >
            <Home size={18} className="mr-3" />
            <span>Beranda</span>
          </NavLink>

          <NavLink
            to="/admin/orders"
            className={({ isActive }) => `${baseStyle} mx-3 ${isActive ? activeStyle : inactiveStyle}`}
          >
            <ClipboardList size={18} className="mr-3" />
            <span>Kelola Pesanan</span>
          </NavLink>

          <NavLink
            to="/admin/menu"
            className={({ isActive }) => `${baseStyle} mx-3 ${isActive ? activeStyle : inactiveStyle}`}
          >
            <UtensilsCrossed size={18} className="mr-3" />
            <span>Kelola Menu</span>
          </NavLink>

          <NavLink
            to="/admin/reports"
            className={({ isActive }) => `${baseStyle} mx-3 ${isActive ? activeStyle : inactiveStyle}`}
          >
            <BarChart3 size={18} className="mr-3" />
            <span>Laporan Penjualan</span>
          </NavLink>
        </nav>
      </div>

      <div className="px-3 space-y-1 border-t border-gray-100 pt-4">

        <div className={`${baseStyle} mx-3 text-[#718096] hover:bg-gray-50 font-medium`} onClick={() => window.location.href = "http://localhost:5173"}>
          <ArrowLeftRight size={18} className="mr-3" />
          <span>Beralih ke user</span>
        </div>



        <button className={`${baseStyle} mx-3 text-[#718096] hover:bg-red-50 hover:text-red-500 font-medium w-full group`} onClick={() => window.location.href = '/login'}>
          <LogOut size={18} className="mr-3 group-hover:text-red-500" />
          <span>Logout</span>
        </button>

      </div>
    </div>
  );
};

export default Sidebar;


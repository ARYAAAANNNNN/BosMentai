import React, { useState, useEffect, useCallback } from "react";
import { Armchair } from "lucide-react";
import { STORAGE_URL, statsAPI } from "../sevices/api";

/**
 * RecentOrders
 * Prioritas sumber data:
 *   1. prop `orders` (custom/hardcode)
 *   2. API /api/stats/recent-orders (real-time, polling 15 detik)
 */
export default function RecentOrders({ orders: customOrders }) {
  const [apiOrders, setApiOrders] = useState([]);

  const fetchOrders = useCallback(async () => {
    // Jika ada prop, tidak perlu fetch
    if (customOrders !== undefined) return;
    try {
      const json = await statsAPI.getRecentOrders();
      if (json.success && Array.isArray(json.data)) {
        setApiOrders(json.data);
      }
    } catch {
      // silent — tetap tampilkan state sebelumnya
    }
  }, [customOrders]);

  useEffect(() => {
    fetchOrders();
    const id = setInterval(fetchOrders, 15_000);
    return () => clearInterval(id);
  }, [fetchOrders]);

  // Pilih sumber data aktif
  const rawOrders = customOrders ?? apiOrders;

  // Normalise field agar komponen hanya butuh: title, subtitle, meta, imgValue, statusColor
  const orders = rawOrders.map((order) => {
    const title    = order.meja !== undefined
      ? `Meja ${order.meja}`
      : order.table_name ?? order.table ?? order.name ?? "—";
    const subtitle = order.menu ?? order.item ?? order.subtitle ?? "";
    const meta     = order.waktu ?? order.time ?? order.count ?? "";
    const imgValue = order.img || (order.items && order.items[0]?.gambar);
    const status   = order.status ?? order.status_pesanan ?? "";

    const statusColor =
      status === "Selesai"   ? "#16a34a" :
      status === "Diproses"  ? "#d97706" :
      status === "Menunggu"  ? "#3b82f6" : "#6b7280";

    return { id: order.id ?? order.id_pesanan, title, subtitle, meta, imgValue, status, statusColor };
  });

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", width: "100%", display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1A202C", margin: 0 }}>
          Pesanan Terbaru
        </h2>
        {/* live dot */}
        <div style={{ display: "flex", alignItems: "center", gap: 5,
          background: "#dcfce7", color: "#16a34a",
          fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, border: "1px solid #bbf7d0" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#16a34a", display: "inline-block", animation: "pulse 1.5s infinite" }} />
          Live
        </div>
      </div>

      {/* List */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        {orders.length === 0 ? (
          <p style={{ fontSize: 13, color: "#9CA3AF", textAlign: "center", padding: "24px 0" }}>
            Tidak ada pesanan baru
          </p>
        ) : (
          orders.map((order, index) => {
            const hasUrl   = typeof order.imgValue === "string" &&
                             (order.imgValue.startsWith("http") || order.imgValue.startsWith("/"));
            const isLast   = index === orders.length - 1;

            return (
              <div
                key={order.id ?? index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "8px 0",
                  borderBottom: isLast ? "none" : "1px solid #F1F5F9",
                  gap: 10,
                }}
              >
                {/* Avatar / foto */}
                <div style={{
                  width: 40, height: 40, borderRadius: 10, overflow: "hidden",
                  flexShrink: 0, background: "#F1F5F9",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {order.imgValue ? (
                    hasUrl ? (
                      <img
                        src={order.imgValue.startsWith("http") ? order.imgValue : `${STORAGE_URL}${order.imgValue}`}
                        alt={order.subtitle || order.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      />
                    ) : (
                      <span style={{ fontSize: 18 }}>{order.imgValue}</span>
                    )
                  ) : (
                    <div style={{ width: "100%", height: "100%", background: "#fef2f2", borderRadius: 10,
                      display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Armchair size={20} color="#e53e3e" strokeWidth={2} />
                    </div>
                  )}
                </div>

                {/* Nama meja */}
                <span style={{ fontSize: 13, fontWeight: 700, color: "#1A202C", flex: 1 }}>
                  {order.title}
                </span>

                {/* Menu */}
                <span style={{ fontSize: 12, color: "#4B5563", flex: 1, textAlign: "center" }}>
                  {order.subtitle}
                </span>

                {/* Status badge */}
                {order.status && (
                  <span style={{
                    fontSize: 10, fontWeight: 700,
                    color: order.statusColor,
                    background: `${order.statusColor}15`,
                    padding: "2px 8px", borderRadius: 20,
                    border: `1px solid ${order.statusColor}40`,
                    whiteSpace: "nowrap", flexShrink: 0,
                  }}>
                    {order.status}
                  </span>
                )}

                {/* Waktu */}
                <span style={{ fontSize: 11, color: "#6B7280", fontWeight: 500, whiteSpace: "nowrap", flexShrink: 0, marginLeft: 4 }}>
                  {order.meta}
                </span>
              </div>
            );
          })
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>
    </div>
  );
}

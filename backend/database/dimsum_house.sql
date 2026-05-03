  -- phpMyAdmin SQL Dump
  -- version 5.2.1
  -- https://www.phpmyadmin.net/
  --
  -- Host: 127.0.0.1
  -- Waktu pembuatan: 12 Apr 2026 pada 11.31
  -- Versi server: 10.4.32-MariaDB
  -- Versi PHP: 8.1.25

  SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
  START TRANSACTION;
  SET time_zone = "+00:00";


  /*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
  /*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
  /*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
  /*!40101 SET NAMES utf8mb4 */;

  --
  -- Database: `dimsum_house`
  --

  -- --------------------------------------------------------

  --
  -- Struktur dari tabel `auth_sessions`
  --

  CREATE TABLE `auth_sessions` (
    `id_session` char(64) NOT NULL COMMENT 'Random hex 32-byte token',
    `id_user` int(10) UNSIGNED NOT NULL,
    `ip_address` varchar(45) DEFAULT NULL,
    `user_agent` varchar(300) DEFAULT NULL,
    `expired_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    `created_at` timestamp NOT NULL DEFAULT current_timestamp()
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Server-side session';

  -- --------------------------------------------------------

  --
  -- Struktur dari tabel `detail_pesanan`
  --

  CREATE TABLE `detail_pesanan` (
    `id_detail` int(10) UNSIGNED NOT NULL,
    `id_pesanan` int(10) UNSIGNED NOT NULL,
    `id_menu` int(10) UNSIGNED NOT NULL,
    `jumlah` tinyint(3) UNSIGNED NOT NULL DEFAULT 1 COMMENT 'Validasi: 1-255'
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Item per pesanan';

  --
  -- Dumping data untuk tabel `detail_pesanan`
  --

  INSERT INTO `detail_pesanan` (`id_detail`, `id_pesanan`, `id_menu`, `jumlah`) VALUES
  (6, 2, 1, 4),
  (7, 2, 2, 2),
  (8, 2, 6, 2),
  (9, 2, 35, 2),
  (10, 2, 36, 1),
  (11, 3, 30, 3),
  (12, 3, 15, 2),
  (13, 3, 36, 2),
  (14, 3, 42, 2),
  (19, 5, 11, 4),
  (20, 5, 38, 1),
  (21, 5, 35, 2),
  (22, 5, 21, 3),
  (23, 6, 1, 2),
  (24, 6, 6, 2),
  (25, 6, 25, 3),
  (26, 6, 36, 4),
  (31, 8, 1, 4),
  (32, 8, 2, 2),
  (33, 8, 35, 3),
  (34, 8, 36, 3),
  (46, 12, 1, 2),
  (47, 12, 6, 2),
  (48, 12, 35, 4),
  (49, 12, 36, 5),
  (77, 21, 20, 2),
  (78, 21, 35, 2),
  (79, 21, 36, 3),
  (87, 24, 1, 2),
  (88, 24, 2, 2),
  (89, 24, 35, 4),
  (90, 24, 36, 5),
  (239, 130, 39, 1),
  (240, 131, 14, 1),
  (241, 131, 13, 1),
  (242, 131, 12, 1),
  (243, 132, 12, 1),
  (244, 132, 13, 1),
  (245, 133, 79, 1),
  (246, 133, 76, 1),
  (247, 134, 78, 1),
  (248, 134, 81, 1),
  (249, 134, 77, 1);

  

  -- --------------------------------------------------------

  --
  -- Struktur dari tabel `laporan_penjualan_harian`
  --

  CREATE TABLE `laporan_penjualan_harian` (
    `id_laporan` int(10) UNSIGNED NOT NULL,
    `tanggal` date NOT NULL,
    `total_pesanan` smallint(5) UNSIGNED NOT NULL DEFAULT 0,
    `total_item` int(10) UNSIGNED NOT NULL DEFAULT 0,
    `total_meja` tinyint(3) UNSIGNED NOT NULL DEFAULT 0,
    `pendapatan_harian` decimal(12,0) NOT NULL DEFAULT 0 COMMENT 'flat_rate × pesanan Selesai',
    `pct_dimsum` decimal(5,2) NOT NULL DEFAULT 0.00,
    `pct_goreng` decimal(5,2) NOT NULL DEFAULT 0.00,
    `pct_dessert` decimal(5,2) NOT NULL DEFAULT 0.00,
    `pct_minuman` decimal(5,2) NOT NULL DEFAULT 0.00,
    `pct_menu_lain` decimal(5,2) NOT NULL DEFAULT 0.00,
    `pertumbuhan_pct` decimal(6,2) DEFAULT NULL COMMENT '+/-% vs hari sebelumnya',
    `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
    `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Snapshot laporan harian — diisi oleh event scheduler';

  --
  -- Dumping data untuk tabel `laporan_penjualan_harian`
  --

  INSERT INTO `laporan_penjualan_harian` (`id_laporan`, `tanggal`, `total_pesanan`, `total_item`, `total_meja`, `pendapatan_harian`, `pct_dimsum`, `pct_goreng`, `pct_dessert`, `pct_minuman`, `pct_menu_lain`, `pertumbuhan_pct`, `created_at`, `updated_at`) VALUES
  (1, '2024-12-01', 80, 480, 25, 6000000, 35.00, 15.00, 18.00, 20.00, 12.00, NULL, '2026-04-06 00:31:18', '2026-04-06 00:31:18'),
  (2, '2024-12-08', 130, 780, 30, 9750000, 35.00, 14.50, 18.50, 20.00, 12.00, 62.50, '2026-04-06 00:31:18', '2026-04-06 00:31:18'),
  (3, '2024-12-16', 95, 570, 28, 7125000, 34.50, 15.00, 18.00, 20.50, 12.00, -26.92, '2026-04-06 00:31:18', '2026-04-06 00:31:18'),
  (4, '2024-12-24', 190, 1140, 30, 14250000, 35.50, 14.00, 18.00, 20.00, 12.50, 100.00, '2026-04-06 00:31:18', '2026-04-06 00:31:18'),
  (5, '2024-12-31', 155, 930, 30, 11625000, 35.00, 15.00, 18.00, 20.00, 12.00, -18.42, '2026-04-06 00:31:18', '2026-04-06 00:31:18'),
  (6, '2025-01-15', 30, 180, 30, 2250000, 35.00, 15.00, 18.00, 20.00, 12.00, -80.65, '2026-04-06 00:31:18', '2026-04-06 00:31:18');

  -- --------------------------------------------------------

  --
  -- Struktur dari tabel `menu`
  --

  CREATE TABLE `menu` (
    `id_menu` int(10) UNSIGNED NOT NULL,
    `nama_menu` varchar(150) NOT NULL,
    `gambar` varchar(255) DEFAULT NULL COMMENT 'Path: /uploads/menus/<hex>.ext',
    `stok` smallint(5) UNSIGNED NOT NULL DEFAULT 0,
    `status` enum('tersedia','menipis','hampir_habis','habis') NOT NULL DEFAULT 'tersedia' COMMENT 'tersedia>20 | menipis6-20 | hampir_habis1-5 | habis=0',
    `total_dipesan` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Akumulasi total dipesan',
    `is_active` tinyint(1) NOT NULL DEFAULT 1 COMMENT '0 = soft delete',
    `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
    `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Master menu';

  --
  -- Dumping data untuk tabel `menu`
  --

  INSERT INTO `menu` (`id_menu`, `nama_menu`, `gambar`, `id_kategori`, `stok`, `status`, `total_dipesan`, `is_active`, `created_at`, `updated_at`) VALUES
  (1, 'Siomay Udang', '/uploads/menus/siomay_udang.jpg', 1, 80, 'tersedia', 245, 0, '2026-04-06 00:31:18', '2026-04-11 03:59:32'),
  (2, 'Siomay Ayam', '/uploads/menus/siomay_ayam.jpg', 1, 75, 'tersedia', 198, 0, '2026-04-06 00:31:18', '2026-04-11 03:59:48'),
  (3, 'Siomay Ikan', '/uploads/menus/siomay_ikan.jpg', 1, 60, 'tersedia', 120, 0, '2026-04-06 00:31:18', '2026-04-11 03:59:50'),
  (4, 'Siomay Cumi', '/uploads/menus/siomay_cumi.jpg', 1, 15, 'menipis', 88, 0, '2026-04-06 00:31:18', '2026-04-10 23:13:57'),
  (5, 'Siomay Kepiting', '/uploads/menus/siomay_kepiting.jpg', 1, 0, 'habis', 55, 0, '2026-04-06 00:31:18', '2026-04-11 03:59:53'),
  (6, 'Hakau Udang', '/uploads/menus/hakau_udang.jpg', 1, 90, 'tersedia', 310, 0, '2026-04-06 00:31:18', '2026-04-11 03:59:45'),
  (7, 'Hakau Ayam', '/uploads/menus/hakau_ayam.jpg', 1, 55, 'tersedia', 175, 0, '2026-04-06 00:31:18', '2026-04-11 03:34:44'),
  (8, 'Hakau Jamur', '/uploads/menus/hakau_jamur.jpg', 1, 40, 'tersedia', 95, 0, '2026-04-06 00:31:18', '2026-04-11 03:34:49'),
  (9, 'Hakau Sayuran', '/uploads/menus/hakau_sayuran.jpg', 1, 18, 'menipis', 62, 0, '2026-04-06 00:31:18', '2026-04-11 03:59:42'),
  (10, 'Hakau Ikan', '/uploads/menus/hakau_ikan.jpg', 1, 0, 'habis', 40, 0, '2026-04-06 00:31:18', '2026-04-11 03:59:36'),
  (11, 'Hakau Hargow', '/uploads/menus/hakau_hargow.jpg', 1, 35, 'tersedia', 126, 0, '2026-04-06 00:31:18', '2026-04-10 23:13:57'),
  (12, 'Cheung Fun Udang', 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=400&q=80', 1, 48, 'tersedia', 145, 0, '2026-04-06 00:31:18', '2026-04-10 23:04:15'),
  (13, 'Cheung Fun Daging', 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&q=80', 1, 43, 'tersedia', 130, 0, '2026-04-06 00:31:18', '2026-04-10 23:04:13'),
  (14, 'Char Siu Bao', 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=400&q=80', 1, 69, 'tersedia', 220, 0, '2026-04-06 00:31:18', '2026-04-10 23:04:10'),
  (15, 'Bao Coklat', 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=400&q=80', 1, 45, 'tersedia', 110, 0, '2026-04-06 00:31:18', '2026-04-10 23:04:06'),
  (16, 'Bao Custard Manis', '/uploads/menus/bao_custard.jpg', 1, 0, 'habis', 840, 0, '2026-04-06 00:31:18', '2026-04-10 23:04:08'),
  (17, 'Lo Mai Gai', '/uploads/menus/lo_mai_gai.jpg', 1, 30, 'tersedia', 78, 0, '2026-04-06 00:31:18', '2026-04-10 23:04:51'),
  (18, 'Wu Gok', '/uploads/menus/wu_gok.jpg', 1, 25, 'tersedia', 66, 0, '2026-04-06 00:31:18', '2026-04-10 23:04:27'),
  (19, 'Turnip Cake', '/uploads/menus/turnip_cake.jpg', 1, 35, 'tersedia', 55, 0, '2026-04-06 00:31:18', '2026-04-11 03:59:29'),
  (20, 'Taro Dumpling', '/uploads/menus/taro_dumpling.jpg', 1, 28, 'tersedia', 49, 0, '2026-04-06 00:31:18', '2026-04-10 23:04:24'),
  (21, 'Spring Roll', '/uploads/menus/spring_roll.jpg', 1, 60, 'tersedia', 188, 0, '2026-04-06 00:31:18', '2026-04-10 23:04:25'),
  (22, 'Gyoza Udang', '/uploads/menus/gyoza_udang.jpg', 1, 55, 'tersedia', 155, 0, '2026-04-06 00:31:18', '2026-04-11 01:38:29'),
  (23, 'Gyoza Ayam', '/uploads/menus/gyoza_ayam.jpg', 1, 50, 'tersedia', 142, 0, '2026-04-06 00:31:18', '2026-04-11 03:34:42'),
  (24, 'Xiao Long Bao', '/uploads/menus/xiao_long_bao.jpg', 1, 40, 'tersedia', 210, 0, '2026-04-06 00:31:18', '2026-04-11 03:59:22'),
  (25, 'Shumai Klasik', '/uploads/menus/shumai_klasik.jpg', 1, 65, 'tersedia', 195, 0, '2026-04-06 00:31:18', '2026-04-10 23:04:45'),
  (26, 'Tofu Goreng', '/uploads/menus/tofu_goreng.jpg', 1, 10, 'menipis', 73, 0, '2026-04-06 00:31:18', '2026-04-10 23:04:20'),
  (27, 'Dim Sum Campur', '/uploads/menus/dimsum_campur.jpg', 1, 38, 'tersedia', 102, 0, '2026-04-06 00:31:18', '2026-04-11 03:59:39'),
  (28, 'Rice Paper Roll', '/uploads/menus/rice_paper_roll.jpg', 1, 22, 'tersedia', 60, 0, '2026-04-06 00:31:18', '2026-04-10 23:04:48'),
  (29, 'Dimsum Ayam Pedas', '/uploads/menus/dimsum_ayam_pedas.jpg', 8, 7, 'menipis', 126, 0, '2026-04-06 00:31:18', '2026-04-11 04:00:01'),
  (30, 'Dimsum Udang Keju', 'https://gofood.co.id/en/jakarta/restaurant/dimsum-udang-keju-tigaraksa-kp-ciatuy-sodong-tigaraksa-3b37bd4f-3d5b-4e19-8216-5139bc5cebca', 8, 12, 'tersedia', 55, 0, '2026-04-06 00:31:18', '2026-04-11 04:00:04'),
  (31, 'Cakwe Goreng', '/uploads/menus/cakwe_goreng.jpg', 4, 45, 'tersedia', 88, 0, '2026-04-06 00:31:18', '2026-04-10 23:47:47'),
  (32, 'Tahu Crispy', '/uploads/menus/tahu_crispy.jpg', 4, 4, 'hampir_habis', 52, 0, '2026-04-06 00:31:18', '2026-04-10 23:04:57'),
  (33, 'Bakso Goreng', '/uploads/menus/bakso_goreng.jpg', 4, 30, 'tersedia', 67, 0, '2026-04-06 00:31:18', '2026-04-11 03:59:24'),
  (34, 'Niku Baso', '/uploads/menus/niku_baso.jpg', 4, 25, 'tersedia', 80, 0, '2026-04-06 00:31:18', '2026-04-11 03:59:27'),
  (35, 'Air Mineral', 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&q=80', 5, 200, 'tersedia', 420, 0, '2026-04-06 00:31:18', '2026-04-10 23:47:44'),
  (36, 'Es Teh Manis', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80', 5, 150, 'tersedia', 390, 0, '2026-04-06 00:31:18', '2026-04-10 23:47:42'),
  (37, 'Es Teh Tawar', 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&q=80', 5, 50, 'tersedia', 180, 0, '2026-04-06 00:31:18', '2026-04-10 23:47:49'),
  (38, 'Jus Jeruk', 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400&q=80', 5, 80, 'tersedia', 115, 0, '2026-04-06 00:31:18', '2026-04-10 23:47:06'),
  (39, 'Teh Panas', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80', 5, 99, 'tersedia', 98, 0, '2026-04-06 00:31:18', '2026-04-11 03:59:56'),
  (40, 'Green Tea', '/uploads/menus/41a76c17ddb1f7c10e0b8c3b146f088e.jpg', 5, 75, 'tersedia', 72, 0, '2026-04-06 00:31:18', '2026-04-10 23:46:52'),
  (41, 'Lemon Tea', '/uploads/menus/lemon_tea.jpg', 5, 3, 'hampir_habis', 44, 0, '2026-04-06 00:31:18', '2026-04-10 23:47:12'),
  (42, 'Egg Tart', '/uploads/menus/egg_tart.jpg', 6, 45, 'tersedia', 155, 0, '2026-04-06 00:31:18', '2026-04-10 23:47:24'),
  (43, 'Mango Pudding', '/uploads/menus/mango_pudding.jpg', 6, 30, 'tersedia', 90, 0, '2026-04-06 00:31:18', '2026-04-10 23:47:32'),
  (44, 'Sesame Ball', '/uploads/menus/sesame_ball.jpg', 6, 50, 'tersedia', 110, 0, '2026-04-06 00:31:18', '2026-04-11 03:59:58'),
  (45, 'Almond Jelly', '/uploads/menus/almond_jelly.jpg', 6, 20, 'menipis', 55, 0, '2026-04-06 00:31:18', '2026-04-10 23:47:19'),
  (46, 'Red Bean Soup', '/uploads/menus/red_bean_soup.jpg', 6, 35, 'tersedia', 48, 0, '2026-04-06 00:31:18', '2026-04-10 23:47:52'),
  (47, 'Bakpao Ayam', 'https://images.unsplash.com/photo-1609167830220-7164aa360951?w=400&q=80', 1, 40, 'tersedia', 95, 0, '2026-04-06 00:31:18', '2026-04-06 00:51:21'),
  (67, 'MIE AYAM', 'https:anjay', 8, 50, 'menipis', 6, 0, '2026-04-08 13:48:37', '2026-04-10 21:30:22'),
  (68, 'Hakau Scallop', NULL, 1, 40, 'tersedia', 0, 0, '2026-04-08 13:55:46', '2026-04-10 23:13:57'),
  (69, 'Bakpao Merah', '/uploads/menus/f2ea4d4f04295d63b30359eccc014de6.png', 6, 40, 'tersedia', 0, 0, '2026-04-10 21:31:39', '2026-04-10 23:47:21'),
  (70, 'daging manusia', '/uploads/menus/b0d5734350097cd21a7826ba5091b016.jpeg', 8, 20, 'menipis', 0, 0, '2026-04-11 01:41:02', '2026-04-11 03:42:20'),
  (71, 'Lemon Tea', '/uploads/menus/6e6fd6235edf6a0ea35abfdc9933b205.jpg', 5, 60, 'tersedia', 0, 1, '2026-04-11 03:35:27', '2026-04-11 03:35:27'),
  (72, 'Dimsum Udang', '/uploads/menus/429e7ca016223fe7e34f9f521219dce5.jpg', 1, 20, 'menipis', 0, 0, '2026-04-11 04:33:45', '2026-04-11 05:32:57'),
  (73, 'Test Dimsum Baru', NULL, 1, 15, 'menipis', 0, 0, '2026-04-11 04:34:46', '2026-04-11 05:32:54'),
  (74, 'Dimsum Ayam', '/uploads/menus/18142b56f6e68edad833acdf8ee9f64d.jpg', 1, 67, 'tersedia', 0, 1, '2026-04-11 05:33:44', '2026-04-11 05:33:44'),
  (75, 'Dimsum Udang Keju', '/uploads/menus/d229a46aeed79c735cc9a729fd6e3a54.jpg', 1, 45, 'tersedia', 0, 1, '2026-04-11 05:34:09', '2026-04-11 05:34:09'),
  (76, 'Es Teh Manis', '/uploads/menus/01ecaa5c5d4080ec5c2b4cd28c979638.jpg', 5, 99, 'tersedia', 0, 1, '2026-04-11 05:34:38', '2026-04-11 15:53:35'),
  (77, 'Es Krim Coklat', '/uploads/menus/9831ed14a30cfbadf5a2c8a9a29fc8dc.jpg', 6, 29, 'tersedia', 0, 1, '2026-04-11 05:36:42', '2026-04-11 15:50:33'),
  (78, 'Es Krim Strawberyy', '/uploads/menus/d8de99d096f7ad0756eb115a013fa0b7.jpg', 6, 33, 'tersedia', 0, 1, '2026-04-11 05:37:39', '2026-04-11 15:50:33'),
  (79, 'Pangsit Goreng', '/uploads/menus/225861daa382e009a19c2959164d3314.jpg', 4, 49, 'tersedia', 0, 1, '2026-04-11 05:38:04', '2026-04-11 15:46:41'),
  (80, 'Lumpia Ayam', '/uploads/menus/2acd31988cebe1ba2fcaea62f82e9a22.jpg', 4, 25, 'tersedia', 0, 1, '2026-04-11 05:38:38', '2026-04-11 05:38:38'),
  (81, 'Bubur Ketan Hitam', '/uploads/menus/3c9bde46f9891218047d70d7fd40c9a3.jpg', 8, 19, 'menipis', 0, 1, '2026-04-11 05:39:13', '2026-04-11 15:50:33'),
  (82, 'Siomay Udang', '/uploads/menus/786fade2459633e52f265cb21d4a2004.jpg', 8, 40, 'tersedia', 0, 1, '2026-04-11 05:40:27', '2026-04-11 05:40:27'),
  (83, 'Daging manusia', '/uploads/menus/6167b456e2f5f45ca484a76cb095e35f.jpeg', 8, 20, 'menipis', 0, 0, '2026-04-11 11:57:00', '2026-04-11 11:57:20');

  -- --------------------------------------------------------

  --
  -- Struktur dari tabel `pengaturan_restoran`
  --

  CREATE TABLE `pengaturan_restoran` (
    `id_setting` int(10) UNSIGNED NOT NULL,
    `kunci` varchar(100) NOT NULL COMMENT 'Key setting, contoh: nama_restoran',
    `nilai` text DEFAULT NULL,
    `tipe` enum('text','number','boolean','json') NOT NULL DEFAULT 'text',
    `label` varchar(150) NOT NULL COMMENT 'Label tampil di Settings.jsx',
    `grup` varchar(50) NOT NULL DEFAULT 'umum' COMMENT 'umum | sistem',
    `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Konfigurasi key-value untuk Settings.jsx';

  --
  -- Dumping data untuk tabel `pengaturan_restoran`
  --

  INSERT INTO `pengaturan_restoran` (`id_setting`, `kunci`, `nilai`, `tipe`, `label`, `grup`, `updated_at`) VALUES
  (1, 'nama_restoran', 'Bos Mentai & Dimsum', 'text', 'Nama Restoran', 'umum', '2026-04-06 00:31:18'),
  (2, 'alamat', 'Jl. Mentai Raya No. 45, Jakarta Selatan', 'text', 'Alamat', 'umum', '2026-04-06 00:31:18'),
  (3, 'no_telepon', '0812-9988-7766', 'text', 'Nomor Telepon', 'umum', '2026-04-06 00:31:18'),
  (4, 'jam_buka', '10:00', 'text', 'Jam Buka', 'umum', '2026-04-06 00:31:18'),
  (5, 'jam_tutup', '22:00', 'text', 'Jam Tutup', 'umum', '2026-04-06 00:31:18'),
  (6, 'max_meja', '30', 'number', 'Jumlah Meja Maksimal', 'umum', '2026-04-06 00:31:18'),
  (7, 'notif_dapur', '0', 'boolean', 'Notifikasi Dapur Otomatis', 'sistem', '2026-04-06 00:31:18'),
  (8, 'terima_online', '1', 'boolean', 'Terima Pesanan Online', 'sistem', '2026-04-06 00:31:18'),
  (9, 'pajak_pct', '10', 'number', 'Pajak Restoran (%)', 'sistem', '2026-04-06 00:31:18'),
  (10, 'flat_rate_ayce', '75000', 'number', 'Harga AYCE per Pesanan (Rp)', 'sistem', '2026-04-06 00:31:18');

  -- --------------------------------------------------------

  --
  -- Struktur dari tabel `pesanan`
  --

  CREATE TABLE `pesanan` (
    `id_pesanan` int(10) UNSIGNED NOT NULL,
    `no_meja` tinyint(3) UNSIGNED NOT NULL COMMENT 'Validasi 1-99',
    `catatan` text DEFAULT NULL,
    `status_pesanan` enum('pending','Menunggu','cooking','Diproses','ready','Selesai') NOT NULL DEFAULT 'pending',
    `id_user` int(10) UNSIGNED DEFAULT NULL COMMENT 'Admin/staff yang memproses',
    `waktu_pesan` timestamp NOT NULL DEFAULT current_timestamp(),
    `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Header pesanan';

  --
  -- Dumping data untuk tabel `pesanan`
  --

  INSERT INTO `pesanan` (`id_pesanan`, `no_meja`, `catatan`, `status_pesanan`, `id_user`, `waktu_pesan`, `updated_at`) VALUES
  (2, 10, NULL, 'Menunggu', NULL, '2025-01-15 03:05:00', '2026-04-06 00:31:18'),
  (3, 2, 'Tidak pakai kecap', 'Diproses', NULL, '2025-01-15 03:05:00', '2026-04-06 00:31:18'),
  (5, 1, 'Kurangi garam', 'Menunggu', NULL, '2025-01-15 03:05:00', '2026-04-06 00:31:18'),
  (6, 4, NULL, 'Selesai', NULL, '2025-01-15 03:05:00', '2026-04-11 11:17:23'),
  (8, 7, 'Tambah saus sambal', 'Menunggu', NULL, '2025-01-15 03:05:00', '2026-04-06 00:31:18'),
  (12, 11, 'Pisahkan minuman', 'Menunggu', NULL, '2025-01-15 03:10:00', '2026-04-06 00:31:18'),
  (21, 21, 'Tidak pedas', 'Diproses', NULL, '2025-01-15 03:35:00', '2026-04-11 12:30:55'),
  (24, 24, 'Minta sendok ekstra', 'Selesai', NULL, '2025-01-15 03:40:00', '2026-04-11 15:50:56'),
  (130, 12, NULL, 'Diproses', NULL, '2026-04-06 00:44:38', '2026-04-11 15:50:06'),
  (131, 12, NULL, 'Menunggu', NULL, '2026-04-06 01:05:26', '2026-04-11 15:49:20'),
  (132, 12, NULL, 'Menunggu', NULL, '2026-04-06 05:00:33', '2026-04-11 15:49:20'),
  (133, 12, NULL, 'Menunggu', NULL, '2026-04-11 15:46:41', '2026-04-11 15:49:20'),
  (134, 12, NULL, 'Menunggu', NULL, '2026-04-11 15:50:33', '2026-04-11 15:50:33');

  -- --------------------------------------------------------

  --
  -- Struktur dari tabel `upload_log`
  --

  CREATE TABLE `upload_log` (
    `id_upload` int(10) UNSIGNED NOT NULL,
    `id_menu` int(10) UNSIGNED DEFAULT NULL COMMENT 'NULL jika upload gagal',
    `id_user` int(10) UNSIGNED DEFAULT NULL,
    `filename` varchar(50) NOT NULL COMMENT '<16hex>.ext dari Multer',
    `original_name` varchar(255) NOT NULL,
    `mime_type` enum('image/jpeg','image/png','image/webp') NOT NULL,
    `file_size_kb` smallint(5) UNSIGNED NOT NULL,
    `path_relatif` varchar(255) NOT NULL COMMENT '/uploads/menus/<filename>',
    `status` enum('uploaded','orphan_deleted','linked') NOT NULL DEFAULT 'uploaded',
    `created_at` timestamp NOT NULL DEFAULT current_timestamp()
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Audit log Multer upload';

  -- --------------------------------------------------------

  --
  -- Struktur dari tabel `users`
  --

  CREATE TABLE `users` (
    `id_user` int(10) UNSIGNED NOT NULL,
    `nama_lengkap` varchar(150) NOT NULL,
    `username` varchar(50) DEFAULT NULL COMMENT 'Username pendek untuk login cepat',
    `email` varchar(200) NOT NULL,
    `password_hash` varchar(255) NOT NULL COMMENT 'bcrypt hash — JANGAN simpan plain text',
    `role` enum('boss','admin','staff') NOT NULL DEFAULT 'admin',
    `is_active` tinyint(1) NOT NULL DEFAULT 1,
    `last_login` timestamp NULL DEFAULT NULL,
    `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
    `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Auth users — boss, admin, staff';

  --
  -- Dumping data untuk tabel `users`
  --

  INSERT INTO `users` (`id_user`, `nama_lengkap`, `username`, `email`, `password_hash`, `role`, `is_active`, `last_login`, `created_at`, `updated_at`) VALUES
  (1, 'Bos Utama', 'boss', 'boss@dimsumhouse.id', '$2b$12$placeholderHashForBossPasswordDimsum123xxxxx', 'boss', 1, NULL, '2026-04-06 00:31:18', '2026-04-06 00:31:18'),
  (2, 'Admin Restoran', 'admin', 'admin@dimsumhouse.id', '$2b$12$placeholderHashForAdminPassword123xxxxxxxxx', 'admin', 1, NULL, '2026-04-06 00:31:18', '2026-04-06 00:31:18'),
  (3, 'Staff Dapur', 'dapur', 'dapur@dimsumhouse.id', '$2b$12$placeholderHashForStaffPassword123xxxxxxxxx', 'staff', 1, NULL, '2026-04-06 00:31:18', '2026-04-06 00:31:18');

  -- --------------------------------------------------------

  --
  -- Struktur dari tabel `visitor_log`
  --

  CREATE TABLE `visitor_log` (
    `id_log` int(10) UNSIGNED NOT NULL,
    `no_meja` tinyint(3) UNSIGNED NOT NULL,
    `tanggal` date NOT NULL,
    `sesi_masuk` timestamp NOT NULL DEFAULT current_timestamp(),
    `created_at` timestamp NOT NULL DEFAULT current_timestamp()
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Log kunjungan — dipicu saat QR scan';

  --
  -- Dumping data untuk tabel `visitor_log`
  --

  INSERT INTO `visitor_log` (`id_log`, `no_meja`, `tanggal`, `sesi_masuk`, `created_at`) VALUES
  (1, 1, '2024-12-01', '2024-12-01 03:00:00', '2026-04-06 00:31:18'),
  (2, 2, '2024-12-01', '2024-12-01 03:10:00', '2026-04-06 00:31:18'),
  (3, 3, '2024-12-01', '2024-12-01 03:20:00', '2026-04-06 00:31:18'),
  (4, 4, '2024-12-01', '2024-12-01 04:00:00', '2026-04-06 00:31:18'),
  (5, 5, '2024-12-01', '2024-12-01 04:30:00', '2026-04-06 00:31:18'),
  (6, 6, '2024-12-01', '2024-12-01 05:00:00', '2026-04-06 00:31:18'),
  (7, 7, '2024-12-01', '2024-12-01 05:30:00', '2026-04-06 00:31:18'),
  (8, 8, '2024-12-01', '2024-12-01 06:00:00', '2026-04-06 00:31:18'),
  (9, 9, '2024-12-01', '2024-12-01 06:30:00', '2026-04-06 00:31:18'),
  (10, 10, '2024-12-01', '2024-12-01 07:00:00', '2026-04-06 00:31:18'),
  (11, 11, '2024-12-01', '2024-12-01 10:00:00', '2026-04-06 00:31:18'),
  (12, 12, '2024-12-01', '2024-12-01 10:30:00', '2026-04-06 00:31:18'),
  (13, 13, '2024-12-01', '2024-12-01 11:00:00', '2026-04-06 00:31:18'),
  (14, 14, '2024-12-01', '2024-12-01 11:30:00', '2026-04-06 00:31:18'),
  (15, 15, '2024-12-01', '2024-12-01 12:00:00', '2026-04-06 00:31:18'),
  (16, 1, '2024-12-08', '2024-12-08 03:00:00', '2026-04-06 00:31:18'),
  (17, 2, '2024-12-08', '2024-12-08 03:15:00', '2026-04-06 00:31:18'),
  (18, 3, '2024-12-08', '2024-12-08 03:30:00', '2026-04-06 00:31:18'),
  (19, 4, '2024-12-08', '2024-12-08 04:00:00', '2026-04-06 00:31:18'),
  (20, 5, '2024-12-08', '2024-12-08 04:15:00', '2026-04-06 00:31:18'),
  (21, 6, '2024-12-08', '2024-12-08 04:30:00', '2026-04-06 00:31:18'),
  (22, 7, '2024-12-08', '2024-12-08 05:00:00', '2026-04-06 00:31:18'),
  (23, 8, '2024-12-08', '2024-12-08 05:30:00', '2026-04-06 00:31:18'),
  (24, 9, '2024-12-08', '2024-12-08 06:00:00', '2026-04-06 00:31:18'),
  (25, 10, '2024-12-08', '2024-12-08 06:30:00', '2026-04-06 00:31:18'),
  (26, 11, '2024-12-08', '2024-12-08 07:00:00', '2026-04-06 00:31:18'),
  (27, 12, '2024-12-08', '2024-12-08 10:00:00', '2026-04-06 00:31:18'),
  (28, 13, '2024-12-08', '2024-12-08 10:30:00', '2026-04-06 00:31:18'),
  (29, 14, '2024-12-08', '2024-12-08 11:00:00', '2026-04-06 00:31:18'),
  (30, 15, '2024-12-08', '2024-12-08 11:30:00', '2026-04-06 00:31:18'),
  (31, 16, '2024-12-08', '2024-12-08 12:00:00', '2026-04-06 00:31:18'),
  (32, 17, '2024-12-08', '2024-12-08 12:30:00', '2026-04-06 00:31:18'),
  (33, 18, '2024-12-08', '2024-12-08 13:00:00', '2026-04-06 00:31:18'),
  (34, 1, '2024-12-16', '2024-12-16 03:00:00', '2026-04-06 00:31:18'),
  (35, 2, '2024-12-16', '2024-12-16 03:30:00', '2026-04-06 00:31:18'),
  (36, 3, '2024-12-16', '2024-12-16 04:00:00', '2026-04-06 00:31:18'),
  (37, 4, '2024-12-16', '2024-12-16 04:30:00', '2026-04-06 00:31:18'),
  (38, 5, '2024-12-16', '2024-12-16 05:00:00', '2026-04-06 00:31:18'),
  (39, 6, '2024-12-16', '2024-12-16 05:30:00', '2026-04-06 00:31:18'),
  (40, 7, '2024-12-16', '2024-12-16 06:00:00', '2026-04-06 00:31:18'),
  (41, 8, '2024-12-16', '2024-12-16 06:30:00', '2026-04-06 00:31:18'),
  (42, 9, '2024-12-16', '2024-12-16 07:00:00', '2026-04-06 00:31:18'),
  (43, 10, '2024-12-16', '2024-12-16 10:00:00', '2026-04-06 00:31:18'),
  (44, 11, '2024-12-16', '2024-12-16 11:00:00', '2026-04-06 00:31:18'),
  (45, 12, '2024-12-16', '2024-12-16 11:30:00', '2026-04-06 00:31:18'),
  (46, 13, '2024-12-16', '2024-12-16 12:00:00', '2026-04-06 00:31:18'),
  (47, 14, '2024-12-16', '2024-12-16 12:30:00', '2026-04-06 00:31:18'),
  (48, 15, '2024-12-16', '2024-12-16 13:00:00', '2026-04-06 00:31:18'),
  (49, 1, '2024-12-24', '2024-12-24 03:00:00', '2026-04-06 00:31:18'),
  (50, 2, '2024-12-24', '2024-12-24 03:15:00', '2026-04-06 00:31:18'),
  (51, 3, '2024-12-24', '2024-12-24 03:30:00', '2026-04-06 00:31:18'),
  (52, 4, '2024-12-24', '2024-12-24 04:00:00', '2026-04-06 00:31:18'),
  (53, 5, '2024-12-24', '2024-12-24 04:15:00', '2026-04-06 00:31:18'),
  (54, 6, '2024-12-24', '2024-12-24 04:30:00', '2026-04-06 00:31:18'),
  (55, 7, '2024-12-24', '2024-12-24 04:45:00', '2026-04-06 00:31:18'),
  (56, 8, '2024-12-24', '2024-12-24 05:00:00', '2026-04-06 00:31:18'),
  (57, 9, '2024-12-24', '2024-12-24 05:15:00', '2026-04-06 00:31:18'),
  (58, 10, '2024-12-24', '2024-12-24 05:30:00', '2026-04-06 00:31:18'),
  (59, 11, '2024-12-24', '2024-12-24 05:45:00', '2026-04-06 00:31:18'),
  (60, 12, '2024-12-24', '2024-12-24 06:00:00', '2026-04-06 00:31:18'),
  (61, 13, '2024-12-24', '2024-12-24 06:15:00', '2026-04-06 00:31:18'),
  (62, 14, '2024-12-24', '2024-12-24 06:30:00', '2026-04-06 00:31:18'),
  (63, 15, '2024-12-24', '2024-12-24 10:00:00', '2026-04-06 00:31:18'),
  (64, 16, '2024-12-24', '2024-12-24 10:30:00', '2026-04-06 00:31:18'),
  (65, 17, '2024-12-24', '2024-12-24 11:00:00', '2026-04-06 00:31:18'),
  (66, 18, '2024-12-24', '2024-12-24 11:30:00', '2026-04-06 00:31:18'),
  (67, 19, '2024-12-24', '2024-12-24 12:00:00', '2026-04-06 00:31:18'),
  (68, 20, '2024-12-24', '2024-12-24 12:30:00', '2026-04-06 00:31:18'),
  (69, 21, '2024-12-24', '2024-12-24 13:00:00', '2026-04-06 00:31:18'),
  (70, 22, '2024-12-24', '2024-12-24 13:30:00', '2026-04-06 00:31:18'),
  (71, 23, '2024-12-24', '2024-12-24 14:00:00', '2026-04-06 00:31:18'),
  (72, 24, '2024-12-24', '2024-12-24 14:30:00', '2026-04-06 00:31:18'),
  (73, 25, '2024-12-24', '2024-12-24 15:00:00', '2026-04-06 00:31:18'),
  (74, 26, '2024-12-24', '2024-12-24 15:30:00', '2026-04-06 00:31:18'),
  (75, 27, '2024-12-24', '2024-12-24 16:00:00', '2026-04-06 00:31:18'),
  (76, 28, '2024-12-24', '2024-12-24 16:30:00', '2026-04-06 00:31:18'),
  (77, 1, '2024-12-31', '2024-12-31 03:00:00', '2026-04-06 00:31:18'),
  (78, 2, '2024-12-31', '2024-12-31 03:30:00', '2026-04-06 00:31:18'),
  (79, 3, '2024-12-31', '2024-12-31 04:00:00', '2026-04-06 00:31:18'),
  (80, 4, '2024-12-31', '2024-12-31 04:30:00', '2026-04-06 00:31:18'),
  (81, 5, '2024-12-31', '2024-12-31 05:00:00', '2026-04-06 00:31:18'),
  (82, 6, '2024-12-31', '2024-12-31 05:30:00', '2026-04-06 00:31:18'),
  (83, 7, '2024-12-31', '2024-12-31 06:00:00', '2026-04-06 00:31:18'),
  (84, 8, '2024-12-31', '2024-12-31 06:30:00', '2026-04-06 00:31:18'),
  (85, 9, '2024-12-31', '2024-12-31 07:00:00', '2026-04-06 00:31:18'),
  (86, 10, '2024-12-31', '2024-12-31 10:00:00', '2026-04-06 00:31:18'),
  (87, 11, '2024-12-31', '2024-12-31 10:30:00', '2026-04-06 00:31:18'),
  (88, 12, '2024-12-31', '2024-12-31 11:00:00', '2026-04-06 00:31:18'),
  (89, 13, '2024-12-31', '2024-12-31 11:30:00', '2026-04-06 00:31:18'),
  (90, 14, '2024-12-31', '2024-12-31 12:00:00', '2026-04-06 00:31:18'),
  (91, 15, '2024-12-31', '2024-12-31 12:30:00', '2026-04-06 00:31:18'),
  (92, 16, '2024-12-31', '2024-12-31 13:00:00', '2026-04-06 00:31:18'),
  (93, 17, '2024-12-31', '2024-12-31 13:30:00', '2026-04-06 00:31:18'),
  (94, 18, '2024-12-31', '2024-12-31 14:00:00', '2026-04-06 00:31:18'),
  (95, 19, '2024-12-31', '2024-12-31 14:30:00', '2026-04-06 00:31:18'),
  (96, 20, '2024-12-31', '2024-12-31 15:00:00', '2026-04-06 00:31:18'),
  (97, 21, '2024-12-31', '2024-12-31 15:30:00', '2026-04-06 00:31:18'),
  (98, 22, '2024-12-31', '2024-12-31 16:00:00', '2026-04-06 00:31:18'),
  (99, 23, '2024-12-31', '2024-12-31 16:30:00', '2026-04-06 00:31:18');

  -- --------------------------------------------------------

  --
  -- Stand-in struktur untuk tampilan `v_menu_card`
  -- (Lihat di bawah untuk tampilan aktual)
  --
  CREATE TABLE `v_menu_card` (
  );

  -- --------------------------------------------------------

  --
  -- Stand-in struktur untuk tampilan `v_recent_orders`
  -- (Lihat di bawah untuk tampilan aktual)
  --
  CREATE TABLE `v_recent_orders` (
  `id_pesanan` int(10) unsigned
  ,`table` varchar(8)
  ,`no_meja` tinyint(3) unsigned
  ,`item` varchar(150)
  ,`time` varchar(10)
  ,`status_pesanan` enum('pending','Menunggu','cooking','Diproses','ready','Selesai')
  ,`color` varchar(7)
  );

  -- --------------------------------------------------------

  --
  -- Stand-in struktur untuk tampilan `v_restaurant_menu`
  -- (Lihat di bawah untuk tampilan aktual)
  --
  CREATE TABLE `v_restaurant_menu` (
  );

  -- --------------------------------------------------------

  --
  -- Stand-in struktur untuk tampilan `v_sales_chart`
  -- (Lihat di bawah untuk tampilan aktual)
  --
  CREATE TABLE `v_sales_chart` (
  `label` varchar(100)
  ,`color` varchar(7)
  ,`total` decimal(25,0)
  );

  -- --------------------------------------------------------

  --
  -- Stand-in struktur untuk tampilan `v_stats_dashboard`
  -- (Lihat di bawah untuk tampilan aktual)
  --
  CREATE TABLE `v_stats_dashboard` (
  `totalPesananHariIni` bigint(21)
  ,`pesananDariKemarin` bigint(22)
  ,`totalMenu` bigint(21)
  ,`totalPengunjung` bigint(21)
  ,`pengunjungHariIni` bigint(21)
  ,`pengunjungMingguIni` bigint(21)
  ,`pendapatanHariIni` bigint(26)
  );

  -- --------------------------------------------------------

  --
  -- Stand-in struktur untuk tampilan `v_stat_cards`
  -- (Lihat di bawah untuk tampilan aktual)
  --
  CREATE TABLE `v_stat_cards` (
  `total_pesanan_bulan` bigint(21)
  ,`pelanggan_bulan` bigint(21)
  ,`pendapatan_bulan` bigint(26)
  ,`pertumbuhan_pct` decimal(27,2)
  );

  -- --------------------------------------------------------

  --
  -- Stand-in struktur untuk tampilan `v_visitor_chart`
  -- (Lihat di bawah untuk tampilan aktual)
  --
  CREATE TABLE `v_visitor_chart` (
  `label` varchar(5)
  ,`tanggal` date
  ,`total` bigint(21)
  );

  -- --------------------------------------------------------

  --
  -- Struktur untuk view `v_menu_card`
  --
  DROP TABLE IF EXISTS `v_menu_card`;

  CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_menu_card`  AS SELECT `m`.`id_menu` AS `id_menu`, `m`.`nama_menu` AS `name`, `m`.`gambar` AS `image`, `m`.`harga` AS `harga`, `m`.`stok` AS `stok`, `m`.`status` AS `status`, `m`.`is_active` AS `is_active` FROM `menu` `m` WHERE `m`.`is_active` = 1 AND `m`.`status` <> 'habis' ORDER BY `m`.`nama_menu` ASC ;

  -- --------------------------------------------------------

  --
  -- Struktur untuk view `v_recent_orders`
  --
  DROP TABLE IF EXISTS `v_recent_orders`;

  CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_recent_orders`  AS SELECT `p`.`id_pesanan` AS `id_pesanan`, concat('Meja ',`p`.`no_meja`) AS `table`, `p`.`no_meja` AS `no_meja`, coalesce(`m`.`nama_menu`,'Pesanan') AS `item`, date_format(`p`.`waktu_pesan`,'%H:%i') AS `time`, `p`.`status_pesanan` AS `status_pesanan`, CASE `p`.`status_pesanan` WHEN 'Selesai' THEN '#22c55e' WHEN 'Diproses' THEN '#f59e0b' WHEN 'Menunggu' THEN '#3b82f6' WHEN 'cooking' THEN '#f97316' WHEN 'ready' THEN '#8b5cf6' ELSE '#6b7280' END AS `color` FROM ((`pesanan` `p` left join `detail_pesanan` `dp` on(`p`.`id_pesanan` = `dp`.`id_pesanan` and `dp`.`id_detail` = (select min(`detail_pesanan`.`id_detail`) from `detail_pesanan` where `detail_pesanan`.`id_pesanan` = `p`.`id_pesanan`))) left join `menu` `m` on(`dp`.`id_menu` = `m`.`id_menu`)) ORDER BY `p`.`waktu_pesan` DESC LIMIT 0, 10 ;

  -- --------------------------------------------------------

  --
  -- Struktur untuk view `v_restaurant_menu`
  --
  DROP TABLE IF EXISTS `v_restaurant_menu`;

  CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_restaurant_menu`  AS SELECT `m`.`id_menu` AS `id_menu`, `m`.`nama_menu` AS `nama`, `m`.`gambar` AS `image`, `m`.`harga` AS `harga`, `m`.`stok` AS `stok`, CASE WHEN `m`.`stok` = 0 THEN 'Habis' WHEN `m`.`stok` <= 5 THEN 'Hampir Habis' WHEN `m`.`stok` <= 20 THEN 'Menipis' ELSE 'Tersedia' END AS `status_display`, `m`.`status` AS `status_db`, `m`.`total_dipesan` AS `pesanan`, `m`.`is_active` AS `is_active` FROM `menu` `m` WHERE `m`.`is_active` = 1 ORDER BY `m`.`nama_menu` ASC ;

  -- --------------------------------------------------------

  --
  -- Struktur untuk view `v_sales_chart`
  --
  DROP TABLE IF EXISTS `v_sales_chart`;

  CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_sales_chart`  AS SELECT `m`.`nama_menu` AS `label`, '#B34949' AS `color`, coalesce(sum(`dp`.`jumlah`),0) AS `total` FROM ((`menu` `m` left join `detail_pesanan` `dp` on(`m`.`id_menu` = `dp`.`id_menu`)) left join `pesanan` `p` on(`dp`.`id_pesanan` = `p`.`id_pesanan` and year(`p`.`waktu_pesan`) = year(curdate()) and month(`p`.`waktu_pesan`) = month(curdate()))) WHERE `m`.`is_active` = 1 GROUP BY `m`.`id_menu`, `m`.`nama_menu` ORDER BY `total` DESC LIMIT 5 ;

  -- --------------------------------------------------------

  --
  -- Struktur untuk view `v_stats_dashboard`
  --
  DROP TABLE IF EXISTS `v_stats_dashboard`;

  CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_stats_dashboard`  AS SELECT (select count(0) from `pesanan` where cast(`pesanan`.`waktu_pesan` as date) = curdate()) AS `totalPesananHariIni`, (select count(0) from `pesanan` where cast(`pesanan`.`waktu_pesan` as date) = curdate()) - (select count(0) from `pesanan` where cast(`pesanan`.`waktu_pesan` as date) = curdate() - interval 1 day) AS `pesananDariKemarin`, (select count(0) from `menu` where `menu`.`status` <> 'habis' and `menu`.`is_active` = 1) AS `totalMenu`, (select count(0) from `visitor_log`) AS `totalPengunjung`, (select count(0) from `visitor_log` where `visitor_log`.`tanggal` = curdate()) AS `pengunjungHariIni`, (select count(0) from `visitor_log` where yearweek(`visitor_log`.`tanggal`,1) = yearweek(curdate(),1)) AS `pengunjungMingguIni`, (select coalesce(count(0) * 75000,0) from `pesanan` where cast(`pesanan`.`waktu_pesan` as date) = curdate() and `pesanan`.`status_pesanan` = 'Selesai') AS `pendapatanHariIni` ;

  -- --------------------------------------------------------

  --
  -- Struktur untuk view `v_stat_cards`
  --
  DROP TABLE IF EXISTS `v_stat_cards`;

  CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_stat_cards`  AS SELECT (select count(0) from `pesanan` where year(`pesanan`.`waktu_pesan`) = year(curdate()) and month(`pesanan`.`waktu_pesan`) = month(curdate())) AS `total_pesanan_bulan`, (select count(distinct `pesanan`.`no_meja`) from `pesanan` where year(`pesanan`.`waktu_pesan`) = year(curdate()) and month(`pesanan`.`waktu_pesan`) = month(curdate())) AS `pelanggan_bulan`, (select coalesce(count(0) * 75000,0) from `pesanan` where year(`pesanan`.`waktu_pesan`) = year(curdate()) and month(`pesanan`.`waktu_pesan`) = month(curdate()) and `pesanan`.`status_pesanan` = 'Selesai') AS `pendapatan_bulan`, round(((select count(0) from `pesanan` where year(`pesanan`.`waktu_pesan`) = year(curdate()) and month(`pesanan`.`waktu_pesan`) = month(curdate())) - (select count(0) from `pesanan` where `pesanan`.`waktu_pesan` >= date_format(curdate() - interval 1 month,'%Y-%m-01') and `pesanan`.`waktu_pesan` < date_format(curdate(),'%Y-%m-01'))) / nullif((select count(0) from `pesanan` where `pesanan`.`waktu_pesan` >= date_format(curdate() - interval 1 month,'%Y-%m-01') and `pesanan`.`waktu_pesan` < date_format(curdate(),'%Y-%m-01')),0) * 100,2) AS `pertumbuhan_pct` ;

  -- --------------------------------------------------------

  --
  -- Struktur untuk view `v_visitor_chart`
  --
  DROP TABLE IF EXISTS `v_visitor_chart`;

  CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_visitor_chart`  AS SELECT date_format(`visitor_log`.`tanggal`,'%d/%m') AS `label`, `visitor_log`.`tanggal` AS `tanggal`, count(0) AS `total` FROM `visitor_log` WHERE `visitor_log`.`tanggal` >= curdate() - interval 6 day GROUP BY `visitor_log`.`tanggal` ORDER BY `visitor_log`.`tanggal` ASC ;

  --
  -- Indexes for dumped tables
  --

  --
  -- Indeks untuk tabel `auth_sessions`
  --
  ALTER TABLE `auth_sessions`
    ADD PRIMARY KEY (`id_session`),
    ADD KEY `idx_session_user` (`id_user`),
    ADD KEY `idx_session_expired` (`expired_at`);

  --
  -- Indeks untuk tabel `detail_pesanan`
  --
  ALTER TABLE `detail_pesanan`
    ADD PRIMARY KEY (`id_detail`),
    ADD KEY `idx_detail_pesanan` (`id_pesanan`),
    ADD KEY `idx_detail_menu` (`id_menu`);

  --
  -- Indeks untuk tabel `kategori`
  --
  ALTER TABLE `kategori`
    ADD PRIMARY KEY (`id_kategori`),
    ADD UNIQUE KEY `uq_nama_kategori` (`nama_kategori`);

  --
  -- Indeks untuk tabel `laporan_penjualan_harian`
  --
  ALTER TABLE `laporan_penjualan_harian`
    ADD PRIMARY KEY (`id_laporan`),
    ADD UNIQUE KEY `uq_laporan_tanggal` (`tanggal`);

  --
  -- Indeks untuk tabel `menu`
  --
  ALTER TABLE `menu`
    ADD PRIMARY KEY (`id_menu`),
    ADD KEY `idx_menu_status` (`status`),
    ADD KEY `idx_menu_active` (`is_active`);

  --
  -- Indeks untuk tabel `pengaturan_restoran`
  --
  ALTER TABLE `pengaturan_restoran`
    ADD PRIMARY KEY (`id_setting`),
    ADD UNIQUE KEY `uq_kunci` (`kunci`);

  --
  -- Indeks untuk tabel `pesanan`
  --
  ALTER TABLE `pesanan`
    ADD PRIMARY KEY (`id_pesanan`),
    ADD KEY `idx_pesanan_status` (`status_pesanan`),
    ADD KEY `idx_pesanan_meja` (`no_meja`),
    ADD KEY `idx_pesanan_waktu` (`waktu_pesan`),
    ADD KEY `idx_pesanan_user` (`id_user`);

  --
  -- Indeks untuk tabel `upload_log`
  --
  ALTER TABLE `upload_log`
    ADD PRIMARY KEY (`id_upload`),
    ADD KEY `idx_upload_menu` (`id_menu`),
    ADD KEY `idx_upload_user` (`id_user`),
    ADD KEY `idx_upload_status` (`status`);

  --
  -- Indeks untuk tabel `users`
  --
  ALTER TABLE `users`
    ADD PRIMARY KEY (`id_user`),
    ADD UNIQUE KEY `uq_email` (`email`),
    ADD UNIQUE KEY `uq_username` (`username`),
    ADD KEY `idx_user_role` (`role`),
    ADD KEY `idx_user_active` (`is_active`);

  --
  -- Indeks untuk tabel `visitor_log`
  --
  ALTER TABLE `visitor_log`
    ADD PRIMARY KEY (`id_log`),
    ADD KEY `idx_visitor_tanggal` (`tanggal`),
    ADD KEY `idx_visitor_meja` (`no_meja`);

  --
  -- AUTO_INCREMENT untuk tabel yang dibuang
  --

  --
  -- AUTO_INCREMENT untuk tabel `detail_pesanan`
  --
  ALTER TABLE `detail_pesanan`
    MODIFY `id_detail` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=250;

  --
  -- AUTO_INCREMENT untuk tabel `kategori`
  --
  ALTER TABLE `kategori`
    MODIFY `id_kategori` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

  --
  -- AUTO_INCREMENT untuk tabel `laporan_penjualan_harian`
  --
  ALTER TABLE `laporan_penjualan_harian`
    MODIFY `id_laporan` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

  --
  -- AUTO_INCREMENT untuk tabel `menu`
  --
  ALTER TABLE `menu`
    MODIFY `id_menu` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=84;

  --
  -- AUTO_INCREMENT untuk tabel `pengaturan_restoran`
  --
  ALTER TABLE `pengaturan_restoran`
    MODIFY `id_setting` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

  --
  -- AUTO_INCREMENT untuk tabel `pesanan`
  --
  ALTER TABLE `pesanan`
    MODIFY `id_pesanan` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=135;

  --
  -- AUTO_INCREMENT untuk tabel `upload_log`
  --
  ALTER TABLE `upload_log`
    MODIFY `id_upload` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

  --
  -- AUTO_INCREMENT untuk tabel `users`
  --
  ALTER TABLE `users`
    MODIFY `id_user` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

  --
  -- AUTO_INCREMENT untuk tabel `visitor_log`
  --
  ALTER TABLE `visitor_log`
    MODIFY `id_log` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=100;

  --
  -- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
  --

  --
  -- Ketidakleluasaan untuk tabel `auth_sessions`
  --
  ALTER TABLE `auth_sessions`
    ADD CONSTRAINT `fk_session_user` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE CASCADE ON UPDATE CASCADE;

  --
  -- Ketidakleluasaan untuk tabel `detail_pesanan`
  --
  ALTER TABLE `detail_pesanan`
    ADD CONSTRAINT `fk_detail_menu` FOREIGN KEY (`id_menu`) REFERENCES `menu` (`id_menu`) ON UPDATE CASCADE,
    ADD CONSTRAINT `fk_detail_pesanan` FOREIGN KEY (`id_pesanan`) REFERENCES `pesanan` (`id_pesanan`) ON DELETE CASCADE ON UPDATE CASCADE;



  --
  -- Ketidakleluasaan untuk tabel `pesanan`
  --
  ALTER TABLE `pesanan`
    ADD CONSTRAINT `fk_pesanan_user` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE SET NULL ON UPDATE CASCADE;

  --
  -- Ketidakleluasaan untuk tabel `upload_log`
  --
  ALTER TABLE `upload_log`
    ADD CONSTRAINT `fk_upload_menu` FOREIGN KEY (`id_menu`) REFERENCES `menu` (`id_menu`) ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT `fk_upload_user` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE SET NULL ON UPDATE CASCADE;
  COMMIT;

  /*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
  /*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
  /*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

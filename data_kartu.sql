-- phpMyAdmin SQL Dump
-- version 5.0.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 06 Okt 2020 pada 06.34
-- Versi server: 10.4.13-MariaDB
-- Versi PHP: 7.4.8

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `data_kartu`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `siswa`
--

CREATE TABLE `siswa` (
  `kelas` varchar(16) NOT NULL,
  `nama` varchar(128) NOT NULL,
  `nis` varchar(64) NOT NULL,
  `absen` varchar(16) NOT NULL,
  `nisn` varchar(64) NOT NULL,
  `komp_keahlian` varchar(128) NOT NULL,
  `ttl` varchar(128) NOT NULL,
  `alamat` varchar(256) NOT NULL,
  `foto` varchar(256) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data untuk tabel `siswa`
--

INSERT INTO `siswa` (`kelas`, `nama`, `nis`, `absen`, `nisn`, `komp_keahlian`, `ttl`, `alamat`, `foto`) VALUES
('xiitpm7', 'Nike Jeslyn Hakim', '001', '003.000', '00132', 'Teknik Pemesinan', 'Sidoarjo, 21 Desember 2001', 'Prambon', ''),
('xiirpl1', 'Brian Harianja', '001', '033.012', '001433', 'Rekayasa Perangkat Lunak', 'Pekanbaru, 11 April 2001', 'Gampink', 'cp2.jpg'),
('xiirpl1', 'Anthony Jedijah Siautta', '003', '033.013', '0014333', 'Rekayasa Perangkat Lunak', 'Sidorejo, 11 April 2001', 'Perumtas 3 Blok M6', 'cp1.jpg'),
('xiirpl1', 'Bri Bri', '0012', '00.31', '00231', 'Rekayasa Perangkat Lunak', 'Pku, 11 Januari 1000', 'Perumtas', ''),
('xtitl2', 'Nama Baru', '001', '04.11', '003', 'Teknik Instalasi Tenaga Listrik', 'TTL Baru, 12 Januari 2200', 'Alamat Baru', 'foto.png'),
('xiirpl1', 'Bri bri', '0120', '02.100', '0213', 'Rekayasa Perangkat Lunak', 'Pku, 11 Januari 2001', 'Gmping', ''),
('xiirpl1', 'Brian Anton', '013091', '213192', '912038102', 'Rekayasa Perangkat Lunak', 'Pekanbaru, 11 April 2001', 'Gamping', 'IMG_1603.JPG');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `siswa`
--
ALTER TABLE `siswa`
  ADD UNIQUE KEY `nisn` (`nisn`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

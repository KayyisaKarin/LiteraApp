import React, { useState } from 'react';
import {
  Code,
  Copy,
  Check,
  Download,
  BookOpen,
  Server,
  Layers,
  Cpu,
  Smartphone,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  HelpCircle,
  FileCode2,
  PackageCheck,
  Flame,
  ArrowRight
} from 'lucide-react';
import { FLUTTER_FILES, FlutterFile } from '../flutterCode';

export const FlutterCodeViewer: React.FC = () => {
  const [selectedFileId, setSelectedFileId] = useState<string>('model');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'code' | 'architecture' | 'testing'>('code');

  const currentFile = FLUTTER_FILES.find((f) => f.id === selectedFileId) || FLUTTER_FILES[0];

  const handleCopy = (file: FlutterFile) => {
    navigator.clipboard.writeText(file.code);
    setCopiedId(file.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyAll = () => {
    const combined = FLUTTER_FILES.map(
      (f) => `// ==========================================\n// FILE: ${f.path}\n// LAYER: ${f.layer}\n// ==========================================\n\n${f.code}\n\n`
    ).join('\n');
    navigator.clipboard.writeText(combined);
    setCopiedId('all');
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-full min-h-[700px] text-slate-100 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Header Bar */}
      <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <FileCode2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-white flex items-center space-x-2">
              <span>Clean Architecture & Riverpod 2.x</span>
              <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
                Flutter 3
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              5 File Modular Sesuai Spesifikasi Clean Architecture & Open Library API
            </p>
          </div>
        </div>

        {/* Action Buttons & Tab Switcher */}
        <div className="flex items-center space-x-2">
          <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex items-center space-x-1 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'code'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Kodingan File
            </button>
            <button
              onClick={() => setActiveTab('architecture')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'architecture'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Alur Data (Clean Arch)
            </button>
            <button
              onClick={() => setActiveTab('testing')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'testing'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Langkah Pengujian
            </button>
          </div>

          <button
            onClick={handleCopyAll}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700/80 transition flex items-center space-x-1.5"
          >
            {copiedId === 'all' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Tersalin Semua!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-300" />
                <span>Salin Seluruh Proyek</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Body */}
      {activeTab === 'code' ? (
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
          {/* File Selector Sidebar */}
          <div className="md:col-span-4 bg-slate-950/40 border-r border-slate-800/80 p-4 space-y-1.5 overflow-y-auto">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 px-3 py-1.5">
              5 File Utama Arsitektur
            </div>

            {FLUTTER_FILES.map((file) => {
              const isSelected = selectedFileId === file.id;
              return (
                <button
                  key={file.id}
                  onClick={() => setSelectedFileId(file.id)}
                  className={`w-full text-left p-3 rounded-2xl transition duration-150 flex items-start space-x-3 ${
                    isSelected
                      ? 'bg-indigo-600/15 border border-indigo-500/40 shadow-xs'
                      : 'hover:bg-slate-800/50 border border-transparent'
                  }`}
                >
                  <div
                    className={`p-2 rounded-xl mt-0.5 ${
                      isSelected
                        ? 'bg-indigo-500 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {file.id === 'model' && <BookOpen className="w-4 h-4" />}
                    {file.id === 'service' && <Server className="w-4 h-4" />}
                    {file.id === 'repository' && <Layers className="w-4 h-4" />}
                    {file.id === 'provider' && <Cpu className="w-4 h-4" />}
                    {file.id === 'widget' && <Smartphone className="w-4 h-4" />}
                    {file.id === 'pubspec' && <PackageCheck className="w-4 h-4" />}
                    {file.id === 'main' && <Flame className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white truncate">
                        {file.filename}
                      </span>
                      <span className="text-[10px] text-indigo-400 font-mono">
                        {file.id.startsWith('pub') || file.id.startsWith('main') ? '' : `0${FLUTTER_FILES.indexOf(file) + 1}`}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 truncate mt-0.5">
                      {file.path}
                    </div>
                    <div className="text-[10px] text-slate-400 line-clamp-1 mt-1 font-medium">
                      {file.layer}
                    </div>
                  </div>
                </button>
              );
            })}

            {/* Quick Education Note for SMK RPL */}
            <div className="mt-6 p-4 rounded-2xl bg-indigo-950/30 border border-indigo-900/40 text-xs space-y-1.5">
              <div className="flex items-center space-x-1.5 text-indigo-300 font-bold">
                <HelpCircle className="w-4 h-4" />
                <span>Tips Belajar Siswa SMK RPL</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Di Flutter, <strong>Clean Architecture</strong> memastikan jika API atau UI berubah, kita tidak perlu membongkar seluruh kode. Riverpod menghubungkan Model, Service, dan UI secara reaktif tanpa saling merusak.
              </p>
            </div>
          </div>

          {/* Code Viewer Panel */}
          <div className="md:col-span-8 flex flex-col bg-slate-900 overflow-hidden">
            {/* Active File Header */}
            <div className="px-5 py-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-indigo-300">
                    {currentFile.path}
                  </span>
                  <span className="text-[10px] font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md">
                    {currentFile.layer}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {currentFile.description}
                </p>
              </div>

              <button
                onClick={() => handleCopy(currentFile)}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-xs shrink-0"
              >
                {copiedId === currentFile.id ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Kode File Ini</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Body with scrollbar */}
            <div className="flex-1 overflow-auto p-4 bg-[#0d1117] font-mono text-xs leading-relaxed">
              <pre className="text-slate-200">
                <code>{currentFile.code}</code>
              </pre>
            </div>
          </div>
        </div>
      ) : activeTab === 'architecture' ? (
        /* Architecture Flow Diagram & Explanation */
        <div className="p-8 overflow-y-auto space-y-8 flex-1">
          <div>
            <h3 className="text-lg font-black text-white">
              Alur Data Clean Architecture (5 Lapisan)
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Pemisahan tanggung jawab secara tegas sesuai standar industri dan Clean Architecture:
            </p>
          </div>

          {/* Interactive Flow Diagram */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 relative">
            <div className="p-4 rounded-2xl bg-indigo-950/50 border border-indigo-500/30 text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-md">
                <Smartphone className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-white">5. UI Widget</div>
              <div className="text-[10px] text-indigo-300">
                ConsumerStatefulWidget
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Menampilkan desain modern, search bar, carousel rak buku, modal detail.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-violet-950/50 border border-violet-500/30 text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center mx-auto shadow-md">
                <Cpu className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-white">4. Provider</div>
              <div className="text-[10px] text-violet-300">
                Riverpod StateNotifier
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                DI & state management asynchronous (loading, data, error, pagination).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-cyan-950/50 border border-cyan-500/30 text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center mx-auto shadow-md">
                <Layers className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-white">3. Repository</div>
              <div className="text-[10px] text-cyan-300">
                BookRepository
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Abstraksi data & single source of truth bagi provider.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-950/50 border border-emerald-500/30 text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                <Server className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-white">2. Service</div>
              <div className="text-[10px] text-emerald-300">
                BookService
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                HTTP GET ke Open Library API, error handling, URI generator, JSON parsing.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-950/50 border border-amber-500/30 text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center mx-auto shadow-md">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-white">1. Model</div>
              <div className="text-[10px] text-amber-300">
                Book (Immutable)
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Entitas data buku immutable, safe null parsing, coverUrl generator.
              </p>
            </div>
          </div>

          {/* Deep Explanation Table */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Prinsip Utama yang Diterapkan:</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800/80">
                <div className="font-bold text-indigo-300">1. Null-Safety & Defensif</div>
                <p className="text-slate-400 mt-1">
                  API Open Library tidak selalu mengembalikan field seperti cover_i, ratings_average, atau author_name. Semua di-parse dengan aman tanpa crash.
                </p>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800/80">
                <div className="font-bold text-indigo-300">2. Debounce Real-Time</div>
                <p className="text-slate-400 mt-1">
                  Pencarian menunggu 450ms setelah ketikan pengguna berhenti agar tidak membanjiri server Open Library dengan request sia-sia.
                </p>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800/80">
                <div className="font-bold text-indigo-300">3. Dependency Injection</div>
                <p className="text-slate-400 mt-1">
                  HTTP Client di-inject ke Service, Service ke Repository, dan Repository ke Provider. Ini memudahkan unit testing menggunakan Mock Client.
                </p>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800/80">
                <div className="font-bold text-indigo-300">4. Pagination & Load More</div>
                <p className="text-slate-400 mt-1">
                  Menggunakan query parameter offset untuk memuat 10 buku berikutnya dan menyatukannya ke list tanpa duplikasi data.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Testing Guide Panel */
        <div className="p-8 overflow-y-auto space-y-6 flex-1 text-xs">
          <div>
            <h3 className="text-lg font-black text-white">
              Langkah Pengujian Komprehensif (Testing & QA)
            </h3>
            <p className="text-slate-400 mt-1">
              Panduan uji coba fitur Digital Library Explorer untuk memastikan seluruh use case terpenuhi:
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                title: '1. Pengujian Pencarian Real-Time & Debounce',
                desc: 'Ketik "Harry Potter" perlahan di search bar. Amati bahwa request jaringan hanya dikirimkan 450ms setelah ketikan berhenti, tidak dikirim pada setiap penekanan tombol.',
                tag: 'Search & Debounce',
              },
              {
                title: '2. Pengujian Tombol Clear & Empty Query',
                desc: 'Klik ikon silang (X) di kolom pencarian. Query dikosongkan seketika dan tidak memicu request jaringan berlebihan.',
                tag: 'Clear Action',
              },
              {
                title: '3. Pengujian Pagination (Load More)',
                desc: 'Gulir ke bagian bawah daftar buku lalu klik tombol "Muat Lebih Banyak (Load More)". Buku baru berhasil digabungkan tanpa duplikasi item.',
                tag: 'Pagination',
              },
              {
                title: '4. Pengujian Detail Buku & Rating Asli',
                desc: 'Ketuk salah satu kartu buku. Bottom sheet terbuka menampilkan cover, judul lengkap, penulis, rating asli dari API (jika ada), tahun terbit, dan status fulltext.',
                tag: 'Modal Detail',
              },
              {
                title: '5. Pengujian Penanganan Error & Retry',
                desc: 'Matikan koneksi internet ponsel / laptop lalu ketik query baru. Tampilan error ramah muncul dengan tombol "Coba Lagi (Retry)". Nyalakan internet dan klik Retry.',
                tag: 'Error & Retry',
              },
              {
                title: '6. Pengujian Buku Tanpa Sampul (Fallback)',
                desc: 'Cari buku langka. Untuk buku tanpa cover_i dari Open Library, tampil kartu buku dengan placeholder yang rapi tanpa gambar rusak atau layout overflow.',
                tag: 'Null Safety',
              },
            ].map((step, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-start space-x-3.5"
              >
                <div className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-300 font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">{step.title}</span>
                    <span className="text-[10px] font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
                      {step.tag}
                    </span>
                  </div>
                  <p className="text-slate-400 mt-1 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

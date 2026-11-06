import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Download,
  Printer,
  Edit3,
  MessageSquare,
  Smartphone,
  Presentation,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Layers,
  HelpCircle,
  FileText
} from 'lucide-react';
import { SlideCanvas } from './SlideCanvas';
import { PresenterEditorModal } from './PresenterEditorModal';
import { SLIDES_DATA, DEFAULT_PRESENTER_INFO } from '../presentationData';
import { SlideData, PresenterInfo } from '../types/presentation';
import { exportPresentationToPPTX } from '../utils/pptxExport';
import { MobileSimulator } from './MobileSimulator';

export const PresentationBuilder: React.FC = () => {
  const [slides, setSlides] = useState<SlideData[]>(SLIDES_DATA);
  const [presenterInfo, setPresenterInfo] = useState<PresenterInfo>(DEFAULT_PRESENTER_INFO);
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [showNotes, setShowNotes] = useState<boolean>(true);
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<'slides' | 'liveDemo'>('slides');

  // Auto-play / Timer
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentSlide = slides[currentSlideIndex];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditorOpen) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        handleNextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        handlePrevSlide();
      } else if (e.key === 'f' || e.key === 'F') {
        setIsFullscreen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlideIndex, slides.length, isEditorOpen]);

  // Auto-play timer
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
      }, 7000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, slides.length]);

  const handleNextSlide = () => {
    setCurrentSlideIndex((prev) => (prev < slides.length - 1 ? prev + 1 : prev));
  };

  const handlePrevSlide = () => {
    setCurrentSlideIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleExportPPTX = async () => {
    try {
      setIsExporting(true);
      await exportPresentationToPPTX(slides, presenterInfo);
    } catch (err) {
      console.error('Failed to export PPTX:', err);
      alert('Gagal mengekspor file PowerPoint. Silakan gunakan tombol Print / PDF sebagai alternatif.');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const handleUpdateSlideTitle = (slideId: number, title: string, subtitle: string) => {
    setSlides((prev) =>
      prev.map((s) => (s.id === slideId ? { ...s, title, subtitle } : s))
    );
  };

  return (
    <div className="min-h-screen bg-[#F0F3FB] text-[#1E2138] font-['Plus_Jakarta_Sans',sans-serif] flex flex-col">
      {/* Top Header & Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-8 py-3 no-print">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Presentation Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#CBD0F8] text-[#1E2138] flex items-center justify-center font-black shadow-xs">
              <Presentation className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-sm sm:text-base font-black text-[#1E2138] tracking-tight">
                  litera
                </h1>
                <span className="text-[10px] font-black bg-[#CBD0F8] text-[#1E2138] px-2 py-0.5 rounded-full">
                  {slides.length} Slides 16:9
                </span>
                <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full hidden sm:inline">
                  Open Library API
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Digital Library Explorer • {presenterInfo.name} ({presenterInfo.classGrade})
              </p>
            </div>
          </div>

          {/* View Mode Toggle: Slides vs Live Demo */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-inner">
            <button
              onClick={() => setActiveView('slides')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeView === 'slides'
                  ? 'bg-white text-[#1E2138] shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Presentation className="w-3.5 h-3.5" />
              <span>Slide Presentasi</span>
            </button>
            <button
              onClick={() => setActiveView('liveDemo')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeView === 'liveDemo'
                  ? 'bg-white text-[#1E2138] shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Demo Aplikasi Live</span>
            </button>
          </div>

          {/* Right Action Tools: Edit, PPTX, Print, Fullscreen */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsEditorOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center space-x-1.5 border border-slate-200"
              title="Edit Nama Siswa, Sekolah & Slide"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Edit Data</span>
            </button>

            <button
              onClick={handleExportPPTX}
              disabled={isExporting}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-xs"
              title="Download file Microsoft PowerPoint (.pptx)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Membuat...' : 'Download PPTX'}</span>
            </button>

            <button
              onClick={handlePrintPDF}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center space-x-1.5 border border-slate-200 shadow-xs"
              title="Cetak atau Simpan sebagai PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex flex-col no-print">
        {activeView === 'liveDemo' ? (
          /* Live App Demo Screen */
          <div className="flex flex-col items-center justify-center py-4">
            <div className="mb-4 text-center max-w-md">
              <span className="text-[11px] font-black uppercase tracking-wider text-indigo-700 bg-[#CBD0F8] px-3 py-1 rounded-full">
                Interactive iPhone 17 Pro Max Simulator
              </span>
              <h2 className="text-xl font-black text-[#1E2138] mt-2">
                Uji Coba Langsung Aplikasi
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Tunjukkan fitur pencarian real-time, rak buku kayu, pull to refresh, dan tab favorit langsung saat evaluasi project!
              </p>
            </div>
            <MobileSimulator />
          </div>
        ) : (
          /* Slides Presentation View */
          <div className="flex-1 flex flex-col space-y-6">
            {/* Slide Navigation Controls & Toolbar */}
            <div className="flex items-center justify-between bg-white px-5 py-3 rounded-2xl border border-slate-200/90 shadow-xs">
              <div className="flex items-center space-x-3">
                <span className="text-xs font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-xl">
                  Slide {currentSlideIndex + 1} of {slides.length}
                </span>
                <span className="text-xs font-bold text-slate-500 hidden sm:inline">
                  • {currentSlide.title}
                </span>
              </div>

              {/* Center Controls: Prev, Next, Auto-play */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrevSlide}
                  disabled={currentSlideIndex === 0}
                  className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-800 flex items-center justify-center transition"
                  title="Slide Sebelumnya (Arrow Left)"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition ${
                    isPlaying ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                  title={isPlaying ? 'Jeda Slide' : 'Auto Play Slide'}
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={handleNextSlide}
                  disabled={currentSlideIndex === slides.length - 1}
                  className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-800 flex items-center justify-center transition"
                  title="Slide Berikutnya (Arrow Right / Space)"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Right View Toggles */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowNotes(!showNotes)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                    showNotes
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Catatan Pembicara</span>
                </button>

                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                  title="Mode Layar Penuh (F)"
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Main 16:9 Slide Canvas View */}
            <div
              className={`w-full flex justify-center transition-all ${
                isFullscreen
                  ? 'fixed inset-0 z-50 bg-[#16192E] p-4 sm:p-8 flex items-center justify-center overflow-auto'
                  : ''
              }`}
            >
              <div className="w-full max-w-5xl">
                <SlideCanvas
                  slide={currentSlide}
                  presenterInfo={presenterInfo}
                  totalSlides={slides.length}
                />
              </div>
            </div>

            {/* Speaker Notes Drawer (Teks Panduan Presentasi untuk Siswa) */}
            {showNotes && !isFullscreen && (
              <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm transition-all">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <div className="flex items-center space-x-2 text-indigo-700 font-extrabold text-xs uppercase tracking-wider">
                    <MessageSquare className="w-4 h-4" />
                    <span>Catatan Pembicara (Panduan Lisan Presentasi di Depan Guru & Teman)</span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-400">
                    Slide {currentSlide.slideNumber} • {currentSlide.title}
                  </span>
                </div>
                <p className="text-[13.5px] text-slate-700 leading-relaxed font-normal">
                  {currentSlide.speakerNotes}
                </p>
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>💡 Tips: Gunakan tombol panah keyboard (← / →) atau tombol Space untuk berpindah slide.</span>
                  <span className="font-semibold text-slate-600">Bahasa Indonesia Profesional</span>
                </div>
              </div>
            )}

            {/* Bottom Slide Thumbnail Strip */}
            {!isFullscreen && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                    Daftar {slides.length} Slide Presentasi (Klik untuk Berpindah)
                  </span>
                  <span className="text-xs text-slate-400">
                    Format Widescreen 16:9 • Identitas Lavender & Navy
                  </span>
                </div>

                <div className="flex space-x-3 overflow-x-auto pb-4 scrollbar-none py-1">
                  {slides.map((s, idx) => {
                    const isActive = idx === currentSlideIndex;
                    return (
                      <button
                        key={s.id}
                        onClick={() => setCurrentSlideIndex(idx)}
                        className={`w-36 shrink-0 text-left p-2.5 rounded-2xl border transition-all ${
                          isActive
                            ? 'bg-white border-[#1E2138] shadow-md scale-102 ring-2 ring-[#CBD0F8]'
                            : 'bg-white/80 hover:bg-white border-slate-200/80 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                          <span>{s.slideNumber}</span>
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isActive ? 'bg-[#1E2138]' : 'bg-slate-200'
                            }`}
                          />
                        </div>
                        <div className="text-[11.5px] font-extrabold text-[#1E2138] line-clamp-1 mt-1">
                          {s.title}
                        </div>
                        <div className="text-[9.5px] text-slate-500 truncate mt-0.5">
                          {s.tag}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* PRINT-ONLY CONTAINER: Renders all slides for Print to PDF */}
      <div className="hidden print:block w-full">
        {slides.map((slideItem) => (
          <div key={`print_${slideItem.id}`} className="w-full h-screen p-8 page-break-after-always">
            <SlideCanvas
              slide={slideItem}
              presenterInfo={presenterInfo}
              totalSlides={slides.length}
              isPrintMode={true}
            />
          </div>
        ))}
      </div>

      {/* Presenter & Slide Info Editor Modal */}
      <PresenterEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        presenterInfo={presenterInfo}
        onSavePresenterInfo={(updated) => setPresenterInfo(updated)}
        currentSlide={currentSlide}
        onUpdateSlideTitle={handleUpdateSlideTitle}
      />
    </div>
  );
};

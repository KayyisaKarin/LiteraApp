import React, { useState } from 'react';
import { X, Check, RotateCcw, User, School, Calendar, BookOpen } from 'lucide-react';
import { PresenterInfo, SlideData } from '../types/presentation';
import { DEFAULT_PRESENTER_INFO } from '../presentationData';

interface PresenterEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  presenterInfo: PresenterInfo;
  onSavePresenterInfo: (info: PresenterInfo) => void;
  currentSlide: SlideData;
  onUpdateSlideTitle: (slideId: number, title: string, subtitle: string) => void;
}

export const PresenterEditorModal: React.FC<PresenterEditorModalProps> = ({
  isOpen,
  onClose,
  presenterInfo,
  onSavePresenterInfo,
  currentSlide,
  onUpdateSlideTitle,
}) => {
  const [formData, setFormData] = useState<PresenterInfo>(presenterInfo);
  const [slideTitle, setSlideTitle] = useState(currentSlide.title);
  const [slideSubtitle, setSlideSubtitle] = useState(currentSlide.subtitle);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSavePresenterInfo(formData);
    onUpdateSlideTitle(currentSlide.id, slideTitle, slideSubtitle);
    onClose();
  };

  const handleReset = () => {
    setFormData(DEFAULT_PRESENTER_INFO);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto font-['Plus_Jakarta_Sans',sans-serif]">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-extrabold text-[#1E2138]">
              Edit Informasi Presentasi & Slide
            </h3>
            <p className="text-xs text-slate-500">
              Sesuaikan data identitas siswa, sekolah, dan teks slide saat ini.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
          {/* Presenter Info Fields */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Nama Siswa / Presenter
            </label>
            <div className="relative flex items-center">
              <User className="w-4 h-4 text-slate-400 absolute left-3" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 font-semibold focus:border-indigo-500 focus:outline-none"
                placeholder="Contoh: Naqiyya Najwa"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Kelas & Jurusan
              </label>
              <input
                type="text"
                value={formData.classGrade}
                onChange={(e) => setFormData({ ...formData, classGrade: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-semibold focus:border-indigo-500 focus:outline-none"
                placeholder="XII RPL"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Tahun Ajaran
              </label>
              <input
                type="text"
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-semibold focus:border-indigo-500 focus:outline-none"
                placeholder="2026/2027"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Nama Sekolah
            </label>
            <div className="relative flex items-center">
              <School className="w-4 h-4 text-slate-400 absolute left-3" />
              <input
                type="text"
                value={formData.school}
                onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 font-semibold focus:border-indigo-500 focus:outline-none"
                placeholder="SMK Negeri 1"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Guru Pembimbing (Opsional)
            </label>
            <input
              type="text"
              value={formData.advisorName || ''}
              onChange={(e) => setFormData({ ...formData, advisorName: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-semibold focus:border-indigo-500 focus:outline-none"
              placeholder="Nama Guru Penguji / Pembimbing"
            />
          </div>

          {/* Current Slide Customization */}
          <div className="pt-3 border-t border-slate-100">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-600 block mb-2">
              Kustomisasi Teks Slide Saat Ini (Slide {currentSlide.slideNumber})
            </span>
            <div className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Judul Slide
                </label>
                <input
                  type="text"
                  value={slideTitle}
                  onChange={(e) => setSlideTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Subjudul Slide
                </label>
                <input
                  type="text"
                  value={slideSubtitle}
                  onChange={(e) => setSlideSubtitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-2 text-slate-500 hover:text-slate-800 text-xs font-semibold flex items-center space-x-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Default</span>
            </button>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Simpan Perubahan</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

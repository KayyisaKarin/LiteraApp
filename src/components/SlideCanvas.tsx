import React from 'react';
import {
  BookOpen,
  Search,
  Bookmark,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Cpu,
  Server,
  Smartphone,
  CheckCircle2,
  Calendar,
  Star,
  GraduationCap,
  ExternalLink,
  Code2,
  Clock,
  AlertTriangle,
  Compass,
  FileCode,
  FileText,
  HelpCircle,
  Database,
  Globe,
  Radio,
  Sliders,
  Check,
  XCircle,
  Info
} from 'lucide-react';
import { SlideData, PresenterInfo } from '../types/presentation';

interface SlideCanvasProps {
  slide: SlideData;
  presenterInfo: PresenterInfo;
  totalSlides?: number;
  isPrintMode?: boolean;
}

export const SlideCanvas: React.FC<SlideCanvasProps> = ({
  slide,
  presenterInfo,
  totalSlides = 6,
  isPrintMode = false,
}) => {
  return (
    <div
      className={`relative w-full aspect-[16/9] bg-[#CBD0F8] text-[#1E2138] font-['Plus_Jakarta_Sans',sans-serif] overflow-hidden select-none flex flex-col justify-between p-6 sm:p-9 md:p-11 transition-all ${
        isPrintMode
          ? 'print:break-after-page print:w-full print:h-screen print:p-8'
          : 'shadow-2xl rounded-[32px] border border-white/70'
      }`}
    >
      {/* Atmosphere Glow Accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/30 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#B8C0F5]/40 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      {/* ========================================================= */}
      {/* SLIDE 1: COVER & PROJECT OVERVIEW                         */}
      {/* ========================================================= */}
      {slide.id === 1 ? (
        <div className="relative z-10 w-full h-full flex flex-col justify-between bg-white/95 rounded-[28px] p-7 md:p-10 shadow-sm border border-white">
          {/* Top Bar with Project Tag & Badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5 bg-[#CBD0F8]/50 px-4 py-1.5 rounded-full border border-[#CBD0F8]">
              <Sparkles className="w-4 h-4 text-[#1E2138]" />
              <span className="text-xs font-black tracking-wider uppercase text-[#1E2138]">
                {slide.tag}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-500">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Open Library REST API • Internet Archive</span>
            </div>
          </div>

          {/* Main Title & Subtitle */}
          <div className="grid grid-cols-12 gap-8 items-center my-auto">
            <div className="col-span-12 lg:col-span-8 space-y-3.5">
              <div className="inline-block px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-extrabold uppercase tracking-wide">
                Final Project Presentation • Digital Library Explorer
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#1E2138] leading-[1.05] tracking-tight">
                {slide.title}
              </h1>
              <p className="text-base sm:text-lg md:text-xl font-semibold text-slate-600 max-w-2xl leading-relaxed">
                {slide.subtitle}
              </p>

              {/* Three Key Pillar Badges */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <div className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold flex items-center space-x-2 border border-slate-200">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <span>Digital Book Catalog</span>
                </div>
                <div className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold flex items-center space-x-2 border border-slate-200">
                  <Globe className="w-4 h-4 text-amber-600" />
                  <span>Open Library API Integration</span>
                </div>
                <div className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold flex items-center space-x-2 border border-slate-200">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Safe Null-Handling</span>
                </div>
              </div>
            </div>

            {/* Right Mini Device Preview */}
            <div className="hidden lg:flex col-span-4 justify-end">
              <div className="relative w-44 rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-900 bg-slate-900 transform rotate-1 hover:rotate-0 transition duration-300">
                <img
                  src="/public/assets/aistudio/image_e9d79786.png"
                  alt="litera App Mockup"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-2.5">
                  <span className="text-[10px] font-black text-white">
                    iPhone 17 Pro Max UI
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Presenter Credentials Card */}
          <div className="pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#CBD0F8] text-[#1E2138] flex items-center justify-center font-black text-sm shadow-xs">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm font-black text-[#1E2138]">
                  {presenterInfo.name}
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  {presenterInfo.classGrade} • {presenterInfo.school}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-6 text-right">
              <div>
                <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  HTTP Method & Format
                </div>
                <div className="text-xs font-black text-[#1E2138]">
                  GET • JSON Response
                </div>
              </div>
              <div>
                <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Tahun Ajaran
                </div>
                <div className="text-xs font-black text-[#1E2138]">
                  {presenterInfo.academicYear}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================= */
        /* SLIDES 2 TO 6: STRUCTURED CONTENT SLIDES                  */
        /* ========================================================= */
        <div className="relative z-10 w-full h-full flex flex-col justify-between">
          {/* Header Bar */}
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center space-x-3">
              <span className="px-3.5 py-1 bg-white/90 backdrop-blur-md rounded-full text-xs font-black text-[#1E2138] tracking-wider uppercase shadow-xs">
                {slide.tag}
              </span>
              <span className="text-xs font-bold text-slate-800 hidden sm:inline">
                litera — Digital Library Explorer
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-black text-slate-800 bg-white/80 px-3.5 py-1 rounded-full border border-white/60 shadow-2xs">
                SLIDE {slide.slideNumber} / {totalSlides}
              </span>
            </div>
          </div>

          {/* Title & Subtitle */}
          <div className="mb-3.5">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#1E2138] leading-tight tracking-tight">
              {slide.title}
            </h2>
            <p className="text-xs sm:text-sm md:text-base font-semibold text-slate-700 mt-1">
              {slide.subtitle}
            </p>
          </div>

          {/* Main White Content Card */}
          <div className="flex-1 bg-white/95 rounded-[26px] p-5 sm:p-6 md:p-7 shadow-sm border border-white flex flex-col justify-center overflow-hidden">
            {/* SLIDE 4: TECH STACK & API INTEGRATION (CUSTOM 4-GRID WITH CODE HIGHLIGHTS) */}
            {slide.id === 4 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 h-full items-center">
                {slide.bulletPoints?.map((item, idx) => {
                  const isEndpoint = idx === 0 || idx === 2;
                  const isPipeline = idx === 3;
                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border transition flex flex-col justify-between h-full ${
                        isEndpoint
                          ? 'bg-[#F4F6FD] border-indigo-100'
                          : 'bg-[#F8F9FE] border-slate-200/80'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-black text-[#1E2138] flex items-center space-x-2">
                            <span className="w-6 h-6 rounded-lg bg-[#1E2138] text-white text-[11px] font-black flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <span>{item.title}</span>
                          </span>
                          {item.badge && (
                            <span className="text-[10px] font-extrabold bg-[#CBD0F8] text-[#1E2138] px-2.5 py-0.5 rounded-md">
                              {item.badge}
                            </span>
                          )}
                        </div>

                        <p className="text-[11.5px] text-slate-600 leading-relaxed mt-1.5 font-normal">
                          {item.description}
                        </p>
                      </div>

                      {/* Technical visual badge */}
                      <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10.5px] font-mono text-slate-500">
                        {idx === 0 && (
                          <>
                            <span className="font-bold text-indigo-700">METHOD: GET</span>
                            <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                              format: JSON
                            </span>
                          </>
                        )}
                        {idx === 1 && (
                          <>
                            <span className="font-bold text-emerald-700">PAYLOAD FIELDS</span>
                            <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                              title, cover_i, ratings
                            </span>
                          </>
                        )}
                        {idx === 2 && (
                          <>
                            <span className="font-bold text-amber-700">IMAGE RESOLUTION</span>
                            <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                              -M.jpg (Medium)
                            </span>
                          </>
                        )}
                        {idx === 3 && (
                          <>
                            <span className="font-bold text-violet-700">HANDLING</span>
                            <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                              Safe Null-Check Fallback
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : slide.id === 5 ? (
              /* SLIDE 5: FEATURE LIST (DISTINGUISHING AVAILABLE VS UNCONFIRMED) */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 h-full items-center">
                {slide.bulletPoints?.map((item, idx) => {
                  const isUnconfirmed = item.badge?.includes('Belum');
                  return (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-2xl border transition flex flex-col justify-between h-full ${
                        isUnconfirmed
                          ? 'bg-amber-50/50 border-amber-200/80'
                          : 'bg-[#F8F9FE] border-slate-200/70 hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span
                            className={`text-[9.5px] font-black uppercase px-2 py-0.5 rounded-md flex items-center space-x-1 ${
                              isUnconfirmed
                                ? 'bg-amber-100 text-amber-900 border border-amber-300/80'
                                : 'bg-emerald-100 text-emerald-900 border border-emerald-300/70'
                            }`}
                          >
                            {isUnconfirmed ? (
                              <Info className="w-3 h-3" />
                            ) : (
                              <Check className="w-3 h-3 text-emerald-700 stroke-[3]" />
                            )}
                            <span>{item.badge}</span>
                          </span>
                          <span className="text-[11px] font-black text-slate-400">
                            #{idx + 1}
                          </span>
                        </div>

                        <h4 className="text-[12.5px] font-black text-[#1E2138] leading-tight">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-slate-600 mt-1 leading-snug font-normal">
                          {item.description}
                        </p>
                      </div>

                      <div className="pt-2 text-[10px] font-semibold text-slate-400 flex items-center justify-between">
                        <span>Status:</span>
                        <span
                          className={`font-bold ${
                            isUnconfirmed ? 'text-amber-700' : 'text-emerald-700'
                          }`}
                        >
                          {isUnconfirmed ? 'Belum Dikonfirmasi' : 'Tersedia & Siap Digunakan'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : slide.id === 2 || slide.id === 3 ? (
              /* SLIDE 2 & 3: PROBLEM & SOLUTION (3 PROMINENT PILLARS) */
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full items-center">
                {slide.bulletPoints?.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 sm:p-5 rounded-2xl bg-[#F8F9FE] border border-slate-200/80 hover:border-indigo-200 transition flex flex-col justify-between h-full shadow-2xs"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                            slide.id === 2
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-emerald-100 text-emerald-900'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        {item.badge && (
                          <span className="text-[10.5px] font-extrabold bg-[#CBD0F8]/80 text-[#1E2138] px-2.5 py-0.5 rounded-md">
                            {item.badge}
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-black text-[#1E2138] leading-snug">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-200/60 mt-3 flex items-center justify-between text-[11px] font-bold text-slate-400">
                      <span>{slide.id === 2 ? 'Fase Pengembangan' : 'Strategi Iteratif'}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* SLIDE 6: CONCLUSION & ROADMAP (2 CONCLUSION CARDS + 2 ROADMAP CARDS) */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full items-center">
                {slide.bulletPoints?.map((item, idx) => {
                  const isRoadmap = idx >= 2;
                  return (
                    <div
                      key={idx}
                      className={`p-4 sm:p-5 rounded-2xl border transition flex flex-col justify-between h-full ${
                        isRoadmap
                          ? 'bg-[#F2F4FD] border-indigo-200/80'
                          : 'bg-[#F8F9FE] border-slate-200/80'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md ${
                              isRoadmap
                                ? 'bg-indigo-100 text-indigo-900'
                                : 'bg-emerald-100 text-emerald-900'
                            }`}
                          >
                            {item.badge}
                          </span>
                          <span className="text-xs font-bold text-slate-400">
                            #{idx + 1}
                          </span>
                        </div>

                        <h4 className="text-sm font-black text-[#1E2138] leading-tight">
                          {item.title}
                        </h4>
                        <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      <div className="pt-2 text-[11px] font-bold text-indigo-700/80 flex items-center space-x-1">
                        {isRoadmap ? (
                          <>
                            <Compass className="w-3.5 h-3.5" />
                            <span>Rencana Tahap Lanjutan</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Pencapaian Terverifikasi</span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Slide Footer */}
          <div className="flex items-center justify-between mt-3 text-[11px] font-semibold text-slate-700/80 px-2">
            <div>
              Project: <span className="text-[#1E2138] font-bold">litera — Digital Library Explorer</span>
            </div>
            <div>
              {presenterInfo.name} ({presenterInfo.classGrade}) • {presenterInfo.school}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

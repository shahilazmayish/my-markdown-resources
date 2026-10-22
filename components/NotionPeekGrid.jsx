import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Sidebar, 
  Square, 
  Maximize2, 
  Minimize2, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  ExternalLink,
  Tag,
  Clock,
  Calendar,
  Check
} from 'lucide-react';

/**
 * Notion Dark Mode Theme Configurations
 * Use with Tailwind 'dark' class or data-theme attributes.
 */
export const DARK_THEMES = {
  classic: {
    name: 'Notion Dark (Classic)',
    canvas: 'bg-[#191919]',
    card: 'bg-[#202020] hover:bg-[#282828]',
    border: 'border-white/10',
    text: 'text-[#ebebeb]',
    muted: 'text-[#9b9b9b]',
    primary: 'bg-[#2383e2] text-white'
  },
  oled: {
    name: 'Notion Midnight (OLED Pure Black)',
    canvas: 'bg-[#090a0f]',
    card: 'bg-[#10141d] hover:bg-[#171d2b]',
    border: 'border-white/[0.08]',
    text: 'text-[#f9fafb]',
    muted: 'text-[#9ca3af]',
    primary: 'bg-[#38bdf8] text-slate-900'
  },
  charcoal: {
    name: 'Charcoal Slate',
    canvas: 'bg-[#18181b]',
    card: 'bg-[#222226] hover:bg-[#2b2b30]',
    border: 'border-white/10',
    text: 'text-[#f4f4f5]',
    muted: 'text-[#a1a1aa]',
    primary: 'bg-[#60a5fa] text-white'
  },
  warm: {
    name: 'Warm Espresso (Obsidian)',
    canvas: 'bg-[#191715]',
    card: 'bg-[#221f1d] hover:bg-[#2d2926]',
    border: 'border-[#fef3c7]/[0.08]',
    text: 'text-[#fbf7ee]',
    muted: 'text-[#d6cebf]',
    primary: 'bg-[#d97706] text-white'
  },
  piszczek: {
    name: 'Piszczek Terminal Dark',
    canvas: 'bg-[#030303]',
    card: 'bg-[#090B0A] hover:bg-[#121614]',
    border: 'border-white/[0.12] hover:border-[#00FF94]/40',
    text: 'text-[#FFFFFF]',
    muted: 'text-[#8A93A3]',
    primary: 'bg-[#00FF94] text-[#030303] font-bold shadow-[0_0_16px_rgba(0,255,148,0.3)]',
    chip: 'bg-[#101010] text-[#00FF94] border border-[#00FF94]/20'
  }
};

/**
 * Refactored Notion-Style Grid with Resizable Side Peek & 3-Mode Drawer System
 */
export default function NotionPeekGrid({ items = [], onEditItem }) {
  // Active Item and Drawer States
  const [activeItemId, setActiveItemId] = useState(null);
  const [peekMode, setPeekMode] = useState('side'); // 'side' | 'center' | 'full'
  const [peekWidth, setPeekWidth] = useState(640);
  const [isResizing, setIsResizing] = useState(false);
  const [isModeDropdownOpen, setIsModeDropdownOpen] = useState(false);

  const activeIndex = items.findIndex((item) => item.id === activeItemId);
  const activeItem = items[activeIndex] || null;

  // Drag Handle Resize Logic
  const startXRef = useRef(0);
  const startWidthRef = useRef(640);

  const startResizing = useCallback((e) => {
    if (peekMode !== 'side') return;
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = peekWidth;
    document.body.style.userSelect = 'none';
  }, [peekMode, peekWidth]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const delta = startXRef.current - e.clientX;
      const minWidth = 320;
      const maxWidth = window.innerWidth * 0.8;
      const nextWidth = Math.max(minWidth, Math.min(maxWidth, startWidthRef.current + delta));
      setPeekWidth(nextWidth);
    };

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
        document.body.style.userSelect = '';
      }
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // Keyboard navigation & Esc to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!activeItem) return;
      if (e.key === 'Escape') {
        setActiveItemId(null);
      } else if (e.key === 'ArrowRight' || e.key === 'j') {
        if (activeIndex < items.length - 1) setActiveItemId(items[activeIndex + 1].id);
      } else if (e.key === 'ArrowLeft' || e.key === 'k') {
        if (activeIndex > 0) setActiveItemId(items[activeIndex - 1].id);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeItem, activeIndex, items]);

  const closePeek = () => {
    setActiveItemId(null);
    setIsModeDropdownOpen(false);
  };

  const isSidePeekActive = Boolean(activeItem && peekMode === 'side');

  return (
    <div className="relative min-h-screen bg-white text-zinc-900 dark:bg-[#191919] dark:text-[#ebebeb] transition-colors duration-200">
      
      {/* Dynamic Main Layout Container: resizes smoothly when Side Peek is active */}
      <div 
        className="transition-[margin-right] duration-200 ease-out"
        style={{ marginRight: isSidePeekActive ? `${peekWidth}px` : 0 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-10">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Resource Library</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Hover over any card to reveal the Notion-style 'OPEN' peek trigger.
            </p>
          </div>

          {/* Grid Component */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((item) => {
              const isSelected = activeItemId === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setActiveItemId(item.id)}
                  className={`group relative flex flex-col justify-between p-6 rounded-xl border transition-all duration-200 cursor-pointer
                    ${isSelected 
                      ? 'border-[#0075de] dark:border-[#2383e2] ring-1 ring-[#0075de] dark:ring-[#2383e2] bg-zinc-50 dark:bg-[#242424]' 
                      : 'border-zinc-200/80 dark:border-white/10 bg-white dark:bg-[#202020] hover:border-zinc-300 dark:hover:border-white/20 hover:bg-zinc-50/70 dark:hover:bg-[#262626]'
                    }`}
                >
                  {/* SPEC 1: Notion 'OPEN' button overlay on card hover */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveItemId(item.id);
                    }}
                    className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold tracking-wider uppercase
                               bg-white/95 dark:bg-[#202020]/95 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-white/15 
                               rounded-md shadow-sm opacity-0 group-hover:opacity-100 -translate-y-1 group-hover:translate-y-0 
                               transition-all duration-150 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-600 z-10"
                    title="Open side peek"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open</span>
                  </button>

                  <div>
                    {/* Category & Date */}
                    <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-[#58a6ff] mb-2 pr-16">
                      <span>{item.category || 'General'}</span>
                      <span className="text-zinc-400 dark:text-zinc-500 font-normal normal-case">{item.date}</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight leading-snug mb-2">
                      {item.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3 mb-4 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Tags & Footer */}
                  <div>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {item.tags?.map((tag) => (
                        <span 
                          key={tag}
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-700 dark:bg-white/[0.08] dark:text-zinc-300"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-zinc-100 dark:border-white/[0.06] flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500">
                      <span className="font-mono">{item.fileName || 'document.md'}</span>
                      <span>{item.readingTime || '2 min read'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Backdrop for 'Center peek' modal mode */}
      {activeItem && peekMode === 'center' && (
        <div 
          onClick={closePeek}
          className="fixed inset-0 bg-black/60 dark:bg-black/75 backdrop-blur-sm z-40 transition-opacity duration-200"
        />
      )}

      {/* SPEC 2 & 3: Resizable Side Peek Drawer & 3 View Modes */}
      {activeItem && (
        <aside
          className={`fixed z-50 bg-white dark:bg-[#202020] text-zinc-900 dark:text-[#ebebeb] flex flex-col shadow-2xl transition-all duration-200 overflow-hidden
            ${peekMode === 'side' ? 'top-0 right-0 bottom-0 border-l border-zinc-200 dark:border-white/10' : ''}
            ${peekMode === 'center' ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-4xl h-[88vh] rounded-2xl border border-zinc-200 dark:border-white/15' : ''}
            ${peekMode === 'full' ? 'inset-0 w-screen h-screen' : ''}
          `}
          style={peekMode === 'side' ? { width: `${peekWidth}px` } : {}}
        >
          {/* Invisible/Visible Horizontal Drag Resize Handle on left border (Side peek only) */}
          {peekMode === 'side' && (
            <div
              onMouseDown={startResizing}
              className={`absolute top-0 left-0 w-2 h-full cursor-col-resize z-20 group hover:bg-blue-500/20 active:bg-blue-500/30 transition-colors
                ${isResizing ? 'bg-blue-500/40' : ''}`}
              title="Click and drag to resize"
            >
              <div className="absolute top-1/2 -translate-y-1/2 left-0.5 w-1 h-10 rounded-full bg-zinc-300 dark:bg-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}

          {/* Top Action Bar */}
          <div className="h-14 border-b border-zinc-200 dark:border-white/10 px-5 flex items-center justify-between bg-zinc-50/50 dark:bg-[#202020] shrink-0 select-none">
            
            {/* Left Controls: Mode Switcher & Item Nav */}
            <div className="flex items-center gap-2">
              
              {/* Mode Switcher Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsModeDropdownOpen(!isModeDropdownOpen)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700/80 transition-colors"
                >
                  {peekMode === 'side' && <Sidebar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                  {peekMode === 'center' && <Square className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                  {peekMode === 'full' && <Maximize2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                  <span className="capitalize">{peekMode} peek</span>
                  <ChevronRight className="w-3 h-3 rotate-90 text-zinc-400" />
                </button>

                {isModeDropdownOpen && (
                  <div className="absolute left-0 mt-1.5 w-44 rounded-xl bg-white dark:bg-[#26262a] border border-zinc-200 dark:border-white/10 shadow-xl py-1.5 z-30">
                    <button
                      onClick={() => { setPeekMode('side'); setIsModeDropdownOpen(false); }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-left ${peekMode === 'side' ? 'text-blue-600 bg-blue-50/70 dark:bg-blue-900/30 dark:text-blue-400' : 'text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700/50'}`}
                    >
                      <div className="flex items-center gap-2">
                        <Sidebar className="w-4 h-4" />
                        <span>Side peek</span>
                      </div>
                      {peekMode === 'side' && <Check className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => { setPeekMode('center'); setIsModeDropdownOpen(false); }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-left ${peekMode === 'center' ? 'text-blue-600 bg-blue-50/70 dark:bg-blue-900/30 dark:text-blue-400' : 'text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700/50'}`}
                    >
                      <div className="flex items-center gap-2">
                        <Square className="w-4 h-4" />
                        <span>Center peek</span>
                      </div>
                      {peekMode === 'center' && <Check className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => { setPeekMode('full'); setIsModeDropdownOpen(false); }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-left ${peekMode === 'full' ? 'text-blue-600 bg-blue-50/70 dark:bg-blue-900/30 dark:text-blue-400' : 'text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700/50'}`}
                    >
                      <div className="flex items-center gap-2">
                        <Maximize2 className="w-4 h-4" />
                        <span>Full page</span>
                      </div>
                      {peekMode === 'full' && <Check className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}
              </div>

              {/* Prev / Next Item Navigation */}
              <div className="flex items-center pl-2 border-l border-zinc-200 dark:border-white/10 gap-1 text-xs text-zinc-500">
                <button
                  disabled={activeIndex <= 0}
                  onClick={() => setActiveItemId(items[activeIndex - 1].id)}
                  className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700/70 disabled:opacity-30 disabled:hover:bg-transparent"
                  title="Previous (Left Arrow / k)"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-1 font-mono text-[11px]">{activeIndex + 1} of {items.length}</span>
                <button
                  disabled={activeIndex >= items.length - 1}
                  onClick={() => setActiveItemId(items[activeIndex + 1].id)}
                  className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700/70 disabled:opacity-30 disabled:hover:bg-transparent"
                  title="Next (Right Arrow / j)"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Controls: Full Page Toggle & Close */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPeekMode(peekMode === 'full' ? 'side' : 'full')}
                className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:hover:text-zinc-100"
                title={peekMode === 'full' ? 'Restore size' : 'Expand full page'}
              >
                {peekMode === 'full' ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              {onEditItem && (
                <button
                  onClick={() => onEditItem(activeItem)}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg border border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Edit
                </button>
              )}

              <button
                onClick={closePeek}
                className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:hover:text-zinc-100"
                title="Close peek (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Peek Scrollable Document Content */}
          <div className="flex-1 overflow-y-auto p-8 lg:p-12">
            <div className="max-w-3xl mx-auto">
              <span className="inline-block text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">
                {activeItem.category || 'General'}
              </span>

              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-4">
                {activeItem.title}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 mb-6 pb-4 border-b border-zinc-200 dark:border-white/10">
                <span className="font-mono">{activeItem.fileName}</span>
                <span>•</span>
                <span>{activeItem.readingTime}</span>
                <span>•</span>
                <span>Updated {activeItem.date}</span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-8">
                {activeItem.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-700 dark:bg-white/[0.08] dark:text-zinc-300"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Markdown Body or Content */}
              <div className="prose dark:prose-invert max-w-none text-zinc-800 dark:text-zinc-200 leading-relaxed space-y-4">
                {activeItem.body ? (
                  <div dangerouslySetInnerHTML={{ __html: activeItem.body }} />
                ) : (
                  <p>{activeItem.description}</p>
                )}
              </div>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}

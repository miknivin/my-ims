import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperClass } from "swiper";
import "swiper/css";
import { useDropdownPosition } from "@/shared/hooks/useDropdownPosition";

export interface DateRangeValue {
  fromDate: string;
  toDate: string;
}

interface DateRangePickerProps {
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

interface Preset {
  label: string;
  getRange: () => DateRangeValue;
}

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function DateRangePicker({
  value,
  onChange,
  label,
  placeholder = "No range selected",
  className = "",
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState<DateRangeValue>(value);
  const [visibleMonth, setVisibleMonth] = useState(() =>
    startOfMonth(parseIso(value.fromDate) ?? today()),
  );
  const [shortcutsSwiper, setShortcutsSwiper] = useState<SwiperClass | null>(
    null,
  );
  const [isYearPickerOpen, setIsYearPickerOpen] = useState(false);
  const [yearSearch, setYearSearch] = useState("");
  const [yearPageStart, setYearPageStart] = useState(() =>
    getYearPageStart(visibleMonth.getFullYear()),
  );
  const {
    anchorRef,
    dropdownRef,
    dropdownStyle,
    isPositionReady,
    updatePosition,
  } = useDropdownPosition({
    isOpen,
    preferredSide: "bottom",
    align: "end",
    offset: 8,
    viewportPadding: 16,
    strategy: "fixed",
  });

  useEffect(() => {
    if (!isOpen) {
      setDraft(value);
      const nextVisibleMonth = startOfMonth(parseIso(value.fromDate) ?? today());
      setVisibleMonth(nextVisibleMonth);
      setYearPageStart(getYearPageStart(nextVisibleMonth.getFullYear()));
      setIsYearPickerOpen(false);
      setYearSearch("");
    }
  }, [isOpen, value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        anchorRef.current &&
        dropdownRef.current &&
        !anchorRef.current.contains(event.target as Node) &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [anchorRef, dropdownRef, isOpen]);

  useEffect(() => {
    if (isOpen) {
      updatePosition();
    }
  }, [
    isOpen,
    isYearPickerOpen,
    shortcutsSwiper,
    updatePosition,
    visibleMonth,
    yearSearch,
  ]);

  const presets = useMemo<Preset[]>(
    () => [
      { label: "Today", getRange: () => singleDay(today()) },
      { label: "Yesterday", getRange: () => singleDay(addDays(today(), -1)) },
      { label: "Last 7 days", getRange: () => lastDays(7) },
      { label: "Last 14 days", getRange: () => lastDays(14) },
      { label: "Last 30 days", getRange: () => lastDays(30) },
      { label: "This month", getRange: thisMonth },
      { label: "Last month", getRange: lastMonth },
      { label: "This quarter", getRange: thisQuarter },
      { label: "This year", getRange: thisYear },
      { label: "Last year", getRange: lastYear },
    ],
    [],
  );

  const calendarDays = useMemo(
    () => buildCalendarDays(visibleMonth),
    [visibleMonth],
  );
  const visibleYears = useMemo(
    () => buildVisibleYears(yearPageStart, yearSearch),
    [yearPageStart, yearSearch],
  );
  const draftStart = parseIso(draft.fromDate);
  const draftEnd = parseIso(draft.toDate);
  const displayText =
    value.fromDate && value.toDate
      ? `${formatDisplay(value.fromDate)} - ${formatDisplay(value.toDate)}`
      : placeholder;
  const canApply = Boolean(draft.fromDate && draft.toDate);

  const handleDayClick = (date: Date) => {
    const selected = toIso(date);
    const start = parseIso(draft.fromDate);
    const end = parseIso(draft.toDate);

    if (!start || end || date < start) {
      setDraft({ fromDate: selected, toDate: "" });
      return;
    }

    setDraft({ fromDate: draft.fromDate, toDate: selected });
  };

  const handlePreset = (preset: Preset) => {
    const next = preset.getRange();
    setDraft(next);
    const nextVisibleMonth = startOfMonth(parseIso(next.fromDate) ?? today());
    setVisibleMonth(nextVisibleMonth);
    setYearPageStart(getYearPageStart(nextVisibleMonth.getFullYear()));
    setIsYearPickerOpen(false);
    setYearSearch("");
  };

  const handleYearSelect = (year: number) => {
    setVisibleMonth(new Date(year, visibleMonth.getMonth(), 1));
    setYearPageStart(getYearPageStart(year));
    setIsYearPickerOpen(false);
    setYearSearch("");
  };

  const handleApply = () => {
    if (!canApply) {
      return;
    }

    onChange(draft);
    setIsOpen(false);
  };

  const handleClear = () => {
    const cleared = { fromDate: "", toDate: "" };
    setDraft(cleared);
    onChange(cleared);
    setIsOpen(false);
  };

  const pickerDropdown = isOpen
    ? createPortal(
        <div
          ref={dropdownRef}
          style={{
            ...dropdownStyle,
            visibility: isPositionReady ? "visible" : "hidden",
          }}
          className={`z-99999 w-[336px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900 sm:w-[360px] ${
            isPositionReady ? "" : "pointer-events-none"
          }`}
          aria-hidden={!isPositionReady}
        >
          <DateRangePickerDropdown
            presets={presets}
            draft={draft}
            draftStart={draftStart}
            draftEnd={draftEnd}
            visibleMonth={visibleMonth}
            yearPageStart={yearPageStart}
            calendarDays={calendarDays}
            visibleYears={visibleYears}
            canApply={canApply}
            shortcutsSwiper={shortcutsSwiper}
            isYearPickerOpen={isYearPickerOpen}
            yearSearch={yearSearch}
            setShortcutsSwiper={setShortcutsSwiper}
            onPreset={handlePreset}
            onDayClick={handleDayClick}
            onMonthChange={setVisibleMonth}
            onYearPickerToggle={() => setIsYearPickerOpen((current) => !current)}
            onYearSearchChange={setYearSearch}
            onYearPageChange={setYearPageStart}
            onYearSelect={handleYearSelect}
            onClear={handleClear}
            onCancel={() => setIsOpen(false)}
            onApply={handleApply}
          />
        </div>,
        document.body,
      )
    : null;

  return (
    <div className={className} ref={anchorRef}>
      {label ? (
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      ) : null}

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex h-11 w-full items-center justify-between gap-3 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-left text-sm text-gray-800 shadow-theme-xs transition focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
      >
        <span
          className={
            value.fromDate && value.toDate
              ? "text-gray-800 dark:text-white/90"
              : "text-gray-400 dark:text-white/30"
          }
        >
          {displayText}
        </span>
        <CalendarDays className="h-5 w-5 text-gray-500 dark:text-gray-400" />
      </button>

      {pickerDropdown}
    </div>
  );
}

function DateRangePickerDropdown({
  presets,
  draft,
  draftStart,
  draftEnd,
  visibleMonth,
  yearPageStart,
  calendarDays,
  visibleYears,
  canApply,
  shortcutsSwiper,
  isYearPickerOpen,
  yearSearch,
  setShortcutsSwiper,
  onPreset,
  onDayClick,
  onMonthChange,
  onYearPickerToggle,
  onYearSearchChange,
  onYearPageChange,
  onYearSelect,
  onClear,
  onCancel,
  onApply,
}: {
  presets: Preset[];
  draft: DateRangeValue;
  draftStart: Date | null;
  draftEnd: Date | null;
  visibleMonth: Date;
  yearPageStart: number;
  calendarDays: Array<{ date: Date }>;
  visibleYears: number[];
  canApply: boolean;
  shortcutsSwiper: SwiperClass | null;
  isYearPickerOpen: boolean;
  yearSearch: string;
  setShortcutsSwiper: (swiper: SwiperClass) => void;
  onPreset: (preset: Preset) => void;
  onDayClick: (date: Date) => void;
  onMonthChange: (date: Date) => void;
  onYearPickerToggle: () => void;
  onYearSearchChange: (value: string) => void;
  onYearPageChange: (year: number) => void;
  onYearSelect: (year: number) => void;
  onClear: () => void;
  onCancel: () => void;
  onApply: () => void;
}) {
  return (
    <>
      <div className="border-b border-gray-100 bg-gray-50 px-2 py-1.5 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center gap-1.5">
          <IconButton
            label="Previous shortcuts"
            onClick={() => shortcutsSwiper?.slidePrev()}
          >
            <ChevronLeft className="h-4 w-4" />
          </IconButton>

          <Swiper
            slidesPerView="auto"
            spaceBetween={6}
            onSwiper={setShortcutsSwiper}
            className="min-w-0 flex-1"
          >
            {presets.map((preset) => {
              const presetRange = preset.getRange();
              const isSelected =
                draft.fromDate === presetRange.fromDate &&
                draft.toDate === presetRange.toDate;

              return (
                <SwiperSlide key={preset.label} className="!w-auto">
                  <button
                    type="button"
                    onClick={() => onPreset(preset)}
                    className={`inline-flex h-7 items-center whitespace-nowrap rounded-full border px-2.5 text-xs font-medium transition ${
                      isSelected
                        ? "border-brand-500 bg-brand-500 text-white"
                        : "border-gray-200 bg-white text-gray-700 hover:border-brand-300 hover:text-brand-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-brand-700 dark:hover:text-brand-300"
                    }`}
                  >
                    {preset.label}
                  </button>
                </SwiperSlide>
              );
            })}
          </Swiper>

          <IconButton
            label="Next shortcuts"
            onClick={() => shortcutsSwiper?.slideNext()}
          >
            <ChevronRight className="h-4 w-4" />
          </IconButton>
        </div>
      </div>

      <div className="px-1.5 py-2">
        <div className="mb-1.5 flex items-center justify-between px-1">
          <IconButton
            label="Previous month"
            onClick={() =>
              isYearPickerOpen
                ? onYearPageChange(yearPageStart - 12)
                : onMonthChange(addMonths(visibleMonth, -1))
            }
          >
            <ChevronLeft className="h-5 w-5" />
          </IconButton>
          <div className="flex items-center text-base font-semibold text-gray-900 dark:text-white">
            <span>{monthNames[visibleMonth.getMonth()]}</span>
            <button
              type="button"
              onClick={onYearPickerToggle}
              className={`ml-1 rounded-md px-1.5 py-0.5 transition ${
                isYearPickerOpen
                  ? "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              {visibleMonth.getFullYear()}
            </button>
          </div>
          <IconButton
            label="Next month"
            onClick={() =>
              isYearPickerOpen
                ? onYearPageChange(yearPageStart + 12)
                : onMonthChange(addMonths(visibleMonth, 1))
            }
          >
            <ChevronRight className="h-5 w-5" />
          </IconButton>
        </div>

        {isYearPickerOpen ? (
          <div>
            <div className="relative mb-2">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={yearSearch}
                onChange={(event) => onYearSearchChange(event.target.value)}
                placeholder="Search year"
                inputMode="numeric"
                className="h-9 w-full rounded-lg border border-gray-200 bg-transparent pl-8 pr-2.5 text-sm text-gray-800 outline-hidden transition placeholder:text-gray-400 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white/90 dark:placeholder:text-white/30"
              />
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {visibleYears.map((year) => {
                const isSelected = year === visibleMonth.getFullYear();

                return (
                  <button
                    key={year}
                    type="button"
                    onClick={() => onYearSelect(year)}
                    className={`h-9 rounded-lg text-sm font-medium transition ${
                      isSelected
                        ? "bg-brand-500 text-white"
                        : "border border-gray-100 text-gray-700 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 dark:border-gray-800 dark:text-gray-300 dark:hover:border-brand-700 dark:hover:bg-brand-500/15 dark:hover:text-brand-300"
                    }`}
                  >
                    {year}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-0 text-center">
            {weekDays.map((day) => (
              <div
                key={day}
                className="py-1 text-xs font-semibold text-gray-500 dark:text-gray-400"
              >
                {day}
              </div>
            ))}
            {calendarDays.map((day) => {
              const inCurrentMonth =
                day.date.getMonth() === visibleMonth.getMonth();
              const isStart = draftStart && sameDay(day.date, draftStart);
              const isEnd = draftEnd && sameDay(day.date, draftEnd);
              const inRange =
                draftStart &&
                draftEnd &&
                day.date >= draftStart &&
                day.date <= draftEnd;
              const isSelected = Boolean(isStart || isEnd);
              const hasCompleteRange = Boolean(draftStart && draftEnd);
              const isSingleDay = Boolean(isStart && isEnd);
              const rangeEdgeClass = !hasCompleteRange || isSingleDay
                ? "rounded-lg"
                : isStart
                  ? "rounded-l-lg"
                  : isEnd
                    ? "rounded-r-lg"
                    : "";

              return (
                <button
                  key={toIso(day.date)}
                  type="button"
                  onClick={() => onDayClick(day.date)}
                  className={`h-8 text-sm font-medium transition ${
                    isSelected
                      ? `bg-brand-500 text-white ${rangeEdgeClass}`
                      : inRange
                        ? "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300"
                        : inCurrentMonth
                          ? "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                          : "text-gray-300 hover:bg-gray-50 dark:text-gray-700 dark:hover:bg-gray-800"
                  }`}
                >
                  {day.date.getDate()}
                </button>
              );
            })}
          </div>
        )}

        <div className="mx-1 mt-2 flex flex-col gap-2 border-t border-gray-100 pt-2 dark:border-gray-800">
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
            {draft.fromDate ? formatDisplay(draft.fromDate) : "Pick start date"}
            <span className="px-2 text-gray-400">to</span>
            {draft.toDate ? formatDisplay(draft.toDate) : "pick end date"}
          </p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClear}
              className="inline-flex h-8 items-center justify-center rounded-lg border border-gray-300 px-2.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <X className="mr-2 h-4 w-4" />
              Clear
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex h-8 items-center justify-center rounded-lg border border-gray-300 px-2.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onApply}
              disabled={!canApply}
              className="inline-flex h-8 items-center justify-center rounded-lg bg-brand-500 px-2.5 text-xs font-medium text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-gray-300 dark:disabled:bg-gray-700"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function IconButton({
  label,
  children,
  onClick,
}: {
  label: string;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-gray-300 text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
    >
      {children}
    </button>
  );
}

function buildCalendarDays(month: Date) {
  const firstDay = startOfMonth(month);
  const start = addDays(firstDay, -firstDay.getDay());
  return Array.from({ length: 42 }, (_, index) => ({
    date: addDays(start, index),
  }));
}

function buildVisibleYears(pageStart: number, search: string) {
  const normalizedSearch = search.replace(/\D/g, "").trim();

  if (normalizedSearch) {
    return Array.from({ length: 201 }, (_, index) => 1900 + index)
      .filter((year) => year.toString().includes(normalizedSearch))
      .slice(0, 12);
  }

  return Array.from({ length: 12 }, (_, index) => pageStart + index);
}

function getYearPageStart(year: number) {
  return Math.floor(year / 12) * 12;
}

function today() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function singleDay(date: Date): DateRangeValue {
  return { fromDate: toIso(date), toDate: toIso(date) };
}

function lastDays(days: number): DateRangeValue {
  const end = today();
  return { fromDate: toIso(addDays(end, -(days - 1))), toDate: toIso(end) };
}

function thisMonth(): DateRangeValue {
  const current = today();
  return {
    fromDate: toIso(startOfMonth(current)),
    toDate: toIso(endOfMonth(current)),
  };
}

function lastMonth(): DateRangeValue {
  const month = addMonths(today(), -1);
  return {
    fromDate: toIso(startOfMonth(month)),
    toDate: toIso(endOfMonth(month)),
  };
}

function thisQuarter(): DateRangeValue {
  const current = today();
  const quarterStartMonth = Math.floor(current.getMonth() / 3) * 3;
  const start = new Date(current.getFullYear(), quarterStartMonth, 1);
  return {
    fromDate: toIso(start),
    toDate: toIso(endOfMonth(new Date(start.getFullYear(), start.getMonth() + 2, 1))),
  };
}

function thisYear(): DateRangeValue {
  const current = today();
  return {
    fromDate: toIso(new Date(current.getFullYear(), 0, 1)),
    toDate: toIso(new Date(current.getFullYear(), 11, 31)),
  };
}

function lastYear(): DateRangeValue {
  const year = today().getFullYear() - 1;
  return {
    fromDate: toIso(new Date(year, 0, 1)),
    toDate: toIso(new Date(year, 11, 31)),
  };
}

function parseIso(value: string) {
  if (!value) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
}

function toIso(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDisplay(value: string) {
  const date = parseIso(value);
  if (!date) {
    return "";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function addDays(date: Date, days: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function sameDay(left: Date, right: Date) {
  return toIso(left) === toIso(right);
}

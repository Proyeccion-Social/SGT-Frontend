"use client"

import { useCallback, useEffect, useState } from "react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
import {
  ListFilterIcon,
  MonitorIcon,
  BookOpenIcon,
  StarIcon,
  CalendarIcon,
  ChevronDownIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useSubjectStore } from "@/store/subjectStore"

const DAYS_OF_WEEK = [
  { value: "MONDAY", label: "Lunes" },
  { value: "TUESDAY", label: "Martes" },
  { value: "WEDNESDAY", label: "Miércoles" },
  { value: "THURSDAY", label: "Jueves" },
  { value: "FRIDAY", label: "Viernes" },
  { value: "SATURDAY", label: "Sábado" },
]

const MODALITIES = [
  { value: "VIRT", label: "Virtual" },
  { value: "PRES", label: "Presencial" },
]

const RATINGS = [
  { value: "4", label: "4+ estrellas" },
  { value: "3", label: "3+ estrellas" },
  { value: "2", label: "2+ estrellas" },
  { value: "1", label: "1+ estrellas" },
]

function useIsMobile(bp = 500) {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < bp)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [bp])
  return isMobile
}

const badgeStyle: React.CSSProperties = {
  backgroundColor: "var(--color-moradops-100)",
  color: "var(--color-moradops-600)",
}

export function TutorFilters() {
  const { subjects: storeSubjects } = useSubjectStore()
  const [selectedModalities, setSelectedModalities] = useState<string[]>([])
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const [selectedRating, setSelectedRating] = useState<string | null>(null)
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const isMobile = useIsMobile()

  const subjects = storeSubjects.map((s) => ({ value: s.id, label: s.name }))

  const dispatch = useCallback(
    (m: string[], s: string[], r: string | null, d: string[]) => {
      const detail: Record<string, string[]> = {}
      if (m.length) detail.modality = m
      if (s.length) detail.subject = s
      if (r) detail.rating = [r]
      if (d.length) detail.availability = d
      document.dispatchEvent(new CustomEvent("react-filters-changed", { detail }))
    },
    []
  )

  const toggle = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]

  const totalActive =
    selectedModalities.length + selectedSubjects.length + (selectedRating ? 1 : 0) + selectedDays.length

  const clearAll = () => {
    setSelectedModalities([])
    setSelectedSubjects([])
    setSelectedRating(null)
    setSelectedDays([])
    dispatch([], [], null, [])
  }

  const badge = (count: number) =>
    count > 0 ? (
      <span
        className="ml-auto flex size-4 items-center justify-center rounded-full text-[10px] font-semibold"
        style={badgeStyle}
      >
        {count}
      </span>
    ) : null

  const sections = [
    {
      key: "modality",
      label: "Modalidad",
      Icon: MonitorIcon,
      options: MODALITIES,
      selected: selectedModalities,
      onToggle: (val: string) => {
        const next = toggle(selectedModalities, val)
        setSelectedModalities(next)
        dispatch(next, selectedSubjects, selectedRating, selectedDays)
      },
    },
    {
      key: "subject",
      label: "Materia",
      Icon: BookOpenIcon,
      options: subjects,
      selected: selectedSubjects,
      onToggle: (val: string) => {
        const next = toggle(selectedSubjects, val)
        setSelectedSubjects(next)
        dispatch(selectedModalities, next, selectedRating, selectedDays)
      },
      scrollable: true,
    },
    {
      key: "rating",
      label: "Calificación",
      Icon: StarIcon,
      options: RATINGS,
      selected: selectedRating ? [selectedRating] : [],
      onToggle: (val: string) => {
        const next = selectedRating === val ? null : val
        setSelectedRating(next)
        dispatch(selectedModalities, selectedSubjects, next, selectedDays)
      },
    },
    {
      key: "availability",
      label: "Disponibilidad",
      Icon: CalendarIcon,
      options: DAYS_OF_WEEK,
      selected: selectedDays,
      onToggle: (val: string) => {
        const next = toggle(selectedDays, val)
        setSelectedDays(next)
        dispatch(selectedModalities, selectedSubjects, selectedRating, next)
      },
    },
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-[var(--primary-200)] bg-[var(--surface-page)] px-4 py-2 text-sm font-medium text-[var(--text-body)] hover:bg-[var(--surface-focus)] hover:text-[var(--primary-600)] transition-all shadow-sm"
        >
          <ListFilterIcon className="size-4" />
          {totalActive > 0 && (
            <span className="flex size-5 items-center justify-center rounded-full text-[11px] font-bold text-white bg-[var(--primary-default)]">
              {totalActive}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align={isMobile ? "end" : "start"}
        className="w-56 shadow-xl border-[var(--border-primary)]"
      >
        {totalActive > 0 && (
          <div className="mb-1">
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-xs font-medium text-[var(--text-disable)]">
                {totalActive} filtro{totalActive !== 1 ? "s" : ""} activo{totalActive !== 1 ? "s" : ""}
              </span>
              <button
                type="button"
                onClick={clearAll}
                className="text-xs font-semibold text-[var(--text-action)] hover:text-[var(--text-action-hover)] transition-colors"
              >
                Limpiar
              </button>
            </div>
            <DropdownMenuSeparator className="bg-[var(--border-primary)]" />
          </div>
        )}

        {sections.map(({ key, label, Icon, options, selected, onToggle, scrollable }) => {
          const selectedOpts = options.filter((o) => selected.includes(o.value))
          const unselectedOpts = options.filter((o) => !selected.includes(o.value))

          if (isMobile) {
            return (
              <div key={key}>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-accent"
                  onClick={() => setExpanded((prev) => (prev === key ? null : key))}
                >
                  <Icon className="size-4 text-[var(--primary-400)]" />
                  <span className="flex-1 text-left">{label}</span>
                  {badge(selected.length)}
                  <ChevronDownIcon
                    className={cn(
                      "size-3.5 text-muted-foreground transition-transform duration-200",
                      expanded === key && "rotate-180"
                    )}
                  />
                </button>
                {expanded === key && (
                  <div className={cn("pl-1 pb-1", scrollable && "max-h-48 overflow-y-auto")}>
                    {selectedOpts.map((opt) => (
                      <DropdownMenuCheckboxItem
                        key={opt.value}
                        checked
                        onSelect={(e) => e.preventDefault()}
                        onCheckedChange={() => onToggle(opt.value)}
                      >
                        {opt.label}
                      </DropdownMenuCheckboxItem>
                    ))}
                    {selectedOpts.length > 0 && unselectedOpts.length > 0 && (
                      <DropdownMenuSeparator />
                    )}
                    {unselectedOpts.map((opt) => (
                      <DropdownMenuCheckboxItem
                        key={opt.value}
                        checked={false}
                        onSelect={(e) => e.preventDefault()}
                        onCheckedChange={() => onToggle(opt.value)}
                      >
                        {opt.label}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </div>
                )}
              </div>
            )
          }

          return (
            <DropdownMenuSub key={key}>
              <DropdownMenuSubTrigger>
                <Icon className="size-4 text-[var(--primary-400)]" />
                {label}
                {badge(selected.length)}
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className={cn(scrollable && "max-h-60 overflow-y-auto")}>
                {options.map((opt) => (
                  <DropdownMenuCheckboxItem
                    key={opt.value}
                    checked={selected.includes(opt.value)}
                    onCheckedChange={() => onToggle(opt.value)}
                  >
                    {opt.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

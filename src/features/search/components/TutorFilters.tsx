"use client"

import { useCallback, useEffect, useState } from "react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  ListFilterIcon,
  MonitorIcon,
  BookOpenIcon,
  StarIcon,
  CalendarIcon,
} from "lucide-react"

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

import { useSubjectStore } from "@/store/subjectStore"

export function TutorFilters() {
  const { subjects: storeSubjects, isLoading } = useSubjectStore()
  const [selectedModalities, setSelectedModalities] = useState<string[]>([])
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const [selectedRating, setSelectedRating] = useState<string | null>(null)
  const [selectedDays, setSelectedDays] = useState<string[]>([])

  const subjects = storeSubjects.map((s) => ({
    value: s.id,
    label: s.name,
  }))

  const dispatchFilters = useCallback(
    (mods: string[], subs: string[], rating: string | null, days: string[]) => {
      const detail: Record<string, string[]> = {}
      if (mods.length) detail.modality = mods
      if (subs.length) detail.subject = subs
      if (rating) detail.rating = [rating]
      if (days.length) detail.availability = days
      document.dispatchEvent(
        new CustomEvent("react-filters-changed", { detail })
      )
    },
    []
  )

  const toggleValue = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]

  const totalActive =
    selectedModalities.length +
    selectedSubjects.length +
    (selectedRating ? 1 : 0) +
    selectedDays.length

  const clearAll = () => {
    setSelectedModalities([])
    setSelectedSubjects([])
    setSelectedRating(null)
    setSelectedDays([])
    dispatchFilters([], [], null, [])
  }

  const badgeStyle: React.CSSProperties = {
    backgroundColor: "var(--color-moradops-100)",
    color: "var(--color-moradops-600)",
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
      <DropdownMenuContent align="start" className="w-56 shadow-xl border-[var(--border-primary)]">
        {/* Header con limpiar */}
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

        {/* Modalidad */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <MonitorIcon className="size-4 text-[var(--primary-400)]" />
            Modalidad
            {badge(selectedModalities.length)}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {MODALITIES.map((m) => (
              <DropdownMenuCheckboxItem
                key={m.value}
                checked={selectedModalities.includes(m.value)}
                onCheckedChange={() => {
                  const next = toggleValue(selectedModalities, m.value)
                  setSelectedModalities(next)
                  dispatchFilters(next, selectedSubjects, selectedRating, selectedDays)
                }}
              >
                {m.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Materia */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <BookOpenIcon className="size-4 text-[var(--primary-400)]" />
            Materia
            {badge(selectedSubjects.length)}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="max-h-60 overflow-y-auto">
            {subjects.map((s) => (
              <DropdownMenuCheckboxItem
                key={s.value}
                checked={selectedSubjects.includes(s.value)}
                onCheckedChange={() => {
                  const next = toggleValue(selectedSubjects, s.value)
                  setSelectedSubjects(next)
                  dispatchFilters(selectedModalities, next, selectedRating, selectedDays)
                }}
              >
                {s.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Calificación */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <StarIcon className="size-4 text-[var(--primary-400)]" />
            Calificación
            {badge(selectedRating ? 1 : 0)}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {RATINGS.map((r) => (
              <DropdownMenuCheckboxItem
                key={r.value}
                checked={selectedRating === r.value}
                onCheckedChange={() => {
                  const next = selectedRating === r.value ? null : r.value
                  setSelectedRating(next)
                  dispatchFilters(selectedModalities, selectedSubjects, next, selectedDays)
                }}
              >
                {r.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Disponibilidad */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <CalendarIcon className="size-4 text-[var(--primary-400)]" />
            Disponibilidad
            {badge(selectedDays.length)}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {DAYS_OF_WEEK.map((d) => (
              <DropdownMenuCheckboxItem
                key={d.value}
                checked={selectedDays.includes(d.value)}
                onCheckedChange={() => {
                  const next = toggleValue(selectedDays, d.value)
                  setSelectedDays(next)
                  dispatchFilters(selectedModalities, selectedSubjects, selectedRating, next)
                }}
              >
                {d.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

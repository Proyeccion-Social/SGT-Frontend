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
  BookOpenIcon,
  CircleDotIcon,
  ChevronDownIcon,
} from "lucide-react"

const STATUS_OPTIONS = [
  { value: "all", label: "Todas" },
  { value: "SCHEDULED", label: "Próximas" },
  { value: "COMPLETED", label: "Completadas" },
  { value: "CANCELLED", label: "Canceladas" },
  { value: "NO_SHOW", label: "No asistió" },
]

interface HistoryFiltersProps {
  currentStatus?: string
}

const MOBILE_BP = 768

export function HistoryFilters({ currentStatus = "all" }: HistoryFiltersProps) {
  const [subjects, setSubjects] = useState<{ value: string; label: string }[]>([])
  const [selectedStatus, setSelectedStatus] = useState(currentStatus)
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const [openSection, setOpenSection] = useState<"status" | "subject" | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < MOBILE_BP)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  useEffect(() => {
    fetch("/api/search/subjects")
      .then((r) => r.json())
      .then((data) => {
        const list = data.data ?? data ?? []
        setSubjects(
          list.map((s: { id: string; name: string }) => ({
            value: s.name,
            label: s.name,
          }))
        )
      })
      .catch(() => {})
  }, [])

  const dispatchFilters = useCallback(
    (status: string, subs: string[]) => {
      document.dispatchEvent(
        new CustomEvent("history-filters-changed", {
          detail: { status, subjects: subs },
        })
      )
    },
    []
  )

  const handleStatusChange = (value: string) => {
    const next = selectedStatus === value ? "all" : value
    setSelectedStatus(next)
    dispatchFilters(next, selectedSubjects)
  }

  const toggleValue = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]

  const totalActive =
    (selectedStatus !== "all" ? 1 : 0) + selectedSubjects.length

  const clearAll = () => {
    setSelectedStatus("all")
    setSelectedSubjects([])
    dispatchFilters("all", [])
  }

  const toggleSection = (section: "status" | "subject") =>
    setOpenSection((prev) => (prev === section ? null : section))

  const badgeStyle: React.CSSProperties = {
    backgroundColor: "var(--color-moradops-100, #ede9fe)",
    color: "var(--color-moradops-600, #7c3aed)",
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

  // Mobile: fila de sección con chevron y expansión inline
  const SectionRow = ({
    section,
    icon,
    label,
    badgeCount,
  }: {
    section: "status" | "subject"
    icon: React.ReactNode
    label: string
    badgeCount: number
  }) => (
    <button
      type="button"
      onClick={() => toggleSection(section)}
      className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground transition-colors"
    >
      {icon}
      <span>{label}</span>
      {badge(badgeCount)}
      <ChevronDownIcon
        className="ml-auto size-3.5 text-muted-foreground transition-transform duration-200"
        style={{
          transform: openSection === section ? "rotate(180deg)" : "rotate(0deg)",
        }}
      />
    </button>
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-[8px] border border-[var(--neutral-200,#e7dcff)] bg-[var(--surface-page,#fff)] px-2 py-2 text-sm font-medium text-[var(--neutral-400,#1e293b)] hover:bg-[var(--surface-focus,#f5f3ff)] hover:text-[var(--primary-default,#9f74ff)] transition-all"
        >
          <ListFilterIcon className="size-3" />
          {totalActive > 0 && (
            <span className="flex size-5 items-center justify-center rounded-full text-[11px] font-bold text-white bg-[var(--primary-default,#9f74ff)]">
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
                {totalActive} filtro{totalActive !== 1 ? "s" : ""} activo
                {totalActive !== 1 ? "s" : ""}
              </span>
              <button
                type="button"
                onClick={clearAll}
                className="text-xs font-semibold text-[var(--text-action,#7c3aed)] hover:text-[var(--text-action-hover)] transition-colors"
              >
                Limpiar
              </button>
            </div>
            <DropdownMenuSeparator className="bg-[var(--border-primary)]" />
          </div>
        )}

        {isMobile ? (
          /* ── Mobile: acordeón inline ── */
          <>
            <SectionRow
              section="status"
              icon={<CircleDotIcon className="size-4 text-[var(--primary-400,#a78bfa)]" />}
              label="Estado"
              badgeCount={selectedStatus !== "all" ? 1 : 0}
            />
            {openSection === "status" && (
              <div className="pl-2 pb-1">
                {STATUS_OPTIONS.map((s) => (
                  <DropdownMenuCheckboxItem
                    key={s.value}
                    checked={selectedStatus === s.value}
                    onCheckedChange={() => handleStatusChange(s.value)}
                  >
                    {s.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </div>
            )}

            <SectionRow
              section="subject"
              icon={<BookOpenIcon className="size-4 text-[var(--primary-400,#a78bfa)]" />}
              label="Materia"
              badgeCount={selectedSubjects.length}
            />
            {openSection === "subject" && (
              <div className="pl-2 pb-1 max-h-48 overflow-y-auto">
                {subjects.map((s) => (
                  <DropdownMenuCheckboxItem
                    key={s.value}
                    checked={selectedSubjects.includes(s.value)}
                    onCheckedChange={() => {
                      const next = toggleValue(selectedSubjects, s.value)
                      setSelectedSubjects(next)
                      dispatchFilters(selectedStatus, next)
                    }}
                  >
                    {s.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </div>
            )}
          </>
        ) : (
          /* ── Desktop: submenús hover ── */
          <>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <CircleDotIcon className="size-4 text-[var(--primary-400,#a78bfa)]" />
                Estado
                {badge(selectedStatus !== "all" ? 1 : 0)}
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {STATUS_OPTIONS.map((s) => (
                  <DropdownMenuCheckboxItem
                    key={s.value}
                    checked={selectedStatus === s.value}
                    onCheckedChange={() => handleStatusChange(s.value)}
                  >
                    {s.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <BookOpenIcon className="size-4 text-[var(--primary-400,#a78bfa)]" />
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
                      dispatchFilters(selectedStatus, next)
                    }}
                  >
                    {s.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
"use client"

import { useEffect, useState } from "react"
import { BookOpenIcon } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

import { navigate } from "astro:transitions/client"

interface Subject {
  id: string
  name: string
}

interface Props {
  initialSubjects?: Subject[]
  initialSelectedId?: string | null
}

export function SubjectSelector({ initialSubjects = [], initialSelectedId = null }: Props) {
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects)
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Si no tenemos materias (SSR falló o no se pasó), cargarlas
    if (subjects.length === 0) {
      fetch("/api/search/subjects")
        .then((r) => r.json())
        .then((data) => {
          const list = data.data ?? data ?? []
          setSubjects(list)
        })
        .catch(() => {})
    }
  }, [subjects.length])

  // Sincronizar con la URL cuando cambie (por navigate)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setSelectedId(params.get("subjectId"))
  }, [selectedId]) // Esto es un poco circular pero ayuda en transiciones

  const handleSelect = (id: string | null) => {
    const params = new URLSearchParams(window.location.search)
    if (id) {
      params.set("subjectId", id)
    } else {
      params.delete("subjectId")
    }
    
    // Usar navigate para View Transitions
    const newUrl = `?${params.toString()}`
    navigate(newUrl)
  }

  const currentSubject = subjects.find((s) => s.id === selectedId)

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            style={{ 
              ...(selectedId ? { borderColor: "var(--secondary-500)", color: "var(--secondary-500)" } : {})
            }}
            className={`
              flex items-center justify-center md:justify-between gap-2 px-4 md:px-4 py-2
              h-[42px] md:w-auto md:min-w-[180px]
              rounded-full border transition-all duration-200
              ${
                selectedId
                  ? "bg-(--secondary-100)"
                  : "bg-white border-(--border-primary) text-(--neutral-default) hover:border-(--primary-default)"
              }
            `}
          >
            <div className="flex items-center gap-2">
              <BookOpenIcon className="w-4 h-4 shrink-0" />
              <span className="md:inline text-sm font-medium truncate overflow-hidden">
                {currentSubject ? currentSubject.name : "Todas las materias"}
              </span>
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64 max-h-80 overflow-y-auto shadow-xl border-(--neutral-100) rounded-2xl p-2">
          <DropdownMenuSeparator className="my-1 bg-(--neutral-100)" />
          
          <DropdownMenuCheckboxItem
            checked={!selectedId}
            onCheckedChange={() => handleSelect(null)}
            className="rounded-lg mb-1 focus:bg-(--surface-focus)"
          >
            Todas las materias
          </DropdownMenuCheckboxItem>

          {subjects.map((s) => (
            <DropdownMenuCheckboxItem
              key={s.id}
              checked={selectedId === s.id}
              onCheckedChange={() => handleSelect(s.id)}
              className="rounded-lg mb-1 focus:bg-(--surface-focus)"
            >
              {s.name}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

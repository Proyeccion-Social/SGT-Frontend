"use client"

import { useCallback, useState } from "react"
import {
  createFilter,
  Filters,
  type Filter,
  type FilterFieldConfig,
} from "@/components/reui/filters"

import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ClockIcon, AlertCircleIcon, CheckmarkCircle01Icon, UnavailableIcon, CircleIcon, StarIcon, Tag01Icon, MailIcon, Globe02Icon, FilterMailIcon } from "@hugeicons/core-free-icons"

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case "todo":
      return (
        <HugeiconsIcon icon={ClockIcon} strokeWidth={2} className="text-primary" />
      )
    case "in-progress":
      return (
        <HugeiconsIcon icon={AlertCircleIcon} strokeWidth={2} className="text-yellow-500" />
      )
    case "done":
      return (
        <HugeiconsIcon icon={CheckmarkCircle01Icon} strokeWidth={2} className="text-green-500" />
      )
    case "cancelled":
      return (
        <HugeiconsIcon icon={UnavailableIcon} strokeWidth={2} className="text-destructive" />
      )
    default:
      return (
        <HugeiconsIcon icon={CircleIcon} strokeWidth={2} className="text-muted-foreground" />
      )
  }
}

// Priority icon component
const PriorityIcon = ({ priority }: { priority: string }) => {
  const colors = {
    low: "text-green-500",
    medium: "text-yellow-500",
    high: "text-orange-500",
    urgent: "text-red-500",
  }
  return (
    <HugeiconsIcon icon={StarIcon} strokeWidth={2} className={colors[priority as keyof typeof colors]} />
  )
}

export function Pattern() {
  // Basic filter fields for size variant demo
  const fields: FilterFieldConfig[] = [
    {
      key: "text",
      label: "Text",
      icon: (
        <HugeiconsIcon icon={Tag01Icon} strokeWidth={2} className="size-3.5" />
      ),
      type: "text",
      className: "w-36",
      placeholder: "Search text...",
    },
    {
      key: "email",
      label: "Email",
      icon: (
        <HugeiconsIcon icon={MailIcon} strokeWidth={2} className="size-3.5" />
      ),
      type: "text",
      className: "w-48",
      placeholder: "user@example.com",
    },
    {
      key: "website",
      label: "Website",
      icon: (
        <HugeiconsIcon icon={Globe02Icon} strokeWidth={2} className="size-3.5" />
      ),
      type: "text",
      className: "w-40",
      placeholder: "https://example.com",
    },
    {
      key: "status",
      label: "Status",
      icon: (
        <HugeiconsIcon icon={ClockIcon} strokeWidth={2} className="size-3.5" />
      ),
      type: "select",
      searchable: false,
      className: "w-[200px]",
      options: [
        { value: "todo", label: "To Do", icon: <StatusIcon status="todo" /> },
        {
          value: "in-progress",
          label: "In Progress",
          icon: <StatusIcon status="in-progress" />,
        },
        { value: "done", label: "Done", icon: <StatusIcon status="done" /> },
        {
          value: "cancelled",
          label: "Cancelled",
          icon: <StatusIcon status="cancelled" />,
        },
      ],
    },
    {
      key: "priority",
      label: "Priority",
      icon: (
        <HugeiconsIcon icon={AlertCircleIcon} strokeWidth={2} className="size-3.5" />
      ),
      type: "multiselect",
      className: "w-[180px]",
      options: [
        { value: "low", label: "Low", icon: <PriorityIcon priority="low" /> },
        {
          value: "medium",
          label: "Medium",
          icon: <PriorityIcon priority="medium" />,
        },
        {
          value: "high",
          label: "High",
          icon: <PriorityIcon priority="high" />,
        },
        {
          value: "urgent",
          label: "Urgent",
          icon: <PriorityIcon priority="urgent" />,
        },
      ],
    },
  ]

  const [smallFilters, setSmallFilters] = useState<Filter[]>([
    createFilter("priority", "is_any_of", ["high", "urgent"]),
  ])

  const [mediumFilters, setMediumFilters] = useState<Filter[]>([
    createFilter("status", "is", ["todo"]),
  ])

  const [largeFilters, setLargeFilters] = useState<Filter[]>([
    createFilter("email", "contains", ["example@example.com"]),
  ])

  const handleSmallFiltersChange = useCallback((filters: Filter[]) => {
    setSmallFilters(filters)
  }, [])

  const handleMediumFiltersChange = useCallback((filters: Filter[]) => {
    setMediumFilters(filters)
  }, [])

  const handleLargeFiltersChange = useCallback((filters: Filter[]) => {
    setLargeFilters(filters)
  }, [])

  return (
    <div className="flex grow flex-col content-start items-start gap-2.5 space-y-6 self-start">
      <Filters
        size="sm"
        filters={smallFilters}
        fields={fields}
        onChange={handleSmallFiltersChange}
        trigger={
          <Button variant="outline" size="icon-sm">
            <HugeiconsIcon icon={FilterMailIcon} strokeWidth={2} />
          </Button>
        }
      />
    </div>
  )
}
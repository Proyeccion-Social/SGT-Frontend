import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft03Icon, ArrowLeft01Icon, ArrowRight01Icon, ArrowRight03Icon } from "@hugeicons/core-free-icons"

export function Pattern() {
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationLink href="#" size="icon" aria-label="Go to first page">
            <HugeiconsIcon icon={ArrowLeft03Icon} strokeWidth={2} className="size-4" />
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" size="icon" aria-label="Go to previous page">
            <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} className="size-4" />
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <NativeSelect className="w-26" defaultValue="1">
            <NativeSelectOption value="1">Page 1</NativeSelectOption>
            <NativeSelectOption value="2">Page 2</NativeSelectOption>
            <NativeSelectOption value="3">Page 3</NativeSelectOption>
            <NativeSelectOption value="4">Page 4</NativeSelectOption>
            <NativeSelectOption value="5">Page 5</NativeSelectOption>
            <NativeSelectOption value="6">Page 6</NativeSelectOption>
            <NativeSelectOption value="7">Page 7</NativeSelectOption>
            <NativeSelectOption value="8">Page 8</NativeSelectOption>
            <NativeSelectOption value="9">Page 9</NativeSelectOption>
            <NativeSelectOption value="10">Page 10</NativeSelectOption>
          </NativeSelect>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" size="icon" aria-label="Go to next page">
            <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-4" />
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" size="icon" aria-label="Go to last page">
            <HugeiconsIcon icon={ArrowRight03Icon} strokeWidth={2} className="size-4" />
          </PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
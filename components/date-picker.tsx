"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

function formatDate(value: string | undefined): string {
  if (!value) return ""
  const [year, month, day] = value.split("-").map(Number)
  if (!year || !month || !day) return value
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  })
}

function toIso(date: Date | undefined): string | undefined {
  if (!date) return undefined
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function fromIso(value: string | undefined): Date | undefined {
  if (!value) return undefined
  const [year, month, day] = value.split("-").map(Number)
  if (!year || !month || !day) return undefined
  return new Date(Date.UTC(year, month - 1, day))
}

type DatePickerProps = {
  value?: string
  onChange?: (value: string | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  id?: string
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  disabled,
  className,
  id,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const selected = fromIso(value)

  const handleSelect = (date: Date | undefined) => {
    onChange?.(toIso(date))
    setOpen(false)
  }

  const handleToday = () => {
    onChange?.(toIso(new Date()))
    setOpen(false)
  }

  const handleClear = () => {
    onChange?.(undefined)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            id={id}
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground",
              className
            )}
          />
        }
      >
        <CalendarIcon data-icon="inline-start" />
        {value ? formatDate(value) : placeholder}
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0"
        align="start"
      >
        <Calendar
          mode="single"
          selected={selected}
          onSelect={handleSelect}
          captionLayout="dropdown"
        />
        <div className="flex items-center justify-between gap-2 border-t p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            disabled={!value}
          >
            Clear
          </Button>
          <Button variant="ghost" size="sm" onClick={handleToday}>
            Today
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

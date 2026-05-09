import * as React from "react"

import { cn } from "@/lib/utils"
import { useIsMobile } from '@/lib/hooks/useWindowSize'

// Helper to extract plain text from React nodes (recursively)
function extractText(node) {
  if (node == null) return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(extractText).join('')
  if (typeof node === 'object' && node.props && node.props.children) return extractText(node.props.children)
  return ''
}

const Table = React.forwardRef(({ className, children, mobilePriority, mobileLimit, ...props }, ref) => {
  const isMobile = useIsMobile()

  // If not mobile, render original table markup
  if (!isMobile) {
    return (
      <div className="relative w-full overflow-auto">
        <table
          ref={ref}
          className={cn("w-full caption-bottom text-sm", className)}
          {...props}
        >
          {children}
        </table>
      </div>
    )
  }

  // Mobile rendering: convert header + rows into stacked cards
  const childrenArray = React.Children.toArray(children)

  // Find header and body
  const headerEl = childrenArray.find(c => c && c.type && c.type.displayName === 'TableHeader')
  const bodyEl = childrenArray.find(c => c && c.type && c.type.displayName === 'TableBody')

  // Extract header labels
  let headers = []
  try {
    if (headerEl && headerEl.props && headerEl.props.children) {
      // headerEl.props.children is typically a <tr> element
      const tr = headerEl.props.children
      const ths = React.Children.toArray(tr.props ? tr.props.children : tr)
      headers = ths.map(th => extractText(th.props ? th.props.children : th))
    }
  } catch (e) {
    headers = []
  }

  // Extract rows
  const rows = []
  if (bodyEl && bodyEl.props && bodyEl.props.children) {
    React.Children.forEach(bodyEl.props.children, row => {
      rows.push(row)
    })
  }

  return (
    <div className={cn('w-full', className)}>
      <div className="space-y-3">
        {rows.length === 0 ? (
          <div className="text-center p-4">No data.</div>
        ) : (
          rows.map((row, rowIndex) => {
            // handle special single-cell rows (loading / empty states)
            const cells = row && row.props ? React.Children.toArray(row.props.children) : []
            if (cells.length === 1 && cells[0] && cells[0].props && cells[0].props.colSpan) {
              return (
                <div key={rowIndex} className="border rounded-md p-4 bg-muted/5 text-center">
                  {cells[0].props.children}
                </div>
              )
            }

            return (
              <div key={rowIndex} className="border rounded-lg p-4 bg-card">
                <div className="grid gap-2">
                  {/* build header/content pairs and apply mobile priority ordering */}
                  {(() => {
                    const pairs = cells.map((cell, i) => ({ header: headers[i] || '', content: cell && cell.props ? cell.props.children : cell, index: i }))
                    const ordered = []
                    const used = new Set()

                    if (Array.isArray(mobilePriority)) {
                      mobilePriority.forEach(pref => {
                        if (!pref) return
                        const match = pairs.find(p => p.header && p.header.toString().toLowerCase().includes(String(pref).toLowerCase()) && !used.has(p.index))
                        if (match) {
                          ordered.push(match)
                          used.add(match.index)
                        }
                      })
                    }

                    pairs.forEach(p => { if (!used.has(p.index)) ordered.push(p) })

                    const finalList = (typeof mobileLimit === 'number') ? ordered.slice(0, mobileLimit) : ordered

                    return finalList.map((entry, i) => (
                      <div key={i} className="flex justify-between items-start">
                        <div className="text-sm text-muted-foreground mr-4 max-w-[45%]">
                          {entry.header}
                        </div>
                        <div className="text-sm truncate">
                          {entry.content}
                        </div>
                      </div>
                    ))
                  })()}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
})
Table.displayName = "Table"

const TableHeader = React.forwardRef(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props} />
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className)}
    {...props} />
))
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      className
    )}
    {...props} />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    )}
    {...props} />
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    )}
    {...props} />
))
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props} />
))
TableCaption.displayName = "TableCaption"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}

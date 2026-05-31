import * as React from "react"
import { cn } from "@/lib/utils"

const ResponsiveTableContext = React.createContext(null)
const TableRowContext = React.createContext(null)

const getNodeText = (node) => {
  if (node === null || node === undefined || typeof node === "boolean") return ""
  if (typeof node === "string" || typeof node === "number") return String(node).trim()
  if (Array.isArray(node)) {
    return node.map(getNodeText).filter(Boolean).join(" ").trim()
  }
  if (React.isValidElement(node)) {
    return getNodeText(node.props.children)
  }
  return ""
}

const Table = React.forwardRef(({ className, mobileMode = "cards", ...props }, ref) => {
  const headersRef = React.useRef([])
  const value = React.useMemo(() => ({ headersRef }), [])

  return (
    <ResponsiveTableContext.Provider value={value}>
      <div
        className={cn(
          "responsive-table relative w-full overflow-visible lg:overflow-x-auto",
          mobileMode === "cards" && "responsive-table--cards",
          mobileMode === "scroll" && "responsive-table--scroll"
        )}
      >
        <table
          ref={ref}
          className={cn("w-full caption-bottom text-sm font-['Plus_Jakarta_Sans',sans-serif]", className)}
          {...props}
        />
      </div>
    </ResponsiveTableContext.Provider>
  )
})
Table.displayName = "Table"

const TableHeader = React.forwardRef(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn("[&_tr]:border-b border-border/50 bg-muted/30", className)}
    {...props}
  />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn("border-t border-border bg-muted/50 font-semibold [&>tr]:last:border-b-0", className)}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef(({ className, ...props }, ref) => {
  const columnIndexRef = React.useRef(0)
  columnIndexRef.current = 0

  const rowContext = React.useMemo(() => ({ columnIndexRef }), [])

  return (
    <TableRowContext.Provider value={rowContext}>
      <tr
        ref={ref}
        className={cn(
          "border-b border-border/50 transition-all hover:bg-muted/40 data-[state=selected]:bg-muted group",
          className
        )}
        {...props}
      />
    </TableRowContext.Provider>
  )
})
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef(({ className, children, ...props }, ref) => {
  const tableContext = React.useContext(ResponsiveTableContext)
  const rowContext = React.useContext(TableRowContext)
  const columnIndex = rowContext ? rowContext.columnIndexRef.current++ : -1
  const label = getNodeText(children)

  if (tableContext && columnIndex >= 0) {
    tableContext.headersRef.current[columnIndex] = label
  }

  return (
    <th
      ref={ref}
      scope="col"
      data-label={label}
      className={cn(
        "h-12 px-4 text-left align-middle font-black uppercase tracking-widest text-[10px] text-muted-foreground [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    >
      {children}
    </th>
  )
})
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef(({ className, children, colSpan, ...props }, ref) => {
  const tableContext = React.useContext(ResponsiveTableContext)
  const rowContext = React.useContext(TableRowContext)
  const columnIndex = rowContext ? rowContext.columnIndexRef.current++ : -1
  const label = columnIndex >= 0 ? tableContext?.headersRef.current[columnIndex] || "" : ""
  const spanValue = Number(colSpan || 0)
  const isSpanning = Number.isFinite(spanValue) && spanValue > 1

  return (
    <td
      ref={ref}
      colSpan={colSpan}
      data-label={label}
      data-span={isSpanning ? "true" : undefined}
      className={cn(
        "p-4 align-middle text-foreground/80 font-medium group-hover:text-foreground transition-colors [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    >
      {children}
    </td>
  )
})
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground font-medium", className)}
    {...props}
  />
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

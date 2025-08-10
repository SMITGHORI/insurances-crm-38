import * as React from "react"
import { cn } from "@/lib/utils"
import { Badge } from "./badge"
import { Button } from "./button"
import { MoreHorizontal, ExternalLink, Edit, Trash2, Eye } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu"

interface AdvancedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  subtitle?: string
  description?: string
  status?: {
    label: string
    variant: "default" | "secondary" | "destructive" | "outline"
  }
  metrics?: Array<{
    label: string
    value: string | number
    trend?: "up" | "down" | "neutral"
    trendValue?: string
  }>
  actions?: Array<{
    label: string
    icon: React.ReactNode
    onClick: () => void
    variant?: "default" | "secondary" | "destructive" | "outline"
  }>
  dropdownActions?: Array<{
    label: string
    icon: React.ReactNode
    onClick: () => void
    destructive?: boolean
  }>
  footer?: React.ReactNode
  hoverEffect?: boolean
  className?: string
}

const AdvancedCard = React.forwardRef<HTMLDivElement, AdvancedCardProps>(
  ({ 
    title, 
    subtitle, 
    description, 
    status, 
    metrics, 
    actions = [], 
    dropdownActions = [],
    footer,
    hoverEffect = true,
    className,
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "group relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-200",
          hoverEffect && "hover:shadow-lg hover:border-primary/20 hover:scale-[1.02]",
          className
        )}
        {...props}
      >
        {/* Status Badge */}
        {status && (
          <div className="absolute top-3 right-3 z-10">
            <Badge variant={status.variant} className="text-xs">
              {status.label}
            </Badge>
          </div>
        )}

        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold leading-tight text-foreground truncate">
                {title}
              </h3>
              {subtitle && (
                <p className="text-sm text-muted-foreground mt-1 truncate">
                  {subtitle}
                </p>
              )}
              {description && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                  {description}
                </p>
              )}
            </div>
            
            {/* Dropdown Menu */}
            {dropdownActions.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {dropdownActions.map((action, index) => (
                    <DropdownMenuItem
                      key={index}
                      onClick={action.onClick}
                      className={cn(
                        "cursor-pointer",
                        action.destructive && "text-destructive focus:text-destructive"
                      )}
                    >
                      {action.icon}
                      <span className="ml-2">{action.label}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Metrics */}
        {metrics && metrics.length > 0 && (
          <div className="px-6 pb-4">
            <div className="grid grid-cols-2 gap-4">
              {metrics.map((metric, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold text-foreground">
                    {metric.value}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {metric.label}
                  </div>
                  {metric.trend && (
                    <div className={cn(
                      "text-xs mt-1 flex items-center justify-center gap-1",
                      metric.trend === "up" && "text-green-600",
                      metric.trend === "down" && "text-red-600",
                      metric.trend === "neutral" && "text-muted-foreground"
                    )}>
                      {metric.trend === "up" && "↗"}
                      {metric.trend === "down" && "↘"}
                      {metric.trend === "neutral" && "→"}
                      {metric.trendValue}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {actions.length > 0 && (
          <div className="px-6 pb-4">
            <div className="flex gap-2">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || "default"}
                  size="sm"
                  onClick={action.onClick}
                  className="flex-1"
                >
                  {action.icon}
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t bg-muted/30">
            {footer}
          </div>
        )}
      </div>
    )
  }
)
AdvancedCard.displayName = "AdvancedCard"

export { AdvancedCard }
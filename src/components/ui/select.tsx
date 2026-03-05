import * as React from "react"
import { cn } from "@/lib/utils"

const Select = ({ children, onValueChange }: { children: React.ReactNode, onValueChange?: (val: string) => void }) => {
    const [value, setValue] = React.useState("")

    const handleValueChange = (val: string) => {
        setValue(val)
        onValueChange?.(val)
    }

    return (
        <SelectContext.Provider value={{ value, setValue: handleValueChange }}>
            <div className="relative w-full">{children}</div>
        </SelectContext.Provider>
    )
}

const SelectContext = React.createContext<{ value: string, setValue: (val: string) => void }>({ value: "", setValue: () => { } })

const SelectTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
    ({ className, children, ...props }, ref) => {
        const { value } = React.useContext(SelectContext)
        return (
            <button
                ref={ref}
                type="button"
                className={cn(
                    "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                {...props}
            >
                {value || children}
                <span className="ml-2">▼</span>
            </button>
        )
    }
)

const SelectContent = ({ children }: { children: React.ReactNode }) => {
    const { value } = React.useContext(SelectContext)
    // Simple implementation: always visible if there's a click handled by trigger? 
    // Actually, for simplicity, let's just use a native select for now if we want it to work without complex state.
    return <div className="mt-1 rounded-md border bg-popover p-1 shadow-md">{children}</div>
}

const SelectItem = ({ children, value }: { children: React.ReactNode, value: string }) => {
    const { setValue } = React.useContext(SelectContext)
    return (
        <div
            onClick={() => setValue(value)}
            className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent focus:bg-accent focus:text-accent-foreground"
        >
            {children}
        </div>
    )
}

const SelectValue = ({ placeholder }: { placeholder?: string }) => {
    const { value } = React.useContext(SelectContext)
    return <span>{value || placeholder}</span>
}

export {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
}

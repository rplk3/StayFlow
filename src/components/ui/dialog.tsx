import * as React from "react"
import { cn } from "@/lib/utils"

const Dialog = ({ children, open, onOpenChange }: { children: React.ReactNode, open?: boolean, onOpenChange?: (open: boolean) => void }) => {
    const [isOpen, setIsOpen] = React.useState(open || false)

    React.useEffect(() => {
        if (open !== undefined) setIsOpen(open)
    }, [open])

    const handleOpenChange = (val: boolean) => {
        setIsOpen(val)
        onOpenChange?.(val)
    }

    return (
        <DialogContext.Provider value={{ isOpen, setIsOpen: handleOpenChange }}>
            {children}
        </DialogContext.Provider>
    )
}

const DialogContext = React.createContext<{ isOpen: boolean, setIsOpen: (val: boolean) => void }>({ isOpen: false, setIsOpen: () => { } })

const DialogTrigger = ({ children, asChild }: { children: React.ReactNode, asChild?: boolean }) => {
    const { setIsOpen } = React.useContext(DialogContext)

    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children as React.ReactElement<any>, {
            onClick: (e: React.MouseEvent) => {
                children.props.onClick?.(e)
                setIsOpen(true)
            }
        })
    }

    return <button onClick={() => setIsOpen(true)}>{children}</button>
}

const DialogContent = ({ children, className }: { children: React.ReactNode, className?: string }) => {
    const { isOpen, setIsOpen } = React.useContext(DialogContext)

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className={cn("relative w-full max-w-lg rounded-lg bg-background p-6 shadow-lg", className)}>
                <button
                    onClick={() => setIsOpen(false)}
                    className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100"
                >
                    ✕
                </button>
                {children}
            </div>
        </div>
    )
}

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
)

const DialogTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
    ({ className, ...props }, ref) => (
        <h2
            ref={ref}
            className={cn("text-lg font-semibold leading-none tracking-tight", className)}
            {...props}
        />
    )
)

export {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
}

import * as React from "react"
import { cn } from "@/lib/utils"

const Form = ({ children, ...props }: React.FormHTMLAttributes<HTMLFormElement>) => (
    <form {...props}>{children}</form>
)

const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn("space-y-2", className)} {...props} />
    )
)

const FormLabel = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
    ({ className, ...props }, ref) => (
        <label
            ref={ref}
            className={cn(
                "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                className
            )}
            {...props}
        />
    )
)

const FormControl = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn("relative", className)} {...props} />
    )
)

const FormField = ({ name, render }: { name: string, render: (props: { field: any }) => React.ReactNode }) => {
    // Simplest version, actually usually it should use useFormContext
    return <>{render({ field: { name, onChange: () => { } } })}</>
}

const FormMessage = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
    ({ className, children, ...props }, ref) => {
        return (
            <p
                ref={ref}
                className={cn("text-sm font-medium text-destructive", className)}
                {...props}
            >
                {children}
            </p>
        )
    }
)
FormMessage.displayName = "FormMessage"

export {
    Form,
    FormItem,
    FormLabel,
    FormControl,
    FormField,
    FormMessage,
}

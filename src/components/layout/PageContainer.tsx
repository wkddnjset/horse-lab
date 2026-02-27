interface PageContainerProps {
  children: React.ReactNode
  className?: string
}

export function PageContainer({ children, className = '' }: PageContainerProps) {
  return (
    <main className={`mx-auto max-w-[430px] px-4 pb-20 pt-4 ${className}`}>
      {children}
    </main>
  )
}

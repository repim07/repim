export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="has-bottom-nav">
      {children}
    </div>
  )
}

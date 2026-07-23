export default function DistributionChart({ data }: { data: { name: number, count: number }[] }) {
  const maxCount = Math.max(...data.map(d => d.count), 1)

  const barColor = (rating: number) =>
    rating >= 8 ? '#00d4aa' : rating >= 6 ? '#f0a500' : '#e05555'

  return (
    <div className="flex flex-col gap-1 w-full max-w-sm mb-4">
      {data.map(({ name, count }) => (
        <div key={name} className="flex items-center gap-2">
          <span className="text-xs text-[#8b8b9a] w-4 text-right shrink-0">{name}</span>
          <div className="flex-1 bg-[#2a2a35] rounded-full h-2 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(count / maxCount) * 100}%`,
                backgroundColor: barColor(name),
                minWidth: count > 0 ? '4px' : '0'
              }}
            />
          </div>
          <span className="text-xs text-[#8b8b9a] w-4 shrink-0">{count}</span>
        </div>
      ))}
    </div>
  )
}
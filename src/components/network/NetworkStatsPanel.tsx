interface LevelCount {
  depth: number
  count: number
}

interface NetworkStatsPanelProps {
  byLevel: LevelCount[]
  total: number
}

export function NetworkStatsPanel({ byLevel, total }: NetworkStatsPanelProps) {
  const maxCount = Math.max(...byLevel.map(l => l.count), 1)

  return (
    <div className="bg-white rounded-2xl border border-[#f0e8c8] p-6">
      <h2 className="text-sm font-semibold text-[#555] uppercase tracking-wide mb-4">
        Tu red
      </h2>

      {byLevel.length === 0 ? (
        <p className="text-[#888] text-sm">Aún no tienes referidos. ¡Comparte tu link!</p>
      ) : (
        <div className="space-y-2">
          {byLevel.map(({ depth, count }) => (
            <div key={depth} className="flex items-center gap-3">
              <span className="text-xs text-[#888] w-14 shrink-0">Nivel {depth}</span>
              <div className="flex-1 bg-[#fffde7] rounded-full h-2 overflow-hidden">
                <div
                  className="h-2 bg-[#fdd835] rounded-full transition-all"
                  style={{ width: `${(count / maxCount) * 100}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-[#1a1a1a] w-8 text-right">{count}</span>
            </div>
          ))}
        </div>
      )}

      {total > 0 && (
        <div className="mt-4 pt-4 border-t border-[#f0e8c8] flex justify-between items-center">
          <span className="text-sm text-[#555]">Total referidos</span>
          <span className="text-lg font-bold text-[#1a1a1a]">{total}</span>
        </div>
      )}
    </div>
  )
}

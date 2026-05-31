export function TimeSlotPicker({ date, onSelect, availableSlots }: { date: Date, onSelect: (time: string) => void, availableSlots: string[] }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {availableSlots.map(slot => (
        <button key={slot} onClick={() => onSelect(slot)} className="p-2 border rounded hover:bg-secondary">
          {slot}
        </button>
      ))}
    </div>
  )
}

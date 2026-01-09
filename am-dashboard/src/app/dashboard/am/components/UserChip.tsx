interface UserChipProps {
  name: string | null;
  email: string | null;
  role: "AM" | "MANAGEMENT";
}

export function UserChip({ name, email, role }: UserChipProps) {
  const roleColors = {
    AM: "bg-blue-100 text-blue-800 border-blue-200",
    MANAGEMENT: "bg-purple-100 text-purple-800 border-purple-200",
  };

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="text-right">
        {name && (
          <p className="text-sm font-semibold text-gray-900">{name}</p>
        )}
        <p className="text-xs text-gray-600">{email}</p>
      </div>
      <div className={`px-3 py-1 rounded-md text-xs font-bold border ${roleColors[role]}`}>
        {role}
      </div>
    </div>
  );
}


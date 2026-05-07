import { getColumnLabel } from "../utils";
import { cn } from "@/lib/utils";
import { useApp } from "@/providers/AppProvider";

const ViewField: React.FC<{ label: string; icon?: React.ReactNode; value: React.ReactNode }> = ({ label, icon, value }) => {
  const { isDarkMode } = useApp();
  return (
    <div>
      <label className={cn("text-sm mb-1.5 block", isDarkMode ? "text-gray-300" : "text-gray-700")}>
        {label}
      </label>
      <div className="mt-1.5 flex items-center gap-2 py-2 px-3 rounded-md border border-transparent">
        {icon}
        <span className="text-sm font-medium">
          {typeof value === 'string' ? getColumnLabel(value) || value : value}
        </span>
      </div>
    </div>
  );
};

export default ViewField;
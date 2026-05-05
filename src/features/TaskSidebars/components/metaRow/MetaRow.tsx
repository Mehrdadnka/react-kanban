import { cn } from "@/lib/utils";

// ──── Metadata Row Component ────
export interface MetaRowProps {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  isDarkMode?: boolean;
}


const MetaRow: React.FC<MetaRowProps> = ({ icon, label, children, isDarkMode }) => (
  <div className="flex items-center gap-3 py-2">
    <div className="flex items-center gap-2 min-w-[100px] flex-shrink-0">
      <span className={cn(isDarkMode ? "text-gray-400" : "text-gray-500")}>
        {icon}
      </span>
      <span className={cn(
        "text-xs font-medium",
        isDarkMode ? "text-gray-400" : "text-gray-500"
      )}>
        {label}
      </span>
    </div>
    <div className="flex-1 flex items-center">
      {children}
    </div>
  </div>
);

export default MetaRow;
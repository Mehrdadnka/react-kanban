import { SidebarInput } from '@/components/sidebar-ui-engine'
import { cn } from '@/lib/utils'
import { AlertCircle } from 'lucide-react'
import React from 'react'


interface MainInputProps {
  id: string;
  title: string;
  titleLen: number;
  label: string;
  placeholder: string;
  onChange: (v: string) => void
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

const MainInput: React.FC<MainInputProps> = ({
    id,
    title,
    titleLen,
    label,
    placeholder,
    onChange,
    inputRef
}) => {
  return (
    <>
      <div>
        <SidebarInput
          id={id}
          required
          label={label}
          value={title}
          onChange={onChange}
          placeholder={placeholder}
          disabled={false}
          inputRef={inputRef}
          />
          <div className="flex justify-between items-center mt-1">
            {!title.trim() ? (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle size={10} />
                Required
              </p>
            ) : (
              <span />
            )}
          <span className={cn(
            "text-[10px] tabular-nums",
            title.length > titleLen ? "text-red-500" : "text-gray-400"
          )}>
            {title.length}/ titleLen
          </span>
        </div>
      </div>
    </>
  )
}

export default MainInput
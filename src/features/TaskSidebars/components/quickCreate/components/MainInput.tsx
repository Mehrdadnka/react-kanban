import { SidebarInput } from '@/components/sidebar-ui-engine'
import { cn } from '@/lib/utils'
import { AlertCircle } from 'lucide-react'
import React, { useEffect, useRef } from 'react'
import { toast } from 'sonner'

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
  const prevTitleRef = useRef(title);
  const hasInteractedRef = useRef(false);

  useEffect(() => {
    // Only show toast when field goes from filled to empty
    if (hasInteractedRef.current && prevTitleRef.current.trim() && !title.trim()) {
      toast.error("This field is required", {
        description: `Please fill in the ${label.toLowerCase()} field`,
        icon: <AlertCircle size={16} />,
      });
    }
    
    // Track if user has interacted (field was filled at some point)
    if (title.trim()) {
      hasInteractedRef.current = true;
    }
    
    prevTitleRef.current = title;
  }, [title, label]);

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
          <span />
          <span className={cn(
            "text-[10px] tabular-nums",
            title.length > titleLen ? "text-red-500" : "text-gray-400"
          )}>
            {title.length}/{titleLen}
          </span>
        </div>
      </div>
    </>
  )
}

export default MainInput
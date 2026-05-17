interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

export function ToggleSwitch({ checked, onChange, label }: ToggleSwitchProps) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      {label && <span className="text-xs sm:text-sm text-gray-600">{label}</span>}
      <div
        className={`w-11 h-6 rounded-full relative transition-all duration-200 ${
          checked ? 'bg-green-500' : 'bg-gray-300'
        }`}
        onClick={() => onChange(!checked)}
      >
        <div
          className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all duration-200 shadow ${
            checked ? 'left-[22px]' : 'left-0.5'
          }`}
        />
      </div>
    </label>
  );
}

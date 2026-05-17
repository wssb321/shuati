import { useState } from 'react';
import { Bookmark, Flag, FileText, BookOpen } from 'lucide-react';

interface MinimalQuizToolbarProps {
  isBookmarked: boolean;
  isFlagged: boolean;
  onToggleBookmark: () => void;
  onToggleFlag: () => void;
  onShowWrongNotes: () => void;
  onShowAnalysis: () => void;
}

export const MinimalQuizToolbar: React.FC<MinimalQuizToolbarProps> = ({
  isBookmarked,
  isFlagged,
  onToggleBookmark,
  onToggleFlag,
  onShowWrongNotes,
  onShowAnalysis
}) => {
  const [pressedButton, setPressedButton] = useState<string | null>(null);

  const handleButtonPress = (buttonName: string, callback: () => void) => {
    setPressedButton(buttonName);
    callback();
    setTimeout(() => setPressedButton(null), 200);
  };

  const toolbarButtons = [
    {
      id: 'wrongNotes',
      icon: FileText,
      label: '错题',
      onClick: onShowWrongNotes,
      color: 'text-red-500'
    },
    {
      id: 'bookmark',
      icon: Bookmark,
      label: '收藏',
      onClick: onToggleBookmark,
      color: isBookmarked ? 'text-amber-500 fill-amber-500' : 'text-gray-600',
      isActive: isBookmarked
    },
    {
      id: 'flag',
      icon: Flag,
      label: '标记',
      onClick: onToggleFlag,
      color: isFlagged ? 'text-purple-500' : 'text-gray-600',
      isActive: isFlagged
    },
    {
      id: 'analysis',
      icon: BookOpen,
      label: '解析',
      onClick: onShowAnalysis,
      color: 'text-blue-500'
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
      <div className="mx-auto max-w-md px-4 pb-4">
        <div className="bg-white/70 backdrop-blur-2xl rounded-2xl shadow-2xl shadow-blue-900/10 border border-white/60">
          <div className="flex items-center justify-around py-3 px-2">
            {toolbarButtons.map((button) => {
              const IconComponent = button.icon;
              return (
                <button
                  key={button.id}
                  onClick={() => handleButtonPress(button.id, button.onClick)}
                  className={`
                    flex flex-col items-center gap-1 px-4 py-2 rounded-xl
                    transition-all duration-150 ease-out
                    ${pressedButton === button.id ? 'scale-110' : 'scale-100'}
                    ${button.isActive ? 'bg-gray-100/50' : 'hover:bg-gray-100/30'}
                  `}
                >
                  <IconComponent 
                    className={`w-6 h-6 ${button.color}`}
                    strokeWidth={button.isActive ? 2.5 : 2}
                  />
                  <span className={`text-xs font-medium ${button.color}`}>
                    {button.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

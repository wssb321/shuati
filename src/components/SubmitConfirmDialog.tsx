interface SubmitConfirmDialogProps {
  isOpen: boolean;
  unansweredCount: number;
  onConfirm: () => void;
  onCancel: () => void;
  isNightMode: boolean;
}

export function SubmitConfirmDialog({
  isOpen,
  unansweredCount,
  onConfirm,
  onCancel,
  isNightMode
}: SubmitConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 遮罩层 */}
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={onCancel}
      />
      
      {/* 对话框 */}
      <div className={`relative max-w-sm w-full mx-4 rounded-2xl shadow-2xl ${isNightMode ? 'bg-slate-800' : 'bg-white'}`}>
        {/* 加载动画（未来添加） */}
        {/* <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-2xl">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className={`text-sm ${isNightMode ? 'text-white' : 'text-gray-700'}`}>正在计算成绩...</span>
          </div>
        </div> */}

        <div className="p-6">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">⚠️</div>
            <h3 className={`text-lg font-semibold mb-2 ${isNightMode ? 'text-slate-200' : 'text-gray-800'}`}>
              确认交卷？
            </h3>
            <p className={`text-sm ${isNightMode ? 'text-slate-400' : 'text-gray-500'}`}>
              {unansweredCount > 0 ? (
                <>你还有 <span className="font-semibold text-orange-500">{unansweredCount}</span> 题未作答</>
              ) : '所有题目已作答完毕'}
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={onCancel}
              className={`w-full py-3 rounded-xl font-medium transition-colors ${isNightMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              继续答题
            </button>
            <button
              onClick={onConfirm}
              className="w-full py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
            >
              确认交卷
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

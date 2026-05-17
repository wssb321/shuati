interface EmptyProps {
  icon?: string;
  title?: string;
  description?: string;
}

export function Empty({ icon = "📭", title = "暂无数据", description = "" }: EmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-500 text-center">{description}</p>
      )}
    </div>
  );
}

export default Empty;

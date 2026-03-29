export function LoadingDots() {
  const colors = ["bg-violet-500", "bg-blue-500", "bg-cyan-500"];
  return (
    <div className="flex items-center justify-center gap-2 py-8">
      {colors.map((color, i) => (
        <div
          key={i}
          className={`h-3 w-3 rounded-full ${color} animate-pulse-glow`}
          style={{ animationDelay: `${i * 0.3}s` }}
        />
      ))}
    </div>
  );
}

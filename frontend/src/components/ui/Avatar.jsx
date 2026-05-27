export function Avatar({ name = '', size = 40, color }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  // Generate consistent color from name
  const colors = [
    '#f5a623', '#22c55e', '#60a5fa', '#a78bfa',
    '#f472b6', '#34d399', '#fb923c', '#f43f5e',
  ];
  const idx = name.charCodeAt(0) % colors.length;
  const bg = color || colors[idx];

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: `${bg}22`,
        border: `1.5px solid ${bg}44`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: bg,
        fontFamily: 'var(--font-sans)',
        fontWeight: 600,
        fontSize: size * 0.36,
        flexShrink: 0,
        letterSpacing: '-0.02em',
      }}
      aria-label={name}
    >
      {initials || '?'}
    </div>
  );
}

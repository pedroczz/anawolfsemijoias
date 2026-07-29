type PatternBackgroundProps = {
  className?: string;
  /** Opacidade do padrão. Mantenha baixa (0.08–0.2) — nunca use como fundo de página inteira. */
  opacity?: number;
  /** Altura da faixa divisória, em px. */
  height?: number;
};

const SPOT_ID = "onca-spot";
const PATTERN_ID = "onca-pattern";

const SPOT_INSTANCES = [
  { x: 10, y: 12, r: -8, s: 1 },
  { x: 46, y: 8, r: 20, s: 0.75 },
  { x: 66, y: 34, r: -15, s: 1.1 },
  { x: 26, y: 44, r: 35, s: 0.85 },
  { x: 4, y: 62, r: 5, s: 0.9 },
  { x: 54, y: 60, r: -25, s: 0.7 },
];

/**
 * Faixa decorativa com o padrão de oncinha (manchas em vinho sobre rosa).
 * Uso restrito: divisores finos entre seções, sempre em baixa opacidade.
 * Não use como fundo de página inteira.
 */
export default function PatternBackground({
  className,
  opacity = 0.14,
  height = 56,
}: PatternBackgroundProps) {
  return (
    <svg
      className={className}
      style={{ width: "100%", height }}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <path
          id={SPOT_ID}
          d="M0,-10 C6,-10 10,-6 9,0 C12,4 8,10 2,9 C0,14 -8,12 -8,6 C-14,4 -12,-6 -4,-8 C-2,-11 -2,-10 0,-10 Z"
          fill="#4E1233"
        />
        <pattern id={PATTERN_ID} patternUnits="userSpaceOnUse" width="80" height="80">
          <rect width="80" height="80" fill="#CE8A87" />
          {SPOT_INSTANCES.map((spot, i) => (
            <use
              key={i}
              href={`#${SPOT_ID}`}
              transform={`translate(${spot.x} ${spot.y}) rotate(${spot.r}) scale(${spot.s})`}
            />
          ))}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${PATTERN_ID})`} opacity={opacity} />
    </svg>
  );
}

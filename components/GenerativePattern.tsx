import { generatePattern, type Shape } from "@/lib/pattern-gen";

interface GenerativePatternProps {
  seed: string;
  tags: string[];
  className?: string;
}

function PatternShape({ shape, vw, vh }: { shape: Shape; vw: number; vh: number }) {
  const x = (shape.x / 100) * vw;
  const y = (shape.y / 100) * vh;
  const s = (shape.size / 100) * Math.min(vw, vh);
  const transform = `rotate(${shape.rotation} ${x} ${y})`;
  const fill = shape.strokeOnly ? "none" : shape.color;
  const stroke = shape.strokeOnly ? shape.color : "none";
  const sw = shape.strokeOnly ? shape.strokeWidth : 0;
  const op = shape.opacity;

  switch (shape.type) {
    case "circle":
      return <circle cx={x} cy={y} r={s / 2} fill={fill} stroke={stroke} strokeWidth={sw} opacity={op} />;

    case "rect":
      return (
        <rect
          x={x - s / 2}
          y={y - s * 0.4}
          width={s}
          height={s * 0.8}
          rx={s * 0.05}
          fill={fill}
          stroke={stroke}
          strokeWidth={sw}
          opacity={op}
          transform={transform}
        />
      );

    case "triangle": {
      const pts = `${x},${y - s / 2} ${x - s / 2},${y + s / 2} ${x + s / 2},${y + s / 2}`;
      return (
        <polygon
          points={pts}
          fill={fill}
          stroke={stroke}
          strokeWidth={sw}
          opacity={op}
          transform={transform}
        />
      );
    }

    case "line":
      return (
        <line
          x1={x - s / 2}
          y1={y}
          x2={x + s / 2}
          y2={y}
          stroke={shape.color}
          strokeWidth={shape.strokeWidth || 2}
          opacity={op}
          transform={transform}
          strokeLinecap="round"
        />
      );

    case "ring":
      return (
        <circle
          cx={x}
          cy={y}
          r={s / 2}
          fill="none"
          stroke={shape.color}
          strokeWidth={shape.strokeWidth || 2}
          opacity={op}
        />
      );

    case "arc": {
      const r = s / 2;
      const d = `M ${x - r} ${y} A ${r} ${r} 0 0 1 ${x + r} ${y}`;
      return (
        <path
          d={d}
          fill="none"
          stroke={shape.color}
          strokeWidth={shape.strokeWidth || 2}
          opacity={op}
          transform={transform}
          strokeLinecap="round"
        />
      );
    }

    case "dot-grid": {
      const gridSize = 3;
      const spacing = s / gridSize;
      const dots = [];
      for (let gx = 0; gx < gridSize; gx++) {
        for (let gy = 0; gy < gridSize; gy++) {
          dots.push(
            <circle
              key={`${gx}-${gy}`}
              cx={x - s / 2 + gx * spacing + spacing / 2}
              cy={y - s / 2 + gy * spacing + spacing / 2}
              r={spacing * 0.15}
              fill={shape.color}
              opacity={op}
            />
          );
        }
      }
      return <g transform={transform}>{dots}</g>;
    }

    default:
      return null;
  }
}

export default function GenerativePattern({ seed, tags, className }: GenerativePatternProps) {
  const pattern = generatePattern(seed, tags);
  const vw = 400;
  const vh = 225;

  // Sanitize seed for SVG ID (slugs are already [a-z0-9-])
  const gradId = `gp-${seed}`;

  return (
    <div className={className}>
      <svg
        viewBox={`0 0 ${vw} ${vh}`}
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id={gradId}
            gradientTransform={`rotate(${pattern.gradientAngle})`}
          >
            <stop offset="0%" stopColor={pattern.bgGradient[0]} />
            <stop offset="100%" stopColor={pattern.bgGradient[1]} />
          </linearGradient>
        </defs>

        <rect width={vw} height={vh} fill={`url(#${gradId})`} />

        {pattern.shapes.map((shape, i) => (
          <PatternShape key={i} shape={shape} vw={vw} vh={vh} />
        ))}
      </svg>
    </div>
  );
}

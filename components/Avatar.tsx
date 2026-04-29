import type { Vtuber } from "@/lib/vtubers";

type Props = {
  vtuber: Vtuber;
  size?: number;
};

// Renders an avatar for a Vtuber. If the row in the DB has avatar_url set, we
// use a real <img>; otherwise we draw an SVG placeholder using the row's
// bg/fg colors and the code as label.
export function Avatar({ vtuber, size = 40 }: Props) {
  if (vtuber.avatarUrl) {
    return (
      <img
        src={vtuber.avatarUrl}
        alt={vtuber.name}
        width={size}
        height={size}
        className="rounded-full border-[1.5px] border-ink object-cover"
        style={{ width: size, height: size }}
        draggable={false}
      />
    );
  }

  const fontSize = Math.max(8, Math.round(size * 0.26));
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 42 42"
      aria-label={vtuber.code}
      role="img"
    >
      <circle
        cx={21}
        cy={21}
        r={19}
        fill={vtuber.bgColor}
        stroke="#3A3530"
        strokeWidth={1.5}
      />
      <text
        x={21}
        y={25}
        textAnchor="middle"
        fontSize={fontSize}
        fill={vtuber.fgColor}
        fontWeight={500}
      >
        {vtuber.code}
      </text>
    </svg>
  );
}

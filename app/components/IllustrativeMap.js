/*
 * Illustrative map, drawn to match the design. Not to scale: positions are
 * indicative only. Shown only when no Mapbox token is set (LocationMap.js).
 */
const places = [
  { name: "Skylight Mall", x: 907, y: 212, strong: true },
  { name: "Al Maktoum Int. Airport", x: 1202, y: 257 },
  { name: "Sunmarke School", x: 1018, y: 337 },
  { name: "Mediclinic Springs", x: 883, y: 477 },
  { name: "Mall of the Emirates", x: 1122, y: 627 },
  { name: "Jumeirah Village Circle", x: 563, y: 667 },
];

export default function IllustrativeMap() {
  return (
    <svg
      className="map-svg"
      viewBox="0 0 1392 820"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="Illustrative map of HAUS 99 in Jumeirah Village Triangle, near Al Khail Road, Skylight Mall and Mall of the Emirates"
    >
      <rect width="1392" height="820" fill="var(--map-land)" />
      <circle cx="-60" cy="150" r="500" fill="var(--map-water)" />

      <g fill="var(--map-park)">
        <path d="M816 120 L1118 150 L1108 330 L800 300 Z" />
        <rect x="621" y="254" width="160" height="125" />
        <path d="M1061 480 L1392 456 L1392 700 L1066 720 Z" />
        <path d="M536 587 L637 597 L622 790 L520 780 Z" />
      </g>

      <g stroke="var(--map-road-major)" strokeWidth="30" strokeLinecap="butt">
        <line x1="0" y1="182" x2="1392" y2="540" />
        <line x1="0" y1="712" x2="600" y2="860" />
      </g>
      <g stroke="var(--map-road-major-edge)" strokeWidth="1.5">
        <line x1="0" y1="167" x2="1392" y2="525" />
        <line x1="0" y1="197" x2="1392" y2="555" />
      </g>
      <g stroke="#fff" strokeWidth="9" strokeLinecap="round">
        <line x1="560" y1="382" x2="1351" y2="480" />
        <line x1="560" y1="500" x2="1356" y2="568" />
      </g>
      <g stroke="var(--map-road-minor-edge)" strokeWidth="1">
        <line x1="560" y1="377" x2="1351" y2="475" />
        <line x1="560" y1="505" x2="1356" y2="573" />
      </g>

      <text x="596" y="262" transform="rotate(-76 596 262)" className="map-street">
        HESSA STREET
      </text>

      {places.map((p) => (
        <g key={p.name}>
          <circle cx={p.x} cy={p.y} r="3.5" fill={p.strong ? "var(--brown)" : "#8b877f"} />
          <text x={p.x + 12} y={p.y + 4.5} className={p.strong ? "map-label map-label-strong" : "map-label"}>
            {p.name}
          </text>
        </g>
      ))}

      <g transform="translate(759 409)">
        <circle r="60" fill="var(--map-pin-halo)" />
        <circle r="29" fill="#fff" stroke="var(--gold)" strokeWidth="1.5" />
        <image href="/brand/monogram.png" x="-14" y="-14" width="28" height="26" />
        <text x="44" y="5" className="map-pin-label">
          HAUS 99
        </text>
      </g>
    </svg>
  );
}

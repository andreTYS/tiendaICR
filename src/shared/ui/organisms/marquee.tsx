// RSC — Scrolling marquee band
// 1:1 port from sections1.jsx#Marquee — CSS animation handles the scroll

interface Props {
  items: readonly string[];
}

export default function Marquee({ items }: Props) {
  // Triple the items for seamless looping
  const rendered = [...items, ...items, ...items];
  return (
    <div className="marquee theme-dark" aria-hidden="true">
      <div className="marquee-track">
        {rendered.map((x, i) => (
          <span key={i} className="marquee-item">
            {x}
          </span>
        ))}
      </div>
    </div>
  );
}

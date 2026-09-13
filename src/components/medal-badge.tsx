export default function MedalBadge({
  icon,
  name,
  color,
}: {
  icon: string;
  name: string;
  color?: string;
}) {
  return (
    <span
      className="badge border"
      style={{
        borderColor: color ?? "#f5251f",
        color: color ?? "#f5251f",
        background: `${(color ?? "#f5251f")}1a`,
      }}
      title={name}
    >
      <span>{icon}</span>
      {name}
    </span>
  );
}

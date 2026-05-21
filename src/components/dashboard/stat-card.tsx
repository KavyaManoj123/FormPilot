interface Props {
  title: string;
  value: string;
  subtitle: string;
}

export default function StatCard({
  title,
  value,
  subtitle,
}: Props) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
      <p className="text-zinc-400 text-sm">{title}</p>

      <h3 className="text-4xl font-bold mt-3">{value}</h3>

      <p className="text-green-400 text-sm mt-2">{subtitle}</p>
    </div>
  );
}
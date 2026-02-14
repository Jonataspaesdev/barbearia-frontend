export default function Loading({ text = "Carregando..." }) {
  return (
    <div style={{ padding: 12 }}>
      <span>{text}</span>
    </div>
  );
}
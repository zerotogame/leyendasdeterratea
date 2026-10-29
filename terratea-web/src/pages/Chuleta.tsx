// Chuleta de tiradas: página autónoma en public/chuleta.html, incrustada para conservar su propio estilo.
export default function Chuleta() {
  return (
    <iframe
      title="Chuleta de tiradas"
      src={`${import.meta.env.BASE_URL}chuleta.html`}
      style={{ width: '100%', height: 'calc(100vh - 8rem)', minHeight: 560, border: 0, borderRadius: 8 }}
    />
  )
}

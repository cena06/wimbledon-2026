export default function ExportableView({ id, children }) {
  return (
    <div id={id} className="relative bg-white">
      {children}
    </div>
  )
}

export async function fetchExcelFromOneDrive(url) {
  // url: debe ser el enlace directo de descarga del archivo Excel
  const response = await fetch(url);
  if (!response.ok) throw new Error("No se pudo descargar el archivo Excel");
  const blob = await response.blob();
  return blob;
}
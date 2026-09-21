// Limite de tamanho do texto da imagem (data URL). As regras do Firestore aceitam até 500.000 caracteres.
const MAX_DATA_URL_CHARS = 450_000;

/**
 * Lê uma foto escolhida pelo dono, reduz (lado maior 900px) e converte pra JPEG.
 * Se ainda ficar pesada, reduz mais até caber. Fundo branco pra PNG transparente.
 */
export async function fileToJpegDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Escolha um arquivo de imagem (JPG ou PNG).");
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  try {
    let maxSide = 900;
    let quality = 0.82;
    for (let attempt = 0; attempt < 6; attempt++) {
      const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Este navegador não conseguiu preparar a foto.");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", quality);
      if (dataUrl.length <= MAX_DATA_URL_CHARS) return dataUrl;
      maxSide = Math.round(maxSide * 0.8);
      quality = Math.max(0.55, quality - 0.07);
    }
    throw new Error("A foto ficou pesada demais. Tente outra foto.");
  } finally {
    bitmap.close();
  }
}

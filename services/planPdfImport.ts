import { File } from "expo-file-system";
import { MAX_PDF_BYTES, type AiParsedPlan } from "@/utils/aiPlanImport";

/**
 * Cliente da importação de PDF: lê o arquivo escolhido, envia para a rota
 * /api/import-plan (a chave de IA vive só no servidor) e traduz falhas em
 * mensagens PT-BR acionáveis. O PDF não é persistido — só lido do cache
 * temporário do picker.
 */

export type PdfImportSuccess = {
  status: "ok";
  result: AiParsedPlan;
  extractedText: string;
};

export type PdfImportFailure = {
  status: "failed";
  /** Texto extraído disponível para fallback com o parser determinístico. */
  extractedText?: string;
  userMessage: string;
};

export type PdfImportOutcome = PdfImportSuccess | PdfImportFailure;

export const PDF_IMPORT_MESSAGES = {
  notPdf: "Por enquanto, importe apenas arquivos PDF.",
  tooLarge:
    "Esse arquivo é muito grande. Tente um PDF menor ou cole o texto do plano.",
  unreadable:
    "Não conseguimos ler esse PDF. Tente colar o texto do plano ou cadastrar manualmente.",
  aiFailed:
    "Não conseguimos organizar o plano agora. Você pode tentar novamente ou colar o texto.",
  empty:
    "Não encontramos texto suficiente nesse PDF. Se for um PDF escaneado, tente enviar uma versão com texto ou cole o conteúdo manualmente.",
  needsOcr:
    "Esse PDF parece ser escaneado. OCR ainda não está disponível neste MVP. Tente colar o texto ou enviar uma versão com texto selecionável.",
  unsupported: "Formato não suportado. Use um arquivo PDF.",
  offline:
    "Importação com IA precisa de conexão. O restante do app funciona offline.",
} as const;

export function validatePickedFile(file: {
  name?: string;
  mimeType?: string;
  size?: number;
}): string | null {
  const isPdf =
    file.mimeType === "application/pdf" ||
    (file.name ?? "").toLowerCase().endsWith(".pdf");
  if (!isPdf) return PDF_IMPORT_MESSAGES.notPdf;
  if (typeof file.size === "number" && file.size > MAX_PDF_BYTES) {
    return PDF_IMPORT_MESSAGES.tooLarge;
  }
  return null;
}

export async function importPlanFromPdf(
  fileUri: string,
  timeout: number = 150_000,
): Promise<PdfImportOutcome> {
  let pdfBase64: string;
  try {
    pdfBase64 = await new File(fileUri).base64();
  } catch {
    return { status: "failed", userMessage: PDF_IMPORT_MESSAGES.unreadable };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch("/api/import-plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pdfBase64 }),
      signal: controller.signal,
    });

    const data = (await response.json().catch(() => null)) as
      | {
          status?: string;
          result?: AiParsedPlan;
          extractedText?: string;
          error?: string;
        }
      | null;

    if (data?.status === "ok" && data.result) {
      return {
        status: "ok",
        result: data.result,
        extractedText: data.extractedText ?? "",
      };
    }
    if (data?.status === "needs_ocr") {
      return { status: "failed", userMessage: PDF_IMPORT_MESSAGES.needsOcr };
    }
    if (data?.status === "empty") {
      return { status: "failed", userMessage: PDF_IMPORT_MESSAGES.empty };
    }
    if (data?.status === "ai_failed") {
      return {
        status: "failed",
        extractedText: data.extractedText,
        userMessage: PDF_IMPORT_MESSAGES.aiFailed,
      };
    }
    if (data?.error === "file_too_large") {
      return { status: "failed", userMessage: PDF_IMPORT_MESSAGES.tooLarge };
    }
    if (data?.error === "not_a_pdf") {
      return { status: "failed", userMessage: PDF_IMPORT_MESSAGES.unsupported };
    }
    if (data?.error === "pdf_unreadable") {
      return { status: "failed", userMessage: PDF_IMPORT_MESSAGES.unreadable };
    }
    return { status: "failed", userMessage: PDF_IMPORT_MESSAGES.aiFailed };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return { status: "failed", userMessage: PDF_IMPORT_MESSAGES.aiFailed };
    }
    // fetch lança TypeError quando não há rede.
    if (error instanceof TypeError) {
      return { status: "failed", userMessage: PDF_IMPORT_MESSAGES.offline };
    }
    return { status: "failed", userMessage: PDF_IMPORT_MESSAGES.aiFailed };
  } finally {
    clearTimeout(timeoutId);
  }
}

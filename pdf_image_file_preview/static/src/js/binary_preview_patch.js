/** @odoo-module **/
import { patch } from "@web/core/utils/patch";
import { useService } from "@web/core/utils/hooks";
import { registry } from "@web/core/registry";
import { isBinarySize } from "@web/core/utils/binary";
import { _t } from "@web/core/l10n/translation";
import { AlertDialog } from "@web/core/confirmation_dialog/confirmation_dialog";
// this is version 3 - from local
// ---------- Strict allow-list (configurable) ----------
const KNOWN_EXT = new Set(["pdf","png","jpg","jpeg","gif","bmp","webp","svg","txt"]); //,"doc","docx"

// Extract extension from filename if present (safe)
function extFromName(name=""){
  const e = (name.split(".").pop() || "").toLowerCase();
  return e && e !== name.toLowerCase() ? e : "";
}

// Extract extension from a data: URL prefix (inline base64 case)
function extFromDataUrlPrefix(b64=""){
  const m = /^data:([^;]+);base64,/.exec(b64);
  if (!m) return "";
  const map = {
    "application/pdf":"pdf",
    "image/png":"png",
    "image/jpeg":"jpg",
    "image/gif":"gif",
    "image/bmp":"bmp",
    "image/webp":"webp",
    "image/svg+xml":"svg",
    "text/plain":"txt",
    // "application/msword":"doc",
    // "application/vnd.openxmlformats-officedocument.wordprocessingml.document":"docx",
  };
  return map[m[1].toLowerCase()] || "";
}

// Infer a MIME for inline Blob creation (fallback keeps things safe)
function inferMimeType(name=""){
  const ext = (name.split(".").pop() || "").toLowerCase();
  switch (ext) {
    case "pdf":  return "application/pdf";
    case "png":  return "image/png";
    case "jpg":
    case "jpeg": return "image/jpeg";
    case "gif":  return "image/gif";
    case "bmp":  return "image/bmp";
    case "webp": return "image/webp";
    case "svg":  return "image/svg+xml";
    case "txt":  return "text/plain";
    // case "doc":  return "application/msword";
    // case "docx": return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    default:     return "application/octet-stream";
  }
}

// Convert base64 (with/without data: prefix) to a Blob
function base64ToBlob(b64, mime){
  const base64 = (b64 || "").split(",").pop();
  const s = atob(base64);
  const a = new Uint8Array([...s].map(c => c.charCodeAt(0)));
  return new Blob([a], { type: mime });
}

// Open popup preview and auto-close when returning to Odoo
function openPopupAndCloseOnReturn(url, {revokeUrl=false}={})
{
  const w = window.open(
    url,
    "previewWindow",
    "popup=yes,width=1500,height=700,top=100,left=100,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes"
  );
  if (!w) {                      // Popup blocked → fallback: navigate current tab
    window.location.href = url;
    return;
  }
  const cleanup = () => {
    window.removeEventListener("focus", onFocus);
    document.removeEventListener("visibilitychange", onVis);
  };
  const onFocus = () => {        // When user returns focus to Odoo…
    try { !w.closed && w.close(); } catch {}
    cleanup();
    if (revokeUrl) URL.revokeObjectURL(url); // Free blob: URL if we created one
  };
  const onVis = () => {          // Also close when tab becomes visible again
    if (document.visibilityState === "visible") onFocus();
  };
  window.addEventListener("focus", onFocus);
  document.addEventListener("visibilitychange", onVis);
}

// -------- Patch the registered Binary field component --------
const binaryReg = registry.category("fields").get("binary");
if (binaryReg?.component) {
  patch(binaryReg.component.prototype, {
    setup() {
      this._super?.(...arguments);
      this.notification = useService("notification"); // keep if you want toasts elsewhere
      this.dialog = useService("dialog");             // dialogs service for modal popups
    },

    async onPreviewClick() {
      const { record, name } = this.props;
      const value = record.data[name];
      const fileName = (record.data[this.props.fileNameField] || "") || "file";

      // Try to deduce extension (from name first, then from data URL prefix)
      let ext = extFromName(fileName);
      if (!ext && typeof value === "string") ext = extFromDataUrlPrefix(value);

      // HARD BLOCK + POPUP dialog for unsupported types
      if (!ext || !KNOWN_EXT.has(ext)) {
        this.dialog.add(AlertDialog, {
          title: _t("Unsupported file type: %s.", ext || _t("unknown")),
          body: _t("Supported Types: PDF, Text, Images (JPG, PNG, JPEG, GIF, BMP, WEBP, SVG)."),
        });
        return;
      }

      // Inline base64 (unsaved) → Blob → preview
      if (value && typeof value === "string" && !isBinarySize(value)) {
        const blob = base64ToBlob(value, inferMimeType(fileName));
        const url = URL.createObjectURL(blob);
        openPopupAndCloseOnReturn(url, { revokeUrl: true });
        return;
      }

      // Saved record → stream via /web/content
      if (record.resId) {
        const params = new URLSearchParams({
          model: record.resModel,
          id: String(record.resId),
          field: name,
          filename: fileName,
          download: "false", // hint browser to try inline display
        });
        openPopupAndCloseOnReturn(`/web/content?${params.toString()}`);
        return;
      }

      // No data at all
      this.dialog.add(AlertDialog, {
        title: _t("Nothing to preview"),
        body: _t("Please upload a file or save the record first."),
      });
    },
  });
} else {
  console.error("[pdf_image_file_preview] Could not find 'binary' field in registry.");
}

/**
 * Shares content using the native sharing mechanism if available (mobile),
 * otherwise falls back to a direct download (desktop).
 * 
 * @param url The URL of the file to fetch and share/download
 * @param filename The name to use for the file
 * @param title Title for the share dialog
 * @param text Description for the share dialog
 */
export async function shareContent(url: string, filename: string, title?: string, text?: string) {
    try {
        // Fetch the blob
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch content");
        const blob = await response.blob();
        const file = new File([blob], filename, { type: blob.type });

        // Try native share
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
                files: [file],
                title: title || filename,
                text: text || `Sharing ${filename}`,
            });
        } else {
            // Fallback to download
            const downloadUrl = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = downloadUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(downloadUrl);
        }
    } catch (error) {
        console.error("Error sharing content:", error);
        // If native share fails logic (e.g. user cancelled) or fetch fails, 
        // fallback to direct link navigation as a last resort
        window.location.href = url;
    }
}

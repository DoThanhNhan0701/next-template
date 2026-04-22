import { useEffect } from "react";

export const useFaviconBadge = (count: number, trigger?: unknown) => {
  useEffect(() => {
    const originalFaviconUrl = "/favicon.ico";

    const resetFavicon = () => {
      const badgeLink = document.getElementById("favicon-badge");
      if (badgeLink && badgeLink.parentNode) {
        badgeLink.parentNode.removeChild(badgeLink);
      }
      const baseTitle = document.title.replace(/^\[\d+\]\s\|\s/, "");
      document.title = baseTitle;
    };

    const updateFavicon = (url: string) => {
      let badgeLink = document.getElementById("favicon-badge") as HTMLLinkElement;
      
      if (!badgeLink) {
        const existingFavicon = document.querySelector('link[rel*="icon"]') as HTMLLinkElement;
        badgeLink = document.createElement("link");
        badgeLink.id = "favicon-badge";
        badgeLink.rel = "icon";
        
        if (existingFavicon) {
          existingFavicon.parentNode?.insertBefore(badgeLink, existingFavicon.nextSibling);
        } else {
          document.head.appendChild(badgeLink);
        }
      }

      if (url.startsWith("data:")) {
        badgeLink.type = "image/png";
      } else {
        badgeLink.removeAttribute("type");
      }
      badgeLink.href = url;
    };

    // 1. Update Document Title
    const baseTitle = document.title.replace(/^\[\d+\]\s\|\s/, "");
    if (count > 0) {
      document.title = `[${count}] | ${baseTitle}`;
    } else {
      document.title = baseTitle;
    }

    // 2. Handle Case: Reset
    if (count <= 0) {
      resetFavicon();
      return;
    }

    // 3. Draw Badge
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.src = originalFaviconUrl;
    img.crossOrigin = "anonymous";

    img.onload = () => {
      ctx.clearRect(0, 0, 32, 32);
      ctx.drawImage(img, 0, 0, 32, 32);

      // Draw Badge Background
      ctx.beginPath();
      ctx.arc(21, 21, 11, 0, 2 * Math.PI);
      ctx.fillStyle = "#ef4444";
      ctx.fill();

      // Draw Badge Border
      ctx.strokeStyle = "white";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Draw Badge Text
      ctx.fillStyle = "white";
      ctx.font = "bold 18px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const text = count > 9 ? "9+" : count.toString();
      ctx.fillText(text, 21, 21);

      updateFavicon(canvas.toDataURL("image/png"));
    };

    img.onerror = () => {
      ctx.clearRect(0, 0, 32, 32);
      ctx.fillStyle = "#ef4444";
      ctx.fillRect(0, 0, 32, 32);
      ctx.fillStyle = "white";
      ctx.font = "bold 20px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(count > 9 ? "9+" : count.toString(), 16, 16);
      
      updateFavicon(canvas.toDataURL("image/png"));
    };

    // Cleanup: IMPORTANT for logout/unmount
    return () => {
      resetFavicon();
    };
  }, [count, trigger]);
};

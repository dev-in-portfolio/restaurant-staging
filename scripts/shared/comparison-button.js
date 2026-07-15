// Reusable Floating Comparison Button Component
// This script runs on page load, fetches the restaurant's metadata (restaurant.json),
// and injects a premium floating button referencing the restaurant's current online presence.

document.addEventListener("DOMContentLoaded", () => {
  // Fetch metadata relative to current page directory
  fetch("restaurant.json")
    .then(response => {
      if (!response.ok) {
        throw new Error("Metadata file (restaurant.json) not found in the current folder");
      }
      return response.json();
    })
    .then(metadata => {
      const url = metadata.currentWebsiteUrl;
      if (!url || url.trim() === "") {
        return; // Hide itself when no valid current public URL exists
      }

      const presenceType = metadata.currentPublicPresenceType || "website";
      
      // Determine label text
      let label = "See Current Site";
      if (presenceType === "website") {
        label = "View Current Website";
      } else if (presenceType !== "none" && presenceType !== "other") {
        const typeLabel = presenceType
          .split("-")
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
        label = `View Current ${typeLabel}`;
      }

      // Inject Styles
      const style = document.createElement("style");
      style.id = "current-site-comparison-styles";
      style.innerHTML = `
        #current-site-comparison-btn-container {
          position: fixed;
          bottom: 24px;
          left: 24px;
          z-index: 99999;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        
        .current-site-comparison-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 12px 22px;
          background: rgba(15, 15, 17, 0.78);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 9999px;
          color: #ffffff;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.35);
          transition: all 0.35s cubic-bezier(0.2, 0.8, 0.2, 1);
          cursor: pointer;
        }

        .current-site-comparison-btn:hover {
          background: rgba(255, 255, 255, 0.96);
          color: #0f0f11;
          transform: translateY(-5px) scale(1.03);
          box-shadow: 0 16px 36px 0 rgba(0, 0, 0, 0.45);
          border-color: rgba(255, 255, 255, 0.8);
        }

        .current-site-comparison-btn:focus-visible {
          outline: 3px solid #ff7a00;
          outline-offset: 3px;
        }

        .current-site-comparison-btn .icon {
          display: inline-block;
          width: 16px;
          height: 16px;
          fill: currentColor;
          transition: transform 0.3s ease;
        }

        .current-site-comparison-btn:hover .icon {
          transform: translate(2px, -2px) scale(1.1);
        }

        /* Mobile safe-areas and responsive scaling */
        @media (max-width: 768px) {
          #current-site-comparison-btn-container {
            bottom: calc(20px + env(safe-area-inset-bottom, 0px));
            left: 20px;
          }
          .current-site-comparison-btn {
            padding: 10px 18px;
            font-size: 13px;
            gap: 8px;
          }
        }
      `;
      document.head.appendChild(style);

      // Create Container
      const container = document.createElement("div");
      container.id = "current-site-comparison-btn-container";

      // Create Link Button
      const button = document.createElement("a");
      button.className = "current-site-comparison-btn";
      button.href = url;
      button.target = "_blank";
      button.rel = "noopener noreferrer";
      button.setAttribute("aria-label", `${label} (opens in a new tab)`);
      button.innerHTML = `
        <svg class="icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
        </svg>
        <span>${label}</span>
      `;

      container.appendChild(button);
      document.body.appendChild(container);
    })
    .catch(err => {
      // Quietly log warning but do not crash the website
      console.warn("Floating comparison button failed to load:", err.message);
    });
});

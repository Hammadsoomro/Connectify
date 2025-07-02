import { useEffect, useRef } from "react";

interface MobileAdBannerProps {
  className?: string;
}

export default function MobileAdBanner({
  className = "",
}: MobileAdBannerProps) {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only load ads in production or when specifically enabled
    if (
      import.meta.env.MODE === "development" &&
      !import.meta.env.VITE_ENABLE_ADS
    ) {
      return;
    }

    const loadAd = () => {
      if (adRef.current) {
        // Clear any existing content
        adRef.current.innerHTML = "";

        // Create mobile ad script for 320x50 banner
        const configScript = document.createElement("script");
        configScript.type = "text/javascript";
        configScript.innerHTML = `
          atOptions = {
            'key': '13f9d755ea8b8ee3ce69a63352887dc2',
            'format': 'iframe',
            'height': 50,
            'width': 320,
            'params': {}
          };
        `;

        const adScript = document.createElement("script");
        adScript.type = "text/javascript";
        adScript.src =
          "//www.highperformanceformat.com/13f9d755ea8b8ee3ce69a63352887dc2/invoke.js";
        adScript.async = true;

        // Append scripts to the ad container
        adRef.current.appendChild(configScript);
        adRef.current.appendChild(adScript);
      }
    };

    // Load ad after a small delay to ensure proper rendering
    const timer = setTimeout(loadAd, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  // Show placeholder in development
  if (
    import.meta.env.MODE === "development" &&
    !import.meta.env.VITE_ENABLE_ADS
  ) {
    return (
      <div
        className={`bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center ${className}`}
        style={{ width: "320px", height: "50px" }}
      >
        <div className="text-center text-gray-500">
          <div className="text-xs font-medium">Mobile Ad Space</div>
          <div className="text-xs">320 × 50</div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={adRef}
      className={`overflow-hidden ${className}`}
      style={{ width: "320px", height: "50px" }}
    />
  );
}

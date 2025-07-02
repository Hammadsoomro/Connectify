import { useEffect, useRef } from "react";

interface AdBannerProps {
  className?: string;
  width?: number;
  height?: number;
}

export default function AdBanner({
  className = "",
  width = 300,
  height = 250,
}: AdBannerProps) {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only load ads in production or when specifically enabled
    if (
      process.env.NODE_ENV === "development" &&
      !process.env.REACT_APP_ENABLE_ADS
    ) {
      return;
    }

    const loadAd = () => {
      if (adRef.current) {
        // Clear any existing content
        adRef.current.innerHTML = "";

        // Create the ad script elements
        const configScript = document.createElement("script");
        configScript.type = "text/javascript";
        configScript.innerHTML = `
          atOptions = {
            'key': '13f9d755ea8b8ee3ce69a63352887dc2',
            'format': 'iframe',
            'height': ${height},
            'width': ${width},
            'params': {}
          };
        `;

        const adScript = document.createElement("script");
        adScript.type = "text/javascript";
        adScript.src =
          "//www.highperformanceformat.com/13f9d755ea8b8ee3ce69a63352887dc2/invoke.js";

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
  }, [width, height]);

  // Show placeholder in development
  if (
    process.env.NODE_ENV === "development" &&
    !process.env.REACT_APP_ENABLE_ADS
  ) {
    return (
      <div
        className={`bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center ${className}`}
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        <div className="text-center text-gray-500">
          <div className="text-sm font-medium">Ad Space</div>
          <div className="text-xs">
            {width} × {height}
          </div>
          <div className="text-xs mt-1">
            Set REACT_APP_ENABLE_ADS=true to show real ads
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={adRef}
      className={`overflow-hidden ${className}`}
      style={{ width: `${width}px`, height: `${height}px` }}
    />
  );
}

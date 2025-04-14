import React from "react";

interface DownloadProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  strokeColor?: string;
}

const Download: React.FC<DownloadProps> = ({
  className = "",
  width = 24,
  height = 24,
  strokeColor = "#000000",
}) => {
  return (
    <svg
      className={className}
      width={width}
      height={height}
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      color={strokeColor}
    >
      <path
        d="M6 20L18 20"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 4V16M12 16L15.5 12.5M12 16L8.5 12.5"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default Download;

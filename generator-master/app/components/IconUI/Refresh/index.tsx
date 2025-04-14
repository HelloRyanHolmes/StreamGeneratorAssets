import React from "react";

interface RefreshProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  strokeColor?: string;
}

const Refresh: React.FC<RefreshProps> = ({
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
        d="M21.8883 13.5C21.1645 18.3113 17.013 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C16.1006 2 19.6248 4.46819 21.1679 8"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17 8H21.4C21.7314 8 22 7.73137 22 7.4V3"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default Refresh;

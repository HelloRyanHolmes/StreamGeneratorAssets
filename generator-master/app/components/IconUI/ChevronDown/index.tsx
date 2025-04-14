import React from "react";

interface ChevronDownProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  strokeColor?: string;
}

const ChevronDown: React.FC<ChevronDownProps> = ({
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
        d="M6 9L12 15L18 9"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default ChevronDown;

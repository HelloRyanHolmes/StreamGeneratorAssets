import React from "react";

interface CropProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  strokeColor?: string;
}

const Crop: React.FC<CropProps> = ({
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
        d="M21 18H6V3"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 6H18V21"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default Crop;

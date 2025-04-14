import React from "react";

interface SpinnerProps {
  width?: number;
  height?: number;
  strokeColor?: string;
}

const Spinner: React.FC<SpinnerProps> = ({
  width = 14,
  height = 14,
  strokeColor = "#040714",
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className="animate-spin"
    >
      <path
        d="M 12 2 A 10 10 0 1 1 2 12"
        stroke={strokeColor}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default Spinner;

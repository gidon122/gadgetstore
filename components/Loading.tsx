import React from "react";

const Loading = () => {
  return (
    <div className="flex justify-center items-center h-64 w-full">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-orange-600"></div>
    </div>
  );
};

export default Loading;

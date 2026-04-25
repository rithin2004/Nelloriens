import React from 'react';
import { cn } from "../../lib/utils"; // Assuming cn utility exists, if not I'll use template literals

const CategoryItem = ({ category, isActive, onClick }) => {
  return (
    <div 
      onClick={() => onClick(category.name)}
      className={cn(
        "relative shrink-0 w-36 h-12 rounded-full overflow-hidden cursor-pointer transition-all duration-300 group shadow-sm",
        isActive ? "ring-2 ring-blue-600 ring-offset-2 scale-105" : "hover:scale-105"
      )}
    >
      <img 
        src={category.image} 
        alt={category.name}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        loading="lazy"
      />
      <div className={cn(
        "absolute inset-0 transition-colors bg-black/40 group-hover:bg-black/20",
        category.name === "Music" && "bg-yellow-600/30",
        category.name === "Food" && "bg-orange-600/30",
        category.name === "Sports" && "bg-blue-600/30",
        category.name === "Tech" && "bg-purple-600/30",
        category.name === "Art" && "bg-pink-600/30"
      )} />
      <div className="absolute inset-0 flex items-center justify-center p-2">
        <span className="text-white text-xs font-black uppercase tracking-widest block truncate drop-shadow-lg">
          #{category.name}
        </span>
      </div>
    </div>
  );
};

export default CategoryItem;

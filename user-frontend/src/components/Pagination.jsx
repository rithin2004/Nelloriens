import React from 'react';

const Pagination = ({
  currentPage,
  totalPages: totalPagesProp,
  totalItems,
  itemsPerPage = 20,
  onPageChange
}) => {
  const totalPages = totalPagesProp || Math.ceil((totalItems || 0) / itemsPerPage) || 0;

  if (totalPages <= 1) return null;

  const renderPageNumbers = () => {
    return [...Array(totalPages)].map((_, index) => {
      const page = index + 1;
      const isFirst = page === 1;
      const isLast = page === totalPages;
      const isCurrent = page === currentPage;
      const isNearCurrent = page >= currentPage - 1 && page <= currentPage + 1;

      if (isFirst || isLast || isCurrent || isNearCurrent) {
        if (isFirst && currentPage > 3) {
          return (
            <React.Fragment key="start-group">
              <button
                className={`inline-flex items-center justify-center w-8.75 h-8.75 border rounded mx-1 cursor-pointer transition-all ${currentPage === 1 ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-300 text-blue-600 hover:bg-gray-100'}`}
                onClick={() => onPageChange(1)}
              >
                1
              </button>
              <span className="mx-1 text-gray-500">...</span>
            </React.Fragment>
          );
        }

        if (isLast && currentPage < totalPages - 2) {
          return (
            <React.Fragment key="end-group">
              <span className="mx-1 text-gray-500">...</span>
              <button
                className={`inline-flex items-center justify-center w-8.75 h-8.75 border rounded mx-1 cursor-pointer transition-all ${isCurrent ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-300 text-blue-600 hover:bg-gray-100'}`}
                onClick={() => onPageChange(totalPages)}
              >
                {totalPages}
              </button>
            </React.Fragment>
          );
        }

        return (
          <button
            key={page}
            className={`inline-flex items-center justify-center w-8.75 h-8.75 border rounded mx-1 cursor-pointer transition-all ${isCurrent ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-300 text-blue-600 hover:bg-gray-100'}`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        );
      }
      return null;
    });
  };

  return (
    <div className="flex justify-between items-center py-5 w-full max-sm:flex-col max-sm:gap-4">
      <span className="text-gray-500 text-sm">Page {currentPage} of {totalPages}</span>

      <div className="flex items-center">
        <button
          className="bg-white border border-gray-300 text-blue-600 px-4 py-2 rounded cursor-pointer transition-all hover:bg-gray-100 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed mr-2"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Previous
        </button>

        {renderPageNumbers()}

        <button
          className="bg-white border border-gray-300 text-blue-600 px-4 py-2 rounded cursor-pointer transition-all hover:bg-gray-100 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed ml-2"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;

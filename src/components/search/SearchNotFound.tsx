import React from "react";
import { Link } from "react-router-dom";

interface SearchNotFoundProps {
  searchQuery?: string;
}

export default function SearchNotFound({ searchQuery }: SearchNotFoundProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="mb-6">
        <svg
          className="h-20 w-20 text-neutral-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-neutral-900 mb-2">
        No results found
      </h3>
      <p className="text-sm text-neutral-500 mb-8 max-w-md text-center">
        {searchQuery
          ? `We couldn't find any results for "${searchQuery}". Try adjusting your search or filters.`
          : "Try adjusting your filters or start fresh from the homepage."}
      </p>
      <Link
        to="/"
        className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
      >
        Go to Homepage
      </Link>
    </div>
  );
}

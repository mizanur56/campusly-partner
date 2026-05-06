import { ChevronRight, Home } from "lucide-react";
import { Link } from "react-router-dom";
import type { BreadcrumbItem } from "../../../types/course";

interface PageBreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function PageBreadcrumbs({ items }: PageBreadcrumbsProps) {
  if (!items?.length) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-sm text-neutral-500">
      <ol className="flex flex-wrap items-center gap-2">
        <li className="flex items-center">
          <Link to="/" className="text-green-600 transition-colors hover:text-green-700" aria-label="Home">
            <Home className="h-4 w-4" />
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-2 text-sm font-medium text-neutral-400">
            <ChevronRight className="h-4 w-4 text-neutral-300" />
            {item.href ? (
              <Link to={item.href} className="text-neutral-500 transition-colors hover:text-primary-600">
                {item.label}
              </Link>
            ) : (
              <span className="text-neutral-700">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

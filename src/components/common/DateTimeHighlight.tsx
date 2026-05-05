import dayjs from "dayjs";

type Props = {
  value?: string | Date | null;
  className?: string;
};

const DateTimeHighlight = ({ value, className = "" }: Props) => {
  if (!value)
    return <span className={`text-xs text-gray-400 ${className}`}>-</span>;

  const dt = dayjs(value);
  if (!dt.isValid())
    return <span className={`text-xs text-gray-400 ${className}`}>-</span>;

  return (
    <span
      className={`inline-flex items-center rounded-md border border-primary-200 bg-primary-50 px-2 py-1 text-xs font-semibold text-primary whitespace-nowrap ${className}`}
    >
      {dt.format("DD MMM YYYY, hh:mm A")}
    </span>
  );
};

export default DateTimeHighlight;

import Spinner from "./Spinner";

const Loader = ({ text = "Loading" }: { text?: string }) => {
  return (
    <div className="flex flex-col items-center justify-center text-primary pt-24 pb-8 space-y-4">
      <Spinner />
      {text && <div className="text-lg font-medium text-gray-700">{text}</div>}
    </div>
  );
};

export default Loader;

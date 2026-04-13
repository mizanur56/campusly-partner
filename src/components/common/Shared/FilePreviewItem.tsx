import {
    DeleteOutlined,
    EyeOutlined,
    FilePdfOutlined,
  } from "@ant-design/icons";
  
  const FilePreviewItem = ({ file, onRemove }: any) => {
    const fileName =
      typeof file === "string" ? file.split("/").pop() : file?.name;
  
    return (
      <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-primary/20 shadow-sm">
        <div className="flex items-center gap-3 overflow-hidden">
          <FilePdfOutlined className="text-2xl text-red-500 shrink-0" />
          <div className="overflow-hidden">
            <p className="text-xs font-semibold truncate text-gray-700 max-w-50">
              {fileName}
            </p>
            <span className="text-[10px] text-primary font-bold">
              Document Selected
            </span>
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
          <button
            type="button"
            onClick={() => window.open(file, "_blank")}
            className="p-1.5 hover:bg-gray-100 rounded text-primary cursor-pointer transition-colors"
          >
            <EyeOutlined />
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="p-1.5 hover:bg-red-50 rounded text-red-500 cursor-pointer transition-colors"
          >
            <DeleteOutlined />
          </button>
        </div>
      </div>
    );
  };
  
  export default FilePreviewItem;
 
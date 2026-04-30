import { Dropdown, MenuProps, Table } from "antd";
import { MoreVertical } from "lucide-react";
import { useEffect, useState } from "react";
import { useSidebar } from "../../../context/SidebarContext";
import "./AntTable.css";

interface ActionItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  onClick: (record: any) => void;
  danger?: boolean;
}

export default function DataTable(props: any) {
  const { isExpanded } = useSidebar();
  const {
    data,
    columns,
    rowKey,
    currentPage,
    setLimit,
    setCurrentPage,
    selectRow = false,
    isPaginate,
    showHeader,
    total,
    limit,
    loading = false,
    onSelectRowsChange,
    showSizeChanger = false,
    // add this sujon
    clearSelectionTrigger = false,
    expandable,
    actions, // Array of action items: [{ key, label, icon, onClick, danger? }]
    pagination: paginationProp, // Pagination config object
    onRow, // Optional row props (e.g. onClick, style for clickable rows)
    noInnerBorder = false, // When true, table has no border/radius (wrapper provides it, e.g. Team Members like Students)
  } = props;
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  // change this clear select  sujon
  useEffect(() => {
    if (clearSelectionTrigger) {
      setSelectedRowKeys([]);
    }
  }, [clearSelectionTrigger]);

  // Handle row selection change
  const handleRowSelectionChange = (
    selectedRowKeys: any,
    selectedRows: any,
  ) => {
    setSelectedRowKeys(selectedRowKeys);
    if (onSelectRowsChange) {
      onSelectRowsChange(selectedRows);
    }
  };

  // rowSelection object for row selection features
  const rowSelection = {
    selectedRowKeys,
    onChange: handleRowSelectionChange,
    getCheckboxProps: (record: any) => {
      return { disabled: record.name === "Disabled User", name: record.name };
    },
  };

  // Add row number column
  const rowNumberColumn = {
    title: "#",
    key: "rowNumber",
    width: 60,
    align: "center" as const,
    render: (_: any, __: any, index: number) => {
      if (isPaginate && currentPage && limit) {
        return (currentPage - 1) * limit + index + 1;
      }
      return index + 1;
    },
  };

  // Add actions column if actions are provided
  const actionsColumn = actions
    ? {
        title: "Actions",
        key: "actions",
        width: 80,
        align: "center" as const,
        fixed: "right" as const,
        render: (_: any, record: any) => {
          const menuItems: MenuProps["items"] = actions.map(
            (action: ActionItem) => ({
              key: action.key,
              label: (
                <div className="flex items-center gap-2 cursor-pointer">
                  {action.icon && <span>{action.icon}</span>}
                  <span>{action.label}</span>
                </div>
              ),
              danger: action.danger,
              onClick: () => action.onClick(record),
            }),
          );

          return (
            <Dropdown
              menu={{ items: menuItems }}
              trigger={["click"]}
              placement="bottomRight"
            >
              <button
                className="flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical
                  size={18}
                  className="text-gray-600 cursor-pointer"
                />
              </button>
            </Dropdown>
          );
        },
      }
    : null;

  // Combine columns: row number + original columns + actions
  const columnsWithRowNumber = [
    rowNumberColumn,
    ...(columns || []),
    ...(actionsColumn ? [actionsColumn] : []),
  ];

  // Calculate total data count
  const totalDataCount = total || data?.count || data?.length || 0;

  // Determine if pagination should be shown
  // Show pagination if:
  // 1. isPaginate is true OR pagination prop is provided
  // 2. AND total data is more than 10
  const hasPaginationConfig = isPaginate || paginationProp;
  const shouldShowPagination = hasPaginationConfig && totalDataCount > 10;

  // For client-side pagination, slice the data based on current page and limit
  const pageSize = limit || paginationProp?.pageSize || 20;
  const currentPageNum = currentPage || 1;
  const paginatedData =
    shouldShowPagination && !total
      ? (data || []).slice(
          (currentPageNum - 1) * pageSize,
          currentPageNum * pageSize,
        )
      : data || [];

  const tableClassName = noInnerBorder
    ? isExpanded
      ? "sidebar-expanded"
      : "sidebar-collapsed"
    : `border rounded-lg ${isExpanded ? "sidebar-expanded" : "sidebar-collapsed"}`;

  return (
    <Table
      loading={loading}
      className={tableClassName}
      rowKey={rowKey ? rowKey : "_id"}
      rowSelection={selectRow ? rowSelection : undefined}
      dataSource={paginatedData}
      columns={columnsWithRowNumber}
      tableLayout="fixed"
      scroll={{ x: true }}
      expandable={expandable}
      pagination={
        shouldShowPagination
          ? {
              pageSize: pageSize,
              total: total || totalDataCount, // Use total if provided (server-side), otherwise use totalDataCount
              current: currentPageNum,
              onChange: (page) => {
                if (setCurrentPage) {
                  setCurrentPage(page);
                }
              },
              showSizeChanger:
                showSizeChanger || paginationProp?.showSizeChanger || false,
              pageSizeOptions: ["10", "25", "50", "100", "200", "500", "1000"],
              onShowSizeChange: (_current, newSize) => {
                if (setLimit) {
                  setLimit(newSize);
                }
                if (setCurrentPage) {
                  setCurrentPage(1);
                }
              },
              showQuickJumper: paginationProp?.showQuickJumper || false,
              // Merge paginationProp last to allow overrides
              ...(paginationProp || {}),
            }
          : false
      }
      showHeader={showHeader}
      onRow={onRow}
    />
  );
}

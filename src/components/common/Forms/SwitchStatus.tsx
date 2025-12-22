import { Switch } from "antd"
interface ISwitchStatus {
    data: any,
    handleStatusChange: any,
    loading: any,
    disabled: boolean
}

export default function SwitchStatus({ data, handleStatusChange, loading, disabled }: ISwitchStatus) {
    const record = data
    return (
        <Switch
            checked={record.isActive}
            loading={loading}
            disabled={disabled}
            onChange={(checked) => handleStatusChange(checked, record)}
        />
    )
}

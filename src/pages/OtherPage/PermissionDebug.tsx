import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../redux/features/auth/authSlice";
import { Card, Descriptions, Tag, Alert } from "antd";
import { usePermissions } from "../../hooks/usePermissions";

/**
 * Debug page to check permission data
 * Access at /permission-debug
 */
const PermissionDebug = () => {
  const user = useSelector(selectCurrentUser);
  const { hasPermission } = usePermissions();

  // Test some permissions
  const testsPermissions = [
    { module: "Products", action: "view" },
    { module: "Products", action: "create" },
    { module: "Products", action: "update" },
    { module: "Products", action: "delete" },
    { module: "Sales", action: "view" },
    { module: "Materials", action: "view" },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Permission Debug Page</h1>

      {!user && (
        <Alert
          type="error"
          message="No user data found!"
          description="User is not logged in or Redux store is empty"
          className="mb-4"
        />
      )}

      {user && (
        <>
          <Card title="User Information" className="mb-4">
            <Descriptions column={1}>
              <Descriptions.Item label="ID">{user.id}</Descriptions.Item>
              <Descriptions.Item label="Name">{user.name}</Descriptions.Item>
              <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
              <Descriptions.Item label="Type">
                <Tag color={user.type === "employee" ? "blue" : "green"}>
                  {user.type}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Role">
                <Tag>{user.role}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Designation ID">
                {user.designationId || "N/A"}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {user.type === "employee" && (
            <>
              {!user.designation && (
                <Alert
                  type="error"
                  message="No designation found!"
                  description="Employee must have a designation assigned"
                  className="mb-4"
                />
              )}

              {user.designation && (
                <>
                  <Card title="Designation Information" className="mb-4">
                    <Descriptions column={1}>
                      <Descriptions.Item label="Designation ID">
                        {user.designation.id}
                      </Descriptions.Item>
                      <Descriptions.Item label="Designation Name">
                        {user.designation.name}
                      </Descriptions.Item>
                      <Descriptions.Item label="Permissions Count">
                        {user.designation.permissions?.length || 0}
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>

                  <Card title="All Permissions" className="mb-4">
                    {user.designation.permissions &&
                    user.designation.permissions.length > 0 ? (
                      <div className="space-y-2">
                        {user.designation.permissions.map(
                          (perm: any, idx: number) => (
                            <div key={idx} className="border rounded p-3">
                              <div className="font-semibold mb-2">
                                {perm.module}
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {perm.actions.map((action: string) => (
                                  <Tag key={action} color="blue">
                                    {action}
                                  </Tag>
                                ))}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <Alert
                        type="warning"
                        message="No permissions assigned to this designation"
                      />
                    )}
                  </Card>
                </>
              )}
            </>
          )}

          <Card title="Permission Tests" className="mb-4">
            <div className="space-y-3">
              {testsPermissions.map((test, idx) => {
                const result = hasPermission(test.module, test.action);
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 border rounded"
                  >
                    <div>
                      <span className="font-semibold">{test.module}</span>
                      <span className="mx-2">→</span>
                      <span className="text-gray-600">{test.action}</span>
                    </div>
                    <Tag color={result ? "green" : "red"}>
                      {result ? "✅ Allowed" : "❌ Denied"}
                    </Tag>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card title="Raw User Data (JSON)">
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(user, null, 2)}
            </pre>
          </Card>
        </>
      )}
    </div>
  );
};

export default PermissionDebug;

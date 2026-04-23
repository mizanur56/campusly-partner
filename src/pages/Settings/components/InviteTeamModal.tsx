import { useRef } from "react";
import { Button, Col, Form, Input, Modal, Row, message } from "antd";
import {
  PhoneInput,
  phoneButtonStyle,
  phoneInputGetValueFromEvent,
  phoneInputStyle,
} from "../../Onboarding/sharedFormProps";
import { useInviteTeamMemberMutation } from "../../../redux/features/teams/partnerTeamsApi";

type PhoneCountryMeta = { dialCode: string };

export default function InviteTeamModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [form] = Form.useForm();
  const [inviteMember, { isLoading }] = useInviteTeamMemberMutation();
  const phoneMetaRef = useRef<PhoneCountryMeta>({ dialCode: "49" });

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const fullDigits = String(values.phone || "").replace(/\D/g, "");
      const dial = String(phoneMetaRef.current.dialCode || "").replace(/\D/g, "");
      const national =
        dial && fullDigits.startsWith(dial)
          ? fullDigits.slice(dial.length)
          : fullDigits;

      await inviteMember({
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        countryCode: dial ? `+${dial}` : undefined,
        contactNumber: national || undefined,
      }).unwrap();

      message.success(
        "Team member invited successfully. They will receive an email.",
      );
      form.resetFields();
      onClose();
    } catch {
      // validation / API errors: API layer may toast
    }
  };

  return (
    <Modal
      title="Invite Your Team"
      open={open}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      footer={null}
      centered
      width={560}
      destroyOnClose
      className="invite-team-modal"
      maskClosable={false}
    >
      <Form form={form} layout="vertical" className="invite-team-form">
        <Row gutter={[16, 0]}>
          <Col xs={24} sm={12}>
            <Form.Item
              label="First Name"
              name="firstName"
              rules={[{ required: true, message: "First name is required" }]}
            >
              <Input size="large" placeholder="" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Last Name"
              name="lastName"
              rules={[{ required: true, message: "Last name is required" }]}
            >
              <Input size="large" placeholder="" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Email is required" },
                { type: "email", message: "Enter a valid email" },
              ]}
            >
              <Input size="large" type="email" placeholder="" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Contact Number"
              name="phone"
              rules={[{ required: true, message: "Contact number is required" }]}
              getValueFromEvent={phoneInputGetValueFromEvent}
            >
              <PhoneInput
                country="de"
                disableCountryGuess
                inputStyle={{
                  ...phoneInputStyle,
                  height: 40,
                  borderRadius: 8,
                }}
                buttonStyle={{
                  ...phoneButtonStyle,
                  borderTopLeftRadius: 8,
                  borderBottomLeftRadius: 8,
                }}
                containerStyle={{ width: "100%", minWidth: 0 }}
                onChange={(_value: string, country: any) => {
                  phoneMetaRef.current = {
                    dialCode: country?.dialCode
                      ? String(country.dialCode)
                      : "49",
                  };
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <div className="invite-team-modal-footer">
          <Button
            size="large"
            className="invite-team-btn-cancel"
            onClick={() => {
              form.resetFields();
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            size="large"
            className="invite-team-btn-submit"
            loading={isLoading}
            onClick={handleSubmit}
          >
            Invite
          </Button>
        </div>
      </Form>
    </Modal>
  );
}

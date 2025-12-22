// ✅ Reusable number validator
export const validatePositiveNumber = (fieldLabel: string) => ({
    validator: (_: any, value: any) => {
        if (value === undefined || value === null || String(value).trim() === "") {
            return Promise.reject(`${fieldLabel} is required!`);
        }
        if (isNaN(value)) {
            return Promise.reject(`${fieldLabel} must be a valid number!`);
        }
        if (Number(value) < 0) {
            return Promise.reject(`${fieldLabel} cannot be negative!`);
        }
        return Promise.resolve();
    },
});

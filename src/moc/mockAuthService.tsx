// src/services/mockAuthService.ts

interface User {
  email: string;
  password: string;
}

const mockDatabase: User[] = [
  { email: "sujon258549@gmail.com", password: "Pa$$w0rd!" },
];

export const mockAuthService = {
  sendResetPasswordOTP: (email: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const userExists = mockDatabase.find((u) => u.email === email);
        if (userExists) {
          resolve("123456"); // mock OTP
        } else {
          reject(new Error("Email not registered"));
        }
      }, 1000);
    });
  },

  resetPassword: (otp: string, newPassword: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (otp !== "123456") {
          reject(new Error("Invalid OTP"));
          return;
        }

        // Update password for demo user
        mockDatabase[0].password = newPassword;
        resolve("Password reset successfully!");
      }, 1000);
    });
  },

  login: (email: string, password: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = mockDatabase.find(
          (u) => u.email === email && u.password === password
        );
        if (user) {
          resolve("Login successful!");
        } else {
          reject(new Error("Invalid email or password"));
        }
      }, 1000);
    });
  },
};

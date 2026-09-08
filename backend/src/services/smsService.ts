interface SendSmsParams {
  phone: string;
  message: string;
}

export const sendSms = async ({
  phone,
  message,
}: SendSmsParams): Promise<void> => {
  console.log('📱 SMS REQUEST');
  console.log('To:', phone);
  console.log('Message:', message);

  // Real SMS provider will be connected here.
};
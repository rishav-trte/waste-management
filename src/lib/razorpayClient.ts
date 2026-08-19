export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-checkout-js')) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.id = 'razorpay-checkout-js';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const processRazorpayPayment = async (
  options: {
    key: string;
    amount: string | number;
    currency: string;
    name: string;
    description: string;
    order_id: string;
    prefill: {
      name?: string;
      email?: string;
      contact?: string;
    };
    theme?: {
      color?: string;
    };
  },
  onSuccess: (response: any) => void,
  onFailure: (error: any) => void
) => {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded) {
    onFailure(new Error('Razorpay SDK failed to load.'));
    return;
  }

  const paymentOptions = {
    ...options,
    handler: function (response: any) {
      onSuccess(response);
    },
  };

  const paymentObject = new (window as any).Razorpay(paymentOptions);
  paymentObject.on('payment.failed', function (response: any) {
    onFailure(response.error);
  });
  paymentObject.open();
};

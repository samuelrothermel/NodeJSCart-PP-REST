import axios from 'axios';
import { paypalClientID, paypalSecret } from '../config/env.js';

const PAYPAL_API = 'https://api.sandbox.paypal.com';

const getAccessToken = async () => {
  const auth = Buffer.from(`${paypalClientID}:${paypalSecret}`).toString(
    'base64'
  );
  const response = await axios.post(
    `${PAYPAL_API}/v1/oauth2/token`,
    'grant_type=client_credentials',
    {
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );
  return response.data.access_token;
};

export const createCheckoutOrder = async (cart, shippingAddress) => {
  const accessToken = await getAccessToken();
  const payload = {
    intent: 'CAPTURE',
    purchase_units: [
      {
        amount: {
          currency_code: 'USD',
          value: cart.totalPrice.toFixed(2),
          breakdown: {
            item_total: {
              currency_code: 'USD',
              value: cart.totalPrice.toFixed(2),
            },
            shipping: {
              currency_code: 'USD',
              value: '0.00',
            },
          },
        },
        shipping: {
          name: {
            full_name: shippingAddress.name,
          },
          address: {
            address_line_1: shippingAddress.address,
            admin_area_2: shippingAddress.city,
            admin_area_1: shippingAddress.state,
            postal_code: shippingAddress.zip,
            country_code: shippingAddress.country,
          },
        },
      },
    ],
    application_context: {
      shipping_preference: 'SET_PROVIDED_ADDRESS',
      user_action: 'PAY_NOW',
      return_url: 'https://example.com/return',
      cancel_url: 'https://example.com/cancel',
    },
  };

  try {
    const response = await axios.post(
      `${PAYPAL_API}/v2/checkout/orders`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      'Error creating order with PayPal API:',
      error.response?.data || error.message
    );
    throw new Error(error.response?.data?.message || 'Error creating order');
  }
};

export const createAccelOrder = async cart => {
  const accessToken = await getAccessToken();
  const payload = {
    intent: 'CAPTURE',
    purchase_units: [
      {
        amount: {
          currency_code: 'USD',
          value: cart.totalPrice.toFixed(2),
          breakdown: {
            item_total: {
              currency_code: 'USD',
              value: cart.totalPrice.toFixed(2),
            },
            shipping: {
              currency_code: 'USD',
              value: '0.00',
            },
          },
        },
        shipping: {
          options: [
            {
              id: '1',
              amount: {
                currency_code: 'USD',
                value: '0.00',
              },
              type: 'SHIPPING',
              label: 'Free Shipping',
              selected: true,
            },
            {
              id: '2',
              amount: {
                currency_code: 'USD',
                value: '10.00',
              },
              type: 'SHIPPING',
              label: 'Express Shipping',
              selected: false,
            },
          ],
        },
      },
    ],
    application_context: {
      shipping_preference: 'GET_FROM_FILE',
      user_action: 'PAY_NOW',
      return_url: 'https://example.com/return',
      cancel_url: 'https://example.com/cancel',
    },
  };

  try {
    const response = await axios.post(
      `${PAYPAL_API}/v2/checkout/orders`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      'Error creating order with PayPal API:',
      error.response?.data || error.message
    );
    throw new Error(error.response?.data?.message || 'Error creating order');
  }
};

export const captureOrder = async orderID => {
  const accessToken = await getAccessToken();
  try {
    const response = await axios.post(
      `${PAYPAL_API}/v2/checkout/orders/${orderID}/capture`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('Response from PayPal API:', response.data);
    return response.data;
  } catch (error) {
    console.error(
      'Error capturing order with PayPal API:',
      error.response?.data || error.message
    );
    throw new Error(error.response?.data?.message || 'Error capturing order');
  }
};

export const authorizeOrder = async orderID => {
  const accessToken = await getAccessToken();
  try {
    const response = await axios.post(
      `${PAYPAL_API}/v2/checkout/orders/${orderID}/authorize`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      'Error authorizing order with PayPal API:',
      error.response?.data || error.message
    );
    throw new Error(error.response?.data?.message || 'Error authorizing order');
  }
};

export const captureAuthorize = async authorizationId => {
  const accessToken = await getAccessToken();
  const payload = {
    final_capture: false,
  };

  try {
    const response = await axios.post(
      `${PAYPAL_API}/v2/payments/authorizations/${authorizationId}/capture`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      'Error capturing authorization with PayPal API:',
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || 'Error capturing authorization'
    );
  }
};

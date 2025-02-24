document.addEventListener('DOMContentLoaded', () => {
  const clientId =
    'AccU9tGoUTk8kI-mfmXm-GE2GYZdUJ3vLZ6z78ZYSUZch_5bEy4Xkk0Fmvz_0s3h_rMaFeqkPlqEGgvX'; // Replace with your actual PayPal client ID
  loadPayPalSDK();

  function loadPayPalSDK(idToken) {
    const scriptUrl = `https://www.paypal.com/sdk/js?components=buttons,card-fields,messages&client-id=${clientId}&enable-funding=venmo`;
    const scriptElement = document.createElement('script');
    scriptElement.src = scriptUrl;
    if (idToken) {
      scriptElement.setAttribute('data-user-id-token', idToken);
    }
    scriptElement.onload = () => {
      paypal
        .Buttons({
          style: {
            layout: 'vertical',
          },
          createOrder: createOrderCallback,
          onApprove: onApproveCallback,
          onCancel: onCancelCallback,
          onError: onErrorCallback,
          // onShippingOptionsChange: onShippingOptionsChangeCallback,
          // onShippingAddressChange: onShippingAddressChangeCallback,
        })
        .render('#paypal-button-container');

      // Initialize the card fields
      const cardField = paypal.CardFields({
        createOrder: createOrderCallback,
        onApprove: onApproveCallback,
        onError: onErrorCallback,
      });

      if (cardField.isEligible()) {
        const nameField = cardField.NameField();
        nameField.render('#card-name-field-container');

        const numberField = cardField.NumberField();
        numberField.render('#card-number-field-container');

        const cvvField = cardField.CVVField();
        cvvField.render('#card-cvv-field-container');

        const expiryField = cardField.ExpiryField();
        expiryField.render('#card-expiry-field-container');

        document
          .getElementById('multi-card-field-button')
          .addEventListener('click', () => {
            cardField.submit();
          });
      }
    };
    document.head.appendChild(scriptElement);
  }

  document
    .getElementById('billing-info-toggle')
    .addEventListener('change', function () {
      const billingInfo = document.getElementById('billing-info');
      if (this.checked) {
        billingInfo.style.display = 'block';
      } else {
        billingInfo.style.display = 'none';
      }
    });

  document.querySelectorAll('input[name="shipping-option"]').forEach(radio => {
    radio.addEventListener('change', updateTotal);
  });

  async function updateTotal() {
    const totalElement = document.getElementById('checkout-total');
    const baseTotal = parseFloat(totalElement.getAttribute('data-base-total'));
    const shippingCost = parseFloat(
      document.querySelector('input[name="shipping-option"]:checked').value
    );
    const newTotal = baseTotal + shippingCost;

    try {
      const response = await fetch('/cart/update-shipping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ shippingCost }),
      });

      const data = await response.json();
      totalElement.textContent = data.totalPrice.toFixed(2);
      updatePayPalMessages(data.totalPrice);
    } catch (error) {
      console.error('Error updating total price:', error);
    }
  }

  function updatePayPalMessages(amount) {
    const messageContainer = document.querySelector('[data-pp-message]');
    messageContainer.setAttribute('data-pp-amount', amount.toFixed(2));
    paypal.Messages().render(messageContainer);
  }

  async function createOrderCallback() {
    console.log('Creating order...');
    resultMessage('');
    try {
      const shippingAddress = {
        name: `${document.getElementById('shipping-first-name').value} ${
          document.getElementById('shipping-last-name').value
        }`,
        email: document.getElementById('shipping-email').value,
        phone: document.getElementById('shipping-phone').value,
        address: document.getElementById('shipping-address-line1').value,
        city: document.getElementById('shipping-admin-area2').value,
        state: document.getElementById('shipping-admin-area1').value,
        zip: document.getElementById('shipping-postal-code').value,
        country: document.getElementById('shipping-country-code').value,
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cart: [
            {
              id: 'YOUR_PRODUCT_ID',
              quantity: 'YOUR_PRODUCT_QUANTITY',
            },
          ],
          shippingAddress: shippingAddress,
        }),
      });

      const orderData = await response.json();

      if (orderData.id) {
        return orderData.id;
      } else {
        const errorDetail = orderData?.details?.[0];
        console.log('Order creation failed:', errorDetail);
        const errorMessage = errorDetail
          ? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})`
          : JSON.stringify(orderData);

        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error(error);
      resultMessage(`Could not initiate PayPal Checkout...<br><br>${error}`);
    }
  }

  async function onApproveCallback(data, actions) {
    try {
      const response = await fetch(`/api/orders/${data.orderID}/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const orderData = await response.json();
      const transaction =
        orderData?.purchase_units?.[0]?.payments?.captures?.[0] ||
        orderData?.purchase_units?.[0]?.payments?.authorizations?.[0];
      const errorDetail = orderData?.details?.[0];

      if (errorDetail || !transaction || transaction.status === 'DECLINED') {
        let errorMessage;
        if (transaction) {
          errorMessage = `Transaction ${transaction.status}: ${transaction.id}`;
        } else if (errorDetail) {
          errorMessage = `${errorDetail.description} (${orderData.debug_id})`;
        } else {
          errorMessage = JSON.stringify(orderData);
        }

        throw new Error(errorMessage);
      } else {
        resultMessage(
          `Transaction ${transaction.status}: ${transaction.id}<br><br>See console for all available details`
        );
        console.log(
          'Capture result',
          orderData,
          JSON.stringify(orderData, null, 2)
        );
      }
    } catch (error) {
      console.error(error);
      resultMessage(
        `Sorry, your transaction could not be processed...<br><br>${error}`
      );
    }
  }

  function onCancelCallback(data) {
    console.log('Payment cancelled:', data);
    resultMessage('Payment was cancelled.');
  }

  function onErrorCallback(err) {
    console.error('Error during payment:', err);
    resultMessage('An error occurred during the payment process.');
  }

  function onShippingOptionsChangeCallback(data, actions) {
    console.log('Shipping options changed:', data);
    // Implement your logic here
  }

  function onShippingAddressChangeCallback(data, actions) {
    console.log('Shipping address changed:', data);
    // Implement your logic here
  }

  function resultMessage(message) {
    const container = document.querySelector('#result-message');
    container.innerHTML = message;
  }
});

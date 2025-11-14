// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
// [GEMINI_VN]: 1. Import PayPalScriptProvider
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { AuthProvider } from './context/AuthContext';

// [GEMINI_VN]: 2. Cấu hình ban đầu
const initialOptions = {
  // [GEMINI_VN]: 3. DÁN CLIENT ID CỦA BẠN VÀO ĐÂY
  "client-id": "ARo5NrER-iLqcqMIlT1w81x1WQnhkz_O3YaRQ4tAPD-gkQZe7rZYKOHQn33rH_AhnprGlb7XlDXXeyor",
  currency: "USD", // PayPal Sandbox thường xử lý USD tốt nhất
  intent: "capture",
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* [GEMINI_VN]: 4. Bọc toàn bộ ứng dụng bằng Provider */}
    <PayPalScriptProvider options={initialOptions}>
      <BrowserRouter>

        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </PayPalScriptProvider>
  </React.StrictMode>
);
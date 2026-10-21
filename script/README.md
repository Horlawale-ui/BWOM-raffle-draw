# Google Apps Script Setup Guide

This backend script integrates your Google Sheet directly with the customer raffle wheel.

## Sheet Column Setup

In your Google Sheet (sheet name: `Customers`), set Row 1 headers as:

| Col A | Col B | Col C | Col D | Col E | Col F | Col G |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **S/N** | **NAME** | **AMOUNT** | **SPINNED** | **PRIZE** | **SPUN AT** | **DELIVERED** |

---

## Prize Probability Distribution (Balanced Profile)

### 1. Standard Customers (`AMOUNT < 500,000`)
- **Try again**: **20%**
- **Free stickers**: **18%**
- **5k discount voucher**: **18%**
- **Pouch**: **18%**
- **Wireless mouse**: **13%**
- **Laptop stand**: **13%**
- **10k discount voucher**: **0%** *(Reserved for VIPs)*
- **iPhone 17 Pro Max**: **0%** *(Excluded)*

### 2. VIP Customers (`AMOUNT >= 500,000`)
- **Try again**: **20%**
- **Free stickers**: **15%**
- **5k discount voucher**: **15%**
- **Pouch**: **15%**
- **Wireless mouse**: **12.5%**
- **Laptop stand**: **12.5%**
- **10k discount voucher**: **10%**
- **iPhone 17 Pro Max**: **0%** *(Excluded)*

---

## Deployment Steps

1. In Google Sheets, make sure headers are: `S/N`, `NAME`, `AMOUNT`, `SPINNED`, `PRIZE`, `SPUN AT`, `DELIVERED`.
2. Go to **Extensions** > **Apps Script**.
3. Replace existing code with the code from [`Code.gs`](./Code.gs).
4. Click **Deploy** > **Manage deployments** > Click the edit (pencil) icon:
   - Version: **New version**
   - Click **Deploy**
5. *(Or if creating for the first time)* Click **Deploy** > **New deployment**:
   - **Select type**: Web app
   - **Execute as**: `Me`
   - **Who has access**: `Anyone`
6. Copy the **Web App URL** (`/exec`) and paste into your `.env` file:
   ```env
   VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
   ```

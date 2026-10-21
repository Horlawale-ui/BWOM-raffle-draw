# Google Apps Script Setup Guide

This backend script integrates your Google Sheet directly with the customer raffle wheel.

## Sheet Column Setup

In your Google Sheet (sheet name: `Customers`), set Row 1 headers as:

| Col A | Col B | Col C | Col D | Col E | Col F | Col G |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **S/N** | **NAME** | **AMOUNT** | **SPINNED** | **PRIZE** | **SPUN AT** | **DELIVERED** |

### Column Descriptions & Rules:
- **`S/N`**: Serial number (`1`, `2`, `3`...).
- **`NAME`**: Customer's full name (verified against input).
- **`AMOUNT`**: Total purchase amount. Customers with $\ge 500,000$ qualify for the **`10k discount voucher`**.
- **`SPINNED`**: Set to `TRUE` automatically when they spin.
- **`PRIZE`**: Automatically recorded with the prize they won.
- **`SPUN AT`**: Automatically timestamped when spun.
- **`DELIVERED`**: Set to `FALSE` (or left blank) initially. Change to `TRUE` once you deliver or fulfill their prize.

### Behavior:
1. **First Time Spin**: Customer spins the wheel, wins, and sees their prize. `SPINNED` becomes `TRUE`.
2. **Spinned, NOT Delivered (`DELIVERED = FALSE`)**: If they check again, the app directly shows the prize they won and the WhatsApp claim button so they never lose their prize details.
3. **Spinned & Delivered (`DELIVERED = TRUE`)**: If they enter their name after delivery, the app shows: *"You have already participated in this raffle draw. Thank you for your support!"*

---

## Deployment Steps

1. In Google Sheets, make sure headers are: `S/N`, `NAME`, `AMOUNT`, `SPINNED`, `PRIZE`, `SPUN AT`, `DELIVERED`.
2. Go to **Extensions** > **Apps Script**.
3. Replace existing code with the code from [`Code.gs`](./Code.gs).
4. Click **Deploy** > **New deployment**:
   - **Select type**: Web app
   - **Description**: `BWOM Raffle Draw API`
   - **Execute as**: `Me`
   - **Who has access**: `Anyone`
5. Click **Deploy**, authorize access, and copy your **Web App URL** (`/exec`).
6. Paste into your `.env` file:
   ```env
   VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
   ```

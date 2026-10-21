/**
 * GOOGLE APPS SCRIPT - RAFFLE DRAW BACKEND
 * 
 * Target Google Sheet Structure:
 * Tab Name: "Customers" (or any name configured in SHEET_NAME below)
 * 
 * Columns in Row 1:
 * Col A (1): S/N
 * Col B (2): NAME
 * Col C (3): AMOUNT
 * Col D (4): SPINNED
 * Col E (5): PRIZE
 * Col F (6): SPUN AT
 * Col G (7): DELIVERED
 * 
 * Workflow Rules:
 * 1. Not Spun (SPINNED != true):
 *    -> Status: "success", spins the wheel, records SPINNED=true, PRIZE, and SPUN AT timestamp.
 * 2. Spun but NOT yet Delivered (SPINNED=true, DELIVERED!=true):
 *    -> Status: "already_spun", delivered: false.
 *    -> Frontend displays the prize they won so they can see and claim it on WhatsApp.
 * 3. Delivered (DELIVERED=true):
 *    -> Status: "already_spun", delivered: true.
 *    -> Frontend shows: "You have already participated in this raffle draw. Thank you for your support!"
 */

const SHEET_NAME = 'Customers';

// Prizes pool matching frontend WHEEL_PRIZES
// Note: "iPhone 17 Pro Max" is excluded so nobody can win it.
const STANDARD_PRIZES = [
  'Wireless mouse',
  '5k discount voucher',
  'Laptop stand',
  'Free stickers',
  'Pouch',
  'Try again'
];

// Special prize only for customers whose purchase amount is >= 500,000
const HIGH_TIER_PRIZE = '10k discount voucher';
const HIGH_TIER_THRESHOLD = 500000;

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  const lock = LockService.getScriptLock();
  
  // Wait up to 10 seconds for concurrent requests
  try {
    lock.waitLock(10000);
  } catch (error) {
    return createJsonResponse({
      status: 'error',
      message: 'Server is currently busy, please try again.'
    });
  }

  try {
    const rawName = (e && e.parameter && e.parameter.name) ? e.parameter.name : '';
    const name = String(rawName).trim();

    if (!name) {
      return createJsonResponse({
        status: 'not_found',
        message: 'Name parameter is required'
      });
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) {
      return createJsonResponse({
        status: 'error',
        message: 'Sheet "' + SHEET_NAME + '" not found.'
      });
    }

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return createJsonResponse({ status: 'not_found' });
    }

    const headers = data[0].map(h => String(h).trim().toUpperCase());

    // Matches exact headers: S/N, NAME, AMOUNT, SPINNED, PRIZE, SPUN AT, DELIVERED
    let nameColIdx = headers.indexOf('NAME');
    if (nameColIdx === -1) {
      nameColIdx = headers.findIndex(h => h.includes('NAME') || h.includes('CUSTOMER'));
    }

    let amountColIdx = headers.indexOf('AMOUNT');
    if (amountColIdx === -1) {
      amountColIdx = headers.findIndex(h => h.includes('AMOUNT') || h.includes('SPEND') || h.includes('TOTAL'));
    }

    let spinnedColIdx = headers.indexOf('SPINNED');
    if (spinnedColIdx === -1) {
      spinnedColIdx = headers.findIndex(h => h.includes('SPIN') || h.includes('STATUS'));
    }

    let prizeColIdx = headers.indexOf('PRIZE');
    if (prizeColIdx === -1) {
      prizeColIdx = headers.findIndex(h => h.includes('PRIZE') || h.includes('REWARD'));
    }

    let spunAtColIdx = headers.indexOf('SPUN AT');
    if (spunAtColIdx === -1) {
      spunAtColIdx = headers.findIndex(h => h.includes('SPUN AT') || h.includes('DATE') || h.includes('TIME'));
    }

    let deliveredColIdx = headers.indexOf('DELIVERED');
    if (deliveredColIdx === -1) {
      deliveredColIdx = headers.findIndex(h => h.includes('DELIVER') || h.includes('CLAIM'));
    }

    // Default column fallbacks: B (1), C (2), D (3), E (4), F (5), G (6)
    if (nameColIdx === -1) nameColIdx = 1;
    if (amountColIdx === -1) amountColIdx = 2;
    if (spinnedColIdx === -1) spinnedColIdx = 3;
    if (prizeColIdx === -1) prizeColIdx = 4;
    if (spunAtColIdx === -1) spunAtColIdx = 5;
    if (deliveredColIdx === -1) deliveredColIdx = 6;

    const targetName = name.toLowerCase();
    let foundRowIndex = -1;
    let customerRow = null;

    for (let i = 1; i < data.length; i++) {
      const rowName = String(data[i][nameColIdx]).trim().toLowerCase();
      if (rowName === targetName) {
        foundRowIndex = i + 1; // 1-based index in Sheet
        customerRow = data[i];
        break;
      }
    }

    // Customer not found in records
    if (foundRowIndex === -1 || !customerRow) {
      return createJsonResponse({ status: 'not_found' });
    }

    // Check if customer already spun (SPINNED column)
    const spinnedVal = String(customerRow[spinnedColIdx]).trim().toLowerCase();
    const alreadySpun = spinnedVal === 'true' || spinnedVal === 'yes' || spinnedVal === '1';

    // Check if prize is marked as DELIVERED
    const deliveredVal = (deliveredColIdx < customerRow.length) 
      ? String(customerRow[deliveredColIdx]).trim().toLowerCase() 
      : '';
    const isDelivered = deliveredVal === 'true' || deliveredVal === 'yes' || deliveredVal === '1';

    if (alreadySpun) {
      const existingPrize = customerRow[prizeColIdx] || '';
      return createJsonResponse({
        status: 'already_spun',
        name: customerRow[nameColIdx],
        prize: existingPrize,
        delivered: isDelivered
      });
    }

    // Determine customer purchase amount from AMOUNT column
    let purchaseAmount = 0;
    if (amountColIdx !== -1) {
      const rawAmt = String(customerRow[amountColIdx]).replace(/[^0-9.]/g, '');
      purchaseAmount = parseFloat(rawAmt) || 0;
    }

    // Determine eligible prizes
    let eligiblePrizes = [...STANDARD_PRIZES];
    // Customers with AMOUNT >= 500k are eligible for the 10k discount voucher
    if (purchaseAmount >= HIGH_TIER_THRESHOLD) {
      eligiblePrizes.push(HIGH_TIER_PRIZE);
    }

    // Pick random prize from eligible prizes (iPhone 17 Pro Max is never in this array)
    const selectedPrize = eligiblePrizes[Math.floor(Math.random() * eligiblePrizes.length)];

    // Update Google Sheet columns:
    // SPINNED = true
    sheet.getRange(foundRowIndex, spinnedColIdx + 1).setValue(true);
    // PRIZE = selectedPrize
    sheet.getRange(foundRowIndex, prizeColIdx + 1).setValue(selectedPrize);
    // SPUN AT = formatted timestamp
    sheet.getRange(foundRowIndex, spunAtColIdx + 1).setValue(new Date());

    return createJsonResponse({
      status: 'success',
      name: customerRow[nameColIdx],
      prize: selectedPrize,
      delivered: false
    });

  } catch (err) {
    return createJsonResponse({
      status: 'error',
      message: err.toString()
    });
  } finally {
    lock.releaseLock();
  }
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

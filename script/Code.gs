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
 * Weighted Odds Distribution:
 * Standard Customers (< 500k):
 * - Try again: 20%
 * - Free stickers: 18%
 * - 5k discount voucher: 18%
 * - Pouch: 18%
 * - Wireless mouse: 13%
 * - Laptop stand: 13%
 * - 10k discount voucher: 0% (VIP only)
 * - iPhone 17 Pro Max: 0% (Never won)
 * 
 * VIP Customers (>= 500k):
 * - Try again: 20%
 * - Free stickers: 15%
 * - 5k discount voucher: 15%
 * - Pouch: 15%
 * - Wireless mouse: 12.5%
 * - Laptop stand: 12.5%
 * - 10k discount voucher: 10%
 * - iPhone 17 Pro Max: 0% (Never won)
 */

const SHEET_NAME = 'Customers';
const HIGH_TIER_THRESHOLD = 500000;

// Weighted tables (weights sum to 100 for easy tuning)
const STANDARD_WEIGHTED_PRIZES = [
  { prize: 'Try again', weight: 20 },
  { prize: 'Free stickers', weight: 18 },
  { prize: '5k discount voucher', weight: 18 },
  { prize: 'Pouch', weight: 18 },
  { prize: 'Wireless mouse', weight: 13 },
  { prize: 'Laptop stand', weight: 13 }
];

const VIP_WEIGHTED_PRIZES = [
  { prize: 'Try again', weight: 20 },
  { prize: 'Free stickers', weight: 15 },
  { prize: '5k discount voucher', weight: 15 },
  { prize: 'Pouch', weight: 15 },
  { prize: 'Wireless mouse', weight: 12.5 },
  { prize: 'Laptop stand', weight: 12.5 },
  { prize: '10k discount voucher', weight: 10 }
];

function pickWeightedPrize(prizeList) {
  const totalWeight = prizeList.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < prizeList.length; i++) {
    if (random < prizeList[i].weight) {
      return prizeList[i].prize;
    }
    random -= prizeList[i].weight;
  }
  return prizeList[0].prize;
}

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

    // Pick prize based on weighted odds table
    const prizePool = (purchaseAmount >= HIGH_TIER_THRESHOLD)
      ? VIP_WEIGHTED_PRIZES
      : STANDARD_WEIGHTED_PRIZES;

    const selectedPrize = pickWeightedPrize(prizePool);

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

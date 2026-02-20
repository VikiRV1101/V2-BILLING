async function preparePrint(invoice) {
    const type = localStorage.getItem('printType') || '58mm';

    // Fetch all shop settings
    const shopName = await getItem('settings', 'shopName') || { value: 'V-BAKERY' };
    const shopAddress = await getItem('settings', 'shopAddress') || { value: '123 Bakery Street, India' };
    const shopPhone = await getItem('settings', 'shopPhone') || { value: '+91 9876543210' };
    const shopLogo = await getItem('settings', 'shopLogo') || { value: '' };
    const paymentQR = await getItem('settings', 'paymentQR') || { value: '' };
    const printLogo = await getItem('settings', 'printLogo') || { value: true };
    const printGST = await getItem('settings', 'printGST') || { value: false };
    const printQR = await getItem('settings', 'printQR') || { value: true };
    const gstNumber = await getItem('settings', 'gstNumber') || { value: '' };

    const settings = {
        name: shopName.value,
        address: shopAddress.value,
        phone: shopPhone.value,
        logo: shopLogo.value,
        qr: paymentQR.value,
        printLogo: printLogo.value,
        printGST: printGST.value,
        printQR: printQR.value,
        gstNumber: gstNumber.value
    };

    let content = '';
    if (type === '58mm' || type === '80mm') {
        content = generateThermalReceipt(invoice, type, settings);
    } else {
        content = generateA5Invoice(invoice, settings);
    }

    // Create a hidden iframe for printing
    let iframe = document.getElementById('printIframe');
    if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.id = 'printIframe';
        iframe.style.position = 'absolute';
        iframe.style.top = '-9999px';
        iframe.style.left = '-9999px';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = 'none';
        document.body.appendChild(iframe);
    }

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
        <html>
            <head>
                <title>V-BAKERY Receipt</title>
                <style>
                    body {
                        margin: 0;
                        padding: 0;
                        font-family: 'Courier New', Courier, monospace;
                        font-size: 13px;
                        color: #000000;
                        background: #fff;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                        text-rendering: optimizeLegibility; 
                        -webkit-font-smoothing: none;
                    }
                    * { box-sizing: border-box; }
                    .print-58 { width: 58mm; padding: 5mm; }
                    .print-80 { width: 80mm; padding: 8mm; }
                    .print-a5 { width: 148mm; padding: 15mm; border: 1px solid #ddd; }
                    h2, h3 { margin: 0; text-transform: uppercase; font-weight: bold; color: #000; }
                    p { margin: 2px 0; color: #000; }
                    table { width: 100%; border-collapse: collapse; margin: 10px 0; }
                    th, td { padding: 4px 0; font-size: 13px; color: #000; }
                    th { text-align: left; border-bottom: 1px dashed #000; font-weight: bold; }
                    .text-center { text-align: center; }
                    .text-right { text-align: right; }
                    .flex { display: flex; justify-content: space-between; }
                    .font-bold { font-weight: bold; }
                    @media print {
                        @page { margin: 0; }
                        body { color: #000; }
                    }
                </style>
            </head>
            <body>
                ${content}
                <script>
                    window.onload = function() {
                        window.focus();
                        window.print();
                    };
                </script>
            </body>
        </html>
    `);
    doc.close();
}

function generateThermalReceipt(inv, size, s) {
    const className = size === '58mm' ? 'print-58' : 'print-80';
    const lineCount = size === '58mm' ? 32 : 48;
    const line = '-'.repeat(lineCount);

    return `
        <div class="${className}">
            <div style="margin-bottom:10px; display: flex; align-items: center; gap: 10px;">
                ${s.printLogo && s.logo ? `<img src="${s.logo}" style="width: 50px; height: 50px; object-fit: contain;">` : ''}
                <div style="flex: 1;">
                    <h2 style="font-size: 16px; margin: 0; line-height: 1.2;">${s.name}</h2>
                    <p style="font-size: 10px; margin: 0; line-height: 1.1;">${s.address}</p>
                    <p style="font-size: 10px; margin: 0; line-height: 1.1;">PH: ${s.phone}</p>
                    ${s.printGST && s.gstNumber ? `<p style="font-size: 10px; margin: 0; line-height: 1.1;">GST: ${s.gstNumber}</p>` : ''}
                </div>
            </div>
            <div class="text-center">${line}</div>
            <div style="margin: 5px 0; font-size: 11px; line-height: 1.2;">
                <p>INV: ${inv.invoiceNumber}</p>
                <div class="flex">
                    <span>DATE: ${new Date(inv.dateTime).toLocaleDateString()}</span>
                    <span>TIME: ${new Date(inv.dateTime).toLocaleTimeString()}</span>
                </div>
                <p>STAFF: ${inv.staffName.toUpperCase()}</p>
            </div>
            <div class="text-center">${line}</div>
            <table>
                <thead>
                    <tr>
                        <th style="width: 50%;">ITEM</th>
                        <th class="text-right">QTY</th>
                        <th class="text-right">TOTAL</th>
                    </tr>
                </thead>
                <tbody>
                    ${inv.items.map(item => `
                        <tr>
                            <td>${item.name.toUpperCase()}</td>
                            <td class="text-right">${item.qty}</td>
                            <td class="text-right">${(item.price * item.qty).toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <div class="text-center">${line}</div>
            <div class="text-right" style="margin: 10px 0; font-size: 14px;">
                <p>SUBTOTAL: ₹ ${inv.subtotal.toFixed(2)}</p>
                <p>DISCOUNT: ₹ ${inv.discount.toFixed(2)}</p>
                <h2 style="font-size: 16px; margin-top: 5px;">TOTAL: ₹ ${inv.netTotal.toFixed(2)}</h2>
            </div>
            ${s.printGST ? `
            <div class="text-center" style="font-size: 11px; margin-top: 5px;">
                Inclusive of GST
            </div>
            ` : ''}
            <div class="text-center">${line}</div>
            <p class="text-center" style="margin-top:5px;">PAYMENT: ${inv.paymentMode.toUpperCase()}</p>
            ${s.printQR && s.qr ? `
            <div class="text-center" style="margin-top: 15px;">
                <p style="font-size: 10px; margin-bottom: 5px;">SCAN TO PAY</p>
                <img src="${s.qr}" style="width: 100px; height: 100px; border: 1px solid #eee; padding: 5px;">
            </div>
            ` : ''}
            <p class="text-center" style="margin: 20px 0;">*** THANK YOU! ***</p>
        </div>
    `;
}

function generateA5Invoice(inv, s) {
    return `
        <div class="print-a5">
            <div class="flex" style="border-bottom:2px solid #000; padding-bottom:10px;">
                <div class="flex align-center gap-20">
                    ${s.printLogo && s.logo ? `<img src="${s.logo}" style="max-width: 60px;">` : ''}
                    <div>
                        <h2>${s.name}</h2>
                        <p>${s.address}</p>
                        <p>PH: ${s.phone}</p>
                        ${s.printGST && s.gstNumber ? `<p>GST: ${s.gstNumber}</p>` : ''}
                    </div>
                </div>
                <div class="text-right">
                    <h2>TAX INVOICE</h2>
                    <p>#${inv.invoiceNumber}</p>
                </div>
            </div>
            <div class="flex" style="margin-top:20px;">
                <div>
                    <strong>BILLED TO:</strong><br>
                    ${inv.customerName || 'WALK-IN CUSTOMER'}<br>
                    ${inv.customerPhone || ''}
                </div>
                <div class="text-right">
                    <strong>DATE:</strong> ${new Date(inv.dateTime).toLocaleDateString()}<br>
                    <strong>TIME:</strong> ${new Date(inv.dateTime).toLocaleTimeString()}<br>
                    <strong>STAFF:</strong> ${inv.staffName.toUpperCase()}
                </div>
            </div>
            <table style="width:100%; margin-top:30px;">
                <thead>
                    <tr style="background:#eee;">
                        <th style="padding:10px; border:1px solid #000;">DESCRIPTION</th>
                        <th style="padding:10px; border:1px solid #000; text-align:center;">PRICE</th>
                        <th style="padding:10px; border:1px solid #000; text-align:center;">QTY</th>
                        <th style="padding:10px; border:1px solid #000; text-align:right;">TOTAL</th>
                    </tr>
                </thead>
                <tbody>
                    ${inv.items.map(item => `
                        <tr>
                            <td style="padding:10px; border:1px solid #000;">${item.name.toUpperCase()}</td>
                            <td style="padding:10px; border:1px solid #000; text-align:center;">₹ ${item.price}</td>
                            <td style="padding:10px; border:1px solid #000; text-align:center;">${item.qty}</td>
                            <td style="padding:10px; border:1px solid #000; text-align:right;">₹ ${(item.price * item.qty).toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <div style="margin-left:auto; width:250px; margin-top:20px;">
                <div class="flex"><span>SUBTOTAL:</span><span>₹ ${inv.subtotal.toFixed(2)}</span></div>
                <div class="flex"><span>DISCOUNT:</span><span>₹ ${inv.discount.toFixed(2)}</span></div>
                <div class="flex font-bold" style="font-size:1.4rem; border-top:2px solid #000; padding-top:10px; margin-top:10px;">
                    <span>NET AMOUNT:</span><span>₹ ${inv.netTotal.toFixed(2)}</span>
                </div>
            </div>
            <div style="margin-top:50px; display: flex; justify-content: space-between; align-items: flex-end;">
                <div>
                    <p><strong>PAYMENT MODE:</strong> ${inv.paymentMode.toUpperCase()}</p>
                    <div style="margin-top:10px; font-size: 0.9rem;">
                        ${s.printGST ? `<p>GST Analysis: Total Tax included in above net amount.</p>` : ''}
                    </div>
                </div>
                ${s.printQR && s.qr ? `
                <div class="text-center" style="border: 1px solid #ddd; padding: 10px; border-radius: 8px;">
                    <p style="font-size: 10px; margin-bottom: 5px; font-weight: bold;">PAY VIA UPI</p>
                    <img src="${s.qr}" style="width: 80px; height: 80px;">
                </div>
                ` : ''}
            </div>
            <div style="margin-top:40px; border-top:1px solid #000; padding-top:10px; text-align:center; font-style: italic;">
                THANK YOU FOR SHOPPING AT ${s.name}!
            </div>
        </div>
    `;
}

window.preparePrint = preparePrint;

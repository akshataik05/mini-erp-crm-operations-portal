import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const HEADER_TITLE = 'Mini ERP + CRM Operations Portal';

/**
 * Common header helper for clean professional PDF export
 */
const addPdfHeader = (doc: jsPDF, title: string, subtitle?: string) => {
  // Primary brand banner bar
  doc.setFillColor(3, 105, 161); // brand-600 #0369a1
  doc.rect(0, 0, 210, 14, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(HEADER_TITLE, 14, 9.5);

  // Date timestamp
  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${dateStr}`, 196, 9.5, { align: 'right' });

  // Page Header Title
  doc.setTextColor(15, 23, 42); // slate-900
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, 25);

  if (subtitle) {
    doc.setTextColor(100, 116, 139); // slate-500
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(subtitle, 14, 31);
  }
};

/**
 * Common footer helper
 */
const addPdfFooter = (doc: jsPDF) => {
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(
      `Page ${i} of ${pageCount} — Confidential Operations Report`,
      105,
      287,
      { align: 'center' }
    );
  }
};

/**
 * 1. Export Single Challan Invoice PDF
 */
export const exportChallanPDF = (challan: any) => {
  const doc = new jsPDF();
  addPdfHeader(doc, `Delivery Challan ${challan.challanNumber}`, `Status: ${challan.status}`);

  let y = 40;

  // Metadata Card Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, 182, 32, 2, 2, 'FD');

  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Customer Information:', 18, y + 8);
  doc.setFont('helvetica', 'normal');
  doc.text(`${challan.customer?.name || 'N/A'} (${challan.customer?.businessName || ''})`, 18, y + 15);
  doc.text(`Mobile: ${challan.customer?.mobile || 'N/A'} | Email: ${challan.customer?.email || 'N/A'}`, 18, y + 22);
  if (challan.customer?.gstNumber) {
    doc.text(`GSTIN: ${challan.customer.gstNumber}`, 18, y + 27);
  }

  doc.setFont('helvetica', 'bold');
  doc.text('Challan Summary:', 120, y + 8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Challan No: ${challan.challanNumber}`, 120, y + 15);
  doc.text(`Created Date: ${new Date(challan.createdAt).toLocaleDateString()}`, 120, y + 22);
  doc.text(`Status: ${challan.status}`, 120, y + 27);

  y += 40;

  // Table items
  const tableData = (challan.items || []).map((item: any, idx: number) => [
    idx + 1,
    item.productNameSnapshot || item.product?.name || 'N/A',
    item.skuSnapshot || item.product?.sku || 'N/A',
    item.quantity,
    `₹${(item.unitPriceSnapshot || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
    `₹${((item.unitPriceSnapshot || 0) * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
  ]);

  autoTable(doc, {
    startY: y,
    head: [['#', 'Item Name', 'SKU', 'Qty', 'Unit Price', 'Line Total']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [3, 105, 161], textColor: 255, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 8.5, textColor: [30, 41, 59] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;

  // Totals Box
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(120, finalY, 76, 22, 2, 2, 'F');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Quantity: ${challan.totalQuantity}`, 124, finalY + 8);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(
    `Grand Total: ₹${(challan.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
    124,
    finalY + 16
  );

  addPdfFooter(doc);
  doc.save(`${challan.challanNumber}.pdf`);
};

/**
 * 2. Export Sales Challans List Report
 */
export const exportChallansListPDF = (challans: any[], searchFilter?: string) => {
  const doc = new jsPDF();
  const subtitle = searchFilter ? `Filtered Report (Search: "${searchFilter}")` : 'Complete Sales Challans Register';
  addPdfHeader(doc, 'Sales Challans Report', subtitle);

  const tableData = challans.map((c, i) => [
    i + 1,
    c.challanNumber,
    c.customer?.name || 'N/A',
    c.totalQuantity,
    `₹${(c.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
    c.status,
    new Date(c.createdAt).toLocaleDateString()
  ]);

  autoTable(doc, {
    startY: 38,
    head: [['#', 'Challan No', 'Customer Name', 'Qty', 'Total Amount', 'Status', 'Date']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [3, 105, 161], textColor: 255, fontStyle: 'bold' },
    bodyStyles: { fontSize: 8.5 },
    alternateRowStyles: { fillColor: [248, 250, 252] }
  });

  addPdfFooter(doc);
  doc.save('sales_challans_report.pdf');
};

/**
 * 3. Export Customers List Report
 */
export const exportCustomersListPDF = (customers: any[], searchFilter?: string) => {
  const doc = new jsPDF();
  const subtitle = searchFilter ? `Filtered List (Filter: "${searchFilter}")` : 'Active CRM Customer Directory';
  addPdfHeader(doc, 'Customer Directory Report', subtitle);

  const tableData = customers.map((c, i) => [
    i + 1,
    c.name,
    c.businessName || '—',
    c.customerType,
    c.mobile,
    c.email,
    c.status
  ]);

  autoTable(doc, {
    startY: 38,
    head: [['#', 'Contact Name', 'Business Name', 'Type', 'Mobile', 'Email', 'Status']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [3, 105, 161], textColor: 255, fontStyle: 'bold' },
    bodyStyles: { fontSize: 8 }
  });

  addPdfFooter(doc);
  doc.save('customers_report.pdf');
};

/**
 * 4. Export Single Customer Details Report
 */
export const exportCustomerDetailPDF = (customer: any) => {
  const doc = new jsPDF();
  addPdfHeader(doc, `Customer Profile: ${customer.name}`, `Business: ${customer.businessName || 'N/A'}`);

  let y = 40;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, y, 182, 45, 2, 2, 'FD');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Contact & Business Details:', 18, y + 8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Full Name: ${customer.name}`, 18, y + 15);
  doc.text(`Business Name: ${customer.businessName || 'N/A'}`, 18, y + 22);
  doc.text(`GST Number: ${customer.gstNumber || 'N/A'}`, 18, y + 29);
  doc.text(`Customer Type: ${customer.customerType}`, 18, y + 36);

  doc.text(`Mobile: ${customer.mobile}`, 110, y + 15);
  doc.text(`Email: ${customer.email}`, 110, y + 22);
  doc.text(`Status: ${customer.status}`, 110, y + 29);
  doc.text(`Follow-up Date: ${customer.followUpDate ? new Date(customer.followUpDate).toLocaleDateString() : 'None'}`, 110, y + 36);

  y += 52;
  doc.setFont('helvetica', 'bold');
  doc.text('Address:', 14, y);
  doc.setFont('helvetica', 'normal');
  doc.text(customer.address || 'No address specified.', 14, y + 6);

  if (customer.notes) {
    y += 18;
    doc.setFont('helvetica', 'bold');
    doc.text('Internal Operations Notes:', 14, y);
    doc.setFont('helvetica', 'normal');
    doc.text(customer.notes, 14, y + 6);
  }

  addPdfFooter(doc);
  doc.save(`customer_${customer.name.replace(/\s+/g, '_')}.pdf`);
};

/**
 * 5. Export Products Catalog & Inventory Report
 */
export const exportProductsListPDF = (products: any[], searchFilter?: string) => {
  const doc = new jsPDF();
  const subtitle = searchFilter ? `Filtered Catalogue (Filter: "${searchFilter}")` : 'Inventory Master Catalogue & Stock Levels';
  addPdfHeader(doc, 'Products & Inventory Report', subtitle);

  const tableData = products.map((p, i) => [
    i + 1,
    p.name,
    p.sku,
    p.category,
    `₹${p.unitPrice.toLocaleString('en-IN')}`,
    p.currentStock,
    p.minimumStock,
    p.currentStock <= p.minimumStock ? 'LOW STOCK' : 'OK',
    p.warehouseLocation
  ]);

  autoTable(doc, {
    startY: 38,
    head: [['#', 'Product Name', 'SKU', 'Category', 'Price', 'Stock', 'Min', 'Status', 'Location']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [3, 105, 161], textColor: 255, fontStyle: 'bold' },
    bodyStyles: { fontSize: 8 },
    didParseCell: (data) => {
      if (data.column.index === 7 && data.cell.text[0] === 'LOW STOCK') {
        data.cell.styles.textColor = [225, 29, 72]; // red
        data.cell.styles.fontStyle = 'bold';
      }
    }
  });

  addPdfFooter(doc);
  doc.save('products_inventory_report.pdf');
};

/**
 * 6. Export Stock Movements Audit Trail Report
 */
export const exportStockMovementsPDF = (movements: any[], searchFilter?: string) => {
  const doc = new jsPDF();
  const subtitle = searchFilter ? `Filtered Audit Logs (Filter: "${searchFilter}")` : 'Complete Warehouse Stock Movement Audit Log';
  addPdfHeader(doc, 'Stock Movements Audit Report', subtitle);

  const tableData = movements.map((m, i) => [
    i + 1,
    new Date(m.createdAt).toLocaleDateString(),
    m.product?.name || 'N/A',
    m.product?.sku || 'N/A',
    m.movementType,
    m.quantity,
    m.reason,
    m.user?.name || 'System'
  ]);

  autoTable(doc, {
    startY: 38,
    head: [['#', 'Date', 'Product Name', 'SKU', 'Type', 'Qty', 'Reason', 'Logged By']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [3, 105, 161], textColor: 255, fontStyle: 'bold' },
    bodyStyles: { fontSize: 8 }
  });

  addPdfFooter(doc);
  doc.save('stock_movements_report.pdf');
};

/**
 * 7. Export Dashboard Operations Summary Report
 */
export const exportDashboardPDF = (metrics: any, recentMovements: any[]) => {
  const doc = new jsPDF();
  addPdfHeader(doc, 'Operations Executive Dashboard Report', 'Summary of CRM Leads, Stock Valuation, and Movement Activity');

  let y = 40;

  // 6 Metric Summary Grid
  const summaryBoxes = [
    { label: 'Total Customers', val: metrics.totalCustomers || 0 },
    { label: 'Active Leads', val: metrics.activeLeads || 0 },
    { label: 'Total Products', val: metrics.totalProducts || 0 },
    { label: 'Low Stock Alerts', val: metrics.lowStockCount || 0 },
    { label: 'Sales Challans', val: metrics.totalChallans || 0 },
    { label: 'Total Inventory Value', val: `₹${(metrics.totalInventoryValue || 0).toLocaleString('en-IN')}` }
  ];

  autoTable(doc, {
    startY: y,
    head: [['Metric Indicator', 'Value']],
    body: summaryBoxes.map((b) => [b.label, b.val]),
    theme: 'grid',
    headStyles: { fillColor: [3, 105, 161], textColor: 255, fontStyle: 'bold' },
    bodyStyles: { fontSize: 9 }
  });

  if (recentMovements && recentMovements.length > 0) {
    const moveY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Recent Stock Movement Audit Logs', 14, moveY);

    const moveData = recentMovements.map((m: any, i: number) => [
      i + 1,
      new Date(m.createdAt).toLocaleDateString(),
      m.product?.name || 'N/A',
      m.movementType,
      m.quantity,
      m.reason
    ]);

    autoTable(doc, {
      startY: moveY + 4,
      head: [['#', 'Date', 'Product', 'Type', 'Qty', 'Reason']],
      body: moveData,
      theme: 'grid',
      headStyles: { fillColor: [71, 85, 105], textColor: 255 },
      bodyStyles: { fontSize: 8 }
    });
  }

  addPdfFooter(doc);
  doc.save('dashboard_operations_report.pdf');
};

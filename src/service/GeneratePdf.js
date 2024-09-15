import jsPDF from "jspdf";

export const generatePDF = (props) => {

    if (props.products.price != 0 && props.products.quantity != 0) {



        const doc = new jsPDF();

        // Set font and size for company and memo title
        doc.setFont('Arial', 'normal'); // Arial is the default font
        doc.setFontSize(18);
        doc.text(props.companyName, 105, 20, { align: 'center' }); // Use dynamic company name
        doc.setFontSize(16);
        doc.text('Cash Memo', 105, 30, { align: 'center' });

        // Set font size and style for table headers
        doc.setFontSize(12);
        const startX = 20;
        const startY = 50;
        const rowHeight = 10;
        const colWidths = [70, 30, 35, 35]; // Column widths

        // Set gray background for header
        doc.setFillColor(220, 220, 220);

        // Draw table header with gray background
        doc.rect(startX, startY, colWidths[0], rowHeight, 'F'); // Product Name cell
        doc.rect(startX + colWidths[0], startY, colWidths[1], rowHeight, 'F'); // Price cell
        doc.rect(startX + colWidths[0] + colWidths[1], startY, colWidths[2], rowHeight, 'F'); // Quantity cell
        doc.rect(startX + colWidths[0] + colWidths[1] + colWidths[2], startY, colWidths[3], rowHeight, 'F'); // Total cell

        // Draw borders for the table header
        doc.rect(startX, startY, colWidths[0], rowHeight); // Product Name cell border
        doc.rect(startX + colWidths[0], startY, colWidths[1], rowHeight); // Price cell border
        doc.rect(startX + colWidths[0] + colWidths[1], startY, colWidths[2], rowHeight); // Quantity cell border
        doc.rect(startX + colWidths[0] + colWidths[1] + colWidths[2], startY, colWidths[3], rowHeight); // Total cell border

        // Add text for headers
        doc.setTextColor(0, 0, 0); // Black color
        doc.text('Product Name', startX + 5, startY + 7);
        doc.text('Price', startX + colWidths[0] + 5, startY + 7);
        doc.text('Quantity', startX + colWidths[0] + colWidths[1] + 5, startY + 7);
        doc.text('Total', startX + colWidths[0] + colWidths[1] + colWidths[2] + 5, startY + 7);

        // Table rows
        let currentY = startY + rowHeight;

        props.products.forEach((product) => {
            const total = parseFloat(product.price) * parseInt(product.quantity);

            // Add product data
            doc.text(product.name, startX + 5, currentY + 7);
            doc.text(product.price.toString(), startX + colWidths[0] + 5, currentY + 7);
            doc.text(product.quantity.toString(), startX + colWidths[0] + colWidths[1] + 5, currentY + 7);
            doc.text(total.toString(), startX + colWidths[0] + colWidths[1] + colWidths[2] + 5, currentY + 7);

            // Draw table row borders
            doc.rect(startX, currentY, colWidths[0], rowHeight); // Product Name cell
            doc.rect(startX + colWidths[0], currentY, colWidths[1], rowHeight); // Price cell
            doc.rect(startX + colWidths[0] + colWidths[1], currentY, colWidths[2], rowHeight); // Quantity cell
            doc.rect(startX + colWidths[0] + colWidths[1] + colWidths[2], currentY, colWidths[3], rowHeight); // Total cell

            currentY += rowHeight; // Move to the next row
        });

        // Total amount at the bottom
        doc.setFontSize(12); // Match font size to preview
        
        // Signature line positioned at the bottom right
        doc.setFontSize(12);
        const margin = 20;
        const pageHeight = doc.internal.pageSize.height;
        const signatureY = pageHeight - margin; // Position signature 20 units from bottom
        const signatureX = doc.internal.pageSize.width - margin; // Position signature 20 units from right
        doc.text(`Total Amount: ${props.calculateTotal()}`, signatureX, currentY + 10, { align: 'right' });

        doc.text('Signature: ___________________________', signatureX, signatureY, { align: 'right' });

        // Save the PDF
        doc.save('cash-memo.pdf');
    }
};
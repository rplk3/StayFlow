import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generatePDF = (bookingDetails, transactionId) => {
    const doc = new jsPDF();

    // Booking.com style header
    doc.setFillColor(0, 59, 149); // #003B95
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('Booking Confirmation', 14, 25);

    // Reset text color
    doc.setTextColor(50, 50, 50);

    // Ref number
    doc.setFontSize(12);
    doc.text(`Booking Reference: ${transactionId}`, 14, 55);
    doc.text(`Date of Booking: ${new Date().toLocaleDateString()}`, 14, 65);

    // Hotel Info
    doc.setFontSize(16);
    doc.setTextColor(0, 59, 149);
    doc.text(bookingDetails.hotelName, 14, 85);
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(bookingDetails.location, 14, 93);

    // AutoTable for dates
    autoTable(doc, {
        startY: 105,
        head: [['Check-in', 'Check-out', 'Room Type', 'Guests']],
        body: [
            [
                `${bookingDetails.checkInDate}\n${bookingDetails.checkInTime}`,
                `${bookingDetails.checkOutDate}\n${bookingDetails.checkOutTime}`,
                bookingDetails.roomType,
                `${bookingDetails.guests} guests`
            ]
        ],
        theme: 'grid',
        headStyles: { fillColor: [240, 240, 240], textColor: [50, 50, 50] },
        styles: { fontSize: 10, cellPadding: 5 }
    });

    // Price Table
    autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 15,
        head: [['Description', 'Amount']],
        body: [
            [`Room Charge (${bookingDetails.nights} nights)`, `US$${bookingDetails.basePrice}`],
            ['Taxes and Fees', `US$${bookingDetails.taxes}`],
            ['Payment Method', `${bookingDetails.paymentMethod}`]
        ],
        foot: [['TOTAL PAID', `US$${bookingDetails.total}`]],
        theme: 'grid',
        headStyles: { fillColor: [0, 59, 149], textColor: [255, 255, 255] },
        footStyles: { fillColor: [255, 183, 0], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 12 },
        styles: { fontSize: 11, cellPadding: 6 }
    });

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text('Thank you for booking with Hotel Booking Payment System.', 14, 280);

    doc.save(`receipt-${transactionId}.pdf`);
};

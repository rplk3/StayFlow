const nodemailer = require('nodemailer');

// Create reusable transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Verify connection on startup
transporter.verify()
    .then(() => console.log('✉️  Email service ready (Gmail SMTP)'))
    .catch(err => console.error('❌ Email service failed:', err.message));

/**
 * Send booking confirmation email
 */
const sendBookingConfirmation = async (booking) => {
    const { guestDetails, bookingCode, checkInDate, checkOutDate, guests, nights, pricing } = booking;

    const checkIn = new Date(checkInDate).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
    const checkOut = new Date(checkOutDate).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0; padding:0; background-color:#F4F6F9; font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
        <div style="max-width:600px; margin:0 auto; padding:24px 16px;">
            
            <!-- Header -->
            <div style="background:linear-gradient(135deg,#0F2D52,#1D6FE8); border-radius:16px 16px 0 0; padding:32px 28px; text-align:center;">
                <h1 style="color:#ffffff; font-size:28px; margin:0 0 4px 0; font-weight:800; letter-spacing:-0.5px;">StayFlow</h1>
                <p style="color:#BFDBFE; font-size:13px; margin:0;">Booking Confirmation</p>
            </div>

            <!-- Main Card -->
            <div style="background:#ffffff; padding:28px; border-left:1px solid #e5e7eb; border-right:1px solid #e5e7eb;">
                
                <!-- Success Badge -->
                <div style="text-align:center; margin-bottom:24px;">
                    <div style="display:inline-block; background:#DBEAFE; border-radius:50%; width:56px; height:56px; line-height:56px; font-size:28px; margin-bottom:12px;">✓</div>
                    <h2 style="color:#0F2D52; font-size:22px; margin:0 0 4px 0; font-weight:800;">Booking Confirmed!</h2>
                    <p style="color:#6b7280; font-size:14px; margin:0;">Your reservation has been secured successfully</p>
                </div>

                <!-- Booking Code -->
                <div style="background:#F0F9FF; border:1px solid #DBEAFE; border-radius:12px; padding:16px; text-align:center; margin-bottom:24px;">
                    <p style="color:#1D6FE8; font-size:12px; margin:0 0 4px 0; font-weight:600; text-transform:uppercase; letter-spacing:1px;">Itinerary Code</p>
                    <p style="color:#0F2D52; font-size:28px; font-weight:800; margin:0; letter-spacing:3px;">${bookingCode}</p>
                </div>

                <!-- Guest Info -->
                <div style="margin-bottom:20px;">
                    <p style="color:#0F2D52; font-size:14px; font-weight:700; margin:0 0 8px 0; border-bottom:2px solid #DBEAFE; padding-bottom:6px;">Guest Details</p>
                    <table style="width:100%; font-size:13px; color:#374151;">
                        <tr>
                            <td style="padding:4px 0; color:#9ca3af; width:100px;">Name</td>
                            <td style="padding:4px 0; font-weight:600;">${guestDetails.firstName} ${guestDetails.lastName}</td>
                        </tr>
                        <tr>
                            <td style="padding:4px 0; color:#9ca3af;">Email</td>
                            <td style="padding:4px 0;">${guestDetails.email}</td>
                        </tr>
                        ${guestDetails.phone ? `<tr>
                            <td style="padding:4px 0; color:#9ca3af;">Phone</td>
                            <td style="padding:4px 0;">${guestDetails.phone}</td>
                        </tr>` : ''}
                    </table>
                </div>

                <!-- Stay Details -->
                <div style="margin-bottom:20px;">
                    <p style="color:#0F2D52; font-size:14px; font-weight:700; margin:0 0 8px 0; border-bottom:2px solid #DBEAFE; padding-bottom:6px;">Stay Details</p>
                    <table style="width:100%; border-collapse:collapse;">
                        <tr>
                            <td style="padding:10px 12px; background:#F9FAFB; border-radius:8px 0 0 0; border:1px solid #f3f4f6; width:50%;">
                                <p style="color:#9ca3af; font-size:11px; margin:0 0 2px 0; text-transform:uppercase; letter-spacing:0.5px;">Check-in</p>
                                <p style="color:#0F2D52; font-size:14px; font-weight:700; margin:0;">${checkIn}</p>
                            </td>
                            <td style="padding:10px 12px; background:#F9FAFB; border-radius:0 8px 0 0; border:1px solid #f3f4f6;">
                                <p style="color:#9ca3af; font-size:11px; margin:0 0 2px 0; text-transform:uppercase; letter-spacing:0.5px;">Check-out</p>
                                <p style="color:#0F2D52; font-size:14px; font-weight:700; margin:0;">${checkOut}</p>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding:10px 12px; background:#F9FAFB; border-radius:0 0 0 8px; border:1px solid #f3f4f6;">
                                <p style="color:#9ca3af; font-size:11px; margin:0 0 2px 0; text-transform:uppercase; letter-spacing:0.5px;">Guests</p>
                                <p style="color:#0F2D52; font-size:14px; font-weight:700; margin:0;">${guests}</p>
                            </td>
                            <td style="padding:10px 12px; background:#F9FAFB; border-radius:0 0 8px 0; border:1px solid #f3f4f6;">
                                <p style="color:#9ca3af; font-size:11px; margin:0 0 2px 0; text-transform:uppercase; letter-spacing:0.5px;">Duration</p>
                                <p style="color:#0F2D52; font-size:14px; font-weight:700; margin:0;">${nights} Night${nights > 1 ? 's' : ''}</p>
                            </td>
                        </tr>
                    </table>
                </div>

                <!-- Pricing -->
                ${pricing ? `
                <div style="margin-bottom:20px;">
                    <p style="color:#0F2D52; font-size:14px; font-weight:700; margin:0 0 8px 0; border-bottom:2px solid #DBEAFE; padding-bottom:6px;">Payment Summary</p>
                    <table style="width:100%; font-size:13px; color:#374151;">
                        <tr>
                            <td style="padding:6px 0;">Room Charges</td>
                            <td style="padding:6px 0; text-align:right; font-weight:600;">Rs. ${Math.round(pricing.roomTotal || 0).toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td style="padding:6px 0;">Taxes & Fees</td>
                            <td style="padding:6px 0; text-align:right; font-weight:600;">Rs. ${Math.round(pricing.taxesFees || 0).toLocaleString()}</td>
                        </tr>
                        ${pricing.discount > 0 ? `<tr>
                            <td style="padding:6px 0; color:#16A34A;">Discount</td>
                            <td style="padding:6px 0; text-align:right; font-weight:600; color:#16A34A;">- Rs. ${Math.round(pricing.discount).toLocaleString()}</td>
                        </tr>` : ''}
                        <tr>
                            <td colspan="2" style="padding:0;"><hr style="border:none; border-top:1px solid #e5e7eb; margin:6px 0;"></td>
                        </tr>
                        <tr>
                            <td style="padding:8px 0; font-weight:800; color:#0F2D52; font-size:15px;">Total</td>
                            <td style="padding:8px 0; text-align:right; font-weight:800; color:#0F2D52; font-size:18px;">Rs. ${Math.round(pricing.totalAmount || 0).toLocaleString()}</td>
                        </tr>
                    </table>
                </div>
                ` : ''}

                <!-- CTA -->
                <div style="text-align:center; margin-top:24px;">
                    <p style="color:#6b7280; font-size:12px; margin:0 0 16px 0;">Keep this email for your records. Present your booking code at check-in.</p>
                </div>
            </div>

            <!-- Footer -->
            <div style="background:#0F2D52; border-radius:0 0 16px 16px; padding:20px 28px; text-align:center;">
                <p style="color:#BFDBFE; font-size:11px; margin:0 0 4px 0;">StayFlow | Premium Hotel Bookings</p>
                <p style="color:#60A5FA; font-size:11px; margin:0;">support@stayflow.com | +94 11 234 5678</p>
                <p style="color:#4b5563; font-size:10px; margin:12px 0 0 0;">This is an automated email. Please do not reply directly.</p>
            </div>
        </div>
    </body>
    </html>
    `;

    try {
        await transporter.sendMail({
            from: `"StayFlow" <${process.env.EMAIL_USER}>`,
            to: guestDetails.email,
            subject: `✅ Booking Confirmed - ${bookingCode} | StayFlow`,
            html
        });
        console.log(`✉️  Confirmation email sent to ${guestDetails.email} for ${bookingCode}`);
        return true;
    } catch (err) {
        console.error(`❌ Failed to send email to ${guestDetails.email}:`, err.message);
        return false;
    }
};

module.exports = { sendBookingConfirmation };

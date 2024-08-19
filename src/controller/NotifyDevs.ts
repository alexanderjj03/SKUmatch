import nodemailer from 'nodemailer';

// Create a transport for sending emails (replace with your email service's data)
const transporter = nodemailer.createTransport({
    service: 'Gmail', // Use your email service
    auth: {
        user: 'xander.jacobson@gmail.com', // Your email address
        pass: 'gyclqzcqpwhnmqyi', // Your password
    },
});

export async function sendEmail(query: any, result: string[], date: Date): Promise<void> {
    const mailOptions = {
        from: 'xander.jacobson@gmail.com', // Sender
        to: 'xander.jacobson@gmail.com', // Recipient
        subject: 'Notification of failed query', // Email subject
        html: "<!DOCTYPE html>\n" +
            "<html lang=\"en\">\n" +
            "<head>\n" +
            "  <meta charset=\"UTF-8\">\n" +
            "  <title>Email Example</title>\n" +
            "  <style>\n" +
            "  </style>\n" +
            "</head>\n" +
            "<body>\n" +
            "  <h1>Notification of failed query</h1>\n" +
            "  <p> Query: " + JSON.stringify(query) + "</p>\n" +
            "  <p> Result: " + result + "</p>\n" +
            "</body>\n" +
            "</html> ",
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Email sending failed:', error);
        } else {
            console.log("sent");
        }
    });
}
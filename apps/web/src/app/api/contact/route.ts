import { sendEmail } from "@/utils/server/mail.service";
import type { NextRequest } from "next/server";

export const POST = async (request: NextRequest) => { 
    const data = await request.json();
    const { name, email, message, subject } = data;
    const companyEmail = "brinkifydev@gmail.com";

    //send to the company email
    const info = `Message from: ${name} (${email}) <br/><br/> ${message}`;
    sendEmail({ email: companyEmail, name }, {
        subject: subject + " (Contact Form Submission) from " + name,
        message: info
    })

    //send to the user as confirmation
    const userInfo = `Dear ${name},<br/>Thank you for reaching out to us.<br/> We have received your message and will get back to you shortly.<br/><br/>Best regards,<br/>The Team`;
    sendEmail({ email, name }, {
        subject: "Contact Form Submission Confirmation",
        message: `<p>${userInfo}</p>`,
    })

    return new Response(JSON.stringify({ message: "Contact form submitted successfully!" }),{status: 200});
}
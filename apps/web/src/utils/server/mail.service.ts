
import Mailjet from 'node-mailjet'

//mail user class, used when sending emails
export type MailUser = {
    email: string;
    name: string;
}

export interface Mail{
    subject: string;
    message?: string
	
}
interface MailWithParts extends Mail{
	htmlPart: string;
	textPart: string;
}




//the main function to be called
export function sendEmail(user: MailUser | MailUser, mail: Mail) {
	//initialize mailjet client
	const mailjet = Mailjet.apiConnect(
	process.env.MJ_APIKEY_PUBLIC!,
	process.env.MJ_APIKEY_PRIVATE!
	);

	const sender = { email: 'brinkifydev@gmail.com', name: 'Brinkify SA' };
	const htmlPart = mail.message ? emailTemplate(mail.message, user.name, 'https://brinkifysa.netlify.app/') : '';
	
	request(sender, user, {
		htmlPart,
		subject: mail.subject,
		textPart: htmlPart.replace(/<[^>]+>/g, ''), //strip html tags for text part
	})
		.then((result: any) => {
			return result.body;
		})
		.catch((err: any) => {
			return err;
		})
	
	//helper
	function request(from: MailUser, to: MailUser, mail: MailWithParts) {
		return mailjet
			.post('send', { version: 'v3.1' })
			.request({
				Messages: [
					{
						From: {
							Email: from.email,
							Name:from.name
						},
						To: [
							{
								Email: to.email,
								Name: to.email
							}
						],
						Subject: mail.subject,
						TextPart: mail.textPart,
						HTMLPart: mail.htmlPart
					}
				]
		})
	}
}






const logo = 'https://raw.githubusercontent.com/Brinkify-SA/brinkify/refs/heads/main/apps/web/public/images/BrinkifySA.png'; // Logo URL

const emailTemplate = (message: string, name: string, url: string) => `
  <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap" rel="stylesheet">
    <title>Email Notification</title>
    <style>
        body {
            font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
            background-color: #f7f7f7;
            margin: 0;
            padding: 0;
            line-height: 1.6;
            color: #333333;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .container {
            padding: 40px 30px;
            text-align: left;
        }
        .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 1px solid #e5e5e5;
        }
        .logo {
            max-width: 180px;
            height: auto;
            display: block;
            margin: 0 auto;
            border-radius: 4px;
        }
        h2 {
            font-size: 24px;
            color: #1a3c6e;
            margin: 20px 0 15px;
            font-weight: 600;
        }
        p {
            font-size: 16px;
            color: #4a4a4a;
            margin: 10px 0;
        }
        a {
            color: #005b99;
            text-decoration: none;
            font-weight: 500;
        }
        a:hover {
            text-decoration: underline;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e5e5;
            font-size: 12px;
            color: #6b7280;
            text-align: center;
        }
        .footer a {
            color: #6b7280;
        }
        /* Ensure responsiveness */
        @media only screen and (max-width: 600px) {
            table {
                width: 90%;
            }
            .container {
                padding: 20px;
            }
            .logo {
                max-width: 150px;
            }
            h2 {
                font-size: 20px;
            }
            p {
                font-size: 14px;
            }
        }
    </style>
</head>
<body>
    <table role="presentation">
        <tr>
            <td class="container">
                <div class="header">
                    <img src="${logo}" alt="Brinkify Logo" class="logo" />
                </div>
                <h2>Dear, ${name}</h2>
                <p>${message}</p>
                <p>This message was sent from the Brinkify SA website: <a href="${url}">${url}</a></p>
                <div class="footer">
                    <p>&copy; ${new Date().getFullYear()} Brinkify SA. All rights reserved.</p>
                    <p><a href="${url}">Visit our website</a></p>
                </div>
            </td>
        </tr>
    </table>
</body>
</html>
`;


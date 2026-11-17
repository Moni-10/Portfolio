# Moni Kashyap · Portfolio

Personal portfolio of Moni Kashyap, full stack developer in Delhi. It covers business websites, online stores, and business software (a Laravel CRM and a React blog admin panel).

Plain HTML, CSS and JavaScript, plus one Vercel function for the contact form. There is no build step.

- `index.html`: page content
- `styles.css`: layout and the dark and light themes (dark is the default)
- `script.js`: project data, hero preview, screenshot tabs, theme toggle, mobile menu, scroll animations and contact form
- `bg.js`: Three.js animated background (loaded from cdnjs)
- `api/contact.js`: Vercel function that emails contact form messages over SMTP (nodemailer)
- `assets/shots`: website screenshots
- `assets/apps`: CRM and blog admin screenshots (sample data)

## Contact form setup (Vercel)

Add these under Project > Settings > Environment Variables, then redeploy. See `.env.example`.

| Name | Value |
| --- | --- |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `465` |
| `SMTP_USER` | the Gmail address that sends the mail |
| `SMTP_PASS` | a Gmail App Password (Google Account > Security > 2-Step Verification > App passwords) |
| `CONTACT_TO_EMAIL` | where messages should arrive |

If these aren't set (or the site runs somewhere without the function), the form falls back to [FormSubmit](https://formsubmit.co), which emails monikashyap902@gmail.com directly. The first message sent that way triggers a one-time activation email from FormSubmit; click the link in it once and later messages arrive normally.

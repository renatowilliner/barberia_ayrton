package services

import (
	"bytes"
	"html/template"
	"log"

	"gopkg.in/gomail.v2"
)

type EmailService struct {
	dialer *gomail.Dialer
	from   string
	isDev  bool
}

func NewEmailService(host string, port int, user, password, from string) *EmailService {
	var d *gomail.Dialer
	isDev := false

	if host == "" {
		isDev = true
		log.Println("EmailService: No SMTP host provided. Emails will be logged to stdout.")
	} else {
		d = gomail.NewDialer(host, port, user, password)
	}

	return &EmailService{
		dialer: d,
		from:   from,
		isDev:  isDev,
	}
}

const verificationTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Verifica tu Email - Barbería TON</title>
    <style>
        body { font-family: 'Arial', sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; color: #333; }
        .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
        .header { background-color: #000; color: #fff; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; letter-spacing: 2px; text-transform: uppercase; }
        .content { padding: 40px 30px; text-align: center; }
        .content p { font-size: 16px; line-height: 1.6; color: #555; }
        .btn { display: inline-block; background-color: #000; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 4px; font-weight: bold; margin-top: 20px; transition: background-color 0.3s; }
        .btn:hover { background-color: #333; }
        .footer { background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>TON</h1>
        </div>
        <div class="content">
            <h2>Bienvenido a la experiencia TON</h2>
            <p>Hola <strong>{{.Name}}</strong>,</p>
            <p>Gracias por registrarte. Para completar tu cuenta y reservar tu primer turno, por favor verifica tu dirección de correo electrónico.</p>
            <a href="{{.Link}}" class="btn">Verificar Email</a>
            <p style="margin-top: 30px; font-size: 14px;">Si no creaste esta cuenta, puedes ignorar este mensaje.</p>
        </div>
        <div class="footer">
            <p>&copy; 2026 Barbería TON. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>
`

func (s *EmailService) SendVerificationEmail(to, name, link string) error {
	t, err := template.New("email").Parse(verificationTemplate)
	if err != nil {
		return err
	}

	var body bytes.Buffer
	if err := t.Execute(&body, map[string]string{"Name": name, "Link": link}); err != nil {
		return err
	}

	m := gomail.NewMessage()
	m.SetHeader("From", s.from)
	m.SetHeader("To", to)
	m.SetHeader("Subject", "Verifica tu cuenta - Barbería TON")
	m.SetBody("text/html", body.String())

	m.SetBody("text/html", body.String())

	if s.isDev {
		log.Printf("=== [DEV EMAIL] To: %s ===\nSubject: %s\nLink: %s\n==============================\n", to, "Verifica tu cuenta - Barbería TON", link)
		return nil
	}

	if err := s.dialer.DialAndSend(m); err != nil {
		log.Printf("Failed to send email to %s: %v", to, err)
		return err
	}

	return nil
}

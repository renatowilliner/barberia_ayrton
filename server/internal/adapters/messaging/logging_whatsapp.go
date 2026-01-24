package messaging

import (
    "context"
    "log"

    "github.com/renatowilliner/barberia_ayrton/server/internal/core/ports"
)

type LoggingWhatsApp struct{}

func NewLoggingWhatsApp() ports.MessagingService {
    return &LoggingWhatsApp{}
}

func (l *LoggingWhatsApp) SendWhatsApp(ctx context.Context, phone string, message string) error {
    log.Printf("[WhatsApp] Sending message to %s: %s", phone, message)
    return nil
}

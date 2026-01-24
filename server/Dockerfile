# Build Stage
FROM golang:1.23-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -o main ./cmd/api

# Final Stage
FROM alpine:latest

WORKDIR /root/

COPY --from=builder /app/main .
COPY --from=builder /app/sql ./sql

# Expose port
EXPOSE 8080

# Environment variables to be set in runtime
# ENV DATABASE_URL=...
# ENV PORT=8080

CMD ["./main"]

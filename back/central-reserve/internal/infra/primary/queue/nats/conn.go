package nats

import (
	"central_reserve/internal/pkg/env"
	"central_reserve/internal/pkg/log"
	"fmt"
	"time"

	"github.com/nats-io/nats.go"
)

type INatsClient interface {
	Publish(subject string, data []byte) error
	Subscribe(subject string, durable string, handler nats.MsgHandler) (*nats.Subscription, error)
	Close()
}

type NatsClient struct {
	conn   *nats.Conn
	js     nats.JetStreamContext
	logger log.ILogger
}

func New(config env.IConfig, logger log.ILogger) INatsClient {
	url := fmt.Sprintf("nats://%s:%s@%s:%s",
		config.Get("NATS_USER"),
		config.Get("NATS_PASS"),
		config.Get("NATS_HOST"),
		config.Get("NATS_PORT"),
	)

	conn, err := nats.Connect(url,
		nats.Timeout(5*time.Second),
		nats.RetryOnFailedConnect(true),
		nats.MaxReconnects(10),
		nats.ReconnectWait(2*time.Second),
	)
	if err != nil {
		logger.Error(nil).Err(err).Msg("Error conectando a NATS")
		return nil
	}

	if !conn.IsConnected() {
		logger.Error().Err(err).Msg("No se pudo conectar a NATS")
		conn.Close()
		return nil
	}

	js, err := conn.JetStream()
	if err != nil {
		logger.Error(nil).Err(err).Msg("Error inicializando JetStream")
		conn.Close()
		return nil
	}

	return &NatsClient{
		conn:   conn,
		js:     js,
		logger: logger,
	}
}

func (n *NatsClient) Publish(subject string, data []byte) error {
	_, err := n.js.Publish(subject, data)
	if err != nil {
		n.logger.Error(nil).Err(err).Str("subject", subject).Msg("Error publicando en NATS")
	}
	return err
}

func (n *NatsClient) Subscribe(subject string, durable string, handler nats.MsgHandler) (*nats.Subscription, error) {
	sub, err := n.js.Subscribe(subject, handler,
		nats.Durable(durable),
		nats.ManualAck(),
		nats.AckExplicit(),
	)
	if err != nil {
		n.logger.Error(nil).Err(err).Str("subject", subject).Msg("Error suscribiendo en NATS")
	}
	return sub, err
}

func (n *NatsClient) Close() {
	if n.conn != nil {
		n.conn.Close()
	}
}

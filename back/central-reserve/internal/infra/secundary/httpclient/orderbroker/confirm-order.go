package orderbroker

import "context"

func (c *Client) ConfirmOrder(ctx context.Context, id string) error {
	body := map[string]string{"order_id": id}
	return c.postJSON(ctx, "/confirm", body, nil)
}

package orderbroker

import (
	"bytes"
	"central_reserve/internal/infra/secundary/httpclient/orderbroker/request"
	"context"
	"mime/multipart"
	"net/http"
)

func (c *Client) UploadFile(ctx context.Context, req request.UploadFileReq) error {
	buf := new(bytes.Buffer)
	writer := multipart.NewWriter(buf)

	if err := addFile(writer, "file", req.FileName, req.FileReader); err != nil {
		return err
	}

	_ = writer.WriteField("order_id", req.OrderId)
	_ = writer.WriteField("note", req.Note)

	if err := writer.Close(); err != nil {
		return err
	}

	requestURL := c.baseURL + "/upload-file"
	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, requestURL, buf)
	if err != nil {
		return err
	}
	httpReq.Header.Set("Content-Type", writer.FormDataContentType())

	return c.doRequest(httpReq, nil)
}

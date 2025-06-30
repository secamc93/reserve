package request

import "io"

type UploadFileReq struct {
	OrderId    string    `json:"order_id"`
	Note       string    `json:"note"`
	FileName   string    `json:"file_name"`
	FileReader io.Reader `json:"file"`
}

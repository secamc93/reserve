package request

import "time"

type CreateOrderReq struct {
	BusinessID                 string            `json:"business_id" validate:"required"`
	ExternalOrderID            *string           `json:"external_order_id"`
	ExternalIntegrationID      *int              `json:"external_integration_id"`
	OrderNumber                *string           `json:"order_number"`
	IntegrationTypeId          *int              `json:"integration_type_id"`
	OrderTypeID                uint              `json:"order_type_id"`
	OrderType                  string            `json:"order_type"`
	TotalShipment              float64           `json:"total_shipment"`
	TrackingNumber             *string           `json:"tracking_number"`
	PaymentMethodId            int               `json:"payment_method_id" validate:"required,gt=0,lte=4"`
	IsPaid                     *bool             `json:"is_paid"`
	CountryId                  *int              `json:"country_id"`
	CityDaneId                 *int              `json:"city_dane_id"`
	WarehouseId                *int              `json:"warehouse_id"`
	ExtraData                  any               `json:"extra_data"`
	Customer                   CustomerOrderReq  `json:"customer"`
	Shipping                   ShippingOrderReq  `json:"shipping"`
	OriginShipping             *ShippingOrderReq `json:"origin_shipping"`
	Products                   []ProductOrderReq `json:"items" validate:"required,min=1,dive"`
	Notes                      []string          `json:"notes" validate:"max=5"`
	CodTotal                   *float64          `json:"cod_total"`
	DeliveryDate               *time.Time        `json:"delivery_date"`
	Coupon                     *string           `json:"coupon"`
	SiigoInvoiceId             *string           `json:"siigo_invoice_id"`
	DeliveryProviderTypeZoneId *int              `json:"delivery_provider_type_zone_id"`
	Discount                   float64           `json:"discount"`
	PaymentType                string            `json:"payment_type"`
	PaymentTypeId              *int              `json:"payment_type_id"`
	Total                      *float64          `json:"total"`
	Boxes                      int               `json:"boxes"`
	OrderStatusID              int               `json:"status_id"`
}

type CustomerOrderReq struct {
	FullName          string `json:"full_name"`
	MobilePhoneNumber string `json:"mobile_phone_number"`
	DocumentTypeId    int    `json:"document_type_id"`
	Dni               string `json:"dni"`
	Email             string `json:"email"`
}

type ShippingOrderReq struct {
	Country           string   `json:"country"`
	State             string   `json:"state" validate:"required"`
	City              string   `json:"city" validate:"required"`
	Address           string   `json:"address" validate:"required"`
	AddressLine       string   `json:"address_line"`
	MobilePhoneNumber string   `json:"mobile_phone_number"`
	FullName          string   `json:"full_name"`
	Zip               string   `json:"zip"`
	Lat               *float64 `json:"lat"`
	Lng               *float64 `json:"lng"`
	CityDaneId        *int     `json:"city_dane_id"`
}

type ProductOrderReq struct {
	ProductID         *string           `json:"product_id"`
	Sku               *string           `json:"sku"`
	ExternalId        *string           `json:"external_id"`
	Name              string            `json:"name"`
	Notes             *string           `json:"notes"`
	Large             *float64          `json:"large"`
	Width             *float64          `json:"width"`
	Height            *float64          `json:"height"`
	Weight            *float64          `json:"weight"`
	MeasurementUnitId int64             `json:"measurement_unit_id"`
	Description       string            `json:"description"`
	Quantity          int               `json:"quantity"`
	Price             float64           `json:"price"`
	Discount          float64           `json:"discount"`
	Tax               *float64          `json:"tax" validate:"omitempty,min=0,max=100"`
	Items             []ProductOrderReq `json:"items" validate:"omitempty,dive"`
	IsCustomKit       bool              `json:"is_custom_kit"`
	Active            bool              `json:"active"`
}

type CancelOrderReq struct {
	OrderId string `json:"order_id" validate:"required"`
	Reason  string `json:"reason"`
	UserId  *int   `json:"user_id"`
}

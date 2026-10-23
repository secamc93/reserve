package mappers

import (
	"central_reserve/services/horizontalproperty/votingbilling/internal/domain/dtos"
	"central_reserve/services/horizontalproperty/votingbilling/internal/domain/entities"
	"central_reserve/services/horizontalproperty/votingbilling/internal/infra/primary/handlers/response"
)

// ToDayPayment convierte una compra de días a la respuesta HTTP.
func ToDayPayment(p entities.DayPayment) response.DayPayment {
	dates := p.Dates
	if dates == nil {
		dates = []string{}
	}
	return response.DayPayment{
		ID: p.ID, Reference: p.Reference, Source: p.Source, Dates: dates, AmountInCents: p.AmountInCents,
		Currency: p.Currency, Status: p.Status, PaymentMethodType: p.PaymentMethodType, PaidAt: p.PaidAt,
		Notes: p.Notes, CreatedAt: p.CreatedAt,
	}
}

// ToCoverage convierte la cobertura a la respuesta HTTP.
func ToCoverage(c *dtos.Coverage) response.Coverage {
	out := response.Coverage{
		BusinessID: c.BusinessID, Today: c.Today, TodayCovered: c.TodayCovered,
		PropertyExempt: c.PropertyExempt, AdminExempt: c.AdminExempt,
		PurchasedDates: nonNil(c.PurchasedDates), PricePerDayCOP: c.PricePerDayCOP, GatewayEnabled: c.GatewayEnabled,
		Assemblies: make([]response.Assembly, len(c.Assemblies)), RecentPurchases: make([]response.DayPayment, len(c.RecentPurchases)),
	}
	if c.Membership != nil {
		out.Membership = &response.Membership{PlanCode: c.Membership.PlanCode, EndsAt: c.Membership.EndsAt}
	}
	for i, a := range c.Assemblies {
		out.Assemblies[i] = response.Assembly{GroupID: a.GroupID, Name: a.Name, Dates: nonNil(a.Dates), UncoveredDates: nonNil(a.UncoveredDates)}
	}
	for i, p := range c.RecentPurchases {
		out.RecentPurchases[i] = ToDayPayment(p)
	}
	return out
}

// ToPropertyAdmins convierte los administradores a la respuesta HTTP.
func ToPropertyAdmins(admins []entities.PropertyAdmin) []response.PropertyAdmin {
	out := make([]response.PropertyAdmin, len(admins))
	for i, a := range admins {
		out[i] = response.PropertyAdmin{UserID: a.UserID, Name: a.Name, Email: a.Email, Exempt: a.Exempt}
	}
	return out
}

func nonNil(s []string) []string {
	if s == nil {
		return []string{}
	}
	return s
}

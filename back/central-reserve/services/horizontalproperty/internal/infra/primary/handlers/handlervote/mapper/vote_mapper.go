package mapper

import "central_reserve/services/horizontalproperty/internal/domain"

func MapCreateGroupReqToDTO(businessID uint, reqName string, reqDescription string, startAt, endAt interface{}, requiresQuorum bool, quorum *float64, createdBy *uint, notes string) domain.CreateVotingGroupDTO {
	// Los controladores construirán los tipos de tiempo correctos;
	// este mapper queda sencillo por ahora para mantener la arquitectura similar.
	return domain.CreateVotingGroupDTO{}
}

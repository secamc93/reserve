package domain

import "errors"

var (
	ErrVotingGroupNotFound     = errors.New("grupo de votación no encontrado")
	ErrVotingNotFound          = errors.New("votación no encontrada")
	ErrVotingOptionNotFound    = errors.New("opción de votación no encontrada")
	ErrVoteNotFound            = errors.New("voto no encontrado")
	ErrUnitAlreadyVoted        = errors.New("la unidad ya votó en esta votación")
	ErrUnitWithoutAttendance   = errors.New("unidad no registra asistencia")
	ErrOptionNotInVoting       = errors.New("la opción no pertenece a esta votación")
	ErrUnitNotInVotingBusiness = errors.New("la unidad no pertenece a la propiedad de la votación")
	ErrResidentNotFound        = errors.New("residente no encontrado")
	ErrInvalidVotingToken      = errors.New("token de votación inválido")
)

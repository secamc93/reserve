package domain

import "errors"

var (
	ErrVotingGroupNotFound   = errors.New("grupo de votación no encontrado")
	ErrVotingNotFound        = errors.New("votación no encontrada")
	ErrVotingOptionNotFound  = errors.New("opción de votación no encontrada")
	ErrVoteNotFound          = errors.New("voto no encontrado")
	ErrUnitAlreadyVoted      = errors.New("la unidad ya votó en esta votación")
	ErrUnitWithoutAttendance = errors.New("unidad no registra asistencia")
	ErrResidentNotFound      = errors.New("residente no encontrado")
	ErrInvalidVotingToken    = errors.New("token de votación inválido")
)

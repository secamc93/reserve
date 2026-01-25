package models

import "time"

// RoomModel representa la estructura de persistencia de una sala
type RoomModel struct {
	ID          uint       `gorm:"primaryKey;autoIncrement"`
	BusinessID  uint       `gorm:"not null;index"`
	Name        string     `gorm:"type:varchar(255);not null"`
	Code        string     `gorm:"type:varchar(50);not null;uniqueIndex:idx_room_code_business"`
	Description string     `gorm:"type:text"`
	Capacity    int        `gorm:"not null;default:0"`
	IsActive    bool       `gorm:"not null;default:true"`
	MinCapacity int        `gorm:"not null;default:0"`
	MaxCapacity int        `gorm:"not null;default:0"`
	CreatedAt   time.Time  `gorm:"autoCreateTime"`
	UpdatedAt   time.Time  `gorm:"autoUpdateTime"`
	DeletedAt   *time.Time `gorm:"index"`
}

// TableName especifica el nombre de la tabla en la base de datos
func (RoomModel) TableName() string {
	return "room"
}

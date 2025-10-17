package request

import "time"

type CreateVotingGroupRequest struct {
	Name             string    `json:"name" binding:"required,min=3,max=150"`
	Description      string    `json:"description" binding:"max=1000"`
	VotingStartDate  time.Time `json:"voting_start_date" binding:"required"`
	VotingEndDate    time.Time `json:"voting_end_date" binding:"required"`
	RequiresQuorum   bool      `json:"requires_quorum"`
	QuorumPercentage *float64  `json:"quorum_percentage"`
	CreatedByUserID  *uint     `json:"created_by_user_id"`
	Notes            string    `json:"notes" binding:"max=2000"`
}

type CreateVotingRequest struct {
	Title              string   `json:"title" binding:"required,min=3,max=200"`
	Description        string   `json:"description" binding:"required,max=2000"`
	VotingType         string   `json:"voting_type" binding:"required,oneof=simple majority unanimity"`
	IsSecret           bool     `json:"is_secret"`
	AllowAbstention    bool     `json:"allow_abstention"`
	DisplayOrder       int      `json:"display_order" binding:"min=1"`
	RequiredPercentage *float64 `json:"required_percentage"`
}

type CreateVotingOptionRequest struct {
	OptionText   string `json:"option_text" binding:"required,min=1,max=100"`
	OptionCode   string `json:"option_code" binding:"required,min=1,max=20"`
	Color        string `json:"color" binding:"required,hexcolor"`
	DisplayOrder int    `json:"display_order" binding:"min=1"`
}

type CreateVoteRequest struct {
	PropertyUnitID uint   `json:"property_unit_id" binding:"required"`
	VotingOptionID uint   `json:"voting_option_id" binding:"required"`
	IPAddress      string `json:"ip_address"`
	UserAgent      string `json:"user_agent"`
}

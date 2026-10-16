package mappers_test

import (
	"encoding/json"
	"strings"
	"testing"

	"central_reserve/services/horizontalproperty/vote/internal/domain"
	"central_reserve/services/horizontalproperty/vote/internal/infra/primary/handlers/mappers"
)

func TestMapVotingGroup_RequireDocumentValidationEnJSON(t *testing.T) {
	for _, flag := range []bool{true, false} {
		resp := mappers.MapVotingGroupDTOToResponse(&domain.VotingGroupDTO{ID: 1, Name: "G", RequireDocumentValidation: flag})
		if resp.RequireDocumentValidation != flag {
			t.Fatalf("mapper perdió la bandera %v", flag)
		}
		b, _ := json.Marshal(resp)
		want := `"require_document_validation":false`
		if flag {
			want = `"require_document_validation":true`
		}
		// Debe salir siempre (también en false): el front lo usa para decidir si pide documento.
		if !strings.Contains(string(b), want) {
			t.Errorf("JSON sin %s: %s", want, b)
		}
	}
	list := mappers.MapVotingGroupDTOsToResponses([]domain.VotingGroupDTO{{ID: 1, RequireDocumentValidation: true}, {ID: 2}})
	if !list[0].RequireDocumentValidation || list[1].RequireDocumentValidation {
		t.Errorf("lista mal mapeada: %+v", list)
	}
}

module reserve/testing

go 1.23.0

require (
	reserve/testing/modules/residents v0.0.0
	reserve/testing/modules/unit v0.0.0
)

replace reserve/testing/modules/residents => ./modules/residents

replace reserve/testing/modules/unit => ./modules/unit

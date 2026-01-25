module reserve/testing

go 1.23.0

require (
	github.com/joho/godotenv v1.5.1
	github.com/rs/zerolog v1.34.0
	gorm.io/driver/postgres v1.6.0
	gorm.io/gorm v1.31.1
	reserve/testing/modules/residents v0.0.0
	reserve/testing/modules/unit v0.0.0
	reserve/testing/modules/visit v0.0.0
)

require (
	github.com/jackc/pgpassfile v1.0.0 // indirect
	github.com/jackc/pgservicefile v0.0.0-20240606120523-5a60cdf6a761 // indirect
	github.com/jackc/pgx/v5 v5.6.0 // indirect
	github.com/jackc/puddle/v2 v2.2.2 // indirect
	github.com/jinzhu/inflection v1.0.0 // indirect
	github.com/jinzhu/now v1.1.5 // indirect
	github.com/mattn/go-colorable v0.1.13 // indirect
	github.com/mattn/go-isatty v0.0.19 // indirect
	golang.org/x/crypto v0.31.0 // indirect
	golang.org/x/sync v0.10.0 // indirect
	golang.org/x/sys v0.28.0 // indirect
	golang.org/x/text v0.21.0 // indirect
)

replace reserve/testing/modules/residents => ./modules/residents

replace reserve/testing/modules/unit => ./modules/unit

replace reserve/testing/modules/visit => ./modules/visit

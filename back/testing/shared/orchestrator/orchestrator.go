package orchestrator

import (
	"bufio"
	"context"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"reserve/testing/shared/auth"
	"reserve/testing/shared/client"
	"reserve/testing/shared/config"
	"reserve/testing/shared/db"
	"reserve/testing/shared/env"
	"reserve/testing/shared/log"

	"github.com/joho/godotenv"
)

// Context contiene el contexto compartido entre módulos
type Context struct {
	Client     *client.Client
	DB         db.IDatabase
	Logger     log.ILogger
	Config     env.IConfig
	BusinessID uint
	Token      string
}

// Orchestrator maneja la autenticación y selección de módulos
type Orchestrator struct {
	client      *client.Client
	db          db.IDatabase
	logger      log.ILogger
	config      env.IConfig
	authService *auth.Service
	loginResult *auth.LoginResult
	businessID  uint
	bizToken    string
}

// New crea una nueva instancia del orquestador
func New() *Orchestrator {
	return &Orchestrator{}
}

// Initialize inicializa el orquestador (env, logger, db, client)
func (o *Orchestrator) Initialize() error {
	fmt.Println("\n" + strings.Repeat("═", 60))
	fmt.Println("🧪 RESERVE TESTING SUITE")
	fmt.Println(strings.Repeat("═", 60))

	// Cargar .env
	if err := o.loadEnv(); err != nil {
		fmt.Printf("⚠️  Advertencia: No se pudo cargar .env: %v\n", err)
	}

	// Inicializar logger y config
	o.logger = log.New()
	o.config = env.New(o.logger)

	// Conectar a BD
	o.db = db.New(o.logger, o.config)

	// Cliente HTTP con pretty print habilitado
	o.client = client.New()
	o.client.EnablePrettyPrint()

	// Servicio de autenticación
	o.authService = auth.New(o.client)

	return nil
}

// Authenticate maneja el flujo completo de autenticación
func (o *Orchestrator) Authenticate() error {
	// 1. Seleccionar usuario
	users := config.GetAvailableUsers()
	if len(users) == 0 {
		return fmt.Errorf("no hay usuarios configurados en .env")
	}

	userConfig, err := o.selectUser(users)
	if err != nil {
		return err
	}

	// 2. Login
	if err := o.performLogin(userConfig); err != nil {
		return err
	}

	// 3. Verificar super admin
	if !o.loginResult.IsSuperAdmin {
		return fmt.Errorf("acceso denegado: solo Super Administradores pueden acceder")
	}

	// 4. Seleccionar tipo de negocio y business
	if err := o.selectBusiness(); err != nil {
		return err
	}

	return nil
}

// GetContext devuelve el contexto para los módulos
func (o *Orchestrator) GetContext() *Context {
	return &Context{
		Client:     o.client,
		DB:         o.db,
		Logger:     o.logger,
		Config:     o.config,
		BusinessID: o.businessID,
		Token:      o.bizToken,
	}
}

// Close cierra recursos
func (o *Orchestrator) Close() {
	if o.db != nil {
		o.db.Close()
	}
}

func (o *Orchestrator) loadEnv() error {
	if err := godotenv.Load(".env"); err == nil {
		return nil
	}

	cwd, _ := os.Getwd()
	for i := 0; i < 5; i++ {
		envPath := filepath.Join(cwd, ".env")
		if _, err := os.Stat(envPath); err == nil {
			return godotenv.Load(envPath)
		}
		cwd = filepath.Dir(cwd)
	}

	return fmt.Errorf("archivo .env no encontrado")
}

func (o *Orchestrator) selectUser(users []config.UserConfig) (*config.UserConfig, error) {
	fmt.Println("\n" + strings.Repeat("═", 60))
	fmt.Println("👤 USUARIOS DISPONIBLES")
	fmt.Println(strings.Repeat("═", 60))
	fmt.Println()

	for _, user := range users {
		displayName := user.Name
		if displayName == "" {
			displayName = user.Email
		}
		fmt.Printf("  [%d] %s\n", user.Number, displayName)
		fmt.Printf("      Email: %s\n", user.Email)
		fmt.Println()
	}

	fmt.Print("➤ Seleccione un usuario (1-3) o 0 para salir: ")
	var selection int
	fmt.Scanf("%d", &selection)

	if selection == 0 {
		return nil, fmt.Errorf("operación cancelada")
	}

	if selection < 1 || selection > len(users) {
		return nil, fmt.Errorf("selección inválida")
	}

	return &users[selection-1], nil
}

func (o *Orchestrator) performLogin(userConfig *config.UserConfig) error {
	fmt.Println("\n" + strings.Repeat("═", 60))
	fmt.Println("🔐 AUTENTICACIÓN")
	fmt.Println(strings.Repeat("═", 60))
	fmt.Printf("\nIntentando autenticar como: %s\n", userConfig.Email)

	ctx := context.Background()
	loginResult, err := o.authService.Login(ctx, userConfig.Email, userConfig.Password)
	if err != nil {
		return err
	}

	o.loginResult = loginResult

	fmt.Println("\n✅ Autenticación exitosa")
	fmt.Printf("   Usuario: %s\n", loginResult.User.Email)
	if loginResult.User.Name != "" {
		fmt.Printf("   Nombre: %s\n", loginResult.User.Name)
	}
	fmt.Printf("   Scope: %s\n", loginResult.Scope)
	if loginResult.IsSuperAdmin {
		fmt.Println("   Rol: Super Administrador")
	}

	return nil
}

func (o *Orchestrator) selectBusiness() error {
	ctx := context.Background()
	reader := bufio.NewReader(os.Stdin)

	// 1. Listar tipos de negocio
	fmt.Println("\n" + strings.Repeat("═", 60))
	fmt.Println("🏪 SELECCIÓN DE TIPO DE NEGOCIO")
	fmt.Println(strings.Repeat("═", 60))

	businessTypes, err := o.listBusinessTypes(ctx)
	if err != nil {
		return err
	}

	fmt.Println()
	for i, bt := range businessTypes {
		fmt.Printf("[%d] %s\n", i+1, bt.Name)
	}

	fmt.Print("\n➤ Seleccione tipo de negocio: ")
	input, _ := reader.ReadString('\n')
	var typeSelection int
	fmt.Sscanf(strings.TrimSpace(input), "%d", &typeSelection)

	if typeSelection < 1 || typeSelection > len(businessTypes) {
		return fmt.Errorf("selección inválida")
	}

	selectedType := businessTypes[typeSelection-1]
	fmt.Printf("\n✓ Tipo seleccionado: %s\n", selectedType.Name)

	// 2. Listar businesses de ese tipo
	fmt.Println("\n" + strings.Repeat("═", 60))
	fmt.Println("🏢 SELECCIÓN DE NEGOCIO")
	fmt.Println(strings.Repeat("═", 60))

	businesses, err := o.listBusinessesByType(ctx, selectedType.ID)
	if err != nil {
		return err
	}

	if len(businesses) == 0 {
		return fmt.Errorf("no hay negocios registrados de tipo %s", selectedType.Name)
	}

	fmt.Println()
	fmt.Printf("%-4s %-45s %-10s\n", "#", "Nombre", "ID")
	fmt.Println(strings.Repeat("-", 60))

	for i, biz := range businesses {
		fmt.Printf("%-4d %-45s %-10d\n", i+1, truncate(biz.Name, 43), biz.ID)
	}

	fmt.Print("\n➤ Seleccione negocio: ")
	input, _ = reader.ReadString('\n')
	var bizSelection int
	fmt.Sscanf(strings.TrimSpace(input), "%d", &bizSelection)

	if bizSelection < 1 || bizSelection > len(businesses) {
		return fmt.Errorf("selección inválida")
	}

	selected := businesses[bizSelection-1]

	// 3. Obtener business token
	bizToken, err := o.authService.GetBusinessToken(ctx, o.loginResult.Token, selected.ID)
	if err != nil {
		return fmt.Errorf("error obteniendo business token: %w", err)
	}

	o.bizToken = bizToken
	o.businessID = selected.ID
	o.client.SetToken(bizToken)
	o.client.EnablePrettyPrint()

	fmt.Printf("\n✓ Negocio seleccionado: %s (ID: %d)\n", selected.Name, selected.ID)

	return nil
}

type businessType struct {
	ID   uint
	Name string
}

func (o *Orchestrator) listBusinessTypes(ctx context.Context) ([]businessType, error) {
	var results []businessType
	err := o.db.Conn(ctx).
		Table("business_type").
		Select("id, name").
		Order("name ASC").
		Find(&results).Error

	return results, err
}

type business struct {
	ID   uint
	Name string
}

func (o *Orchestrator) listBusinessesByType(ctx context.Context, typeID uint) ([]business, error) {
	var results []business
	err := o.db.Conn(ctx).
		Table("business").
		Select("id, name").
		Where("business_type_id = ?", typeID).
		Order("name ASC").
		Find(&results).Error

	return results, err
}

func truncate(s string, maxLen int) string {
	if len(s) <= maxLen {
		return s
	}
	return s[:maxLen-2] + ".."
}

package handlers

import (
	"central_reserve/services/auth/middleware"

	"github.com/gin-gonic/gin"
)

func (h *PackageHandler) RegisterRoutes(router *gin.RouterGroup) {
	packages := router.Group("/horizontal-properties/packages")
	{
		packages.POST("", middleware.JWT(), h.ReceivePackage)
		packages.GET("", middleware.JWT(), h.ListPackages)
		packages.GET("/:id", middleware.JWT(), h.GetPackageByID)
		packages.GET("/qr/:qr_code", middleware.JWT(), h.GetPackageByQRCode)
		packages.POST("/:id/deliver", middleware.JWT(), h.DeliverPackage)
		packages.PUT("/:id/status", middleware.JWT(), h.UpdatePackageStatus)
	}
}

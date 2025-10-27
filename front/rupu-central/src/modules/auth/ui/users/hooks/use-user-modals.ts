/**
 * Hook para manejar modales de usuarios
 * Aplica estilos globales y usa componentes reutilizables
 */

'use client';

import { useState, useCallback } from 'react';

export interface UseUserModalsReturn {
  // Estado de modales
  isCreateModalOpen: boolean;
  isEditModalOpen: boolean;
  isDeleteModalOpen: boolean;
  isViewModalOpen: boolean;
  
  // Datos del usuario seleccionado
  selectedUser: any | null;
  
  // Acciones para abrir modales
  openCreateModal: () => void;
  openEditModal: (user: any) => void;
  openDeleteModal: (user: any) => void;
  openViewModal: (user: any) => void;
  
  // Acciones para cerrar modales
  closeCreateModal: () => void;
  closeEditModal: () => void;
  closeDeleteModal: () => void;
  closeViewModal: () => void;
  
  // Acciones para cerrar todos los modales
  closeAllModals: () => void;
}

export function useUserModals() {
  // Estado de modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  
  // Usuario seleccionado
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  // Abrir modales
  const openCreateModal = useCallback(() => {
    setIsCreateModalOpen(true);
    setSelectedUser(null);
  }, []);

  const openEditModal = useCallback((user: any) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  }, []);

  const openDeleteModal = useCallback((user: any) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  }, []);

  const openViewModal = useCallback((user: any) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  }, []);

  // Cerrar modales
  const closeCreateModal = useCallback(() => {
    setIsCreateModalOpen(false);
    setSelectedUser(null);
  }, []);

  const closeEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
  }, []);

  const closeDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false);
    setSelectedUser(null);
  }, []);

  const closeViewModal = useCallback(() => {
    setIsViewModalOpen(false);
    setSelectedUser(null);
  }, []);

  // Cerrar todos los modales
  const closeAllModals = useCallback(() => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setIsViewModalOpen(false);
    setSelectedUser(null);
  }, []);

  return {
    // Estado de modales
    isCreateModalOpen,
    isEditModalOpen,
    isDeleteModalOpen,
    isViewModalOpen,
    
    // Datos del usuario seleccionado
    selectedUser,
    
    // Acciones para abrir modales
    openCreateModal,
    openEditModal,
    openDeleteModal,
    openViewModal,
    
    // Acciones para cerrar modales
    closeCreateModal,
    closeEditModal,
    closeDeleteModal,
    closeViewModal,
    
    // Acciones para cerrar todos los modales
    closeAllModals
  };
}

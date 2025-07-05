// Presentation - ReservaFilters Component
import React, { useState } from 'react';
import './ReservaFilters.css';

const ReservaFilters = ({ onApplyFilters, onClearFilters, loading }) => {
  const [filters, setFilters] = useState({
    status_id: '',
    client_id: '',
    table_id: '',
    start_date: '',
    end_date: ''
  });

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Helper function to convert local date to UTC with proper timezone handling
  const convertLocalDateToUTC = (dateString, isEndDate = false) => {
    if (!dateString) return '';
    
    try {
      // Parse the date string (YYYY-MM-DD format from input)
      const [year, month, day] = dateString.split('-').map(num => parseInt(num, 10));
      
      // Create date object in local timezone
      const localDate = new Date(year, month - 1, day); // month is 0-indexed
      
      if (isEndDate) {
        // For end date: set to 23:59:59.999 local time
        localDate.setHours(23, 59, 59, 999);
      } else {
        // For start date: set to 00:00:00.000 local time
        localDate.setHours(0, 0, 0, 0);
      }
      
      // Convert to UTC ISO string
      const utcString = localDate.toISOString();
      
      console.log(`Date conversion: ${dateString} (${isEndDate ? 'end' : 'start'}) -> Local: ${localDate.toString()} -> UTC: ${utcString}`);
      
      return utcString;
    } catch (error) {
      console.error('Error converting date:', error);
      return '';
    }
  };

  const handleApplyFilters = () => {
    // Filter out empty values and convert dates
    const activeFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value && value.trim() !== '') {
        // Convert date fields to UTC format with proper timezone handling
        if (key === 'start_date') {
          acc[key] = convertLocalDateToUTC(value, false); // Start of day
        } else if (key === 'end_date') {
          acc[key] = convertLocalDateToUTC(value, true);  // End of day
        } else {
          acc[key] = value;
        }
      }
      return acc;
    }, {});

    console.log('Applied filters:', activeFilters);
    onApplyFilters(activeFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      status_id: '',
      client_id: '',
      table_id: '',
      start_date: '',
      end_date: ''
    });
    onClearFilters();
  };

  // Helper function to get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleQuickFilter = (filterType, value) => {
    let newFilters = { ...filters };
    
    if (filterType === 'status') {
      newFilters.status_id = value;
    } else if (filterType === 'today') {
      const today = getTodayDate();
      newFilters.start_date = today;
      newFilters.end_date = today;
    }
    
    setFilters(newFilters);
    
    // Apply filters immediately with proper date conversion
    const activeFilters = Object.entries(newFilters).reduce((acc, [key, val]) => {
      if (val && val.trim() !== '') {
        if (key === 'start_date') {
          acc[key] = convertLocalDateToUTC(val, false);
        } else if (key === 'end_date') {
          acc[key] = convertLocalDateToUTC(val, true);
        } else {
          acc[key] = val;
        }
      }
      return acc;
    }, {});
    
    console.log('Quick filter applied:', activeFilters);
    onApplyFilters(activeFilters);
  };

  return (
    <div className="reserva-filters">
      <h3>🔍 Filtros de Búsqueda</h3>
      
      <div className="filters-grid">
        <div className="filter-group">
          <label htmlFor="status_id">Estado:</label>
          <select
            id="status_id"
            value={filters.status_id}
            onChange={(e) => handleFilterChange('status_id', e.target.value)}
            disabled={loading}
          >
            <option value="">Todos los estados</option>
            <option value="1">Pendiente</option>
            <option value="2">Asignado</option>
            <option value="3">Confirmado</option>
            <option value="4">Cancelado</option>
            <option value="5">Completado</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="client_id">ID Cliente:</label>
          <input
            type="number"
            id="client_id"
            placeholder="Ingrese ID del cliente"
            value={filters.client_id}
            onChange={(e) => handleFilterChange('client_id', e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="table_id">ID Mesa:</label>
          <input
            type="number"
            id="table_id"
            placeholder="Ingrese ID de la mesa"
            value={filters.table_id}
            onChange={(e) => handleFilterChange('table_id', e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="start_date">Fecha Inicio:</label>
          <input
            type="date"
            id="start_date"
            value={filters.start_date}
            onChange={(e) => handleFilterChange('start_date', e.target.value)}
            disabled={loading}
          />
          <small className="date-help">
            Desde las 00:00 del día seleccionado
          </small>
        </div>

        <div className="filter-group">
          <label htmlFor="end_date">Fecha Fin:</label>
          <input
            type="date"
            id="end_date"
            value={filters.end_date}
            onChange={(e) => handleFilterChange('end_date', e.target.value)}
            disabled={loading}
          />
          <small className="date-help">
            Hasta las 23:59 del día seleccionado
          </small>
        </div>
      </div>

      <div className="filter-actions">
        <button
          className="btn-apply"
          onClick={handleApplyFilters}
          disabled={loading}
        >
          {loading ? 'Aplicando...' : 'Aplicar Filtros'}
        </button>
        <button
          className="btn-clear"
          onClick={handleClearFilters}
          disabled={loading}
        >
          Limpiar Filtros
        </button>
      </div>

      <div className="filter-shortcuts">
        <h4>Filtros Rápidos:</h4>
        <div className="shortcut-buttons">
          <button
            className="btn-shortcut btn-shortcut-pending"
            onClick={() => handleQuickFilter('status', '1')}
            disabled={loading}
          >
            Solo Pendientes
          </button>
          <button
            className="btn-shortcut btn-shortcut-assigned"
            onClick={() => handleQuickFilter('status', '2')}
            disabled={loading}
          >
            Solo Asignados
          </button>
          <button
            className="btn-shortcut btn-shortcut-confirmed"
            onClick={() => handleQuickFilter('status', '3')}
            disabled={loading}
          >
            Solo Confirmadas
          </button>
          <button
            className="btn-shortcut btn-shortcut-today"
            onClick={() => handleQuickFilter('today')}
            disabled={loading}
          >
            Hoy
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReservaFilters; 
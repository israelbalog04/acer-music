'use client';

import React, { useState, useMemo } from 'react';
import { CustomRole, CustomPermission, HierarchyLevel } from './OrganizationConfigurator';

interface RolePermissionEditorProps {
  roles: CustomRole[];
  permissions: CustomPermission[];
  hierarchy: any[];
  hierarchyLevels: HierarchyLevel[];
  onChange: (roles: CustomRole[], permissions: CustomPermission[], hierarchy: any[]) => void;
}

export function RolePermissionEditor({ 
  roles, 
  permissions, 
  hierarchy, 
  hierarchyLevels, 
  onChange 
}: RolePermissionEditorProps) {
  const [activeTab, setActiveTab] = useState<'roles' | 'permissions' | 'matrix'>('roles');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedPermission, setSelectedPermission] = useState<string | null>(null);
  const [isCreatingRole, setIsCreatingRole] = useState(false);
  const [isCreatingPermission, setIsCreatingPermission] = useState(false);

  const permissionCategories = useMemo(() => {
    const categories: Record<string, CustomPermission[]> = {};
    permissions.forEach(permission => {
      if (!categories[permission.category]) {
        categories[permission.category] = [];
      }
      categories[permission.category].push(permission);
    });
    return categories;
  }, [permissions]);

  const createNewRole = () => {
    const newRole: CustomRole = {
      id: `role_${Date.now()}`,
      name: '',
      displayName: 'Nouveau Rôle',
      description: '',
      icon: '👤',
      color: '#6366f1',
      permissions: [],
      applicableLevels: hierarchyLevels.map(l => l.id)
    };

    onChange([...roles, newRole], permissions, hierarchy);
    setSelectedRole(newRole.id);
    setIsCreatingRole(false);
  };

  const createNewPermission = () => {
    const newPermission: CustomPermission = {
      id: `perm_${Date.now()}`,
      name: '',
      displayName: 'Nouvelle Permission',
      description: '',
      category: 'Général',
      scope: 'organization'
    };

    onChange(roles, [...permissions, newPermission], hierarchy);
    setSelectedPermission(newPermission.id);
    setIsCreatingPermission(false);
  };

  const updateRole = (roleId: string, updates: Partial<CustomRole>) => {
    const updatedRoles = roles.map(role =>
      role.id === roleId ? { ...role, ...updates } : role
    );
    onChange(updatedRoles, permissions, hierarchy);
  };

  const updatePermission = (permId: string, updates: Partial<CustomPermission>) => {
    const updatedPermissions = permissions.map(perm =>
      perm.id === permId ? { ...perm, ...updates } : perm
    );
    onChange(roles, updatedPermissions, hierarchy);
  };

  const deleteRole = (roleId: string) => {
    const updatedRoles = roles.filter(role => role.id !== roleId);
    onChange(updatedRoles, permissions, hierarchy);
    setSelectedRole(null);
  };

  const deletePermission = (permId: string) => {
    const updatedPermissions = permissions.filter(perm => perm.id !== permId);
    // Remove this permission from all roles
    const updatedRoles = roles.map(role => ({
      ...role,
      permissions: role.permissions.filter(p => p !== permId)
    }));
    onChange(updatedRoles, updatedPermissions, hierarchy);
    setSelectedPermission(null);
  };

  const toggleRolePermission = (roleId: string, permissionId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (!role) return;

    const hasPermission = role.permissions.includes(permissionId);
    const updatedPermissions = hasPermission
      ? role.permissions.filter(p => p !== permissionId)
      : [...role.permissions, permissionId];

    updateRole(roleId, { permissions: updatedPermissions });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Rôles & Permissions</h2>
          <p className="text-gray-600 mt-1">
            Configurez les rôles personnalisés et leurs permissions
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'roles', label: 'Rôles', icon: '👥' },
            { id: 'permissions', label: 'Permissions', icon: '🔐' },
            { id: 'matrix', label: 'Matrice', icon: '📊' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === 'roles' && (
        <RolesTab
          roles={roles}
          permissions={permissions}
          hierarchyLevels={hierarchyLevels}
          selectedRole={selectedRole}
          isCreating={isCreatingRole}
          onSelect={setSelectedRole}
          onCreate={() => setIsCreatingRole(true)}
          onCreateConfirm={createNewRole}
          onCreateCancel={() => setIsCreatingRole(false)}
          onUpdate={updateRole}
          onDelete={deleteRole}
        />
      )}

      {activeTab === 'permissions' && (
        <PermissionsTab
          permissions={permissions}
          permissionCategories={permissionCategories}
          selectedPermission={selectedPermission}
          isCreating={isCreatingPermission}
          onSelect={setSelectedPermission}
          onCreate={() => setIsCreatingPermission(true)}
          onCreateConfirm={createNewPermission}
          onCreateCancel={() => setIsCreatingPermission(false)}
          onUpdate={updatePermission}
          onDelete={deletePermission}
        />
      )}

      {activeTab === 'matrix' && (
        <PermissionMatrix
          roles={roles}
          permissions={permissions}
          permissionCategories={permissionCategories}
          onToggle={toggleRolePermission}
        />
      )}
    </div>
  );
}

// Roles Tab Component
interface RolesTabProps {
  roles: CustomRole[];
  permissions: CustomPermission[];
  hierarchyLevels: HierarchyLevel[];
  selectedRole: string | null;
  isCreating: boolean;
  onSelect: (roleId: string) => void;
  onCreate: () => void;
  onCreateConfirm: () => void;
  onCreateCancel: () => void;
  onUpdate: (roleId: string, updates: Partial<CustomRole>) => void;
  onDelete: (roleId: string) => void;
}

function RolesTab({ 
  roles, 
  permissions, 
  hierarchyLevels, 
  selectedRole, 
  isCreating, 
  onSelect, 
  onCreate, 
  onCreateConfirm, 
  onCreateCancel, 
  onUpdate, 
  onDelete 
}: RolesTabProps) {
  const iconOptions = ['👤', '👑', '⚙️', '👥', '🎯', '📊', '🔧', '🎨', '📝', '🛡️'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Roles list */}
      <div className="lg:col-span-1">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">Rôles</h3>
            <button
              onClick={onCreate}
              className="text-primary hover:text-primary/80 text-sm font-medium"
            >
              + Nouveau
            </button>
          </div>
          
          <div className="space-y-2">
            {roles.map((role) => (
              <div
                key={role.id}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                  selectedRole === role.id
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                onClick={() => onSelect(role.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-lg mr-2">{role.icon}</span>
                    <div>
                      <div className="font-medium text-gray-900">
                        {role.displayName || 'Sans nom'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {role.permissions.length} permissions
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(role.id);
                    }}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9zM4 5a2 2 0 012-2v1a1 1 0 002 0V3h8v1a1 1 0 102 0V3a2 2 0 012 2v1a1 1 0 100 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V8a1 1 0 000-2V5z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
            
            {isCreating && (
              <div className="p-3 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-center">
                  <button
                    onClick={onCreateConfirm}
                    className="text-primary hover:text-primary/80 font-medium"
                  >
                    ✓ Créer le rôle
                  </button>
                  <button
                    onClick={onCreateCancel}
                    className="ml-3 text-gray-500 hover:text-gray-700"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Role editor */}
      <div className="lg:col-span-2">
        {selectedRole ? (
          <RoleEditor
            role={roles.find(r => r.id === selectedRole)!}
            permissions={permissions}
            hierarchyLevels={hierarchyLevels}
            iconOptions={iconOptions}
            onUpdate={(updates) => onUpdate(selectedRole, updates)}
          />
        ) : (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <div className="text-gray-400 text-6xl mb-4">👤</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Sélectionnez un rôle à configurer
            </h3>
            <p className="text-gray-600">
              Cliquez sur un rôle dans la liste pour modifier ses paramètres
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Role Editor Component
interface RoleEditorProps {
  role: CustomRole;
  permissions: CustomPermission[];
  hierarchyLevels: HierarchyLevel[];
  iconOptions: string[];
  onUpdate: (updates: Partial<CustomRole>) => void;
}

function RoleEditor({ role, permissions, hierarchyLevels, iconOptions, onUpdate }: RoleEditorProps) {
  const [showIconPicker, setShowIconPicker] = useState(false);

  const permissionsByCategory = useMemo(() => {
    const categories: Record<string, CustomPermission[]> = {};
    permissions.forEach(permission => {
      if (!categories[permission.category]) {
        categories[permission.category] = [];
      }
      categories[permission.category].push(permission);
    });
    return categories;
  }, [permissions]);

  const togglePermission = (permissionId: string) => {
    const hasPermission = role.permissions.includes(permissionId);
    const updatedPermissions = hasPermission
      ? role.permissions.filter(p => p !== permissionId)
      : [...role.permissions, permissionId];

    onUpdate({ permissions: updatedPermissions });
  };

  const toggleHierarchyLevel = (levelId: string) => {
    const hasLevel = role.applicableLevels.includes(levelId);
    const updatedLevels = hasLevel
      ? role.applicableLevels.filter(l => l !== levelId)
      : [...role.applicableLevels, levelId];

    onUpdate({ applicableLevels: updatedLevels });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
      {/* Basic info */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Informations du Rôle</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom technique
            </label>
            <input
              type="text"
              value={role.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              placeholder="ex: director, member, admin"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom d'affichage
            </label>
            <input
              type="text"
              value={role.displayName}
              onChange={(e) => onUpdate({ displayName: e.target.value })}
              placeholder="ex: Directeur, Membre, Administrateur"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={role.description}
              onChange={(e) => onUpdate({ description: e.target.value })}
              placeholder="Description du rôle et de ses responsabilités..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Visual customization */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Apparence</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Icône
            </label>
            <div className="relative">
              <button
                onClick={() => setShowIconPicker(!showIconPicker)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-left flex items-center"
              >
                <span className="text-lg mr-2">{role.icon}</span>
                <span>Choisir une icône</span>
              </button>
              
              {showIconPicker && (
                <div className="absolute top-full left-0 mt-2 p-3 bg-white border border-gray-200 rounded-lg shadow-lg z-10 grid grid-cols-6 gap-2">
                  {iconOptions.map((icon) => (
                    <button
                      key={icon}
                      onClick={() => {
                        onUpdate({ icon });
                        setShowIconPicker(false);
                      }}
                      className="p-2 hover:bg-gray-100 rounded text-lg"
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Couleur
            </label>
            <div className="flex space-x-2">
              <input
                type="color"
                value={role.color}
                onChange={(e) => onUpdate({ color: e.target.value })}
                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={role.color}
                onChange={(e) => onUpdate({ color: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Applicable levels */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Niveaux Hiérarchiques</h3>
        <p className="text-sm text-gray-600 mb-3">
          Sélectionnez les niveaux où ce rôle peut être assigné
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {hierarchyLevels.map((level) => (
            <label key={level.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={role.applicableLevels.includes(level.id)}
                onChange={() => toggleHierarchyLevel(level.id)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="ml-3 text-lg mr-2">{level.icon}</span>
              <span className="text-sm">{level.displayName}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Permissions */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Permissions</h3>
        
        <div className="space-y-4">
          {Object.entries(permissionsByCategory).map(([category, categoryPermissions]) => (
            <div key={category} className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">{category}</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {categoryPermissions.map((permission) => (
                  <label key={permission.id} className="flex items-start p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={role.permissions.includes(permission.id)}
                      onChange={() => togglePermission(permission.id)}
                      className="rounded border-gray-300 text-primary focus:ring-primary mt-1"
                    />
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
                        {permission.displayName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {permission.description}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Permissions Tab (simplified for space)
function PermissionsTab({ 
  permissions, 
  permissionCategories, 
  selectedPermission, 
  isCreating, 
  onSelect, 
  onCreate, 
  onCreateConfirm, 
  onCreateCancel, 
  onUpdate, 
  onDelete 
}: any) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">Permissions</h3>
            <button
              onClick={onCreate}
              className="text-primary hover:text-primary/80 text-sm font-medium"
            >
              + Nouvelle
            </button>
          </div>
          
          {Object.entries(permissionCategories).map(([category, categoryPermissions]) => (
            <div key={category} className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">{category}</h4>
              <div className="space-y-1">
                {(categoryPermissions as CustomPermission[]).map((permission) => (
                  <div
                    key={permission.id}
                    className={`p-2 rounded cursor-pointer text-sm ${
                      selectedPermission === permission.id
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => onSelect(permission.id)}
                  >
                    {permission.displayName}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="lg:col-span-2">
        {selectedPermission ? (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Éditer Permission
            </h3>
            {/* Permission editor form would go here */}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Sélectionnez une permission
            </h3>
          </div>
        )}
      </div>
    </div>
  );
}

// Permission Matrix Component
function PermissionMatrix({ 
  roles, 
  permissions, 
  permissionCategories, 
  onToggle 
}: any) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-6">
        Matrice des Permissions
      </h3>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50">
                Permission
              </th>
              {roles.map((role: any) => (
                <th key={role.id} className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex flex-col items-center">
                    <span className="text-lg mb-1">{role.icon}</span>
                    <span>{role.displayName}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Object.entries(permissionCategories).map(([category, categoryPermissions]) => (
              <React.Fragment key={category}>
                <tr className="bg-gray-50">
                  <td colSpan={roles.length + 1} className="px-6 py-2 text-sm font-medium text-gray-900">
                    {category}
                  </td>
                </tr>
                {(categoryPermissions as CustomPermission[]).map((permission) => (
                  <tr key={permission.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white">
                      {permission.displayName}
                    </td>
                    {roles.map((role: any) => (
                      <td key={role.id} className="px-3 py-4 whitespace-nowrap text-center">
                        <input
                          type="checkbox"
                          checked={role.permissions.includes(permission.id)}
                          onChange={() => onToggle(role.id, permission.id)}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
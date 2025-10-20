// Иерархия должностей (от высшей к низшей)
const POSITION_HIERARCHY = [
    'OWNER',
    'RAZRAB',
    'TEX.ADMIN',
    'ADMIN',
    'CURATOR',
    'ZAM.CURATOR',
    'GL.STAFF',
    'MODER',
    'CT.HELPER',
    'HELPER'
];

// Роли с правами доступа
const ROLES = {
    OWNER: {
        canManageStaff: true,
        canManageApplications: true,
        canPromoteUpTo: 'OWNER',
        canFire: true,
        canAccessAdmin: true
    },
    RAZRAB: {
        canManageStaff: true,
        canManageApplications: true,
        canPromoteUpTo: 'RAZRAB',
        canFire: true,
        canAccessAdmin: true
    },
    'TEX.ADMIN': {
        canManageStaff: true,
        canManageApplications: true,
        canPromoteUpTo: 'TEX.ADMIN',
        canFire: true,
        canAccessAdmin: true
    },
    ADMIN: {
        canManageStaff: true,
        canManageApplications: true,
        canPromoteUpTo: 'ADMIN',
        canFire: true,
        canAccessAdmin: true
    },
    CURATOR: {
        canManageStaff: true,
        canManageApplications: true,
        canPromoteUpTo: 'ZAM.CURATOR', // Может выдавать до ZAM.CURATOR
        canFire: true,
        canAccessAdmin: false
    },
    'ZAM.CURATOR': {
        canManageStaff: true,
        canManageApplications: true,
        canPromoteUpTo: 'GL.STAFF', // Может выдавать до GL.STAFF
        canFire: true,
        canAccessAdmin: false
    },
    'GL.STAFF': {
        canManageStaff: false,
        canManageApplications: false,
        canPromoteUpTo: null,
        canFire: false,
        canAccessAdmin: false
    },
    MODER: {
        canManageStaff: false,
        canManageApplications: false,
        canPromoteUpTo: null,
        canFire: false,
        canAccessAdmin: false
    },
    'CT.HELPER': {
        canManageStaff: false,
        canManageApplications: false,
        canPromoteUpTo: null,
        canFire: false,
        canAccessAdmin: false
    },
    HELPER: {
        canManageStaff: false,
        canManageApplications: false,
        canPromoteUpTo: null,
        canFire: false,
        canAccessAdmin: false
    }
};

// Проверка прав
function hasPermission(userPosition, permission) {
    const role = ROLES[userPosition];
    return role ? role[permission] : false;
}

// Может ли пользователь выдать эту должность
function canPromoteTo(userPosition, targetPosition) {
    const role = ROLES[userPosition];
    if (!role || !role.canPromoteUpTo) return false;
    
    const userMaxIndex = POSITION_HIERARCHY.indexOf(role.canPromoteUpTo);
    const targetIndex = POSITION_HIERARCHY.indexOf(targetPosition);
    
    // Может выдавать должности ниже или равные максимальной
    return targetIndex >= userMaxIndex;
}

// Получить доступные должности для выдачи
function getAvailablePositions(userPosition) {
    const role = ROLES[userPosition];
    if (!role || !role.canPromoteUpTo) return [];
    
    const maxIndex = POSITION_HIERARCHY.indexOf(role.canPromoteUpTo);
    return POSITION_HIERARCHY.slice(maxIndex);
}

module.exports = {
    POSITION_HIERARCHY,
    ROLES,
    hasPermission,
    canPromoteTo,
    getAvailablePositions
};

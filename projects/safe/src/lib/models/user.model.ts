import { Application } from './application.model';
import { Channel } from './channel.model';

/*  Model for Permission object.
*/
export interface Permission {
    id?: string;
    type?: string;
    global?: boolean;
}

/*  Model for Role object.
*/
export interface Role {
    id?: string;
    title?: string;
    usersCount?: number;
    permissions?: Permission[];
    application?: Application;
    channels?: Channel[];
}

/*  Model for User object.
*/
export interface User {
    id?: string;
    username?: string;
    isAdmin?: boolean;
    name?: string;
    roles?: Role[];
    permissions?: Permission[];
    oid?: string;
    applications?: Application[];
    favoriteApp?: string;
}

/*  Enum of admin permissions.
*/
export enum Permissions {
    canSeeResources = 'can_see_resources',
    canSeeForms = 'can_see_forms',
    canSeeUsers = 'can_see_users',
    canSeeRoles = 'can_see_roles',
    canSeeApplications = 'can_see_applications',
    canManageForms = 'can_manage_forms',
    canCreateForms = 'can_create_forms',
    canCreateResources = 'can_create_resources',
    canManageResources = 'can_manage_resources',
    canManageApplications = 'can_manage_applications',
    canManageApiConfigurations = 'can_manage_api_configurations'
}

/*  Enum of permissions types.
*/
export enum PermissionType {
    access = 'access',
    create = 'create',
    update = 'update',
    delete = 'delete'
}

/*  Class to check for routes and methods what is the needed admin permission.
*/
export class PermissionsManagement {
    public static mappedPermissions = {
        resources: {
            access: Permissions.canSeeResources,
            create: Permissions.canCreateResources
        },
        forms: {
            access: Permissions.canSeeForms,
            create: Permissions.canCreateForms,
        },
        settings: {
            users: {
                access: Permissions.canSeeUsers
            },
            roles: {
                access: Permissions.canSeeRoles
            },
            apiconfigurations: {
                create: Permissions.canManageApiConfigurations,
                access: Permissions.canManageApiConfigurations
            },
            edit: {
                access: Permissions.canManageApplications
            },
            position: {
                access: Permissions.canSeeRoles
            },
            channels: {
                access: Permissions.canManageApplications
            },
            subscriptions: {
                access: Permissions.canManageApplications
            },
            'pull-jobs': {
                access: Permissions.canManageApplications
            }
        },
        applications: {
            create: Permissions.canManageApplications,
            access: Permissions.canSeeApplications
        },
        'add-page': {
            access: Permissions.canManageApplications
        }
    };

    public static getRightFromPath(path: string, type: PermissionType): string {
        const pathArray = path.split('?')[0].split('/');
        pathArray.shift();
        // For subroutes
        if (pathArray.length > 2) {
            const subroute = pathArray[3];
            pathArray.splice(2);
            pathArray.push(subroute);
        }
        return this.getRightFromKeys(pathArray, type);
    }

    public static getRightFromKeys(keys: string[], type: PermissionType): string {
        let value = this.mappedPermissions;
        for (const key of keys) {
            if (key in value) {
                value = (value as any)[key];
            }
        }
        return (value as any)[type];
    }
}

/*  Interface for Adding new users.
*/
export interface AddUser {
    email: string;
    roles: string[];
    attributes: { value: string, category: string };
  }

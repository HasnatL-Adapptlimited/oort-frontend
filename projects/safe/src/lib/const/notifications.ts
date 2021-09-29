/*  Notifications
*/
export const NOTIFICATIONS = {
    appPublished(name: any): string { return `Application ${name} published.`; } ,
    userInvalidActions(action: any): string  { return `User could not be ${action}.`; } ,
    accessNotProvided(type: any, error?: any): string  { return `No access provided to this ${type}. ${error}`; } ,
    userRolesUpdated(username: any): string  { return `${username} roles updated.`; },
    usersActions(type: any, length: any): string  { return length > 1 ? `${length} users were ${type}.` : `user was ${type}.`; }, //
    objectNotUpdated(type: any, error: any): string  { return `${type} is locked for edition. ${error}`; },
    objectEdited(type: any, name: any): string  { return `${name} ${type} edited.`; }, //
    objectDuplicated(type: any, name: any): string  { return `The ${type} ${name} was successfully  duplicated.`; },
    objectNotDuplicated(type: any, error: any): string  { return `The ${type} was not duplicated. ${error}`; },
    objectAlreadyExists(type: any, value: any): string  { return `The ${type} ${value} already exists on this application.`; },
    objectCreated(type: any, name: any): string  { return `${name} ${type} created.`; },
    objectNotCreated(type: any, error: any): string  { return `The ${type} was not created. ${error}`; },
    objectDeleted(value: any): string  { return `${value} deleted.`; },
    objectNotDeleted(value: any, error: any): string  { return `The ${value} was not deleted. ${error}`; },
    objectReordered(type: any): string  { return `${type} reordered.`; },
    objectLoadedFromCache(type: string): string { return `${type} loaded from cache.`; },
    objectIsLocked(name: any): string { return `${name} edition is locked by another user.`; },
    objectUnlocked(name: any): string { return `${name} edition has been unlocked by another user.`; },
    objectAccessDenied(type: string): string { return `You don't have permission to see the ${type}.`; },
    goToStep(step: any): string  { return `Back to ${step} step.`; },
    statusUpdated(status: any): string  { return `Status updated to ${status}.`; },
    noObjectOpened(value: any): string  { return `No opened ${value}.`; },
    addRowsToRecord(length: any, field: any, value: any): string  { return `Added ${length} row${length > 1 ? 's' : ''} to the field ${field} in the record ${value}.`; },
    formatInvalid(format: string): string { return `Please upload a valid .${format} file.`; },
    cannotGoToNextStep: 'Cannot go to next step.',
    copied: 'Copied!',
    recordDoesNotMatch: 'Selected records do not match with any fields from this form.',
    recordUploadSuccess: 'Records upload successful.',
    emailRegistered: 'Some emails are already part of the application and will not be invited.',
    dataRecovered: 'The data has been recovered',
    profileSaved: 'Preferences saved.',
    appEdited: 'This application has been updated by someone else.',
    pingResponseAuthToken: 'Authentication token fetched, ping again to get the actual response.',
    pingResponseReceived: 'Received positive response from ping request.',
    pingResponseError: 'ERROR during the PING request.'
};

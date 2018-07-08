/**
 * Will be normalize to a local phone number, without dashes.
 * @param phoneNumber
 */
function normalizeToLocal(phoneNumber) {
    phoneNumber = phoneNumber.replace(new RegExp('-', 'g'), '');
    if (phoneNumber.startsWith('+972')) {
        phoneNumber = '0' + phoneNumber.substring(4, phoneNumber.length);
    }
    return phoneNumber;
}

/**
 * Will be normalize to an international phone number, without dashes.
 * @param phoneNumber
 */
function normalizeToInternational(phoneNumber) {
    phoneNumber = phoneNumber.replace(new RegExp('-', 'g'), '');
    if (!phoneNumber.startsWith('+972')) {
        phoneNumber = '+972' + phoneNumber.substring(1, phoneNumber.length);
    }
    return phoneNumber;
}

module.exports = {
    normalizeToLocal,
    normalizeToInternational
};

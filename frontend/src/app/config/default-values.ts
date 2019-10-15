/*
All default values, numbers used in different components are defined here
*/

export const DEFAULT_VALUES = {
    THRESHOLD_NEARING: '80',
    CLASSES : {
        IS_SELECTED :'is-selected',
        NOT_AVAILABLE : 'not_available',
        IS_SELECTED_MAP:'isSelected',
        IS_FOCUSED:'isFocused',
        FOCUSABLE:'focusable'
    },
    VALIDATIONS : {
        EMAIL : /^[_A-Za-z0-9]+(\.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(\.[A-Za-z0-9]+)*(\.[A-Za-z]{2,})$/,
        PASSWORD : /^(?=\D*\d)(?=[^a-z]*[a-z])(?=.*[!@#$%^&*])(?=[^A-Z]*[A-Z]).{8,}$/
    }
};
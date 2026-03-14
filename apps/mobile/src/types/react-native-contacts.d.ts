declare module 'react-native-contacts' {
  export interface PhoneNumber {
    label: string;
    number: string;
  }

  export interface EmailAddress {
    label: string;
    email: string;
  }

  export interface Contact {
    recordID: string;
    givenName: string;
    familyName: string;
    displayName?: string;
    phoneNumbers: PhoneNumber[];
    emailAddresses: EmailAddress[];
    thumbnailPath?: string;
  }

  function getAll(): Promise<Contact[]>;
  function checkPermission(): Promise<'authorized' | 'denied' | 'undefined'>;
  function requestPermission(): Promise<'authorized' | 'denied' | 'undefined'>;

  const Contacts: {
    getAll: typeof getAll;
    checkPermission: typeof checkPermission;
    requestPermission: typeof requestPermission;
  };

  export default Contacts;
}

export const userFixtures = {
  validUser: {
    email: 'testuser@example.com',
    password: 'TestPassword123!',
    first_name: 'John',
    last_name: 'Doe',
    tenant_unique_id: 'TU001',
    date_of_birth: '1990-01-01',
    height: 180.5,
    weight: 75.2,
    phone: '+1234567890',
    emergency_contact_name: 'Jane Doe',
    emergency_contact_number: '+1234567891',
  },

  minimalUser: {
    email: 'minimal@example.com',
    password: 'MinimalPass123!',
    first_name: 'Min',
    last_name: 'User',
    tenant_unique_id: 'TU002',
  },

  adminUser: {
    email: 'admin@example.com',
    password: 'AdminPass123!',
    role: 'admin',
    first_name: 'Admin',
    last_name: 'User',
    tenant_unique_id: 'TU003',
  },

  updateUserData: {
    first_name: 'Updated',
    last_name: 'Name',
    height: 185.0,
    weight: 80.0,
    phone: '+9876543210',
  },

  invalidEmails: [
    'invalid-email',
    '@invalid.com',
    'user@',
    'user@.com',
    '',
  ],

  invalidPasswords: [
    'short',
    'nouppercase123!',
    'NOLOWERCASE123!',
    'NoNumbers!',
    'NoSpecialChars123',
    '',
  ],

  invalidNames: [
    '',
    'a'.repeat(101), // Too long
  ],

  invalidHeights: [
    -1,
    0,
    301, // Too high
  ],

  invalidWeights: [
    -1,
    0,
    501, // Too heavy
  ],
};

export const tenantFixtures = {
  validTenant: {
    name: 'Test Sports Academy',
    city: 'New York',
    state: 'New York',
    country: 'USA',
    description: 'A test sports academy for athletes',
    is_active: true,
  },

  minimalTenant: {
    name: 'Minimal Tenant',
    city: 'Test City',
    state: 'Test State',
    country: 'Test Country',
  },

  updateTenantData: {
    name: 'Updated Tenant Name',
    city: 'Updated City',
    description: 'Updated description',
    is_active: false,
  },

  invalidNames: [
    '',
    'a'.repeat(256), // Too long
  ],

  invalidCities: [
    '',
    'a'.repeat(101), // Too long
  ],

  invalidStates: [
    '',
    'a'.repeat(101), // Too long
  ],

  invalidCountries: [
    '',
    'a'.repeat(101), // Too long
  ],
};

export const authFixtures = {
  validLogin: {
    email: 'admin@athleteanalytics.com',
    password: 'admin123',
  },

  invalidLogin: {
    email: 'nonexistent@example.com',
    password: 'wrongpassword',
  },

  invalidLoginFormat: {
    email: 'invalid-email',
    password: '',
  },
};

export const queryFixtures = {
  validPagination: {
    page: 1,
    limit: 10,
  },

  invalidPagination: {
    page: 0,
    limit: 101,
  },

  validUserQuery: {
    page: 1,
    limit: 20,
    role: 'athlete',
    search: 'test',
    sort_by: 'created_at',
    sort_order: 'desc',
  },

  validTenantQuery: {
    page: 1,
    limit: 20,
    city: 'New York',
    is_active: true,
    search: 'academy',
    sort_by: 'name',
    sort_order: 'asc',
  },
};
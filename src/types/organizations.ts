export interface Organization {
  id: string;
  name: string;
  url?: string;
  api?: { enabled?: boolean };
  cloud?: { region?: { name?: string } };
  [key: string]: unknown;
}

export interface OrganizationInventoryDevice {
  serial: string;
  name?: string;
  mac?: string;
  model?: string;
  networkId?: string | null;
  productType?: string;
  tags?: string[];
  [key: string]: unknown;
}

export interface OrganizationAdmin {
  id: string;
  name?: string;
  email?: string;
  orgAccess?: string;
  twoFactorAuthEnabled?: boolean;
  networks?: Array<{ id: string; access: string }>;
  tags?: Array<{ tag: string; access: string }>;
  [key: string]: unknown;
}

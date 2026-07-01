export interface SwitchPort {
  portId: string;
  name?: string;
  enabled?: boolean;
  type?: 'access' | 'trunk' | string;
  vlan?: number;
  voiceVlan?: number;
  allowedVlans?: string;
  poeEnabled?: boolean;
  tags?: string[];
  [key: string]: unknown;
}

/**
 * Mutable fields accepted by `PUT /devices/{serial}/switch/ports/{portId}`.
 * Verified against Meraki OpenAPI spec3 (operationId updateDeviceSwitchPort).
 */
export interface SwitchPortUpdate {
  name?: string;
  tags?: string[];
  enabled?: boolean;
  poeEnabled?: boolean;
  type?: 'access' | 'dad' | 'routed' | 'stack' | 'svl' | 'trunk' | string;
  vlan?: number;
  voiceVlan?: number;
  allowedVlans?: string;
  isolationEnabled?: boolean;
  rstpEnabled?: boolean;
  stpGuard?: 'disabled' | 'root guard' | 'bpdu guard' | 'loop guard' | string;
  /** Switch port link speed (e.g. 'Auto negotiate', '1 Gigabit full duplex (forced)'). */
  linkNegotiation?: string;
  portScheduleId?: string;
  udld?: 'Alert only' | 'Enforce' | string;
  accessPolicyType?:
    | 'Open'
    | 'Custom access policy'
    | 'MAC allow list'
    | 'Sticky MAC allow list'
    | string;
  accessPolicyNumber?: number;
  [key: string]: unknown;
}

export interface SwitchPortStatus {
  portId: string;
  enabled?: boolean;
  status?: string;
  isUplink?: boolean;
  speed?: string;
  duplex?: string;
  errors?: string[];
  warnings?: string[];
  [key: string]: unknown;
}

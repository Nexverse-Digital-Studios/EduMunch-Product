# 66 - Security Features

## Overview

The Security Features module implements comprehensive security measures to protect sensitive data, prevent unauthorized access, and maintain regulatory compliance. This module covers encryption, IP whitelisting, session management, audit logging, and security monitoring.

**Module Dependencies:**
- Authentication System (for session and user management)
- User Management (for access control)
- Audit Logging & Compliance (for security events)

**Technology Stack:**
- Frontend: React + TypeScript
- Backend: Supabase + PostgreSQL
- Encryption: TweetNaCl.js (frontend), pgcrypto (backend)
- Security Headers: CORS, CSP, X-Frame-Options
- Rate Limiting: Redis (optional)

---

## Database Schema

### 1. security_settings
```sql
CREATE TABLE security_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
  password_policy_min_length INTEGER DEFAULT 8,
  password_policy_require_uppercase BOOLEAN DEFAULT true,
  password_policy_require_lowercase BOOLEAN DEFAULT true,
  password_policy_require_numbers BOOLEAN DEFAULT true,
  password_policy_require_special BOOLEAN DEFAULT true,
  password_expiry_days INTEGER DEFAULT 90,
  max_login_attempts INTEGER DEFAULT 5,
  login_lockout_duration_minutes INTEGER DEFAULT 15,
  enable_two_factor_auth BOOLEAN DEFAULT true,
  enable_ip_whitelisting BOOLEAN DEFAULT false,
  enable_session_timeout BOOLEAN DEFAULT true,
  session_timeout_minutes INTEGER DEFAULT 30,
  enable_device_fingerprinting BOOLEAN DEFAULT false,
  data_encryption_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id),
  
  INDEX idx_org_security ON organization_id
);

ALTER TABLE security_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view settings"
  ON security_settings FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "Only admins can update settings"
  ON security_settings FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );
```

### 2. ip_whitelist
```sql
CREATE TABLE ip_whitelist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  ip_address INET NOT NULL,
  ip_range_start INET,
  ip_range_end INET,
  description VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  added_by UUID REFERENCES auth.users(id),
  added_date TIMESTAMP DEFAULT now(),
  last_used TIMESTAMP,
  
  UNIQUE(organization_id, ip_address),
  INDEX idx_org_ip ON organization_id,
  INDEX idx_ip_active ON (organization_id, is_active)
);

ALTER TABLE ip_whitelist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view whitelist"
  ON ip_whitelist FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM user_roles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can manage whitelist"
  ON ip_whitelist FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM user_roles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );
```

### 3. user_sessions
```sql
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token VARCHAR(500) UNIQUE NOT NULL,
  device_fingerprint VARCHAR(255),
  ip_address INET,
  user_agent TEXT,
  session_status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, EXPIRED, REVOKED
  login_timestamp TIMESTAMP DEFAULT now(),
  last_activity TIMESTAMP DEFAULT now(),
  expiry_timestamp TIMESTAMP,
  logout_timestamp TIMESTAMP,
  location VARCHAR(255),
  device_type VARCHAR(50), -- desktop, mobile, tablet
  browser_name VARCHAR(100),
  
  INDEX idx_user_sessions ON user_id,
  INDEX idx_session_status ON session_status,
  INDEX idx_login_timestamp ON login_timestamp,
  INDEX idx_expiry_timestamp ON expiry_timestamp
);

ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own sessions"
  ON user_sessions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can revoke own sessions"
  ON user_sessions FOR UPDATE
  USING (user_id = auth.uid());
```

### 4. failed_login_attempts
```sql
CREATE TABLE failed_login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255),
  ip_address INET NOT NULL,
  attempt_timestamp TIMESTAMP DEFAULT now(),
  failure_reason VARCHAR(255), -- invalid_password, account_locked, etc.
  user_agent TEXT,
  
  INDEX idx_user_attempts ON user_id,
  INDEX idx_email_attempts ON email,
  INDEX idx_ip_attempts ON ip_address,
  INDEX idx_timestamp ON attempt_timestamp
);

ALTER TABLE failed_login_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view failed attempts"
  ON failed_login_attempts FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM auth.users 
      WHERE organization_id IN (
        SELECT organization_id FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
      )
    )
  );
```

### 5. account_lockout
```sql
CREATE TABLE account_lockout (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  locked_reason VARCHAR(255),
  locked_at TIMESTAMP DEFAULT now(),
  locked_until TIMESTAMP NOT NULL,
  failed_attempts_count INTEGER,
  unlocked_at TIMESTAMP,
  unlocked_by UUID REFERENCES auth.users(id),
  
  INDEX idx_user_lockout ON user_id,
  INDEX idx_locked_until ON locked_until
);

ALTER TABLE account_lockout ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own lockout status"
  ON account_lockout FOR SELECT
  USING (user_id = auth.uid());
```

### 6. encryption_keys
```sql
CREATE TABLE encryption_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  key_type VARCHAR(50), -- DATA_ENCRYPTION, FIELD_ENCRYPTION, etc.
  key_name VARCHAR(255) NOT NULL,
  key_version INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT now(),
  rotation_date TIMESTAMP,
  next_rotation_date TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  
  UNIQUE(organization_id, key_name, key_version),
  INDEX idx_org_keys ON organization_id,
  INDEX idx_key_active ON (organization_id, is_active)
);

-- Note: Actual encryption keys stored in Supabase Vault or external KMS

ALTER TABLE encryption_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only authorized staff can manage keys"
  ON encryption_keys FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM user_roles 
      WHERE user_id = auth.uid() AND role IN ('super_admin')
    )
  );
```

### 7. security_alerts
```sql
CREATE TABLE security_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  alert_type VARCHAR(100), 
  -- UNAUTHORIZED_ACCESS, BRUTE_FORCE, SUSPICIOUS_ACTIVITY, DATA_LEAK, POLICY_VIOLATION
  severity VARCHAR(50), -- LOW, MEDIUM, HIGH, CRITICAL
  affected_user_id UUID REFERENCES auth.users(id),
  affected_resource VARCHAR(255),
  description TEXT NOT NULL,
  ip_address INET,
  detected_at TIMESTAMP DEFAULT now(),
  alert_status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, ACKNOWLEDGED, RESOLVED
  acknowledged_by UUID REFERENCES auth.users(id),
  acknowledged_at TIMESTAMP,
  resolution_notes TEXT,
  
  INDEX idx_org_alerts ON organization_id,
  INDEX idx_alert_type ON alert_type,
  INDEX idx_severity ON severity,
  INDEX idx_alert_status ON alert_status,
  INDEX idx_detected_at ON detected_at
);

ALTER TABLE security_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view alerts"
  ON security_alerts FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM user_roles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );
```

### 8. two_factor_auth
```sql
CREATE TABLE two_factor_auth (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  method VARCHAR(50), -- TOTP, SMS, EMAIL
  secret_key VARCHAR(255) ENCRYPTED, -- For TOTP
  phone_number VARCHAR(20) ENCRYPTED, -- For SMS
  is_verified BOOLEAN DEFAULT false,
  backup_codes TEXT[] DEFAULT '{}', -- Encrypted array
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  
  INDEX idx_user_2fa ON user_id
);

ALTER TABLE two_factor_auth ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own 2FA"
  ON two_factor_auth FOR SELECT
  USING (user_id = auth.uid());
```

### 9. data_classification
```sql
CREATE TABLE data_classification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  table_name VARCHAR(255) NOT NULL,
  column_name VARCHAR(255),
  classification_level VARCHAR(50), -- PUBLIC, INTERNAL, CONFIDENTIAL, RESTRICTED
  requires_encryption BOOLEAN DEFAULT false,
  audit_required BOOLEAN DEFAULT true,
  retention_days INTEGER,
  created_at TIMESTAMP DEFAULT now(),
  
  UNIQUE(organization_id, table_name, column_name),
  INDEX idx_org_classification ON organization_id
);

ALTER TABLE data_classification ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view classification"
  ON data_classification FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM user_roles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );
```

---

## React Components

### SecurityDashboard.tsx
```typescript
interface SecurityDashboardProps {
  organizationId: string;
}

export const SecurityDashboard: React.FC<SecurityDashboardProps> = ({
  organizationId
}) => {
  const { data: alerts } = useSecurityAlerts(organizationId);
  const { data: failedLogins } = useFailedLoginAttempts(organizationId);
  const { data: settings } = useSecuritySettings(organizationId);
  const { data: sessions } = useActiveSessions(organizationId);

  const alertMetrics = {
    activeAlerts: alerts?.filter(a => a.alert_status === 'ACTIVE').length ?? 0,
    criticalAlerts: alerts?.filter(a => a.severity === 'CRITICAL').length ?? 0,
    failedLoginAttempts: failedLogins?.length ?? 0,
    activeSessions: sessions?.length ?? 0
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          label="Active Alerts"
          value={alertMetrics.activeAlerts}
          icon={<AlertTriangle />}
          color={alertMetrics.activeAlerts > 0 ? 'red' : 'green'}
        />
        <MetricCard
          label="Critical Issues"
          value={alertMetrics.criticalAlerts}
          icon={<AlertCircle className="text-red-600" />}
        />
        <MetricCard
          label="Failed Logins (24h)"
          value={alertMetrics.failedLoginAttempts}
          icon={<Lock className="text-yellow-600" />}
        />
        <MetricCard
          label="Active Sessions"
          value={alertMetrics.activeSessions}
          icon={<Users />}
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Security Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <SecurityAlertsList alerts={alerts || []} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <SessionsList sessions={sessions || []} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <SecuritySettingsView settings={settings} />
        </CardContent>
      </Card>
    </div>
  );
};
```

### SecuritySettingsForm.tsx
```typescript
interface SecuritySettingsFormProps {
  organizationId: string;
  onSuccess?: () => void;
}

export const SecuritySettingsForm: React.FC<SecuritySettingsFormProps> = ({
  organizationId,
  onSuccess
}) => {
  const { data: settings, isLoading } = useSecuritySettings(organizationId);
  const [formData, setFormData] = useState<SecuritySettingsUpdate>({});
  const mutation = useUpdateSecuritySettings();

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleSubmit = async () => {
    await mutation.mutateAsync({
      organization_id: organizationId,
      ...formData
    });
    onSuccess?.();
  };

  if (isLoading) return <Skeleton className="h-96" />;

  return (
    <Form>
      <div className="space-y-8">
        {/* Password Policy Section */}
        <div className="border-b pb-8">
          <h3 className="text-lg font-semibold mb-4">Password Policy</h3>
          <div className="space-y-4">
            <FormField
              label="Minimum Password Length"
              type="number"
              value={formData.password_policy_min_length?.toString()}
              onChange={(v) => setFormData({
                ...formData,
                password_policy_min_length: parseInt(v)
              })}
              min="6"
              max="20"
            />
            <Checkbox
              label="Require Uppercase Letters"
              checked={formData.password_policy_require_uppercase ?? false}
              onChange={(checked) => setFormData({
                ...formData,
                password_policy_require_uppercase: checked
              })}
            />
            <Checkbox
              label="Require Lowercase Letters"
              checked={formData.password_policy_require_lowercase ?? false}
              onChange={(checked) => setFormData({
                ...formData,
                password_policy_require_lowercase: checked
              })}
            />
            <Checkbox
              label="Require Numbers"
              checked={formData.password_policy_require_numbers ?? false}
              onChange={(checked) => setFormData({
                ...formData,
                password_policy_require_numbers: checked
              })}
            />
            <Checkbox
              label="Require Special Characters"
              checked={formData.password_policy_require_special ?? false}
              onChange={(checked) => setFormData({
                ...formData,
                password_policy_require_special: checked
              })}
            />
            <FormField
              label="Password Expiry (Days)"
              type="number"
              value={formData.password_expiry_days?.toString()}
              onChange={(v) => setFormData({
                ...formData,
                password_expiry_days: parseInt(v)
              })}
              min="30"
              max="365"
            />
          </div>
        </div>

        {/* Login Security */}
        <div className="border-b pb-8">
          <h3 className="text-lg font-semibold mb-4">Login Security</h3>
          <div className="space-y-4">
            <FormField
              label="Maximum Login Attempts"
              type="number"
              value={formData.max_login_attempts?.toString()}
              onChange={(v) => setFormData({
                ...formData,
                max_login_attempts: parseInt(v)
              })}
            />
            <FormField
              label="Lockout Duration (Minutes)"
              type="number"
              value={formData.login_lockout_duration_minutes?.toString()}
              onChange={(v) => setFormData({
                ...formData,
                login_lockout_duration_minutes: parseInt(v)
              })}
            />
            <Checkbox
              label="Require Two-Factor Authentication"
              checked={formData.enable_two_factor_auth ?? false}
              onChange={(checked) => setFormData({
                ...formData,
                enable_two_factor_auth: checked
              })}
            />
            <Checkbox
              label="Enable IP Whitelisting"
              checked={formData.enable_ip_whitelisting ?? false}
              onChange={(checked) => setFormData({
                ...formData,
                enable_ip_whitelisting: checked
              })}
            />
          </div>
        </div>

        {/* Session Management */}
        <div className="border-b pb-8">
          <h3 className="text-lg font-semibold mb-4">Session Management</h3>
          <div className="space-y-4">
            <Checkbox
              label="Enable Session Timeout"
              checked={formData.enable_session_timeout ?? false}
              onChange={(checked) => setFormData({
                ...formData,
                enable_session_timeout: checked
              })}
            />
            <FormField
              label="Session Timeout (Minutes)"
              type="number"
              value={formData.session_timeout_minutes?.toString()}
              onChange={(v) => setFormData({
                ...formData,
                session_timeout_minutes: parseInt(v)
              })}
              disabled={!formData.enable_session_timeout}
            />
            <Checkbox
              label="Enable Device Fingerprinting"
              checked={formData.enable_device_fingerprinting ?? false}
              onChange={(checked) => setFormData({
                ...formData,
                enable_device_fingerprinting: checked
              })}
            />
          </div>
        </div>

        {/* Data Protection */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Data Protection</h3>
          <Checkbox
            label="Enable Data Encryption"
            checked={formData.data_encryption_enabled ?? false}
            onChange={(checked) => setFormData({
              ...formData,
              data_encryption_enabled: checked
            })}
          />
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={mutation.isPending}
        className="mt-8"
      >
        Save Security Settings
      </Button>
    </Form>
  );
};
```

### IPWhitelistManager.tsx
```typescript
interface IPWhitelistManagerProps {
  organizationId: string;
}

export const IPWhitelistManager: React.FC<IPWhitelistManagerProps> = ({
  organizationId
}) => {
  const [ipAddress, setIpAddress] = useState('');
  const [description, setDescription] = useState('');
  const { data: whitelist } = useIPWhitelist(organizationId);
  const addMutation = useAddIPToWhitelist();
  const removeMutation = useRemoveIPFromWhitelist();

  const handleAddIP = async () => {
    if (!ipAddress) {
      alert('Please enter an IP address');
      return;
    }
    await addMutation.mutateAsync({
      organization_id: organizationId,
      ip_address: ipAddress,
      description
    });
    setIpAddress('');
    setDescription('');
  };

  const handleRemoveIP = async (id: string) => {
    if (confirm('Remove this IP from whitelist?')) {
      await removeMutation.mutateAsync(id);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add IP Address to Whitelist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            label="IP Address"
            value={ipAddress}
            onChange={setIpAddress}
            placeholder="e.g., 192.168.1.1 or 10.0.0.0/24"
          />
          <FormField
            label="Description"
            value={description}
            onChange={setDescription}
            placeholder="e.g., Office Network, VPN"
          />
          <Button
            onClick={handleAddIP}
            disabled={addMutation.isPending || !ipAddress}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add IP
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Whitelisted IPs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {whitelist?.map(entry => (
              <div key={entry.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-semibold">{entry.ip_address}</p>
                  {entry.description && (
                    <p className="text-sm text-gray-600">{entry.description}</p>
                  )}
                  {entry.last_used && (
                    <p className="text-xs text-gray-500">
                      Last used: {formatDate(entry.last_used)}
                    </p>
                  )}
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemoveIP(entry.id)}
                  disabled={removeMutation.isPending}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
```

### SessionManager.tsx
```typescript
interface SessionManagerProps {
  userId?: string;
}

export const SessionManager: React.FC<SessionManagerProps> = ({ userId }) => {
  const currentUserId = useAuth().user?.id;
  const targetUserId = userId || currentUserId;
  const { data: sessions } = useUserSessions(targetUserId);
  const revokeMutation = useRevokeSession();

  const handleRevokeSession = async (sessionId: string) => {
    if (confirm('Revoke this session?')) {
      await revokeMutation.mutateAsync(sessionId);
    }
  };

  const handleRevokeAllOthers = async () => {
    if (confirm('Revoke all other sessions?')) {
      const otherSessions = sessions?.filter(s => s.session_status === 'ACTIVE');
      for (const session of otherSessions || []) {
        await revokeMutation.mutateAsync(session.id);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Active Sessions</h3>
        <Button
          variant="destructive"
          onClick={handleRevokeAllOthers}
          size="sm"
        >
          Revoke All Others
        </Button>
      </div>

      <div className="space-y-3">
        {sessions?.map(session => (
          <Card key={session.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={getDeviceTypeVariant(session.device_type)}>
                      {session.device_type || 'Unknown'}
                    </Badge>
                    {session.browser_name && (
                      <span className="text-sm text-gray-600">{session.browser_name}</span>
                    )}
                  </div>
                  <p className="text-sm">
                    <strong>IP:</strong> {session.ip_address}
                  </p>
                  <p className="text-sm">
                    <strong>Logged in:</strong> {formatDateTime(session.login_timestamp)}
                  </p>
                  <p className="text-sm">
                    <strong>Last activity:</strong> {formatDateTime(session.last_activity)}
                  </p>
                  {session.location && (
                    <p className="text-sm">
                      <strong>Location:</strong> {session.location}
                    </p>
                  )}
                </div>
                <Button
                  variant="destructive"
                  onClick={() => handleRevokeSession(session.id)}
                  disabled={revokeMutation.isPending}
                  size="sm"
                >
                  Revoke
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
```

### TwoFactorSetup.tsx
```typescript
interface TwoFactorSetupProps {
  userId: string;
  onSuccess?: () => void;
}

export const TwoFactorSetup: React.FC<TwoFactorSetupProps> = ({
  userId,
  onSuccess
}) => {
  const [method, setMethod] = useState<'TOTP' | 'SMS' | 'EMAIL'>('TOTP');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [step, setStep] = useState<'method-select' | 'setup' | 'verify' | 'backup'>('method-select');

  const generateMutation = useGenerate2FASecret();
  const verifyMutation = useVerify2FA();

  const handleGenerateTOTP = async () => {
    const result = await generateMutation.mutateAsync({
      user_id: userId,
      method: 'TOTP'
    });
    setQrCode(result.qrCode);
    setBackupCodes(result.backupCodes);
    setStep('verify');
  };

  const handleVerify = async () => {
    await verifyMutation.mutateAsync({
      user_id: userId,
      method,
      code: verificationCode
    });
    setStep('backup');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Set Up Two-Factor Authentication</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {step === 'method-select' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Choose your preferred 2FA method:</p>
            <div className="space-y-2">
              <Button
                variant={method === 'TOTP' ? 'default' : 'outline'}
                onClick={() => setMethod('TOTP')}
                className="w-full justify-start"
              >
                <Smartphone className="w-4 h-4 mr-2" />
                Authenticator App (TOTP)
              </Button>
              <Button
                variant={method === 'SMS' ? 'default' : 'outline'}
                onClick={() => setMethod('SMS')}
                className="w-full justify-start"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                SMS Code
              </Button>
              <Button
                variant={method === 'EMAIL' ? 'default' : 'outline'}
                onClick={() => setMethod('EMAIL')}
                className="w-full justify-start"
              >
                <Mail className="w-4 h-4 mr-2" />
                Email Code
              </Button>
            </div>
            <Button
              onClick={handleGenerateTOTP}
              disabled={generateMutation.isPending}
              className="w-full"
            >
              Next
            </Button>
          </div>
        )}

        {step === 'setup' && (
          <div className="space-y-4">
            {qrCode && (
              <div>
                <p className="text-sm font-semibold mb-2">Scan with your authenticator app:</p>
                <img src={qrCode} alt="QR Code" className="w-48 h-48 mx-auto" />
              </div>
            )}
            {method === 'SMS' && (
              <FormField
                label="Phone Number"
                value={phoneNumber}
                onChange={setPhoneNumber}
                placeholder="+1234567890"
              />
            )}
            <Button
              onClick={() => setStep('verify')}
              className="w-full"
            >
              Next
            </Button>
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Enter the code from your {method === 'TOTP' ? 'authenticator app' : 'phone'}:</p>
            <FormField
              label="Verification Code"
              value={verificationCode}
              onChange={setVerificationCode}
              placeholder="000000"
              maxLength="6"
            />
            <Button
              onClick={handleVerify}
              disabled={verifyMutation.isPending}
              className="w-full"
            >
              Verify
            </Button>
          </div>
        )}

        {step === 'backup' && (
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Save your backup codes in a safe place. You'll need them if you lose access to your authenticator.
              </AlertDescription>
            </Alert>
            <div className="bg-gray-50 p-4 rounded font-mono text-sm space-y-1">
              {backupCodes.map((code, i) => (
                <div key={i}>{code}</div>
              ))}
            </div>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(backupCodes.join('\n'));
                alert('Codes copied to clipboard');
              }}
              variant="outline"
              className="w-full"
            >
              Copy Codes
            </Button>
            <Button
              onClick={onSuccess}
              className="w-full"
            >
              Done
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
```

---

## Service Layer (security.service.ts)

```typescript
import { supabase } from '@/config/supabase';

export class SecurityService {
  async getSecuritySettings(orgId: string) {
    const { data, error } = await supabase
      .from('security_settings')
      .select('*')
      .eq('organization_id', orgId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async updateSecuritySettings(orgId: string, settings: Partial<SecuritySettings>) {
    const { data, error } = await supabase
      .from('security_settings')
      .upsert({
        organization_id: orgId,
        ...settings,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async checkIPWhitelisting(orgId: string, ipAddress: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('ip_whitelist')
      .select('id')
      .eq('organization_id', orgId)
      .eq('is_active', true)
      .or(`ip_address.eq.${ipAddress}`);

    if (error) throw error;
    return data?.length > 0 ?? false;
  }

  async recordLoginAttempt(userId: string, ipAddress: string, success: boolean) {
    if (!success) {
      const { data, error } = await supabase
        .from('failed_login_attempts')
        .insert({
          user_id: userId,
          ip_address: ipAddress,
          user_agent: navigator.userAgent
        });

      if (error) throw error;

      // Check if should lock account
      const { data: attempts, error: countError } = await supabase
        .from('failed_login_attempts')
        .select('id')
        .eq('user_id', userId)
        .gte('attempt_timestamp', new Date(Date.now() - 15 * 60 * 1000).toISOString());

      if (countError) throw countError;

      if (attempts && attempts.length >= 5) {
        await this.lockAccount(userId, 'Too many failed login attempts');
      }
    }
  }

  async lockAccount(userId: string, reason: string) {
    const lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const { data, error } = await supabase
      .from('account_lockout')
      .upsert({
        user_id: userId,
        locked_reason: reason,
        locked_until: lockedUntil.toISOString()
      });

    if (error) throw error;
    return data;
  }

  async unlockAccount(userId: string, unlockedBy: string) {
    const { data, error } = await supabase
      .from('account_lockout')
      .update({
        unlocked_at: new Date().toISOString(),
        unlocked_by: unlockedBy
      })
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  }

  async isAccountLocked(userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('account_lockout')
      .select('locked_until')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return false;

    return new Date(data.locked_until) > new Date();
  }

  async createSession(userId: string, deviceFingerprint?: string, location?: string) {
    const expiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const { data, error } = await supabase
      .from('user_sessions')
      .insert({
        user_id: userId,
        session_token: generateSecureToken(),
        device_fingerprint: deviceFingerprint,
        ip_address: await this.getUserIP(),
        user_agent: navigator.userAgent,
        location,
        device_type: this.getDeviceType(),
        browser_name: this.getBrowserName(),
        expiry_timestamp: expiryDate.toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getUserSessions(userId: string) {
    const { data, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('session_status', 'ACTIVE')
      .order('login_timestamp', { ascending: false });

    if (error) throw error;
    return data;
  }

  async revokeSession(sessionId: string) {
    const { data, error } = await supabase
      .from('user_sessions')
      .update({
        session_status: 'REVOKED',
        logout_timestamp: new Date().toISOString()
      })
      .eq('id', sessionId);

    if (error) throw error;
    return data;
  }

  async recordSecurityAlert(orgId: string, alert: CreateSecurityAlertRequest) {
    const { data, error } = await supabase
      .from('security_alerts')
      .insert({
        organization_id: orgId,
        ...alert,
        detected_at: new Date().toISOString()
      });

    if (error) throw error;
    return data;
  }

  async getSecurityAlerts(orgId: string, severity?: string) {
    let query = supabase
      .from('security_alerts')
      .select('*')
      .eq('organization_id', orgId);

    if (severity) {
      query = query.eq('severity', severity);
    }

    const { data, error } = await query.order('detected_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async generate2FASecret(userId: string, method: string) {
    if (method === 'TOTP') {
      const secret = this.generateTOTPSecret();
      const qrCode = await this.generateQRCode(secret);

      return {
        secret,
        qrCode,
        backupCodes: this.generateBackupCodes()
      };
    }
  }

  private generateTOTPSecret(): string {
    // Generate random base32 string for TOTP
    return '';
  }

  private async generateQRCode(secret: string): Promise<string> {
    // Generate QR code for secret
    return '';
  }

  private generateBackupCodes(): string[] {
    return Array.from({ length: 10 }, () =>
      Math.random().toString(36).substring(2, 10).toUpperCase()
    );
  }

  private async getUserIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  }

  private getDeviceType(): string {
    const ua = navigator.userAgent;
    if (/mobile/i.test(ua)) return 'mobile';
    if (/tablet/i.test(ua)) return 'tablet';
    return 'desktop';
  }

  private getBrowserName(): string {
    const ua = navigator.userAgent;
    if (/Chrome/.test(ua) && !/Chromium/.test(ua)) return 'Chrome';
    if (/Safari/.test(ua)) return 'Safari';
    if (/Firefox/.test(ua)) return 'Firefox';
    if (/Edge/.test(ua)) return 'Edge';
    return 'Unknown';
  }
}

export const securityService = new SecurityService();
```

---

## REST API Endpoints

```
GET    /rest/v1/security_settings?organization_id=eq.{orgId}
PATCH  /rest/v1/security_settings?organization_id=eq.{orgId}

GET    /rest/v1/ip_whitelist?organization_id=eq.{orgId}
POST   /rest/v1/ip_whitelist
DELETE /rest/v1/ip_whitelist?id=eq.{id}

GET    /rest/v1/user_sessions?user_id=eq.{userId}
PATCH  /rest/v1/user_sessions?id=eq.{id}

GET    /rest/v1/security_alerts?organization_id=eq.{orgId}
PATCH  /rest/v1/security_alerts?id=eq.{id}

GET    /rest/v1/failed_login_attempts?organization_id=eq.{orgId}
```

---

## Implementation Workflow

### Phase 1: Core Security Setup (Week 1)
- Implement security settings management
- Set up password policy validation
- Create account lockout mechanism
- Implement failed login tracking

### Phase 2: Session Management (Week 2)
- Build session creation and management
- Implement session timeout
- Create device fingerprinting
- Build session revocation

### Phase 3: Network Security (Week 3)
- Implement IP whitelisting
- Create IP validation in login
- Build IP management interface
- Implement IP-based alerts

### Phase 4: Two-Factor Authentication (Week 4)
- Implement TOTP setup
- Add SMS/Email 2FA options
- Create backup code generation
- Build 2FA verification

### Phase 5: Monitoring & Alerts (Week 5)
- Create security alert system
- Build alert dashboard
- Implement alert acknowledgment
- Add security analytics

---

## Testing Strategy

### Unit Tests
- Password policy validation
- IP matching logic
- Session timeout calculation
- TOTP verification

### Integration Tests
- Full login with 2FA
- Account lockout after failed attempts
- IP whitelist enforcement
- Session management and revocation

### E2E Tests
- User sets up 2FA
- User logs in from new IP (blocked/allowed)
- Admin reviews security alerts
- Session timeout works correctly

---

## Security Best Practices

- Passwords never logged or displayed
- Session tokens are cryptographically secure
- Encryption keys rotated regularly
- Audit trails on all security events
- Rate limiting on login endpoints
- CORS headers configured properly
- CSP headers to prevent XSS
- SQL injection prevention via parameterized queries

---

## Performance

- Cache security settings (5-minute TTL)
- Index on user_id, organization_id for quick lookups
- Clean up old sessions weekly
- Archive old alerts after 90 days
- Batch processing for failed login alerts

---

## Future Enhancements

1. **Biometric Auth**: Fingerprint/Face ID support
2. **Risk Scoring**: ML-based login risk assessment
3. **Behavioral Analytics**: Unusual activity detection
4. **Hardware Tokens**: FIDO2 key support
5. **SSO Integration**: SAML/OAuth provider integration
6. **VPN Requirement**: Force VPN for sensitive operations
7. **Advanced Encryption**: File-level encryption
8. **Security Dashboard**: Comprehensive security metrics
9. **Compliance Dashboards**: GDPR/HIPAA compliance tracking
10. **Incident Response**: Automated incident workflow


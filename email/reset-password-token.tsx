// src/emails/ResetPasswordEmail.tsx
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Heading,
  Text,
  Button,
} from '@react-email/components';

interface Props {
  resetUrl: string;
}

export default function ResetPasswordEmail({ resetUrl }: Props) {
  return (
    <Html>
      <Head />
      <Preview>Reset your password</Preview>
      <Body style={{ fontFamily: 'system-ui, sans-serif' }}>
        <Container
          style={{
            padding: '20px',
            borderRadius: '8px',
            backgroundColor: '#f9f9f9',
          }}
        >
          <Heading style={{ fontSize: '24px', marginBottom: '16px' }}>
            Password Reset Requested
          </Heading>
          <Text style={{ marginBottom: '16px' }}>
            Click the button below to set a new password for your account:
          </Text>
          <Button
            style={{
              backgroundColor: '#2563eb',
              color: 'white',
              borderRadius: '4px',
              textDecoration: 'none',
            }}
            href={resetUrl}
          >
            Reset Password
          </Button>
          <Text style={{ marginTop: '16px', fontSize: '12px', color: '#666' }}>
            If you didn’t request this, just ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

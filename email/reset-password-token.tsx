import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Heading,
  Text,
  Link,
} from '@react-email/components';

interface Props {
  resetUrl: string;
}

export default function ResetPasswordEmail({ resetUrl }: Props) {
  return (
    <Html>
      <Head />
      <Preview>Reset your password</Preview>
      <Body className='font-sans bg-white'>
        <Container className='p-5 rounded-lg bg-gray-100'>
          <Heading className='text-2xl mb-4 text-gray-900'>
            Password Reset Requested
          </Heading>
          <Text className='mb-4 text-gray-700'>
            Click the button below to set a new password for your account:
          </Text>
          <Link
            className='inline-block bg-blue-600 text-white rounded px-5 py-2 no-underline text-center'
            href={resetUrl}
          >
            Reset Password
          </Link>
          <Text className='mt-4 text-xs text-gray-500'>
            If you didn’t request this, just ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

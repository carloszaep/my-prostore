import { SENDER_EMAIL } from '@/lib/constants';
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Hr,
} from '@react-email/components';
import * as React from 'react';

interface PasswordChangedEmailProps {
  userName?: string;
}

export const PasswordChangedEmail = ({
  userName = 'User',
}: PasswordChangedEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your password has been changed</Preview>
      <Body className='bg-gray-100 font-sans p-5'>
        <Container className='max-w-xl mx-auto bg-white rounded-lg p-6'>
          <Section>
            <Text className='text-xl font-bold mb-4'>Hi {userName},</Text>
            <Text className='text-sm text-gray-800 mb-4'>
              We&apos;re letting you know that your account password was
              successfully changed. If you made this change, no further action
              is needed.
            </Text>
            <Text className='text-sm text-gray-800 mb-4'>
              If you did not change your password, please reset it immediately
              or contact our support team at{' '}
              <a
                href={`mailto:${SENDER_EMAIL}`}
                className='text-blue-600 underline'
              >
                {SENDER_EMAIL}
              </a>
              .
            </Text>
            <Text className='text-sm text-gray-800 mb-2'>Thank you,</Text>
            <Text className='text-sm text-gray-800'>The Support Team</Text>
          </Section>
          <Hr className='border-t border-gray-200 my-6' />
          <Text className='text-xs text-gray-500 text-center'>
            If you need help, contact us at {SENDER_EMAIL}
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default PasswordChangedEmail;

import * as React from 'react';
import { Html, Head, Body, Container, Section, Text, Heading, Button, Tailwind, Hr } from '@react-email/components';

export function SpecialistApprovedEmail({ name, loginUrl }: { name: string; loginUrl: string }) {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-slate-50 my-auto mx-auto font-sans">
          <Container className="border border-solid border-slate-200 rounded my-[40px] mx-auto p-[20px] w-[465px] bg-white">
            <Heading className="text-indigo-600 text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Welcome to Elira Health
            </Heading>
            <Text className="text-slate-700 text-[14px] leading-[24px]">
              Hello Dr. {name},
            </Text>
            <Text className="text-slate-700 text-[14px] leading-[24px]">
              Congratulations! Your profile has been approved by our administration team. You can now log in to the Specialist Dashboard to set your availability and accept appointments.
            </Text>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-purple-600 rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                href={loginUrl}
              >
                Log In to Dashboard
              </Button>
            </Section>
            <Hr className="border border-solid border-slate-200 my-[26px] mx-0 w-full" />
            <Text className="text-slate-500 text-[12px] leading-[24px]">
              If you have any questions, please contact our support team.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default SpecialistApprovedEmail;
